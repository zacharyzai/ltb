import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { TEXT_SIZES, THEMES, applyTextSize, applyTheme, readPref, savePref, systemDarkQuery } from '../theme'

// UI state: demo role (follows the route), theme and text size (saved on this device).
export const useUiStore = defineStore('ui', () => {
  const role = ref('caregiver') // 'caregiver' | 'staff'; set by the router guard
  const isStaff = computed(() => role.value === 'staff')
  const setRole = (next) => (role.value = next)

  const themeChoice = ref(readPref('theme')) // 'light' | 'dark' | 'system'
  const textSize = ref(readPref('textSize')) // 'standard' | 'large' | 'xlarge'
  const systemDark = ref(Boolean(systemDarkQuery?.matches))
  systemDarkQuery?.addEventListener?.('change', (e) => (systemDark.value = e.matches))
  const shownTheme = computed(() => (themeChoice.value === 'system' ? (systemDark.value ? 'dark' : 'light') : themeChoice.value))

  watch(shownTheme, applyTheme, { immediate: true })
  watch(textSize, applyTextSize, { immediate: true })

  function setTheme(choice) {
    if (!THEMES.includes(choice)) return
    themeChoice.value = choice
    savePref('theme', choice)
  }
  function setTextSize(size) {
    if (!TEXT_SIZES.includes(size)) return
    textSize.value = size
    savePref('textSize', size)
  }

  return { role, isStaff, setRole, themeChoice, shownTheme, setTheme, textSize, setTextSize }
})
