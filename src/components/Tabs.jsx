export default function Tabs({ tabs, value, onChange, label }) {
  const onKeyDown = (e) => {
    const step = { ArrowRight: 1, ArrowLeft: -1 }[e.key]
    if (!step) return
    e.preventDefault()
    const next = tabs[(tabs.indexOf(value) + step + tabs.length) % tabs.length]
    onChange(next)
    e.currentTarget.querySelector(`[data-tab="${next}"]`).focus()
  }
  return (
    <div role="tablist" aria-label={label} onKeyDown={onKeyDown} className="grid auto-cols-fr grid-flow-col overflow-hidden rounded-xl border-2 border-ink bg-white">
      {tabs.map((t, i) => (
        <button
          key={t}
          data-tab={t}
          role="tab"
          type="button"
          tabIndex={value === t ? 0 : -1}
          aria-selected={value === t}
          onClick={() => onChange(t)}
          className={`min-h-12 px-2 font-heading font-bold transition-colors duration-150 ${i ? 'border-l-2 border-dashed border-dash' : ''} focus-visible:outline-offset-[-5px] ${value === t ? 'bg-teal-dark text-white focus-visible:outline-white' : 'hover:bg-tint'}`}
        >
          {t}
        </button>
      ))}
    </div>
  )
}
