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
Testing tools approved: Vitest, Playwright, `@axe-core/playwright` (install when first needed, keep the suite small).
Not allowed: React, Tailwind, Lucide package, axios, UI kits, date/animation libraries, other state libraries. Any new dependency needs approval.

## 4. Design direction
Modern, clean, friendly, spacious; rounded cards; warm neutral backgrounds; teal and green accents; clean typography; icon + word everywhere; subtle motion; large buttons. Inspired by **Ah Ma Ah Gong Can** (https://github.com/zacharyzai/wad2-proj): adapt its application shell, desktop sidebar + mobile bottom nav, tokens + Bootstrap bridge, theme switching, i18n architecture, native `<dialog>` confirmations and toasts. **Do not** copy its mascot, medicine illustrations, scan/bill/auth features or backend.
The hand-drawn wireframe styling (Kalam, Patrick Hand, hand-drawn borders) is retired. `reference/wireframe/` remains the source of user journeys and content only.

**Brand research (official SAS site, checked in Phase 1):** the site uses red (`#ee3e3e`, `#e02b20`, dark `#921515`), blue (`#005aab`, link blue `#2ea3f2`), white and `#333`; fonts Poppins and Open Sans; Divi (WordPress) theme. It is **not** teal/green. Decision to confirm in Phase 2: keep the approved teal + green UI palette (`#1d6560` primary, `#2a8c82` accent, green support colour, warm neutrals) and use SAS red sparingly as a brand accent (e.g. donate call-to-action, logo mark), without implying an official SAS logo. Prefer Atkinson Hyperlegible Next (reference) for readability over Poppins.

**Imagery:** original, consistent, friendly illustrations (authored SVG), respectful depictions of elderly residents and caregivers. No unverified photographs, no striped placeholders where avoidable, no imitation SAS logo, no real SAS resident photos. A `MomentPhoto`-style component may later render licensed photos. Keep the notice "Images and resident information are for demonstration purposes only."

## 5. Project structure
```
legacy-react/      preserved React prototype (read-only reference; runs on its own)
reference/wireframe/  original Claude Design export (NEVER modify)
docs/vue-migration/   MIGRATION_PLAN.md, i18n-review.md
scripts/              check-i18n.mjs (added in Phase 2)
tests/  e2e/          Vitest unit tests, Playwright specs (added when needed)
src/
  main.js  App.vue  theme.js  screenFade.js
  router/index.js
  i18n/{index.js, format.js, locales/{en,zh,ms,ta}.json}
  stores/{ui,residents,moments,inquiries,visits,events}.js
  data/        seed data (ids + ISO dates), dates.js
  composables/ only when reused twice
  components/{layout,ui,controls,guide,domain}/
  views/{caregiver,staff}/  SettingsView.vue  NotFoundView.vue
  assets/      original illustrations
  styles/      main.css, global/{tokens,base,buttons,forms,feedback,surfaces,layout,motion}.css
```
Do not create folders without files. Phase 1 currently contains only the scaffold (router, ui store, i18n, placeholder view).

## 6. Routes
Caregiver: `/` Home, `/moments`, `/visits`, `/visits/book` (4-step flow, `?reschedule=<id>`), `/community` (`?event=<id>` opens detail), `/account`.
Staff: `/staff` Dashboard, `/staff/updates`, `/staff/moment`, `/staff/inquiries`, `/staff/visits-events` (internal tabs **Visits** and **Events**, `?tab=`), `/staff/account`.
`meta.role` decides the shell; the router guard sets `ui.role`. The role switch simply navigates. Views are lazy-loaded; after navigation set `document.title` from i18n, focus the page `<h1>`, scroll to top.

## 7. Navigation
**Desktop (≥992 px):** sidebar (brand, nav, language, theme, text size, role switch, guide link, account), content area max ≈1080 px with responsive cards. Do not lock the app to a 480 px column.
**Mobile (<992 px):** compact header (brand, account/settings, controls) + fixed bottom nav. **Caregiver: 4 tabs** Home, Moments, Visits, Community; Account/Settings from the header. **Staff: 4 tabs** Dashboard, Updates, Inquiries, Visits & Events; **Post a Moment** is a prominent quick action on the dashboard and the Updates page (desktop sidebar lists all five). Do not add tabs if labels do not stay readable at 320 px in all four languages.

## 8. State (Pinia)
Six stores: `ui` (role, locale, theme, text size, guide), `residents` (residents + well-being statuses), `moments`, `inquiries`, `visits` (bookings + per-date/slot capacity), `events`. Store ISO dates/timestamps only; derive pending count, upcoming/past, availability, latest moment and published events with getters; never duplicate derived state. Cancelled bookings never count toward capacity. Revoke object URLs for removed/replaced/abandoned uploads (published moments keep theirs).

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
`<script setup>` SFCs, PascalCase files, props down / emits up, shared state in Pinia only, composables only when reused, scoped CSS using tokens (`var(--…)`), Bootstrap utilities for layout/spacing only, no hex colours outside `tokens.css`, comments only for non-obvious "why". Use ISO dates in state; format at render.

## 15. Migration phases (each ends with a summary and waits for approval)
1. **Safety checkpoint + Vue scaffold** — ✅ done: Git repo, baseline commit, tag `react-prototype-final`, React moved to `legacy-react/`, Vue 3 + Vite + Router + Pinia + Bootstrap + vue-i18n scaffold, this file.
2. **Foundation / design system:** tokens, themes, text size, i18n infrastructure + parity script, fonts, shell (sidebar ↔ bottom nav), role switch, shared UI components (buttons, cards, tabs, badges, dialogs, toast, icons, form fields), contrast verification.
3. **Data + stores:** seed data, six stores, Vitest tests for capacity/availability/derived state and cross-role transitions.
4. **Caregiver screens** (with all four languages as each screen is built, illustrations, volunteer section).
5. **Staff screens** + all cross-role journeys.
6. **Settings + beginner's guide.**
7. **Polish:** illustrations, motion, empty/error states, dark-mode and Tamil/Chinese layout audit.
8. **QA:** Playwright + axe regression, viewport/theme/language/text-size matrix, `i18n:check`, build + lint.

## 16. Development rules
1. Read this file first. 2. Preserve `reference/wireframe/` and `legacy-react/` (read-only; port logic, never edit). 3. Frontend-only, fictional data. 4. Incremental phases; no feature or dependency without approval. 5. Verify navigation, the six journeys, language/theme/text-size switching and keyboard use after each phase. 6. Run `npm run build` and `npm run lint` (and tests once they exist). 7. Keep commits small and the repo clean; the React baseline is recoverable via tag `react-prototype-final`.

## 17. Commands
`npm install` · `npm run dev` (http://localhost:5173) · `npm run build` · `npm run preview` · `npm run lint`.
Legacy React app: `cd legacy-react && npm install && npm run dev`.
Note: if `npm install` fails with an EACCES/EEXIST error on `~/.npm/_cacache`, the user-level npm cache has root-owned files; use `npm install --cache <temp dir>` rather than changing permissions.

## 18. Open decisions
- Final palette and SAS-red accent usage (Phase 2).
- Staff mobile tab set (proposed above) confirmed against Tamil label widths (Phase 2).
- Names of demo people (currently Sarah Tan, Madam Tan Mei Ling, Nurse Aisha).
- Contents of "Donation information" beyond the verified SAS donation link: https://www.societyagedsick.org.sg/donation/ (Facebook: https://www.facebook.com/SASNursingHome, Instagram: https://www.instagram.com/sasnursinghome/).
