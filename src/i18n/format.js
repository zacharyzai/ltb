// Locale-aware display formatting with Intl. State holds ISO dates ('2026-11-12'), 'HH:mm' times and UTC timestamps;
// everything here turns them into words for the current language, in Singapore time.
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { addDays, isoDateOf, todayISO } from '../utils/time'

const INTL = { en: 'en-SG', zh: 'zh-SG', ms: 'ms-SG', ta: 'ta-SG' }
const TZ = 'Asia/Singapore'

export function makeFormat(locale) {
  const loc = INTL[locale] ?? INTL.en
  const onDate = (iso, opts) => new Intl.DateTimeFormat(loc, { timeZone: 'UTC', ...opts }).format(new Date(`${iso}T00:00:00Z`)) // calendar dates have no time zone
  const time = (hhmm) => new Intl.DateTimeFormat(loc, { timeZone: TZ, hour: 'numeric', minute: '2-digit' }).format(new Date(`2026-01-01T${hhmm}:00+08:00`))
  const stampTime = (ts) => new Intl.DateTimeFormat(loc, { timeZone: TZ, hour: 'numeric', minute: '2-digit' }).format(new Date(ts))
  return {
    dateShort: (iso) => onDate(iso, { weekday: 'short', day: 'numeric', month: 'short' }),
    dateLong: (iso) => onDate(iso, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
    weekdayShort: (iso) => onDate(iso, { weekday: 'short' }),
    monthShort: (iso) => onDate(iso, { month: 'short' }),
    monthYear: (iso) => onDate(iso, { month: 'long', year: 'numeric' }),
    // Just the number (Chinese would otherwise add the character 日), for calendar cells.
    dayNumber: (iso) => new Intl.DateTimeFormat(loc, { timeZone: 'UTC', day: 'numeric' }).formatToParts(new Date(`${iso}T00:00:00Z`)).find((p) => p.type === 'day').value,
    time,
    timeRange: (start, end) => `${time(start)} – ${time(end)}`,
    // A UTC timestamp as a Singapore calendar date and time of day.
    stampDate: (ts) => isoDateOf(new Date(ts)),
    stampTime,
    stampShort: (ts) => `${new Intl.DateTimeFormat(loc, { timeZone: TZ, day: 'numeric', month: 'short' }).format(new Date(ts))}, ${stampTime(ts)}`,
  }
}

// In a component: const fmt = useFormat(); then fmt.dateShort(iso), fmt.stamp(timestamp) in the template.
export function useFormat() {
  const { locale, t } = useI18n()
  return computed(() => {
    const f = makeFormat(locale.value)
    // "Today, 9:30 AM" / "Yesterday, 4:10 PM" / "12 Nov, 9:30 AM"
    const stamp = (ts) => {
      const day = f.stampDate(ts)
      if (day === todayISO()) return t('time.todayAt', { time: f.stampTime(ts) })
      if (day === addDays(todayISO(), -1)) return t('time.yesterdayAt', { time: f.stampTime(ts) })
      return f.stampShort(ts)
    }
    // "Today" / "Tomorrow" / a short date, for visit and event dates.
    const dayLabel = (iso) => (iso === todayISO() ? t('time.today') : iso === addDays(todayISO(), 1) ? t('time.tomorrow') : f.dateShort(iso))
    return { ...f, stamp, dayLabel }
  })
}
