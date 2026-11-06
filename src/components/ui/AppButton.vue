<!-- Button or link. Pass `to` for an in-app link, `href` for an external one. -->
<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

const props = defineProps({
  variant: { type: String, default: 'primary' }, // 'primary' | 'secondary' | 'ghost' | 'danger'
  block: { type: Boolean, default: false },
  busy: { type: Boolean, default: false },
  to: { type: [String, Object], default: null },
  href: { type: String, default: null },
})
const tag = computed(() => (props.to ? RouterLink : props.href ? 'a' : 'button'))
const attrs = computed(() =>
  props.to ? { to: props.to } : props.href ? { href: props.href, target: '_blank', rel: 'noopener noreferrer' } : { type: 'button', disabled: props.busy || undefined, 'aria-busy': props.busy || undefined },
)
</script>

<template>
  <component :is="tag" v-bind="attrs" class="app-btn" :class="[`is-${variant}`, { block }]"><slot /></component>
</template>

<style scoped>
.app-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--s-2);
  min-height: var(--hit);
  padding: var(--s-2) var(--s-5);
  border: 2px solid transparent;
  border-radius: var(--r-md);
  font: 600 var(--fs-body) / var(--lh-tight) var(--font-heading);
  text-align: center;
  text-decoration: none;
  cursor: pointer;
  transition: background-color var(--dur-fast), border-color var(--dur-fast), transform var(--dur-fast);
}
.app-btn:active {
  transform: scale(0.98);
}
.block {
  display: flex;
  width: 100%;
}
.is-primary {
  background: var(--color-primary);
  color: var(--color-on-primary);
}
.is-primary:hover {
  background: var(--color-primary-hover);
  color: var(--color-on-primary);
}
.is-secondary {
  background: var(--color-card);
  color: var(--color-primary-text);
  border-color: var(--color-primary-text);
}
.is-secondary:hover {
  background: var(--color-tint);
  color: var(--color-primary-text);
}
.is-ghost {
  background: transparent;
  color: var(--color-primary-text);
}
.is-ghost:hover {
  background: var(--color-tint);
  color: var(--color-primary-text);
}
.is-danger {
  background: var(--color-card);
  color: var(--color-danger-text);
  border-color: var(--color-danger-text);
}
.is-danger:hover {
  background: var(--color-danger-bg);
  color: var(--color-danger-text);
}
.app-btn:disabled {
  background: var(--status-full-bg);
  color: var(--status-full-fg);
  border-color: var(--status-full-border);
  cursor: not-allowed;
  transform: none;
}
</style>
