import { at, dayOffset, daysBetween, todayISO } from '../utils/time'

export const DEFAULT_CAPACITY = 6
export const MAX_CAPACITY = 12
export const MAX_VISITORS = 4
export const BOOKING_WINDOW_DAYS = 14 // today and the next 13 days
export const BOOKING_STATUSES = ['confirmed', 'cancelled', 'completed'] // labels: visitStatus.<id>

// Stable slot ids; the UI formats start/end for the current language.
export const SLOTS = [
  { id: 'am1', start: '10:00', end: '11:00' },
  { id: 'am2', start: '11:00', end: '12:00' },
  { id: 'pm1', start: '14:00', end: '15:00' },
  { id: 'pm2', start: '15:00', end: '16:00' },
]

// Spaces already taken by other families, per slot, by days from today. Bookings made in the app are added on top.
// Gives every availability level: Available, Limited (<=2 left) and Fully booked (day +4 is full).
const BASELINE = [
  [1, 3, 4, 1], [2, 4, 6, 1], [0, 1, 3, 5], [1, 2, 4, 0], [6, 6, 6, 6], [3, 5, 2, 6], [0, 0, 1, 4],
  [1, 2, 0, 3], [2, 2, 2, 2], [0, 1, 1, 0], [4, 3, 2, 1], [1, 0, 2, 5], [2, 3, 1, 1], [0, 0, 0, 2],
]
export const baselineTaken = (dateIso, slotId) => {
  const offset = daysBetween(todayISO(), dateIso)
  const slot = SLOTS.findIndex((s) => s.id === slotId)
  return BASELINE[offset]?.[slot] ?? 0
}

export const bookingWindow = () => Array.from({ length: BOOKING_WINDOW_DAYS }, (_, i) => dayOffset(i))

// checkedInAt: when staff checked the visitors in (null = not yet).
const booking = (n, caregiverId, residentId, offset, slotId, visitors, status, checkedIn = false) => ({
  id: `bk-${n}`, ref: `SAS-V-${n}`, caregiverId, residentId, date: dayOffset(offset), slotId, visitors, status,
  checkedInAt: checkedIn ? at(dayOffset(offset), SLOTS.find((s) => s.id === slotId).start) : null,
  createdAt: at(dayOffset(Math.min(offset, 0) - 2), '12:00'),
})

export const buildBookings = () => [
  booking(4821, 'cg-sarah', 'res-tan', 0, 'pm1', 2, 'confirmed'), // today, still to arrive
  booking(4815, 'cg-david', 'res-lim', 0, 'am2', 1, 'confirmed', true), // today, checked in
  booking(4816, 'cg-nurul', 'res-rahim', 0, 'am1', 2, 'confirmed', true), // today, checked in
  booking(4822, 'cg-huimin', 'res-wong', 0, 'pm2', 1, 'confirmed'), // today, still to arrive
  booking(4830, 'cg-sarah', 'res-wong', 3, 'am1', 2, 'confirmed'), // upcoming
  booking(4831, 'cg-david', 'res-lim', 5, 'pm1', 1, 'cancelled'), // cancelled: takes no space
  booking(4790, 'cg-sarah', 'res-tan', -11, 'am1', 1, 'completed', true), // past
  booking(4795, 'cg-david', 'res-lim', -4, 'am2', 2, 'completed', true), // past
]
