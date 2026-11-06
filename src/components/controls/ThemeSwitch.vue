<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useUiStore } from '../../stores/ui'
import { useToast } from '../../composables/useToast'
import SegmentedControl from '../ui/SegmentedControl.vue'

const { t } = useI18n()
const ui = useUiStore()
const { notify } = useToast()
const options = computed(() => [
  { value: 'light', label: t('theme.light'), icon: 'sun' },
  { value: 'dark', label: t('theme.dark'), icon: 'moon' },
  { value: 'system', label: t('theme.system'), icon: 'monitor' },
])
function choose(value) {
  ui.setTheme(value)
  notify(t('toast.theme', { name: t(`theme.${value}`) }))
}
</script>

<template>
  <SegmentedControl :options="options" :model-value="ui.themeChoice" :label="t('settings.theme')" @update:model-value="choose" />
</template>
