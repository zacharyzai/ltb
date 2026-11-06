<!-- Labelled text input, textarea or select with help text, a required marker and an error message that screen readers announce. -->
<script setup>
import { computed, useId } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  label: { type: String, required: true },
  type: { type: String, default: 'text' }, // 'text' | 'textarea' | 'select' | any <input> type
  options: { type: Array, default: () => [] }, // select: [{ value, label }]
  help: { type: String, default: '' },
  error: { type: String, default: '' },
  required: { type: Boolean, default: false },
  placeholder: { type: String, default: '' },
  maxlength: { type: Number, default: null },
  rows: { type: Number, default: 4 },
  autofocus: { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue'])
const { t } = useI18n()
const id = useId()
const helpId = `${id}-help`
const errorId = `${id}-error`
const describedBy = computed(() => [props.help && helpId, props.error && errorId].filter(Boolean).join(' ') || undefined)
const onInput = (event) => emit('update:modelValue', event.target.value)
</script>

<template>
  <div class="field" :class="{ invalid: error }">
    <label :for="id" class="label">
      {{ label }}
      <span v-if="required" class="req">({{ t('form.required') }})</span>
      <span v-else class="opt">({{ t('form.optional') }})</span>
    </label>
    <textarea v-if="type === 'textarea'" :id="id" class="control" :value="modelValue" :rows="rows" :placeholder="placeholder" :maxlength="maxlength" :aria-required="required || undefined" :aria-invalid="error ? 'true' : undefined" :aria-describedby="describedBy" :autofocus="autofocus" @input="onInput" />
    <select v-else-if="type === 'select'" :id="id" class="control" :value="modelValue" :aria-required="required || undefined" :aria-invalid="error ? 'true' : undefined" :aria-describedby="describedBy" :autofocus="autofocus" @change="onInput">
      <option v-for="o in options" :key="o.value" :value="o.value">{{ o.label }}</option>
    </select>
    <input v-else :id="id" class="control" :type="type" :value="modelValue" :placeholder="placeholder" :maxlength="maxlength" :aria-required="required || undefined" :aria-invalid="error ? 'true' : undefined" :aria-describedby="describedBy" :autofocus="autofocus" @input="onInput" />
    <p v-if="help" :id="helpId" class="help">{{ help }}</p>
    <p v-if="error" :id="errorId" class="error" role="alert"><span aria-hidden="true">⚠</span> {{ error }}</p>
  </div>
</template>

<style scoped>
.field {
  display: flex;
  flex-direction: column;
  gap: var(--s-1);
}
.label {
  font: 600 var(--fs-body) / var(--lh-tight) var(--font-body);
}
.req,
.opt {
  font-weight: 400;
  color: var(--color-text-muted);
  font-size: var(--fs-small);
}
.control {
  width: 100%;
  min-height: var(--hit);
  padding: var(--s-2) var(--s-3);
  border: 2px solid var(--color-control-border);
  border-radius: var(--r-md);
  background: var(--color-card);
  color: var(--color-text);
  font: 400 var(--fs-body) / var(--lh-body) var(--font-body);
}
.control::placeholder {
  color: var(--color-text-muted);
}
.invalid .control {
  border-color: var(--color-danger-text);
}
.help {
  margin: 0;
  color: var(--color-text-muted);
  font-size: var(--fs-small);
}
.error {
  margin: 0;
  color: var(--color-danger-text);
  font: 600 var(--fs-small) / var(--lh-tight) var(--font-body);
}
</style>
