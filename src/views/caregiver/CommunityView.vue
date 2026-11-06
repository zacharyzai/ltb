<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import AppButton from '../../components/ui/AppButton.vue'
import AppCard from '../../components/ui/AppCard.vue'
import AppIcon from '../../components/ui/AppIcon.vue'
import AppIllustration from '../../components/ui/AppIllustration.vue'
import EmptyState from '../../components/ui/EmptyState.vue'
import PageHeader from '../../components/ui/PageHeader.vue'
import SectionHeader from '../../components/ui/SectionHeader.vue'
import SegmentedControl from '../../components/ui/SegmentedControl.vue'
import EventCard from '../../components/domain/EventCard.vue'
import EventDetailDialog from '../../components/domain/EventDetailDialog.vue'
import { useToast } from '../../composables/useToast'
import { SAS_LINKS } from '../../data/links'
import { useFormat } from '../../i18n/format'
import { useEventsStore } from '../../stores/events'
import { localized } from '../../utils/content'

const TABS = ['upcoming', 'news', 'past', 'volunteering']
const { t } = useI18n()
const fmt = useFormat()
const route = useRoute()
const router = useRouter()
const events = useEventsStore()
const { notify } = useToast()

const tab = computed({
  get: () => (TABS.includes(route.query.tab) ? route.query.tab : 'upcoming'),
  set: (value) => router.replace({ query: { ...route.query, tab: value } }),
})
const options = computed(() => TABS.map((value) => ({ value, label: t(`community.tab.${value}`) })))

// The open event comes from ?event=<id>, so Back closes the dialog. Only published events can be opened (never drafts).
const openEvent = computed(() => events.published.find((e) => e.id === route.query.event) ?? null)
const dialogOpen = computed({
  get: () => !!openEvent.value,
  set: (value) => !value && router.replace({ query: { ...route.query, event: undefined } }),
})
const showDetails = (event) => router.push({ query: { ...route.query, event: event.id } })

function interested(volunteer) {
  if (events.expressInterest(volunteer.id).ok) notify(t('volunteer.toast', { title: localized(volunteer, 'title', t) }))
}
</script>

<template>
  <PageHeader :title="t('pages.community')">{{ t('community.intro') }}</PageHeader>

  <div class="stack">
    <SegmentedControl v-model="tab" :options="options" :label="t('community.sections')" :check="false" wrap />

    <section v-if="tab === 'upcoming'" :aria-label="t('community.tab.upcoming')">
      <div v-if="events.upcoming.length" class="cards">
        <EventCard v-for="e in events.upcoming" :key="e.id" :event="e" @details="showDetails" />
      </div>
      <EmptyState v-else icon="calendar" :title="t('community.noUpcoming')" />
    </section>

    <section v-else-if="tab === 'past'" :aria-label="t('community.tab.past')">
      <div v-if="events.past.length" class="cards">
        <EventCard v-for="e in events.past" :key="e.id" :event="e" @details="showDetails" />
      </div>
      <EmptyState v-else icon="clock" :title="t('community.noPast')" />
    </section>

    <section v-else-if="tab === 'news'" :aria-label="t('community.tab.news')">
      <ul class="news">
        <li v-for="n in events.newsAnnouncements" :key="n.id">
          <AppCard>
            <p class="date"><time :datetime="n.date">{{ fmt.dateLong(n.date) }}</time></p>
            <h3>{{ localized(n, 'title', t) }}</h3>
            <p class="m-0">{{ localized(n, 'summary', t) }}</p>
          </AppCard>
        </li>
      </ul>
    </section>

    <section v-else :aria-label="t('community.tab.volunteering')">
      <div class="volhead">
        <div class="art"><AppIllustration name="volunteer" /></div>
        <div>
          <h2>{{ t('volunteer.title') }}</h2>
          <p class="m-0">{{ t('volunteer.intro') }}</p>
        </div>
      </div>
      <div class="cards">
        <article v-for="v in events.volunteers" :key="v.id" class="vol">
          <p class="avail" :class="v.availability"><span aria-hidden="true">{{ v.availability === 'open' ? '●' : '◆' }}</span> {{ t(`volunteerAvailability.${v.availability}`) }}</p>
          <h3>{{ localized(v, 'title', t) }}</h3>
          <p class="m-0">{{ localized(v, 'description', t) }}</p>
          <p class="commit"><AppIcon name="clock" :size="18" />{{ localized(v, 'commitment', t) }}</p>
          <div class="act">
            <AppButton v-if="!events.hasInterest(v.id)" :aria-label="t('volunteer.expressFor', { title: localized(v, 'title', t) })" @click="interested(v)">{{ t('volunteer.express') }}</AppButton>
            <p v-else class="noted" role="status"><AppIcon name="check" :size="20" :stroke="3" />{{ t('volunteer.noted') }}</p>
            <p v-if="events.hasInterest(v.id)" class="demo">{{ t('volunteer.demo') }}</p>
          </div>
        </article>
      </div>
    </section>

    <section class="support" :aria-label="t('support.title')">
      <div class="art"><AppIllustration name="family" /></div>
      <div class="copy">
        <h2>{{ t('support.title') }}</h2>
        <p>{{ t('support.text') }}</p>
        <div class="links">
          <AppButton :href="SAS_LINKS.donate">{{ t('support.donate') }}<AppIcon name="external" :size="18" /></AppButton>
          <AppButton variant="secondary" :href="SAS_LINKS.website">{{ t('support.website') }}</AppButton>
          <AppButton variant="ghost" :href="SAS_LINKS.facebook">Facebook</AppButton>
          <AppButton variant="ghost" :href="SAS_LINKS.instagram">Instagram</AppButton>
        </div>
        <p class="note">{{ t('support.note') }}</p>
      </div>
    </section>
  </div>

  <EventDetailDialog v-model="dialogOpen" :event="openEvent" />
