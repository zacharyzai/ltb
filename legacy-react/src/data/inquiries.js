// status: submitted | review | answered
import { fmtDate, isoIn } from './dates.js'

export const inquiries = [
  { id: 'q1', caregiverId: 'sarah', caregiverName: 'Sarah Tan', residentId: 'tan', topic: 'Health & comfort', time: '8:42 AM', question: "How has my mother's cough been today?", status: 'submitted', reply: null },
  { id: 'q2', caregiverId: 'lim-son', caregiverName: "Mr Lim's son", residentId: 'lim', topic: 'Meals', time: '7:58 AM', question: 'Can he have less salt in his meals?', status: 'review', reply: null },
  { id: 'q3', caregiverId: 'wong-dtr', caregiverName: "Mdm Wong's daughter", residentId: 'wong', topic: 'Belongings', time: '7:10 AM', question: 'Can I drop off a new cardigan this weekend?', status: 'submitted', reply: null },
  { id: 'q0', caregiverId: 'sarah', caregiverName: 'Sarah Tan', residentId: 'tan', topic: 'Visits', time: fmtDate(isoIn(-3)), question: 'Can I bring home-cooked porridge when I visit?', status: 'answered', reply: 'Yes, you are welcome to. Please let the nurse on duty know on arrival so we can check her diet plan.' },
]

export const INQUIRY_TOPICS = ['Health & comfort', 'Meals', 'Visits', 'Belongings', 'Something else']
