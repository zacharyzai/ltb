<!-- A resident moment: illustration (or uploaded picture), title, caption, category and date. -->
<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useFormat } from '../../i18n/format'
import { useResidentsStore } from '../../stores/residents'
import { isPhoto, localized, momentArt } from '../../utils/content'
import AppIllustration from '../ui/AppIllustration.vue'

const props = defineProps({
  moment: { type: Object, required: true },
  compact: { type: Boolean, default: false },
  showResidents: { type: Boolean, default: false }, // name the tagged residents (only those the viewer is linked to)
  visibleResidentIds: { type: Array, default: () => [] },
})
const { t } = useI18n()
const fmt = useFormat()
const residents = useResidentsStore()
const title = computed(() => localized(props.moment, 'title', t))
const caption = computed(() => localized(props.moment, 'caption', t))
const tagged = computed(() => props.moment.residentIds.filter((id) => props.visibleResidentIds.includes(id)).map((id) => residents.byId(id)))
</script>

<template>
  <article class="moment" :class="{ compact }">
    <div class="media">
      <img v-if="isPhoto(moment.image)" :src="moment.image" :alt="title" />
      <AppIllustration v-else :name="momentArt(moment)" />
    </div>
    <div class="body">
      <p class="meta">
        <span class="chip">{{ t(`category.${moment.category}`) }}</span>
        <time :datetime="moment.createdAt">{{ fmt.stamp(moment.createdAt) }}</time>
      </p>
      <h3 class="title">{{ title }}</h3>
      <p v-if="caption" class="caption">{{ caption }}</p>
      <p v-if="showResidents && tagged.length" class="tags">
        <span v-for="r in tagged" :key="r.id" class="tag">{{ r.shortName }}</span>
      </p>
    </div>
  </article>
</template>

<style scoped>
.moment {
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
  flex-direction: column;
  gap: var(--s-2);
  padding: var(--s-4) var(--s-5) var(--s-5);
}
.meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--s-2) var(--s-3);
  margin: 0;
  color: var(--color-text-muted);
  font-size: var(--fs-small);
}
.chip,
.tag {
  padding: 2px var(--s-3);
  border-radius: var(--r-pill);
  background: var(--color-tint-strong);
  color: var(--color-tint-text);
  font-weight: 600;
}
.title {
  font-size: var(--fs-h3);
}
.caption {
  margin: 0;
}
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--s-2);
  margin: 0;
  font-size: var(--fs-small);
}
.tag {
  background: var(--color-surface-2);
  color: var(--color-text);
}
.compact .media {
  aspect-ratio: 21 / 9;
}
@media (hover: hover) {
  .moment:hover {
    box-shadow: var(--shadow-raised);
    transform: translateY(-2px);
  }
}
</style>
