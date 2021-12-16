import { createApp } from 'vue'
import Toast, { PluginOptions } from 'vue-toastification'
import App from './App.vue'
import './assets/tailwind.css'
import 'vue-toastification/dist/index.css'

createApp(App)
  .use(Toast, <PluginOptions>{
    maxToasts: 5,
    position: 'top-left'
  })
  .mount('#app')