</template>

<style scoped>
.stack {
  display: flex;
  flex-direction: column;
  gap: var(--s-8);
}
.cards {
  display: grid;
  gap: var(--s-5);
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 20rem), 1fr));
}
.news {
  display: grid;
  gap: var(--s-4);
  margin: 0;
  padding: 0;
  list-style: none;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 22rem), 1fr));
}
.date {
  margin: 0;
  color: var(--color-primary-text);
  font-weight: 600;
}
h3 {
  font-size: var(--fs-h3);
}
.volhead {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--s-5);
  margin-bottom: var(--s-5);
}
.volhead > div:last-child {
  flex: 1 1 18rem;
}
.volhead h2 {
  margin-bottom: var(--s-1);
  font-size: var(--fs-h2);
}
.art {
  overflow: hidden;
  align-self: center;
  flex: 0 0 min(100%, 14rem);
  aspect-ratio: 16 / 9;
  border-radius: var(--r-lg);
  background: var(--color-tint);
}
.vol {
  display: flex;
  flex-direction: column;
  gap: var(--s-2);
  padding: var(--s-5);
  background: var(--color-card);
  border: 1px solid var(--color-border);
  border-radius: var(--r-xl);
  box-shadow: var(--shadow-card);
}
.avail {
  margin: 0;
  font: 600 var(--fs-small) / var(--lh-tight) var(--font-body);
}
.avail.open {
  color: var(--status-well-fg);
}
.avail.limited {
  color: var(--status-resting-fg);
}
.commit {
  display: flex;
  align-items: center;
  gap: var(--s-2);
  margin: 0;
  color: var(--color-text-muted);
}
.act {
  margin-top: auto;
  padding-top: var(--s-3);
}
.noted {
  display: flex;
  align-items: center;
  gap: var(--s-2);
  margin: 0;
  color: var(--color-success-text);
  font-weight: 700;
}
.demo {
  margin: var(--s-1) 0 0;
  color: var(--color-text-muted);
  font-size: var(--fs-small);
}
.support {
  display: flex;
  flex-wrap: wrap;
  gap: var(--s-6);
  padding: var(--s-6);
  border: 1px solid var(--color-tint-strong);
  border-radius: var(--r-xl);
  background: var(--color-tint);
}
.copy {
  flex: 1 1 18rem;
}
.copy h2 {
  font-size: var(--fs-h2);
}
.copy p {
  margin: var(--s-2) 0 var(--s-4);
}
.copy .note {
  margin: var(--s-3) 0 0;
  color: var(--color-text-muted);
  font-size: var(--fs-small);
}
.links {
  display: flex;
  flex-wrap: wrap;
  gap: var(--s-2);
}
</style>
