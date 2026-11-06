import { fmtDate, fmtTime, isoIn } from './dates.js'

// Dates are offsets from today so the demo stays current.
// public: only public events may be shared. Resident moments are never public.
// published: caregivers only see published events. iso/start/end let staff edit date and time.
const ev = (id, offset, published, isPublic, tag, title, start, end, location, icon, description) => {
  const iso = isoIn(offset)
  return { id, when: offset >= 0 ? 'upcoming' : 'past', published, public: isPublic, tag, title, iso, start, end, date: fmtDate(iso), time: fmtTime(start, end), location, icon, description }
}

export const events = [
  ev('e1', 14, true, true, 'COMMUNITY · PUBLIC', 'Community Gathering', '10:00', '12:00', 'Activity Hall, Level 1', 'tree', 'Join residents, families and volunteers for songs, tea and festive snacks. Wheelchair access and seating are provided throughout.'),
  ev('e2', 7, true, true, 'WELLNESS · PUBLIC', 'Music Therapy Open Afternoon', '14:00', '15:30', 'Day Activity Room', 'music', 'Families are invited to watch and join a live music therapy session and see how sponsored activities support residents.'),
  ev('e5', 30, false, false, 'COMMUNITY · FAMILIES', 'Family Appreciation Day', '15:00', '17:00', 'Garden Pavilion', 'tree', 'A thank-you afternoon for the families who support our residents.'),
  ev('e3', -4, true, true, 'FESTIVE · PUBLIC', 'Festive Tea Gathering', '16:00', '17:30', 'Activity Hall, Level 1', 'tree', 'A festive tea with traditional snacks and a short cultural performance by volunteers.'),
  ev('e4', -19, true, true, 'COMMUNITY · PUBLIC', 'Volunteer Appreciation Tea', '15:00', '16:30', 'Garden Pavilion', 'tree', 'A thank-you afternoon for the volunteers who spend time with our residents every week.'),
]

export const news = [
  { id: 'n1', date: fmtDate(isoIn(-2)), title: 'Visiting hours stay the same this festive season', summary: 'Visits remain available daily. Please book a slot in advance so we can welcome everyone comfortably.' },
  { id: 'n2', date: fmtDate(isoIn(-9)), title: 'Volunteers needed for the Community Gathering', summary: 'We are looking for friendly helpers to assist residents on the day. Speak to the care team if you would like to help.' },
  { id: 'n3', date: fmtDate(isoIn(-16)), title: 'New seated exercise programme', summary: 'Residents now enjoy a gentle seated exercise class three mornings a week.' },
]

export const social = {
  donate: 'https://www.societyagedsick.org.sg/donation/',
  website: 'https://www.societyagedsick.org.sg/',
  facebook: 'https://www.facebook.com/SASNursingHome',
  instagram: 'https://www.instagram.com/sasnursinghome/',
}
