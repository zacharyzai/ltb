import { INQUIRY_STATUS } from '../data/status.js'

export default function InquiryChip({ status }) {
  const s = INQUIRY_STATUS[status]
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border-2 px-2.5 text-sm font-bold ${s.cls}`}>
      <span aria-hidden="true">{s.symbol}</span>{s.label}
    </span>
  )
}
