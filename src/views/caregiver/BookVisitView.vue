<!-- Four steps: choose a date, choose a time, review, confirmation (with a demo QR pass). Back keeps every choice.
     /visits/book?reschedule=<id> moves an existing booking through the same steps. -->
<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import AppButton from '../../components/ui/AppButton.vue'
import AppIcon from '../../components/ui/AppIcon.vue'
import PageHeader from '../../components/ui/PageHeader.vue'
import QrPass from '../../components/ui/QrPass.vue'
import StatusBadge from '../../components/ui/StatusBadge.vue'
import BookingCalendar from '../../components/domain/BookingCalendar.vue'
import BookingStepIndicator from '../../components/domain/BookingStepIndicator.vue'
import ResidentSwitcher from '../../components/domain/ResidentSwitcher.vue'
import { useCaregiver } from '../../composables/useCaregiver'
import { MAX_VISITORS, SLOTS } from '../../data/visits'
import { useFormat } from '../../i18n/format'
import { useResidentsStore } from '../../stores/residents'
import { useVisitsStore } from '../../stores/visits'
import { nowTime, todayISO } from '../../utils/time'

const { t } = useI18n()
const fmt = useFormat()
const route = useRoute()
const router = useRouter()
const { caregiver, selected } = useCaregiver()
const visits = useVisitsStore()
const residents = useResidentsStore()

// Rescheduling only applies to this caregiver's own confirmed booking; anything else falls back to a normal booking.
const existing = computed(() => {
  const b = route.query.reschedule ? visits.byId(String(route.query.reschedule)) : null
  return b && b.caregiverId === caregiver.value.id && b.status === 'confirmed' && !b.checkedInAt ? b : null
})
const resident = computed(() => (existing.value ? residents.byId(existing.value.residentId) : selected.value))

const step = ref(0) // 0 date, 1 time, 2 review, 3 confirmed
const date = ref('')
const slotId = ref('')
const visitors = ref(existing.value?.visitors ?? 2)
const problem = ref('')
const result = ref(null) // the booking once confirmed
const heading = ref(null)

const stepLabels = computed(() => ['book.step.date', 'book.step.time', 'book.step.review', 'book.step.confirmed'].map((k) => t(k)))

// Slots for the chosen date. When rescheduling, the booking's own spaces do not count against it.
const slots = computed(() =>
  date.value ? SLOTS.map((s) => ({ ...s, ...visits.availability(date.value, s.id, existing.value?.id), passed: date.value === todayISO() && s.end <= nowTime() })) : [],
)
const slot = computed(() => slots.value.find((s) => s.id === slotId.value) ?? null)
const maxVisitors = computed(() => (slot.value ? Math.min(MAX_VISITORS, slot.value.left) : MAX_VISITORS))

// Keep earlier choices when they are still valid; drop a time that does not exist on the new date.
watch(date, () => {
  problem.value = ''
  if (slot.value && (slot.value.left <= 0 || slot.value.passed)) slotId.value = ''
})
watch(slotId, () => {
  if (visitors.value > maxVisitors.value) visitors.value = Math.max(1, maxVisitors.value)
})
// Move keyboard and screen-reader focus to the new step's heading.
watch(step, async () => {
  await nextTick()
  heading.value?.focus()
})

const canNext = computed(() => (step.value === 0 ? !!date.value : step.value === 1 ? !!slotId.value : true))
const next = () => canNext.value && step.value < 2 && step.value++
const back = () => (step.value === 0 ? router.push('/visits') : step.value--)

function confirm() {
  problem.value = ''
  const details = { date: date.value, slotId: slotId.value, visitors: visitors.value }
  const res = existing.value
    ? visits.rescheduleBooking(existing.value.id, details)
    : visits.createBooking({ caregiverId: caregiver.value.id, residentId: resident.value.id, ...details })
  if (!res.ok) {
    problem.value = t(`errors.${res.error}`, res.params ?? {})
    return
  }
  result.value = res.value
  step.value = 3
}
</script>

