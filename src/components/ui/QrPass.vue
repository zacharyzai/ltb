<!-- A decorative pseudo-QR code drawn from the booking reference. It encodes nothing and is not connected to any SAS system. -->
<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({ value: { type: String, required: true } })
const { t } = useI18n()
const N = 25

const cells = computed(() => {
  let h = [...props.value].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7)
  const finder = (r, c) => {
    for (const [r0, c0] of [[0, 0], [0, N - 7], [N - 7, 0]]) {
      if (r >= r0 && r < r0 + 7 && c >= c0 && c < c0 + 7) return Math.max(Math.abs(r - r0 - 3), Math.abs(c - c0 - 3)) !== 2
    }
    return null
  }
  const out = []
  for (let r = 0; r < N; r++)
    for (let c = 0; c < N; c++) {
      h = (h * 1664525 + 1013904223) >>> 0
      if (finder(r, c) ?? h >>> 28 > 6) out.push([r, c])
    }
  return out
})
</script>

<template>
  <figure class="qr">
    <svg :viewBox="`-2 -2 ${N + 4} ${N + 4}`" role="img" :aria-label="t('pass.alt', { ref: value })" class="code">
      <rect x="-2" y="-2" :width="N + 4" :height="N + 4" fill="#fff" />
      <rect v-for="[r, c] in cells" :key="`${r}-${c}`" :x="c" :y="r" width="1" height="1" fill="#1a1a1a" />
    </svg>
    <figcaption>
      <strong class="ref">{{ value }}</strong>
      <span class="demo">{{ t('pass.demo') }}</span>
    </figcaption>
  </figure>
</template>

<style scoped>
.qr {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--s-3);
  margin: 0;
}
.code {
  width: min(13rem, 70vw);
  aspect-ratio: 1;
  border: 2px solid var(--color-border-strong);
  border-radius: var(--r-md);
}
figcaption {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  text-align: center;
}
.ref {
  font: 700 var(--fs-lead) / var(--lh-tight) var(--font-heading);
}
.demo {
  color: var(--color-text-muted);
  font-size: var(--fs-small);
}
</style>
