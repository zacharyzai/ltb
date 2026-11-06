# SAS Connect: Vue 3 Migration Plan

Status: **proposal, awaiting approval.** No source changed, nothing installed, nothing deleted.
Inputs inspected: the current React app and `CLAUDE.md`; the reference repo `zacharyzai/wad2-proj` (Ah Ma Ah Gong Can), cloned read-only into the session scratchpad.

---

## 1. Findings

### 1.1 Current SAS Connect (React) — what we are carrying over

| Area | State today |
|---|---|
| Stack | React 19, Vite, Tailwind v4, React Router, Lucide React, one `AppContext` |
| Size | ~45 source files: 11 routes, 13 components, 6 data files, 1 context |
| Logic worth keeping | Capacity/availability derivation (`data/visits.js`), Singapore-time date helpers (`data/dates.js`), cross-role state flows, QR-pass generator, consent rules, event save logic |
| Weak spots to fix in the port | Bookings matched by **display label** ("Mon 16 Nov") instead of ISO date; all copy hard-coded English; no tests; no theme/dark mode; 480 px column on desktop; photos are placeholders |
| Cross-role flows (must survive) | A status, B moment, C inquiry→reply, D booking/cancel→capacity, E events (draft/publish), plus check-in |

### 1.2 Reference: Ah Ma Ah Gong Can — what it does well

| Concern | How the reference does it | Verdict for SAS |
|---|---|---|
| Entry | `main.js` installs Pinia → router → i18n; mounts only after `router.isReady()` and the saved locale loaded (no English flash) | **Adapt** (drop auth) |
| Shell | `App.vue`: phone = compact header + fixed bottom tabs; ≥992 px = sticky sidebar; skip link; `meta.bare` routes opt out of the shell; footer disclaimer | **Adapt**, rewrite nav |
| Routing | Lazy `() => import()` routes, `meta` flags, guards, after-navigation focus on `<h1>`, per-route `document.title` from i18n (`pages.<name>`) | **Adapt** |
| Page transitions | View Transitions on desktop, 120 ms opacity fade on phones, always off for reduced motion (`screenFade.js`) | **Reuse nearly verbatim** |
| i18n | vue-i18n v11 Composition mode; **only English bundled**, zh/ms/ta lazy-loaded; `<html lang>` updated; language switch cross-fades; one JSON per locale | **Reuse the architecture** |
| Theme | `theme.js`: `light | dark | system`, `data-theme` on `<html>`, inline script in `index.html` (no flash), follows OS changes | **Adapt** (drop account sync) |
| Tokens | `styles/global/tokens.css`: colours, radii, spacing (4 px base), type, motion; `[data-theme=dark]` override; **Bootstrap bridge** (`--bs-*` vars mapped to tokens); compact tokens ≥992 px; nothing below 16 px | **Adapt** (recolour, rem-ise for text-size) |
| CSS org | `styles/global/{tokens,base,buttons,forms,feedback,surfaces,layout,motion}.css` + per-view / per-component CSS | **Reuse structure** |
| Primitives | `Card`, `BigButton`, `PageHeader`, `EmptyState`, `ErrorBanner`, `InfoTip`, `LanguageSwitch`, `ThemeToggle`, `AppIcon` (inline SVG set) | **Adapt** |
| Dialogs | `LeaveDialog` uses native `<dialog>.showModal()`, Esc/backdrop = "stay" | **Generalise** into `ConfirmDialog` + `SheetDialog` |
| Feedback | `useToast` composable (self-hiding message) | **Adapt** to a global live-region host |
| Guide | `stores/guide.js` (steps + seen flag) and `GuideDialog.vue` (857 lines: spotlight + speech bubble + read-aloud + sample scan) | **Simplify** (see §8) |
| State | Pinia **setup stores** (`defineStore(id, () => {...})`) | **Reuse the style** |
| Tests | Vitest + @vue/test-utils (unit), Playwright e2e incl. axe a11y, i18n, theme, guide specs | **Adapt** (see §12) |

**Not carried over (medical/back-end):** `server/`, `api/`, `stores/{auth,scan,ask,doses,medicines,speech,scheduleSync}`, `api/client.js`, `rules/*`, `utils/*` (OCR, redaction, PDF), `components/{scan,bill,schedule,ask,care,explain,home,landing}`, `CapsuleBuddy`, `KindIcon`, `PageBackdrop` (medicine mascot art), axios, argon2, express, mongoose, jsonwebtoken, tesseract, pdfjs.

