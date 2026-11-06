import { TODAY_ISO, fmtDate, isoIn } from './dates.js'

export const MAX_VISITORS = 4
export const DEFAULT_CAPACITY = 6
export const TODAY = fmtDate(TODAY_ISO)

export const slotTimes = ['10:00 – 11:00 AM', '11:00 AM – 12:00 PM', '2:00 – 3:00 PM', '3:00 – 4:00 PM']

// Tomorrow and the next five days. key = ISO date.
export const bookableDates = [1, 2, 3, 4, 5, 6].map((offset) => ({ key: isoIn(offset), label: fmtDate(isoIn(offset)), offset }))

// Staff can look at today as well as the bookable days.
export const scheduleDates = [{ key: TODAY_ISO, label: TODAY, offset: 0 }, ...bookableDates]

// Spaces already taken by other families, per slot (same order as slotTimes), by days from today.
// Bookings made in the app are added on top by spacesLeft().
const baseTaken = [[3, 4, 4, 2], [2, 4, 6, 1], [0, 1, 3, 5], [6, 6, 6, 6], [1, 2, 4, 0], [3, 5, 2, 6], [0, 0, 1, 4]]

export const isActive = (b) => b.status === 'confirmed' || b.status === 'in'

// Capacity is stored per date and slot; anything not changed by staff uses the default.
export const capacityFor = (capacity, dateKey, i) => capacity[`${dateKey}|${i}`] ?? DEFAULT_CAPACITY

const day = (dateKey) => scheduleDates.find((d) => d.key === dateKey)

const bookedBy = (bookings, dateKey, i) =>
  bookings.filter((b) => isActive(b) && b.dateLabel === day(dateKey).label && b.slot === slotTimes[i]).reduce((n, b) => n + b.visitors, 0)

export const spacesTaken = (bookings, dateKey, i) => baseTaken[day(dateKey).offset][i] + bookedBy(bookings, dateKey, i)

// Cancelled bookings are not active, so they release their spaces automatically.
export const spacesLeft = (bookings, capacity, dateKey, i) => capacityFor(capacity, dateKey, i) - spacesTaken(bookings, dateKey, i)

// Full / Limited (≤2 left) / Available, always shown with words.
export const availability = (left) => (left <= 0 ? 'full' : left <= 2 ? 'limited' : 'available')

export const bookings = [
  { id: 'b1', ref: 'SAS-V-4821', residentId: 'tan', visitorName: 'Sarah Tan', dateLabel: TODAY, slot: '2:00 – 3:00 PM', visitors: 2, status: 'confirmed' },
  { id: 'b2', ref: 'SAS-V-4815', residentId: 'lim', visitorName: 'David Lim', dateLabel: TODAY, slot: '11:00 AM – 12:00 PM', visitors: 1, status: 'in' },
  { id: 'b0', ref: 'SAS-V-4790', residentId: 'tan', visitorName: 'Sarah Tan', dateLabel: fmtDate(isoIn(-11)), slot: '10:00 – 11:00 AM', visitors: 1, status: 'visited' },
]
