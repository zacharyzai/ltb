<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import AppButton from '../../components/ui/AppButton.vue'
import AppDialog from '../../components/ui/AppDialog.vue'
import AppIcon from '../../components/ui/AppIcon.vue'
import EmptyState from '../../components/ui/EmptyState.vue'
import PageHeader from '../../components/ui/PageHeader.vue'
import QrPass from '../../components/ui/QrPass.vue'
import SectionHeader from '../../components/ui/SectionHeader.vue'
import VisitCard from '../../components/domain/VisitCard.vue'
import { useCaregiver } from '../../composables/useCaregiver'
import { useToast } from '../../composables/useToast'
import { useFormat } from '../../i18n/format'
import { SLOTS } from '../../data/visits'
import { useResidentsStore } from '../../stores/residents'
import { useVisitsStore } from '../../stores/visits'

const { t } = useI18n()
const fmt = useFormat()
const { caregiver } = useCaregiver()
const visits = useVisitsStore()
const residents = useResidentsStore()
const { notify } = useToast()

// Only this caregiver's bookings. Cancelled visits are shown apart from past ones.
const mine = (list) => list.filter((b) => b.caregiverId === caregiver.value.id)
const upcoming = computed(() => mine(visits.upcoming))
const past = computed(() => mine(visits.past).filter((b) => b.status !== 'cancelled'))
const cancelled = computed(() => mine(visits.past).filter((b) => b.status === 'cancelled'))

const passFor = ref(null)
const cancelFor = ref(null)
const passOpen = computed({ get: () => !!passFor.value, set: (v) => !v && (passFor.value = null) })
const cancelOpen = computed({ get: () => !!cancelFor.value, set: (v) => !v && (cancelFor.value = null) })
const slotOf = (b) => SLOTS.find((s) => s.id === b.slotId)

function confirmCancel() {
  const result = visits.cancelBooking(cancelFor.value.id)
  cancelFor.value = null
  if (result.ok) notify(t('visits.cancelledToast'))
  else notify(t(`errors.${result.error}`, result.params ?? {}), { kind: 'error' })
}
</script>

<template>
  <PageHeader :title="t('pages.visits')">
    {{ t('visits.intro') }}
    <template #actions><AppButton to="/visits/book"><AppIcon name="plus" :size="20" />{{ t('visits.book') }}</AppButton></template>
  </PageHeader>

  <div class="stack">
    <section :aria-label="t('visits.upcoming')">
      <SectionHeader :title="t('visits.upcoming')" />
      <div v-if="upcoming.length" class="list">
        <VisitCard v-for="b in upcoming" :key="b.id" :booking="b">
          <AppButton variant="secondary" @click="passFor = b"><AppIcon name="qr" :size="20" />{{ t('visits.viewPass') }}</AppButton>
          <AppButton v-if="!b.checkedInAt" variant="ghost" :to="{ name: 'book-visit', query: { reschedule: b.id } }">{{ t('visits.reschedule') }}</AppButton>
          <AppButton v-if="!b.checkedInAt" variant="danger" @click="cancelFor = b">{{ t('visits.cancel') }}</AppButton>
        </VisitCard>
      </div>
      <EmptyState v-else icon="calendar" :title="t('visits.noUpcoming')">
        <AppButton to="/visits/book">{{ t('visits.book') }}</AppButton>
      </EmptyState>
    </section>

    <section :aria-label="t('visits.past')">
      <SectionHeader :title="t('visits.past')" />
      <div v-if="past.length" class="list"><VisitCard v-for="b in past" :key="b.id" :booking="b" compact /></div>
      <EmptyState v-else icon="clock" :title="t('visits.noPast')" />
    </section>

    <section v-if="cancelled.length" :aria-label="t('visits.cancelledTitle')">
      <SectionHeader :title="t('visits.cancelledTitle')" />
      <div class="list"><VisitCard v-for="b in cancelled" :key="b.id" :booking="b" compact /></div>
    </section>
  </div>

  <AppDialog v-model="passOpen" :title="t('pass.title')">
    <div v-if="passFor" class="pass">
      <QrPass :value="passFor.ref" />
      <p class="who">{{ residents.byId(passFor.residentId).name }}<br />{{ fmt.dateLong(passFor.date) }}<br />{{ fmt.timeRange(slotOf(passFor).start, slotOf(passFor).end) }}</p>
      <p class="hint">{{ t('pass.hint') }}</p>
    </div>
  </AppDialog>

  <AppDialog v-model="cancelOpen" :title="t('visits.cancelTitle')">
    <p v-if="cancelFor" class="m-0">{{ t('visits.cancelText', { date: fmt.dateLong(cancelFor.date), time: fmt.timeRange(slotOf(cancelFor).start, slotOf(cancelFor).end) }) }}</p>
    <template #footer>
      <AppButton variant="secondary" @click="cancelOpen = false">{{ t('visits.keep') }}</AppButton>
      <AppButton variant="danger" @click="confirmCancel">{{ t('visits.confirmCancel') }}</AppButton>
    </template>
  </AppDialog>
</template>

<style scoped>
.stack {
  display: flex;
  flex-direction: column;
  gap: var(--s-8);
}
.list {
  display: grid;
  gap: var(--s-4);
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 24rem), 1fr));
}
.pass {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--s-3);
  text-align: center;
}
.who {
  margin: 0;
  font-size: var(--fs-lead);
}
.hint {
  margin: 0;
  color: var(--color-text-muted);
  font-size: var(--fs-small);
}
</style>
