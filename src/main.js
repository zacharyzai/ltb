import { createApp } from 'vue'
import { createPinia } from 'pinia'
import 'bootstrap/dist/css/bootstrap.min.css'
import './styles/main.css'
import App from './App.vue'
import router from './router'
import i18n, { localeReady } from './i18n'

// Pinia first: router guards use the stores on the very first navigation.
const app = createApp(App).use(createPinia()).use(router).use(i18n)
// Mount once the first route and the saved language are ready, so nothing flashes in English first.
Promise.all([router.isReady(), localeReady]).then(() => app.mount('#app'))
