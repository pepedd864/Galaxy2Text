<!--@ts-nocheck-->
<script lang='ts' setup>
import { useDrag, useDrop } from 'vue3-dnd'
import { computed, ref, unref } from 'vue'
import type { Identifier, XYCoord } from 'dnd-core'
import { toRefs } from '@vueuse/core'
import { useText3dStore } from '@/store'

const props = defineProps<{
  id: any
  text: string
  index: number
  moveCard: (dragIndex: number, hoverIndex: number) => void
}>()

const ItemTypes = {
  CARD: 'card',
}

interface DragItem {
  index: number
  id: string
  type: string
}

const card = ref<HTMLDivElement>()
const [dropCollect, drop] = useDrop<DragItem, void, { handlerId: Identifier | null }>(
  {
    accept: ItemTypes.CARD,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      }
    },
    hover(item: DragItem, monitor) {
      if (!card.value) {
        return
      }
      const dragIndex = item.index
      const hoverIndex = props.index
      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return
      }

      // Determine rectangle on screen
      const hoverBoundingRect = card.value?.getBoundingClientRect()

      // Get vertical middle
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2

      // Determine mouse position
      const clientOffset = monitor.getClientOffset()

      // Get pixels to the top
      const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top

      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return
      }

      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return
      }

      // Time to actually perform the action
      props.moveCard(dragIndex, hoverIndex)

      item.index = hoverIndex
    },
  },
)

const [collect, drag] = useDrag({
  type: ItemTypes.CARD,
  item: () => {
    return { id: props.id, index: props.index }
  },
  collect: (monitor: any) => ({
    isDragging: monitor.isDragging(),
  }),
})

const { handlerId } = toRefs(dropCollect)
const { isDragging } = toRefs(collect)
const opacity = computed(() => (unref(isDragging) ? 0 : 1))

const setRef = (el: HTMLDivElement): undefined => {
  card.value = drag(drop(el)) as HTMLDivElement
}
const { removeText } = useText3dStore()
</script>

<template>
  <div
    :ref='setRef'
    :data-handler-id='handlerId'
    :style='{ opacity }'
    class='card'>
    {{ text }}
    <!--添加一个小×-->
    <div class='close-btn' @click='removeText(index)'>×</div>
  </div>
</template>

<style lang='scss' scoped>
.card {
  position: relative;
  color: #fff;
  font-size: 18px;
  padding: 5px 10px;
  margin-top: 15px;
  margin-bottom: 10px;
  border-radius: 5px;
  width: calc(100% - 5px * 2);
  border: 1px #dddddd80 solid;
  //background: #ffffff80;
  text-shadow: 0 0 10px #fff;
  box-sizing: border-box;
  cursor: move;
  // 文字换行
  word-break: break-all;
  transition: all 0.3s ease-in-out;

  // 添加一个小圆点
  &:before {
    content: '';
    display: inline-block;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #ffffff80;
    margin-right: 10px;
  }

  &:active,
  &:hover {
    box-shadow: 0 0 15px rgba(255, 255, 255, 0.5);
  }

  .close-btn {
    position: absolute;
    top: 0;
    right: 0;
    width: 20px;
    height: 20px;
    text-align: center;
    line-height: 20px;
    cursor: pointer;
    font-size: 20px;
    color: #fff;
    border-radius: 50%;
    transition: all 0.3s ease-in-out;
  }
}
</style>
