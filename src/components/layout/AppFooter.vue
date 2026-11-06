<script setup>
import { useI18n } from 'vue-i18n'
import AppIcon from '../ui/AppIcon.vue'

const { t } = useI18n()
</script>

<template>
  <footer class="ft">
    <AppIcon name="shield" :size="22" />
    <p>{{ t('app.disclaimer') }}</p>
  </footer>
</template>

<style scoped>
.ft {
  display: flex;
  align-items: flex-start;
  gap: var(--s-3);
  max-width: var(--content-max);
  width: 100%;
  margin: 0 auto;
  padding: var(--s-4) var(--gutter) var(--s-6);
  color: var(--color-text-muted);
  font-size: var(--fs-small);
}
p {
  margin: 0;
}
</style>