<template>
  <PageHeader :title="existing ? t('pages.rescheduleVisit') : t('pages.bookVisit')" />
  <div class="flow">
    <BookingStepIndicator :steps="stepLabels" :current="step" />
    <ResidentSwitcher v-if="!existing && step < 3" caption="book.forWho" />

    <section v-if="resident" class="panel">
      <h2 ref="heading" tabindex="-1">{{ t('book.stepOf', { n: step + 1, total: 4 }) }}: {{ stepLabels[step] }}</h2>

      <!-- 1: date -->
      <template v-if="step === 0">
        <p class="help">{{ t('book.dateHelp') }}</p>
        <BookingCalendar v-model="date" />
      </template>

      <!-- 2: time -->
      <template v-else-if="step === 1">
        <p class="help">{{ t('book.timeHelp', { date: fmt.dateLong(date) }) }}</p>
        <fieldset class="slots">
          <legend class="visually-hidden">{{ stepLabels[1] }}</legend>
          <label v-for="s in slots" :key="s.id" class="slot" :class="{ off: s.left <= 0 || s.passed, on: slotId === s.id }">
            <input v-model="slotId" class="visually-hidden" type="radio" name="slot" :value="s.id" :disabled="s.left <= 0 || s.passed" />
            <span class="time">{{ fmt.timeRange(s.start, s.end) }}</span>
            <span class="meta">
              <StatusBadge :status="s.passed ? 'full' : s.level" />
              <span v-if="s.passed" class="left">{{ t('book.slotPassed') }}</span>
              <span v-else-if="s.left > 0" class="left">{{ t('book.spacesLeft', { n: s.left }, s.left) }}</span>
            </span>
          </label>
        </fieldset>
      </template>

      <!-- 3: review -->
      <template v-else-if="step === 2">
        <p class="help">{{ t('book.reviewHelp') }}</p>
        <dl class="review">
          <div><dt>{{ t('book.resident') }}</dt><dd>{{ resident.name }}</dd></div>
          <div><dt>{{ t('book.date') }}</dt><dd>{{ fmt.dateLong(date) }}</dd></div>
          <div><dt>{{ t('book.time') }}</dt><dd>{{ fmt.timeRange(slot.start, slot.end) }}</dd></div>
          <div>
            <dt id="visitors-label">{{ t('book.visitors') }}</dt>
            <dd>
              <div class="stepper" role="group" aria-labelledby="visitors-label">
                <button type="button" class="round" :aria-label="t('book.fewer')" :disabled="visitors <= 1" @click="visitors--"><AppIcon name="minus" /></button>
                <output class="count" aria-live="polite">{{ visitors }}</output>
                <button type="button" class="round" :aria-label="t('book.more')" :disabled="visitors >= maxVisitors" @click="visitors++"><AppIcon name="plus" /></button>
              </div>
            </dd>
          </div>
        </dl>
        <p class="help">{{ t('book.maxNote', { max: maxVisitors }) }}</p>
        <p v-if="problem" class="problem" role="alert">⚠ {{ problem }}</p>
      </template>

      <!-- 4: confirmed -->
      <template v-else>
        <div class="done" role="status">
          <span class="ok pop-in"><AppIcon name="check" :size="30" :stroke="3" /></span>
          <p class="msg">{{ existing ? t('book.rescheduled') : t('book.confirmed') }}</p>
          <p class="who">{{ resident.name }}<br />{{ fmt.dateLong(result.date) }}<br />{{ fmt.timeRange(SLOTS.find((s) => s.id === result.slotId).start, SLOTS.find((s) => s.id === result.slotId).end) }}<br />{{ t('visits.visitors', { n: result.visitors }, result.visitors) }}</p>
          <p class="ref"><span>{{ t('book.reference') }}</span> <strong>{{ result.ref }}</strong></p>
          <QrPass :value="result.ref" />
          <AppButton to="/visits">{{ t('book.backToVisits') }}</AppButton>
        </div>
      </template>

      <div v-if="step < 3" class="nav">
        <AppButton variant="secondary" @click="back"><AppIcon name="arrow-left" :size="20" />{{ step === 0 ? t('dialog.cancel') : t('book.back') }}</AppButton>
        <AppButton v-if="step < 2" :disabled="!canNext" @click="next">{{ t('book.next') }}<AppIcon name="arrow-right" :size="20" /></AppButton>
        <AppButton v-else @click="confirm">{{ existing ? t('book.confirmMove') : t('book.confirm') }}</AppButton>
      </div>
    </section>
  </div>
