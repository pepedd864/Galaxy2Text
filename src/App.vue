<script lang='ts' setup>
import { nextTick, ref } from 'vue'
import Sketch from '@/sketch'
import { useText3dStore } from '@/store'
import { DndProvider } from 'vue3-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import TextItem from '@/components/TextItem/TextItem.vue'
import { getStrLength } from '@/utils/utils'

const createSketch = () => {
  const sketch = new Sketch()
  sketch.create()
}

const showSetting = ref(false)
const toggleSetting = () => {
  showSetting.value = !showSetting.value
  if (showSetting.value) {
    setFcInput()
  }
}

const toggleLoading = () => {
  document.dispatchEvent(new CustomEvent('loading'))
  setTimeout(() => {
    document.dispatchEvent(new CustomEvent('loaded'))
  }, 4000)
}


nextTick(() => {
  createSketch()
})

let fcInput = null
let inputElement: HTMLInputElement | null = null
let listElement: HTMLDivElement | null = null
const setFcInput = () => {
  setTimeout(() => {
    fcInput = document.querySelector('.fc-input')
    const button = document.createElement('button')
    button.style.position = 'absolute'
    button.style.right = '0'
    button.style.height = '100%'
    button.style.background = '#00000050'
    button.style.color = '#fff'
    button.style.fontSize = '30px'
    button.style.zIndex = '999'
    button.style.cursor = 'pointer'
    button.style.border = '1px var(--border-color) solid'
    button.style.outline = 'none'
    button.innerText = '+'
    button.addEventListener('click', addText)
    fcInput?.shadowRoot?.querySelector('fieldset')?.appendChild(button)
    inputElement = fcInput?.shadowRoot?.querySelector('input') as HTMLInputElement
    inputElement?.focus()
    inputElement.value = ''
    inputElement.maxLength = 15
    inputElement.style.fontSize = '20px'
    inputElement.style.textShadow = '0 0 10px #fff'
    listElement = document.querySelector('.list')
    listElement?.scrollTo(0, 0)
    inputElement.addEventListener('blur', () => {
      noticeText.value = ''
    })

  }, 200)
}
const text3d = ref('')
const noticeText = ref('')
const text3dStore = useText3dStore()
const addText = () => {
  // 使用正则判断text3d.value是否为空，是否小于3大于8，并使用noticeText.value提示用户
  // 计算权重 中文1 英文 0.5
  const [chinese, english] = getStrLength(text3d.value)
  const length = chinese + english * 0.5
  const reg = /^\s*$/g
  if (reg.test(text3d.value)) {
    noticeText.value = '输入不能为空'
    return
  }
  if (length < 2 || length > 8) {
    noticeText.value = '输入长度不符合要求'
    return
  }
  noticeText.value = ''
  useText3dStore().addText(text3d.value)
  setTimeout(() => {
    listElement?.scrollTo(0, listElement.scrollHeight)
  }, 100)
  text3d.value = ''
  // @ts-ignore
  inputElement.value = ''
  inputElement?.focus()
}
const play = () => {
  if (text3dStore.textList.length === 0) {
    noticeText.value = '请添加文字'
    return
  }
  if (text3dStore.playState) {
    return
  }
  toggleSetting()
  setTimeout(() => {
    useText3dStore().beginPlay()
  }, 500)
}
</script>

<template>
  <DndProvider :backend='HTML5Backend'>
    <div class='container'>
      <fc-arrow-btn
        class='setting-btn'
        style='--color: white'
        @click='toggleSetting'
      >配置
      </fc-arrow-btn>
      <!--<fc-arrow-btn class='loading-btn' @click='toggleLoading'>-->
      <!--  Loading-->
      <!--</fc-arrow-btn>-->
      <transition name='fade'>
        <div v-if='showSetting' class='setting'>
          <div class='content'>
            <div class='title'>添加想要显示的文字</div>
            <fc-typing-input v-model='text3d' class='fc-input' placeholder='输入文字' style='width: 100%;' white
                             @keydown.enter='addText' @keydown.esc='toggleSetting'
                             @keydown.ctrl.enter='play'>
            </fc-typing-input>
            <transition name='fade'>
              <div v-if='noticeText' class='notice'>{{ noticeText }}</div>
            </transition>
            <transition-group class='list' name='list' tag='div'>
              <text-item v-for='(item,index) in text3dStore.textList' :id='item.id' :key='item.id' :index='index'
                         :move-card='text3dStore.moveTextItem' :text='item.text' />
            </transition-group>
            <fc-underline-btn class='confirm-btn' style='--color: #fff' @click='play'>确定</fc-underline-btn>
            <fc-arrow-btn
              class='close-btn'
              style='--color: white'
              @click='toggleSetting'
            >关闭
            </fc-arrow-btn>
          </div>
        </div>
      </transition>
    </div>
    <div id='sketch' @keydown.esc='toggleSetting'></div>
  </DndProvider>
</template>

<style lang='scss' scoped>
.container {
  background: #000;

  .setting-btn {
    position: absolute;
    top: 30px;
    right: 20px;
    z-index: 100;
  }

  .loading-btn {
    position: absolute;
    top: 100px;
    right: 20px;
    z-index: 100;
  }

  .setting {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 100;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    backdrop-filter: blur(20px);

    .content {
      padding: 40px 0 10px 0;
      width: calc(100vh / 3);
      height: calc(100vh / 2);

      .title {
        font-size: 30px;
        color: #fff;
        margin-bottom: 20px;
        width: 100%;
        text-align: center;
        text-shadow: 0 0 10px #fff;
      }

      .notice {
        position: absolute;
        font-size: 14px;
        color: red;
        margin: 5px 0 5px 10px;
      }

      .list {
        position: relative;
        margin-top: 20px;
        padding: 0 5px;
        width: 100%;
        height: 50vh;
        opacity: 1;
        overflow-y: auto;
        overflow-x: hidden;
        box-sizing: border-box;
        scroll-behavior: smooth;

        .list-move, /* 对移动中的元素应用的过渡 */
        .list-enter-active,
        .list-leave-active {
          opacity: 1;
          transition: all 0.5s ease;
        }

        .list-enter-from,
        .list-leave-to {
          opacity: 0;
          transform: translateX(30px);
        }

        /* 确保将离开的元素从布局流中删除
          以便能够正确地计算移动的动画。 */
        .list-leave-active {
          position: absolute;
        }
      }

      .confirm-btn {
        position: absolute;
        bottom: 30px;
        left: 50%;
        transform: translateX(-50%);
      }
    }


    .close-btn {
      position: absolute;
      bottom: 30px;
      right: 20px;
    }
  }
}

</style>
