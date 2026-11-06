import { Mic } from 'lucide-react'

// Demo only: no speech service is used; it inserts a canned transcription.
export default function MicButton({ sample, onResult }) {
  return (
    <button type="button" onClick={() => onResult(sample)} className="inline-flex min-h-12 items-center gap-1.5 rounded-xl border-2 border-ink bg-white px-3 font-bold hover:bg-tint">
      <Mic aria-hidden="true" size={20} />Speak (demo)
    </button>
  )
}
