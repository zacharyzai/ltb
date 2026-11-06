<!-- A row of toggle buttons for choosing one option (language, theme, text size, demo role). -->
<script setup>
import AppIcon from './AppIcon.vue'

defineProps({
  options: { type: Array, required: true }, // [{ value, label, icon?, lang?, srLabel? }]
  modelValue: { type: String, required: true },
  label: { type: String, required: true }, // accessible name of the group
  check: { type: Boolean, default: true }, // show a ✓ on the chosen option (a cue that is not colour)
})
const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <div class="seg" role="group" :aria-label="label">
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      class="seg-btn"
      :class="{ on: modelValue === option.value }"
      :aria-pressed="modelValue === option.value"
      :lang="option.lang"
      @click="emit('update:modelValue', option.value)"
    >
      <slot name="option" :option="option">
        <AppIcon v-if="option.icon" :name="option.icon" :size="20" />
        <span>{{ option.label }}</span>
      </slot>
      <span v-if="option.srLabel" class="visually-hidden">{{ option.srLabel }}</span>
      <AppIcon v-if="check && modelValue === option.value" name="check" :size="16" :stroke="3" />
    </button>
  </div>
</template>

<style scoped>
.seg {
  display: flex;
  gap: var(--s-1);
  padding: var(--s-1);
  border: 2px solid var(--color-control-border);
  border-radius: var(--r-lg);
  background: var(--color-card);
}
.seg-btn {
  flex: 1 1 0;
  min-width: 0;
  min-height: var(--hit);
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  column-gap: var(--s-1);
  padding: var(--s-1) 2px;
  border: 0;
  border-radius: var(--r-md);
  background: transparent;
  color: var(--color-text);
  font: 600 var(--fs-small) / var(--lh-tight) var(--font-body);
  text-align: center;
  overflow-wrap: break-word;
  cursor: pointer;
  transition: background-color var(--dur-fast);
}
.seg-btn:hover {
  background: var(--color-tint);
}
.seg-btn.on {
  background: var(--color-primary);
  color: var(--color-on-primary);
}
</style>
