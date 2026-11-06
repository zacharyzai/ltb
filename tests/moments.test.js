import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { useMomentsStore } from '../src/stores/moments'
import { useResidentsStore } from '../src/stores/residents'
import { dayOffset } from '../src/utils/time'
import { freshStores, resetClock } from './helpers'

let moments, residents
beforeEach(() => { freshStores(); moments = useMomentsStore(); residents = useResidentsStore() })
afterEach(resetClock)

const ids = (list) => list.map((m) => m.id)
const valid = { title: 'Tea time', caption: 'Biscuits and chat', category: 'celebration', residentIds: ['res-tan'] }

describe('who sees which moments', () => {
  it('shows a caregiver only moments tagging their linked residents', () => {
    expect(ids(moments.visibleTo('cg-sarah'))).toEqual(['mo-1', 'mo-2', 'mo-3', 'mo-4'])
    expect(ids(moments.visibleTo('cg-david'))).toEqual(['mo-1', 'mo-4', 'mo-5'])
  })
  it('never shows drafts to caregivers', () => {
    expect(ids(moments.drafts)).toEqual(['mo-6'])
    expect(ids(moments.visibleTo('cg-sarah'))).not.toContain('mo-6')
    expect(ids(moments.published)).not.toContain('mo-6')
  })
  it('lists the latest moments, newest first', () => {
    expect(ids(moments.latest(2, 'cg-sarah'))).toEqual(['mo-1', 'mo-2'])
  })
  it('filters by resident and by date range (Singapore dates)', () => {
    expect(ids(moments.forResident('res-tan', 'cg-sarah'))).toEqual(['mo-1', 'mo-2', 'mo-3', 'mo-4'])
    expect(ids(moments.inRange(dayOffset(0), dayOffset(0), 'cg-sarah'))).toEqual(['mo-1'])
    expect(ids(moments.inRange(dayOffset(-1), dayOffset(0), 'cg-sarah'))).toEqual(['mo-1', 'mo-2'])
  })
})

describe('publishing a moment', () => {
  it('adds a published moment to the top of the feed', () => {
    const result = moments.addMoment({ ...valid, authorId: 'st-michelle' })
    expect(result.ok).toBe(true)
    expect(result.value).toMatchObject({ status: 'published', title: 'Tea time', seeded: [] })
    expect(moments.latest(1, 'cg-sarah')[0].id).toBe(result.value.id)
  })
  it('requires a title, a known category and at least one known resident', () => {
    expect(moments.addMoment({ ...valid, title: '   ' }).error).toBe('EMPTY_TITLE')
    expect(moments.addMoment({ ...valid, category: 'skydiving' }).error).toBe('BAD_CATEGORY')
    expect(moments.addMoment({ ...valid, residentIds: [] }).error).toBe('NO_RESIDENTS')
    expect(moments.addMoment({ ...valid, residentIds: ['res-ghost'] }).error).toBe('NOT_FOUND')
    expect(moments.moments).toHaveLength(6) // nothing was added
  })
  it('lets a moment reach every linked family', () => {
    const { value } = moments.addMoment({ ...valid, residentIds: ['res-tan', 'res-lim'] })
    expect(ids(moments.visibleTo('cg-sarah'))).toContain(value.id)
    expect(ids(moments.visibleTo('cg-david'))).toContain(value.id)
    expect(ids(moments.visibleTo('cg-nurul'))).not.toContain(value.id)
  })
})

describe('photo consent', () => {
  it('refuses a photo that tags a resident without consent', () => {
    expect(residents.byId('res-wong').photoConsent).toBe(false)
    const result = moments.addMoment({ ...valid, residentIds: ['res-tan', 'res-wong'], image: 'garden-walk' })
    expect(result).toEqual({ ok: false, error: 'NO_CONSENT' })
  })
  it('allows the same residents in a text-only moment, and a photo of consenting residents', () => {
    expect(moments.addMoment({ ...valid, residentIds: ['res-wong'] }).ok).toBe(true)
    expect(moments.addMoment({ ...valid, residentIds: ['res-tan', 'res-lim'], image: 'x' }).ok).toBe(true)
  })
})

describe('drafts', () => {
  it('saves a draft, then publishes it', () => {
    const { value } = moments.addMoment({ ...valid, publish: false })
    expect(value.status).toBe('draft')
    expect(ids(moments.visibleTo('cg-sarah'))).not.toContain(value.id)
    expect(moments.publishMoment(value.id).ok).toBe(true)
    expect(ids(moments.visibleTo('cg-sarah'))).toContain(value.id)
  })
  it('publishes the seeded draft', () => {
    expect(moments.publishMoment('mo-6').ok).toBe(true)
    expect(ids(moments.visibleTo('cg-sarah'))).toContain('mo-6')
  })
  it('rejects unknown ids and moments that are already published', () => {
    expect(moments.publishMoment('mo-ghost').error).toBe('NOT_FOUND')
    expect(moments.publishMoment('mo-1').error).toBe('NOT_DRAFT')
  })
  it('checks consent again when a draft is published', () => {
    const { value } = moments.addMoment({ ...valid, residentIds: ['res-rahim'], image: 'x', publish: false })
    residents.byId('res-rahim').photoConsent = false
    expect(moments.publishMoment(value.id).error).toBe('NO_CONSENT')
  })
})
