# CLAUDE.md — SAS Connect (frontend-only visual prototype)

Always read this file before making changes.

## 1. Overview

**SAS Connect** is a caregiver engagement website for the Society for the Aged Sick (SAS), Singapore (https://www.societyagedsick.org.sg/ — secondary branding reference only). Family caregivers stay connected with elderly nursing-home residents; staff get a fast, simplified dashboard.

Three caregiver areas: **Moments & Inquiries**, **Visits**, **Community & Support**. A staff view exists in the wireframe (5 screens, §5).

**Goal:** a polished, demo-ready prototype. Priority: **visual fidelity > navigation > light simulated interaction.**

## 2. Target users

- Caregivers (family), many elderly / low tech literacy → large text, one action per card, labels on every icon.
- Nursing staff on ward rounds → speed first (≤3 taps for status update, ~15 s for a moment).

## 3. Scope

**Required:** faithful reproduction of the wireframe, working React Router navigation, modals/sheets, simulated forms and booking flow, responsive layout, reusable components, static fictional data, `useState`/`useContext`.

**Not required / forbidden:** backend, database, real auth, APIs, payments, SMS/email, persistence (reset on refresh is fine), real medical data, deployment infra.

## 4. Stack

React + Vite + Tailwind CSS + React Router + Lucide React. JavaScript/JSX (no TypeScript). Functional components + hooks. State: `useState` / `useContext` only (no Redux/Zustand). No other dependencies without approval.

## 5. Wireframe analysis

Source: `reference/wireframe/SAS Connect Wireframes.dc.html` (+ `support.js`, a Claude Design canvas runtime — ignore it). **Read-only; never edit.** Single static canvas, **no JS interactions**, one page of 8 phone-frame screens (300×640, rounded 30px) in three groups. All interactions below are *documented from annotations (yellow sticky notes)*, not implemented in the export.

### 1a Caregiver (mobile, 3 bottom tabs: Moments & Inquiries · Visits · Community & Support)

| # | Screen | Content |
|---|---|---|
| 01 | Caregiver Home | Header: logo circle, "SAS Connect", `Aa` text-size toggle (3 sizes), icon button, avatar. "Good morning, Sarah!" Resident card (Madam Tan Mei Ling, SAS-1024 · Mother, status dot "Feeling well today", "Last updated: Today, 9:30 AM", **View Latest Moments** button). Three single-action cards: Latest Moment (Morning Garden Walk · 9:15 AM ›), Upcoming Visit (Thu 12 Nov · 2:00–3:00 PM → View Booking), Community (Christmas Gathering · 19 Dec → Explore Events). |
| 02 | Moments & Well-being | Today's well-being card with legend: ● Feeling Well / ◆ Resting / ▲ Please Contact Staff (colour + shape + words); disclaimer "General updates only…". Tabs Latest / This Week / All. Moment card (photo, title, category tag, time, caption). **Ask the Care Team** button + "urgent → call directly" note. Note: Ask opens a **bottom sheet** (question box, optional topic, Send) → status chips Submitted / In Review / Answered + history. |
| 03 | My Visits | Reminder banner (visit tomorrow 2 PM). **+ Book a Visit**. Upcoming card (Thu 12 Nov, ✓ Confirmed, 2:00–3:00 PM · 2 visitors, with Madam Tan) with **View Visit Pass / Reschedule / Cancel**. Past (Sun 1 Nov · Visited). "Remind me by" SMS + Website checkboxes. Note: Book = **4 full-screen steps**, one question each: resident → date → time slot (Available / Limited / Full, shown in words) → confirm → **QR pass**. |
| 04 | Community & Events | Tabs Upcoming / Past / News. Event card (photo, FESTIVE · PUBLIC tag, Christmas Gathering, Sat 19 Dec · 10:00 AM–12:00 PM) with **View Details** + **Share**. "Make a Difference in Their Lives" donation card → **Support SAS ↗**. Social links Website / Facebook / Instagram. Note: Share (WhatsApp / Facebook / Copy Link) on **public events only, never on resident moments**. |

### 1b Staff (mobile, 4 bottom tabs: Home · Inquiries · Visits · Events)

| # | Screen | Content |
|---|---|---|
| 05 | Staff Dashboard | "SAS Connect · Staff", user menu "Nurse Aisha ▾". Stat tiles: 3 Pending inquiries, 12/40 Status updates today, 8 Visits today, 2 Upcoming events. Quick actions: **Update Status**, **Post a Moment**. "Needs reply": Sarah Tan re Mdm Tan (8:42 AM, quote) with **Reply**; Mr Lim's son (In Review). Note: replies offer saved templates. |
| 06 | Quick Status Update | Modal/full screen (✕). Search resident/bed. "My ward · not yet updated today" chips (Mdm Tan, Mr Lim, Mdm Wong, Mr Rahim). Status options Feeling Well ✓ / Resting / ▲ Please Contact Staff. Optional note + mic icon. **Save & next resident →** jumps to next un-updated resident. |
| 07 | Quick Moments Upload | Modal (✕). Photo preview + Take photo · Gallery. "Who's in it?" resident chips (✓ Mdm Tan, ✓ Mr Lim, Mdm Wong ⚠, + more). ⚠ = no photo consent → cannot be tagged. Caption + mic. Category chips Gardening / Music / Crafts (optional). Consent confirmation line. **Preview** + **Publish to 2 families**. |
| 08 | Visits & Events | "Today · Thu 12 Nov" + **Scan pass**. Capacity by slot with −/+ steppers (10–11 AM 3/6, 11–12 PM 5/6, 2–3 PM Full). "Arriving next": Sarah Tan +1 → Mdm Tan, SAS-V-4821, **Check in**; David Lim ✓ In. Events list with **+ New event** (Christmas Gathering – Published; Family Appreciation Day – Draft · Edit). Note: new event form = photo, title, date, place, audience, Publish. |

### 1c Cross-role sync (simulate via shared context)
- 06 Save status → caregiver 01 status line + 02 well-being card update; "Last updated" refreshes.
- 07 Publish moment → top of 02 feed and 01 "Latest Moment", tagged residents' families only.
- 05 Reply to inquiry → caregiver 02 Ask sheet status Submitted → In Review → Answered, reply in history.

### Design system discovered
- **Style:** hand-drawn wireframe look (sketchy borders). Fonts: **Kalam** (700, headings/buttons/names) and **Patrick Hand** (body), via Google Fonts. Fallback `system-ui`.
- **Colours:** ink `#1a1a1a` (borders/text), primary teal `#2a8c82` (primary buttons, status dot), teal hover/dark `#1d6560`, teal tint card bg `#eef6f4`, page bg `#fbfaf7`, canvas bg `#f0eee9`, muted text `#555`, dashed divider `#bbb`, placeholder avatar `#ddd`, striped image placeholder (`#f2f2f2`/`#ddd` 45° stripes), sticky-note yellow `#fff3b0` (annotation only — do **not** ship). No other status colours defined; see open questions.
- **Shapes:** borders 1.5–2.5px solid ink; radii 6–14px cards, 30px device frame, pill/circle avatars; primary button min-height 44px, teal fill, white Kalam bold text; secondary = outlined small button.
- **Type scale (px):** title 22, resident name/header 16, body 14–15, labels/captions 12–13, tab labels 12.
- **Layout:** mobile-first column, sticky header, bottom tab bar (3-col grid, dashed separators, icon box + label).
- **Pattern:** status = colour + shape (●◆▲) + words, never colour alone.

### Missing / not in export
No real images (striped placeholders only), no logo (circle placeholder), no icon set (empty boxes — map to Lucide), no desktop layout, no booking steps 1–4 / QR pass / inquiry sheet / event detail / share sheet / donation destination / news / past-tab visuals (described only in notes), no staff Inquiries or Events tabs beyond screen 08.

## 6. Routes

Caregiver (layout: header + 3-tab bottom nav)
- `/` Home (01)
- `/moments` Moments & Well-being (02); Ask sheet = modal on this route
- `/visits` My Visits (03); `/visits/book` 4-step booking (stepper state), ends in QR pass; pass = modal
- `/community` Community & Events (04); event details = modal or `/community/:id`

Staff (layout: header + 4-tab bottom nav), under `/staff`
- `/staff` Dashboard (05); `/staff/status` (06); `/staff/moment` (07); `/staff/visits` Visits & Events (08)
- `/staff/inquiries` and `/staff/events` tabs: **only if approved** (see §12).

Role switch: a small control in the header (Nurse Aisha ▾ / a "Switch to Staff" link) toggles `/` ↔ `/staff`. Exact caregiver-side switch UI is not in the wireframe (open question).

## 7. Key components

`AppHeader` (logo, `Aa`, icon, avatar) · `BottomTabBar` (config-driven, 3 or 4 tabs) · `ResidentCard` · `StatusBadge` (●◆▲ + words) · `ActionCard` (label, text, one button) · `MomentCard` · `Tabs` (segmented) · `VisitCard` · `SlotPicker` · `EventCard` · `StatTile` · `InquiryItem` · `BottomSheet`/`Modal` · `ImagePlaceholder` · `Button` (primary/outline) · `QRPass` (simulated, static SVG pattern).

## 8. Project structure

```
src/
  assets/          # logo/images if supplied
  components/      # components listed in §7
  layouts/         # CaregiverLayout.jsx, StaffLayout.jsx
  pages/           # Home, Moments, Visits, BookVisit, Community, staff/{Dashboard,StatusUpdate,PostMoment,VisitsEvents}
  data/            # residents.js, moments.js, inquiries.js, visits.js, events.js, staff.js
  context/         # AppContext.jsx (status, moments, inquiries, bookings, textSize)
  App.jsx  main.jsx  index.css
```
No `hooks/` folder until a hook is actually needed.

## 9. Mock data

Plain JS exports, fictional only. Seed with wireframe values: Madam Tan Mei Ling (SAS-1024), Mr Lim, Mdm Wong, Mr Rahim; caregiver Sarah Tan; Nurse Aisha; visit Thu 12 Nov 2:00–3:00 PM (SAS-V-4821); Morning Garden Walk moment; Christmas Gathering (Sat 19 Dec, 10 AM–12 PM, public); Family Appreciation Day (draft); slot capacities 3/6, 5/6, Full. Shared mutable bits live in `AppContext` and reset on refresh. Wireframe dates (Nov 2026) are shown as-is, not computed.

## 10. Interaction rules (all simulated)

- Nav items and cards route to the correct screen; tab bar highlights active tab.
- Ask Care Team → sheet → Send → success message + new history item (Submitted).
- Book a Visit → 4 steps → confirmation → View Visit Pass shows QR modal. Reschedule/Cancel: simple confirm modal that updates local state.
- Event View Details → modal. Share → small sheet (WhatsApp / Facebook / Copy Link) public events only. Support SAS ↗ → open official site in new tab.
- `Aa` cycles 3 text sizes via root font-size.
- Staff: Save & next advances to next un-updated resident; Publish adds to moments; Reply adds an answered state; Check in marks "✓ In"; −/+ adjusts slot counts.
- No real network calls, no persistence.

## 11. Accessibility & responsive

- Min 16px body in implementation scale (wireframe sizes 12–13 are too small — scale up, keep hierarchy), tap targets ≥44px, WCAG AA contrast (verify teal `#2a8c82` on white for small text; use `#1d6560` if it fails), visible focus rings, labels on every input and icon button (`aria-label`), semantic buttons/links, modals trap focus and close on Esc, status never by colour alone.
- Mobile-first; centred max-width column on desktop (≈480px for caregiver, matching the wireframe) unless approval is given for a wider layout. Test at 360, 390, 768, 1280 widths.

## 12. Decisions (resolved open questions)

1. **Visual:** keep the hand-drawn Kalam / Patrick Hand look, #fbfaf7 paper, teal #2a8c82. Improve spacing/readability/accessibility only. No corporate-dashboard look.
2. **Layout:** mobile-first; on desktop a centred ~480px column on a neutral background (`canvas`). No new desktop layout.
3. **Accessibility:** body ~17px (rem-based; `Aa` cycles 17/19/21px on `<html>`), touch targets ≥48px, visible focus ring, text labels beside icons, status = symbol + words. **Contrast checked:** #2a8c82 on white = 4.06:1 (fails AA for small text, passes for large) → use `teal-dark` #1d6560 (6.8:1) for small text/active states; #2a8c82 only for decorative elements and large bold button text (≥1.15rem bold).
4. **Assets:** Lucide icons; royalty-free placeholder photos (elderly care / community only); text-only "SAS Connect" logo, no SAS logo imitation, no real resident photos.
5. **Missing screens to build in the existing style:** Ask Care Team sheet, 4-step booking, confirmation, QR pass, event detail modal, share sheet, News and Past tabs, Staff Inquiries, Staff Events.
6. **Status colours:** Feeling Well teal ●; Resting amber ◆; Please Contact Staff muted red ▲. Availability: Available teal, Limited amber, Fully Booked grey + disabled. Always with text. General indicators, not medical assessments.
7. **Role switching:** "Demo view: Caregiver View | Staff View" control under the header (no auth).
8. **Synced interactions (AppContext, session only):** staff status → caregiver status; staff moment → caregiver feed; caregiver inquiry → staff queue; staff reply → caregiver; book / cancel / reschedule visit → UI + QR pass.

Theme tokens live in `src/index.css` (`@theme`); use them (`bg-teal`, `text-teal-dark`, `bg-rest-bg`, …) rather than raw hex. Tailwind v4 via `@tailwindcss/vite` (no tailwind.config).

**Progress:** All four phases complete. See §16 for the final state and known limitations.

## 13. Coding conventions

Functional components, one per file, PascalCase filenames; named props, no prop-drilling beyond two levels (use context); Tailwind utilities only (define palette/fonts in Tailwind config theme, not ad-hoc hex); Lucide for icons; no inline style unless dynamic; no comments except non-obvious why.

## 14. Development rules

1. Read `CLAUDE.md` first. 2. Wireframe is the spec. 3. Preserve existing UI. 4. Functional components. 5. Tailwind. 6. React Router. 7. Fictional mock data. 8. Frontend-only. 9. No backend/DB. 10. No unnecessary dependencies. 11. Reusable components where repeated. 12. Responsive + accessible. 13. Build incrementally. 14. Verify navigation after every change (click through every route). 15. No extra features without approval.

**Do not:** add TypeScript, state libraries, form libraries, animation libraries, UI kits, test frameworks, i18n, abstraction layers, or pages/features not in the wireframe.

## 15. Recommended implementation order

1. Vite + Tailwind + Router + Lucide setup; theme tokens (fonts, colours).
2. Shared primitives: Button, Tabs, Modal/BottomSheet, StatusBadge, ImagePlaceholder.
3. Mock data + AppContext.
4. Caregiver layout + tab bar + Home (01).
5. Moments (02) + Ask sheet.
6. Visits (03) + booking flow + QR pass.
7. Community (04) + event modal + share.
8. Staff layout + Dashboard (05).
9. Status update (06) and Post moment (07) with cross-role sync.
10. Staff Visits & Events (08).
11. Text-size toggle, responsive/accessibility pass, full navigation check.

## 16. Final implementation (Phase 4) and known limitations

**Run:** `npm install`, `npm run dev` (http://localhost:5173), `npm run build`, `npm run lint` (oxlint on `src/` only).

**Behaviour worth knowing before changing things**
- **Dates:** "today" is the browser clock in Asia/Singapore (`src/data/dates.js`). All mock bookings, events, news, moments and inquiries are offsets from today, so the demo works on any date. Event titles are deliberately season-neutral ("Community Gathering", not "Christmas Gathering"). Times of day in seed data (e.g. "9:30 AM") are fixed strings.
- **Capacity:** stored per date + slot in `AppContext.slotCapacity` (`"<isoDate>|<slotIndex>"` keys, default 6). Availability = capacity − baseline taken − active bookings (`confirmed`/`in`); cancelled bookings free their spaces. Logic lives in `data/visits.js`.
- **Shared state:** everything cross-role is in `AppContext` (status, moments, inquiries, bookings, capacity, events). Resets on refresh by design.
- **Uploaded photos:** object URLs are revoked on remove/replace/leaving unpublished; a published moment keeps its URL for the session.
- **Accessibility:** skip link, per-route document title, roving-tabindex tabs with arrow keys, focus-trapped bottom sheets that restore focus, `prefers-reduced-motion` honoured, disabled buttons shown grey. Contrast of every text/background pair checked ≥ AA (white on #2a8c82 only for large bold button text). Text size cycles 17/19/21px.
- **Header:** avatar initials shown from 360px up (hidden below it so controls stay usable). The wireframe's decorative icon box was not restored.

**Known limitations**
- Photographs are still striped placeholders: no suitable image with a verifiable licence was found within the time-box. A demo disclaimer is shown on every page. To add photos later, store them in `src/assets/` with licence and attribution recorded here.
- Booking reference numbers and all state reset on refresh. QR pass and staff "Scan pass" are demonstrations only.
- Staff "Visits" and "Events" are separate tabs (wireframe screen 08 combined them).
- The wireframe's header "Nurse Aisha ▾" menu is replaced by the Demo view role switch.
- No automated test suite (out of scope); verification was manual browser scripting.
