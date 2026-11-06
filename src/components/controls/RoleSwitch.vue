<!-- Demo-only switch between the caregiver and staff experiences (no real sign-in). -->
<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { HOME } from '../../navigation'
import { useUiStore } from '../../stores/ui'
import SegmentedControl from '../ui/SegmentedControl.vue'

const { t } = useI18n()
const ui = useUiStore()
const router = useRouter()
const options = computed(() => [
  { value: 'caregiver', label: t('role.caregiver'), icon: 'user' },
  { value: 'staff', label: t('role.staff'), icon: 'clipboard' },
])
const choose = (role) => role !== ui.role && router.push(HOME[role])
</script>

<template>
  <SegmentedControl :options="options" :model-value="ui.role" :label="t('role.label')" @update:model-value="choose" />
</template>
