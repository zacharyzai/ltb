<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import AppButton from '../../components/ui/AppButton.vue'
import AppCard from '../../components/ui/AppCard.vue'
import AppDialog from '../../components/ui/AppDialog.vue'
import AppIcon from '../../components/ui/AppIcon.vue'
import EmptyState from '../../components/ui/EmptyState.vue'
import FormField from '../../components/ui/FormField.vue'
import SectionHeader from '../../components/ui/SectionHeader.vue'
import StatusBadge from '../../components/ui/StatusBadge.vue'
import VisitCard from '../../components/domain/VisitCard.vue'
import { caregivers } from '../../data/caregivers'
import { MAX_CAPACITY } from '../../data/visits'
import { useFormat } from '../../i18n/format'
import { useToast } from '../../composables/useToast'
import { useVisitsStore } from '../../stores/visits'
import { todayISO } from '../../utils/time'

const { t } = useI18n()
const fmt = useFormat()
const visits = useVisitsStore()
const { notify } = useToast()

const nameOf = (b) => caregivers.find((c) => c.id === b.caregiverId)?.name
const later = computed(() => visits.upcoming.filter((b) => b.date > todayISO()))

const showError = (result) => notify(t(`errors.${result.error}`, result.params ?? {}), { kind: 'error' })
function checkIn(booking) {
  const result = visits.checkInVisitor(booking.id)
  if (result.ok) notify(t('staff.ve.checkedToast', { name: nameOf(booking) }))
  else showError(result)
  return result
}

// Demo QR scan: no camera; staff type the reference printed on the visitor's pass.
const scanning = ref(false)
const passRef = ref('')
const scanError = ref('')
function scan() {
  scanError.value = ''
  const booking = visits.bookings.find((b) => b.ref.toLowerCase() === passRef.value.trim().toLowerCase())
  if (!booking) {
    scanError.value = t('staff.ve.scanNone')
    return
  }
  const result = visits.checkInVisitor(booking.id)
  if (!result.ok) {
    scanError.value = t(`errors.${result.error}`, result.params ?? {})
    return
  }
  notify(t('staff.ve.checkedToast', { name: nameOf(booking) }))
  scanning.value = false
  passRef.value = ''
}

const date = ref(todayISO())
const dateOptions = computed(() => visits.bookingWindow().map((d) => ({ value: d, label: fmt.value.dateLong(d) })))
const slots = computed(() => visits.slotsFor(date.value))
function setCapacity(slot, next) {
  const result = visits.updateSlotCapacity(date.value, slot.id, next)
  if (result.ok) notify(t('staff.ve.capacityToast'))
  else showError(result)
}
const slotName = (s) => fmt.value.timeRange(s.start, s.end)
</script>

<template>
  <div class="stack">
    <section :aria-label="t('staff.ve.today')">
      <SectionHeader :title="t('staff.ve.today')">
        <template #action><AppButton variant="secondary" @click="scanning = true"><AppIcon name="qr" />{{ t('staff.ve.scan') }}</AppButton></template>
      </SectionHeader>
      <div v-if="visits.todays.length" class="cards">
        <VisitCard v-for="b in visits.todays" :key="b.id" :booking="b" :visitor="nameOf(b)">
          <AppButton v-if="!b.checkedInAt" :aria-label="t('staff.ve.checkInFor', { name: nameOf(b) })" @click="checkIn(b)"><AppIcon name="check" :size="20" :stroke="3" />{{ t('staff.ve.checkIn') }}</AppButton>
        </VisitCard>
      </div>
      <EmptyState v-else icon="calendar" :title="t('staff.ve.noToday')" />
    </section>

    <section :aria-label="t('staff.ve.capacity')">
      <SectionHeader :title="t('staff.ve.capacity')" />
      <AppCard>
        <p class="help">{{ t('staff.ve.capacityHelp') }}</p>
        <FormField v-model="date" type="select" :options="dateOptions" :label="t('staff.ve.date')" />
        <ul class="slots">
          <li v-for="s in slots" :key="s.id" class="slot">
            <div class="info">
              <strong>{{ slotName(s) }}</strong>
              <StatusBadge :status="s.level" />
              <span class="help">{{ t('staff.ve.slotCount', { taken: s.taken, capacity: s.capacity }) }}</span>
            </div>
            <div class="stepper" role="group" :aria-label="slotName(s)">
              <button type="button" class="step" :aria-label="t('staff.ve.decrease', { slot: slotName(s) })" :disabled="s.capacity <= 0" @click="setCapacity(s, s.capacity - 1)"><AppIcon name="minus" /></button>
              <span class="count">{{ t('staff.ve.capacityValue', { n: s.capacity }) }}</span>
              <button type="button" class="step" :aria-label="t('staff.ve.increase', { slot: slotName(s) })" :disabled="s.capacity >= MAX_CAPACITY" @click="setCapacity(s, s.capacity + 1)"><AppIcon name="plus" /></button>
            </div>
          </li>
        </ul>
      </AppCard>
    </section>

    <section :aria-label="t('staff.ve.upcoming')">
      <SectionHeader :title="t('staff.ve.upcoming')" />
      <div v-if="later.length" class="cards">
        <VisitCard v-for="b in later" :key="b.id" :booking="b" :visitor="nameOf(b)" compact />
      </div>
      <EmptyState v-else icon="calendar" :title="t('staff.ve.noUpcoming')" />
    </section>
  </div>

  <AppDialog v-model="scanning" :title="t('staff.ve.scan')">
    <form class="scan" novalidate @submit.prevent="scan">
      <p class="help">{{ t('staff.ve.scanHelp') }}</p>
      <FormField v-model="passRef" :label="t('staff.ve.scanRef')" :placeholder="t('staff.ve.scanPlaceholder')" :error="scanError" required autofocus />
      <div class="actions">
        <AppButton variant="secondary" @click="scanning = false">{{ t('dialog.cancel') }}</AppButton>
        <AppButton type="submit">{{ t('staff.ve.checkIn') }}</AppButton>
      </div>
    </form>
  </AppDialog>
</template>

<style scoped>
.stack {
  display: flex;
  flex-direction: column;
  gap: var(--s-8);
}
.cards {
  display: grid;
  gap: var(--s-4);
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 24rem), 1fr));
}
.help {
  margin: 0;
  color: var(--color-text-muted);
  font-size: var(--fs-small);
}
.slots {
  display: flex;
  flex-direction: column;
  gap: var(--s-3);
  margin: 0;
  padding: 0;
  list-style: none;
}
.slot {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--s-3);
  padding: var(--s-3) var(--s-4);
  border: 1px solid var(--color-border);
  border-radius: var(--r-lg);
}
.info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--s-1);
}
.stepper {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--s-2);
}
.step {
  display: grid;
  place-items: center;
  width: var(--hit);
  height: var(--hit);
  border: 2px solid var(--color-primary-text);
  border-radius: var(--r-md);
  background: var(--color-card);
  color: var(--color-primary-text);
  cursor: pointer;
}
.step:hover {
  background: var(--color-tint);
}
.step:disabled {
  border-color: var(--status-full-border);
  color: var(--status-full-fg);
  cursor: not-allowed;
}
.count {
  min-width: 5rem;
  text-align: center;
  font-weight: 600;
}
.scan {
  display: flex;
  flex-direction: column;
  gap: var(--s-4);
}
.actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: var(--s-3);
}
</style>
