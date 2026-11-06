import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, X } from 'lucide-react'
import Button from '../../components/Button.jsx'
import MicButton from '../../components/MicButton.jsx'
import SectionLabel from '../../components/SectionLabel.jsx'
import { useApp } from '../../context/useApp.js'
import { residents } from '../../data/residents.js'
import { STATUSES } from '../../data/status.js'

export default function StatusUpdate() {
  const { statuses, updateStatus } = useApp()
  const [id, setId] = useState(() => residents.find((r) => !statuses[r.id].updatedAt)?.id ?? residents[0].id)
  const [status, setStatus] = useState(statuses[id].status)
  const [note, setNote] = useState('')
  const [query, setQuery] = useState('')
  const [saved, setSaved] = useState('')

  const resident = residents.find((r) => r.id === id)
  const shown = residents.filter((r) => `${r.name} ${r.code}`.toLowerCase().includes(query.toLowerCase()))
  const choose = (r) => { setId(r.id); setStatus(statuses[r.id].status); setNote(''); setSaved('') }
  const next = residents.find((r) => r.id !== id && !statuses[r.id].updatedAt)

  const save = () => {
    updateStatus(id, status, note.trim())
    setSaved(`Saved: ${resident.short} is “${STATUSES[status].label}”. Family can see it now.`)
    if (next) { setId(next.id); setStatus(statuses[next.id].status); setNote('') }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Update Status</h1>
        <Link to="/staff" aria-label="Close and return to dashboard" className="grid size-12 place-items-center rounded-xl border-2 border-ink bg-white"><X aria-hidden="true" /></Link>
      </div>

      <div className="relative">
        <label htmlFor="res-search" className="sr-only">Search resident or bed number</label>
        <Search aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={20} />
        <input id="res-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search resident or bed no." className="min-h-12 w-full rounded-xl border-2 border-ink bg-white pl-10 pr-3 text-lg" />
      </div>

      <section aria-label="My ward" className="space-y-2">
        <SectionLabel>My ward</SectionLabel>
        <div className="flex flex-wrap gap-2">
          {shown.map((r) => (
            <button key={r.id} type="button" aria-pressed={r.id === id} onClick={() => choose(r)}
              className={`min-h-12 rounded-full border-2 border-ink px-4 text-lg ${r.id === id ? 'bg-teal-dark text-white' : 'bg-white hover:bg-tint'}`}>
              {r.short} {statuses[r.id].updatedAt ? '✓' : ''}
              <span className="sr-only">{statuses[r.id].updatedAt ? ' (updated today)' : ' (not yet updated today)'}</span>
            </button>
          ))}
          {shown.length === 0 && <p className="text-muted">No resident found.</p>}
        </div>
        <p className="text-sm text-muted">✓ = already updated today</p>
      </section>

      <fieldset className="space-y-2">
        <legend className="mb-2 font-heading text-lg font-bold">How is {resident.short} today?</legend>
        {Object.entries(STATUSES).map(([key, s]) => (
          <label key={key} className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-xl border-2 px-3 text-lg font-bold ${s.cls} ${status === key ? 'ring-4 ring-ink/30' : 'bg-white'}`}>
            <input type="radio" name="status" value={key} checked={status === key} onChange={() => setStatus(key)} className="size-6 accent-teal-dark" />
            <span aria-hidden="true">{s.symbol}</span>{s.label}{status === key && <span className="ml-auto">✓</span>}
          </label>
        ))}
      </fieldset>

      <div className="space-y-1.5">
        <label htmlFor="note" className="block font-bold">Note (optional)</label>
        <textarea id="note" rows={2} value={note} onChange={(e) => setNote(e.target.value)} className="w-full rounded-xl border-2 border-ink bg-white px-3 py-2 text-lg" placeholder="e.g. Had a good breakfast" />
        <MicButton sample="Had a good breakfast and joined morning exercises." onResult={setNote} />
      </div>

      {saved && <p role="status" className="rounded-xl border-2 border-well bg-well-bg p-3 text-lg text-well">✓ {saved}</p>}

      <Button onClick={save} className="w-full">{next ? 'Save & next resident →' : 'Save'}</Button>
    </div>
  )
}
