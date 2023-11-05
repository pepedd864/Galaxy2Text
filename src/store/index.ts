import { createPinia, defineStore } from 'pinia'
import { ref } from 'vue'

const pinia = createPinia()

export const useText3dStore = defineStore(
  'text3dStore',
  () => {
    let playState = ref<boolean>(false)
    const tid = ref<number>(0)
    const textList = ref<{ text: string; id: number }[]>([])
    const addText = (text: string) => {
      textList.value.push({ text, id: tid.value++ })
    }
    const removeText = (index: number) => {
      textList.value.splice(index, 1)
    }
    const moveTextItem = (dragIndex: number, hoverIndex: number) => {
      const item = textList.value[dragIndex]
      textList.value.splice(dragIndex, 1)
      textList.value.splice(hoverIndex, 0, item)
    }
    const beginPlay = () => {
      playState.value = true
    }
    const endPlay = () => {
      playState.value = false
      tid.value = 0
      textList.value = []
    }
    return {
      playState,
      textList,
      addText,
      removeText,
      moveTextItem,
      beginPlay,
      endPlay,
    }
  },
)

export default pinia
