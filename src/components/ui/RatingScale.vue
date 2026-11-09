<!-- A numeric scale (e.g. 1 to 5, 0 to 10) built on native radio buttons: arrow keys, one tab stop and screen-reader groups come free. -->
<script setup>
import { computed, useId } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  modelValue: { type: String, default: '' },
  legend: { type: String, required: true },
  from: { type: Number, required: true },
  to: { type: Number, required: true },
  lowLabel: { type: String, required: true },
  highLabel: { type: String, required: true },
  columns: { type: Number, default: 5 },
  optional: { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue'])
const { t } = useI18n()
const name = useId()
const values = computed(() => Array.from({ length: props.to - props.from + 1 }, (_, i) => String(props.from + i)))
</script>

<template>
  <fieldset class="rate">
    <legend>{{ legend }} <span v-if="optional" class="opt">({{ t('form.optional') }})</span></legend>
    <div class="tiles" :style="{ '--cols': columns }">
      <label v-for="v in values" :key="v" class="tile">
        <input type="radio" class="visually-hidden" :name="name" :value="v" :checked="modelValue === v" @change="emit('update:modelValue', v)" />
        <span class="face">{{ v }}</span>
      </label>
    </div>
    <p class="ends"><span>{{ from }} = {{ lowLabel }}</span><span>{{ to }} = {{ highLabel }}</span></p>
    <p class="chosen" aria-live="polite">{{ modelValue ? t('feedback.chosen', { n: modelValue }) : '' }}</p>
  </fieldset>
</template>

<style scoped>
.rate {
  min-width: 0;
  margin: 0;
  padding: 0;
  border: 0;
}
legend {
  float: none;
  width: 100%;
  margin: 0 0 var(--s-3);
  padding: 0;
  font: 600 var(--fs-body) / var(--lh-tight) var(--font-body);
}
.opt {
  color: var(--color-text-muted);
  font-weight: 400;
}
.tiles {
  display: grid;
  grid-template-columns: repeat(var(--cols), minmax(0, 1fr));
  gap: var(--s-2);
}
.tile {
  display: block;
  cursor: pointer;
}
.face {
  display: grid;
  place-items: center;
  min-height: calc(var(--hit) + var(--s-2));
  border: 2px solid var(--color-control-border);
  border-radius: var(--r-md);
  background: var(--color-card);
  color: var(--color-text);
  font: 600 var(--fs-lead) / 1 var(--font-heading);
  font-variant-numeric: tabular-nums;
  transition: transform 160ms var(--ease-out), background-color var(--dur-fast), border-color var(--dur-fast), color var(--dur-fast);
}
@media (hover: hover) and (pointer: fine) {
  .tile:hover input:not(:checked) + .face {
    background: var(--color-tint);
    border-color: var(--color-primary);
  }
}
.tile:active .face {
  transform: scale(0.97);
}
/* Selected is shown by fill, a heavier outline and a slight lift, so it never relies on colour alone. */
input:checked + .face {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--color-on-primary);
  box-shadow: 0 0 0 2px var(--color-card), 0 0 0 4px var(--color-primary);
  transform: scale(1.04);
}
.tile:active input:checked + .face {
  transform: scale(1);
}
input:focus-visible + .face {
  outline: var(--focus-ring);
  outline-offset: 3px;
}
.ends {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: var(--s-1) var(--s-4);
  margin: var(--s-3) 0 0;
  color: var(--color-text-muted);
  font-size: var(--fs-small);
}
.chosen {
  min-height: 1.5em; /* reserved so choosing a score does not shift the form */
  margin: var(--s-1) 0 0;
  font-weight: 600;
  color: var(--color-primary-text);
}
</style>
