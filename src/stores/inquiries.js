import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { INQUIRY_TOPICS, MAX_QUESTION_LENGTH, buildInquiries } from '../data/inquiries'
import { fail, ok } from '../utils/result'
import { nowIso } from '../utils/time'
import { useResidentsStore } from './residents'

// Caregiver questions and staff replies. Status flow: pending -> in-review -> answered.
export const useInquiriesStore = defineStore('inquiries', () => {
  const inquiries = ref(buildInquiries())
  const residents = useResidentsStore()

  const newestFirst = (a, b) => b.createdAt.localeCompare(a.createdAt)
  const sorted = computed(() => [...inquiries.value].sort(newestFirst))
  const pending = computed(() => sorted.value.filter((q) => q.status !== 'answered')) // pending + in review: still needs a reply
  const answered = computed(() => sorted.value.filter((q) => q.status === 'answered'))
  const pendingCount = computed(() => pending.value.length)
  const byCaregiver = (caregiverId) => sorted.value.filter((q) => q.caregiverId === caregiverId)
  const byResident = (residentId) => sorted.value.filter((q) => q.residentId === residentId)
  const byId = (id) => inquiries.value.find((q) => q.id === id) ?? null

  function submitInquiry({ caregiverId, residentId, question, topic = 'other' }) {
    const text = String(question ?? '').trim()
    if (!text) return fail('EMPTY_QUESTION')
    if (text.length > MAX_QUESTION_LENGTH) return fail('QUESTION_TOO_LONG', { max: MAX_QUESTION_LENGTH })
    if (!residents.isLinked(caregiverId, residentId)) return fail('NOT_LINKED')
    const inquiry = {
      id: `iq-${Date.now().toString(36)}-${inquiries.value.length}`, seedKey: null, seeded: [], question: text,
      caregiverId, residentId, topic: INQUIRY_TOPICS.includes(topic) ? topic : 'other', createdAt: nowIso(), status: 'pending',
      reply: null, repliedAt: null, repliedBy: null,
    }
    inquiries.value.push(inquiry)
    return ok(inquiry)
  }

  function markInReview(id) {
    const inquiry = byId(id)
    if (!inquiry) return fail('NOT_FOUND')
    if (inquiry.status === 'answered') return fail('ALREADY_ANSWERED')
    inquiry.status = 'in-review'
    return ok(inquiry)
  }

  function replyToInquiry(id, reply, staffId = null) {
    const inquiry = byId(id)
    if (!inquiry) return fail('NOT_FOUND')
    if (inquiry.status === 'answered') return fail('ALREADY_ANSWERED')
    const text = String(reply ?? '').trim()
    if (!text) return fail('EMPTY_REPLY')
    Object.assign(inquiry, { status: 'answered', reply: text, repliedAt: nowIso(), repliedBy: staffId, seeded: inquiry.seeded.filter((f) => f !== 'reply') })
    return ok(inquiry)
  }

  return { inquiries, pending, answered, pendingCount, byCaregiver, byResident, byId, submitInquiry, markInReview, replyToInquiry }
})
