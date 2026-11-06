import { useState } from 'react'
import BottomSheet from '../../components/BottomSheet.jsx'
import Button from '../../components/Button.jsx'
import InquiryChip from '../../components/InquiryChip.jsx'
import Tabs from '../../components/Tabs.jsx'
import { useApp } from '../../context/useApp.js'
import { residents } from '../../data/residents.js'

const TABS = ['All', 'Pending', 'Answered']
const filters = { All: () => true, Pending: (q) => q.status !== 'answered', Answered: (q) => q.status === 'answered' }
const TEMPLATES = [
  'Thank you for checking in. Your loved one is doing well today.',
  'We have received your question and will provide an update when available.',
  'Please contact the nursing home directly if you would like to discuss this further.',
]
const nameOf = (id) => residents.find((r) => r.id === id).short

function ReplySheet({ inquiry, onClose }) {
  const { updateInquiry } = useApp()
  const [text, setText] = useState('')
  const [sent, setSent] = useState(false)
  const answered = inquiry?.status === 'answered'

  const send = (e) => {
    e.preventDefault()
    updateInquiry(inquiry.id, { status: 'answered', reply: text.trim() })
    setSent(true)
  }
  const close = () => { setText(''); setSent(false); onClose() }

  return (
    <BottomSheet open={!!inquiry} onClose={close} title={answered ? 'Reply' : 'Reply to caregiver'}>
      {inquiry && (
        <div className="space-y-3">
          <div className="rounded-xl border-2 border-ink bg-white p-3">
            <p className="text-sm text-muted">{inquiry.caregiverName} · re: {nameOf(inquiry.residentId)} · {inquiry.time}</p>
            <p className="text-lg">“{inquiry.question}”</p>
          </div>
          {sent && <p role="status" className="rounded-xl border-2 border-well bg-well-bg p-3 text-lg text-well">✓ Reply sent. The family can see it now.</p>}
          {answered ? (
            <>
              <p className="rounded-xl border-[1.5px] border-well bg-well-bg p-3 text-well"><b>Your reply:</b> {inquiry.reply}</p>
              <Button onClick={close} className="w-full">Done</Button>
            </>
          ) : (
            <form onSubmit={send} className="space-y-3">
              <fieldset className="space-y-1.5">
                <legend className="mb-1 font-bold">Quick replies (optional)</legend>
                {TEMPLATES.map((t) => (
                  <button key={t} type="button" onClick={() => setText(t)} className="min-h-12 w-full rounded-xl border-2 border-ink bg-white px-3 py-2 text-left hover:bg-tint">{t}</button>
                ))}
              </fieldset>
              <div>
                <label htmlFor="reply" className="mb-1 block font-bold">Your reply <span className="font-normal text-muted">(required)</span></label>
                <textarea id="reply" required rows={4} value={text} onChange={(e) => setText(e.target.value)} className="w-full rounded-xl border-2 border-ink bg-white px-3 py-2 text-lg" />
              </div>
              <Button type="submit" disabled={!text.trim()} className="w-full">Send reply</Button>
            </form>
          )}
        </div>
      )}
    </BottomSheet>
  )
}

export default function StaffInquiries() {
  const { inquiries, updateInquiry } = useApp()
  const [tab, setTab] = useState('All')
  const [openId, setOpenId] = useState(null)
  const list = inquiries.filter(filters[tab])
  const open = inquiries.find((q) => q.id === openId) ?? null

  const openReply = (q) => {
    if (q.status === 'submitted') updateInquiry(q.id, { status: 'review' })
    setOpenId(q.id)
  }

  return (
    <div className="space-y-3">
      <h1 className="font-heading text-2xl font-bold">Inquiries</h1>
      <Tabs tabs={TABS} value={tab} onChange={setTab} label="Inquiry filter" />
      {list.length === 0 && <p className="rounded-xl border-2 border-dashed border-ink p-4 text-center text-muted">Nothing here.</p>}
      {list.map((q) => (
        <article key={q.id} className="space-y-2 rounded-2xl border-2 border-ink bg-white p-3">
          <div className="flex items-start justify-between gap-2">
            <p className="font-bold">{q.caregiverName}<span className="block font-normal text-muted">re: {nameOf(q.residentId)} · {q.time}</span></p>
            <InquiryChip status={q.status} />
          </div>
          <p className="text-lg">“{q.question}”</p>
          <Button variant={q.status === 'answered' ? 'outline' : 'primary'} onClick={() => openReply(q)} className="w-full">{q.status === 'answered' ? 'View Reply' : 'Reply'}</Button>
        </article>
      ))}
      <ReplySheet key={openId} inquiry={open} onClose={() => setOpenId(null)} />
    </div>
  )
}