</template>

<style scoped>
.flow {
  max-width: 40rem;
}
.panel {
  display: flex;
  flex-direction: column;
  gap: var(--s-4);
  padding: var(--s-5);
  background: var(--color-card);
  border: 1px solid var(--color-border);
  border-radius: var(--r-xl);
  box-shadow: var(--shadow-card);
}
h2 {
  font-size: var(--fs-h3);
}
.help {
  margin: 0;
  color: var(--color-text-muted);
}
.slots {
  display: flex;
  flex-direction: column;
  gap: var(--s-3);
  margin: 0;
  padding: 0;
  border: 0;
}
.slot {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--s-2) var(--s-4);
  min-height: var(--hit);
  padding: var(--s-3) var(--s-4);
  border: 2px solid var(--color-control-border);
  border-radius: var(--r-lg);
  background: var(--color-card);
  cursor: pointer;
}
.slot:hover:not(.off) {
  background: var(--color-tint);
}
.slot.on {
  border-color: var(--color-primary);
  background: var(--color-tint-strong);
}
.slot.off {
  border-color: var(--color-border-strong);
  background: var(--color-surface-2);
  cursor: not-allowed;
}
.slot:has(input:focus-visible) {
  outline: var(--focus-ring);
  outline-offset: 2px;
}
.time {
  font: 600 var(--fs-lead) / var(--lh-tight) var(--font-heading);
}
.meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--s-2) var(--s-3);
}
.left {
  color: var(--color-text-muted);
  font-size: var(--fs-small);
}
.review {
  display: grid;
  gap: var(--s-3);
  margin: 0;
}
.review > div {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--s-2);
  padding-bottom: var(--s-3);
  border-bottom: 1px solid var(--color-border);
}
dt {
  color: var(--color-text-muted);
  font-weight: 600;
}
dd {
  margin: 0;
  font: 600 var(--fs-lead) / var(--lh-tight) var(--font-heading);
}
.stepper {
  display: flex;
  align-items: center;
  gap: var(--s-3);
}
.count {
  min-width: 2ch;
  text-align: center;
}
.round {
  display: grid;
  place-items: center;
  width: var(--hit);
  height: var(--hit);
  border: 2px solid var(--color-control-border);
  border-radius: var(--r-pill);
  background: var(--color-card);
  color: var(--color-text);
  cursor: pointer;
}
.round:hover:not(:disabled) {
  background: var(--color-tint);
}
.round:disabled {
  background: var(--status-full-bg);
  color: var(--status-full-fg);
  cursor: not-allowed;
}
.problem {
  margin: 0;
  padding: var(--s-3);
  border-radius: var(--r-md);
  background: var(--color-danger-bg);
  color: var(--color-danger-text);
  font-weight: 600;
}
.nav {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: var(--s-3);
  margin-top: var(--s-2);
}
.done {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--s-3);
  text-align: center;
}
.ok {
  display: grid;
  place-items: center;
  width: 4rem;
  height: 4rem;
  border-radius: var(--r-pill);
  background: var(--color-success-bg);
  color: var(--color-success-text);
}
.msg {
  margin: 0;
  font: 600 var(--fs-h3) / var(--lh-tight) var(--font-heading);
}
.who {
  margin: 0;
  font-size: var(--fs-lead);
}
.ref {
  margin: 0;
  color: var(--color-text-muted);
}
.ref strong {
  color: var(--color-text);
}
</style>
