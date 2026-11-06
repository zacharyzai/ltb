<!-- A section title (<h2>) with an optional action on the right. -->
<script setup>
defineProps({ title: { type: String, required: true } })
</script>

<template>
  <div class="section-head">
    <h2>{{ title }}</h2>
    <slot name="action" />
  </div>
</template>

<style scoped>
.section-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--s-3);
  margin-bottom: var(--s-3);
}
h2 {
  font-size: var(--fs-h2);
}
</style>
