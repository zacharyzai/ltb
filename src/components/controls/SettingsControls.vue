<!-- The four demo and accessibility controls, shared by the sidebar and the phone settings dialog. -->
<script setup>
import { useI18n } from 'vue-i18n'
import LanguageSwitch from './LanguageSwitch.vue'
import RoleSwitch from './RoleSwitch.vue'
import TextSizeSwitch from './TextSizeSwitch.vue'
import ThemeSwitch from './ThemeSwitch.vue'
import AppIcon from '../ui/AppIcon.vue'

const { t } = useI18n()
const rows = [
  { icon: 'swap', label: 'role.label', control: RoleSwitch },
  { icon: 'globe', label: 'settings.language', control: LanguageSwitch },
  { icon: 'sun', label: 'settings.theme', control: ThemeSwitch },
  { icon: 'type', label: 'settings.textSize', control: TextSizeSwitch },
]
</script>

<template>
  <div class="controls">
    <div v-for="row in rows" :key="row.label" class="setting">
      <p class="setting-label" aria-hidden="true"><AppIcon :name="row.icon" :size="18" />{{ t(row.label) }}</p>
      <component :is="row.control" />
    </div>
  </div>
</template>

<style scoped>
.controls {
  display: flex;
  flex-direction: column;
  gap: var(--s-4);
}
.setting {
  display: flex;
  flex-direction: column;
  gap: var(--s-2);
}
.setting-label {
  display: flex;
  align-items: center;
  gap: var(--s-2);
  margin: 0;
  color: var(--color-text-muted);
  font: 600 var(--fs-small) / var(--lh-tight) var(--font-body);
}
</style>
