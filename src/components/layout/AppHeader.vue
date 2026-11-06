<!-- Compact phone header: brand on the left; settings and account on the right. -->
<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ACCOUNT, HOME } from '../../navigation'
import { useUiStore } from '../../stores/ui'
import SettingsControls from '../controls/SettingsControls.vue'
import AppDialog from '../ui/AppDialog.vue'
import AppIcon from '../ui/AppIcon.vue'
import BrandMark from './BrandMark.vue'

const { t } = useI18n()
const route = useRoute()
const ui = useUiStore()
const account = computed(() => ACCOUNT[ui.role])
const settingsOpen = ref(false)
</script>

<template>
  <header class="top">
    <RouterLink :to="HOME[ui.role]" class="brand-link" :aria-label="t('nav.brandHome')"><BrandMark /></RouterLink>
    <button type="button" class="icon-btn" :aria-label="t('nav.settings')" @click="settingsOpen = true"><AppIcon name="sliders" /></button>
    <RouterLink :to="account" class="icon-btn" :class="{ on: route.path === account }" :aria-label="t('nav.account')" :aria-current="route.path === account ? 'page' : null">
      <AppIcon name="user" />
    </RouterLink>
    <AppDialog v-model="settingsOpen" :title="t('nav.settings')"><SettingsControls /></AppDialog>
  </header>
</template>

<style scoped>
.top {
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  gap: var(--s-2);
  padding: var(--s-2) var(--s-4);
  padding-top: calc(var(--s-2) + env(safe-area-inset-top));
  background: var(--color-card);
  border-bottom: 1px solid var(--color-border);
}
.brand-link {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
  min-height: var(--hit);
  text-decoration: none;
}
.icon-btn {
  display: grid;
  place-items: center;
  flex: none;
  width: var(--hit);
  height: var(--hit);
  border: 2px solid var(--color-control-border);
  border-radius: var(--r-pill);
  background: var(--color-card);
  color: var(--color-text);
  cursor: pointer;
}
.icon-btn:hover {
  background: var(--color-tint);
}
.icon-btn.on {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--color-on-primary);
}
</style>
