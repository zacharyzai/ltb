<!-- "Ask the care team": pick a resident and topic, write a question, send. Uses the inquiries store. -->
<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useCaregiver } from '../../composables/useCaregiver'
import { useToast } from '../../composables/useToast'
import { INQUIRY_TOPICS, MAX_QUESTION_LENGTH } from '../../data/inquiries'
import { useInquiriesStore } from '../../stores/inquiries'
import AppButton from '../ui/AppButton.vue'
import AppDialog from '../ui/AppDialog.vue'
import AppIcon from '../ui/AppIcon.vue'
import FormField from '../ui/FormField.vue'

const props = defineProps({ modelValue: { type: Boolean, default: false } })
const emit = defineEmits(['update:modelValue'])
const { t } = useI18n()
const { caregiver, linked, selected, select } = useCaregiver()
const inquiries = useInquiriesStore()
const { notify } = useToast()

const form = reactive({ residentId: '', topic: '', question: '' })
const errors = reactive({ question: '', form: '' })
const sent = ref(false)

const residentOptions = computed(() => linked.value.map((r) => ({ value: r.id, label: r.name })))
const topicOptions = computed(() => [{ value: '', label: t('ask.topicNone') }, ...INQUIRY_TOPICS.map((id) => ({ value: id, label: t(`topic.${id}`) }))])

function reset() {
  Object.assign(form, { residentId: selected.value?.id ?? '', topic: '', question: '' })
  Object.assign(errors, { question: '', form: '' })
  sent.value = false
}
watch(() => props.modelValue, (open) => open && reset(), { immediate: true })

function submit() {
  Object.assign(errors, { question: '', form: '' })
  const result = inquiries.submitInquiry({ caregiverId: caregiver.value.id, residentId: form.residentId, question: form.question, topic: form.topic || 'other' })
  if (!result.ok) {
    const message = t(`errors.${result.error}`, result.params ?? {})
    if (result.error === 'EMPTY_QUESTION' || result.error === 'QUESTION_TOO_LONG') errors.question = message
    else errors.form = message
    return
  }
  select(form.residentId) // so the new question shows in that resident's history
  sent.value = true
  notify(t('ask.sentToast'))
}
const close = () => emit('update:modelValue', false)
</script>

<template>
  <AppDialog :model-value="modelValue" :title="t('ask.title')" @update:model-value="emit('update:modelValue', $event)">
    <div v-if="sent" class="sent" role="status">
      <span class="ok pop-in"><AppIcon name="check" :size="28" :stroke="3" /></span>
      <p class="msg">{{ t('ask.sent') }}</p>
      <p class="urgent">{{ t('ask.urgent') }}</p>
      <div class="actions">
        <AppButton variant="secondary" @click="reset">{{ t('ask.another') }}</AppButton>
        <AppButton @click="close">{{ t('common.done') }}</AppButton>
      </div>
    </div>

    <form v-else class="form" novalidate @submit.prevent="submit">
      <p class="urgent"><AppIcon name="alert" :size="20" />{{ t('ask.urgent') }}</p>
      <FormField v-if="linked.length > 1" v-model="form.residentId" type="select" :options="residentOptions" :label="t('ask.resident')" required />
      <FormField v-model="form.topic" type="select" :options="topicOptions" :label="t('ask.topic')" />
      <FormField v-model="form.question" type="textarea" :label="t('ask.question')" :placeholder="t('ask.placeholder')" :help="t('ask.counter', { n: form.question.length, max: MAX_QUESTION_LENGTH })" :error="errors.question" :maxlength="MAX_QUESTION_LENGTH" required autofocus />
      <p v-if="errors.form" class="formerror" role="alert">⚠ {{ errors.form }}</p>
      <div class="actions">
        <AppButton variant="secondary" @click="close">{{ t('dialog.cancel') }}</AppButton>
        <AppButton type="submit">{{ t('ask.send') }}</AppButton>
      </div>
    </form>
  </AppDialog>
</template>

<style scoped>
.form,
.sent {
  display: flex;
  flex-direction: column;
  gap: var(--s-4);
}
.sent {
  align-items: center;
  text-align: center;
}
.ok {
  display: grid;
  place-items: center;
  width: 3.5rem;
  height: 3.5rem;
  border-radius: var(--r-pill);
  background: var(--color-success-bg);
  color: var(--color-success-text);
}
.msg {
  margin: 0;
  font: 600 var(--fs-lead) / var(--lh-tight) var(--font-heading);
}
.urgent {
  display: flex;
  align-items: flex-start;
  gap: var(--s-2);
  margin: 0;
  padding: var(--s-3);
  border-radius: var(--r-md);
  background: var(--color-warning-bg);
  color: var(--color-warning-text);
  font-size: var(--fs-small);
}
.formerror {
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
