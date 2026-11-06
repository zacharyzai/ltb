import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Plus, QrCode } from 'lucide-react'
import BottomSheet from '../components/BottomSheet.jsx'
import Button from '../components/Button.jsx'
import QRPass from '../components/QRPass.jsx'
import SectionLabel from '../components/SectionLabel.jsx'
import { useApp } from '../context/useApp.js'
import { caregiver, residents } from '../data/residents.js'

const nameOf = (id) => residents.find((r) => r.id === id).name

function Check({ label, defaultChecked }) {
  return (
    <label className="flex min-h-12 items-center gap-2 text-lg">
      <input type="checkbox" defaultChecked={defaultChecked} className="size-6 accent-teal-dark" />
      {label}
    </label>
  )
}

export default function Visits() {
  const { bookings, cancelBooking } = useApp()
  const navigate = useNavigate()
  const [pass, setPass] = useState(null)
  const [cancelling, setCancelling] = useState(null)
  const mine = bookings.filter((b) => b.residentId === caregiver.residentId)
  const upcoming = mine.filter((b) => b.status === 'confirmed')
  const past = mine.filter((b) => b.status !== 'confirmed')

  return (
    <div className="space-y-3">
      <h1 className="font-heading text-2xl font-bold">Visits</h1>

      {upcoming[0] && (
        <p className="flex items-start gap-2 rounded-xl border-2 border-rest bg-rest-bg p-3 text-lg text-rest">
          <Bell aria-hidden="true" className="mt-0.5 shrink-0" />
          Reminder: Your visit with Madam Tan is on {upcoming[0].dateLabel}, {upcoming[0].slot}.
        </p>
      )}

      <Button to="/visits/book" className="w-full"><Plus aria-hidden="true" />Book a Visit</Button>

      <section aria-label="Upcoming visits" className="space-y-2">
        <SectionLabel>Upcoming</SectionLabel>
        {upcoming.length === 0 && <p className="rounded-xl border-2 border-dashed border-ink p-4 text-center text-muted">No upcoming visits.</p>}
        {upcoming.map((b) => (
          <article key={b.id} className="space-y-2 rounded-2xl border-2 border-ink bg-white p-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-heading text-xl font-bold">{b.dateLabel}</h3>
              <span className="rounded-full border-2 border-well bg-well-bg px-2.5 text-sm font-bold text-well">✓ Confirmed</span>
            </div>
            <p className="text-lg">{b.slot} · {b.visitors} visitor{b.visitors > 1 && 's'}</p>
            <p className="text-muted">with {nameOf(b.residentId)}</p>
            <Button onClick={() => setPass(b)} className="w-full"><QrCode aria-hidden="true" />View Visit Pass</Button>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={() => navigate(`/visits/book?reschedule=${b.id}`)}>Reschedule</Button>
              <Button variant="danger" onClick={() => setCancelling(b)}>Cancel</Button>
            </div>
          </article>
        ))}
      </section>

      <section aria-label="Past visits" className="space-y-2">
        <SectionLabel>Past</SectionLabel>
        {past.map((b) => (
          <p key={b.id} className="flex items-center justify-between gap-2 rounded-xl border-[1.5px] border-ink bg-white p-3 text-lg">
            <span>{b.dateLabel} · {b.slot.replace(/ – .*? (AM|PM)$/, ' $1')}</span>
            <span className="text-muted">{b.status === 'cancelled' ? '✕ Cancelled' : '✓ Visited'}</span>
          </p>
        ))}
      </section>

      <section aria-label="Reminder preferences" className="rounded-xl border-2 border-ink bg-white p-3">
        <SectionLabel>Remind me by</SectionLabel>
        <div className="flex gap-6"><Check label="SMS" defaultChecked /><Check label="Website" defaultChecked /></div>
      </section>

      <BottomSheet open={!!pass} onClose={() => setPass(null)} title="Visit Pass">
        {pass && (
          <div className="space-y-3">
            <QRPass value={pass.ref} />
            <p className="text-center text-lg">{nameOf(pass.residentId)}<br />{pass.dateLabel} · {pass.slot} · {pass.visitors} visitor{pass.visitors > 1 && 's'}</p>
          </div>
        )}
      </BottomSheet>

      <BottomSheet open={!!cancelling} onClose={() => setCancelling(null)} title="Cancel this visit?">
        {cancelling && (
          <div className="space-y-3">
            <p className="text-lg">{cancelling.dateLabel}, {cancelling.slot}. The slot will be released for other families.</p>
            <Button variant="danger" className="w-full" onClick={() => { cancelBooking(cancelling.id); setCancelling(null) }}>Yes, cancel visit</Button>
            <Button variant="outline" className="w-full" onClick={() => setCancelling(null)}>Keep my visit</Button>
          </div>
        )}
      </BottomSheet>
    </div>
  )
}
