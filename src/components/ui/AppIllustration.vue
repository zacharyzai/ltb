<!-- Original flat illustrations (no photographs, no real people). Decorative: the card around them carries the meaning.
     Scenes: gardening, music, crafts, exercise, celebration, community, family, volunteer. -->
<script setup>
import ArtPerson from './ArtPerson.vue'

defineProps({ name: { type: String, required: true } })
const SUN = '#f5b94a'
const TERRA = '#e07a5f'
const SAND = '#f2cc8f'
const WOOD = '#b08968'
const RED = '#ee3e3e' // SAS red accent
const BLUE = '#005aab' // SAS blue accent
const HEART = 'M0 -4c-6-10-20-4-14 6c3 5 14 11 14 11s11-6 14-11c6-10-8-16-14-6z'
</script>

<template>
  <svg viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice" class="art" aria-hidden="true" focusable="false">
    <rect width="320" height="180" fill="var(--color-tint)" />

    <template v-if="name === 'gardening'">
      <circle cx="262" cy="42" r="20" :fill="SUN" />
      <path d="M0 128Q80 88 160 122T320 112V180H0Z" fill="var(--color-green)" opacity=".85" />
      <path d="M0 152Q100 126 200 150T320 144V180H0Z" fill="var(--art-ground)" />
      <rect x="34" y="78" width="8" height="44" rx="3" :fill="WOOD" /><circle cx="38" cy="70" r="24" fill="var(--color-green)" />
      <g stroke="var(--color-green-text)" stroke-width="3" stroke-linecap="round"><path d="M210 150v-26M236 154v-34M262 150v-22M288 154v-30" /></g>
      <circle cx="210" cy="120" r="7" :fill="RED" /><circle cx="236" cy="116" r="7" :fill="SUN" /><circle cx="262" cy="124" r="7" :fill="BLUE" /><circle cx="288" cy="120" r="7" :fill="RED" />
      <ArtPerson :x="96" :y="84" :cloth="TERRA" skin="#c98b5f" hair="#f1f1f1" /><ArtPerson :x="146" :y="88" cloth="var(--art-cloth)" skin="#e0ac84" hair="#cfcfcf" />
    </template>

    <template v-else-if="name === 'music'">
      <rect y="140" width="320" height="40" fill="var(--art-ground)" opacity=".5" />
      <g :fill="BLUE"><circle cx="70" cy="52" r="8" /><circle cx="108" cy="42" r="8" /></g>
      <path d="M78 52V20l38-8v30" :stroke="BLUE" stroke-width="4" fill="none" stroke-linecap="round" />
      <circle cx="236" cy="56" r="26" fill="none" :stroke="SUN" stroke-width="8" /><g :fill="SUN"><circle cx="236" cy="30" r="4" /><circle cx="262" cy="56" r="4" /><circle cx="210" cy="56" r="4" /><circle cx="236" cy="82" r="4" /></g>
      <ArtPerson :x="70" :y="86" :cloth="TERRA" skin="#e0ac84" hair="#e8e8e8" /><ArtPerson :x="140" :y="90" cloth="var(--art-cloth)" skin="#8d5a3b" hair="#cfcfcf" /><ArtPerson :x="210" :y="86" :cloth="SAND" skin="#c98b5f" hair="#f1f1f1" />
      <path d="M170 40q8-8 16 0t16 0" fill="none" :stroke="RED" stroke-width="4" stroke-linecap="round" />
    </template>

    <template v-else-if="name === 'crafts'">
      <path d="M0 40H320" stroke="var(--color-border-strong)" stroke-width="2" />
      <g stroke="var(--color-border-strong)" stroke-width="2"><path d="M60 40v28M120 40v40M180 40v24M240 40v36" /></g>
      <rect x="44" y="68" width="32" height="40" rx="14" :fill="RED" /><rect x="104" y="80" width="32" height="40" rx="14" :fill="SUN" /><rect x="164" y="64" width="32" height="40" rx="14" :fill="BLUE" /><rect x="224" y="76" width="32" height="40" rx="14" :fill="TERRA" />
      <ArtPerson :x="130" :y="76" cloth="var(--art-cloth)" skin="#e0ac84" hair="#e8e8e8" /><ArtPerson :x="196" :y="80" :cloth="SAND" skin="#c98b5f" hair="#cfcfcf" />
      <rect x="30" y="132" width="260" height="14" rx="6" :fill="WOOD" /><rect x="46" y="146" width="10" height="34" :fill="WOOD" /><rect x="264" y="146" width="10" height="34" :fill="WOOD" />
    </template>

    <template v-else-if="name === 'exercise'">
      <circle cx="46" cy="40" r="18" :fill="SUN" />
      <rect y="146" width="320" height="34" fill="var(--color-green)" opacity=".7" />
      <ArtPerson :x="60" :y="80" :cloth="TERRA" skin="#e0ac84" hair="#e8e8e8" pose="arms-up" /><ArtPerson :x="140" :y="76" cloth="var(--art-cloth)" skin="#8d5a3b" hair="#cfcfcf" pose="arms-up" /><ArtPerson :x="220" :y="80" :cloth="BLUE" skin="#c98b5f" hair="#f1f1f1" pose="arms-up" />
    </template>

    <template v-else-if="name === 'celebration'">
      <rect y="146" width="320" height="34" fill="var(--art-ground)" opacity=".5" />
      <g stroke="var(--color-border-strong)" stroke-width="2"><path d="M60 60v50M100 44v54M262 52v52M222 40v58" /></g>
      <circle cx="60" cy="52" r="14" :fill="RED" /><circle cx="100" cy="36" r="14" :fill="BLUE" /><circle cx="222" cy="32" r="14" :fill="SUN" /><circle cx="262" cy="44" r="14" fill="var(--color-green)" />
      <ArtPerson :x="70" :y="92" :cloth="TERRA" skin="#e0ac84" hair="#e8e8e8" /><ArtPerson :x="214" :y="92" cloth="var(--art-cloth)" skin="#c98b5f" hair="#cfcfcf" />
      <rect x="128" y="118" width="64" height="28" rx="6" :fill="SAND" /><rect x="138" y="100" width="44" height="20" rx="6" fill="#fff" /><path d="M148 100v-12M160 100v-14M172 100v-12" :stroke="RED" stroke-width="3" stroke-linecap="round" />
      <g :fill="SUN"><circle cx="30" cy="110" r="3" /><circle cx="290" cy="120" r="3" /><circle cx="200" cy="30" r="3" /></g><g :fill="RED"><circle cx="40" cy="80" r="3" /><circle cx="282" cy="84" r="3" /></g>
    </template>

    <template v-else-if="name === 'community'">
      <rect y="150" width="320" height="30" fill="var(--color-green)" opacity=".7" />
      <rect x="84" y="62" width="152" height="90" rx="6" fill="var(--color-card)" stroke="var(--color-border-strong)" stroke-width="2" />
      <path d="M76 66L160 28L244 66Z" fill="var(--color-primary)" /><rect x="142" y="104" width="36" height="48" rx="4" :fill="SAND" />
      <rect x="100" y="84" width="28" height="22" rx="3" fill="var(--color-tint-strong)" /><rect x="192" y="84" width="28" height="22" rx="3" fill="var(--color-tint-strong)" />
      <path d="M20 40Q160 80 300 40" fill="none" stroke="var(--color-border-strong)" stroke-width="2" />
      <path d="M50 52l10 18l10-12zM110 62l10 18l10-12zM190 62l10 18l10-12zM250 52l10 18l10-12z" :fill="RED" /><path d="M80 58l10 18l10-12zM220 58l10 18l10-12z" :fill="BLUE" />
      <ArtPerson :x="40" :y="104" :s=".7" :cloth="TERRA" skin="#e0ac84" hair="#e8e8e8" /><ArtPerson :x="256" :y="104" :s=".7" cloth="var(--art-cloth)" skin="#8d5a3b" hair="#cfcfcf" /><ArtPerson :x="104" :y="112" :s=".6" :cloth="SAND" skin="#c98b5f" hair="#2b2b2b" /><ArtPerson :x="188" :y="112" :s=".6" :cloth="BLUE" skin="#e0ac84" hair="#2b2b2b" />
    </template>

    <template v-else-if="name === 'family'">
      <circle cx="268" cy="40" r="18" :fill="SUN" />
      <rect y="150" width="320" height="30" fill="var(--color-green)" opacity=".7" />
      <rect x="196" y="76" width="92" height="76" rx="6" fill="var(--color-card)" stroke="var(--color-border-strong)" stroke-width="2" /><path d="M188 80L242 44L296 80Z" fill="var(--color-primary)" /><rect x="226" y="108" width="32" height="44" rx="4" :fill="SAND" />
      <g transform="translate(112 46)"><path :d="HEART" :fill="RED" /></g>
      <ArtPerson :x="70" :y="84" :s="1.1" :cloth="TERRA" skin="#e0ac84" hair="#f1f1f1" /><ArtPerson :x="118" :y="104" :s=".85" cloth="var(--art-cloth)" skin="#e0ac84" hair="#2b2b2b" />
      <path d="M100 112L118 122" :stroke="TERRA" stroke-width="6" stroke-linecap="round" />
    </template>

    <template v-else>
      <rect y="150" width="320" height="30" fill="var(--art-ground)" opacity=".5" />
      <rect x="196" y="112" width="72" height="12" rx="4" :fill="WOOD" /><rect x="206" y="124" width="8" height="26" :fill="WOOD" /><rect x="250" y="124" width="8" height="26" :fill="WOOD" />
      <rect x="214" y="92" width="36" height="22" rx="3" fill="var(--color-card)" stroke="var(--color-border-strong)" stroke-width="2" /><path d="M232 92v22" stroke="var(--color-border-strong)" stroke-width="2" />
      <ArtPerson :x="70" :y="84" :cloth="BLUE" skin="#c98b5f" hair="#2b2b2b" /><ArtPerson :x="136" :y="88" cloth="var(--art-cloth)" skin="#e0ac84" hair="#e8e8e8" />
      <g transform="translate(90 120)"><path :d="HEART" :fill="RED" transform="scale(.55)" /></g>
      <g stroke="var(--color-green-text)" stroke-width="3" stroke-linecap="round"><path d="M40 152v-24M290 152v-30" /></g><circle cx="40" cy="124" r="7" :fill="SUN" /><circle cx="290" cy="118" r="7" :fill="RED" />
    </template>
  </svg>
</template>

<style scoped>
.art {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
