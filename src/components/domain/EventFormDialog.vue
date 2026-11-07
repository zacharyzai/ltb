<!-- Create or edit a community event. New events can be saved as a draft or published; drafts stay hidden from caregivers. -->
<script setup>
import { computed, reactive, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { EVENT_CATEGORIES } from '../../data/events'
import { useEventsStore } from '../../stores/events'
import { useToast } from '../../composables/useToast'
import { localized } from '../../utils/content'
import { dayOffset } from '../../utils/time'
import AppButton from '../ui/AppButton.vue'
import AppDialog from '../ui/AppDialog.vue'
import FormField from '../ui/FormField.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  event: { type: Object, default: null }, // null = a new event
})
const emit = defineEmits(['update:modelValue'])
const { t } = useI18n()
const events = useEventsStore()
const { notify } = useToast()

const form = reactive({ title: '', category: 'community', date: '', startTime: '', endTime: '', location: '', description: '', public: true })
const errors = reactive({ title: '', date: '', time: '', location: '', form: '' })
let initial = {}

const categoryOptions = computed(() => EVENT_CATEGORIES.map((id) => ({ value: id, label: t(`eventCategory.${id}`) })))
const isDraft = computed(() => !props.event || props.event.status === 'draft')

function reset() {
  const e = props.event
  initial = e
    ? { title: localized(e, 'title', t), category: e.category, date: e.date, startTime: e.startTime, endTime: e.endTime, location: localized(e, 'location', t), description: localized(e, 'description', t), public: e.public }
    : { title: '', category: 'community', date: dayOffset(7), startTime: '14:00', endTime: '15:30', location: '', description: '', public: true }
  Object.assign(form, initial)
  Object.assign(errors, { title: '', date: '', time: '', location: '', form: '' })
}
watch(() => props.modelValue, (open) => open && reset(), { immediate: true })

// Only fields staff actually changed are sent, so untouched seeded text keeps its translations.
const changes = () => Object.fromEntries(Object.entries(form).filter(([k, v]) => v !== initial[k]))

function fail(result) {
  const message = t(`errors.${result.error}`, result.params ?? {})
  const field = { EMPTY_TITLE: 'title', BAD_DATE: 'date', BAD_TIME: 'time', EMPTY_LOCATION: 'location' }[result.error] ?? 'form'
  errors[field] = message
}
function done(toast) {
  notify(toast)
  emit('update:modelValue', false)
}
function run(action, toast) {
  Object.assign(errors, { title: '', date: '', time: '', location: '', form: '' })
  const result = action()
  if (result.ok) done(toast)
  else fail(result)
}

const saveDraft = () => run(() => (props.event ? events.updateEvent(props.event.id, changes()) : events.saveDraft(form)), t('staff.ev.draftToast'))
const save = () => run(() => events.updateEvent(props.event.id, changes()), t('staff.ev.savedToast'))
function publish() {
  run(() => {
    if (!props.event) return events.createEvent({ ...form, publish: true })
    const saved = events.updateEvent(props.event.id, changes())
    return saved.ok ? events.publishEvent(props.event.id) : saved
  }, t('staff.ev.publishedToast'))
}
</script>

<template>
  <AppDialog :model-value="modelValue" :title="event ? t('staff.ev.editTitle') : t('staff.ev.createTitle')" @update:model-value="emit('update:modelValue', $event)">
    <form class="form" novalidate @submit.prevent="isDraft ? publish() : save()">
      <p v-if="isDraft" class="note">{{ t('staff.ve.draftNote') }}</p>
      <FormField v-model="form.title" :label="t('staff.ev.title')" :error="errors.title" required autofocus />
      <FormField v-model="form.category" type="select" :options="categoryOptions" :label="t('staff.ev.category')" required />
      <FormField v-model="form.date" type="date" :label="t('staff.ev.date')" :error="errors.date" :required="!isDraft" />
      <div class="times">
        <FormField v-model="form.startTime" type="time" :label="t('staff.ev.start')" :error="errors.time" />
        <FormField v-model="form.endTime" type="time" :label="t('staff.ev.end')" />
      </div>
      <FormField v-model="form.location" :label="t('staff.ev.location')" :error="errors.location" />
      <FormField v-model="form.description" type="textarea" :rows="3" :label="t('staff.ev.description')" />
      <label class="check"><input v-model="form.public" type="checkbox" /><span>{{ t('staff.ev.public') }}</span></label>
      <p v-if="errors.form" class="error" role="alert"><span aria-hidden="true">⚠</span> {{ errors.form }}</p>
      <div class="actions">
        <AppButton v-if="isDraft" variant="secondary" @click="saveDraft">{{ event ? t('staff.ev.save') : t('staff.ev.saveDraft') }}</AppButton>
        <AppButton v-if="isDraft" type="submit">{{ t('staff.ev.publishEvent') }}</AppButton>
        <AppButton v-else type="submit">{{ t('staff.ev.save') }}</AppButton>
      </div>
    </form>
  </AppDialog>
</template>

<style scoped>
.form {
  display: flex;
  flex-direction: column;
  gap: var(--s-4);
}
.times {
  display: grid;
  gap: var(--s-3);
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 9rem), 1fr));
}
.note {
  margin: 0;
  color: var(--color-text-muted);
  font-size: var(--fs-small);
}
.check {
  display: flex;
  align-items: center;
  gap: var(--s-3);
  min-height: var(--hit);
}
.check input {
  flex: none;
  width: 1.5rem;
  height: 1.5rem;
  accent-color: var(--color-primary);
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
