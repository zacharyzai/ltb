import { useRef, useState } from 'react'
import { Pencil, Plus } from 'lucide-react'
import BottomSheet from '../../components/BottomSheet.jsx'
import Button from '../../components/Button.jsx'
import { useApp } from '../../context/useApp.js'

const field = 'min-h-12 w-full rounded-xl border-2 border-ink bg-white px-3 py-2 text-lg'
const blank = { title: '', iso: '', start: '10:00', end: '12:00', location: '', description: '', public: true }

function EventSheet({ editing, onClose, onSaved }) {
  const { saveEvent } = useApp()
  const form = useRef(null)
  const [f, setF] = useState(editing && editing !== 'new' ? editing : blank)
  const set = (k) => (e) => setF({ ...f, [k]: k === 'public' ? e.target.value === 'public' : e.target.value })
  const save = (published) => {
    saveEvent({ id: f.id, title: f.title.trim(), iso: f.iso, start: f.start, end: f.end, location: f.location.trim(), description: f.description.trim(), public: f.public, published })
    onSaved(published ? `“${f.title.trim()}” is published. Families can see it now.` : `“${f.title.trim()}” saved as a draft.`)
  }

  return (
    <BottomSheet open={!!editing} onClose={onClose} title={editing?.id ? 'Edit event' : 'New event'}>
      <form ref={form} onSubmit={(e) => { e.preventDefault(); save(true) }} className="space-y-3">
        <div><label htmlFor="ev-title" className="mb-1 block font-bold">Title <span className="font-normal text-muted">(required)</span></label><input id="ev-title" required value={f.title} onChange={set('title')} className={field} /></div>
        <div><label htmlFor="ev-date" className="mb-1 block font-bold">Date <span className="font-normal text-muted">(required)</span></label><input id="ev-date" type="date" required value={f.iso} onChange={set('iso')} className={field} /></div>
        <div className="grid grid-cols-2 gap-2">
          <div><label htmlFor="ev-start" className="mb-1 block font-bold">Starts <span className="font-normal text-muted">(required)</span></label><input id="ev-start" type="time" required value={f.start} onChange={set('start')} className={field} /></div>
          <div><label htmlFor="ev-end" className="mb-1 block font-bold">Ends <span className="font-normal text-muted">(required)</span></label><input id="ev-end" type="time" required value={f.end} onChange={set('end')} className={field} /></div>
        </div>
        <div><label htmlFor="ev-loc" className="mb-1 block font-bold">Place <span className="font-normal text-muted">(required)</span></label><input id="ev-loc" required value={f.location} onChange={set('location')} className={field} /></div>
        <div><label htmlFor="ev-desc" className="mb-1 block font-bold">Description</label><textarea id="ev-desc" rows={3} value={f.description} onChange={set('description')} className={field} /></div>
        <div>
          <label htmlFor="ev-aud" className="mb-1 block font-bold">Who is it for?</label>
          <select id="ev-aud" value={f.public ? 'public' : 'families'} onChange={set('public')} className={field}>
            <option value="public">Public (can be shared)</option>
            <option value="families">Residents &amp; families only</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" onClick={() => form.current.reportValidity() && save(false)}>Save draft</Button>
          <Button type="submit">Publish</Button>
        </div>
      </form>
    </BottomSheet>
  )
}

export default function StaffEvents() {
  const { events } = useApp()
  const [editing, setEditing] = useState(null) // null | 'new' | event
  const [notice, setNotice] = useState('')

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h1 className="font-heading text-2xl font-bold">Events</h1>
        <Button onClick={() => { setNotice(''); setEditing('new') }}><Plus aria-hidden="true" />New event</Button>
      </div>
      {notice && <p role="status" className="rounded-xl border-2 border-well bg-well-bg p-3 text-lg text-well">✓ {notice}</p>}

      {events.map((e) => (
        <article key={e.id} className="space-y-1.5 rounded-2xl border-2 border-ink bg-white p-3">
          <div className="flex items-start justify-between gap-2">
            <h2 className="font-heading text-xl font-bold leading-tight">{e.title}</h2>
            <span className={`shrink-0 rounded-full border-2 px-2.5 text-sm font-bold ${e.published ? 'border-well bg-well-bg text-well' : 'border-rest bg-rest-bg text-rest'}`}>{e.published ? '✓ Published' : '✎ Draft'}</span>
          </div>
          <p>{e.date} · {e.time}</p>
          <p className="text-sm text-muted">{e.location} · {e.public ? 'Public' : 'Families only'}{e.when === 'past' && ' · Past'}</p>
          <Button variant="outline" onClick={() => { setNotice(''); setEditing(e) }} className="w-full"><Pencil aria-hidden="true" size={18} />Edit</Button>
        </article>
      ))}

      <EventSheet key={editing?.id ?? editing} editing={editing} onClose={() => setEditing(null)} onSaved={(m) => { setNotice(m); setEditing(null) }} />
    </div>
  )
}
