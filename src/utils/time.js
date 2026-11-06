// Singapore-time helpers. "Today" comes from an injectable clock so tests (and demos) are deterministic.
// Dates are ISO strings ('2026-11-12'), times are 'HH:mm', timestamps are UTC ISO strings. Formatting for display
// (weekday, month names) happens in the UI with Intl, never here.
const TZ = 'Asia/Singapore'
let clock = () => new Date()

// setNow(date | ISO string | () => Date) freezes or replaces the clock; setNow(null) restores the real one.
export const setNow = (source) => {
  clock = source == null ? () => new Date() : typeof source === 'function' ? source : () => new Date(source)
}
export const now = () => clock()

const dateFormat = new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' })
const timeFormat = new Intl.DateTimeFormat('en-GB', { timeZone: TZ, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })

export const isoDateOf = (date) => dateFormat.format(date) // the Singapore calendar date of an instant
export const timeOf = (date) => timeFormat.format(date) // 'HH:mm' in Singapore
export const todayISO = () => isoDateOf(now())
export const nowTime = () => timeOf(now())
export const nowIso = () => now().toISOString()

export const addDays = (iso, n) => {
  const d = new Date(`${iso}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}
export const dayOffset = (n) => addDays(todayISO(), n) // today + n days
export const daysBetween = (fromIso, toIso) => Math.round((Date.parse(`${toIso}T00:00:00Z`) - Date.parse(`${fromIso}T00:00:00Z`)) / 86400000)

// The UTC timestamp for a Singapore date + time.
export const at = (iso, hhmm) => new Date(`${iso}T${hhmm}:00+08:00`).toISOString()

export const isIsoDate = (s) => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && new Date(`${s}T00:00:00Z`).toISOString().slice(0, 10) === s
export const isTime = (s) => typeof s === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(s)

// 'morning' | 'afternoon' | 'evening' in Singapore, for greetings.
export const greetingPeriod = () => {
  const hour = Number(nowTime().slice(0, 2))
  return hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening'
}
