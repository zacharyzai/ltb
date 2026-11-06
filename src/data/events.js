import { at, dayOffset } from '../utils/time'

export const EVENT_CATEGORIES = ['festive', 'wellness', 'community', 'family'] // labels: eventCategory.<id>
export const EVENT_STATUSES = ['published', 'draft']
export const VOLUNTEER_AVAILABILITY = ['open', 'limited'] // labels: volunteerAvailability.<id>

// public: may be shared outside SAS. status 'draft' events never reach the caregiver portal.
const event = (n, offset, startTime, endTime, category, isPublic, status, image = null) => ({
  id: `ev-${n}`, seedKey: `events.e${n}`, seeded: ['title', 'description', 'location'], title: null, description: null, location: null,
  date: dayOffset(offset), startTime, endTime, category, public: isPublic, status, image, createdAt: at(dayOffset(Math.min(offset, 0) - 10), '09:00'),
})

export const buildEvents = () => [
  event(1, 14, '10:00', '12:00', 'festive', true, 'published', 'community-gathering'),
  event(2, 7, '14:00', '15:30', 'wellness', true, 'published', 'music-therapy'),
  event(3, 30, '15:00', '17:00', 'family', false, 'draft'),
  event(4, -4, '16:00', '17:30', 'festive', true, 'published'),
  event(5, -19, '15:00', '16:30', 'community', true, 'published'),
]

export const buildNews = () => [
  { id: 'nw-1', seedKey: 'news.n1', seeded: ['title', 'summary'], title: null, summary: null, date: dayOffset(-2) },
  { id: 'nw-2', seedKey: 'news.n2', seeded: ['title', 'summary'], title: null, summary: null, date: dayOffset(-9) },
  { id: 'nw-3', seedKey: 'news.n3', seeded: ['title', 'summary'], title: null, summary: null, date: dayOffset(-16) },
]

// Volunteer opportunities. "Express interest" is simulated in the UI; nothing is collected.
export const buildVolunteers = () => [
  { id: 'vol-1', seedKey: 'volunteers.v1', seeded: ['title', 'description', 'commitment'], availability: 'open' },
  { id: 'vol-2', seedKey: 'volunteers.v2', seeded: ['title', 'description', 'commitment'], availability: 'open' },
  { id: 'vol-3', seedKey: 'volunteers.v3', seeded: ['title', 'description', 'commitment'], availability: 'limited' },
]
