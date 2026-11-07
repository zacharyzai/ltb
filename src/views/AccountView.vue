<!-- Account for the active demo role: profile, demo-view switch, settings and help. Nothing here is real sign-in. -->
<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import AppButton from '../components/ui/AppButton.vue'
import AppCard from '../components/ui/AppCard.vue'
import AppIcon from '../components/ui/AppIcon.vue'
import PageHeader from '../components/ui/PageHeader.vue'
import RoleSwitch from '../components/controls/RoleSwitch.vue'
import SettingsControls from '../components/controls/SettingsControls.vue'
import { useCaregiver } from '../composables/useCaregiver'
import { useUiStore } from '../stores/ui'

const { t } = useI18n()
const ui = useUiStore()
const { caregiver, linked, selected, select, relationship } = useCaregiver()

const person = computed(() => (ui.isStaff ? ui.currentStaff : caregiver.value))
const roleLabel = computed(() => (ui.isStaff ? t(`staffRole.${ui.currentStaff.role}`) : t('account.caregiverRole')))
const initials = computed(() => person.value.name.split(' ').slice(0, 2).map((w) => w[0]).join(''))
</script>

<template>
  <PageHeader :title="t(ui.isStaff ? 'pages.staffAccount' : 'pages.account')" />

  <div class="grid">
    <AppCard :title="t('account.profile')">
      <div class="who">
        <span class="avatar" aria-hidden="true">{{ initials }}</span>
        <div>
          <p class="name">{{ person.name }}</p>
          <p class="role">{{ roleLabel }}</p>
          <p class="chip"><AppIcon name="info" :size="16" />{{ t('account.demoAccount') }}</p>
        </div>
      </div>
      <template v-if="ui.isStaff">
        <h3>{{ t('account.staffAbout') }}</h3>
        <p class="m-0">{{ t('account.staffAboutText') }}</p>
      </template>
      <template v-else>
        <h3>{{ t('account.linked') }}</h3>
        <p class="help">{{ t('account.linkedHelp') }}</p>
        <ul class="residents">
          <li v-for="r in linked" :key="r.id">
            <button type="button" class="res" :class="{ on: selected?.id === r.id }" :aria-pressed="selected?.id === r.id" @click="select(r.id)">
              <span class="rname">{{ r.name }}</span>
              <span class="rel">{{ t(`relationship.${relationship(r)}`) }}</span>
              <span v-if="selected?.id === r.id" class="now"><AppIcon name="check" :size="16" :stroke="3" />{{ t('account.viewing') }}</span>
            </button>
          </li>
        </ul>
      </template>
    </AppCard>

    <AppCard :title="t('account.roleTitle')">
      <p class="help m-0">{{ t('account.roleHelp') }}</p>
      <RoleSwitch />
    </AppCard>

    <AppCard :title="t('account.settings')">
      <p class="help m-0">{{ t('account.settingsHelp') }}</p>
      <SettingsControls skip-role />
    </AppCard>

    <AppCard :title="t('account.help')">
      <h3>{{ t('account.about') }}</h3>
      <p class="m-0">{{ t('account.aboutText') }}</p>
      <div><AppButton variant="secondary" @click="ui.openGuide()"><AppIcon name="info" />{{ t('guide.openLong') }}</AppButton></div>
      <h3>{{ t('account.demoTitle') }}</h3>
      <ul class="demo">
        <li v-for="n in 4" :key="n">{{ t(`account.demo${n}`) }}</li>
      </ul>
    </AppCard>
  </div>
</template>

<style scoped>
.grid {
  display: grid;
  gap: var(--s-5);
  align-items: start;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 22rem), 1fr));
}
/* Phones: tighter card padding so the three-way text-size buttons keep their words whole at the largest text. */
@media (max-width: 420px) {
  .grid :deep(.app-card) {
    padding: var(--s-4) var(--s-3);
  }
}
h3 {
  margin: var(--s-2) 0 0;
  font-size: var(--fs-lead);
}
.who {
  display: flex;
  align-items: center;
  gap: var(--s-4);
}
.avatar {
  display: grid;
  place-items: center;
  flex: none;
  width: 4.5rem;
  height: 4.5rem;
  border-radius: var(--r-pill);
  background: var(--color-primary);
  color: var(--color-on-primary);
  font: 700 var(--fs-h3) / 1 var(--font-heading);
}
.name {
  margin: 0;
  font: 600 var(--fs-h3) / var(--lh-tight) var(--font-heading);
}
.role {
  margin: 0;
  color: var(--color-text-muted);
}
.chip {
  display: inline-flex;
  align-items: center;
  gap: var(--s-1);
  margin: var(--s-2) 0 0;
  padding: 2px var(--s-3);
  border-radius: var(--r-pill);
  background: var(--color-tint-strong);
  color: var(--color-tint-text);
  font: 600 var(--fs-small) / var(--lh-tight) var(--font-body);
}
.help {
  margin: 0;
  color: var(--color-text-muted);
  font-size: var(--fs-small);
}
.residents,
.demo {
  display: flex;
  flex-direction: column;
  gap: var(--s-2);
  margin: 0;
  padding: 0;
  list-style: none;
}
.demo {
  padding-left: var(--s-5);
  list-style: disc;
}
.res {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: var(--s-1) var(--s-3);
  width: 100%;
  min-height: var(--hit);
  padding: var(--s-3) var(--s-4);
  border: 2px solid var(--color-border);
  border-radius: var(--r-lg);
  background: var(--color-card);
  color: var(--color-text);
  text-align: left;
  cursor: pointer;
}
.res.on {
  border-color: var(--color-primary);
  background: var(--color-tint);
}
.rname {
  font: 600 var(--fs-body) / var(--lh-tight) var(--font-heading);
}
.rel {
  color: var(--color-text-muted);
  font-size: var(--fs-small);
}
.now {
  display: inline-flex;
  align-items: center;
  gap: var(--s-1);
  margin-left: auto;
  color: var(--color-success-text);
  font: 600 var(--fs-small) / var(--lh-tight) var(--font-body);
}
</style>
