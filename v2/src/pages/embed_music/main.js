import { createApp } from 'vue'
import { initDarkMode } from '@/assets/js/darkMode.js'
import App from './App.vue'

import '@/assets/css/wux.css'
import '@/assets/css/common.css'

initDarkMode()
const app = createApp(App);
app.mount('#app');