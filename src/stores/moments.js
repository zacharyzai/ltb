import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { MOMENT_CATEGORIES, buildMoments } from '../data/moments'
import { fail, ok } from '../utils/result'
import { isoDateOf, nowIso } from '../utils/time'
import { useResidentsStore } from './residents'

// Resident moments. Caregivers only ever see published moments that tag one of their linked residents.
export const useMomentsStore = defineStore('moments', () => {
  const moments = ref(buildMoments())
  const residents = useResidentsStore()

  const newestFirst = (a, b) => b.createdAt.localeCompare(a.createdAt)
  const published = computed(() => moments.value.filter((m) => m.status === 'published').sort(newestFirst))
  const drafts = computed(() => moments.value.filter((m) => m.status === 'draft').sort(newestFirst))

  // Published moments a caregiver may see (tagging at least one of their linked residents); no caregiver = all (staff).
  function visibleTo(caregiverId = null) {
    if (!caregiverId) return published.value
    const linked = residents.linkedTo(caregiverId).map((r) => r.id)
    return published.value.filter((m) => m.residentIds.some((id) => linked.includes(id)))
  }
  const latest = (limit = 5, caregiverId = null) => visibleTo(caregiverId).slice(0, limit)
  const forResident = (residentId, caregiverId = null) => visibleTo(caregiverId).filter((m) => m.residentIds.includes(residentId))
  // Moments created between two Singapore dates, inclusive (ISO strings).
  const inRange = (fromIso, toIso, caregiverId = null) =>
    visibleTo(caregiverId).filter((m) => {
      const day = isoDateOf(new Date(m.createdAt))
      return day >= fromIso && day <= toIso
    })

  // Shared by addMoment and publishMoment: a title, known residents, a category, and photo consent for photo moments.
  function validate({ title, category, residentIds, image }) {
    if (!String(title ?? '').trim()) return fail('EMPTY_TITLE')
    if (!MOMENT_CATEGORIES.includes(category)) return fail('BAD_CATEGORY')
    if (!residentIds?.length) return fail('NO_RESIDENTS')
    if (residentIds.some((id) => !residents.byId(id))) return fail('NOT_FOUND')
    if (image && residentIds.some((id) => !residents.byId(id).photoConsent)) return fail('NO_CONSENT')
    return null
  }

  // publish: false saves a draft instead.
  function addMoment({ title, caption = '', category, residentIds, image = null, authorId = null, publish = true }) {
    const problem = validate({ title, category, residentIds, image })
    if (problem) return problem
    const moment = {
      id: `mo-${Date.now().toString(36)}-${moments.value.length}`, seedKey: null, seeded: [],
      title: title.trim(), caption: String(caption ?? '').trim(), createdAt: nowIso(), category, residentIds: [...residentIds],
      image, status: publish ? 'published' : 'draft', authorId,
    }
    moments.value.push(moment)
    return ok(moment)
  }

  function publishMoment(id) {
    const moment = moments.value.find((m) => m.id === id)
    if (!moment) return fail('NOT_FOUND')
    if (moment.status !== 'draft') return fail('NOT_DRAFT')
    const problem = validate({ title: moment.title ?? 'seeded', category: moment.category, residentIds: moment.residentIds, image: moment.image })
    if (problem) return problem
    Object.assign(moment, { status: 'published', createdAt: nowIso() })
    return ok(moment)
  }

  return { moments, published, drafts, visibleTo, latest, forResident, inRange, addMoment, publishMoment }
})
