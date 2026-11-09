<!-- Caregiver feedback: a rating and an optional comment. Simulated: nothing is stored or sent. -->
<script setup>
import { reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from '../../composables/useToast'
import AppButton from '../ui/AppButton.vue'
import AppDialog from '../ui/AppDialog.vue'
import AppIcon from '../ui/AppIcon.vue'
import FormField from '../ui/FormField.vue'
import RatingScale from '../ui/RatingScale.vue'
import SegmentedControl from '../ui/SegmentedControl.vue'

const MAX_COMMENT = 500
const RATINGS = ['bad', 'ok', 'good']
const props = defineProps({ modelValue: { type: Boolean, default: false } })
const emit = defineEmits(['update:modelValue'])
const { t } = useI18n()
const { notify } = useToast()

const form = reactive({ rating: '', satisfaction: '', recommend: '', comment: '' })
const error = ref('')
const sent = ref(false)

watch(() => props.modelValue, (open) => {
  if (!open) return
  Object.assign(form, { rating: '', satisfaction: '', recommend: '', comment: '' })
  error.value = ''
  sent.value = false
}, { immediate: true })

function submit() {
  if (!form.rating) {
    error.value = t('feedback.noRating')
    return
  }
  sent.value = true
  notify(t('feedback.sentToast'))
}
const close = () => emit('update:modelValue', false)
</script>

<template>
  <AppDialog :model-value="modelValue" :title="t('feedback.title')" @update:model-value="emit('update:modelValue', $event)">
    <div v-if="sent" class="sent" role="status">
      <span class="ok pop-in"><AppIcon name="check" :size="28" :stroke="3" /></span>
      <p class="msg">{{ t('feedback.sent') }}</p>
      <AppButton @click="close">{{ t('common.done') }}</AppButton>
    </div>

    <form v-else class="form" novalidate @submit.prevent="submit">
      <p class="m-0">{{ t('feedback.intro') }}</p>
      <div>
        <p class="label">{{ t('feedback.rating') }} <span aria-hidden="true">*</span></p>
        <SegmentedControl v-model="form.rating" :label="t('feedback.rating')" :options="RATINGS.map((r) => ({ value: r, label: t(`feedback.rate.${r}`) }))" />
        <p v-if="error" class="formerror" role="alert">⚠ {{ error }}</p>
      </div>
      <RatingScale v-model="form.satisfaction" optional :from="1" :to="5" :columns="5" :legend="t('feedback.satisfaction')" :low-label="t('feedback.satisfactionLow')" :high-label="t('feedback.satisfactionHigh')" />
      <RatingScale v-model="form.recommend" optional :from="0" :to="10" :columns="6" :legend="t('feedback.recommend')" :low-label="t('feedback.recommendLow')" :high-label="t('feedback.recommendHigh')" />
      <FormField v-model="form.comment" type="textarea" :label="t('feedback.comment')" :placeholder="t('feedback.placeholder')" :help="t('feedback.demo')" :maxlength="MAX_COMMENT" />
      <div class="actions">
        <AppButton variant="secondary" @click="close">{{ t('dialog.cancel') }}</AppButton>
        <AppButton type="submit">{{ t('feedback.send') }}</AppButton>
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
.label {
  margin: 0 0 var(--s-2);
  font-weight: 600;
}
.formerror {
  margin: var(--s-2) 0 0;
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
