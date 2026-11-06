// "Today" comes from the browser clock in Singapore time; all mock dates are offsets from it.
const TZ = 'Asia/Singapore'
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export const TODAY_ISO = new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(new Date())

export const addDays = (iso, n) => {
  const d = new Date(`${iso}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}
export const isoIn = (n) => addDays(TODAY_ISO, n)

export const fmtDate = (iso) => {
  const d = new Date(`${iso}T00:00:00Z`)
  return `${DAYS[d.getUTCDay()]} ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`
}
const t12 = (t) => { const [h, m] = t.split(':'); return `${h % 12 || 12}:${m} ${h < 12 ? 'AM' : 'PM'}` }
export const fmtTime = (start, end) => `${t12(start)} – ${t12(end)}`

// n days ago: "Today", "Yesterday", then "Mon 9 Nov"
export const dayLabel = (n) => (n === 0 ? 'Today' : n === 1 ? 'Yesterday' : fmtDate(isoIn(-n)))

export const nowTime = () =>
  new Date().toLocaleTimeString('en-SG', { hour: 'numeric', minute: '2-digit', timeZone: TZ }).replace(/\s/g, ' ').toUpperCase()

export const greeting = () => {
  const h = Number(new Intl.DateTimeFormat('en-GB', { hour: 'numeric', hour12: false, timeZone: TZ }).format(new Date())) % 24
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'
}
