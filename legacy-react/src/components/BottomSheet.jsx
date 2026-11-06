import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

// Modal sheet confined to the 480px app column. Esc / backdrop / ✕ close it; Tab is trapped inside.
export default function BottomSheet({ open, onClose, title, children }) {
  const ref = useRef(null)
  const closeRef = useRef(onClose)
  useEffect(() => { closeRef.current = onClose })

  useEffect(() => {
    if (!open) return
    const prev = document.activeElement
    const el = ref.current
    el.focus()
    const onKey = (e) => {
      if (e.key === 'Escape') return closeRef.current()
      if (e.key !== 'Tab') return
      const f = [...el.querySelectorAll('button,a[href],input,textarea,select,[tabindex]:not([tabindex="-1"])')].filter((n) => !n.disabled)
      if (!f.length) return
      const first = f[0], last = f[f.length - 1]
      if (e.shiftKey && (document.activeElement === first || document.activeElement === el)) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('keydown', onKey); prev?.focus?.() }
  }, [open])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex animate-fade items-end justify-center bg-ink/50" onClick={onClose}>
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90dvh] w-full max-w-[480px] animate-sheet overflow-y-auto rounded-t-3xl border-2 border-b-0 border-ink bg-paper p-4 outline-none"
      >
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="font-heading text-xl font-bold">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="grid size-12 place-items-center rounded-xl border-2 border-ink bg-white">
            <X aria-hidden="true" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
