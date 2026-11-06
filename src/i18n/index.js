// vue-i18n setup: English ships in the first download; the other languages load the first time they are used.
import { createI18n } from 'vue-i18n'
import en from './locales/en.json'

export const LOCALES = { en: 'English', zh: '中文', ms: 'Bahasa Melayu', ta: 'தமிழ்' }
const STORAGE_KEY = 'sas.locale'

function savedLocale() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved in LOCALES) return saved
  } catch {
    // Storage blocked (private mode): fall back to English.
  }
  return 'en'
}

const i18n = createI18n({
  legacy: false,
  locale: savedLocale(),
  fallbackLocale: 'en',
  messages: { en },
})

const LOADERS = {
  zh: () => import('./locales/zh.json'),
  ms: () => import('./locales/ms.json'),
  ta: () => import('./locales/ta.json'),
}
const loading = {}
const hasMessages = (code) => i18n.global.availableLocales.includes(code)

function loadMessages(code) {
  if (hasMessages(code) || !LOADERS[code]) return Promise.resolve()
  if (!loading[code])
    loading[code] = LOADERS[code]()
      .then((module) => i18n.global.setLocaleMessage(code, module.default))
      .catch(() => delete loading[code]) // try again next time
  return loading[code]
}
export const localeReady = loadMessages(i18n.global.locale.value)

// Switches the app (and the saved choice) to another language once its messages are ready.
export async function setLocale(code) {
  await loadMessages(code)
  if (!hasMessages(code)) return // could not be fetched: stay in the language that is showing
  i18n.global.locale.value = code
  document.documentElement.lang = code === 'zh' ? 'zh-Hans' : code // screen readers pick their voice from this
  try {
    localStorage.setItem(STORAGE_KEY, code)
  } catch {
    // Not critical; the choice just won't persist.
  }
}

document.documentElement.lang = i18n.global.locale.value === 'zh' ? 'zh-Hans' : i18n.global.locale.value

export default i18n
