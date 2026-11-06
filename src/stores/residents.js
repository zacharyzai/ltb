import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { WELLBEING_STATUSES, buildResidents } from '../data/residents'
import { fail, ok } from '../utils/result'
import { isoDateOf, nowIso, todayISO } from '../utils/time'

export const MAX_NOTE_LENGTH = 300

// Residents and their general well-being status (colour + symbol + words in the UI; not a medical assessment).
export const useResidentsStore = defineStore('residents', () => {
  const residents = ref(buildResidents())

  const byId = (id) => residents.value.find((r) => r.id === id) ?? null
  const linkedTo = (caregiverId) => residents.value.filter((r) => r.caregiverIds.includes(caregiverId))
  const isLinked = (caregiverId, residentId) => Boolean(byId(residentId)?.caregiverIds.includes(caregiverId))

  const wasUpdatedToday = (r) => Boolean(r.updatedAt) && isoDateOf(new Date(r.updatedAt)) === todayISO()
  const updatedToday = computed(() => residents.value.filter(wasUpdatedToday))
  const notUpdatedToday = computed(() => residents.value.filter((r) => !wasUpdatedToday(r)))
  const needingAttention = computed(() => residents.value.filter((r) => r.status === 'contact'))

  function updateResidentStatus(id, status, note = '', staffId = null) {
    const resident = byId(id)
    if (!resident) return fail('NOT_FOUND')
    if (!WELLBEING_STATUSES.includes(status)) return fail('BAD_STATUS')
    const text = String(note ?? '').trim()
    if (text.length > MAX_NOTE_LENGTH) return fail('NOTE_TOO_LONG', { max: MAX_NOTE_LENGTH })
    Object.assign(resident, { status, note: text || null, noteSeedKey: null, updatedAt: nowIso(), updatedBy: staffId })
    return ok(resident)
  }

  return { residents, byId, linkedTo, isLinked, wasUpdatedToday, updatedToday, notUpdatedToday, needingAttention, updateResidentStatus }
})
