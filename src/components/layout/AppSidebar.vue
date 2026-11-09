<!-- Desktop sidebar (992px and up): brand, navigation, then demo and accessibility controls. -->
<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ACCOUNT, HOME, NAV, isOn } from '../../navigation'
import { useUiStore } from '../../stores/ui'
import FeedbackDialog from '../domain/FeedbackDialog.vue'
import SettingsControls from '../controls/SettingsControls.vue'
import AppIcon from '../ui/AppIcon.vue'
import BrandMark from './BrandMark.vue'

const { t } = useI18n()
const route = useRoute()
const ui = useUiStore()
const items = computed(() => NAV[ui.role])
const account = computed(() => ACCOUNT[ui.role])
const feedbackOpen = ref(false)
</script>

<template>
  <aside class="side">
    <RouterLink :to="HOME[ui.role]" class="brand-link"><BrandMark /></RouterLink>

    <nav :aria-label="t(ui.isStaff ? 'nav.staffMain' : 'nav.main')">
      <ul class="side-list">
        <li v-for="item in items" :key="item.to">
          <RouterLink :to="item.to" class="side-item" :class="{ on: isOn(item.to, route.path) }" :aria-current="isOn(item.to, route.path) ? 'page' : null">
            <AppIcon :name="item.icon" :size="22" />
            <span>{{ t(`nav.${item.key}`) }}</span>
          </RouterLink>
        </li>
      </ul>
    </nav>

    <section class="settings" :aria-label="t('nav.settings')">
      <SettingsControls />
    </section>

    <button type="button" class="side-item guide" @click="ui.openGuide()">
      <AppIcon name="info" :size="22" />
      <span>{{ t('guide.open') }}</span>
    </button>

    <template v-if="!ui.isStaff">
      <button type="button" class="side-item feedback" @click="feedbackOpen = true">
        <AppIcon name="message" :size="22" />
        <span>{{ t('nav.feedback') }}</span>
      </button>
      <FeedbackDialog v-model="feedbackOpen" />
    </template>

    <RouterLink :to="account" class="side-item account" :class="{ on: route.path === account }" :aria-current="route.path === account ? 'page' : null">
      <AppIcon name="user" :size="22" />
      <span>{{ t('nav.account') }}</span>
    </RouterLink>
  </aside>
</template>

<style scoped>
.side {
  display: flex;
  flex-direction: column;
  gap: var(--s-3);
  position: sticky;
  top: 0;
  height: 100dvh;
  padding: var(--s-5) var(--s-4);
  overflow-y: auto;
  background: var(--color-card);
  border-right: 1px solid var(--color-border);
}
.brand-link {
  display: flex;
  align-items: center;
  min-height: var(--hit);
  padding: var(--s-1);
  border-radius: var(--r-md);
  text-decoration: none;
}
.side-list {
  display: flex;
  flex-direction: column;
  gap: var(--s-1);
  margin: 0;
  padding: 0;
  list-style: none;
}
.side-item {
  display: flex;
  align-items: center;
  gap: var(--s-3);
  min-height: var(--hit);
  padding: var(--s-2) var(--s-3);
  border-radius: var(--r-md);
  color: var(--color-text);
  font: 600 var(--fs-body) / var(--lh-tight) var(--font-body);
  text-decoration: none;
  transition: background-color var(--dur-fast);
}
.side-item:hover {
  background: var(--color-tint);
  color: var(--color-text);
}
.side-item.on {
  background: var(--color-tint-strong);
  color: var(--color-tint-text);
  box-shadow: inset 4px 0 0 var(--color-brand);
}
.settings {
  padding-top: var(--s-4);
  border-top: 1px solid var(--color-border);
}
.guide {
  margin-top: auto;
  border: 0;
  background: transparent;
  text-align: left;
  cursor: pointer;
}
.feedback {
  margin-top: calc(-1 * var(--s-3));
  border: 0;
  background: transparent;
  text-align: left;
  cursor: pointer;
}
.account {
  margin-top: calc(-1 * var(--s-3));
}
</style>
