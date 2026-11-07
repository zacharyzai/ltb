<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import AppButton from '../../components/ui/AppButton.vue'
import AppIcon from '../../components/ui/AppIcon.vue'
import EmptyState from '../../components/ui/EmptyState.vue'
import PageHeader from '../../components/ui/PageHeader.vue'
import SectionHeader from '../../components/ui/SectionHeader.vue'
import SegmentedControl from '../../components/ui/SegmentedControl.vue'
import AskCareTeamDialog from '../../components/domain/AskCareTeamDialog.vue'
import InquiryCard from '../../components/domain/InquiryCard.vue'
import MomentCard from '../../components/domain/MomentCard.vue'
import ResidentCard from '../../components/domain/ResidentCard.vue'
import ResidentSwitcher from '../../components/domain/ResidentSwitcher.vue'
import { useCaregiver } from '../../composables/useCaregiver'
import { useInquiriesStore } from '../../stores/inquiries'
import { useMomentsStore } from '../../stores/moments'
import { dayOffset } from '../../utils/time'

const { t } = useI18n()
const { caregiver, linked, selected, relationship } = useCaregiver()
const moments = useMomentsStore()
const inquiries = useInquiriesStore()

const filter = ref('latest')
const asking = ref(false)
const options = computed(() => ['latest', 'week', 'all'].map((value) => ({ value, label: t(`moments.filter.${value}`) })))

// Published moments tagging the selected resident that this caregiver may see; drafts never appear.
const all = computed(() => moments.forResident(selected.value.id, caregiver.value.id))
const feed = computed(() => {
  if (filter.value === 'latest') return all.value.slice(0, 3)
  if (filter.value === 'week') return moments.inRange(dayOffset(-6), dayOffset(0), caregiver.value.id).filter((m) => m.residentIds.includes(selected.value.id))
  return all.value
})
const history = computed(() => inquiries.byCaregiver(caregiver.value.id).filter((q) => q.residentId === selected.value.id))
const visibleIds = computed(() => linked.value.map((r) => r.id))
</script>

<template>
  <PageHeader :title="t('pages.moments')">{{ t('moments.intro') }}</PageHeader>
  <ResidentSwitcher />

  <div v-if="selected" class="stack">
    <section class="status" :aria-label="t('moments.wellbeing')">
      <SectionHeader :title="t('moments.wellbeing')" />
      <ResidentCard :resident="selected" :relationship="relationship(selected)" />
      <p class="disclaimer"><AppIcon name="info" :size="18" />{{ t('moments.disclaimer') }}</p>
    </section>

    <section class="ask" :aria-label="t('ask.title')">
      <div>
        <h2>{{ t('ask.title') }}</h2>
        <p>{{ t('ask.cta') }}</p>
      </div>
      <AppButton @click="asking = true"><AppIcon name="message" :size="20" />{{ t('ask.open') }}</AppButton>
    </section>

    <section :aria-label="t('moments.feed')">
      <SectionHeader :title="t('moments.feed')" />
      <SegmentedControl v-model="filter" :options="options" :label="t('moments.filterLabel')" :check="false" />
      <div v-if="feed.length" class="feed">
        <MomentCard v-for="m in feed" :key="m.id" :moment="m" show-residents :visible-resident-ids="visibleIds" />
      </div>
      <EmptyState v-else icon="image" :title="t('moments.empty')">{{ t('moments.emptyText') }}</EmptyState>
    </section>

    <section :aria-label="t('ask.history')">
      <SectionHeader :title="t('ask.history')" />
      <div v-if="history.length" class="history">
        <InquiryCard v-for="q in history" :key="q.id" :inquiry="q" />
      </div>
      <EmptyState v-else icon="message" :title="t('ask.noHistory')">
        <template #action><AppButton variant="secondary" @click="asking = true"><AppIcon name="message" :size="20" />{{ t('ask.open') }}</AppButton></template>
      </EmptyState>
    </section>
  </div>

  <AskCareTeamDialog v-model="asking" />
</template>

<style scoped>
.stack {
  display: flex;
  flex-direction: column;
  gap: var(--s-8);
}
.disclaimer {
  display: flex;
  align-items: flex-start;
  gap: var(--s-2);
  margin: var(--s-3) 0 0;
  color: var(--color-text-muted);
  font-size: var(--fs-small);
}
.ask {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--s-4);
  padding: var(--s-5);
  border: 1px solid var(--color-tint-strong);
  border-radius: var(--r-xl);
  background: var(--color-tint);
}
.ask h2 {
  font-size: var(--fs-h3);
}
.ask p {
  margin: var(--s-1) 0 0;
  max-width: 34rem;
}
.feed {
  display: grid;
  gap: var(--s-5);
  margin-top: var(--s-4);
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 20rem), 1fr));
}
.history {
  display: flex;
  flex-direction: column;
  gap: var(--s-3);
}
</style>
