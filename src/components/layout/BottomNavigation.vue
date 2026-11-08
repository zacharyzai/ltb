<!-- Phone tab bar: four tabs per role. Labels wrap rather than overflow, so they stay usable at 320px in every language. -->
<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { NAV, isOn } from '../../navigation'
import { useUiStore } from '../../stores/ui'
import AppIcon from '../ui/AppIcon.vue'

const { t } = useI18n()
const route = useRoute()
const ui = useUiStore()
const items = computed(() => NAV[ui.role].filter((item) => !item.desktopOnly))
</script>

<template>
  <nav class="tabs" :aria-label="t(ui.isStaff ? 'nav.staffMain' : 'nav.main')">
    <RouterLink
      v-for="item in items"
      :key="item.to"
      :to="item.to"
      class="tab"
      :class="{ on: isOn(item.to, route.path) }"
      :aria-current="isOn(item.to, route.path) ? 'page' : null"
    >
      <span class="pill"><AppIcon :name="item.icon" :size="24" /></span>
      <span class="label">{{ t(`tab.${item.key}`) }}</span>
    </RouterLink>
  </nav>
</template>

<style scoped>
.tabs {
  position: sticky;
  bottom: 0;
  z-index: 20;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 2px;
  padding: var(--s-2) var(--s-2) calc(var(--s-2) + env(safe-area-inset-bottom));
  background: var(--color-card);
  border-top: 1px solid var(--color-border);
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.06);
}
.tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: var(--s-1);
  min-height: var(--hit);
  padding: var(--s-1) 2px;
  border-radius: var(--r-md);
  color: var(--color-text-muted);
  font: 600 0.8125rem / 1.2 var(--font-body);
  text-align: center;
  text-decoration: none;
  overflow-wrap: break-word;
  hyphens: auto; /* a long word at the largest text size breaks at a syllable, not mid-letter */
}
/* At 320 px every pixel counts: with the gutters gone "Dashboard" and "Community" stay on one line at standard text size. */
@media (max-width: 360px) {
  .tabs {
    gap: 0;
    padding-inline: 0;
  }
  .tab {
    padding-inline: 0;
  }
}
/* Tamil letters are wider than Latin ones at the same size; a touch smaller keeps each tab label whole. */
:lang(ta) .tab {
  font-size: 0.75rem;
}
.pill {
  display: grid;
  place-items: center;
  width: 3.25rem;
  height: 2rem;
  border-radius: var(--r-pill);
  transition: background-color var(--dur-fast);
}
.label {
  max-width: 100%;
}
.tab.on {
  color: var(--color-tint-text);
}
.tab.on .pill {
  background: var(--color-tint-strong);
}
.tab.on .label {
  text-decoration: underline;
  text-decoration-thickness: 2px;
  text-underline-offset: 3px;
}
</style>
