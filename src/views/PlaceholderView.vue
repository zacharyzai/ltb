<!-- Temporary page used by every route until its phase builds the real view. Shows the shared components in the new shell. -->
<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import AppButton from '../components/ui/AppButton.vue'
import AppCard from '../components/ui/AppCard.vue'
import AppDialog from '../components/ui/AppDialog.vue'
import AppIcon from '../components/ui/AppIcon.vue'
import EmptyState from '../components/ui/EmptyState.vue'
import LoadingState from '../components/ui/LoadingState.vue'
import PageHeader from '../components/ui/PageHeader.vue'
import SectionHeader from '../components/ui/SectionHeader.vue'
import StatusBadge from '../components/ui/StatusBadge.vue'
import { useToast } from '../composables/useToast'

const { t } = useI18n()
const route = useRoute()
const { notify } = useToast()
const dialogOpen = ref(false)
const STATUSES = ['well', 'resting', 'contact', 'available', 'limited', 'full']

function confirm() {
  dialogOpen.value = false
  notify(t('placeholder.toastText'))
}
</script>

<template>
  <PageHeader :title="t(route.meta.titleKey)">
    {{ t('placeholder.description') }}
    <template #actions>
      <AppButton variant="secondary" @click="notify(t('placeholder.toastText'))">{{ t('placeholder.exampleButton') }}</AppButton>
    </template>
  </PageHeader>

  <div class="stack">
    <AppCard v-if="route.name === 'staff-dashboard'" tint :title="t('placeholder.quickTitle')">
      <p class="m-0">{{ t('placeholder.quickText') }}</p>
      <AppButton to="/staff/moment" block><AppIcon name="camera" />{{ t('nav.postMoment') }}</AppButton>
    </AppCard>

    <AppCard :title="t('placeholder.cardTitle')">
      <p class="m-0">{{ t('placeholder.cardText') }}</p>
      <div class="cluster">
        <AppButton>{{ t('placeholder.primary') }}</AppButton>
        <AppButton variant="secondary">{{ t('placeholder.secondary') }}</AppButton>
        <AppButton variant="ghost">{{ t('placeholder.ghost') }}</AppButton>
        <AppButton variant="danger">{{ t('placeholder.danger') }}</AppButton>
        <AppButton disabled>{{ t('placeholder.disabled') }}</AppButton>
      </div>
      <div class="cluster" :aria-label="t('placeholder.statusTitle')" role="group">
        <StatusBadge v-for="s in STATUSES" :key="s" :status="s" />
      </div>
      <div class="cluster">
        <AppButton variant="secondary" @click="dialogOpen = true">{{ t('placeholder.openDialog') }}</AppButton>
      </div>
    </AppCard>

    <section>
      <SectionHeader :title="t('placeholder.sectionTitle')" />
      <div class="grid2">
        <EmptyState icon="inbox" :title="t('empty.title')">{{ t('empty.text') }}</EmptyState>
        <AppCard><LoadingState /></AppCard>
      </div>
    </section>
  </div>

  <AppDialog v-model="dialogOpen" :title="t('placeholder.dialogTitle')">
    <p class="m-0">{{ t('placeholder.dialogText') }}</p>
    <template #footer>
      <AppButton variant="secondary" @click="dialogOpen = false">{{ t('dialog.cancel') }}</AppButton>
      <AppButton @click="confirm">{{ t('dialog.confirm') }}</AppButton>
    </template>
  </AppDialog>
</template>

<style scoped>
.stack {
  display: flex;
  flex-direction: column;
  gap: var(--s-6);
}
.cluster {
  display: flex;
  flex-wrap: wrap;
  gap: var(--s-3);
}
.grid2 {
  display: grid;
  gap: var(--s-4);
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 16rem), 1fr));
}
</style>
