<script setup>
import { computed, onBeforeUnmount, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import AppButton from '../../components/ui/AppButton.vue'
import AppCard from '../../components/ui/AppCard.vue'
import AppDialog from '../../components/ui/AppDialog.vue'
import AppIcon from '../../components/ui/AppIcon.vue'
import FormField from '../../components/ui/FormField.vue'
import MomentCard from '../../components/domain/MomentCard.vue'
import PageHeader from '../../components/ui/PageHeader.vue'
import { MOMENT_CATEGORIES } from '../../data/moments'
import { useToast } from '../../composables/useToast'
import { useMomentsStore } from '../../stores/moments'
import { useResidentsStore } from '../../stores/residents'
import { useUiStore } from '../../stores/ui'
import { nowIso } from '../../utils/time'

const { t } = useI18n()
const moments = useMomentsStore()
const residents = useResidentsStore()
const ui = useUiStore()
const { notify } = useToast()

const blank = () => ({ title: '', caption: '', category: MOMENT_CATEGORIES[0], residentIds: [], consent: false })
const form = reactive(blank())
const image = ref(null) // browser-local object URL; never uploaded
const errors = reactive({ photo: '', title: '', residents: '', consent: '', form: '' })
const dropped = ref(false)
const previewing = ref(false)
const published = ref(false)
const picker = ref(null)
let keep = false // after publishing, the moment owns the object URL, so it must not be revoked

const categoryOptions = computed(() => MOMENT_CATEGORIES.map((id) => ({ value: id, label: t(`category.${id}`) })))
const preview = computed(() => ({ id: 'preview', seeded: [], title: form.title || '…', caption: form.caption, createdAt: nowIso(), category: form.category, residentIds: form.residentIds, image: image.value }))

function clearImage() {
  if (image.value && !keep) URL.revokeObjectURL(image.value)
  image.value = null
  form.consent = false
}
function onFile(event) {
  const file = event.target.files?.[0]
  event.target.value = '' // so choosing the same file again still fires
  if (!file) return
  errors.photo = ''
  if (!file.type.startsWith('image/')) {
    errors.photo = t('staff.moment.badImage')
    return
  }
  if (image.value) URL.revokeObjectURL(image.value)
  image.value = URL.createObjectURL(file)
  const before = form.residentIds.length
  form.residentIds = form.residentIds.filter((id) => residents.byId(id).photoConsent)
  dropped.value = form.residentIds.length < before
}
onBeforeUnmount(() => image.value && !keep && URL.revokeObjectURL(image.value))

function publish() {
  Object.assign(errors, { photo: errors.photo, title: '', residents: '', consent: '', form: '' })
  if (image.value && !form.consent) {
    errors.consent = t('staff.moment.consentNeeded')
    return
  }
  const result = moments.addMoment({ title: form.title, caption: form.caption, category: form.category, residentIds: form.residentIds, image: image.value, authorId: ui.currentStaffId })
  if (!result.ok) {
    const message = t(`errors.${result.error}`, result.params ?? {})
    if (result.error === 'EMPTY_TITLE') errors.title = message
    else if (result.error === 'NO_RESIDENTS') errors.residents = message
    else errors.form = message
    return
  }
  keep = true
  published.value = true
  notify(t('staff.moment.published'))
}
function again() {
  Object.assign(form, blank())
  image.value = null
  keep = false
  dropped.value = false
  published.value = false
  Object.assign(errors, { photo: '', title: '', residents: '', consent: '', form: '' })
}
</script>

<template>
  <PageHeader :title="t('pages.staffMoment')">{{ t('staff.moment.intro') }}</PageHeader>

  <AppCard v-if="published" tint>
    <div role="status" class="done">
      <h2>{{ t('staff.moment.published') }}</h2>
      <p class="m-0">{{ t('staff.moment.publishedText') }}</p>
      <div class="actions">
        <AppButton variant="secondary" to="/moments">{{ t('staff.moment.viewAsFamily') }}</AppButton>
        <AppButton @click="again">{{ t('staff.moment.another') }}</AppButton>
      </div>
    </div>
  </AppCard>

  <form v-else class="form" novalidate @submit.prevent="publish">
    <AppCard :title="t('staff.moment.photo')">
      <p class="help">{{ t('staff.moment.photoHelp') }}</p>
      <img v-if="image" :src="image" :alt="t('staff.moment.photoAlt')" class="shot" />
      <input ref="picker" type="file" accept="image/*" class="visually-hidden" tabindex="-1" aria-hidden="true" @change="onFile" />
      <div class="actions start">
        <AppButton variant="secondary" @click="picker.click()"><AppIcon name="camera" />{{ image ? t('staff.moment.replace') : t('staff.moment.choose') }}</AppButton>
        <AppButton v-if="image" variant="ghost" @click="clearImage">{{ t('staff.moment.remove') }}</AppButton>
      </div>
      <p v-if="errors.photo" class="error" role="alert"><span aria-hidden="true">⚠</span> {{ errors.photo }}</p>
    </AppCard>

    <AppCard>
      <fieldset class="residents">
        <legend>{{ t('staff.moment.residents') }} <span class="req">({{ t('form.required') }})</span></legend>
        <label v-for="r in residents.residents" :key="r.id" class="check" :class="{ off: image && !r.photoConsent }">
          <input v-model="form.residentIds" type="checkbox" :value="r.id" :disabled="Boolean(image) && !r.photoConsent" />
          <span>{{ r.name }}<span v-if="!r.photoConsent" class="nc"> · {{ t('staff.moment.noConsent') }}</span></span>
        </label>
        <p v-if="image" class="help">{{ t('staff.moment.photoRule') }}</p>
        <p v-if="dropped" class="help" role="status">{{ t('staff.moment.dropped') }}</p>
        <p v-if="errors.residents" class="error" role="alert"><span aria-hidden="true">⚠</span> {{ errors.residents }}</p>
      </fieldset>
      <FormField v-model="form.title" :label="t('staff.moment.title')" :placeholder="t('staff.moment.titlePlaceholder')" :error="errors.title" required />
      <FormField v-model="form.caption" type="textarea" :rows="3" :label="t('staff.moment.caption')" />
      <FormField v-model="form.category" type="select" :options="categoryOptions" :label="t('staff.moment.category')" required />
      <label v-if="image" class="check consent">
        <input v-model="form.consent" type="checkbox" />
        <span>{{ t('staff.moment.consent') }} <span class="req">({{ t('form.required') }})</span></span>
      </label>
      <p v-if="errors.consent" class="error" role="alert"><span aria-hidden="true">⚠</span> {{ errors.consent }}</p>
      <p v-if="errors.form" class="error" role="alert"><span aria-hidden="true">⚠</span> {{ errors.form }}</p>
      <div class="actions">
        <AppButton variant="secondary" @click="previewing = true">{{ t('staff.moment.preview') }}</AppButton>
        <AppButton type="submit">{{ t('staff.moment.publish') }}</AppButton>
      </div>
    </AppCard>
  </form>

  <AppDialog v-model="previewing" :title="t('staff.moment.previewTitle')">
    <MomentCard :moment="preview" show-residents :visible-resident-ids="form.residentIds" />
  </AppDialog>
</template>

<style scoped>
.form {
  display: flex;
  flex-direction: column;
  gap: var(--s-5);
  max-width: 44rem;
}
.done {
  display: flex;
  flex-direction: column;
  gap: var(--s-3);
}
.shot {
  width: 100%;
  max-height: 20rem;
  object-fit: cover;
  border-radius: var(--r-lg);
}
.actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: var(--s-3);
}
.actions.start {
  justify-content: flex-start;
}
.help {
  margin: 0;
  color: var(--color-text-muted);
  font-size: var(--fs-small);
}
.error {
  margin: 0;
  color: var(--color-danger-text);
  font: 600 var(--fs-small) / var(--lh-tight) var(--font-body);
}
.residents {
  display: flex;
  flex-direction: column;
  gap: var(--s-1);
  min-width: 0;
  margin: 0;
  padding: 0;
  border: 0;
}
legend {
  float: none;
  width: auto;
  margin-bottom: var(--s-2);
  padding: 0;
  font: 600 var(--fs-body) / var(--lh-tight) var(--font-body);
}
.req,
.nc {
  color: var(--color-text-muted);
  font-weight: 400;
  font-size: var(--fs-small);
}
.check {
  display: flex;
  align-items: center;
  gap: var(--s-3);
  min-height: var(--hit);
  cursor: pointer;
}
.check.off {
  color: var(--color-text-muted);
  cursor: not-allowed;
}
.check input {
  flex: none;
  width: 1.5rem;
  height: 1.5rem;
  accent-color: var(--color-primary);
}
.consent {
  align-items: flex-start;
  padding: var(--s-3);
  border-radius: var(--r-md);
  background: var(--color-tint);
}
</style>
