import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CalendarCheck, Minus, Plus } from 'lucide-react'
import Button from '../components/Button.jsx'
import QRPass from '../components/QRPass.jsx'
import { useApp } from '../context/useApp.js'
import { residents, caregiver } from '../data/residents.js'
import { MAX_VISITORS, availability, bookableDates, slotTimes, spacesLeft } from '../data/visits.js'

const TITLES = ['Choose a date', 'Choose a time', 'Review your visit', 'Booking confirmed']
const AVAIL = {
  available: { symbol: '●', text: 'Available', cls: 'border-teal-dark text-well bg-well-bg' },
  limited: { symbol: '◆', text: 'Limited', cls: 'border-rest text-rest bg-rest-bg' },
  full: { symbol: '✕', text: 'Fully Booked', cls: 'border-dash text-full bg-full-bg' },
}
const resident = residents.find((r) => r.id === caregiver.residentId)
const pick = (on) => (on ? 'bg-teal-dark text-white border-ink' : 'bg-white border-ink hover:bg-tint')

export default function BookVisit() {
  const { bookings, slotCapacity, addBooking, rescheduleBooking } = useApp()
  const navigate = useNavigate()
  const rescheduleId = useSearchParams()[0].get('reschedule')
  const old = bookings.find((b) => b.id === rescheduleId && b.status === 'confirmed')
  const [step, setStep] = useState(1)
  const [dateKey, setDateKey] = useState(null)
  const [slotIdx, setSlotIdx] = useState(null)
  const [visitors, setVisitors] = useState(old?.visitors ?? 2)
  const [done, setDone] = useState(null)

  const date = bookableDates.find((d) => d.key === dateKey)
  // Availability is derived from active bookings; when rescheduling, the old booking doesn't block itself.
  const others = bookings.filter((b) => b.id !== old?.id)
  const left = (d) => slotTimes.map((_, i) => spacesLeft(others, slotCapacity, d, i))
  const chooseDate = (key) => {
    setDateKey(key)
    if (slotIdx !== null && availability(left(key)[slotIdx]) === 'full') setSlotIdx(null)
  }
  const confirm = () => {
    const details = { dateLabel: date.label, slot: slotTimes[slotIdx], visitors: people }
    if (old) { rescheduleBooking(old.id, details); setDone({ ...old, ...details }) }
    else setDone(addBooking(details))
    setStep(4)
  }
  const maxPeople = slotIdx === null || !dateKey ? MAX_VISITORS : Math.min(MAX_VISITORS, left(dateKey)[slotIdx])
  const people = Math.min(visitors, maxPeople)
  const canNext = step === 1 ? dateKey : step === 2 ? slotIdx !== null : true

  return (
    <div className="space-y-3">
      <div>
        <p className="font-bold text-teal-dark">{old ? 'Reschedule visit' : 'Book a visit'} · Step {step} of 4</p>
        <div className="mt-1 flex gap-1.5" aria-hidden="true">
          {[1, 2, 3, 4].map((n) => <span key={n} className={`h-2 flex-1 rounded-full border border-ink ${n <= step ? 'bg-teal' : 'bg-white'}`} />)}
        </div>
        <h1 className="mt-2 font-heading text-2xl font-bold">{TITLES[step - 1]}</h1>
      </div>

      {step === 1 && (
        <div className="grid grid-cols-2 gap-2">
          {bookableDates.map((d) => {
            const full = left(d.key).every((n) => n <= 0)
            return (
              <button key={d.key} type="button" disabled={full} aria-pressed={dateKey === d.key} onClick={() => chooseDate(d.key)}
                className={`min-h-16 rounded-xl border-2 px-2 font-heading text-lg font-bold disabled:cursor-not-allowed disabled:border-dash disabled:bg-full-bg disabled:text-full ${pick(dateKey === d.key)}`}>
                {d.label}
                {full && <span className="block font-body text-sm font-normal">✕ Fully Booked</span>}
              </button>
            )
          })}
        </div>
      )}

      {step === 2 && (
        <div className="space-y-2">
          <p className="text-lg">{date.label}</p>
          {slotTimes.map((t, i) => {
            const n = left(dateKey)[i], a = AVAIL[availability(n)], full = n <= 0
            return (
              <button key={t} type="button" disabled={full} aria-pressed={slotIdx === i} onClick={() => setSlotIdx(i)}
                className={`flex min-h-16 w-full items-center justify-between gap-2 rounded-xl border-2 px-3 text-left disabled:cursor-not-allowed ${full ? 'border-dash bg-full-bg text-full' : pick(slotIdx === i)}`}>
                <span className="font-heading text-lg font-bold">{t}</span>
                <span className={`rounded-full border-2 px-2.5 text-sm font-bold ${a.cls}`}>
                  <span aria-hidden="true">{a.symbol}</span> {a.text}{a.text === 'Limited' && ` · ${n} left`}
                </span>
              </button>
            )
          })}
        </div>
      )}

      {step === 3 && (
        <div className="space-y-3">
          <dl className="space-y-2 rounded-2xl border-2 border-ink bg-white p-3 text-lg">
            {[['Visiting', resident.name], ['Date', date.label], ['Time', slotTimes[slotIdx]]].map(([k, v]) => (
              <div key={k}><dt className="text-sm font-bold uppercase tracking-wide text-muted">{k}</dt><dd>{v}</dd></div>
            ))}
          </dl>
          <div className="flex items-center justify-between rounded-2xl border-2 border-ink bg-white p-3">
            <span id="vis-label" className="text-lg">Number of visitors</span>
            <div className="flex items-center gap-2" role="group" aria-labelledby="vis-label">
              <Button variant="outline" aria-label="Fewer visitors" disabled={people <= 1} onClick={() => setVisitors(people - 1)} className="size-12 !p-0"><Minus aria-hidden="true" /></Button>
              <span className="w-6 text-center font-heading text-xl font-bold" aria-live="polite">{people}</span>
              <Button variant="outline" aria-label="More visitors" disabled={people >= maxPeople} onClick={() => setVisitors(people + 1)} className="size-12 !p-0"><Plus aria-hidden="true" /></Button>
            </div>
          </div>
        </div>
      )}

      {step === 4 && done && (
        <div className="space-y-3 text-center" role="status">
          <CalendarCheck aria-hidden="true" size={44} className="mx-auto text-teal-dark" />
          <p className="text-lg">{old ? 'Your visit has been rescheduled.' : 'Your visit is booked.'}</p>
          <p className="rounded-xl border-2 border-ink bg-white p-3 text-lg">
            {resident.name}<br />{done.dateLabel} · {done.slot}<br />{done.visitors} visitor{done.visitors > 1 && 's'}<br />
            <b>Booking ref: {done.ref}</b>
          </p>
          <QRPass value={done.ref} />
          <Button to="/visits" className="w-full">Back to My Visits</Button>
        </div>
      )}

      {step < 4 && (
        <div className="grid grid-cols-2 gap-2 pt-1">
          <Button variant="outline" onClick={() => (step === 1 ? navigate('/visits') : setStep(step - 1))}>Back</Button>
          <Button disabled={!canNext} onClick={() => (step === 3 ? confirm() : setStep(step + 1))}>{step === 3 ? 'Confirm Booking' : 'Next'}</Button>
        </div>
      )}
    </div>
  )
}
