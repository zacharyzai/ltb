import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ImagePlus, X } from 'lucide-react'
import Button from '../../components/Button.jsx'
import MicButton from '../../components/MicButton.jsx'
import MomentCard from '../../components/MomentCard.jsx'
import SectionLabel from '../../components/SectionLabel.jsx'
import { useApp } from '../../context/useApp.js'
import { residents } from '../../data/residents.js'

const CATEGORIES = ['Gardening', 'Music', 'Crafts']
const field = 'w-full rounded-xl border-2 border-ink bg-white px-3 py-2 text-lg'
const blank = { title: '', caption: '', category: '', residentIds: ['tan', 'lim'], image: null, consent: false }

export default function PostMoment() {
  const { addMoment } = useApp()
  const [f, setF] = useState(blank)
  const [preview, setPreview] = useState(false)
  const [done, setDone] = useState(false)
  // Object URLs are revoked when a photo is removed/replaced or the page is left unpublished.
  // A published moment keeps its URL for the rest of the session.
  const urlRef = useRef(null)
  const publishedRef = useRef(false)
  useEffect(() => () => { if (!publishedRef.current && urlRef.current) URL.revokeObjectURL(urlRef.current) }, [])
  const setImage = (url) => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current)
    urlRef.current = url
    set({ image: url })
  }
  const set = (changes) => setF((x) => ({ ...x, ...changes }))
  const toggle = (id) => set({ residentIds: f.residentIds.includes(id) ? f.residentIds.filter((x) => x !== id) : [...f.residentIds, id] })
  const valid = f.title.trim() && f.residentIds.length && f.consent
  const draft = { ...f, title: f.title.trim(), category: f.category || 'Activity', caption: f.caption.trim(), day: 'Today', time: 'Now' }

  const publish = () => {
    addMoment({ title: draft.title, caption: draft.caption, category: draft.category, residentIds: draft.residentIds, image: draft.image })
    publishedRef.current = true
    setDone(true)
  }
  const again = () => { urlRef.current = null; publishedRef.current = false; setF(blank); setPreview(false); setDone(false) }

  if (done) {
    return (
      <div className="space-y-3 text-center" role="status">
        <h1 className="font-heading text-2xl font-bold">Moment published</h1>
        <p className="rounded-xl border-2 border-well bg-well-bg p-3 text-lg text-well">✓ Shared with {f.residentIds.length} {f.residentIds.length === 1 ? 'family' : 'families'}. They can see it now.</p>
        <Button onClick={again} className="w-full">Post another moment</Button>
        <Button to="/staff" variant="outline" className="w-full">Back to dashboard</Button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Post a Moment</h1>
        <Link to="/staff" aria-label="Close and return to dashboard" className="grid size-12 place-items-center rounded-xl border-2 border-ink bg-white"><X aria-hidden="true" /></Link>
      </div>

      <section className="space-y-2">
        <SectionLabel>Photo (optional)</SectionLabel>
        {f.image ? (
          <div className="space-y-2">
            <img src={f.image} alt="Chosen photo preview" className="h-40 w-full rounded-xl border-2 border-ink object-cover" />
            <Button variant="outline" onClick={() => setImage(null)} className="w-full">Remove photo</Button>
          </div>
        ) : (
          <label className="flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-ink bg-white px-4 py-3 font-heading text-lg font-bold has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[#2a78d6]">
            <ImagePlus aria-hidden="true" />Take photo / Gallery
            <input type="file" accept="image/*" className="sr-only" onChange={(e) => e.target.files[0] && setImage(URL.createObjectURL(e.target.files[0]))} />
          </label>
        )}
        <p className="text-sm text-muted">Stays in this browser only. No photo? A placeholder is used.</p>
      </section>

      <fieldset className="space-y-2">
        <legend className="mb-2 font-heading text-sm font-bold uppercase tracking-wide text-muted">Who's in it? (tap all)</legend>
        <div className="flex flex-wrap gap-2">
          {residents.map((r) => (
            <button key={r.id} type="button" disabled={!r.photoConsent} aria-pressed={f.residentIds.includes(r.id)} onClick={() => toggle(r.id)}
              className={`min-h-12 rounded-full border-2 px-4 text-lg disabled:cursor-not-allowed disabled:border-dash disabled:bg-full-bg disabled:text-full ${f.residentIds.includes(r.id) ? 'border-ink bg-teal-dark text-white' : 'border-ink bg-white'}`}>
              {f.residentIds.includes(r.id) && '✓ '}{r.short}{!r.photoConsent && ' ⚠'}
              {!r.photoConsent && <span className="sr-only"> (no photo consent on file, cannot be tagged)</span>}
            </button>
          ))}
        </div>
        <p className="text-sm text-muted">⚠ = no photo consent on file. Can't be tagged; face must not be shown.</p>
      </fieldset>

      <div>
        <label htmlFor="m-title" className="mb-1 block font-bold">Title <span className="font-normal text-muted">(required)</span></label>
        <input id="m-title" value={f.title} onChange={(e) => set({ title: e.target.value })} className={field} placeholder="e.g. Morning Garden Walk" />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="m-caption" className="block font-bold">Caption</label>
        <textarea id="m-caption" rows={3} value={f.caption} onChange={(e) => set({ caption: e.target.value })} className={field} placeholder="A short, kind description" />
        <MicButton sample="Enjoyed some fresh air during today's garden walk." onResult={(t) => set({ caption: t })} />
      </div>

      <fieldset>
        <legend className="mb-2 font-bold">Category (optional)</legend>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button key={c} type="button" aria-pressed={f.category === c} onClick={() => set({ category: f.category === c ? '' : c })}
              className={`min-h-12 rounded-full border-2 border-ink px-4 text-lg ${f.category === c ? 'bg-teal-dark text-white' : 'bg-white'}`}>{c}</button>
          ))}
        </div>
      </fieldset>

      <label className="flex items-start gap-3 rounded-xl border-2 border-ink bg-tint p-3 text-lg">
        <input type="checkbox" checked={f.consent} onChange={(e) => set({ consent: e.target.checked })} className="mt-1 size-6 shrink-0 accent-teal-dark" />
        Everyone shown has photo consent. Visible only to their linked families.
      </label>

      {preview && <MomentCard moment={draft} />}

      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" onClick={() => setPreview((p) => !p)}>{preview ? 'Hide preview' : 'Preview'}</Button>
        <Button disabled={!valid} onClick={publish}>Publish to {f.residentIds.length}</Button>
      </div>
      {!valid && <p className="text-center text-sm text-muted">Add a title, tag at least one resident and tick the consent box.</p>}
    </div>
  )
}
