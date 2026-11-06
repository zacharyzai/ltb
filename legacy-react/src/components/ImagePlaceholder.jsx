// Striped wireframe-style photo placeholder (no real resident photos in the prototype).
export default function ImagePlaceholder({ icon: Icon, label, className = 'h-40' }) {
  return (
    <div
      role="img"
      aria-label={label}
      className={`flex flex-col items-center justify-center gap-1 border-b-2 border-ink bg-[repeating-linear-gradient(45deg,#f2f2f2_0_5px,#ddd_5px_10px)] text-muted ${className}`}
    >
      {Icon && <Icon aria-hidden="true" size={36} />}
      <span className="rounded bg-white/80 px-2 text-sm">{label}</span>
    </div>
  )
}