### 1.3 Reference gaps SAS must fill itself
- **No text-size control** (reference has fixed px sizes). Needed: rem-based tokens + root scale.
- **No role switcher / second portal.** Needed: two shells over one design system.
- **Per-view toast**, no global one.
- **Dates formatted by hand** in reference helpers; SAS should use `Intl.DateTimeFormat(locale, { timeZone: 'Asia/Singapore' })` so weekday/month names localise for free.

---

## 2. Proposed Vue project structure

```
/                       (project root, Vue app after migration)
├── legacy-react/       React prototype, preserved as the functional reference (moved, not deleted)
├── reference/wireframe/  original Claude Design export (untouched)
├── docs/vue-migration/ this plan + proposed CLAUDE.md
├── index.html          inline no-flash theme+text-size script; fonts
├── vite.config.js
├── scripts/check-i18n.mjs   key/placeholder parity + empty-string check across 4 locales
├── tests/              vitest unit/component tests
├── e2e/                Playwright + axe (if approved)
└── src/
    ├── main.js
    ├── App.vue                 shell switch: bare vs role shell, skip link, toast host, guide dialog
    ├── theme.js                applyTheme / applyTextSize (DOM effects only; state lives in ui store)
    ├── screenFade.js           View Transitions helper (from reference)
    ├── router/index.js
    ├── i18n/
    │   ├── index.js            lazy-loaded locales, setLocale/chooseLocale, <html lang>
    │   ├── format.js           useFormat(): date/time/number via Intl in Asia/Singapore
    │   └── locales/{en,zh,ms,ta}.json
    ├── stores/                 ui.js  residents.js  moments.js  inquiries.js  visits.js  events.js
    ├── data/                   seed*.js (ids + ISO dates; text lives in locale files), dates.js
    ├── composables/            useToast.js  useFocusOnRoute.js  useDialog.js
    ├── components/
    │   ├── layout/   AppShell  SideNav  BottomNav  AppHeader  PageHeader  PageSection  EmptyState
    │   ├── ui/       BaseCard  BigButton  SegmentedTabs  StatusBadge  AvailabilityBadge  InquiryChip
    │   │             FormField  ConfirmDialog  SheetDialog  ToastHost  AppIcon  Stepper
    │   ├── controls/ LanguageSwitch  ThemeSwitch  TextSizeSwitch  RoleSwitch
    │   ├── guide/    GuideDialog  GuideStep
    │   └── domain/   ResidentCard  MomentCard  MomentPhoto  VisitCard  SlotPicker  DateStrip  QrPass
    │                 EventCard  EventDetailDialog  ShareSheet  InquiryThread  StatTile  ResidentChip
    ├── views/
    │   ├── caregiver/ HomeView  MomentsView  VisitsView  BookVisitView  CommunityView
    │   ├── staff/     DashboardView  ResidentUpdatesView  PostMomentView  InquiriesView  VisitsEventsView
    │   ├── SettingsView.vue (shared "Account and Settings")
    │   └── NotFoundView.vue
    ├── assets/         illustrations (authored SVG) and, later, licensed photos
    └── styles/         main.css; global/{tokens,base,buttons,forms,feedback,surfaces,layout,motion}.css
```
No `hooks/`-style sprawl: composables only where reused twice.

---

## 3. Reuse / adapt / new

**Direct port (logic only, framework-free):**
`dates.js` (Singapore date helpers), availability/capacity maths from `visits.js`, `QRPass` generator algorithm, seed-data shapes, event-save normalisation, the five cross-role flows' state transitions.

**Adapt from the reference:** `main.js`, `theme.js`, `screenFade.js`, `i18n/index.js`, `LanguageSwitch`, `ThemeToggle` (→ 3-way), `AppIcon` pattern (own icon set, Lucide path data, ISC), `Card`, `BigButton`, `PageHeader`, `EmptyState`, `ErrorBanner`, `LeaveDialog`→`ConfirmDialog`, `useToast`, `App.vue` shell + `App.css`, all `styles/global/*.css`, tokens + Bootstrap bridge, guide store shape.

**Rebuild as new Vue components (React UI cannot be reused):** every page and domain component listed in §2, `RoleSwitch`, `TextSizeSwitch`, `SheetDialog` (bottom sheet on phone / centred on desktop), `DateStrip` (inspired by the reference `DayStrip`), `SlotPicker`, `ShareSheet`, `Stepper`, `ToastHost`, `GuideDialog` (simplified).

