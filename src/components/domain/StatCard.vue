<!-- A dashboard summary: a big number, what it counts, and a link to where staff act on it. -->
<script setup>
import { RouterLink } from 'vue-router'
import AppIcon from '../ui/AppIcon.vue'

defineProps({
  to: { type: String, required: true },
  icon: { type: String, required: true },
  label: { type: String, required: true },
  value: { type: Number, required: true },
  note: { type: String, default: '' },
})
</script>

<template>
  <RouterLink :to="to" class="stat">
    <span class="icon" aria-hidden="true"><AppIcon :name="icon" :size="24" /></span>
    <span class="label">{{ label }}</span>
    <span class="value">{{ value }}</span>
    <span v-if="note" class="note">{{ note }}</span>
  </RouterLink>
</template>

<style scoped>
.stat {
  display: flex;
  flex-direction: column;
  gap: var(--s-1);
  padding: var(--s-5);
  background: var(--color-card);
  border: 1px solid var(--color-border);
  border-radius: var(--r-xl);
  box-shadow: var(--shadow-card);
  color: var(--color-text);
  text-decoration: none;
  transition: border-color var(--dur-fast), transform var(--dur-fast);
}
.stat:hover {
  border-color: var(--color-primary);
  color: var(--color-text);
}
.stat:active {
  transform: scale(0.99);
}
.icon {
  display: grid;
  place-items: center;
  width: 2.75rem;
  height: 2.75rem;
  border-radius: var(--r-pill);
  background: var(--color-tint);
  color: var(--color-tint-text);
}
.label {
  margin-top: var(--s-2);
  font: 600 var(--fs-body) / var(--lh-tight) var(--font-body);
}
.value {
  color: var(--color-primary-text);
  font: 700 2.25rem / 1 var(--font-heading);
}
.note {
  color: var(--color-text-muted);
  font-size: var(--fs-small);
}
</style>
