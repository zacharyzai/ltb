import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { useVisitsStore } from '../src/stores/visits'
import { dayOffset, nowIso, setNow } from '../src/utils/time'
import { freshStores, resetClock } from './helpers'

let store
beforeEach(() => { freshStores(); store = useVisitsStore() })
afterEach(resetClock)

const book = (over = {}) => store.createBooking({ caregiverId: 'cg-sarah', residentId: 'res-tan', date: dayOffset(1), slotId: 'am1', visitors: 2, ...over })
const left = (offset, slotId, exclude) => store.availability(dayOffset(offset), slotId, exclude).left

describe('capacity and availability', () => {
  it('derives availability from baseline, active bookings and capacity', () => {
    // Today: baseline [1,3,4,1] plus today's bookings (am1 2, am2 1, pm1 2, pm2 1).
    expect(store.availability(dayOffset(0), 'am1')).toEqual({ capacity: 6, taken: 3, left: 3, level: 'available' })
    expect(store.availability(dayOffset(0), 'am2')).toMatchObject({ left: 2, level: 'limited' })
    expect(store.availability(dayOffset(0), 'pm1')).toMatchObject({ left: 0, level: 'full' })
  })
  it('has a fully booked day', () => {
    expect(store.slots.every((s) => store.availability(dayOffset(4), s.id).level === 'full')).toBe(true)
  })
  it('does not count cancelled bookings (seeded cancelled visit takes no space)', () => {
    expect(left(5, 'pm1')).toBe(4) // baseline 2, the cancelled booking adds nothing
  })
  it('offers a 14-day booking window starting today', () => {
    expect(store.bookingWindow()).toHaveLength(14)
    expect(store.bookingWindow()[0]).toBe(dayOffset(0))
  })
  it('marks slots that have already started today', () => {
    setNow('2026-11-12T15:30:00+08:00')
    const passed = Object.fromEntries(store.slotsFor(dayOffset(0)).map((s) => [s.id, s.passed]))
    expect(passed).toEqual({ am1: true, am2: true, pm1: true, pm2: false })
  })
})

describe('creating a booking', () => {
  it('creates a confirmed booking with a new reference and uses up space', () => {
    const before = left(1, 'am1')
    const result = book()
    expect(result.value).toMatchObject({ status: 'confirmed', checkedInAt: null, visitors: 2, ref: 'SAS-V-4832', createdAt: nowIso() })
    expect(left(1, 'am1')).toBe(before - 2)
    expect(book({ slotId: 'am2' }).value.ref).toBe('SAS-V-4833')
  })
  it('refuses residents the caregiver is not linked to', () => {
    expect(book({ caregiverId: 'cg-david' }).error).toBe('NOT_LINKED')
  })
  it('refuses past dates, far-future dates, bad dates and bad slots', () => {
    expect(book({ date: dayOffset(-1) }).error).toBe('PAST_DATE')
    expect(book({ date: dayOffset(14) }).error).toBe('OUT_OF_RANGE')
    expect(book({ date: '12 Nov' }).error).toBe('BAD_DATE')
    expect(book({ slotId: 'midnight' }).error).toBe('BAD_SLOT')
  })
  it('refuses a slot that has already started today', () => {
    setNow('2026-11-12T15:30:00+08:00')
    expect(book({ date: dayOffset(0), slotId: 'am1' }).error).toBe('SLOT_PASSED')
  })
  it('refuses invalid visitor counts', () => {
    for (const visitors of [0, 5, 1.5, '2']) expect(book({ visitors })).toMatchObject({ ok: false, error: 'BAD_VISITORS', params: { max: 4 } })
  })
  it('refuses full slots and more visitors than spaces left', () => {
    expect(book({ date: dayOffset(0), slotId: 'pm1' }).error).toBe('SLOT_FULL')
    expect(book({ date: dayOffset(4) }).error).toBe('SLOT_FULL')
    expect(book({ date: dayOffset(0), slotId: 'am2', visitors: 3 })).toMatchObject({ ok: false, error: 'NOT_ENOUGH_SPACE', params: { left: 2 } })
  })
  it('lets the last spaces be booked, then the slot is full', () => {
    expect(book({ date: dayOffset(0), slotId: 'am2', visitors: 2 }).ok).toBe(true)
    expect(store.availability(dayOffset(0), 'am2').level).toBe('full')
    expect(book({ date: dayOffset(0), slotId: 'am2', visitors: 1 }).error).toBe('SLOT_FULL')
  })
})

describe('cancelling', () => {
  it('releases the space', () => {
    const { value } = book({ visitors: 4 })
    expect(left(1, 'am1')).toBe(0)
    expect(store.cancelBooking(value.id).ok).toBe(true)
    expect(value.status).toBe('cancelled')
    expect(left(1, 'am1')).toBe(4)
    expect(store.upcoming.map((b) => b.id)).not.toContain(value.id)
  })
  it('cannot cancel twice, after check-in, after completion, or an unknown booking', () => {
    expect(store.cancelBooking('bk-4831').error).toBe('NOT_CANCELLABLE')
    expect(store.cancelBooking('bk-4815').error).toBe('NOT_CANCELLABLE') // checked in
    expect(store.cancelBooking('bk-4790').error).toBe('NOT_CANCELLABLE') // completed
    expect(store.cancelBooking('bk-ghost').error).toBe('NOT_FOUND')
  })
})

