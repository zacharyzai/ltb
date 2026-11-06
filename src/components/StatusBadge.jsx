import { STATUSES } from '../data/status.js'

export default function StatusBadge({ status }) {
  const s = STATUSES[status]
  return (
    <span className={`inline-flex min-h-8 items-center gap-1.5 rounded-full border-2 px-3 py-0.5 font-bold ${s.cls}`}>
      <span aria-hidden="true">{s.symbol}</span>
      {s.label}
    </span>
  )
}
