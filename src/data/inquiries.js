import { at, dayOffset } from '../utils/time'

export const INQUIRY_STATUSES = ['pending', 'in-review', 'answered'] // labels: inquiryStatus.<id>
export const INQUIRY_TOPICS = ['health', 'meals', 'visits', 'belongings', 'other'] // labels: topic.<id>
export const REPLY_TEMPLATES = ['t1', 't2', 't3'] // quick replies; words: replyTemplate.<id>
export const MAX_QUESTION_LENGTH = 500

const inquiry = (n, caregiverId, residentId, topic, offset, time, status, reply = null) => ({
  id: `iq-${n}`, seedKey: `inquiries.q${n}`, seeded: reply ? ['question', 'reply'] : ['question'], question: null,
  caregiverId, residentId, topic, createdAt: at(dayOffset(offset), time), status,
  reply: null, repliedAt: reply ? at(dayOffset(offset), reply) : null, repliedBy: reply ? 'st-aisha' : null,
})

export const buildInquiries = () => [
  inquiry(1, 'cg-sarah', 'res-tan', 'health', 0, '08:42', 'pending'),
  inquiry(2, 'cg-david', 'res-lim', 'meals', 0, '07:58', 'in-review'),
  inquiry(3, 'cg-huimin', 'res-wong', 'belongings', -1, '19:05', 'pending'),
  inquiry(4, 'cg-sarah', 'res-tan', 'visits', -3, '10:20', 'answered', '14:00'),
  inquiry(5, 'cg-nurul', 'res-rahim', 'health', -2, '09:10', 'answered', '11:30'),
]
