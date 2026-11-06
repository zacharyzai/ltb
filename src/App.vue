<script setup>
import { watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()
const route = useRoute()

// Tab title names the page in the chosen language.
watch(
  [() => route.meta.titleKey, locale],
  ([key]) => (document.title = key ? `${t(key)} · ${t('app.name')}` : t('app.name')),
  { immediate: true },
)
</script>

<template>
  <RouterView />
</template>
