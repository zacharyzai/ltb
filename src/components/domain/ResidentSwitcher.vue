<!-- Lets a caregiver with more than one linked resident choose whose updates they are viewing. Hidden when there is only one. -->
<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useCaregiver } from '../../composables/useCaregiver'
import SegmentedControl from '../ui/SegmentedControl.vue'

const props = defineProps({ caption: { type: String, default: 'resident.viewing' } }) // i18n key for the label
const { t } = useI18n()
const { linked, selected, select } = useCaregiver()
const options = computed(() => linked.value.map((r) => ({ value: r.id, label: r.shortName, srLabel: r.name })))
</script>

<template>
  <div v-if="linked.length > 1" class="switcher">
    <p class="cap" aria-hidden="true">{{ t(props.caption) }}</p>
    <SegmentedControl :options="options" :model-value="selected?.id ?? ''" :label="t(props.caption)" wrap @update:model-value="select" />
  </div>
</template>

<style scoped>
.switcher {
  display: flex;
  flex-direction: column;
  gap: var(--s-2);
  margin-bottom: var(--s-5);
  max-width: 34rem;
}
.cap {
  margin: 0;
  color: var(--color-text-muted);
  font: 600 var(--fs-small) / var(--lh-tight) var(--font-body);
}
</style>
