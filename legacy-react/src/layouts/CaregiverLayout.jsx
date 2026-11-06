import { CalendarDays, HeartHandshake, MessageCircleHeart } from 'lucide-react'
import AppShell from './AppShell.jsx'

const tabs = [
  { to: '/moments', label: 'Moments & Inquiries', icon: MessageCircleHeart },
  { to: '/visits', label: 'Visits', icon: CalendarDays },
  { to: '/community', label: 'Community & Support', icon: HeartHandshake },
]

export default function CaregiverLayout() {
  return <AppShell tabs={tabs} navLabel="Caregiver navigation" />
}
