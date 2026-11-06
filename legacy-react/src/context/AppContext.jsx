import { useEffect, useState } from 'react'
import { AppContext } from './useApp.js'
import { moments as seedMoments, wellbeing } from '../data/moments.js'
import { inquiries as seedInquiries } from '../data/inquiries.js'
import { bookings as seedBookings } from '../data/visits.js'
import { events as seedEvents } from '../data/events.js'
import { TODAY_ISO, fmtDate, fmtTime, nowTime } from '../data/dates.js'
import { caregiver } from '../data/residents.js'

const TEXT_SIZES = ['md', 'lg', 'xl']
const patch = (list, id, changes) => list.map((x) => (x.id === id ? { ...x, ...changes } : x))

export function AppProvider({ children }) {
  const [textSize, setTextSize] = useState('md')
  const [statuses, setStatuses] = useState(wellbeing)
  const [moments, setMoments] = useState(seedMoments)
  const [inquiries, setInquiries] = useState(seedInquiries)
  const [bookings, setBookings] = useState(seedBookings)
  const [slotCapacity, setSlotCapacity] = useState({})
  const [events, setEvents] = useState(seedEvents)

  useEffect(() => {
    document.documentElement.dataset.text = textSize
  }, [textSize])

  const cycleTextSize = () =>
    setTextSize((s) => TEXT_SIZES[(TEXT_SIZES.indexOf(s) + 1) % TEXT_SIZES.length])

  const updateStatus = (residentId, status, note) =>
    setStatuses((s) => ({ ...s, [residentId]: { status, note, updatedAt: nowTime() } }))

  const addMoment = (m) =>
    setMoments((ms) => [{ id: `m${Date.now()}`, dayOffset: 0, day: 'Today', time: nowTime(), ...m }, ...ms])

  const submitInquiry = ({ topic, question }) =>
    setInquiries((qs) => [
      { id: `q${Date.now()}`, caregiverId: caregiver.id, caregiverName: caregiver.name, residentId: caregiver.residentId, topic: topic || 'Something else', time: nowTime(), question, status: 'submitted', reply: null },
      ...qs,
    ])

  const updateInquiry = (id, changes) => setInquiries((qs) => patch(qs, id, changes))

  const addBooking = ({ dateLabel, slot, visitors }) => {
    const booking = { id: `b${Date.now()}`, ref: `SAS-V-${4822 + bookings.length}`, residentId: caregiver.residentId, visitorName: caregiver.name, dateLabel, slot, visitors, status: 'confirmed' }
    setBookings((bs) => [booking, ...bs])
    return booking
  }
  const rescheduleBooking = (id, details) => setBookings((bs) => patch(bs, id, details))
  const cancelBooking = (id) => setBookings((bs) => patch(bs, id, { status: 'cancelled' }))
  const checkIn = (id) => setBookings((bs) => patch(bs, id, { status: 'in' }))

  const changeCapacity = (dateKey, i, current, delta) => setSlotCapacity((c) => ({ ...c, [`${dateKey}|${i}`]: current + delta }))

  // form: { id?, title, iso, start, end, location, description, public, published }
  const saveEvent = (form) => {
    const prev = events.find((e) => e.id === form.id)
    const base = (prev?.tag ?? 'COMMUNITY').split(' · ')[0]
    const e = {
      icon: 'tree', ...prev, ...form,
      id: prev?.id ?? `e${Date.now()}`,
      date: fmtDate(form.iso), time: fmtTime(form.start, form.end),
      when: form.iso >= TODAY_ISO ? 'upcoming' : 'past',
      tag: `${base} · ${form.public ? 'PUBLIC' : 'FAMILIES'}`,
    }
    setEvents((es) => (prev ? patch(es, e.id, e) : [e, ...es]))
  }

  return (
    <AppContext.Provider
      value={{
        textSize, cycleTextSize,
        statuses, updateStatus, moments, addMoment,
        inquiries, submitInquiry, updateInquiry,
        bookings, addBooking, rescheduleBooking, cancelBooking, checkIn,
        slotCapacity, changeCapacity, events, saveEvent,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}
