import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { useEventsStore } from '../src/stores/events'
import { dayOffset } from '../src/utils/time'
import { freshStores, resetClock } from './helpers'

let store
beforeEach(() => { freshStores(); store = useEventsStore() })
afterEach(resetClock)

const ids = (list) => list.map((e) => e.id)
const full = { title: 'Karaoke Afternoon', date: dayOffset(20), startTime: '14:00', endTime: '15:30', location: 'Day Activity Room', category: 'wellness', description: 'Sing along.' }

describe('event visibility', () => {
  it('keeps drafts out of every public list', () => {
    expect(ids(store.drafts)).toEqual(['ev-3'])
    for (const list of [store.published, store.upcoming, store.past, store.shareable]) expect(ids(list)).not.toContain('ev-3')
  })
  it('sorts upcoming events soonest first and past events most recent first', () => {
    expect(ids(store.upcoming)).toEqual(['ev-2', 'ev-1'])
    expect(ids(store.past)).toEqual(['ev-4', 'ev-5'])
  })
  it('counts an event today as upcoming and yesterday as past', () => {
    const today = store.createEvent({ ...full, date: dayOffset(0), publish: true }).value
    const yesterday = store.createEvent({ ...full, date: dayOffset(-1), publish: true }).value
    expect(ids(store.upcoming)).toContain(today.id)
    expect(ids(store.past)).toContain(yesterday.id)
  })
  it('only treats public published events as shareable', () => {
    const familyOnly = store.createEvent({ ...full, public: false, publish: true }).value
    expect(ids(store.published)).toContain(familyOnly.id)
    expect(ids(store.shareable)).not.toContain(familyOnly.id)
    expect(ids(store.shareable)).toEqual(expect.arrayContaining(['ev-1', 'ev-2']))
  })
})

describe('creating events', () => {
  it('creates a draft by default and a published event on request', () => {
    const draft = store.createEvent(full).value
    expect(draft.status).toBe('draft')
    expect(ids(store.published)).not.toContain(draft.id)
    const live = store.createEvent({ ...full, title: 'Open House', publish: true }).value
    expect(ids(store.upcoming)).toContain(live.id)
  })
  it('validates the details', () => {
    expect(store.createEvent({ ...full, title: ' ' }).error).toBe('EMPTY_TITLE')
    expect(store.createEvent({ ...full, category: 'party' }).error).toBe('BAD_CATEGORY')
    expect(store.createEvent({ ...full, date: 'soon' }).error).toBe('BAD_DATE')
    expect(store.createEvent({ ...full, endTime: '13:00' }).error).toBe('BAD_TIME')
    expect(store.createEvent({ ...full, startTime: '25:00' }).error).toBe('BAD_TIME')
    expect(store.createEvent({ ...full, location: '' }).error).toBe('EMPTY_LOCATION')
    expect(store.events).toHaveLength(5)
  })
})

describe('drafts and publishing', () => {
  it('saves a draft with just a title', () => {
    const result = store.saveDraft({ title: 'Idea', category: 'community' })
    expect(result.ok).toBe(true)
    expect(result.value).toMatchObject({ status: 'draft', date: '' })
    expect(store.saveDraft({ title: '' }).error).toBe('EMPTY_TITLE')
  })
  it('publishes a complete draft, including the seeded one', () => {
    expect(store.publishEvent('ev-3').ok).toBe(true)
    expect(ids(store.upcoming)).toContain('ev-3')
    expect(ids(store.drafts)).not.toContain('ev-3')
  })
  it('refuses to publish an incomplete draft, a published event or an unknown id', () => {
    const { value } = store.saveDraft({ title: 'Idea', category: 'community' })
    expect(store.publishEvent(value.id).error).toBe('BAD_DATE')
    expect(store.byId(value.id).status).toBe('draft')
    expect(store.publishEvent('ev-1').error).toBe('NOT_DRAFT')
    expect(store.publishEvent('ev-ghost').error).toBe('NOT_FOUND')
  })
  it('completes a draft by editing it, then publishes it', () => {
    const { value } = store.saveDraft({ title: 'Idea', category: 'community' })
    expect(store.updateEvent(value.id, { date: dayOffset(9), startTime: '10:00', endTime: '11:00', location: 'Hall' }).ok).toBe(true)
    expect(store.publishEvent(value.id).ok).toBe(true)
  })
})

describe('editing events', () => {
  it('replaces seeded text with the edited text', () => {
    store.updateEvent('ev-1', { title: 'Community Gathering 2' })
    const e = store.byId('ev-1')
    expect(e.title).toBe('Community Gathering 2')
    expect(e.seeded).toEqual(['description', 'location'])
  })
  it('keeps a published event valid', () => {
    expect(store.updateEvent('ev-1', { endTime: '09:00' }).error).toBe('BAD_TIME')
    expect(store.updateEvent('ev-1', { date: '' }).error).toBe('BAD_DATE')
    expect(store.byId('ev-1').date).toBe(dayOffset(14))
    expect(store.updateEvent('ev-ghost', { title: 'x' }).error).toBe('NOT_FOUND')
  })
})

describe('volunteer interest', () => {
  it('records interest once, without collecting anything', () => {
    expect(store.hasInterest('vol-1')).toBe(false)
    expect(store.expressInterest('vol-1')).toEqual({ ok: true, value: 'vol-1' })
    expect(store.hasInterest('vol-1')).toBe(true)
    store.expressInterest('vol-1')
    expect(store.interestedIds).toEqual(['vol-1'])
  })
  it('ignores unknown opportunities', () => {
    expect(store.expressInterest('vol-ghost').error).toBe('NOT_FOUND')
    expect(store.interestedIds).toEqual([])
  })
})

describe('news and volunteers', () => {
  it('lists news newest first', () => {
    expect(store.newsAnnouncements.map((n) => n.id)).toEqual(['nw-1', 'nw-2', 'nw-3'])
  })
  it('has three volunteer opportunities with an availability', () => {
    expect(store.volunteers).toHaveLength(3)
    expect(store.volunteers.map((v) => v.availability)).toEqual(['open', 'open', 'limited'])
  })
})
