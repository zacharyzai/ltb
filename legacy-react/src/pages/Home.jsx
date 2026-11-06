import { Link } from 'react-router-dom'
import { ChevronRight, User } from 'lucide-react'
import { greeting } from '../data/dates.js'
import Button from '../components/Button.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import SectionLabel from '../components/SectionLabel.jsx'
import { useApp } from '../context/useApp.js'
import { caregiver, residents } from '../data/residents.js'

const resident = residents.find((r) => r.id === caregiver.residentId)

function ActionCard({ label, to, action, children }) {
  return (
    <section className="flex flex-wrap items-center gap-3 rounded-xl border-2 border-ink bg-white p-3">
      <div className="min-w-40 flex-1">
        <SectionLabel>{label}</SectionLabel>
        <p className="text-lg leading-snug">{children}</p>
      </div>
      <Button to={to} variant="outline" className="shrink-0">{action}</Button>
    </section>
  )
}

export default function Home() {
  const { statuses, moments, bookings, events } = useApp()
  const st = statuses[resident.id]
  const moment = moments.find((m) => m.residentIds.includes(resident.id))
  const visit = bookings.find((b) => b.status === 'confirmed' && b.residentId === resident.id)
  const event = events.find((e) => e.when === 'upcoming' && e.published)

  return (
    <div className="space-y-3">
      <div>
        <h1 className="font-heading text-2xl font-bold leading-tight">{greeting()}, {caregiver.firstName}!</h1>
        <p className="text-lg text-muted">Here's how your loved one is doing today.</p>
      </div>

      <section aria-label="Resident" className="space-y-2.5 rounded-2xl border-2 border-ink bg-tint p-3">
        <div className="flex items-center gap-3">
          <div aria-hidden="true" className="grid size-14 shrink-0 place-items-center rounded-full border-2 border-ink bg-[repeating-linear-gradient(45deg,#f2f2f2_0_5px,#ddd_5px_10px)]">
            <User className="text-muted" />
          </div>
          <div>
            <p className="font-heading text-xl font-bold leading-tight">{resident.name}</p>
            <p className="text-muted">{resident.code} · {resident.relation}</p>
          </div>
        </div>
        <StatusBadge status={st.status} />
        <p className="text-sm text-muted">Last updated: Today, {st.updatedAt}</p>
        <Button to="/moments" className="w-full">View Latest Moments</Button>
      </section>

      {moment && (
        <Link to="/moments" className="flex min-h-16 items-center gap-3 rounded-xl border-2 border-ink bg-white p-3 transition-[background-color,transform] duration-150 hover:bg-tint active:scale-[0.98]">
          <div aria-hidden="true" className="h-12 w-16 shrink-0 rounded-lg border-2 border-ink bg-[repeating-linear-gradient(45deg,#f2f2f2_0_5px,#ddd_5px_10px)]" />
          <div className="flex-1">
            <SectionLabel>Latest moment</SectionLabel>
            <p className="text-lg leading-snug">{moment.title} · {moment.time}</p>
          </div>
          <ChevronRight aria-hidden="true" />
          <span className="sr-only">Open moments</span>
        </Link>
      )}

      {visit ? (
        <ActionCard label="Upcoming visit" to="/visits" action="View Booking">{visit.dateLabel} · {visit.slot}</ActionCard>
      ) : (
        <ActionCard label="Upcoming visit" to="/visits/book" action="Book a Visit">No visit booked yet</ActionCard>
      )}

      {event && <ActionCard label="Community" to="/community" action="Explore Events">{event.title} · {event.date.split(' ').slice(1).join(' ')}</ActionCard>}
    </div>
  )
}