describe('rescheduling', () => {
  it('moves a booking and frees the old slot', () => {
    const oldLeft = left(3, 'am1')
    const newLeft = left(1, 'am1')
    expect(store.rescheduleBooking('bk-4830', { date: dayOffset(1), slotId: 'am1' }).ok).toBe(true)
    expect(store.byId('bk-4830')).toMatchObject({ date: dayOffset(1), slotId: 'am1', visitors: 2 })
    expect(left(3, 'am1')).toBe(oldLeft + 2)
    expect(left(1, 'am1')).toBe(newLeft - 2)
  })
  it("doesn't let a booking block itself when only the visitor count changes", () => {
    expect(left(3, 'am1')).toBe(3) // 6 - baseline 1 - this booking's 2
    expect(store.rescheduleBooking('bk-4830', { visitors: 4 }).ok).toBe(true)
    expect(left(3, 'am1')).toBe(1)
  })
  it('refuses invalid moves', () => {
    expect(store.rescheduleBooking('bk-4830', { date: dayOffset(4) }).error).toBe('SLOT_FULL')
    expect(store.rescheduleBooking('bk-4830', { date: dayOffset(-1) }).error).toBe('PAST_DATE')
    expect(store.rescheduleBooking('bk-4830', { visitors: 5 }).error).toBe('BAD_VISITORS')
    expect(store.rescheduleBooking('bk-4830', {}).error).toBe('NO_CHANGE')
    expect(store.byId('bk-4830')).toMatchObject({ date: dayOffset(3), slotId: 'am1', visitors: 2 }) // untouched
  })
  it('refuses cancelled, checked-in and unknown bookings', () => {
    expect(store.rescheduleBooking('bk-4831', { slotId: 'am1' }).error).toBe('NOT_CANCELLABLE')
    expect(store.rescheduleBooking('bk-4815', { slotId: 'am1' }).error).toBe('NOT_CANCELLABLE')
    expect(store.rescheduleBooking('bk-ghost', { slotId: 'am1' }).error).toBe('NOT_FOUND')
  })
})

describe('visitor check-in', () => {
  it("checks in today's visitors once", () => {
    const result = store.checkInVisitor('bk-4821')
    expect(result.value.checkedInAt).toBe(nowIso())
    expect(store.checkInVisitor('bk-4821').error).toBe('ALREADY_CHECKED_IN')
  })
  it('refuses other days, inactive and unknown bookings', () => {
    expect(store.checkInVisitor('bk-4830').error).toBe('NOT_TODAY')
    expect(store.checkInVisitor('bk-4831').error).toBe('NOT_ACTIVE')
    expect(store.checkInVisitor('bk-ghost').error).toBe('NOT_FOUND')
  })
})

describe('per-date slot capacity', () => {
  it('changes one date and slot only', () => {
    expect(store.updateSlotCapacity(dayOffset(0), 'am1', 8)).toMatchObject({ ok: true, value: { capacity: 8, left: 5 } })
    expect(store.availability(dayOffset(1), 'am1').capacity).toBe(6)
    expect(store.availability(dayOffset(0), 'am2').capacity).toBe(6)
  })
  it('opens up a full slot when raised', () => {
    store.updateSlotCapacity(dayOffset(0), 'pm1', 8)
    expect(book({ date: dayOffset(0), slotId: 'pm1', visitors: 2 }).ok).toBe(true)
  })
  it('cannot go below what is already booked, or out of range, or into the past', () => {
    expect(store.updateSlotCapacity(dayOffset(0), 'am1', 2)).toMatchObject({ ok: false, error: 'BELOW_BOOKED', params: { booked: 3 } })
    expect(store.updateSlotCapacity(dayOffset(0), 'am1', 13).error).toBe('BAD_CAPACITY')
    expect(store.updateSlotCapacity(dayOffset(-1), 'am1', 6).error).toBe('PAST_DATE')
    expect(store.updateSlotCapacity('nope', 'am1', 6).error).toBe('BAD_DATE')
    expect(store.updateSlotCapacity(dayOffset(0), 'zzz', 6).error).toBe('BAD_SLOT')
  })
})

describe('visit lists', () => {
  it('sorts upcoming visits by date and slot, and excludes cancelled and past ones', () => {
    expect(store.upcoming.map((b) => b.id)).toEqual(['bk-4816', 'bk-4815', 'bk-4821', 'bk-4822', 'bk-4830'])
  })
  it('collects past, completed and cancelled visits', () => {
    expect(store.past.map((b) => b.id)).toEqual(['bk-4831', 'bk-4795', 'bk-4790'])
  })
  it("lists today's visits in slot order", () => {
    expect(store.todays.map((b) => b.id)).toEqual(['bk-4816', 'bk-4815', 'bk-4821', 'bk-4822'])
    expect(store.todays.filter((b) => b.checkedInAt)).toHaveLength(2)
  })
  it("lists one caregiver's bookings", () => {
    expect(store.byCaregiver('cg-sarah').map((b) => b.id)).toEqual(['bk-4830', 'bk-4821', 'bk-4790'])
  })
})
