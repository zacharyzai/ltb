<!-- The app's icon set: simple 24px stroke icons drawn as SVG, by name. Decorative unless `label` is given. -->
<script>
const C = (cx, cy, r) => `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`
const CAL = ['M8 2v4', 'M16 2v4', 'M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z', 'M3 10h18']
const ICONS = {
  home: ['M3 10.5 12 3l9 7.5', 'M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5'],
  image: ['M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z', C(9, 9, 1.5), 'm21 15-5-5L5 21'],
  calendar: CAL,
  'calendar-check': [...CAL, 'm9 16 2 2 4-4'],
  heart: ['M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z'],
  user: ['M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2', C(12, 7, 4)],
  dashboard: ['M3 3h7v9H3z', 'M14 3h7v5h-7z', 'M14 12h7v9h-7z', 'M3 16h7v5H3z'],
  clipboard: ['M9 2h6a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z', 'M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2', 'm9 14 2 2 4-4'],
  inbox: ['M22 12h-6l-2 3h-4l-2-3H2', 'M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z'],
  camera: ['M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z', C(12, 13, 3)],
  sliders: ['M21 4h-7', 'M10 4H3', 'M21 12h-9', 'M8 12H3', 'M21 20h-5', 'M12 20H3', 'M14 2v4', 'M8 10v4', 'M16 18v4'],
  sun: [C(12, 12, 4), 'M12 2v2', 'M12 20v2', 'm4.93 4.93 1.41 1.41', 'm17.66 17.66 1.41 1.41', 'M2 12h2', 'M20 12h2', 'm6.34 17.66-1.41 1.41', 'm19.07 4.93-1.41 1.41'],
  moon: ['M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z'],
  monitor: ['M3 4h18a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z', 'M8 21h8', 'M12 17v4'],
  type: ['M4 7V4h16v3', 'M9 20h6', 'M12 4v16'],
  globe: [C(12, 12, 10), 'M2 12h20', 'M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z'],
  swap: ['M17 3l4 4-4 4', 'M3 7h18', 'M7 21l-4-4 4-4', 'M21 17H3'],
  x: ['M18 6 6 18', 'm6 6 12 12'],
  check: ['M20 6 9 17l-5-5'],
  plus: ['M12 5v14', 'M5 12h14'],
  'chevron-right': ['m9 18 6-6-6-6'],
  alert: ['M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z', 'M12 9v4', 'M12 17h.01'],
  info: [C(12, 12, 10), 'M12 16v-4', 'M12 8h.01'],
  shield: ['M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'],
  loader: ['M12 2v4', 'm16.2 7.8 2.9-2.9', 'M18 12h4', 'm16.2 16.2 2.9 2.9', 'M12 18v4', 'm4.9 19.1 2.9-2.9', 'M2 12h4', 'm4.9 4.9 2.9 2.9'],
}
</script>

<script setup>
const props = defineProps({
  name: { type: String, required: true },
  size: { type: Number, default: 24 },
  stroke: { type: Number, default: 2 },
  label: { type: String, default: '' }, // accessible name; leave empty for decorative icons
})
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    :stroke-width="stroke"
    stroke-linecap="round"
    stroke-linejoin="round"
    :role="props.label ? 'img' : undefined"
    :aria-label="props.label || undefined"
    :aria-hidden="props.label ? undefined : 'true'"
    focusable="false"
    class="app-icon"
  >
    <path v-for="(d, i) in ICONS[name]" :key="i" :d="d" />
  </svg>
</template>

<style scoped>
.app-icon {
  flex: none;
}
</style>
