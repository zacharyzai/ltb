# CLAUDE.md (PROPOSED for the Vue 3 migration; not yet adopted)

Always read this file before making changes. It supersedes the React-era `CLAUDE.md`, which moves to `legacy-react/CLAUDE.md`.

## 1. Project
**SAS Connect**: caregiver engagement prototype for the Society for the Aged Sick (SAS), Singapore (https://www.societyagedsick.org.sg/). Family caregivers stay connected with nursing-home residents; staff get a low-effort portal.

Goals: **Caregiver reassurance** (updates + questions), **convenient visitation** (book/manage/pass), **community engagement** (events, volunteering, donations). Staff workflows must minimise admin effort.

## 2. Scope: frontend-only visual prototype
Required: faithful, polished UI; routing; dialogs; simulated forms/booking; four languages; themes; text-size control; beginner's guide; fictional mock data; cross-role updates within one browser session.
Forbidden: backend, database, real auth/JWT, MongoDB/Express, external AI or translation services, payments, real SMS/email, real medical records, production infra, runtime machine translation.
Mock data and Pinia state reset on refresh. Only UI preferences (language, theme, text size, guide-seen) may persist, in `localStorage` (guarded by try/catch).

## 3. Stack (final)
Vue 3 (Composition API, `<script setup>`), Vite, Vue Router, Pinia (setup stores), Bootstrap 5 **CSS only** + custom CSS design tokens, vue-i18n, **JavaScript (no TypeScript)**. No React, no Tailwind, no other UI/state/date/animation libraries without approval.

## 4. Design direction
Modern, clean, friendly, spacious; rounded cards; warm neutral backgrounds; teal + green accents; friendly serif for page titles; icon + word everywhere; subtle motion. Inspired by Ah Ma Ah Gong Can (https://github.com/zacharyzai/wad2-proj): adapt its shell, tokens, i18n, theme, dialog and guide **patterns**, not its medical features, mascot art or backend. The old hand-drawn wireframe look (Kalam, Patrick Hand, hand-drawn borders) is retired. `reference/wireframe/` stays as the source of user journeys and content, not styling.

## 5. Structure
See `docs/vue-migration/MIGRATION_PLAN.md` §2. Key rules: `views/{caregiver,staff}`, `components/{layout,ui,controls,guide,domain}`, `stores/{ui,residents,moments,inquiries,visits,events}.js`, `i18n/locales/{en,zh,ms,ta}.json`, `styles/global/*.css`, `data/` for seed + `dates.js`. No folder without a file in it.

## 6. Routes
Caregiver: `/`, `/moments`, `/visits`, `/visits/book`, `/community`, `/account`. Staff: `/staff`, `/staff/updates`, `/staff/moment`, `/staff/inquiries`, `/staff/visits-events`, `/staff/account`. Role = `route.meta.role`; the role switch simply navigates. Lazy-load views; focus `<h1>` and set `document.title` (from i18n) after each navigation.

## 7. State (Pinia)
Six stores: `ui`, `residents`, `moments`, `inquiries`, `visits`, `events`. Store only ISO dates/timestamps; derive counts, upcoming/past, availability and "latest" with getters; never duplicate derived state. Cancelled bookings never count toward capacity. Capacity is per date + slot. Revoke object URLs for removed/replaced/abandoned uploads (published moments keep theirs).

## 8. Internationalisation (mandatory)
English, 简体中文, Bahasa Melayu, தமிழ். **No hard-coded user-visible strings in `.vue` or JS**: text, `aria-label`, `title`, `placeholder`, validation messages, toasts, status labels, dates. Use `t()`; plurals via vue-i18n; dates via `Intl` with `timeZone: 'Asia/Singapore'`. Locale JSON is static; English is bundled, others lazy-loaded. Seed content is translated via `seed.*` keys; user-typed content is shown as typed. New keys go into all four locale files in the same change; run `npm run i18n:check`. Terms needing native-speaker review are listed in `docs/vue-migration/i18n-review.md`.

## 9. Theme and accessibility
Themes: light, dark, system (`data-theme` on `<html>`, no flash). Text size: `md/lg/xl` via root font-size; all sizes in `rem`; body ≥16 px at default. WCAG AA contrast in **both** themes (verify with the contrast script before adding colours). Targets ≥48 px. Visible focus ring. Skip link. Native `<dialog>` for dialogs (focus trapped, Esc closes, focus returns to opener). Live regions for toasts/confirmations. Status = colour + symbol + words. Respect `prefers-reduced-motion`. Test at 320, 390, 768, 1024, 1440 px and at every text size.

## 10. Layout
Phones/tablets (<992 px): compact header + fixed bottom nav. Desktop (≥992 px): sidebar nav, content up to ~1080 px, multi-column where useful. Do not restrict the app to a 480 px column.

## 11. Beginner's guide
Simplified stepped dialog (caregiver 5 steps, staff 4), skippable, reopenable from sidebar/settings, fully translated, keyboard accessible; shown once per role per device.

## 12. Coding conventions
`<script setup>` single-file components, PascalCase files, props down / emits up, stores for shared state, composables only when reused, scoped CSS using tokens (`var(--…)`), Bootstrap utilities for layout only, no inline colours/hex outside `tokens.css`, comments only for non-obvious "why".

## 13. Workflow and restrictions
Implement in the phases of the migration plan, each ending with a summary and a pause for approval. Verify navigation, all six cross-role flows, four languages, both themes, three text sizes, keyboard use and the viewport matrix after each phase. Run `npm run build`, `npm run lint`, `npm test`.
Do not: add features without approval, copy medical/back-end code from the reference, add dependencies casually, delete the React legacy folder, or modify `reference/wireframe/`.

## 14. Preserved user journeys (must keep working)
A staff status → caregiver Home/Moments · B staff moment → caregiver feed + Home · C caregiver inquiry → staff queue → staff reply → caregiver · D booking/cancel/reschedule → staff schedule + capacity · E staff event publish/edit → caregiver Community (drafts hidden) · check-in.

## 15. Open decisions
Tracked in `MIGRATION_PLAN.md` §13 until answered; update here once resolved.