**Drop:** Tailwind, Lucide React, hand-drawn styling, Kalam/Patrick Hand, the 480 px column, `BottomSheet`'s focus code (superseded by native `<dialog>`).

---

## 4. Routing

Role comes **from the route** (`meta.role`), not a separate source of truth; the guard sets `ui.role`, so deep links and role switching are the same mechanism.

| Path | View | Role | Notes |
|---|---|---|---|
| `/` | Home | caregiver | greeting, resident card + status, latest moment, next visit, community highlight |
| `/moments` | Moments | caregiver | status, feed (Latest / Week / All), Ask Care Team dialog, inquiry history + replies |
| `/visits` | Visits | caregiver | upcoming/past, pass dialog, cancel/reschedule confirm |
| `/visits/book` | BookVisit | caregiver | 4-step flow, `?reschedule=<id>`; lazy |
| `/community` | Community | caregiver | tabs Upcoming/Past/News; `?event=<id>` opens detail (Back closes it); volunteer + donate cards |
| `/account` | Settings | caregiver | profile, language, theme, text size, guide, role switch |
| `/staff` | Dashboard | staff | tiles, quick actions, needs-reply |
| `/staff/updates` | ResidentUpdates | staff | pick → status → note → save & next |
| `/staff/moment` | PostMoment | staff | |
| `/staff/inquiries` | Inquiries | staff | filter, reply dialog + templates |
| `/staff/visits-events` | VisitsEvents | staff | two tabs (Visits, Events) via `?tab=` |
| `/staff/account` | Settings | staff | same view, staff shell |
| `/:pathMatch(.*)*` | NotFound | bare | |

- All views lazy-loaded; `meta.title` key → `pages.<name>` for `document.title` (reference pattern).
- After navigation: focus the page `<h1>` (reference pattern) and scroll to top.
- Transitions: View Transitions ≥992 px, 120 ms fade on phones, none for reduced motion.
- Event detail and Ask dialogs are query-driven or local state so Back/Esc behave predictably.

---

## 5. Pinia stores (setup-style, six)

| Store | State | Derived (getters/computed, never duplicated) | Actions |
|---|---|---|---|
| `ui` | `locale`, `themeChoice` (`light|dark|system`), `textSize` (`md|lg|xl`), `role`, `guideOpen/step/seen{role}` | `shownTheme`, `currentUser` (demo caregiver/staff identity), `isStaff` | `setTheme`, `setTextSize`, `setRole`, `openGuide/endGuide` |
| `residents` | `residents`, `statuses{id:{status,note,updatedAt(ISO)}}` | `linkedResident`, `statusOf(id)`, `notUpdatedToday`, `updatedTodayCount` | `updateStatus(id,status,note)` |
| `moments` | `moments` (id, residentIds, category, title?, caption?, imageUrl?, createdAt ISO, `seedKey?`) | `forResident(id)`, `latestFor(id)`, `inRange('latest'|'week'|'all')` | `addMoment` |
| `inquiries` | `inquiries` (status, reply, createdAt ISO) | `pending`, `pendingCount`, `answered`, `mine(caregiverId)` | `submit`, `markInReview`, `reply` |
| `visits` | `bookings`, `capacityOverrides{"date|slot":n}`, ref counter | `upcomingFor(resident)`, `pastFor`, `todays`, `spacesLeft(date,slot)`, `availability(date,slot)`, `bookableDates` | `book`, `reschedule`, `cancel`, `checkIn`, `changeCapacity` |
| `events` | `events` (published, public, iso start/end, `seedKey?`) | `published`, `upcoming`, `past`, `drafts` | `saveEvent` |

Rules: ISO dates/timestamps only in state; formatting at render via `useFormat()`. Cross-store reads go through the other store's getters (e.g. `visits` reads `ui.currentUser`). Preferences in `ui` persist to `localStorage` (try/catch, as reference); **mock data never persists**.

---

## 6. Internationalisation

