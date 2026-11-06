import { useState } from 'react'
import { Minus, Plus, ScanLine } from 'lucide-react'
import BottomSheet from '../../components/BottomSheet.jsx'
import Button from '../../components/Button.jsx'
import SectionLabel from '../../components/SectionLabel.jsx'
import { useApp } from '../../context/useApp.js'
import { residents } from '../../data/residents.js'
import { TODAY_ISO } from '../../data/dates.js'
import { TODAY, availability, capacityFor, scheduleDates, slotTimes, spacesLeft, spacesTaken } from '../../data/visits.js'

const BADGE = {
  available: ['●', 'Available', 'border-teal-dark bg-well-bg text-well'],
  limited: ['◆', 'Limited', 'border-rest bg-rest-bg text-rest'],
  full: ['✕', 'Fully Booked', 'border-dash bg-full-bg text-full'],
}
const BOOKING = { confirmed: '✓ Confirmed', in: '✓ In', cancelled: '✕ Cancelled' }
const nameOf = (id) => residents.find((r) => r.id === id).short
const order = (a, b) => slotTimes.indexOf(a.slot) - slotTimes.indexOf(b.slot)
const who = (b) => `${b.visitorName}${b.visitors > 1 ? ` +${b.visitors - 1}` : ''} → ${nameOf(b.residentId)}`

export default function StaffVisits() {
  const { bookings, slotCapacity, changeCapacity, checkIn } = useApp()
  const [dateKey, setDateKey] = useState(TODAY_ISO)
  const [scan, setScan] = useState(null) // null = closed, string = result message
  const today = bookings.filter((b) => b.dateLabel === TODAY && b.status !== 'cancelled').sort(order)
  const later = bookings.filter((b) => b.dateLabel !== TODAY && b.status !== 'visited')

  const simulateScan = () => {
    const next = today.find((b) => b.status === 'confirmed')
    if (next) checkIn(next.id)
    setScan(next ? `✓ Checked in: ${next.ref} · ${who(next)}` : 'No visitors waiting to check in.')
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h1 className="font-heading text-2xl font-bold">Today · {TODAY}</h1>
        <Button variant="outline" onClick={() => setScan('')}><ScanLine aria-hidden="true" />Scan pass</Button>
      </div>

      <section aria-label="Arriving today" className="space-y-2">
        <SectionLabel>Arriving today</SectionLabel>
        {today.length === 0 && <p className="rounded-xl border-2 border-dashed border-ink p-4 text-center text-muted">No visits today.</p>}
        {today.map((b) => (
          <article key={b.id} className="flex items-center gap-2 rounded-xl border-2 border-ink bg-white p-3">
            <div className="flex-1">
              <p className="text-lg leading-snug">{who(b)}</p>
              <p className="text-sm text-muted">{b.slot} · {b.ref}</p>
            </div>
            {b.status === 'in' ? <span className="font-bold text-well">✓ In</span> : <Button onClick={() => checkIn(b.id)}>Check in</Button>}
          </article>
        ))}
      </section>

      <section aria-label="Capacity by slot" className="space-y-2">
        <SectionLabel>Capacity by slot</SectionLabel>
        <label htmlFor="cap-date" className="sr-only">Date</label>
        <select id="cap-date" value={dateKey} onChange={(e) => setDateKey(e.target.value)} className="min-h-12 w-full rounded-xl border-2 border-ink bg-white px-3 text-lg">
          {scheduleDates.map((d) => <option key={d.key} value={d.key}>{d.label}{d.offset === 0 && ' (today)'}</option>)}
        </select>
        {slotTimes.map((t, i) => {
          const taken = spacesTaken(bookings, dateKey, i)
          const cap = capacityFor(slotCapacity, dateKey, i)
          const [sym, text, cls] = BADGE[availability(spacesLeft(bookings, slotCapacity, dateKey, i))]
          return (
            <div key={t} className="flex items-center gap-2 rounded-xl border-2 border-ink bg-white p-3">
              <div className="flex-1">
                <p className="font-heading text-lg font-bold leading-tight">{t}</p>
                <p><b>{taken}/{cap}</b> <span className={`ml-1 rounded-full border-2 px-2 text-sm font-bold ${cls}`}><span aria-hidden="true">{sym}</span> {text}</span></p>
              </div>
              <Button variant="outline" aria-label={`Reduce capacity for ${t}`} disabled={cap <= taken} onClick={() => changeCapacity(dateKey, i, cap, -1)} className="size-12 !p-0"><Minus aria-hidden="true" /></Button>
              <Button variant="outline" aria-label={`Increase capacity for ${t}`} disabled={cap >= 12} onClick={() => changeCapacity(dateKey, i, cap, 1)} className="size-12 !p-0"><Plus aria-hidden="true" /></Button>
            </div>
          )
        })}
      </section>

      <section aria-label="Upcoming bookings" className="space-y-2">
        <SectionLabel>Upcoming bookings</SectionLabel>
        {later.length === 0 && <p className="rounded-xl border-2 border-dashed border-ink p-4 text-center text-muted">No upcoming bookings yet.</p>}
        {later.map((b) => (
          <article key={b.id} className="flex items-center justify-between gap-2 rounded-xl border-2 border-ink bg-white p-3">
            <div>
              <p className="text-lg leading-snug">{b.dateLabel} · {b.slot}</p>
              <p className="text-sm text-muted">{who(b)} · {b.visitors} visitor{b.visitors > 1 && 's'}</p>
            </div>
            <span className={`shrink-0 text-sm font-bold ${b.status === 'cancelled' ? 'text-contact' : 'text-well'}`}>{BOOKING[b.status]}</span>
          </article>
        ))}
      </section>

      <BottomSheet open={scan !== null} onClose={() => setScan(null)} title="Scan visit pass">
        <div className="space-y-3">
          <p className="text-lg">Demo scanner: no camera is used. “Simulate scan” checks in the next waiting visitor.</p>
          {scan && <p role="status" className="rounded-xl border-2 border-well bg-well-bg p-3 text-lg text-well">{scan}</p>}
          <Button onClick={simulateScan} className="w-full"><ScanLine aria-hidden="true" />Simulate scan</Button>
        </div>
      </BottomSheet>
    </div>
  )
}
