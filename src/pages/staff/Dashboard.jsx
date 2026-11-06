import { Link } from 'react-router-dom'
import { Camera, CalendarCheck, ClipboardCheck, Inbox } from 'lucide-react'
import { greeting } from '../../data/dates.js'
import Button from '../../components/Button.jsx'
import InquiryChip from '../../components/InquiryChip.jsx'
import SectionLabel from '../../components/SectionLabel.jsx'
import { useApp } from '../../context/useApp.js'
import { TODAY, isActive } from '../../data/visits.js'
import { residents } from '../../data/residents.js'

function Tile({ to, value, label }) {
  return (
    <Link to={to} className="rounded-2xl border-2 border-ink bg-white p-3 transition-[background-color,transform] duration-150 hover:bg-tint active:scale-[0.98]">
      <span className="block font-heading text-3xl font-bold leading-none text-teal-dark">{value}</span>
      <span className="text-lg leading-tight">{label}</span>
    </Link>
  )
}

export default function Dashboard() {
  const { inquiries, statuses, bookings, events } = useApp()
  const pending = inquiries.filter((q) => q.status !== 'answered')
  const updated = residents.filter((r) => statuses[r.id].updatedAt).length
  const visitsToday = bookings.filter((b) => isActive(b) && b.dateLabel === TODAY).length
  const upcoming = events.filter((e) => e.published && e.when === 'upcoming').length

  return (
    <div className="space-y-3">
      <h1 className="font-heading text-2xl font-bold">{greeting()}, Nurse Aisha</h1>

      <div className="grid grid-cols-2 gap-2">
        <Tile to="/staff/inquiries" value={pending.length} label="Pending inquiries" />
        <Tile to="/staff/status" value={`${updated}/${residents.length}`} label="Status updates today" />
        <Tile to="/staff/visits" value={visitsToday} label="Visits today" />
        <Tile to="/staff/events" value={upcoming} label="Upcoming events" />
      </div>

      <section aria-label="Quick actions" className="space-y-2">
        <SectionLabel>Quick actions</SectionLabel>
        <div className="grid grid-cols-2 gap-2">
          <Button to="/staff/status" className="min-h-20 flex-col"><ClipboardCheck aria-hidden="true" />Update Resident Status</Button>
          <Button to="/staff/moment" className="min-h-20 flex-col"><Camera aria-hidden="true" />Post a Moment</Button>
          <Button to="/staff/inquiries" variant="outline" className="min-h-20 flex-col"><Inbox aria-hidden="true" />View Inquiries</Button>
          <Button to="/staff/visits" variant="outline" className="min-h-20 flex-col"><CalendarCheck aria-hidden="true" />Manage Visits &amp; Events</Button>
        </div>
      </section>

      <section aria-label="Needs reply" className="space-y-2">
        <SectionLabel>Needs reply</SectionLabel>
        {pending.length === 0 && <p className="rounded-xl border-2 border-dashed border-ink p-4 text-center text-muted">All caught up. No questions waiting.</p>}
        {pending.slice(0, 2).map((q) => (
          <article key={q.id} className="space-y-1.5 rounded-xl border-2 border-ink bg-white p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="font-bold">{q.caregiverName} <span className="font-normal text-muted">re: {residents.find((r) => r.id === q.residentId).short} · {q.time}</span></p>
              <InquiryChip status={q.status} />
            </div>
            <p className="text-lg">“{q.question}”</p>
            <Button to="/staff/inquiries" variant="outline" className="w-full">Reply</Button>
          </article>
        ))}
      </section>
    </div>
  )
}
