import { CalendarCheck, CalendarHeart, House, Inbox } from 'lucide-react'
import AppShell from './AppShell.jsx'

const tabs = [
  { to: '/staff', label: 'Home', icon: House, end: true },
  { to: '/staff/inquiries', label: 'Inquiries', icon: Inbox },
  { to: '/staff/visits', label: 'Visits', icon: CalendarCheck },
  { to: '/staff/events', label: 'Events', icon: CalendarHeart },
]

export default function StaffLayout() {
  return <AppShell tabs={tabs} navLabel="Staff navigation" />
}
