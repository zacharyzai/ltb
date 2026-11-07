<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import AppButton from '../components/ui/AppButton.vue'
import AppCard from '../components/ui/AppCard.vue'
import AppIcon from '../components/ui/AppIcon.vue'
import AppIllustration from '../components/ui/AppIllustration.vue'
import PageHeader from '../components/ui/PageHeader.vue'
import { HOME } from '../navigation'
import { useUiStore } from '../stores/ui'

const { t } = useI18n()
const ui = useUiStore()
const home = computed(() => HOME[ui.role])
</script>

<template>
  <PageHeader :title="t('pages.notFound')" />
  <AppCard class="nf">
    <div class="art"><AppIllustration name="volunteer" /></div>
    <p class="text">{{ t('notFound.text') }}</p>
    <div><AppButton :to="home"><AppIcon name="home" />{{ t(ui.isStaff ? 'notFound.homeStaff' : 'notFound.homeCaregiver') }}</AppButton></div>
  </AppCard>
</template>

<style scoped>
.nf {
  max-width: 34rem;
}
.art {
  overflow: hidden;
  aspect-ratio: 16 / 9;
  border-radius: var(--r-lg);
  background: var(--color-tint);
}
.text {
  margin: 0;
  font-size: var(--fs-lead);
}
</style>
