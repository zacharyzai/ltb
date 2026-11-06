<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import AppButton from '../../components/ui/AppButton.vue'
import AppIcon from '../../components/ui/AppIcon.vue'
import EmptyState from '../../components/ui/EmptyState.vue'
import SectionHeader from '../../components/ui/SectionHeader.vue'
import EventCard from '../../components/domain/EventCard.vue'
import MomentCard from '../../components/domain/MomentCard.vue'
import ResidentCard from '../../components/domain/ResidentCard.vue'
import ResidentSwitcher from '../../components/domain/ResidentSwitcher.vue'
import VisitCard from '../../components/domain/VisitCard.vue'
import { useCaregiver } from '../../composables/useCaregiver'
import { useEventsStore } from '../../stores/events'
import { useMomentsStore } from '../../stores/moments'
import { useVisitsStore } from '../../stores/visits'
import { greetingPeriod } from '../../utils/time'
import { useRouter } from 'vue-router'

const { t } = useI18n()
const router = useRouter()
const { caregiver, linked, selected, relationship } = useCaregiver()
const moments = useMomentsStore()
const visits = useVisitsStore()
const events = useEventsStore()

const latestMoment = computed(() => moments.forResident(selected.value.id, caregiver.value.id)[0] ?? null)
const nextVisit = computed(() => visits.upcoming.find((b) => b.caregiverId === caregiver.value.id && b.residentId === selected.value.id) ?? null)
const highlight = computed(() => events.upcoming.find((e) => e.public) ?? null)
const visibleIds = computed(() => linked.value.map((r) => r.id))
const openEvent = (event) => router.push({ name: 'community', query: { event: event.id } })
</script>

<template>
  <header class="hello">
    <h1>{{ t(`home.greeting.${greetingPeriod()}`, { name: caregiver.firstName }) }}</h1>
    <p class="lead">{{ t('home.intro') }}</p>
  </header>

  <ResidentSwitcher />

  <div v-if="selected" class="grid">
    <div class="col left">
    <ResidentCard class="resident" :resident="selected" :relationship="relationship(selected)" />

    <section class="visit" :aria-label="t('home.upcomingVisit')">
      <SectionHeader :title="t('home.upcomingVisit')">
        <template #action><AppButton to="/visits" variant="ghost">{{ t('home.allVisits') }}<AppIcon name="arrow-right" :size="18" /></AppButton></template>
      </SectionHeader>
      <VisitCard v-if="nextVisit" :booking="nextVisit" compact>
        <AppButton to="/visits" variant="secondary">{{ t('home.viewVisit') }}</AppButton>
      </VisitCard>
      <EmptyState v-else icon="calendar" :title="t('home.noVisit')">
        <AppButton to="/visits/book"><AppIcon name="plus" :size="20" />{{ t('visits.book') }}</AppButton>
      </EmptyState>
    </section>
    </div>

    <div class="col right">
    <section class="moment" :aria-label="t('home.latestMoment')">
      <SectionHeader :title="t('home.latestMoment')">
        <template #action><AppButton to="/moments" variant="ghost">{{ t('home.viewMoments') }}<AppIcon name="arrow-right" :size="18" /></AppButton></template>
      </SectionHeader>
      <MomentCard v-if="latestMoment" :moment="latestMoment" :visible-resident-ids="visibleIds" />
      <EmptyState v-else icon="image" :title="t('home.noMoments')" />
    </section>

    <section v-if="highlight" class="community" :aria-label="t('home.community')">
      <SectionHeader :title="t('home.community')">
        <template #action><AppButton to="/community" variant="ghost">{{ t('home.allEvents') }}<AppIcon name="arrow-right" :size="18" /></AppButton></template>
      </SectionHeader>
      <EventCard :event="highlight" compact @details="openEvent" />
    </section>
    </div>
  </div>
</template>

<style scoped>
.hello {
  margin-bottom: var(--s-5);
}
.lead {
  margin: var(--s-2) 0 0;
  color: var(--color-text-muted);
  font-size: var(--fs-lead);
  max-width: 40rem;
}
h1 {
  font-size: var(--fs-h1);
}
/* Phones: one column in reading order (resident, moment, visit, community). Desktop: two columns. */
.grid {
  display: flex;
  flex-direction: column;
  gap: var(--s-8);
}
.col {
  display: contents;
}
.resident { order: 1; }
.moment { order: 2; }
.visit { order: 3; }
.community { order: 4; }
section :deep(.empty) {
  padding-block: var(--s-6);
}
@media (min-width: 992px) {
  .grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--s-6);
    align-items: start;
  }
  .col {
    display: flex;
    flex-direction: column;
    gap: var(--s-8);
  }
  .resident, .moment, .visit, .community { order: 0; }
}
</style>
