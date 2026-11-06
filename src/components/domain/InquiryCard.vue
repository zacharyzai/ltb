<!-- One question to the care team, with its status and the staff reply once there is one. -->
<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useFormat } from '../../i18n/format'
import { useResidentsStore } from '../../stores/residents'
import { localized } from '../../utils/content'
import StatusBadge from '../ui/StatusBadge.vue'

const props = defineProps({ inquiry: { type: Object, required: true } })
const { t } = useI18n()
const fmt = useFormat()
const residents = useResidentsStore()
const question = computed(() => localized(props.inquiry, 'question', t))
const reply = computed(() => localized(props.inquiry, 'reply', t))
const resident = computed(() => residents.byId(props.inquiry.residentId))
</script>

<template>
  <article class="inquiry">
    <p class="top">
      <StatusBadge :status="inquiry.status" />
      <time class="when" :datetime="inquiry.createdAt">{{ fmt.stamp(inquiry.createdAt) }}</time>
    </p>
    <p class="about">{{ t('ask.about', { name: resident.shortName }) }} · {{ t(`topic.${inquiry.topic}`) }}</p>
    <p class="q">“{{ question }}”</p>
    <div v-if="reply" class="reply">
      <p class="who">{{ t('ask.careTeamReplied') }} · <time :datetime="inquiry.repliedAt">{{ fmt.stamp(inquiry.repliedAt) }}</time></p>
      <p class="text">{{ reply }}</p>
    </div>
  </article>
</template>

<style scoped>
.inquiry {
  display: flex;
  flex-direction: column;
  gap: var(--s-2);
  padding: var(--s-4) var(--s-5);
  background: var(--color-card);
  border: 1px solid var(--color-border);
  border-radius: var(--r-lg);
}
.top {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--s-2);
  margin: 0;
}
.when,
.about {
  color: var(--color-text-muted);
  font-size: var(--fs-small);
}
.about {
  margin: 0;
}
.q {
  margin: 0;
  font-size: var(--fs-lead);
}
.reply {
  padding: var(--s-3) var(--s-4);
  border-left: 4px solid var(--color-brand);
  border-radius: var(--r-sm);
  background: var(--color-tint);
}
.who {
  margin: 0 0 var(--s-1);
  color: var(--color-tint-text);
  font: 600 var(--fs-small) / var(--lh-tight) var(--font-body);
}
.text {
  margin: 0;
}
</style>
