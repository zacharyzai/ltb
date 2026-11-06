<!-- Two-week booking calendar. Past days, days outside the booking window and fully booked days are disabled.
     Each day shows a symbol as well as its number, and its full date + availability is its accessible name. -->
<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useFormat } from '../../i18n/format'
import { useVisitsStore } from '../../stores/visits'
import { addDays, todayISO } from '../../utils/time'

defineProps({ modelValue: { type: String, default: '' } })
const emit = defineEmits(['update:modelValue'])
const { t } = useI18n()
const fmt = useFormat()
const visits = useVisitsStore()
const SYMBOL = { available: '●', limited: '◆', full: '✕' }

// Whole Monday-to-Sunday weeks covering the booking window.
const days = computed(() => {
  const window = visits.bookingWindow()
  const dow = (iso) => (new Date(`${iso}T00:00:00Z`).getUTCDay() + 6) % 7
  const start = addDays(window[0], -dow(window[0]))
  const end = addDays(window.at(-1), 6 - dow(window.at(-1)))
  const list = []
  for (let d = start; d <= end; d = addDays(d, 1)) list.push(d)
  return list.map((date, i) => {
    const inWindow = window.includes(date)
    const usable = inWindow ? visits.slotsFor(date).filter((s) => !s.passed && s.level !== 'full') : []
    const level = !inWindow ? null : usable.length ? (usable.some((s) => s.level === 'available') ? 'available' : 'limited') : 'full'
    return { date, level, disabled: !inWindow || level === 'full', past: date < todayISO(), showMonth: i === 0 || date.endsWith('-01') }
  })
})
const heads = computed(() => days.value.slice(0, 7).map((d) => fmt.value.weekdayShort(d.date)))
const nameOf = (d) => {
  const status = d.past ? t('book.pastDate') : d.level ? t(`status.${d.level}`) : t('book.notYetOpen')
  return `${d.date === todayISO() ? `${t('time.today')}, ` : ''}${fmt.value.dateLong(d.date)}, ${status}`
}
</script>

<template>
  <div class="calendar" role="group" :aria-label="t('book.calendar')">
    <div class="grid">
      <span v-for="h in heads" :key="h" class="head" aria-hidden="true">{{ h }}</span>
      <button
        v-for="d in days"
        :key="d.date"
        type="button"
        class="day"
        :class="{ on: modelValue === d.date, today: d.date === todayISO() }"
        :disabled="d.disabled"
        :aria-pressed="modelValue === d.date"
        :data-month="d.showMonth ? fmt.monthShort(d.date) : null"
        :data-symbol="d.level ? SYMBOL[d.level] : null"
        :aria-label="nameOf(d)"
        @click="emit('update:modelValue', d.date)"
      >{{ fmt.dayNumber(d.date) }}</button>
    </div>
    <ul class="legend">
      <li v-for="level in ['available', 'limited', 'full']" :key="level"><span aria-hidden="true">{{ SYMBOL[level] }}</span> {{ t(`status.${level}`) }}</li>
    </ul>
  </div>
</template>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: var(--s-1);
}
.head {
  padding-bottom: var(--s-1);
  text-align: center;
  color: var(--color-text-muted);
  font: 600 var(--fs-small) / var(--lh-tight) var(--font-body);
}
.day {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: max(48px, 3.5rem);
  padding: var(--s-1) 0;
  border: 2px solid transparent;
  border-radius: var(--r-md);
  background: var(--color-card);
  color: var(--color-text);
  font: 600 var(--fs-body) / 1.1 var(--font-heading);
  cursor: pointer;
  transition: background-color var(--dur-fast);
}
.day:hover:not(:disabled) {
  background: var(--color-tint);
}
.day.today {
  border-color: var(--color-brand);
}
.day.on {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--color-on-primary);
}
.day:disabled {
  background: transparent;
  color: var(--color-text-muted);
  opacity: 0.7;
  cursor: not-allowed;
}
/* Month and availability symbol are decoration drawn by CSS, so the button's visible text is just the day number. */
.day::before {
  content: attr(data-month);
  font: 600 0.7rem / 1 var(--font-body);
  text-transform: uppercase;
}
.day::after {
  content: attr(data-symbol);
  font-size: 0.7rem;
  line-height: 1;
}
.legend {
  display: flex;
  flex-wrap: wrap;
  gap: var(--s-2) var(--s-4);
  margin: var(--s-3) 0 0;
  padding: 0;
  list-style: none;
  color: var(--color-text-muted);
  font-size: var(--fs-small);
}
</style>
