<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { routes } from '../router'
import { useUiStore } from '../stores/ui'

const { t } = useI18n()
const route = useRoute()
const ui = useUiStore()

// Temporary route index so every path can be reached while the real shell is still to be built.
const links = computed(() => routes.filter((r) => r.name !== 'not-found'))
</script>

<template>
  <main class="container py-4">
    <h1 class="h3">{{ t(route.meta.titleKey) }}</h1>
    <p class="text-secondary">{{ t('scaffold.note') }}</p>
    <p data-testid="role">{{ t('scaffold.role', { role: ui.role }) }}</p>
    <nav :aria-label="t('scaffold.routes')">
      <ul class="list-unstyled d-flex flex-wrap gap-2">
        <li v-for="r in links" :key="r.name">
          <RouterLink :to="r.path" class="btn btn-outline-secondary btn-sm">{{ t(r.meta.titleKey) }}</RouterLink>
        </li>
      </ul>
    </nav>
  </main>
</template>
