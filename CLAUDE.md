# CLAUDE.md — SAS Connect (Vue 3 prototype)

Always read this file before making changes. The earlier React version of this file lives in `legacy-react/CLAUDE.md` and no longer applies.

## 1. Project
**SAS Connect** is a caregiver engagement prototype for the Society for the Aged Sick (SAS), Singapore (https://www.societyagedsick.org.sg/). Family caregivers stay connected with nursing-home residents; staff get a low-effort portal.

Three goals:
1. **Caregiver reassurance**: meaningful resident updates and a way to ask staff questions.
2. **Convenient visitation**: book, manage and review visits; QR visit pass.
3. **Community engagement**: events, announcements, volunteering, donations.

Target users: older family caregivers with limited tech experience (large text, clear labels, one action per card) and nursing staff on ward rounds (speed first: a status update in ~3 taps, a moment in ~15 s).

## 2. Scope: frontend-only visual prototype
**Required:** polished UI, routing, dialogs, simulated forms/booking, four languages, light/dark/system themes, text-size control, beginner's guide, fictional mock data, cross-role updates within one browser session.
**Forbidden:** backend, database, real auth/JWT, MongoDB/Express, external AI or translation services, payments, real SMS/email, real medical records, production infrastructure, runtime machine translation.
Mock data and Pinia state reset on refresh. Only UI preferences (language, theme, text size, guide-seen) may persist, in `localStorage` guarded by try/catch.

## 3. Stack (final)
Vue 3 (Composition API, `<script setup>`), Vite, Vue Router, Pinia (setup stores), Bootstrap 5 **CSS only** (no Bootstrap JS) with custom CSS design tokens, vue-i18n, **JavaScript (no TypeScript)**.
Testing: **Vitest** (store/logic tests in `tests/`) and **Playwright + `@axe-core/playwright`** (end-to-end and accessibility specs in `e2e/`, config `playwright.config.js`, starts its own dev server on port 5199). Keep the suites small.
Not allowed: React, Tailwind, Lucide package, axios, UI kits, date/animation libraries, other state libraries. Any new dependency needs approval.

## 4. Design direction
Modern, clean, friendly, spacious; rounded cards; warm neutral backgrounds; SAS maroon and green accents; clean typography; icon + word everywhere; subtle motion; large buttons. Inspired by **Ah Ma Ah Gong Can** (https://github.com/zacharyzai/wad2-proj): adapt its application shell, desktop sidebar + mobile bottom nav, tokens + Bootstrap bridge, theme switching, i18n architecture, native `<dialog>` confirmations and toasts. **Do not** copy its mascot, medicine illustrations, scan/bill/auth features or backend.
The hand-drawn wireframe styling (Kalam, Patrick Hand, hand-drawn borders) is retired. `reference/wireframe/` remains the source of user journeys and content only.

**Brand research (official SAS site, checked in Phase 1):** the site uses red (`#ee3e3e`, `#e02b20`, dark `#921515`), blue (`#005aab`, link blue `#2ea3f2`), white and `#333`; fonts Poppins and Open Sans; Divi (WordPress) theme. It is **not** teal/green. **Decided (Phase 2):** teal + green carry the UI; SAS red (`#ee3e3e`) and blue (`#005aab`) are accents only, never the main action colour. Fonts: **Poppins** (headings) and **Open Sans** (body) via Google Fonts, with system CJK/Tamil fallbacks (no web fonts for Chinese or Tamil). No imitation of the SAS logo (the header uses an original "S" tile).

**Palette rules (all in `src/styles/global/tokens.css`, verified by `npm run contrast`):** **Re-themed to SAS maroon on the user's request (supersedes the Phase 2 teal decision).** Primary fill/text `#921515` (official SAS dark red; hover `#761010`); brand red `#e02b20` is decoration/large type only; soft maroon tint `#fbefee`; warm page `#fbfaf7`, text `#1a1a1a`; dark theme uses a light rose fill (`#f4a3a3`) with dark text on warm-charcoal surfaces. Green support `#4a9d6f`/`#1f6a47` and SAS blue (`#005aab`, link and focus colour) stay as supporting colours; the "Feeling Well" status stays teal ●. Danger text and `--color-sas-red-solid` stay `#b3262b`. Never hard-code a colour outside `tokens.css`.

**Imagery:** original, consistent, friendly illustrations (authored SVG), respectful depictions of elderly residents and caregivers. No unverified photographs, no striped placeholders where avoidable, no imitation SAS logo, no real SAS resident photos. A `MomentPhoto`-style component may later render licensed photos. Keep the notice "Images and resident information are for demonstration purposes only."

## 5. Project structure
```
legacy-react/         preserved React prototype (read-only reference; runs on its own)
reference/wireframe/  original Claude Design export (NEVER modify)
docs/vue-migration/   MIGRATION_PLAN.md, i18n-review.md
scripts/              check-contrast.mjs (npm run contrast), check-i18n.mjs (npm run i18n:check)
tests/                Vitest: helpers.js (frozen Singapore clock) + one file per store, data, time, format, ui, caregiver, cross-role
e2e/                  Playwright: caregiver.spec.js (journeys), staff.spec.js (staff + cross-role A–F), account.spec.js (account, settings, guide), polish.spec.js (404, empty states, reduced motion), a11y-responsive.spec.js (axe + viewport/language matrix), routes.spec.js
src/
  main.js  App.vue  theme.js  navigation.js
  router/index.js
  i18n/{index.js, format.js, locales/{en,zh,ms,ta}.json}   (format.js = Intl dates/times in Singapore time)
  utils/       time.js (Singapore clock + dates), result.js (ok/fail), content.js (seeded-text helper)
  data/        residents caregivers staff moments inquiries visits events (mock data, see §8)
  stores/      ui residents moments inquiries visits events
  composables/ useToast.js (thin wrapper over the ui store), useCaregiver.js (linked residents + selected resident)
  components/
    ui/        AppIcon AppButton AppCard StatusBadge AppDialog AppToast SegmentedControl FormField
               PageHeader SectionHeader EmptyState LoadingState AppIllustration ArtPerson QrPass
    domain/    ResidentSwitcher ResidentCard MomentCard VisitCard EventCard InquiryCard BookingCalendar
               BookingStepIndicator EventDetailDialog AskCareTeamDialog
    controls/  LanguageSwitch ThemeSwitch TextSizeSwitch RoleSwitch SettingsControls
    layout/    AppSidebar AppHeader BottomNavigation AppFooter BrandMark
  views/caregiver/ HomeView MomentsView VisitsView BookVisitView CommunityView
  views/NotFoundView.vue                          (404)
  views/AccountView.vue                            (both roles)
  views/staff/ DashboardView UpdatesView PostMomentView InquiriesView VisitsEventsView (+ VisitsPanel EventsPanel)
  styles/      main.css, global/{tokens,base,layout}.css
```
Later phases add `components/guide/`. Do not create folders without files.

## 6. Routes
Caregiver: `/` Home, `/moments`, `/visits`, `/visits/book` (4-step flow, `?reschedule=<id>`), `/community` (`?event=<id>` opens detail), `/account`.
Staff: `/staff` Dashboard, `/staff/updates`, `/staff/moment`, `/staff/inquiries`, `/staff/visits-events` (internal tabs **Visits** and **Events**, `?tab=`), `/staff/account`.
`meta.role` decides the shell; the router guard sets `ui.role`. The role switch simply navigates. Views are lazy-loaded; after navigation set `document.title` from i18n, focus the page `<h1>`, scroll to top.

## 7. Navigation
**Desktop (≥992 px):** sidebar (brand, nav, language, theme, text size, role switch, guide link, account), content area max ≈1080 px with responsive cards. Do not lock the app to a 480 px column.
**Mobile (<992 px):** compact header (brand, account/settings, controls) + fixed bottom nav. **Caregiver: 4 tabs** Home, Moments, Visits, Community; Account/Settings from the header. **Staff: 4 tabs** Dashboard, Updates, Inquiries, Visits & Events; **Post a Moment** is a prominent quick action on the dashboard and the Updates page (desktop sidebar lists all five). Do not add tabs if labels do not stay readable at 320 px in all four languages. (Verified in Phase 2: tab labels wrap to at most two lines, nothing clips, in all four languages at standard and extra-large text.)

## 8. Data and state (Pinia)
**Mock data** (`src/data/`) is exported as **builder functions** (`buildResidents()`, `buildMoments()`, …) so every record's date is computed from the injectable Singapore clock when a store is created. Nothing hard-codes a calendar date, so the demo is meaningful on any day; tests freeze the clock (`tests/helpers.js`: Thu 12 Nov 2026, 10:00 SGT).
- **Stable ids and enumerations** are language-independent: `WELLBEING_STATUSES` (`well|resting|contact`), `MOMENT_CATEGORIES`, `INQUIRY_STATUSES` (`pending|in-review|answered`), `INQUIRY_TOPICS`, `BOOKING_STATUSES` (`confirmed|cancelled|completed`), `SLOTS` (`am1 am2 pm1 pm2`), `EVENT_CATEGORIES`, `EVENT_STATUSES` (`published|draft`), `STAFF_ROLES`, `RELATIONSHIPS`, `VOLUNTEER_AVAILABILITY`. Their labels live in the locale files (`status.*`, `category.*`, `topic.*`, `inquiryStatus.*`, `visitStatus.*`, `eventCategory.*`, `relationship.*`, `staffRole.*`, `volunteerAvailability.*`, `checkIn.*`). Never store a translated label as state.
- **Seeded text** is stored as `null` plus `seeded: ['title','caption']` and a `seedKey` (e.g. `moments.m1`); the words are `seed.<seedKey>.<field>` in all four locales. Render with `localized(record, 'title', t)` (`utils/content.js`). Text typed by a user is stored in the field as typed and never translated; editing a seeded field removes it from `seeded` (`setFields`). Person names are proper nouns and stay as written.
- **Dates:** ISO dates (`'2026-11-12'`), `'HH:mm'` times, UTC ISO timestamps. Today comes from `utils/time.js` (`todayISO()`, `dayOffset(n)`, `nowTime()`, Asia/Singapore). Never match records by a formatted label. Format for display with `Intl` in the UI only.
- **Results, not exceptions:** actions return `{ ok: true, value }` or `{ ok: false, error: 'CODE', params? }`. The UI shows `t(`errors.${error}`, params)`; every code the stores can return has a message in all four locales (a test enforces it).

**Stores** (setup stores; mutate only through actions):
| Store | State | Getters / queries | Actions |
|---|---|---|---|
| `ui` | role, current caregiver/staff ids, theme, text size, toasts | `currentCaregiver`, `currentStaff`, `shownTheme`, `isStaff` | `setRole`, `setCaregiver`, `setTheme`, `setTextSize`, `notify`, `dismissToast` |
| `residents` | residents + status, note, `updatedAt`, `photoConsent`, `caregiverIds` | `byId`, `linkedTo(cg)`, `isLinked`, `updatedToday`, `notUpdatedToday`, `needingAttention` | `updateResidentStatus(id, status, note, staffId)` |
| `moments` | moments (published or draft) | `published`, `drafts`, `visibleTo(cg)`, `latest(n, cg)`, `forResident`, `inRange(from, to, cg)` | `addMoment({…, publish})`, `publishMoment(id)` |
| `inquiries` | inquiries | `pending` (pending + in review), `answered`, `pendingCount`, `byCaregiver`, `byResident`, `byId` | `submitInquiry`, `markInReview`, `replyToInquiry` |
| `visits` | bookings, per date+slot capacity overrides | `availability(date, slot)`, `slotsFor(date)`, `bookingWindow()`, `upcoming`, `past`, `todays`, `byCaregiver` | `createBooking`, `cancelBooking`, `rescheduleBooking`, `checkInVisitor`, `updateSlotCapacity` |
| `events` | events, news, volunteers | `published`, `upcoming`, `past`, `drafts`, `shareable` (public only), `newsAnnouncements` | `createEvent`, `saveDraft`, `updateEvent`, `publishEvent` |

**Rules the stores enforce:** caregivers only act on and see residents linked to them; moments are visible only when they tag a linked resident, and drafts never; a **photo moment cannot tag a resident without photo consent** (checked again on publish); an inquiry needs non-empty text (<=500) and a linked resident, and cannot be replied to twice; bookings need a linked resident, a date from today to +13 days, a slot that has not started, 1-4 visitors, and enough space; availability = capacity - baseline taken by other families - active bookings, so **cancelled bookings free their space**; rescheduling excludes the booking itself from occupancy; only today's confirmed visits can be checked in; capacity is per date + slot and cannot drop below the spaces already booked; draft events never appear in `published/upcoming/past/shareable`; publishing needs a title, valid date and times, and a place.
Known limits: "today" is not reactive across midnight within one session; booking references and all state reset on refresh; baseline occupancy by other families is a fixed demo pattern by day offset.

## 9. Internationalisation (mandatory)
English, Simplified Chinese (中文), Malay (Bahasa Melayu), Tamil (தமிழ்). **All user-facing content is translatable**: navigation, buttons, forms, validation messages, status labels, dialogs, notifications, booking steps, staff screens, settings, beginner's guide, resident moments, community events, announcements, volunteer opportunities, `aria-label`/`title`/`placeholder`.
- Follow the reference architecture: vue-i18n Composition mode, English bundled, other locales lazy-loaded, saved locale loaded before mount, `<html lang>` updated (`zh-Hans` for Chinese).
- No English literals in `.vue`/JS; no translated strings scattered through components. One JSON per locale, namespaced (`nav`, `pages`, `status`, `home`, `moments`, `visits`, `book`, `community`, `volunteer`, `staff.*`, `guide`, `form`, `toast`, `dialog`, `a11y`, `seed.*`). Seed content (moments, events, news, volunteer roles, inquiry templates) lives under `seed.*` keyed by id. **User-typed content is shown as typed, never auto-translated.**
- Locale-aware dates/times/numbers via `Intl` with locale `en-SG | zh-SG | ms-SG | ta-SG` and `timeZone: 'Asia/Singapore'`.
- Static files only. Add each new key to all four locales in the same change (`npm run i18n:check` enforces parity from Phase 2). Flag wording that needs native-speaker review in `docs/vue-migration/i18n-review.md`.
- Test all four languages at 320 px (Tamil and Chinese text expansion).

## 10. Theme and accessibility
- Themes: light, dark, system (`data-theme` on `<html>`, applied before first paint). Text size `md/lg/xl` via root font-size; all sizes in `rem`; body ≥16 px at default. Respect `prefers-reduced-motion`.
- WCAG AA contrast in both themes (verify with a contrast script before adding colours). Interactive targets ≥48 px. Visible focus ring. Skip link. Descriptive labels; no icon-only essential actions.
- Native `<dialog>` for dialogs/sheets: focus trapped, Esc closes, focus returns to the opener. Live regions for toasts and confirmations. Clear validation messages with required fields marked.
- Status = colour + symbol + words: Feeling Well teal ●, Resting amber ◆, Please Contact Staff muted red ▲; availability Available teal, Limited amber, Fully Booked grey + disabled. General indicators, not medical assessments.
- Focus the page heading after route changes. Test at 320, 390, 768, 1024, 1440 px at every text size.

## 11. Beginner's guide
Simplified card dialog (no spotlight, no voice narration): **caregiver 5 steps** (check updates, view moments, ask staff, book a visit, explore community), **staff 4 steps** (dashboard, status updates, publish a moment, reply to inquiries). Progress indicator, Back/Next/Skip, optional "Take me there", dismiss and reopen (sidebar + settings), keyboard accessible, fully translated, shown once per role per device.

## 12. Volunteer opportunities (Community)
2–3 fictional opportunities (befriending residents, assisting with community activities, supporting festive celebrations), each with title, short description, time commitment and **Express Interest** → simulated confirmation. No personal data collected or submitted.

## 13. Preserved user journeys (must keep working)
1. Staff updates resident status → caregiver sees it (Home + Moments).
2. Staff publishes a moment → caregiver sees it (feed + Home), photo-consent rule enforced.
3. Caregiver submits inquiry → staff queue.
4. Staff replies (templates available) → caregiver sees the response; status Submitted → In Review → Answered.
5. Caregiver books / cancels / reschedules a visit → staff schedule and capacity update (cancelled bookings free their space; capacity is per date and slot); QR pass; staff check-in.
6. Staff saves a draft or publishes an event → caregiver Community updates (drafts hidden; only public events shareable).

## 14. Coding conventions
**Bootstrap class collisions:** Bootstrap CSS is loaded globally, so never name our classes `row`, `col*`, `container`, `card`, `card-title`, `btn`, `toast`, `lead`, `badge`, `nav`, `nav-item`, `nav-link`, `alert`, `modal`, `tab-*`, `list-group*`, `dropdown*` (Phase 2 hit this with `.row`, `.toast`, `.lead`). Prefix component classes (`app-…`, `seg-…`, `side-…`) and use Bootstrap only for utilities like `visually-hidden`, `m-0`, `d-flex`, `gap-*`.
`<script setup>` SFCs, PascalCase files, props down / emits up, shared state in Pinia only, composables only when reused, scoped CSS using tokens (`var(--…)`), Bootstrap utilities for layout/spacing only, no hex colours outside `tokens.css`, comments only for non-obvious "why". Use ISO dates in state; format at render.

## 15. Migration phases (each ends with a summary and waits for approval)
1. **Safety checkpoint + Vue scaffold** — ✅ done: Git repo, baseline commit, tag `react-prototype-final`, React moved to `legacy-react/`, Vue 3 + Vite + Router + Pinia + Bootstrap + vue-i18n scaffold, this file.
2. **Foundation / design system** — ✅ done: tokens (light/dark) + contrast script, Poppins/Open Sans, themes (light/dark/system, no flash, saved), text size (standard 17px / large 19px / extra large 21px, saved), i18n parity script, responsive shell (≥992px sidebar; phone header + 4-tab bottom nav), role switch, shared UI components, translated placeholder pages. Form-field components arrive with the first form (Phase 4).
3. **Data + stores** — ✅ done: relative-date mock data, six Pinia stores with validation and result objects, translated seed content/enumerations/error messages (197 keys x 4 locales), Vitest suite (101 tests) including the six cross-role journeys and a robustness check on awkward dates. Toasts moved into the ui store; no UI changes.
4. **Caregiver screens** — ✅ done: Home (resident switcher, status, latest moment, next visit, community highlight), Moments (well-being, filters, Ask the care team, inquiry history with staff replies), Visits (upcoming/past/cancelled, pass, cancel, reschedule) and the 4-step booking flow with calendar, time slots, review and demo QR pass, Community (events, news, past events, volunteering with simulated interest, event dialog with WhatsApp/Facebook/Copy link, Support SAS). Original SVG illustrations, `FormField`, Intl date formatting, 334 i18n keys x 4 languages, 43 Playwright tests incl. axe.
5. **Staff screens** + all cross-role journeys — ✅ done: Dashboard (stat cards from the stores, quick actions, needs attention), Resident Updates (search, status + note, Save & next resident), Post a Moment (local photo preview with revoked object URLs, multi-resident tagging, photo-consent rule + confirmation, preview dialog), Inquiries (filters, reply dialog, quick-reply templates fill an editable box, marks In Review on open), Visits & Events (`?tab=`; check-in, demo pass scan by reference, per-date/slot capacity stepper, event create/edit/draft/publish dialog). 127 `staff.*` keys x 4 languages; Playwright `e2e/staff.spec.js` (journeys, cross-role A–F, dialog axe) and staff routes added to the axe and responsive matrices. Staff Account stays a placeholder until Phase 6. Not built: microphone/voice input (optional), moment drafts.
6. **Settings + beginner's guide** — ✅ done: `views/AccountView.vue` serves `/account` and `/staff/account` (profile with demo-account chip, caregiver's linked residents with relationship and a resident picker that writes the ui store, staff role + portal explanation, demo-view switch, language/theme/text-size via `SettingsControls skip-role`, Help with about text, guide button and a short "About this demo" disclaimer). Guide: `components/guide/GuideDialog.vue` (mounted once in `App.vue`; 5 caregiver / 4 staff steps from `data/guide.js`; Previous/Next/Finish/Skip/Close; live-region step announcements; focus kept on Next) and `GuideOffer.vue` (a card on Home and the staff Dashboard only, never a pop-up). State in the `ui` store (`guideSeen` per role: `'done' | 'skipped'`, `guideOpen`, `openGuide`, `closeGuide`), saved in `localStorage` as `sas.guide.<role>` (guarded). Reopen from Account, the desktop sidebar, and the staff Dashboard header. `FormField` has `showOptional` (search box hides "(optional)"). 52 new keys (`account.*`, `guide.*`) x 4 languages; `e2e/account.spec.js` (18 tests) and `/account`, `/staff/account` added to the axe/responsive matrices.
7. **Polish** — ✅ done: illustrations recoloured with new `--art-ground` / `--art-cloth` tokens (light + dark; no teal or brand-red fills left), friendlier empty states (text + actions via the `EmptyState` `action` slot), positive "no questions" message on the staff Dashboard, polished `NotFoundView` (keeps the staff shell under `/staff/...`; `PlaceholderView` and its keys removed), subtle motion (page entrance keyed on `route.path`, backdrop fade, card hover on moments/events, success tick `.pop-in`; all off under `prefers-reduced-motion`), Tamil layout fixes (booking step name on its own line on phones, Tamil tab labels 0.75rem), denser 4-up Dashboard grids. `e2e/polish.spec.js` (7 tests). The only teal left is the intentional "Feeling Well" status.
8. **QA:** Playwright + axe regression, viewport/theme/language/text-size matrix, `i18n:check`, build + lint.

## 16. Development rules
1. Read this file first. 2. Preserve `reference/wireframe/` and `legacy-react/` (read-only; port logic, never edit). 3. Frontend-only, fictional data. 4. Incremental phases; no feature or dependency without approval. 5. Verify navigation, the six journeys, language/theme/text-size switching and keyboard use after each phase. 6. Run `npm run build` and `npm run lint` (and tests once they exist). 7. Keep commits small and the repo clean; the React baseline is recoverable via tag `react-prototype-final`.

## 17. Commands
`npm install` · `npm run dev` (http://localhost:5173) · `npm run build` · `npm run preview` · `npm run lint` · `npm test` (Vitest) · `npm run e2e` (Playwright; first run needs `npx playwright install chromium`) · `npm run contrast` (WCAG check of all token pairs, both themes) · `npm run i18n:check` (key/placeholder parity across the 4 locales).
Legacy React app: `cd legacy-react && npm install && npm run dev`.
Note: if `npm install` fails with an EACCES/EEXIST error on `~/.npm/_cacache`, the user-level npm cache has root-owned files; use `npm install --cache <temp dir>` rather than changing permissions.

## 17b. Caregiver portal conventions (Phase 4)
- The viewed resident lives in the ui store (`selectedResidentId`) and is read through `useCaregiver()`; pages never show a resident the caregiver is not linked to. The booking flow's resident switcher uses the caption key `book.forWho`.
- Dates are displayed only via `useFormat()` (`i18n/format.js`): ISO dates carry no time zone, timestamps are shown in Singapore time. Reference dates for time-of-day formatting must be modern (Singapore was UTC+7:30 before 1982; a test guards this). Calendar cells show only the day number; month and availability symbol are CSS pseudo-content so the button's visible text matches its accessible name (WCAG 2.5.3).
- Illustrations are original SVG scenes (`AppIllustration`, figures from `ArtPerson`); they are decorative, never real people, and chosen from a moment's category / an event's category (`utils/content.js`). A `blob:`/`data:`/`https:` image value (staff upload, Phase 5) is shown as a picture instead.
- Event detail opens from `?event=<id>` (Back closes it); only **published** events resolve, so a draft id opens nothing. Only public events show sharing links; share links never include resident information.
- Express Interest is stored in the events store (`interestedIds`) and is a simulation: nothing is sent or collected.
- Donation and social links come from `data/links.js` (verified reachable). No payments are processed.
- Dialogs use `AppDialog` (native `<dialog>`); forms use `FormField` with `novalidate` forms and store result codes mapped to `t('errors.<CODE>')`.

## 18. Open decisions
- Names of demo people (currently Sarah Tan, Madam Tan Mei Ling, Nurse Aisha).
- Account, settings and guide: done in Phase 6.
- Contents of "Donation information" beyond the verified SAS donation link: https://www.societyagedsick.org.sg/donation/ (Facebook: https://www.facebook.com/SASNursingHome, Instagram: https://www.instagram.com/sasnursinghome/).
- Phase 2 left for later: a screen cross-fade on theme/language change (not needed yet), form-field components (Phase 4), per-page document titles use `pages.*` keys.
- Native-speaker review of all non-English text: see `docs/vue-migration/i18n-review.md`.
