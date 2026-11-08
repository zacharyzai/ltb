# SAS Connect: stakeholder demo guide (5-7 minutes)

**What it is.** A frontend-only design prototype for the Society for the Aged Sick. Family caregivers see how a loved one is doing, ask the care team questions, book visits and join community activities. Nursing staff post updates and answer questions with as little effort as possible. Everything shown is fictional.

**How to describe it honestly.** The benefits below are *intended* benefits. The prototype has not been tested with SAS staff or caregivers, and nothing here shows reduced workload or phone calls. Real-world validation is a next step. Please say so if asked.

## Before you start (2 minutes)
- Use a laptop at 1280 px or wider (the desktop sidebar makes role switching one click). Open the live link, or `npm run dev` / `npm run preview` as a backup.
- **Reset the demo:** refresh the page (F5). All demo data returns to its starting state. Language, theme and text size are remembered on that browser; to clear them, set them back from the sidebar (or open DevTools > Application > Local Storage > clear).
- Start in **English, Light theme, Standard text size**, in the **Caregiver** view. The beginner's guide card on Home appears once per role per browser.
- Seed facts: you are **Sarah Tan**, caregiver for **Madam Tan Mei Ling** (mother, "Feeling Well") and **Madam Wong Siew Fong** (aunt, "Please Contact Staff", no photo consent). Staff are signed in as demo nurses.

## Sequence

| # | Time | Do | Say | Expect on screen |
|---|---|---|---|---|
| 1 | 1 min | **Caregiver Home.** Point out the greeting, then tap **Mdm Wong** in "Viewing updates for", then back to **Mdm Tan**. | Families usually only hear about a resident when they phone. Here the latest status, a recent moment and the next visit are in one place. Status is a general indicator, not a medical assessment. | Status chip with colour + symbol + words, "Last updated" time, latest moment card with illustration, upcoming visit, community highlight. Switching resident changes all cards. |
| 2 | 1 min | Open **Moments**. Try the **Latest / This week / All** filter. Press **Ask a question**, type "Does she need new slippers?", **Send question**. | Non-urgent questions can be asked at any time and answered between rounds, instead of repeated phone calls. (Intended benefit; not yet measured.) | Dialog with a "for urgent matters call the nursing home" note. Success message "Your question has been sent". The question appears in the history as **Submitted**. |
| 3 | 1 min | Sidebar: **Demo view > Staff**. Open **Inquiries**. Open the new question (it moves to **In Review**). Choose a **quick-reply template**, edit the wording, **Send reply**. | Staff get a queue, templates that fill an editable box, and status that updates by itself. | Question at the top of the queue. Template fills the text box. Reply sent; status becomes **Answered**. |
| 4 | 0.5 min | Switch back to **Caregiver**, open **Moments**. | The family sees the answer without anyone phoning. | The reply appears under the question, status **Answered**. |
| 5 | 1.5 min | **Visits > Book a visit.** Pick a date, a time slot (note Available / Limited / Fully booked), 2 visitors, **Confirm booking**. | Four short steps with large buttons. Capacity is per date and slot so wards are not overcrowded. | Step indicator, calendar with availability symbols, confirmation with reference (e.g. SAS-V-4832) and a **demo** QR pass (labelled not scannable). |
| 6 | 0.5 min | Switch to **Staff > Visits & Events**. | The same booking is on the staff schedule; if the family cancels, the space is released. | Booking listed under **Upcoming bookings** (or **Today's visits** if you booked today); capacity stepper for the slot. |
| 7 | 1 min | Back to **Caregiver > Community**. Show events, **News**, **Volunteering** (press **Express interest**), event details with sharing, and **Support SAS** (opens the official donation page). | Events and volunteering invite families into SAS's wider community. | Event cards, volunteering simulated confirmation (nothing is sent), donation link opens the real SAS site in a new tab. |
| 8 | 1 min | **Accessibility:** switch language (EN / 中文 / BM / தமிழ்), **Text size > Extra large**, **Theme > Dark**, then **Beginner's guide** from the sidebar. | Older caregivers can enlarge text, pick their language and follow a five-step guide. Translations are first-pass and need native-speaker review. | Whole UI switches, including dates and status labels. Guide dialog with Previous / Next / Skip. |

**Optional extras (if time):** Staff **Post a Moment** (choose Mdm Wong to show the photo-consent safeguard), Staff **Resident Updates** (set a status and note, then show it on caregiver Home).

## If something goes wrong
- **Anything odd or stuck:** refresh (F5), then continue from the step you were on. State resets, so redo the short action (e.g. resubmit the question).
- **No internet / fonts missing:** the app still works with system fonts. Donation and share links need internet; skip them and say so.
- **Live site fails:** run `npm run preview` locally, or use the screenshots in `qa-output/` (generate with `node scripts/qa-screenshots.mjs`).
- **Role switch not visible on a phone:** open **Account** from the header and use the Demo view switch.
- **A reply or booking "disappeared":** you refreshed; demo data is not saved by design.

## Questions to expect
- *Is this connected to real records?* No. No backend, no real data, no sign-in.
- *Are photos real?* No. Illustrations are original; the footer states images and information are for demonstration only.
- *Are translations verified?* No. Chinese, Malay and Tamil are first-pass and listed for review in `docs/vue-migration/i18n-review.md`.
- *What would production need?* See "Recommendations" in `docs/FINAL_QA_REPORT.md` (authentication, PDPA review, real data, staff workflow research, native-speaker review).
