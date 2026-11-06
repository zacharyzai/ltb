import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { useInquiriesStore } from '../src/stores/inquiries'
import { nowIso } from '../src/utils/time'
import { freshStores, resetClock } from './helpers'

let store
beforeEach(() => { freshStores(); store = useInquiriesStore() })
afterEach(resetClock)

const ask = (over = {}) => store.submitInquiry({ caregiverId: 'cg-sarah', residentId: 'res-tan', question: 'Is she eating well?', topic: 'meals', ...over })

describe('submitting an inquiry', () => {
  it('records it as pending, newest first', () => {
    const before = store.pendingCount
    const result = ask({ question: '  Is she eating well?  ' })
    expect(result.ok).toBe(true)
    expect(result.value).toMatchObject({ status: 'pending', question: 'Is she eating well?', topic: 'meals', reply: null, createdAt: nowIso() })
    expect(store.pendingCount).toBe(before + 1)
    expect(store.byCaregiver('cg-sarah')[0].id).toBe(result.value.id)
  })
  it('rejects empty and over-long questions', () => {
    expect(ask({ question: '   ' })).toEqual({ ok: false, error: 'EMPTY_QUESTION' })
    expect(ask({ question: 'x'.repeat(501) })).toMatchObject({ ok: false, error: 'QUESTION_TOO_LONG', params: { max: 500 } })
  })
  it('only lets a caregiver ask about their linked residents', () => {
    expect(ask({ caregiverId: 'cg-david' })).toEqual({ ok: false, error: 'NOT_LINKED' })
  })
  it('falls back to the "other" topic for an unknown topic', () => {
    expect(ask({ topic: 'weather' }).value.topic).toBe('other')
  })
})

describe('staff handling', () => {
  it('moves pending to in review', () => {
    expect(store.markInReview('iq-1').ok).toBe(true)
    expect(store.byId('iq-1').status).toBe('in-review')
    expect(store.pendingCount).toBe(3) // still needs a reply
  })
  it('refuses to review an answered or unknown inquiry', () => {
    expect(store.markInReview('iq-4').error).toBe('ALREADY_ANSWERED')
    expect(store.markInReview('iq-ghost').error).toBe('NOT_FOUND')
  })
  it('records a reply and marks the inquiry answered', () => {
    const before = store.pendingCount
    const result = store.replyToInquiry('iq-1', '  She is doing well.  ', 'st-aisha')
    expect(result.value).toMatchObject({ status: 'answered', reply: 'She is doing well.', repliedBy: 'st-aisha', repliedAt: nowIso() })
    expect(store.pendingCount).toBe(before - 1)
    expect(store.answered.map((q) => q.id)).toContain('iq-1')
  })
  it('can reply straight from pending or from in review', () => {
    store.markInReview('iq-2')
    expect(store.replyToInquiry('iq-2', 'Noted.').ok).toBe(true)
    expect(store.replyToInquiry('iq-3', 'Yes please.').ok).toBe(true)
  })
  it('rejects empty replies, unknown inquiries and a second reply', () => {
    expect(store.replyToInquiry('iq-1', '  ').error).toBe('EMPTY_REPLY')
    expect(store.byId('iq-1').status).toBe('pending') // unchanged
    expect(store.replyToInquiry('iq-ghost', 'Hi').error).toBe('NOT_FOUND')
    store.replyToInquiry('iq-1', 'First')
    expect(store.replyToInquiry('iq-1', 'Second').error).toBe('ALREADY_ANSWERED')
  })
  it('keeps the seeded question text but uses the typed reply', () => {
    store.replyToInquiry('iq-1', 'Typed reply')
    expect(store.byId('iq-1').seeded).toEqual(['question'])
  })
})

describe('inquiry getters', () => {
  it('splits pending (including in review) from answered', () => {
    expect(store.pending.map((q) => q.id).sort()).toEqual(['iq-1', 'iq-2', 'iq-3'])
    expect(store.answered.map((q) => q.id).sort()).toEqual(['iq-4', 'iq-5'])
  })
  it('filters by caregiver and by resident', () => {
    expect(store.byCaregiver('cg-sarah').map((q) => q.id)).toEqual(['iq-1', 'iq-4'])
    expect(store.byResident('res-tan').map((q) => q.id)).toEqual(['iq-1', 'iq-4'])
    expect(store.byResident('res-wong').map((q) => q.id)).toEqual(['iq-3'])
  })
})
