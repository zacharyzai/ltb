import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

// UI state. Phase 1 holds only the demo role; theme, text size and guide state arrive with the design system.
export const useUiStore = defineStore('ui', () => {
  const role = ref('caregiver') // 'caregiver' | 'staff'; follows the current route (router guard)
  const isStaff = computed(() => role.value === 'staff')
  const setRole = (next) => (role.value = next)
  return { role, isStaff, setRole }
})
