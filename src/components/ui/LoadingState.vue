<!-- Spinner with a spoken label. -->
<script setup>
import { useI18n } from 'vue-i18n'
import AppIcon from './AppIcon.vue'

const { t } = useI18n()
</script>

<template>
  <div class="loading" role="status">
    <AppIcon name="loader" :size="28" class="spin" />
    <span>{{ t('common.loading') }}</span>
  </div>
</template>

<style scoped>
.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--s-3);
  padding: var(--s-6);
  color: var(--color-text-muted);
}
.spin {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
