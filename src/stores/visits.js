import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { BOOKING_WINDOW_DAYS, DEFAULT_CAPACITY, MAX_CAPACITY, MAX_VISITORS, SLOTS, baselineTaken, bookingWindow, buildBookings } from '../data/visits'
import { fail, ok } from '../utils/result'
import { dayOffset, isIsoDate, nowIso, nowTime, todayISO } from '../utils/time'
import { useResidentsStore } from './residents'

const slotOf = (slotId) => SLOTS.find((s) => s.id === slotId)
const slotOrder = (a, b) => SLOTS.findIndex((s) => s.id === a.slotId) - SLOTS.findIndex((s) => s.id === b.slotId)

// Visit bookings, per-date slot capacity and check-in. Availability is always derived (capacity - baseline - active
// bookings), so a cancelled booking frees its space automatically.
export const useVisitsStore = defineStore('visits', () => {
  const bookings = ref(buildBookings())
  const capacityOverrides = ref({}) // 'YYYY-MM-DD|slotId' -> capacity set by staff
  const residents = useResidentsStore()
  let refCounter = Math.max(...bookings.value.map((b) => Number(b.ref.split('-').pop()))) + 1

  const occupies = (b) => b.status !== 'cancelled'
  const capacityFor = (date, slotId) => capacityOverrides.value[`${date}|${slotId}`] ?? DEFAULT_CAPACITY
  const taken = (date, slotId, excludeId = null) =>
    baselineTaken(date, slotId) + bookings.value.filter((b) => occupies(b) && b.id !== excludeId && b.date === date && b.slotId === slotId).reduce((n, b) => n + b.visitors, 0)

  // { capacity, taken, left, level: 'available' | 'limited' | 'full' } for a date and slot.
  function availability(date, slotId, excludeId = null) {
    const capacity = capacityFor(date, slotId)
    const used = taken(date, slotId, excludeId)
    const left = Math.max(0, capacity - used)
    return { capacity, taken: used, left, level: left <= 0 ? 'full' : left <= 2 ? 'limited' : 'available' }
  }
  const slotsFor = (date) => SLOTS.map((slot) => ({ ...slot, ...availability(date, slot.id), passed: date === todayISO() && slot.end <= nowTime() }))

  const byDateSlot = (a, b) => a.date.localeCompare(b.date) || slotOrder(a, b)
  const upcoming = computed(() => bookings.value.filter((b) => b.status === 'confirmed' && b.date >= todayISO()).sort(byDateSlot))
  const past = computed(() => bookings.value.filter((b) => b.status !== 'confirmed' || b.date < todayISO()).sort((a, b) => -byDateSlot(a, b)))
  const todays = computed(() => bookings.value.filter((b) => b.status === 'confirmed' && b.date === todayISO()).sort(slotOrder))
  const byCaregiver = (caregiverId) => bookings.value.filter((b) => b.caregiverId === caregiverId).sort((a, b) => -byDateSlot(a, b))
  const byId = (id) => bookings.value.find((b) => b.id === id) ?? null

  // One rule set for booking and rescheduling. excludeId = the booking being moved, so it doesn't block itself.
  function validateSlot(date, slotId, visitors, excludeId = null) {
    if (!isIsoDate(date)) return fail('BAD_DATE')
    if (date < todayISO()) return fail('PAST_DATE')
    if (date > dayOffset(BOOKING_WINDOW_DAYS - 1)) return fail('OUT_OF_RANGE')
    const slot = slotOf(slotId)
    if (!slot) return fail('BAD_SLOT')
    if (date === todayISO() && slot.end <= nowTime()) return fail('SLOT_PASSED')
    if (!Number.isInteger(visitors) || visitors < 1 || visitors > MAX_VISITORS) return fail('BAD_VISITORS', { max: MAX_VISITORS })
    const { left } = availability(date, slotId, excludeId)
    if (left <= 0) return fail('SLOT_FULL')
    if (visitors > left) return fail('NOT_ENOUGH_SPACE', { left })
    return null
  }

  function createBooking({ caregiverId, residentId, date, slotId, visitors }) {
    if (!residents.isLinked(caregiverId, residentId)) return fail('NOT_LINKED')
    const problem = validateSlot(date, slotId, visitors)
    if (problem) return problem
    const booking = {
      id: `bk-${refCounter}`, ref: `SAS-V-${refCounter++}`, caregiverId, residentId, date, slotId, visitors,
      status: 'confirmed', checkedInAt: null, createdAt: nowIso(),
    }
    bookings.value.push(booking)
    return ok(booking)
  }

  const changeable = (b) => b.status === 'confirmed' && !b.checkedInAt && b.date >= todayISO()

  function cancelBooking(id) {
    const booking = byId(id)
    if (!booking) return fail('NOT_FOUND')
    if (!changeable(booking)) return fail('NOT_CANCELLABLE')
    booking.status = 'cancelled'
    return ok(booking)
  }

  function rescheduleBooking(id, { date, slotId, visitors }) {
    const booking = byId(id)
    if (!booking) return fail('NOT_FOUND')
    if (!changeable(booking)) return fail('NOT_CANCELLABLE')
    const next = { date: date ?? booking.date, slotId: slotId ?? booking.slotId, visitors: visitors ?? booking.visitors }
    if (next.date === booking.date && next.slotId === booking.slotId && next.visitors === booking.visitors) return fail('NO_CHANGE')
    const problem = validateSlot(next.date, next.slotId, next.visitors, id)
    if (problem) return problem
    Object.assign(booking, next)
    return ok(booking)
  }

  function checkInVisitor(id) {
    const booking = byId(id)
    if (!booking) return fail('NOT_FOUND')
    if (booking.status !== 'confirmed') return fail('NOT_ACTIVE')
    if (booking.date !== todayISO()) return fail('NOT_TODAY')
    if (booking.checkedInAt) return fail('ALREADY_CHECKED_IN')
    booking.checkedInAt = nowIso()
    return ok(booking)
  }

  // Capacity belongs to one date and slot; changing it never affects another date.
  function updateSlotCapacity(date, slotId, capacity) {
    if (!isIsoDate(date)) return fail('BAD_DATE')
    if (date < todayISO()) return fail('PAST_DATE')
    if (!slotOf(slotId)) return fail('BAD_SLOT')
    if (!Number.isInteger(capacity) || capacity < 0 || capacity > MAX_CAPACITY) return fail('BAD_CAPACITY', { max: MAX_CAPACITY })
    if (capacity < taken(date, slotId)) return fail('BELOW_BOOKED', { booked: taken(date, slotId) })
    capacityOverrides.value[`${date}|${slotId}`] = capacity
    return ok(availability(date, slotId))
  }

  return { bookings, bookingWindow, slots: SLOTS, availability, slotsFor, upcoming, past, todays, byCaregiver, byId, createBooking, cancelBooking, rescheduleBooking, checkInVisitor, updateSlotCapacity }
})
