<!-- SAS Connect wordmark: an original maroon tile with an "S" (not the SAS logo). -->
<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <span class="brand">
    <span class="tile" aria-hidden="true">S</span>
    <span class="name">{{ t('app.name') }}</span>
  </span>
</template>

<style scoped>
.brand {
  display: inline-flex;
  align-items: center;
  gap: var(--s-3);
  min-width: 0;
}
.tile {
  display: grid;
  place-items: center;
  flex: none;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: var(--r-md);
  background: linear-gradient(145deg, var(--color-brand), var(--color-primary));
  color: #fff;
  font: 700 1.25rem / 1 var(--font-heading);
}
.name {
  font: 700 var(--fs-lead) / var(--lh-tight) var(--font-heading);
  color: var(--color-text);
}
/* Narrow phones: a slightly smaller brand so it never collides with the header buttons, even at the largest text size. */
@media (max-width: 400px) {
  .tile {
    width: 2rem;
    height: 2rem;
    font-size: 1rem;
  }
  .name {
    font-size: var(--fs-small);
  }
}
</style>
