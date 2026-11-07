<!-- Progress through the booking steps. Circles for sighted users; the current step is also spoken. -->
<script setup>
import { useI18n } from 'vue-i18n'
import AppIcon from '../ui/AppIcon.vue'

defineProps({
  steps: { type: Array, required: true }, // translated labels
  current: { type: Number, required: true }, // 0-based
})
const { t } = useI18n()
</script>

<template>
  <ol class="steps" :aria-label="t('book.progress')">
    <li v-for="(label, i) in steps" :key="i" class="step" :class="{ done: i < current, on: i === current }" :aria-current="i === current ? 'step' : undefined">
      <span class="dot" aria-hidden="true"><AppIcon v-if="i < current" name="check" :size="16" :stroke="3" /><template v-else>{{ i + 1 }}</template></span>
      <span class="label">{{ label }}</span>
    </li>
  </ol>
  <!-- Phones: the current step's name gets the full width (a column is too narrow for long Tamil or Malay words). -->
  <p class="now" aria-hidden="true">{{ steps[current] }}</p>
</template>

<style scoped>
.steps {
  display: flex;
  gap: var(--s-2);
  margin: 0 0 var(--s-5);
  padding: 0;
  list-style: none;
}
.step {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  gap: var(--s-1);
  min-width: 0;
  text-align: center;
  color: var(--color-text-muted);
  font: 600 var(--fs-small) / var(--lh-tight) var(--font-body);
}
.dot {
  display: grid;
  place-items: center;
  width: 2.25rem;
  height: 2.25rem;
  border: 2px solid var(--color-control-border);
  border-radius: var(--r-pill);
  background: var(--color-card);
  color: var(--color-text);
}
.done .dot {
  background: var(--color-tint-strong);
  border-color: var(--color-brand);
  color: var(--color-tint-text);
}
.on .dot {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--color-on-primary);
}
.on {
  color: var(--color-text);
}
.label {
  overflow-wrap: anywhere;
}
.now {
  display: none;
  margin: calc(-1 * var(--s-2)) 0 var(--s-4);
  text-align: center;
  font: 600 var(--fs-body) / var(--lh-tight) var(--font-body);
}
@media (max-width: 575.98px) {
  .label {
    display: none; /* the page heading also says "Step n of 4" */
  }
  .now {
    display: block;
  }
}
</style>
