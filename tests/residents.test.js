import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { caregivers } from '../src/data/caregivers'
import { WELLBEING_STATUSES } from '../src/data/residents'
import { useResidentsStore } from '../src/stores/residents'
import { nowIso } from '../src/utils/time'
import { freshStores, resetClock } from './helpers'

let store
beforeEach(() => { freshStores(); store = useResidentsStore() })
afterEach(resetClock)

describe('resident status updates', () => {
  it('changes the status, note and timestamp', () => {
    const result = store.updateResidentStatus('res-tan', 'resting', '  Having a nap  ', 'st-aisha')
    expect(result.ok).toBe(true)
    const r = store.byId('res-tan')
    expect(r).toMatchObject({ status: 'resting', note: 'Having a nap', updatedBy: 'st-aisha', updatedAt: nowIso() })
  })
  it('replaces a seeded note with the new typed note, or clears it', () => {
    store.updateResidentStatus('res-wong', 'well', '')
    expect(store.byId('res-wong')).toMatchObject({ note: null, noteSeedKey: null })
  })
  it('rejects unknown residents, unknown statuses and very long notes', () => {
    expect(store.updateResidentStatus('nope', 'well')).toEqual({ ok: false, error: 'NOT_FOUND' })
    expect(store.updateResidentStatus('res-tan', 'angry')).toEqual({ ok: false, error: 'BAD_STATUS' })
    expect(store.updateResidentStatus('res-tan', 'well', 'x'.repeat(301))).toMatchObject({ ok: false, error: 'NOTE_TOO_LONG' })
    expect(store.byId('res-tan').status).toBe('well') // nothing changed
  })
})

describe('caregiver to resident links', () => {
  it('returns only the residents linked to a caregiver', () => {
    expect(store.linkedTo('cg-sarah').map((r) => r.id)).toEqual(['res-tan', 'res-wong'])
    expect(store.linkedTo('cg-david').map((r) => r.id)).toEqual(['res-lim'])
    expect(store.linkedTo('cg-unknown')).toEqual([])
  })
  it('checks a single link', () => {
    expect(store.isLinked('cg-david', 'res-tan')).toBe(false)
    expect(store.isLinked('cg-huimin', 'res-wong')).toBe(true)
  })
  it('keeps caregiver and resident links in step', () => {
    for (const c of caregivers) for (const id of c.residentIds) expect(store.byId(id).caregiverIds).toContain(c.id)
    for (const r of store.residents) for (const id of r.caregiverIds) expect(caregivers.find((c) => c.id === id).residentIds).toContain(r.id)
  })
})

describe('resident getters', () => {
  it('separates residents updated today from the rest', () => {
    expect(store.updatedToday.map((r) => r.id).sort()).toEqual(['res-tan', 'res-wong'])
    expect(store.notUpdatedToday.map((r) => r.id).sort()).toEqual(['res-lim', 'res-rahim'])
    store.updateResidentStatus('res-lim', 'well')
    expect(store.updatedToday.map((r) => r.id)).toContain('res-lim')
  })
  it('lists residents who need attention', () => {
    expect(store.needingAttention.map((r) => r.id)).toEqual(['res-wong'])
    store.updateResidentStatus('res-wong', 'well')
    expect(store.needingAttention).toEqual([])
  })
  it('seeds every well-being status and a resident without photo consent', () => {
    expect(new Set(store.residents.map((r) => r.status))).toEqual(new Set(WELLBEING_STATUSES))
    expect(store.residents.some((r) => !r.photoConsent)).toBe(true)
    expect(store.residents).toHaveLength(4)
  })
})
