<!-- Page title (the page's one <h1>) with an optional description and actions. -->
<script setup>
defineProps({ title: { type: String, required: true } })
</script>

<template>
  <header class="page-head">
    <div>
      <h1>{{ title }}</h1>
      <p v-if="$slots.default" class="intro"><slot /></p>
    </div>
    <div v-if="$slots.actions" class="actions"><slot name="actions" /></div>
  </header>
</template>

<style scoped>
.page-head {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--s-4);
  margin-bottom: var(--s-6);
}
h1 {
  font-size: var(--fs-h1);
}
.intro {
  margin: var(--s-2) 0 0;
  color: var(--color-text-muted);
  font-size: var(--fs-lead);
}
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--s-3);
}
</style>
