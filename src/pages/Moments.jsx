import { useState } from 'react'
import { MessageCircleQuestion } from 'lucide-react'
import Button from '../components/Button.jsx'
import BottomSheet from '../components/BottomSheet.jsx'
import InquiryChip from '../components/InquiryChip.jsx'
import MomentCard from '../components/MomentCard.jsx'
import SectionLabel from '../components/SectionLabel.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import { STATUSES } from '../data/status.js'
import Tabs from '../components/Tabs.jsx'
import { useApp } from '../context/useApp.js'
import { caregiver } from '../data/residents.js'
import { INQUIRY_TOPICS } from '../data/inquiries.js'

const TABS = ['Latest', 'This Week', 'All']
const filters = { Latest: (m) => m.dayOffset === 0, 'This Week': (m) => m.dayOffset < 7, All: () => true }
const field = 'w-full rounded-xl border-2 border-ink bg-white px-3 py-2 text-lg'

function AskSheet({ open, onClose }) {
  const { submitInquiry } = useApp()
  const [question, setQuestion] = useState('')
  const [topic, setTopic] = useState('')
  const [sent, setSent] = useState(false)

  const close = () => { onClose(); setSent(false); setQuestion(''); setTopic('') }
  const send = (e) => {
    e.preventDefault()
    submitInquiry({ topic, question: question.trim() })
    setSent(true)
  }

  return (
    <BottomSheet open={open} onClose={close} title="Ask the Care Team">
      {sent ? (
        <div className="space-y-3" role="status">
          <p className="rounded-xl border-2 border-well bg-well-bg p-3 text-lg text-well">
            ✓ Your question has been sent. The care team will reply here.
          </p>
          <Button onClick={close} className="w-full">Done</Button>
        </div>
      ) : (
        <form onSubmit={send} className="space-y-3">
          <div>
            <label htmlFor="q-text" className="mb-1 block font-bold">Your question <span className="font-normal text-muted">(required)</span></label>
            <textarea id="q-text" required rows={4} value={question} onChange={(e) => setQuestion(e.target.value)} className={field} placeholder="Type your question here…" />
          </div>
          <div>
            <label htmlFor="q-topic" className="mb-1 block font-bold">Topic (optional)</label>
            <select id="q-topic" value={topic} onChange={(e) => setTopic(e.target.value)} className={`${field} min-h-12`}>
              <option value="">Choose a topic</option>
              {INQUIRY_TOPICS.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <p className="text-sm text-muted">For urgent matters, please call the nursing home directly.</p>
          <Button type="submit" disabled={!question.trim()} className="w-full">Send</Button>
          {!question.trim() && <p className="text-center text-sm text-muted">Type your question above to enable Send.</p>}
        </form>
      )}
    </BottomSheet>
  )
}

export default function Moments() {
  const { statuses, moments, inquiries } = useApp()
  const [tab, setTab] = useState('Latest')
  const [asking, setAsking] = useState(false)
  const st = statuses[caregiver.residentId]
  const shown = moments.filter((m) => m.residentIds.includes(caregiver.residentId)).filter(filters[tab])
  const mine = inquiries.filter((q) => q.caregiverId === caregiver.id)

  return (
    <div className="space-y-3">
      <h1 className="font-heading text-2xl font-bold">Moments &amp; Inquiries</h1>

      <section aria-label="Today's well-being" className="space-y-2 rounded-2xl border-2 border-ink bg-tint p-3">
        <SectionLabel>Today's well-being</SectionLabel>
        <StatusBadge status={st.status} />
        <p className="text-muted">Last updated at {st.updatedAt} by the care team.</p>
        {st.note && <p className="rounded-lg border-[1.5px] border-ink bg-white p-2">Care team note: {st.note}</p>}
        <ul className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted" aria-label="What the symbols mean">
          {Object.values(STATUSES).map((s) => <li key={s.label}>{s.symbol} {s.label}</li>)}
        </ul>
        <p className="text-sm text-muted">General updates only. Does not replace direct communication about medical concerns.</p>
      </section>

      <Tabs tabs={TABS} value={tab} onChange={setTab} label="Moments filter" />

      <div className="space-y-3">
        {shown.length ? shown.map((m) => <MomentCard key={m.id} moment={m} />) : <p className="rounded-xl border-2 border-dashed border-ink p-4 text-center text-muted">No moments here yet.</p>}
      </div>

      <div className="space-y-1.5">
        <Button onClick={() => setAsking(true)} className="w-full"><MessageCircleQuestion aria-hidden="true" />Ask the Care Team</Button>
        <p className="text-center text-sm text-muted">For urgent matters, please call the nursing home directly.</p>
      </div>

      <section aria-label="Your questions" className="space-y-2">
        <SectionLabel>Your questions</SectionLabel>
        {mine.map((q) => (
          <article key={q.id} className="space-y-1.5 rounded-xl border-2 border-ink bg-white p-3">
            <div className="flex items-center justify-between gap-2">
              <InquiryChip status={q.status} />
              <span className="text-sm text-muted">{q.time}</span>
            </div>
            <p className="text-lg leading-snug">“{q.question}”</p>
            {q.reply && <p className="rounded-lg border-[1.5px] border-well bg-well-bg p-2 text-well"><b>Care team:</b> {q.reply}</p>}
          </article>
        ))}
      </section>

      <AskSheet open={asking} onClose={() => setAsking(false)} />
    </div>
  )
}
