import { dayLabel } from './dates.js'

// dayOffset: days ago (0 = today). Order = newest first.
const seed = [
  { id: 'm1', dayOffset: 0, time: '9:15 AM', title: 'Morning Garden Walk', category: 'Gardening', residentIds: ['tan', 'lim'], caption: "Madam Tan enjoyed some fresh air and sunshine during today's garden walk with fellow residents." },
  { id: 'm2', dayOffset: 1, time: '3:00 PM', title: 'Music Therapy Session', category: 'Music', residentIds: ['tan'], caption: 'Madam Tan sang along to old Mandarin favourites and kept the beat with a tambourine.' },
  { id: 'm3', dayOffset: 3, time: '10:30 AM', title: 'Paper Lantern Craft', category: 'Crafts', residentIds: ['tan', 'wong'], caption: 'A relaxed morning of folding and colouring paper lanterns together.' },
  { id: 'm4', dayOffset: 4, time: '4:00 PM', title: 'Festive Tea Gathering', category: 'Festive', residentIds: ['tan', 'lim', 'rahim'], caption: 'Residents shared festive snacks and enjoyed a short cultural performance.' },
  { id: 'm5', dayOffset: 10, time: '9:00 AM', title: 'Morning Tai Chi', category: 'Exercise', residentIds: ['tan'], caption: 'Gentle tai chi stretches led by our physiotherapy volunteers.' },
]

export const moments = seed.map((m) => ({ ...m, day: dayLabel(m.dayOffset) }))

// updatedAt: null = not yet updated today.
export const wellbeing = {
  tan: { status: 'well', updatedAt: '9:30 AM', note: '' },
  lim: { status: 'resting', updatedAt: null, note: '' },
  wong: { status: 'well', updatedAt: null, note: '' },
  rahim: { status: 'well', updatedAt: null, note: '' },
}
