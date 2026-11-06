import { NavLink } from 'react-router-dom'

export default function BottomTabBar({ tabs, label }) {
  return (
    <nav aria-label={label} className="sticky bottom-0 z-40 grid border-t-2 border-ink bg-paper" style={{ gridTemplateColumns: `repeat(${tabs.length}, 1fr)` }}>
      {tabs.map(({ to, label, icon: Icon, end }, i) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `flex min-h-16 flex-col items-center justify-center gap-0.5 px-1 py-2 text-center text-[0.8rem] leading-tight ${i ? 'border-l-[1.5px] border-dashed border-dash' : ''} ${isActive ? 'bg-tint font-bold text-teal-dark' : 'text-ink'}`
          }
        >
          <Icon aria-hidden="true" size={24} />
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
