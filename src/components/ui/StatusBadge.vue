<!-- A status shown as symbol + words + colour, never colour alone. These are general indicators, not medical assessments. -->
<script setup>
import { useI18n } from 'vue-i18n'

defineProps({
  status: { type: String, required: true }, // 'well' | 'resting' | 'contact' | 'available' | 'limited' | 'full'
})
const { t } = useI18n()
const SYMBOLS = { well: '●', resting: '◆', contact: '▲', available: '●', limited: '◆', full: '✕' }
const TONE = { well: 'well', resting: 'resting', contact: 'contact', available: 'well', limited: 'resting', full: 'full' }
</script>

<template>
  <span class="status" :class="`tone-${TONE[status]}`">
    <span aria-hidden="true">{{ SYMBOLS[status] }}</span>
    {{ t(`status.${status}`) }}
  </span>
</template>

<style scoped>
.status {
  display: inline-flex;
  align-items: center;
  gap: var(--s-2);
  min-height: 2rem;
  padding: 2px var(--s-3);
  border: 2px solid var(--b);
  border-radius: var(--r-pill);
  background: var(--bg);
  color: var(--fg);
  font: 600 var(--fs-small) / var(--lh-tight) var(--font-body);
}
.tone-well { --bg: var(--status-well-bg); --fg: var(--status-well-fg); --b: var(--status-well-border); }
.tone-resting { --bg: var(--status-resting-bg); --fg: var(--status-resting-fg); --b: var(--status-resting-border); }
.tone-contact { --bg: var(--status-contact-bg); --fg: var(--status-contact-fg); --b: var(--status-contact-border); }
.tone-full { --bg: var(--status-full-bg); --fg: var(--status-full-fg); --b: var(--status-full-border); }
</style>
