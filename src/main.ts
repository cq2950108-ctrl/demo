import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import zhCn from 'element-plus/es/locale/lang/zh-cn'

import App from './App.vue'
import router from './router'

// 忽略 ResizeObserver 警告
const originalResizeObserver = window.ResizeObserver
window.ResizeObserver = class extends originalResizeObserver {
  constructor(callback: ResizeObserverCallback) {
    const wrappedCallback: ResizeObserverCallback = (entries, observer) => {
      window.requestAnimationFrame(() => {
        callback(entries, observer)
      })
    }
    super(wrappedCallback)
  }
}

// 捕获并忽略 ResizeObserver 错误
const originalConsoleError = console.error
console.error = (...args: any[]) => {
  if (args[0] && typeof args[0] === 'string' && args[0].includes('ResizeObserver loop completed')) {
    return
  }
  originalConsoleError.apply(console, args)
}

const app = createApp(App)

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(createPinia())
app.use(router)
app.use(ElementPlus, {
  locale: zhCn,
})

app.mount('#app')