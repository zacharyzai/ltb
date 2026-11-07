<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useFormat } from '../../i18n/format'
import { eventArt, isPhoto, localized } from '../../utils/content'
import AppButton from '../ui/AppButton.vue'
import AppIcon from '../ui/AppIcon.vue'
import AppIllustration from '../ui/AppIllustration.vue'

const props = defineProps({
  event: { type: Object, required: true },
  compact: { type: Boolean, default: false },
})
defineEmits(['details'])
const { t } = useI18n()
const fmt = useFormat()
const title = computed(() => localized(props.event, 'title', t))
const description = computed(() => localized(props.event, 'description', t))
const location = computed(() => localized(props.event, 'location', t))
</script>

<template>
  <article class="event" :class="{ compact }">
    <div class="media">
      <img v-if="isPhoto(event.image)" :src="event.image" :alt="title" />
      <AppIllustration v-else :name="eventArt(event)" />
    </div>
    <div class="body">
      <p class="chips">
        <span class="chip">{{ t(`eventCategory.${event.category}`) }}</span>
        <span v-if="!event.public" class="chip alt">{{ t('community.familiesOnly') }}</span>
      </p>
      <h3 class="title">{{ title }}</h3>
      <p class="line"><AppIcon name="calendar" :size="18" />{{ fmt.dateShort(event.date) }} · {{ fmt.timeRange(event.startTime, event.endTime) }}</p>
      <p class="line"><AppIcon name="pin" :size="18" />{{ location }}</p>
      <p v-if="!compact" class="desc">{{ description }}</p>
      <div class="actions">
        <AppButton variant="secondary" :aria-label="t('community.viewDetailsFor', { title })" @click="$emit('details', event)">{{ t('community.viewDetails') }}</AppButton>
        <slot />
      </div>
    </div>
  </article>
</template>

<style scoped>
.event {
  transition: box-shadow var(--dur), transform var(--dur);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--color-card);
  border: 1px solid var(--color-border);
  border-radius: var(--r-xl);
  box-shadow: var(--shadow-card);
}
.media {
  aspect-ratio: 16 / 9;
  background: var(--color-tint);
}
.media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.body {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: var(--s-2);
  padding: var(--s-4) var(--s-5) var(--s-5);
}
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--s-2);
  margin: 0;
}
.chip {
  padding: 2px var(--s-3);
  border-radius: var(--r-pill);
  background: var(--color-tint-strong);
  color: var(--color-tint-text);
  font: 600 var(--fs-small) / var(--lh-tight) var(--font-body);
}
.chip.alt {
  background: var(--color-info-bg);
  color: var(--color-info-text);
}
.title {
  font-size: var(--fs-h3);
}
.line {
  display: flex;
  align-items: flex-start;
  gap: var(--s-2);
  margin: 0;
}
.line :deep(svg) {
  margin-top: 0.2em;
}
.desc {
  margin: var(--s-1) 0 0;
  color: var(--color-text-muted);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--s-2);
  margin-top: auto;
  padding-top: var(--s-3);
}
.compact .media {
  aspect-ratio: 21 / 9;
}
@media (hover: hover) {
  .event:hover {
    box-shadow: var(--shadow-raised);
    transform: translateY(-2px);
  }
}
</style>
