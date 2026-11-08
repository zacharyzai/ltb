# SAS Connect: final QA report (Phase 8)

Scope: verification and refinement of the Vue 3 prototype. No new features were added. Everything below was measured in this repository; where something was **not** tested, it says so.

## 1. Project overview
SAS Connect is a frontend-only prototype for the Society for the Aged Sick (SAS), Singapore: family caregivers follow resident updates, ask the care team questions, book visits and join community activities; staff post status updates and moments, answer questions, and manage visits and events. All people, residents and data are fictional and reset on refresh. It has not been tested with SAS staff or caregivers.

## 2. Final implemented features
- **Caregiver (6 routes):** Home, Moments (+ Ask the care team, inquiry history), Visits (upcoming/past/cancelled, QR demo pass, cancel, reschedule), 4-step booking flow, Community (events, news, past events, volunteering, event detail and sharing, donation link), Account.
- **Staff (6 routes):** Dashboard, Resident Updates, Post a Moment (photo preview, consent rule), Inquiries (templates), Visits & Events (check-in, per-date/slot capacity, event drafts and publishing), Account.
- Four languages (EN, 中文, BM, தமிழ்), light/dark/system themes, three text sizes, beginner's guide (5 caregiver / 4 staff steps), 404 page, demo role switch.

## 3. Technology
Vue 3 (`<script setup>`), Vite, Vue Router, Pinia, Bootstrap 5 CSS only, vue-i18n, JavaScript. Tests: Vitest, Playwright + axe-core. No new dependencies were added in Phase 8.

## 4. Verification results (final run)
| Check | Result |
|---|---|
| `npm run build` | succeeds |
| `npm run lint` | 0 warnings, 0 errors |
| `npm test` (Vitest) | 116 tests in 11 files pass |
| `npm run e2e` (Playwright, Chromium) | 124 tests in 7 files pass (119 existing + 5 new in `e2e/qa.spec.js`) |
| `npm run contrast` | all 80 token pairs pass WCAG AA, light and dark |
| `npm run i18n:check` | 506 keys x 4 locales, parity and placeholders OK |
| Console sweep (dev build, 17 routes x 4 languages) | no warnings, errors or page errors |

The stated baseline was 112 Playwright tests; the suite actually contained 119 before this phase. No test was removed or weakened.

## 5. Functional and cross-role testing
All routes were exercised by the Playwright suite in a real browser: every caregiver and staff page, dialogs, forms and validation, filters, booking, cancel, reschedule, check-in, capacity limits, draft/publish, photo-consent rule, volunteering, sharing, guide, account.
Cross-role journeys **A-F pass in the browser** (`e2e/staff.spec.js`): A status update reaches Home and Moments; B published moment reaches the right caregiver (consent rule enforced); C question appears in the staff queue and dashboard count; D template reply reaches the caregiver and lowers the pending count; E booking appears on the staff schedule and cancelling frees the space; F drafts stay hidden, published events appear.
Store-level rules (dates, capacity, consent, validation, error codes all translated) are covered by the 116 Vitest tests.

## 6. Accessibility
- axe-core (WCAG 2.1 A/AA) runs on all 13 routes in light and dark, the booking steps, community tabs, and staff/caregiver dialogs (ask, event, pass, reply, scan, preview, 404): **no violations**.
- Keyboard: dialogs close on Escape and return focus to the opener (tested); skip link focuses `#main` (new test); heading takes focus after route changes. Focus trap and Shift+Tab order were covered by existing dialog tests and not re-audited by hand.
- Contrast: 80 pairs pass (script). Text sizes standard/large/extra large are covered by the responsive matrix.
- **Not done / needs real users:** no testing with a screen reader (VoiceOver, NVDA, TalkBack), no testing with real assistive-tech users, no testing on real phones, and zero axe violations is not proof of full accessibility.
- Observation: because the page heading takes focus on load, the skip link is not the next Tab stop after the first load (focus is already inside the main content). This is acceptable but worth a look in screen-reader testing.

