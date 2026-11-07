import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { DEFAULT_CAREGIVER_ID, caregivers } from '../data/caregivers'
import { DEFAULT_STAFF_ID, staff } from '../data/staff'
import { TEXT_SIZES, THEMES, applyTextSize, applyTheme, readFlag, readPref, savePref, saveFlag, systemDarkQuery } from '../theme'

// UI state: demo role and identities, theme and text size (saved on this device), and app-wide toast messages.
export const useUiStore = defineStore('ui', () => {
  const role = ref('caregiver') // 'caregiver' | 'staff'; set by the router guard
  const isStaff = computed(() => role.value === 'staff')
  const setRole = (next) => (role.value = next)

  // Demo identities (no sign-in): which fictional caregiver and staff member the screens act as.
  const currentCaregiverId = ref(DEFAULT_CAREGIVER_ID)
  const currentStaffId = ref(DEFAULT_STAFF_ID)
  const currentCaregiver = computed(() => caregivers.find((c) => c.id === currentCaregiverId.value))
  const currentStaff = computed(() => staff.find((s) => s.id === currentStaffId.value))
  // The resident a caregiver is currently viewing (null = their first linked resident). Kept here so it survives page changes.
  const selectedResidentId = ref(null)
  const setSelectedResident = (id) => (selectedResidentId.value = id)
  function setCaregiver(id) {
    if (!caregivers.some((c) => c.id === id)) return
    currentCaregiverId.value = id
    selectedResidentId.value = null
  }

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

  // Beginner's guide: one 'done' | 'skipped' flag per role, kept on this device so it is offered once and can always be reopened.
  const guideSeen = ref({ caregiver: readFlag('sas.guide.caregiver'), staff: readFlag('sas.guide.staff') })
  const guideOpen = ref(false)
  const showGuideOffer = computed(() => !guideSeen.value[role.value])
  const openGuide = () => (guideOpen.value = true)
  function closeGuide(outcome = 'skipped') {
    guideOpen.value = false
    guideSeen.value[role.value] = outcome
    saveFlag(`sas.guide.${role.value}`, outcome)
  }

  // Short messages shown by <AppToast />. Pass text that is already translated. One message at a time.
  const toasts = ref([]) // { id, text, kind: 'info' | 'error' }
  let nextToastId = 1
  const dismissToast = (id) => (toasts.value = toasts.value.filter((t) => t.id !== id))
  function notify(text, { kind = 'info', ms = 3500 } = {}) {
    const id = nextToastId++
    toasts.value = [{ id, text, kind }]
    setTimeout(() => dismissToast(id), ms)
  }

  return {
    role, isStaff, setRole,
    currentCaregiverId, currentCaregiver, currentStaffId, currentStaff, setCaregiver, selectedResidentId, setSelectedResident,
    themeChoice, shownTheme, setTheme, textSize, setTextSize,
    guideSeen, guideOpen, showGuideOffer, openGuide, closeGuide,
    toasts, notify, dismissToast,
  }
})
