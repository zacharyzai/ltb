<!-- Each language is written in its own script; the full name is read by screen readers. -->
<script setup>
import { useI18n } from 'vue-i18n'
import { LOCALES, setLocale } from '../../i18n'
import { useToast } from '../../composables/useToast'
import SegmentedControl from '../ui/SegmentedControl.vue'

const { t, locale } = useI18n()
const { notify } = useToast()
const SHORT = { en: 'EN', zh: '中文', ms: 'BM', ta: 'தமிழ்' }
const options = Object.keys(LOCALES).map((code) => ({ value: code, label: SHORT[code], srLabel: LOCALES[code], lang: code === 'zh' ? 'zh-Hans' : code }))

async function choose(code) {
  if (code === locale.value) return
  await setLocale(code)
  notify(t('toast.language', { name: LOCALES[code] })) // spoken in the new language
}
</script>

<template>
  <SegmentedControl :options="options" :model-value="locale" :label="t('settings.language')" :check="false" @update:model-value="choose" />
</template>
