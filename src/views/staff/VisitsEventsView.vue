<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import PageHeader from '../../components/ui/PageHeader.vue'
import SegmentedControl from '../../components/ui/SegmentedControl.vue'
import EventsPanel from './EventsPanel.vue'
import VisitsPanel from './VisitsPanel.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const TABS = ['visits', 'events']
const tab = computed({
  get: () => (TABS.includes(route.query.tab) ? route.query.tab : 'visits'),
  set: (value) => router.replace({ query: { ...route.query, tab: value } }),
})
const options = computed(() => TABS.map((value) => ({ value, label: t(`staff.ve.${value}`) })))
</script>

<template>
  <PageHeader :title="t('pages.staffVisitsEvents')">{{ t('staff.ve.intro') }}</PageHeader>
  <div class="tabs"><SegmentedControl v-model="tab" :options="options" :label="t('staff.ve.tabs')" :check="false" /></div>
  <VisitsPanel v-if="tab === 'visits'" />
  <EventsPanel v-else />
</template>

<style scoped>
.tabs {
  max-width: 28rem;
  margin-bottom: var(--s-6);
}
</style>
