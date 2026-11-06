// The demo caregiver and the resident whose updates they are viewing. The selection is kept in the ui store, so it
// stays the same while moving between caregiver pages. Only residents linked to the caregiver are ever offered.
import { computed } from 'vue'
import { useResidentsStore } from '../stores/residents'
import { useUiStore } from '../stores/ui'

export function useCaregiver() {
  const ui = useUiStore()
  const residents = useResidentsStore()
  const caregiver = computed(() => ui.currentCaregiver)
  const linked = computed(() => residents.linkedTo(ui.currentCaregiverId))
  const selected = computed(() => linked.value.find((r) => r.id === ui.selectedResidentId) ?? linked.value[0] ?? null)
  const select = (id) => linked.value.some((r) => r.id === id) && ui.setSelectedResident(id)
  const relationship = (resident) => caregiver.value.relationships[resident.id] // 'mother' | 'father' | 'aunt'
  return { caregiver, linked, selected, select, relationship }
}