- **Architecture = reference:** vue-i18n v11, Composition API, `legacy:false`, `fallbackLocale:'en'`, English bundled, `zh/ms/ta` lazy-loaded, `localeReady` awaited before mount, `<html lang>` and `lang` attributes on switcher buttons, cross-fade on switch.
- **One JSON per locale, namespaced:** `app`, `nav`, `pages`, `common`, `status`, `inquiryStatus`, `availability`, `home`, `moments`, `ask`, `visits`, `book`, `pass`, `community`, `share`, `settings`, `guide`, `staff.{dashboard,updates,moment,inquiries,visitsEvents}`, `form.errors`, `toast`, `dialog`, `a11y`, `seed.{moments,events,news,inquiries,templates}`.
- **Rules:** no English literals in `.vue` templates or script; every `aria-label`, `title`, `placeholder`, validation message and toast is a key; plurals via vue-i18n (`"{n} visitor | {n} visitors"`); no string concatenation for sentences.
- **Seed/mock content is translatable** (`seed.*`, keyed by `seedKey`); **user-typed content** (a staff caption, a caregiver question) is stored and shown as typed, never auto-translated. Staff reply templates are translated keys, but the chosen text is copied into the reply as typed.
- **Dates/times/numbers:** `Intl.DateTimeFormat` with `en-SG`, `zh-SG`, `ms-SG`, `ta-SG` and `timeZone: 'Asia/Singapore'`.
- **Fonts:** Latin = Atkinson Hyperlegible Next + display serif (Google Fonts, as reference); Chinese and Tamil use system fonts (reference does this to avoid 170–660 KB downloads).
- **Static files only, no runtime translation APIs.** I write the zh/ms/ta text; `docs/vue-migration/i18n-review.md` lists terms for native-speaker review, e.g.: *Care Team*, *Moments*, *Well-being* status labels (Feeling Well / Resting / Please Contact Staff), *Visit pass*, *nursing home* (疗养院 vs 养老院), honorifics (Madam → 女士 / Puan / திருமதி), *Fully booked*, *volunteer*, *donate*, and all Tamil UI nouns.
- **Guardrails:** `scripts/check-i18n.mjs` fails on missing keys, empty strings, or mismatched `{placeholders}` across the 4 locales; a Playwright pass in Tamil at 320 px checks layout expansion.

---

## 7. Theme system and visual redesign

**Tokens** (`styles/global/tokens.css`), same names as the reference so its components port cleanly:
- Surfaces: warm paper page, white/soft cards, `--color-border*`, shadows.
- **SAS palette (proposal, verify in Phase 1):** primary `#1d6560` (6.8:1 with white), brand accent `#2a8c82`, fresh green `#3f9b6f` for success/decoration, warm neutrals `#faf7f2 / #fffdfa / #ece5d9`. Status colours retained from the React app (teal ● / amber ◆ / muted red ▲) with **dark-mode variants** and shape + words always.
- Type scale in **rem**; `html` size set by text size (`md 100%`, `lg 112.5%`, `xl 125%`); nothing below 16 px at `md`.
- Radii 12–28 px (rounded cards), spacing 4 px base, motion tokens, `--focus-ring`.
- Bootstrap bridge (`--bs-body-bg`, `--bs-body-color`, `--bs-border-color`, …) so Bootstrap utilities (grid, spacing, `d-flex`, `visually-hidden`) follow tokens in both themes. **Bootstrap CSS only; no Bootstrap JS.**

**Theme:** `light | dark | system`; `data-theme` on `<html>`; inline script in `index.html` applies theme and text size before first paint; follows OS change in `system`; reduced-motion respected; contrast script re-run for every token pair in both themes (target ≥ AA; I already have the checker from Phase 4).

**Layout:**
- **≥992 px:** sticky left sidebar (brand, nav, language/theme/text-size, role switch, guide link, account); content max-width ~1080 px, two-column grids where it helps (Moments feed + status panel, Visits upcoming + calendar, staff dashboard tiles). No 480 px lock.
- **<992 px:** compact header + fixed bottom nav (caregiver 5: Home, Moments, Visits, Community, Account; staff 5: Dashboard, Updates, Moments*, Inquiries, Visits & Events — *final tab set to be checked for Tamil label width), safe-area padding.
- **Role switch:** visible, labelled, in sidebar and in the phone Account page and header.

**Visual direction:** modern, calm, spacious, rounded cards, a friendly serif for page titles, large buttons (≥48 px), icon + word everywhere, hero greeting card with resident avatar and status, soft teal→green gradients used sparingly.

**Imagery (blocker to decide):** meaningful photographs need verified licences, and the earlier Commons search found nothing usable. Proposal: ship **authored SVG illustrations** (gardening, music, crafts, family, community; no licence risk) as the default, with a `MomentPhoto` component that renders a real photo when one exists. Real photos then arrive only if you supply licensed files (or approve specific Unsplash/Pexels images after you check their licence pages). Disclaimer "Images and resident information are for demonstration purposes only" stays.

