<!-- Shows the current message from useToast() in a live region. Mount once, in App.vue. -->
<script setup>
import { useI18n } from 'vue-i18n'
import { useToast } from '../../composables/useToast'
import AppIcon from './AppIcon.vue'

const { t } = useI18n()
const { toasts, dismiss } = useToast()
</script>

<template>
  <div class="toast-host">
    <!-- Both live regions stay in the page so screen readers announce what appears inside them. -->
    <div role="status" aria-live="polite">
      <div v-for="toast in toasts.filter((x) => x.kind === 'info')" :key="toast.id" class="app-toast">
        <AppIcon name="check" :size="20" />
        <span>{{ toast.text }}</span>
        <button type="button" :aria-label="t('toast.dismiss')" @click="dismiss(toast.id)"><AppIcon name="x" :size="18" /></button>
      </div>
    </div>
    <div role="alert">
      <div v-for="toast in toasts.filter((x) => x.kind === 'error')" :key="toast.id" class="app-toast is-error">
        <AppIcon name="alert" :size="20" />
        <span>{{ toast.text }}</span>
        <button type="button" :aria-label="t('toast.dismiss')" @click="dismiss(toast.id)"><AppIcon name="x" :size="18" /></button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.toast-host {
  position: fixed;
  z-index: 1100;
  left: var(--s-4);
  right: var(--s-4);
  bottom: calc(7.5rem + env(safe-area-inset-bottom)); /* above the phone tab bar */
  display: flex;
  justify-content: center;
  pointer-events: none;
}
.app-toast {
  display: flex;
  align-items: center;
  gap: var(--s-3);
  max-width: 28rem;
  padding: var(--s-2) var(--s-2) var(--s-2) var(--s-4);
  border-radius: var(--r-lg);
  background: var(--color-text);
  color: var(--color-page);
  box-shadow: var(--shadow-raised);
  pointer-events: auto;
  animation: toast-in var(--dur) var(--ease-out);
}
.app-toast.is-error {
  background: var(--color-sas-red-solid);
  color: var(--color-on-primary);
}
.app-toast button {
  display: grid;
  place-items: center;
  flex: none;
  width: var(--hit);
  height: var(--hit);
  border: 0;
  border-radius: var(--r-md);
  background: transparent;
  color: inherit;
  cursor: pointer;
}
@keyframes toast-in {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
}
@media (min-width: 992px) {
  .toast-host {
    left: auto;
    right: var(--s-8);
    bottom: var(--s-8);
  }
}
</style>
