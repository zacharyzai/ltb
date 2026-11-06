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
  { value: 'standard', label: t('textSize.standard'), glyph: 1 },
  { value: 'large', label: t('textSize.large'), glyph: 1.25 },
  { value: 'xlarge', label: t('textSize.xlarge'), glyph: 1.5 },
])
function choose(value) {
  ui.setTextSize(value)
  notify(t('toast.textSize', { name: t(`textSize.${value}`) }))
}
</script>

<template>
  <SegmentedControl :options="options" :model-value="ui.textSize" :label="t('settings.textSize')" :check="false" @update:model-value="choose">
    <template #option="{ option }">
      <span class="glyph" aria-hidden="true" :style="{ fontSize: `${option.glyph}rem` }">A</span>
      <span class="word">{{ option.label }}</span>
    </template>
  </SegmentedControl>
</template>

<style scoped>
.glyph {
  flex-basis: 100%;
  font-family: var(--font-heading);
  font-weight: 700;
  line-height: 1.1;
}
.word {
  flex-basis: 100%;
  font-size: 0.9em;
}
</style>
