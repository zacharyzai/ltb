<!-- The standard card container with an optional title. -->
<script setup>
defineProps({
  title: { type: String, default: '' },
  tint: { type: Boolean, default: false },
})
</script>

<template>
  <section class="app-card" :class="{ tint }">
    <h2 v-if="title" class="app-card-title">{{ title }}</h2>
    <slot />
  </section>
</template>

<style scoped>
.app-card {
  display: flex;
  flex-direction: column;
  gap: var(--s-3);
  padding: var(--s-5);
  background: var(--color-card);
  border: 1px solid var(--color-border);
  border-radius: var(--r-xl);
  box-shadow: var(--shadow-card);
}
.tint {
  background: var(--color-tint);
  border-color: var(--color-tint-strong);
}
.app-card-title {
  font-size: var(--fs-h3);
}
</style>
