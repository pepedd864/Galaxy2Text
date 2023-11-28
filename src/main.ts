// @ts-nocheck
import { createApp } from 'vue'
import '@/styles/base.scss'
import App from '@/App.vue'
import { FcArrowBtn, FcTypingInput, FcUnderlineBtn } from 'fancy-components'
import { useLoading } from '@/utils/utils'
import pinia from '@/store/index.ts'

// 监听资源加载
document.addEventListener('loadstart', (e) => {
  useLoading(true)
})
document.addEventListener('loadend', (e) => {
  useLoading(false)
})

new FcTypingInput()
new FcArrowBtn()
new FcUnderlineBtn()

createApp(App).use(pinia).mount('#app')
