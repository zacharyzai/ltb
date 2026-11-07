<script setup>
import { nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import AppFooter from './components/layout/AppFooter.vue'
import AppHeader from './components/layout/AppHeader.vue'
import AppSidebar from './components/layout/AppSidebar.vue'
import BottomNavigation from './components/layout/BottomNavigation.vue'
import GuideDialog from './components/guide/GuideDialog.vue'
import AppToast from './components/ui/AppToast.vue'

const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()

// Tab title names the page in the chosen language.
watch(
  [() => route.meta.titleKey, locale],
  ([key]) => (document.title = key ? `${t(key)} · ${t('app.name')}` : t('app.name')),
  { immediate: true },
)

// After moving to another page, screen readers and keyboard users start at its heading.
router.afterEach(async (to, from, failure) => {
  if (failure || !from.name || to.path === from.path) return
  await nextTick()
  const h1 = document.querySelector('main h1')
  h1?.setAttribute('tabindex', '-1')
  h1?.focus({ preventScroll: true })
})

const skipToMain = () => document.getElementById('main')?.focus()
</script>

<template>
  <div class="shell">
    <a href="#main" class="skip" @click.prevent="skipToMain">{{ t('nav.skip') }}</a>
    <AppSidebar class="only-desktop" />
    <AppHeader class="only-mobile" />
    <div class="shell-main">
      <main id="main" class="shell-content" tabindex="-1"><RouterView /></main>
      <AppFooter />
    </div>
    <BottomNavigation class="only-mobile" />
    <GuideDialog />
    <AppToast />
  </div>
</template>
