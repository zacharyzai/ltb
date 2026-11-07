<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import AppButton from '../../components/ui/AppButton.vue'
import AppIcon from '../../components/ui/AppIcon.vue'
import EmptyState from '../../components/ui/EmptyState.vue'
import EventFormDialog from '../../components/domain/EventFormDialog.vue'
import SectionHeader from '../../components/ui/SectionHeader.vue'
import { useFormat } from '../../i18n/format'
import { useToast } from '../../composables/useToast'
import { useEventsStore } from '../../stores/events'
import { localized } from '../../utils/content'

const { t } = useI18n()
const fmt = useFormat()
const events = useEventsStore()
const { notify } = useToast()

const editing = ref(null)
const formOpen = ref(false)
const edit = (event) => {
  editing.value = event
  formOpen.value = true
}
function publish(event) {
  const result = events.publishEvent(event.id)
  if (result.ok) notify(t('staff.ev.publishedToast'))
  else notify(t(`errors.${result.error}`, result.params ?? {}), { kind: 'error' })
}
const title = (e) => localized(e, 'title', t)
</script>

<template>
  <div class="stack">
    <div><AppButton @click="edit(null)"><AppIcon name="plus" />{{ t('staff.ve.newEvent') }}</AppButton></div>

    <section v-for="group in [
      { key: 'drafts', title: t('staff.ve.drafts'), list: events.drafts, actions: true },
      { key: 'upcoming', title: t('staff.ve.upcomingEvents'), list: events.upcoming, actions: true },
      { key: 'past', title: t('staff.ve.pastEvents'), list: events.past, actions: false },
    ]" :key="group.key" :aria-label="group.title">
      <SectionHeader :title="group.title" />
      <ul v-if="group.list.length" class="rows">
        <li v-for="e in group.list" :key="e.id" class="row">
          <div class="info">
            <h3>{{ title(e) }}</h3>
            <p class="meta">
              <span v-if="e.status === 'draft'" class="chip">{{ t('staff.ve.draftChip') }}</span>
              <span class="chip alt">{{ t(`eventCategory.${e.category}`) }}</span>
              <span v-if="!e.public" class="chip alt">{{ t('community.familiesOnly') }}</span>
            </p>
            <p class="meta"><AppIcon name="calendar" :size="18" />{{ fmt.dateShort(e.date) }} · {{ fmt.timeRange(e.startTime, e.endTime) }} · {{ localized(e, 'location', t) }}</p>
          </div>
          <div v-if="group.actions" class="actions">
            <AppButton variant="secondary" :aria-label="t('staff.ve.editFor', { title: title(e) })" @click="edit(e)">{{ t('staff.ve.edit') }}</AppButton>
            <AppButton v-if="e.status === 'draft'" :aria-label="t('staff.ve.publishFor', { title: title(e) })" @click="publish(e)">{{ t('staff.ve.publish') }}</AppButton>
          </div>
        </li>
      </ul>
      <EmptyState v-else icon="calendar" :title="t('staff.ve.noEvents')" />
    </section>
  </div>

  <EventFormDialog v-model="formOpen" :event="editing" />
</template>

<style scoped>
.stack {
  display: flex;
  flex-direction: column;
  gap: var(--s-6);
}
.rows {
  display: flex;
  flex-direction: column;
  gap: var(--s-3);
  margin: 0;
  padding: 0;
  list-style: none;
}
.row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--s-3);
  padding: var(--s-4) var(--s-5);
  background: var(--color-card);
  border: 1px solid var(--color-border);
  border-radius: var(--r-xl);
}
.info {
  flex: 1 1 16rem;
}
h3 {
  font-size: var(--fs-h3);
}
.meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--s-2);
  margin: var(--s-1) 0 0;
  color: var(--color-text-muted);
  font-size: var(--fs-small);
}
.chip {
  padding: 2px var(--s-3);
  border-radius: var(--r-pill);
  background: var(--color-tint-strong);
  color: var(--color-tint-text);
  font-weight: 600;
}
.chip.alt {
  background: var(--color-surface-2);
  color: var(--color-text);
}
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--s-3);
}
</style>
