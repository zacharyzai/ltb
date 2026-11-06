import { Link } from 'react-router-dom'

const variants = {
  primary: 'bg-teal text-white border-ink hover:bg-teal-dark',
  outline: 'bg-white text-ink border-ink hover:bg-tint',
  danger: 'bg-white text-contact border-contact hover:bg-contact-bg',
}

// Pass `to` for an in-app link or `href` for an external one. Text is ≥1.15rem bold so
// white-on-#2a8c82 (4.06:1) qualifies as WCAG "large text".
export default function Button({ variant = 'primary', className = '', to, href, ...props }) {
  const cls = `inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border-2 px-4 py-2 text-center font-heading text-[1.15rem] font-bold transition-[background-color,transform] duration-150 active:scale-[0.98] disabled:cursor-not-allowed disabled:border-dash disabled:bg-full-bg disabled:text-full disabled:active:scale-100 ${variants[variant]} ${className}`
  if (to) return <Link to={to} className={cls} {...props} />
  if (href) return <a href={href} target="_blank" rel="noopener noreferrer" className={cls} {...props} />
  return <button type="button" className={cls} {...props} />
}
