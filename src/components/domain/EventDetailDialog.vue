<!-- Full event details with sharing. Only public events can be shared; resident updates are never shared. -->
<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from '../../composables/useToast'
import { useFormat } from '../../i18n/format'
import { eventArt, isPhoto, localized } from '../../utils/content'
import AppButton from '../ui/AppButton.vue'
import AppDialog from '../ui/AppDialog.vue'
import AppIcon from '../ui/AppIcon.vue'
import AppIllustration from '../ui/AppIllustration.vue'

const props = defineProps({ modelValue: { type: Boolean, default: false }, event: { type: Object, default: null } })
const emit = defineEmits(['update:modelValue'])
const { t } = useI18n()
const fmt = useFormat()
const { notify } = useToast()

const title = computed(() => (props.event ? localized(props.event, 'title', t) : ''))
const description = computed(() => (props.event ? localized(props.event, 'description', t) : ''))
const location = computed(() => (props.event ? localized(props.event, 'location', t) : ''))
const url = computed(() => `${window.location.origin}/community?event=${props.event?.id}`)
const message = computed(() => (props.event ? `${title.value} – ${fmt.value.dateLong(props.event.date)}, ${fmt.value.timeRange(props.event.startTime, props.event.endTime)}` : ''))
const whatsapp = computed(() => `https://wa.me/?text=${encodeURIComponent(`${message.value} ${url.value}`)}`)
const facebook = computed(() => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url.value)}`)

async function copy() {
  try {
    await navigator.clipboard.writeText(url.value)
    notify(t('share.copied'))
  } catch {
    notify(t('share.copyFailed'), { kind: 'error' })
  }
}
</script>

<template>
  <AppDialog :model-value="modelValue" :title="title" @update:model-value="emit('update:modelValue', $event)">
    <div v-if="event" class="detail">
      <div class="media">
        <img v-if="isPhoto(event.image)" :src="event.image" :alt="title" />
        <AppIllustration v-else :name="eventArt(event)" />
      </div>
      <p class="chips">
        <span class="chip">{{ t(`eventCategory.${event.category}`) }}</span>
        <span v-if="!event.public" class="chip alt">{{ t('community.familiesOnly') }}</span>
      </p>
      <dl class="facts">
        <div><dt><AppIcon name="calendar" :size="18" />{{ t('community.when') }}</dt><dd>{{ fmt.dateLong(event.date) }}<br />{{ fmt.timeRange(event.startTime, event.endTime) }}</dd></div>
        <div><dt><AppIcon name="pin" :size="18" />{{ t('community.where') }}</dt><dd>{{ location }}</dd></div>
      </dl>
      <p class="desc">{{ description }}</p>

      <section class="share" :aria-label="t('share.title')">
        <h3>{{ t('share.title') }}</h3>
        <template v-if="event.public">
          <p class="note">{{ t('share.note') }}</p>
          <div class="buttons">
            <AppButton variant="secondary" :href="whatsapp"><AppIcon name="message" :size="20" />{{ t('share.whatsapp') }}</AppButton>
            <AppButton variant="secondary" :href="facebook"><AppIcon name="share" :size="20" />{{ t('share.facebook') }}</AppButton>
            <AppButton variant="secondary" @click="copy"><AppIcon name="copy" :size="20" />{{ t('share.copy') }}</AppButton>
          </div>
        </template>
        <p v-else class="note">{{ t('share.private') }}</p>
      </section>
    </div>
  </AppDialog>
</template>

<style scoped>
.detail {
  display: flex;
  flex-direction: column;
  gap: var(--s-4);
}
.media {
  overflow: hidden;
  aspect-ratio: 16 / 9;
  border-radius: var(--r-lg);
  background: var(--color-tint);
}
.media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
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
.facts {
  display: grid;
  gap: var(--s-3);
  margin: 0;
}
dt {
  display: flex;
  align-items: center;
  gap: var(--s-2);
  color: var(--color-text-muted);
  font: 600 var(--fs-small) / var(--lh-tight) var(--font-body);
}
dd {
  margin: 0;
  font-size: var(--fs-lead);
}
.desc {
  margin: 0;
}
.share {
  padding-top: var(--s-4);
  border-top: 1px solid var(--color-border);
}
.share h3 {
  margin-bottom: var(--s-2);
  font-size: var(--fs-h3);
}
.note {
  margin: 0 0 var(--s-3);
  color: var(--color-text-muted);
}
.buttons {
  display: flex;
  flex-wrap: wrap;
  gap: var(--s-2);
}
</style>