---

## 8. Beginner's guide

Reference's guide is a spotlight tour plus read-aloud, with server-side speech and a sample medicine scan. For SAS I recommend a **simplified, robust v1**:
- Native `<dialog>` card with illustration, title, body, progress ("Step 2 of 5"), **Back / Next / Skip**, optional **"Take me there"** that routes to the relevant page and closes; `Esc` dismisses; focus moves in and returns to the opener.
- **Caregiver (5 steps):** check updates (Home) → view moments → ask the care team → book a visit → explore community. **Staff (4 steps):** dashboard → status updates → post a moment → reply to inquiries.
- Step lists live in `components/guide/steps.js`; all text in `guide.caregiver.*` / `guide.staff.*` (4 languages).
- First visit per role shows once (device preference); reopen from sidebar "How to use SAS Connect" and Settings; "Show again" always works.
- **Not included in v1:** moving spotlight/glow on `data-guide` targets, read-aloud/TTS. Spotlight is an optional Phase 7 upgrade if you want closer parity with the reference. (Read-aloud would need a browser `speechSynthesis` decision; Tamil/Malay voice availability is poor offline.)

---

## 9. Migration strategy and phases

**Safety (Phase 0).** The project is **not a git repo**. Before anything else: `git init`, commit the current React app, tag `react-prototype-final`; `git mv` React `src/`, config and `package.json` into `legacy-react/` (so it still runs: `cd legacy-react && npm run dev`); keep `reference/wireframe/` untouched. Nothing deleted. The Vue app is scaffolded at the root so the final project layout is clean.

| Phase | Deliverable | Review gate |
|---|---|---|
| **0 Safety + scaffold** | git checkpoint + tag; React moved to `legacy-react/`; Vite + Vue 3 + Router + Pinia + vue-i18n + Bootstrap installed; empty routes render | structure reviewed |
| **1 Foundation** | tokens, themes (light/dark/system), text size, i18n infra (en + stub locales), fonts, shell (sidebar ↔ bottom nav), role switch, primitives (`BigButton`, `BaseCard`, `SegmentedTabs`, `StatusBadge`, `SheetDialog`, `ConfirmDialog`, `ToastHost`, `AppIcon`, `FormField`), contrast check, route stubs | visual sign-off on the design language (this is the main redesign review) |
| **2 Data + stores** | seed data (ISO dates, seed keys), six stores, vitest unit tests for capacity/availability/derived getters/cross-role transitions | tests green |
| **3 Caregiver** | Home, Moments + Ask dialog + inquiry history, Visits + Book flow + QR + cancel/reschedule, Community + detail + share + volunteer + donate; en + zh/ms/ta strings written **with each screen** | 4 languages × screens reviewed |
| **4 Staff** | Dashboard, Resident Updates, Post a Moment (consent, preview, object-URL cleanup), Inquiries (templates), Visits & Events (check-in, per-date capacity, event create/edit/draft) + all 6 cross-role flows | flows A–E + check-in pass |
| **5 Settings + guide** | `SettingsView`, `TextSizeSwitch`, guide (both roles), reopen paths | guide walkthrough |
| **6 Polish + imagery** | illustrations (or licensed photos), motion, empty/error states, dark-mode audit, Tamil/Chinese layout pass | visual QA |
| **7 QA + hardening** | full regression, axe, keyboard, 320–1440 px matrix × 3 text sizes × 3 themes × 4 languages (sampled), i18n parity script, build/lint | final report |
| *(optional)* spotlight guide, read-aloud | only if requested | |

Each phase ends with a summary and waits for approval, as before. i18n is done **per screen** (not at the end) to avoid rework and untranslated gaps.

---

## 10. Feature migration map

| Feature | Port style |
|---|---|
| Capacity/availability maths, date helpers, QR generator, event normalisation | **Direct logic port** (framework-free JS → Pinia getters / utils), now with tests |
| Cross-role flows A–E, check-in, per-date capacity, consent rule, object-URL cleanup | **Port logic, rebuild UI** |
| Home, Moments, Visits, Book, Community, Staff pages, dialogs, tabs, badges | **Rebuild** in Vue + Bootstrap + tokens |
| Skip link, page titles, focus-on-route, reduced motion, text-size | **Re-implement** (reference patterns) |
| Hand-drawn style, Tailwind classes, 480 px shell | **Discard** |
| Language switcher, dark mode, guide, profile/settings, volunteer card, desktop sidebar | **New** (SAS never had them) |

