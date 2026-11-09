<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import AppButton from '../../components/ui/AppButton.vue'
import AppCard from '../../components/ui/AppCard.vue'
import AppIcon from '../../components/ui/AppIcon.vue'
import GuideOffer from '../../components/guide/GuideOffer.vue'
import PageHeader from '../../components/ui/PageHeader.vue'
import SectionHeader from '../../components/ui/SectionHeader.vue'
import StatCard from '../../components/domain/StatCard.vue'
import { caregivers } from '../../data/caregivers'
import { SLOTS } from '../../data/visits'
import { useFormat } from '../../i18n/format'
import { useEventsStore } from '../../stores/events'
import { useInquiriesStore } from '../../stores/inquiries'
import { useResidentsStore } from '../../stores/residents'
import { useUiStore } from '../../stores/ui'
import { useVisitsStore } from '../../stores/visits'

const { t } = useI18n()
const fmt = useFormat()
const residents = useResidentsStore()
const inquiries = useInquiriesStore()
const visits = useVisitsStore()
const events = useEventsStore()
const ui = useUiStore()

const NEEDS_LIMIT = 3
const checkedIn = computed(() => visits.todays.filter((b) => b.checkedInAt).length)
const toCheckIn = computed(() => visits.todays.filter((b) => !b.checkedInAt))
const nameOf = (id) => caregivers.find((c) => c.id === id)?.name
const allClear = computed(() => !inquiries.pendingCount && !residents.notUpdatedToday.length && !toCheckIn.value.length)
</script>

<template>
  <PageHeader :title="t('pages.staffDashboard')">{{ t('staff.dash.intro') }}
    <template #actions><AppButton variant="secondary" @click="ui.openGuide()"><AppIcon name="info" />{{ t('guide.open') }}</AppButton></template>
  </PageHeader>
  <GuideOffer />

  <div class="stack">
    <section class="stats" :aria-label="t('pages.staffDashboard')">
      <StatCard to="/staff/inquiries" icon="inbox" :label="t('staff.dash.inquiries')" :value="inquiries.pendingCount" :note="t('staff.dash.inquiriesNote')" />
      <StatCard to="/staff/updates" icon="clipboard" :label="t('staff.dash.updates')" :value="residents.updatedToday.length" :note="t('staff.dash.updatesNote', { n: residents.notUpdatedToday.length })" />
      <StatCard to="/staff/visits-events" icon="calendar-check" :label="t('staff.dash.visits')" :value="visits.todays.length" :note="t('staff.dash.visitsNote', { checked: checkedIn, total: visits.todays.length })" />
      <StatCard to="/staff/visits-events?tab=events" icon="calendar" :label="t('staff.dash.events')" :value="events.upcoming.length" :note="t('staff.dash.eventsNote')" />
    </section>

    <section :aria-label="t('staff.dash.quick')">
      <SectionHeader :title="t('staff.dash.quick')" />
      <div class="quick">
        <AppButton to="/staff/updates"><AppIcon name="clipboard" />{{ t('staff.dash.qaStatus') }}</AppButton>
        <AppButton to="/staff/moment"><AppIcon name="camera" />{{ t('nav.postMoment') }}</AppButton>
        <AppButton to="/staff/inquiries"><AppIcon name="inbox" />{{ t('staff.dash.qaInquiries') }}</AppButton>
        <AppButton to="/staff/visits-events"><AppIcon name="calendar-check" />{{ t('staff.dash.qaVisits') }}</AppButton>
      </div>
    </section>

    <section :aria-label="t('staff.dash.attention')">
      <SectionHeader :title="t('staff.dash.attention')" />
      <AppCard v-if="allClear" tint><p class="m-0"><AppIcon name="check" :size="20" :stroke="3" /> {{ t('staff.dash.allClear') }}</p></AppCard>
      <div v-else class="attention">
        <AppCard :title="t('staff.dash.attInquiries')">
          <p v-if="!inquiries.pendingCount" class="m-0 good"><AppIcon name="check" :size="20" :stroke="3" /> {{ t('staff.dash.noInquiries') }}</p>
          <ul v-else class="list">
            <li v-for="q in inquiries.pending.slice(0, NEEDS_LIMIT)" :key="q.id">
              {{ t('staff.inq.from', { caregiver: nameOf(q.caregiverId), resident: residents.byId(q.residentId).shortName }) }}
            </li>
          </ul>
          <AppButton v-if="inquiries.pendingCount" variant="secondary" to="/staff/inquiries">{{ t('nav.inquiries') }}</AppButton>
        </AppCard>
        <AppCard v-if="residents.notUpdatedToday.length" :title="t('staff.dash.attResidents')">
          <ul class="list">
            <li v-for="r in residents.notUpdatedToday.slice(0, NEEDS_LIMIT)" :key="r.id">{{ r.name }}</li>
          </ul>
          <AppButton variant="secondary" to="/staff/updates">{{ t('nav.updates') }}</AppButton>
        </AppCard>
        <AppCard v-if="toCheckIn.length" :title="t('staff.dash.attVisits')">
          <ul class="list">
            <li v-for="b in toCheckIn.slice(0, NEEDS_LIMIT)" :key="b.id">
              {{ t('staff.dash.visitItem', { name: nameOf(b.caregiverId), resident: residents.byId(b.residentId).shortName, time: fmt.time(SLOTS.find((s) => s.id === b.slotId).start) }) }}
            </li>
          </ul>
          <AppButton variant="secondary" to="/staff/visits-events">{{ t('nav.visitsEvents') }}</AppButton>
        </AppCard>
      </div>
    </section>
  </div>
</template>

<style scoped>
.stack {
  display: flex;
  flex-direction: column;
  gap: var(--s-8);
}
.stats,
.attention,
.quick {
  display: grid;
  gap: var(--s-4);
  grid-template-columns: 1fr;
}
.attention {
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 18rem), 1fr));
}
/* 1 / 2 / 4 columns so the four stats and four quick actions never wrap 3 + 1. */
@media (min-width: 576px) {
  .stats, .quick { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (min-width: 1280px) {
  .stats, .quick { grid-template-columns: repeat(4, minmax(0, 1fr)); }
}
.good {
  display: flex;
  align-items: center;
  gap: var(--s-2);
  color: var(--color-success-text);
  font-weight: 600;
}
.list {
  display: flex;
  flex-direction: column;
  gap: var(--s-2);
  margin: 0;
  padding-left: var(--s-5);
}
</style>
