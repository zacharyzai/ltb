<!-- Friendly "nothing here" block. -->
<script setup>
import AppIcon from './AppIcon.vue'

defineProps({
  icon: { type: String, default: 'info' },
  title: { type: String, required: true },
})
</script>

<template>
  <div class="empty">
    <span class="empty-icon"><AppIcon :name="icon" :size="28" /></span>
    <p class="empty-title">{{ title }}</p>
    <p v-if="$slots.default" class="empty-text"><slot /></p>
    <div v-if="$slots.action" class="empty-action"><slot name="action" /></div>
  </div>
</template>

<style scoped>
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--s-2);
  padding: var(--s-8) var(--s-4);
  border: 2px dashed var(--color-border-strong);
  border-radius: var(--r-lg);
  text-align: center;
}
.empty-icon {
  display: grid;
  place-items: center;
  width: 3.5rem;
  height: 3.5rem;
  border-radius: var(--r-pill);
  background: var(--color-tint);
  color: var(--color-tint-text);
}
.empty-title {
  margin: 0;
  font: 600 var(--fs-lead) / var(--lh-tight) var(--font-heading);
}
.empty-action {
  margin-top: var(--s-3);
}
.empty-text {
  margin: 0;
  color: var(--color-text-muted);
}
</style>