---

## 11. Risks and dependencies

| Risk | Mitigation |
|---|---|
| **Photo licensing** blocks "meaningful photographs" | authored illustrations by default; photos only from user-supplied/verified sources |
| **Tamil/Chinese text expansion** breaks nav and buttons | rem units, wrapping buttons, short nav labels, Tamil @320 px in every phase's test pass |
| Bootstrap + custom CSS collisions | CSS only, token bridge, own `.btn` family on top (as reference); no Bootstrap JS; scoped component CSS |
| Safari/older View-Transitions support | feature-detect, plain fallback (reference already does) |
| Dark-mode contrast of status colours | dark variants verified with the contrast script before use |
| Translation quality | static files, review list, parity script, native-speaker review before any real use |
| Scope creep from reference (scan, speech, accounts) | explicit exclusion list (§1.2) in `CLAUDE.md` |
| Date logic regressions in port | move to ISO keys, unit-test capacity & "today" with injected clock |
| Seed-content translation volume (~60 strings × 3 locales) | accepted; counted in Phase 3 |
| Router role guard complexity | role = `route.meta.role`, nothing else |

**Dependencies to install (approval requested):** runtime `vue`, `vue-router`, `pinia`, `vue-i18n`, `bootstrap`; dev `vite`, `@vitejs/plugin-vue`, `vitest`, `@vue/test-utils`, `jsdom`. Optional dev: `@playwright/test`, `@axe-core/playwright` (as reference), `oxlint` (already used). **Not** adding: Lucide package, Tailwind, axios, any date or animation library.

---

## 12. Testing strategy

- **Unit (Vitest):** `dates`, `visits` capacity/availability (incl. cancelled releases), each store's getters/actions, cross-store flows (status→caregiver view, reply→caregiver, book/cancel→staff).
- **Component (@vue/test-utils):** `SheetDialog` focus trap/return/Esc, `SegmentedTabs` arrows, `StatusBadge` (symbol + word), `AvailabilityBadge`, `FormField` validation messages, `GuideDialog` navigation.
- **i18n:** `check-i18n` parity script in CI/`npm test`; a test that renders each view in each locale and fails on missing-key warnings.
- **E2E (Playwright, if approved):** the six flows end to end; keyboard-only pass; axe on every route × light/dark; viewport matrix 320/390/768/1024/1440 with text sizes; Tamil + Chinese layout checks; theme persistence; role switching; reduced-motion.
- **Manual:** screen-reader spot check of dialogs and live regions; contrast report for both themes; build + lint.
- Pass criteria carried from the React phases: no console errors, no horizontal overflow, targets ≥ 48 px, AA contrast.

---

## 13. Unresolved questions (need your decisions)

1. **Folder strategy:** OK to `git init` and move the React app to `legacy-react/` (Vue at root), or prefer Vue in a new sibling folder and leave React exactly where it is?
2. **Photos:** go with authored SVG illustrations unless you supply licensed photos, or do you want me to propose specific Unsplash/Pexels images for you to licence-check?
3. **Guide fidelity:** simplified card guide (recommended) or full spotlight tour like the reference? Read-aloud: skip, or browser `speechSynthesis` best-effort?
4. **Staff navigation:** one combined "Visits & Events" page with two tabs (as proposed), or two separate nav items?
5. **Settings route:** one shared Settings view reachable from both shells (proposed), or separate caregiver/staff pages?
6. **Preference persistence:** persist language/theme/text size/guide-seen in `localStorage` (proposed; mock data still resets), or nothing persists at all?
7. **Brand palette:** keep the teal family from the React app plus a green accent, or should I first extract colours from the official SAS site/logo guidelines?
8. **Seed content translation:** translate seed moments/events/news/inquiries (proposed), or keep seed content English-only and translate UI only?
9. **Test tooling:** OK to add Vitest + Playwright + axe as dev dependencies (reference does)? And an `@intlify` ESLint rule to flag raw text, or the parity script plus manual QA only?
10. **Volunteer opportunities** are new in the spec: confirm a simple fictional list of 2–3 roles with a mock "Express interest" button (no forms beyond name/contact fields?), and what "Donation information" should show beyond the verified SAS donation link.
11. **Staff/caregiver demo identities:** keep Sarah Tan / Mdm Tan / Nurse Aisha, or rename?
