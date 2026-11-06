<!-- The selected resident at a glance: name, relationship, general well-being status, last update and optional staff note. -->
<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useFormat } from '../../i18n/format'
import { residentNote } from '../../utils/content'
import StatusBadge from '../ui/StatusBadge.vue'

const props = defineProps({
  resident: { type: Object, required: true },
  relationship: { type: String, default: '' }, // stable id: mother | father | aunt
})
const { t } = useI18n()
const fmt = useFormat()
const initials = computed(() => props.resident.name.replace(/^(Madam|Mr|Mrs|Ms)\s+/, '').split(' ').slice(0, 2).map((w) => w[0]).join(''))
const note = computed(() => residentNote(props.resident, t))
</script>

<template>
  <section class="resident" :aria-label="resident.name">
    <div class="who">
      <span class="avatar" aria-hidden="true">{{ initials }}</span>
      <div>
        <h2 class="name">{{ resident.name }}</h2>
        <p v-if="relationship" class="rel">{{ t(`relationship.${relationship}`) }}</p>
      </div>
    </div>
    <StatusBadge :status="resident.status" />
    <p class="updated">
      <template v-if="resident.updatedAt">{{ t('resident.updated', { when: fmt.stamp(resident.updatedAt) }) }}</template>
      <template v-else>{{ t('resident.notUpdated') }}</template>
    </p>
    <p v-if="note" class="note"><strong>{{ t('resident.note') }}</strong> {{ note }}</p>
  </section>
</template>

<style scoped>
.resident {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--s-3);
  padding: var(--s-5);
  background: var(--color-tint);
  border: 1px solid var(--color-tint-strong);
  border-radius: var(--r-xl);
}
.who {
  display: flex;
  align-items: center;
  gap: var(--s-3);
}
.avatar {
  display: grid;
  place-items: center;
  flex: none;
  width: 3.5rem;
  height: 3.5rem;
  border-radius: var(--r-pill);
  background: var(--color-primary);
  color: var(--color-on-primary);
  font: 700 var(--fs-lead) / 1 var(--font-heading);
}
.name {
  font-size: var(--fs-h2);
}
.rel,
.updated {
  margin: 0;
  color: var(--color-text-muted);
}
.note {
  margin: 0;
  padding: var(--s-3);
  border-radius: var(--r-md);
  background: var(--color-card);
}
</style>
