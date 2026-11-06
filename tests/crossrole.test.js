import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { useEventsStore } from '../src/stores/events'
import { useInquiriesStore } from '../src/stores/inquiries'
import { useMomentsStore } from '../src/stores/moments'
import { useResidentsStore } from '../src/stores/residents'
import { useVisitsStore } from '../src/stores/visits'
import { dayOffset } from '../src/utils/time'
import { freshStores, resetClock } from './helpers'

// The six demonstration journeys, played through the stores the way the caregiver and staff screens will use them.
beforeEach(() => freshStores())
afterEach(resetClock)

describe('cross-role scenarios', () => {
  it('A: staff updates a status and the caregiver reads it', () => {
    const residents = useResidentsStore()
    residents.updateResidentStatus('res-tan', 'resting', 'Nap after lunch', 'st-aisha')
    const mine = residents.linkedTo('cg-sarah').find((r) => r.id === 'res-tan')
    expect(mine).toMatchObject({ status: 'resting', note: 'Nap after lunch' })
  })

  it('B: staff publishes a moment and the caregiver feed shows it first', () => {
    const moments = useMomentsStore()
    const { value } = moments.addMoment({ title: 'Karaoke', category: 'music', residentIds: ['res-tan'], image: 'karaoke', authorId: 'st-michelle' })
    expect(moments.latest(1, 'cg-sarah')[0].id).toBe(value.id)
    expect(moments.latest(1, 'cg-david')[0].id).not.toBe(value.id) // another family does not see it
  })

  it('C: caregiver submits an inquiry and staff see it pending', () => {
    const inquiries = useInquiriesStore()
    const before = inquiries.pendingCount
    const { value } = inquiries.submitInquiry({ caregiverId: 'cg-sarah', residentId: 'res-tan', question: 'Any visitors allowed tonight?' })
    expect(inquiries.pending.map((q) => q.id)).toContain(value.id)
    expect(inquiries.pendingCount).toBe(before + 1)
    inquiries.markInReview(value.id)
    expect(inquiries.byId(value.id).status).toBe('in-review')
  })

  it('D: staff reply and the caregiver reads the answer', () => {
    const inquiries = useInquiriesStore()
    const { value } = inquiries.submitInquiry({ caregiverId: 'cg-sarah', residentId: 'res-tan', question: 'Any visitors allowed tonight?' })
    inquiries.replyToInquiry(value.id, 'Yes, until 8pm.', 'st-aisha')
    const seen = inquiries.byCaregiver('cg-sarah').find((q) => q.id === value.id)
    expect(seen).toMatchObject({ status: 'answered', reply: 'Yes, until 8pm.' })
  })

  it('E: booking appears for staff and cancelling frees the space', () => {
    const visits = useVisitsStore()
    const date = dayOffset(6)
    const before = visits.availability(date, 'am1').left
    const { value } = visits.createBooking({ caregiverId: 'cg-sarah', residentId: 'res-tan', date, slotId: 'am1', visitors: 2 })
    expect(visits.byCaregiver('cg-sarah').map((b) => b.id)).toContain(value.id)
    expect(visits.availability(date, 'am1').left).toBe(before - 2)
    visits.cancelBooking(value.id)
    expect(visits.availability(date, 'am1').left).toBe(before)
  })

  it('F: staff publishes an event; drafts stay hidden from caregivers', () => {
    const events = useEventsStore()
    const draft = events.saveDraft({ title: 'Surprise', category: 'community' }).value
    expect(events.published.map((e) => e.id)).not.toContain(draft.id)
    const live = events.createEvent({ title: 'Open House', date: dayOffset(10), startTime: '10:00', endTime: '12:00', location: 'Lobby', category: 'community', publish: true }).value
    expect(events.upcoming.map((e) => e.id)).toContain(live.id)
    expect(events.published.map((e) => e.id)).not.toContain(draft.id)
  })
})
