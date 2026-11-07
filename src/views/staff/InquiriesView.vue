<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import AppButton from '../../components/ui/AppButton.vue'
import AppDialog from '../../components/ui/AppDialog.vue'
import EmptyState from '../../components/ui/EmptyState.vue'
import FormField from '../../components/ui/FormField.vue'
import InquiryCard from '../../components/domain/InquiryCard.vue'
import PageHeader from '../../components/ui/PageHeader.vue'
import SegmentedControl from '../../components/ui/SegmentedControl.vue'
import { caregivers } from '../../data/caregivers'
import { INQUIRY_STATUSES, MAX_QUESTION_LENGTH, REPLY_TEMPLATES } from '../../data/inquiries'
import { useToast } from '../../composables/useToast'
import { useInquiriesStore } from '../../stores/inquiries'
import { useUiStore } from '../../stores/ui'

const { t } = useI18n()
const inquiries = useInquiriesStore()
const ui = useUiStore()
const { notify } = useToast()

const filter = ref('all')
const openId = ref(null)
const reply = ref('')
const error = ref('')

const options = computed(() => [{ value: 'all', label: t('staff.inq.all') }, ...INQUIRY_STATUSES.map((s) => ({ value: s, label: t(`inquiryStatus.${s}`) }))])
const shown = computed(() => inquiries.inquiries.filter((q) => filter.value === 'all' || q.status === filter.value).sort((a, b) => b.createdAt.localeCompare(a.createdAt)))
const open = computed(() => inquiries.byId(openId.value))
const actionLabel = (q) => (q.status === 'answered' ? t('staff.inq.viewReply') : t('staff.inq.reply'))
const caregiverName = (q) => caregivers.find((c) => c.id === q.caregiverId)?.name

function openInquiry(q) {
  reply.value = ''
  error.value = ''
  if (q.status === 'pending') inquiries.markInReview(q.id)
  openId.value = q.id
}
function close() {
  openId.value = null
}
function send() {
  const result = inquiries.replyToInquiry(openId.value, reply.value, ui.currentStaffId)
  if (!result.ok) {
    error.value = t(`errors.${result.error}`, result.params ?? {})
    return
  }
  notify(t('staff.inq.sentToast'))
  close()
}
</script>

<template>
  <PageHeader :title="t('pages.staffInquiries')">{{ t('staff.inq.intro') }}</PageHeader>

  <div class="stack">
    <SegmentedControl v-model="filter" :options="options" :label="t('staff.inq.filterLabel')" :check="false" wrap />
    <div v-if="shown.length" class="cards">
      <InquiryCard v-for="q in shown" :key="q.id" :inquiry="q" for-staff>
        <AppButton :variant="q.status === 'answered' ? 'secondary' : 'primary'" :aria-label="`${actionLabel(q)}, ${caregiverName(q)}`" @click="openInquiry(q)">
          {{ actionLabel(q) }}
        </AppButton>
      </InquiryCard>
    </div>
    <EmptyState v-else icon="inbox" :title="t('staff.inq.empty')">{{ t('staff.inq.emptyText') }}</EmptyState>
  </div>

  <AppDialog :model-value="Boolean(open)" :title="open ? t('staff.inq.dialogTitle', { name: caregiverName(open) }) : ''" @update:model-value="close">
    <div v-if="open" class="dlg">
      <InquiryCard :inquiry="open" for-staff />
      <form v-if="open.status !== 'answered'" class="form" novalidate @submit.prevent="send">
        <div role="group" :aria-label="t('staff.inq.templates')" class="templates">
          <p class="label">{{ t('staff.inq.templates') }}</p>
          <p class="help">{{ t('staff.inq.templatesHelp') }}</p>
          <AppButton v-for="id in REPLY_TEMPLATES" :key="id" variant="secondary" class="tpl" @click="reply = t(`replyTemplate.${id}`)">
            {{ t(`replyTemplate.${id}`) }}
          </AppButton>
        </div>
        <FormField v-model="reply" type="textarea" :rows="4" :label="t('staff.inq.replyLabel')" :placeholder="t('staff.inq.replyPlaceholder')" :maxlength="MAX_QUESTION_LENGTH" :help="t('ask.counter', { n: reply.length, max: MAX_QUESTION_LENGTH })" :error="error" required />
        <div class="actions">
          <AppButton variant="secondary" @click="close">{{ t('dialog.cancel') }}</AppButton>
          <AppButton type="submit">{{ t('staff.inq.send') }}</AppButton>
        </div>
      </form>
    </div>
  </AppDialog>
</template>

<style scoped>
.stack,
.dlg,
.form {
  display: flex;
  flex-direction: column;
  gap: var(--s-4);
}
.cards {
  display: grid;
  gap: var(--s-4);
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 24rem), 1fr));
}
.templates {
  display: flex;
  flex-direction: column;
  gap: var(--s-2);
}
.label {
  margin: 0;
  font: 600 var(--fs-body) / var(--lh-tight) var(--font-body);
}
.help {
  margin: 0;
  color: var(--color-text-muted);
  font-size: var(--fs-small);
}
.tpl {
  justify-content: flex-start;
  text-align: left;
  font-weight: 400;
}
.actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: var(--s-3);
}
</style>
