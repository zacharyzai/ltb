import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { EVENT_CATEGORIES, buildEvents, buildNews, buildVolunteers } from '../data/events'
import { setFields } from '../utils/content'
import { fail, ok } from '../utils/result'
import { isIsoDate, isTime, nowIso, todayISO } from '../utils/time'

const text = (v) => String(v ?? '').trim()
// Seeded text fields are null on the record (the words live in the locale files), so treat them as present when validating.
const effective = (e) => ({ ...e, ...Object.fromEntries((e.seeded ?? []).map((f) => [f, 'seeded'])) })

// Community events (published or draft), news announcements and volunteer opportunities.
// Drafts are never part of `published`, so they never reach the caregiver portal.
export const useEventsStore = defineStore('events', () => {
  const events = ref(buildEvents())
  const news = ref(buildNews())
  const volunteers = ref(buildVolunteers())

  const byDate = (a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime)
  const published = computed(() => events.value.filter((e) => e.status === 'published'))
  const upcoming = computed(() => published.value.filter((e) => e.date >= todayISO()).sort(byDate))
  const past = computed(() => published.value.filter((e) => e.date < todayISO()).sort((a, b) => -byDate(a, b)))
  const drafts = computed(() => events.value.filter((e) => e.status === 'draft').sort(byDate))
  const shareable = computed(() => published.value.filter((e) => e.public)) // only public events may be shared
  const newsAnnouncements = computed(() => [...news.value].sort((a, b) => b.date.localeCompare(a.date)))
  const byId = (id) => events.value.find((e) => e.id === id) ?? null

  // A draft needs only a title; publishing needs the full details.
  function validate(f, { complete }) {
    if (!text(f.title)) return fail('EMPTY_TITLE')
    if (!EVENT_CATEGORIES.includes(f.category)) return fail('BAD_CATEGORY')
    if (!complete) return null
    if (!isIsoDate(f.date)) return fail('BAD_DATE')
    if (!isTime(f.startTime) || !isTime(f.endTime) || f.startTime >= f.endTime) return fail('BAD_TIME')
    if (!text(f.location)) return fail('EMPTY_LOCATION')
    return null
  }
  const clean = (f) => ({
    title: text(f.title), description: text(f.description), location: text(f.location), category: f.category ?? 'community',
    date: f.date ?? '', startTime: f.startTime ?? '', endTime: f.endTime ?? '', public: f.public ?? true, image: f.image ?? null,
  })

  function save(f, status, complete) {
    const data = clean(f)
    const problem = validate(data, { complete })
    if (problem) return problem
    const event = { id: `ev-${Date.now().toString(36)}-${events.value.length}`, seedKey: null, seeded: [], ...data, status, createdAt: nowIso() }
    events.value.push(event)
    return ok(event)
  }
  const createEvent = (f) => save(f, f.publish ? 'published' : 'draft', true) // full details required, published or not
  const saveDraft = (f) => save(f, 'draft', false) // a title is enough

  function updateEvent(id, changes) {
    const event = byId(id)
    if (!event) return fail('NOT_FOUND')
    const problem = validate({ ...effective(event), ...changes }, { complete: event.status === 'published' })
    if (problem) return problem
    setFields(event, { ...changes, ...(typeof changes.title === 'string' && { title: text(changes.title) }) })
    return ok(event)
  }

  function publishEvent(id) {
    const event = byId(id)
    if (!event) return fail('NOT_FOUND')
    if (event.status !== 'draft') return fail('NOT_DRAFT')
    const problem = validate(effective(event), { complete: true })
    if (problem) return problem
    event.status = 'published'
    return ok(event)
  }

  return { events, news, volunteers, published, upcoming, past, drafts, shareable, newsAnnouncements, byId, createEvent, saveDraft, updateEvent, publishEvent }
})