## 7. Multilingual
- Parity is enforced; the only values identical to English are brand names (SAS Connect, WhatsApp, Facebook). Guide keys flagged "unused" by a literal search are referenced dynamically.
- 320 px layout matrix (`scripts/qa-screenshots.mjs`): **no horizontal overflow** on all 12 pages in 4 languages x 3 text sizes. Bottom-nav labels no longer split mid-word at 320 px in any language or text size (probe).
- **No translation has been checked by a native speaker.** Priority review list (disclaimers, urgent-question note, photo consent, status labels, terminology, templates, guide): `docs/vue-migration/i18n-review.md`, "Phase 8".

## 8. Responsive and visual QA
125 screenshots were generated in `qa-output/` (git-ignored): all 12 pages at 1440, 1024, 768, 390 and 320 px in light, dark at 1440 and 390, plus Ask Care Team and booking confirmation, plus Chinese/Malay/Tamil at 320 px extra-large. I reviewed a sample of about 10 by eye (desktop and mobile home, staff dashboard dark, Post a Moment dark, tablet Visits, booking confirmation, Tamil and Chinese at 320 px, staff Visits & Events at 320 px) and measured layout programmatically; I did not review every image.
Fixed:
1. **Direct links 404 on Vercel** (see 10).
2. **`theme-color` meta was still teal** (`#1d6560`) after the maroon re-theme; now `#921515`.
3. **Desktop sidebar** was 941 px tall, so the Account link sat below the fold on a 1440x900 screen; section gap reduced, it now fits (shorter screens scroll inside the sidebar).
4. **Bottom nav at 320 px:** "Dashboard" and "Community" broke mid-word; gutters removed at <=360 px.
5. **Flaky axe tests** (3 failed under parallel load because axe measured mid fade-in): the helper now waits for animations to finish. The assertions are unchanged.
Note: fixed header and tab bar appear mid-page in full-page screenshots; that is a capture artefact, not a layout bug.

## 9. Performance (production build)
- Initial load: CSS about 245 KB (35 KB gzip, mostly Bootstrap), JS about 206 KB (about 75 KB gzip: app + framework chunk). Routes, illustrations and the zh/ms/ta languages are lazy-loaded. Total `dist/` 872 KB.
- Fonts: Google Fonts (Poppins, Open Sans) with `display=swap`; system fallbacks, so the app works offline.
- All five runtime dependencies are used. No new dependency was added. Bootstrap is the full CSS; trimming it (about 200 KB) is possible but was judged a refactor and left alone.
- Verified against the production build: with `localStorage` access throwing (blocked storage), the app renders and the theme still switches. (Checked manually; the dev server itself fails in that situation, so it is not an automated test.)

## 10. Deployment readiness
- Static build, no backend, keys or secrets. External links use `target="_blank" rel="noopener noreferrer"`. The demo disclaimer is in the footer of every page.
- **Defect found on the live site:** `https://ltb-five.vercel.app/moments` and `/staff` returned **404** (only `/` worked), so refreshing or sharing a deep link failed. Fix: `vercel.json` rewrites non-asset paths to `index.html`. **It takes effect only after the next deploy, which has not been done.** After deploying, open `/moments` and `/staff` directly.
- Locally, direct load and refresh of nested routes work (tested for `/visits/book`, `/community?tab=news`, `/staff/inquiries`, `/staff/visits-events?tab=events`).
- Procedure: `README.md`, "Deployment".

## 11. Known limitations
- Data and state reset on refresh by design; "today" is not reactive across midnight in one session; baseline occupancy by other families is a fixed demo pattern.
- Only Chromium was tested. Safari, Firefox and real mobile devices were not.
- The demo has four caregivers but the UI always starts as Sarah Tan; the "no linked resident" state is covered at store level only, not by a browser test.
- Photo moments use a local preview only. No real QR scanning, notifications, accounts or medical data.
- Voice input and moment drafts were not built.
- Page entrance and other motion are off under reduced motion (tested earlier).

## 12. Outstanding risks
- Unreviewed translations in sensitive areas (disclaimers, consent, emergency wording).
- No real-user, screen-reader or on-device testing.
- Visual review was by sample, not exhaustive.
- Benefits (fewer phone calls, lower staff effort) are intentions, not measured results.

## 13. Recommendations for production
Real authentication and role-based access; PDPA and consent review (photos, health information, minors/visitors); native-speaker translation review; usability testing with SAS staff and older caregivers; screen-reader and device testing; replace seeded data with an API and audit logging; real notification channel for replies; proper visit-pass validation at reception; trim Bootstrap and self-host fonts.
