import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Type } from 'lucide-react'
import { useApp } from '../context/useApp.js'

const SIZE_LABEL = { md: 'Normal', lg: 'Large', xl: 'Extra large' }

export default function AppHeader() {
  const { textSize, cycleTextSize } = useApp()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const isStaff = pathname.startsWith('/staff')

  return (
    <header className="sticky top-0 z-40 bg-paper">
      <div className="flex items-center gap-2 border-b-[1.5px] border-dashed border-dash px-3.5 py-2.5">
        <Link to={isStaff ? '/staff' : '/'} className="flex min-h-12 flex-1 items-center gap-2">
          <span aria-hidden="true" className="grid size-8 place-items-center rounded-full border-2 border-ink bg-teal font-heading text-sm font-bold text-white">S</span>
          <span className="font-heading text-xl font-bold leading-tight">SAS Connect{isStaff && ' · Staff'}</span>
        </Link>
        <button
          type="button"
          onClick={cycleTextSize}
          aria-label={`Text size: ${SIZE_LABEL[textSize]}. Tap to change.`}
          className="flex min-h-12 min-w-12 items-center justify-center gap-1 rounded-xl border-2 border-ink bg-white px-2 font-bold"
        >
          <Type aria-hidden="true" size={18} />Aa
        </button>
        <span role="img" aria-label={isStaff ? 'Signed in as Nurse Aisha (demo)' : 'Signed in as Sarah Tan (demo)'} className="hidden size-10 shrink-0 place-items-center rounded-full border-2 border-ink bg-[#ddd] font-heading text-sm font-bold min-[360px]:grid">
          {isStaff ? 'NA' : 'ST'}
        </span>
      </div>
      <div className="flex items-center gap-2 border-b border-dash bg-tint px-3.5 py-1.5">
        <span className="text-sm text-muted">Demo view:</span>
        <div role="group" aria-label="Switch demo view" className="grid flex-1 grid-cols-2 overflow-hidden rounded-xl border-2 border-ink bg-white">
          {[['Caregiver View', '/', !isStaff], ['Staff View', '/staff', isStaff]].map(([label, to, on]) => (
            <button
              key={label}
              type="button"
              aria-pressed={on}
              onClick={() => !on && navigate(to)}
              className={`min-h-12 px-2 font-heading font-bold focus-visible:outline-offset-[-5px] ${on ? 'bg-teal-dark text-white focus-visible:outline-white' : 'hover:bg-tint'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </header>
  )
}
