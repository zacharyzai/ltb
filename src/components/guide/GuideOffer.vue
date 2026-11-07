<!-- First-visit invitation to the guide: a card on Home / Dashboard only, never a pop-up, so it cannot interrupt a form. -->
<script setup>
import { useI18n } from 'vue-i18n'
import { useUiStore } from '../../stores/ui'
import AppButton from '../ui/AppButton.vue'
import AppIcon from '../ui/AppIcon.vue'

const { t } = useI18n()
const ui = useUiStore()
</script>

<template>
  <section v-if="ui.showGuideOffer" class="offer" :aria-label="t('guide.title')">
    <span class="art" aria-hidden="true"><AppIcon name="info" :size="28" /></span>
    <div class="copy">
      <h2>{{ t('guide.offerTitle') }}</h2>
      <p>{{ t('guide.offerText') }}</p>
    </div>
    <div class="actions">
      <AppButton @click="ui.openGuide()">{{ t('guide.offerStart') }}</AppButton>
      <AppButton variant="ghost" @click="ui.closeGuide('skipped')">{{ t('guide.offerLater') }}</AppButton>
    </div>
  </section>
</template>

<style scoped>
.offer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--s-4);
  margin-bottom: var(--s-6);
  padding: var(--s-4) var(--s-5);
  border: 1px solid var(--color-tint-strong);
  border-radius: var(--r-xl);
  background: var(--color-tint);
}
.art {
  display: grid;
  place-items: center;
  flex: none;
  width: 3.25rem;
  height: 3.25rem;
  border-radius: var(--r-pill);
  background: var(--color-card);
  color: var(--color-primary-text);
}
.copy {
  flex: 1 1 14rem;
}
h2 {
  font-size: var(--fs-h3);
}
p {
  margin: var(--s-1) 0 0;
}
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--s-2);
}
</style>
