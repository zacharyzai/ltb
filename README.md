# SAS Connect

A frontend-only prototype for the Society for the Aged Sick (SAS), Singapore. Family caregivers stay connected with nursing-home residents (updates, moments, questions, visit booking, community); staff get a low-effort portal. **All people, residents and data are fictional.** It is a design prototype, not a production system, and has not been tested with SAS staff or caregivers.

## Stack
Vue 3 (Composition API, `<script setup>`), Vite, Vue Router, Pinia, Bootstrap 5 (CSS only), vue-i18n, JavaScript. Tests: Vitest, Playwright + axe-core. No backend, database, authentication, payments or external services.

## Run
```
npm install
npm run dev        # http://localhost:5173
npm run build      # static output in dist/
npm run preview
```
If `npm install` fails with EACCES on `~/.npm/_cacache`, use `npm install --cache <temp dir>`.

## Checks
| Command | What it does |
|---|---|
| `npm test` | Vitest: stores, data, time, formatting, cross-role journeys |
| `npm run e2e` | Playwright + axe (first run: `npx playwright install chromium`); starts its own server on port 5199 |
| `npm run lint` | oxlint |
| `npm run contrast` | WCAG AA check of every colour-token pair, light and dark |
| `npm run i18n:check` | Key and placeholder parity across en, zh, ms, ta |
| `node scripts/qa-screenshots.mjs` | Screenshot gallery + 320 px overflow matrix into `qa-output/` (git-ignored) |

## Prototype limitations
- Mock data and state live in memory and reset on refresh. Only language, theme, text size and "guide seen" are saved (`localStorage`).
- Roles are a demo switch, not real sign-in. No real SMS, email, QR validation, payment or medical records.
- Non-English text is a first-pass translation awaiting native-speaker review (`docs/vue-migration/i18n-review.md`).
- Resident photos are original illustrations; any photo a staff member picks stays in the browser.

## Deployment (Vercel, static)
1. Import the repository in Vercel. Framework preset: Vite. Build command `npm run build`, output directory `dist`. No environment variables are needed.
2. `vercel.json` rewrites every non-asset path to `index.html`, so direct links such as `/moments`, `/visits` and `/staff` work and refreshing a nested route does not 404.
3. After each deploy, open `/moments` and `/staff` directly to confirm the fallback.
Any other static host needs the same "serve `index.html` for unknown paths" rule.

## Documentation
- `CLAUDE.md`: project rules and architecture
- `docs/FINAL_QA_REPORT.md`: Phase 8 audit results
- `docs/STAKEHOLDER_DEMO.md`: 5-7 minute demo script
- `docs/vue-migration/`: migration plan and translation review list
- `legacy-react/` and `reference/wireframe/`: preserved earlier prototype and original wireframe (read-only)
