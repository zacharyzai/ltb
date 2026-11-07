<!-- Beginner's guide: a short card walkthrough in the standard dialog (focus trapped, Esc closes, focus returns).
     Closing by any route counts as dismissed, so it is never reopened on its own; Finish counts as done. -->
<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { GUIDE } from '../../data/guide'
import { useToast } from '../../composables/useToast'
import { useUiStore } from '../../stores/ui'
import AppButton from '../ui/AppButton.vue'
import AppDialog from '../ui/AppDialog.vue'
import AppIcon from '../ui/AppIcon.vue'

const { t } = useI18n()
const ui = useUiStore()
const { notify } = useToast()

const index = ref(0)
const steps = computed(() => GUIDE[ui.role])
const step = computed(() => steps.value[index.value])
const last = computed(() => index.value === steps.value.length - 1)
const key = (field) => `guide.${ui.role}.${step.value.id}.${field}`
const position = computed(() => t('guide.step', { n: index.value + 1, total: steps.value.length }))

watch(() => ui.guideOpen, (open) => open && (index.value = 0))

async function go(delta) {
  index.value += delta
  await nextTick()
  document.querySelector('[data-guide-next]')?.focus() // the focused button may have just become disabled
}

async function close(outcome) {
  ui.closeGuide(outcome)
  if (outcome === 'done') notify(t('guide.doneToast'))
  await nextTick()
  // If the button that opened the guide has gone (the first-visit offer), start again from the page heading.
  if (!document.activeElement || document.activeElement === document.body) {
    const h1 = document.querySelector('main h1')
    h1?.setAttribute('tabindex', '-1')
    h1?.focus({ preventScroll: true })
  }
}
</script>

<template>
  <AppDialog :model-value="ui.guideOpen" :title="t('guide.title')" @update:model-value="(open) => !open && close('skipped')">
    <div v-if="step" class="guide">
      <span class="art" aria-hidden="true"><AppIcon :name="step.icon" :size="44" /></span>
      <p class="pos">{{ position }}</p>
      <h3 class="head">{{ t(key('title')) }}</h3>
      <p class="body">{{ t(key('body')) }}</p>
      <ol class="dots" :aria-label="t('guide.progress')">
        <li v-for="(s, i) in steps" :key="s.id" :class="{ on: i === index, past: i < index }" :aria-current="i === index ? 'step' : null"><span class="visually-hidden">{{ t('guide.step', { n: i + 1, total: steps.length }) }}</span></li>
      </ol>
      <p class="visually-hidden" role="status" aria-live="polite">{{ position }}: {{ t(key('title')) }}</p>
    </div>
    <template #footer>
      <AppButton variant="ghost" @click="close('skipped')">{{ t('guide.skip') }}</AppButton>
      <AppButton variant="secondary" :disabled="index === 0" @click="go(-1)"><AppIcon name="arrow-left" :size="20" />{{ t('guide.prev') }}</AppButton>
      <AppButton v-if="!last" data-guide-next @click="go(1)">{{ t('guide.next') }}<AppIcon name="arrow-right" :size="20" /></AppButton>
      <AppButton v-else data-guide-next @click="close('done')"><AppIcon name="check" :size="20" :stroke="3" />{{ t('guide.finish') }}</AppButton>
    </template>
  </AppDialog>
</template>

<style scoped>
.guide {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--s-3);
  text-align: center;
}
.art {
  display: grid;
  place-items: center;
  width: 5.5rem;
  height: 5.5rem;
  border-radius: var(--r-pill);
  background: var(--color-tint);
  color: var(--color-primary-text);
}
.pos {
  margin: 0;
  color: var(--color-text-muted);
  font: 600 var(--fs-small) / var(--lh-tight) var(--font-body);
}
.head {
  margin: 0;
  font-size: var(--fs-h2);
}
.body {
  margin: 0;
  font-size: var(--fs-lead);
}
.dots {
  display: flex;
  gap: var(--s-2);
  margin: var(--s-2) 0 0;
  padding: 0;
  list-style: none;
}
.dots li {
  width: 0.75rem;
  height: 0.75rem;
  border: 2px solid var(--color-primary-text);
  border-radius: var(--r-pill);
}
.dots li.past {
  background: var(--color-tint-strong);
}
.dots li.on {
  width: 2rem;
  background: var(--color-primary);
}
</style>
