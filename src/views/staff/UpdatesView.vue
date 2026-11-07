<script setup>
import { computed, nextTick, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import AppButton from '../../components/ui/AppButton.vue'
import AppCard from '../../components/ui/AppCard.vue'
import FormField from '../../components/ui/FormField.vue'
import PageHeader from '../../components/ui/PageHeader.vue'
import ResidentCard from '../../components/domain/ResidentCard.vue'
import SectionHeader from '../../components/ui/SectionHeader.vue'
import SegmentedControl from '../../components/ui/SegmentedControl.vue'
import StatusBadge from '../../components/ui/StatusBadge.vue'
import { WELLBEING_STATUSES } from '../../data/residents'
import { useFormat } from '../../i18n/format'
import { MAX_NOTE_LENGTH, useResidentsStore } from '../../stores/residents'
import { useToast } from '../../composables/useToast'
import { useUiStore } from '../../stores/ui'

const { t } = useI18n()
const fmt = useFormat()
const residents = useResidentsStore()
const ui = useUiStore()
const { notify } = useToast()

const SYMBOLS = { well: '●', resting: '◆', contact: '▲' }
const query = ref('')
const selectedId = ref(residents.residents[0]?.id ?? null)
const status = ref('')
const note = ref('')
const error = ref('')
const form = ref(null)

const shown = computed(() => residents.residents.filter((r) => r.name.toLowerCase().includes(query.value.trim().toLowerCase())))
const selected = computed(() => residents.byId(selectedId.value))
const options = computed(() => WELLBEING_STATUSES.map((value) => ({ value, label: `${SYMBOLS[value]} ${t(`status.${value}`)}` })))

function choose(id) {
  selectedId.value = id
  status.value = ''
  note.value = ''
  error.value = ''
  nextTick(() => form.value?.scrollIntoView?.({ block: 'start' }))
}

// Next resident still waiting for today's update (after this one, wrapping round); otherwise just the next one.
function nextResident(afterId) {
  const list = residents.residents
  const i = list.findIndex((r) => r.id === afterId)
  const rotated = [...list.slice(i + 1), ...list.slice(0, i)]
  return rotated.find((r) => !residents.wasUpdatedToday(r)) ?? null
}

function save({ advance }) {
  error.value = ''
  const result = residents.updateResidentStatus(selectedId.value, status.value, note.value, ui.currentStaffId)
  if (!result.ok) {
    error.value = t(`errors.${result.error}`, result.params ?? {})
    return
  }
  const name = result.value.shortName
  const next = advance ? nextResident(result.value.id) : null
  notify(next || !advance ? t('staff.updates.saved', { name }) : t('staff.updates.allDone'))
  if (next) {
    query.value = '' // the next resident may not match the current search
    choose(next.id)
  }
  else {
    status.value = ''
    note.value = ''
  }
}
</script>

<template>
  <PageHeader :title="t('pages.staffUpdates')">{{ t('staff.updates.intro') }}</PageHeader>

  <div class="layout">
    <section class="list" :aria-label="t('staff.updates.listTitle')">
      <SectionHeader :title="t('staff.updates.listTitle')" />
      <FormField v-model="query" type="search" :label="t('staff.updates.search')" :show-optional="false" :placeholder="t('staff.updates.searchPlaceholder')" />
      <ul class="rows">
        <li v-for="r in shown" :key="r.id">
          <button type="button" class="row" :class="{ on: r.id === selectedId }" :aria-pressed="r.id === selectedId" @click="choose(r.id)">
            <span class="name">{{ r.name }}</span>
            <StatusBadge :status="r.status" />
            <span class="meta">{{ r.updatedAt ? fmt.stamp(r.updatedAt) : t('resident.notUpdated') }}</span>
            <span class="today" :class="{ done: residents.wasUpdatedToday(r) }">
              <span aria-hidden="true">{{ residents.wasUpdatedToday(r) ? '✓' : '○' }}</span>
              {{ residents.wasUpdatedToday(r) ? t('staff.updates.doneToday') : t('staff.updates.todo') }}
            </span>
          </button>
        </li>
      </ul>
      <p v-if="!shown.length" class="m-0">{{ t('staff.updates.noMatch') }}</p>
    </section>

    <div v-if="selected" ref="form" class="form">
      <ResidentCard :resident="selected" />
      <AppCard :title="t('staff.updates.formTitle', { name: selected.shortName })">
        <form class="fields" novalidate @submit.prevent="save({ advance: true })">
          <p class="label">{{ t('staff.updates.status', { name: selected.shortName }) }}</p>
          <SegmentedControl v-model="status" :options="options" :label="t('staff.updates.status', { name: selected.shortName })" wrap />
          <p v-if="error" class="error" role="alert"><span aria-hidden="true">⚠</span> {{ error }}</p>
          <FormField v-model="note" type="textarea" :rows="3" :label="t('staff.updates.note')" :placeholder="t('staff.updates.notePlaceholder')" :maxlength="MAX_NOTE_LENGTH" :help="t('ask.counter', { n: note.length, max: MAX_NOTE_LENGTH })" />
          <div class="actions">
            <AppButton variant="secondary" @click="save({ advance: false })">{{ t('staff.updates.save') }}</AppButton>
            <AppButton type="submit">{{ t('staff.updates.saveNext') }}</AppButton>
          </div>
        </form>
      </AppCard>
    </div>
  </div>
</template>

<style scoped>
.layout {
  display: grid;
  gap: var(--s-6);
  align-items: start;
}
.list,
.form {
  min-width: 0;
}
@media (min-width: 1200px) {
  .layout {
    grid-template-columns: minmax(18rem, 22rem) 1fr;
  }
  .list {
    position: sticky;
    top: var(--s-4);
  }
}
.rows {
  display: flex;
  flex-direction: column;
  gap: var(--s-2);
  margin: var(--s-3) 0 0;
  padding: 0;
  list-style: none;
}
.row {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--s-1);
  width: 100%;
  min-height: var(--hit);
  padding: var(--s-3) var(--s-4);
  border: 2px solid var(--color-border);
  border-radius: var(--r-lg);
  background: var(--color-card);
  color: var(--color-text);
  text-align: left;
  cursor: pointer;
}
.row.on {
  border-color: var(--color-primary);
  background: var(--color-tint);
}
.name {
  font: 600 var(--fs-body) / var(--lh-tight) var(--font-heading);
}
.meta {
  color: var(--color-text-muted);
  font-size: var(--fs-small);
}
.today {
  color: var(--color-text-muted);
  font: 600 var(--fs-small) / var(--lh-tight) var(--font-body);
}
.today.done {
  color: var(--color-success-text);
}
.form,
.fields {
  display: flex;
  flex-direction: column;
  gap: var(--s-4);
  scroll-margin-top: var(--s-4);
}
.label {
  margin: 0;
  font: 600 var(--fs-body) / var(--lh-tight) var(--font-body);
}
.error {
  margin: 0;
  color: var(--color-danger-text);
  font-weight: 600;
}
.actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: var(--s-3);
}
</style>
