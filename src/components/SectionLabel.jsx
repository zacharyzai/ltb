export default function SectionLabel({ children, className = '' }) {
  return <h2 className={`font-heading text-sm font-bold uppercase tracking-wide text-muted ${className}`}>{children}</h2>
}
