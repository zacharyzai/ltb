<!-- A visit booking: date, time, visitors, resident, reference and status. Actions go in the default slot. -->
<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useCaregiver } from '../../composables/useCaregiver'
import { useFormat } from '../../i18n/format'
import { SLOTS } from '../../data/visits'
import { todayISO } from '../../utils/time'
import { useResidentsStore } from '../../stores/residents'
import AppIcon from '../ui/AppIcon.vue'
import StatusBadge from '../ui/StatusBadge.vue'

const props = defineProps({
  booking: { type: Object, required: true },
  compact: { type: Boolean, default: false },
})
const { t } = useI18n()
const fmt = useFormat()
const { caregiver } = useCaregiver()
const residents = useResidentsStore()
const resident = computed(() => residents.byId(props.booking.residentId))
const slot = computed(() => SLOTS.find((s) => s.id === props.booking.slotId))
const relationship = computed(() => caregiver.value.relationships[props.booking.residentId])
</script>

<template>
  <article class="visit" :class="{ compact }">
    <div class="tile" aria-hidden="true">
      <span class="mon">{{ fmt.monthShort(booking.date) }}</span>
      <span class="num">{{ fmt.dayNumber(booking.date) }}</span>
    </div>
    <div class="info">
      <h3 class="when">{{ fmt.dateLong(booking.date) }}</h3>
      <p class="line"><AppIcon name="clock" :size="18" />{{ fmt.timeRange(slot.start, slot.end) }}</p>
      <p class="line"><AppIcon name="users" :size="18" />{{ t('visits.visitors', { n: booking.visitors }, booking.visitors) }}</p>
      <p class="line"><AppIcon name="heart" :size="18" /><span>{{ t('visits.with', { name: resident.shortName }) }}<span v-if="relationship" class="rel"> · {{ t(`relationship.${relationship}`) }}</span></span></p>
      <p class="badges">
        <span v-if="booking.date === todayISO() && booking.status === 'confirmed'" class="today">{{ t('time.today') }}</span>
        <StatusBadge :status="booking.status" />
        <span v-if="booking.checkedInAt" class="checked">✓ {{ t('checkIn.checkedIn') }}</span>
        <span class="ref">{{ booking.ref }}</span>
      </p>
      <div v-if="$slots.default" class="actions"><slot /></div>
    </div>
  </article>
</template>

<style scoped>
.visit {
  display: flex;
  gap: var(--s-4);
  padding: var(--s-5);
  background: var(--color-card);
  border: 1px solid var(--color-border);
  border-radius: var(--r-xl);
  box-shadow: var(--shadow-card);
}
.tile {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: none;
  width: 4.25rem;
  height: 4.5rem;
  border-radius: var(--r-lg);
  background: var(--color-tint-strong);
  color: var(--color-tint-text);
  font-family: var(--font-heading);
  line-height: 1.1;
}
.mon {
  font-size: var(--fs-small);
  font-weight: 600;
  text-transform: uppercase;
}
.num {
  font-size: var(--fs-h2);
  font-weight: 700;
}
.info {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: var(--s-1);
  min-width: 0;
}
.when {
  font-size: var(--fs-h3);
}
.line {
  display: flex;
  align-items: center;
  gap: var(--s-2);
  margin: 0;
}
.rel {
  color: var(--color-text-muted);
}
.badges {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--s-2) var(--s-3);
  margin: var(--s-2) 0 0;
}
.today {
  padding: 2px var(--s-3);
  border-radius: var(--r-pill);
  background: var(--color-sas-red-solid);
  color: var(--color-on-primary);
  font: 700 var(--fs-small) / var(--lh-tight) var(--font-body);
}
.checked {
  color: var(--color-success-text);
  font-weight: 600;
  font-size: var(--fs-small);
}
.ref {
  color: var(--color-text-muted);
  font-size: var(--fs-small);
}
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--s-2);
  margin-top: var(--s-3);
}
.compact .tile {
  width: 3.75rem;
  height: 4rem;
}
@media (max-width: 420px) {
  .visit {
    flex-direction: column;
  }
  .tile {
    flex-direction: row;
    gap: var(--s-2);
    width: auto;
    height: auto;
    padding: var(--s-2) var(--s-4);
    align-self: flex-start;
  }
}
</style>
