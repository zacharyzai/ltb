<!-- Accessible dialog on the native <dialog> element: focus is trapped, Esc and the backdrop close it,
     and focus returns to whatever opened it. A bottom sheet on phones, a centred card on larger screens. -->
<script setup>
import { nextTick, ref, useId, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import AppIcon from './AppIcon.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, required: true },
})
const emit = defineEmits(['update:modelValue', 'close'])
const { t } = useI18n()
const box = ref(null)
const titleId = useId()
let opener = null

watch(
  () => props.modelValue,
  async (open) => {
    await nextTick()
    if (open && !box.value.open) {
      opener = document.activeElement
      box.value.showModal()
    } else if (!open && box.value.open) {
      box.value.close()
      opener?.focus?.() // the browser usually does this too; be explicit for older ones
      opener = null
    }
  },
  { immediate: true, flush: 'post' },
)

const close = () => {
  emit('update:modelValue', false)
  emit('close')
}
// A click on the dimmed area (the <dialog> itself, not its contents) closes it.
const onBackdrop = (event) => event.target === box.value && close()
</script>

<template>
  <dialog ref="box" class="app-dialog" :aria-labelledby="titleId" @cancel.prevent="close" @click="onBackdrop">
    <div v-if="modelValue" class="dlg">
      <div class="dlg-head">
        <h2 :id="titleId">{{ title }}</h2>
        <button type="button" class="dlg-close" :aria-label="t('dialog.close')" @click="close">
          <AppIcon name="x" />
        </button>
      </div>
      <div class="dlg-body"><slot /></div>
      <div v-if="$slots.footer" class="dlg-foot"><slot name="footer" /></div>
    </div>
  </dialog>
</template>

<style scoped>
.app-dialog {
  width: min(34rem, calc(100% - 2rem));
  max-height: calc(100dvh - 2rem);
  padding: 0;
  border: 1px solid var(--color-border);
  border-radius: var(--r-xl);
  background: var(--color-card);
  color: var(--color-text);
  box-shadow: var(--shadow-raised);
  overflow: auto;
}
.app-dialog[open] {
  animation: dlg-in var(--dur) var(--ease-out);
}
.app-dialog::backdrop {
  background: var(--scrim);
}
.dlg {
  display: flex;
  flex-direction: column;
  gap: var(--s-4);
  padding: var(--s-5);
}
.dlg-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--s-3);
}
h2 {
  font-size: var(--fs-h2);
}
.dlg-close {
  display: grid;
  place-items: center;
  flex: none;
  width: var(--hit);
  height: var(--hit);
  border: 2px solid var(--color-control-border);
  border-radius: var(--r-md);
  background: var(--color-card);
  color: var(--color-text);
  cursor: pointer;
}
.dlg-close:hover {
  background: var(--color-tint);
}
.dlg-foot {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: var(--s-3);
}
@keyframes dlg-in {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
}
/* Phones: a bottom sheet. */
@media (max-width: 575.98px) {
  .app-dialog {
    width: 100%;
    max-width: 100%;
    max-height: 92dvh;
    margin: auto 0 0;
    border-radius: var(--r-xl) var(--r-xl) 0 0;
    padding-bottom: env(safe-area-inset-bottom);
  }
}
</style>
