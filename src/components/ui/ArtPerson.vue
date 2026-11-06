<!-- A simple, faceless figure used inside the illustrations. Local size is 40 x 70; place and scale it with x, y, s. -->
<script setup>
defineProps({
  x: { type: Number, default: 0 },
  y: { type: Number, default: 0 },
  s: { type: Number, default: 1 },
  skin: { type: String, default: '#e0ac84' },
  cloth: { type: String, default: '#1d6560' },
  hair: { type: String, default: '#d9d9d9' },
  pose: { type: String, default: 'stand' }, // 'stand' | 'arms-up'
})
</script>

<template>
  <g :transform="`translate(${x} ${y}) scale(${s})`">
    <path v-if="pose === 'arms-up'" d="M8 40 L-2 14 M32 40 L42 14" :stroke="cloth" stroke-width="6" stroke-linecap="round" fill="none" />
    <path d="M6 70v-26a14 14 0 0 1 14-14a14 14 0 0 1 14 14v26z" :fill="cloth" />
    <circle cx="20" cy="16" r="10" :fill="skin" />
    <path d="M10 15a10 10 0 0 1 20 0c-4-5-14-7-20 0z" :fill="hair" />
  </g>
</template>
