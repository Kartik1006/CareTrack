# CareTrack - Quarantine & Treatment Management System

Working assessment MVP built with React, TypeScript, Vite, Tailwind CSS and Lucide React. All four role workflows run without credentials. Data persists in this browser with localStorage.

## Run locally

Use Node.js 22.12+ (or a compatible newer LTS) and npm.

```sh
npm ci
npm run dev
npm test
npm run build
npm run preview
```

Open the URL printed by Vite. No environment variables are required. `dist/` is the production output. The lockfile pins dependencies.

## Roles and workflows

Select a demo role in the header (mobile: navigation menu), then open its workspace:

- **Nurse:** searchable admitted-patient table, pending/completed/fever filters, daily temperatures, history and authorized correction with mandatory reason. One reading per patient/date; corrections retain the prior value and audit event.
- **Doctor:** visits require today's temperature; one visit per patient/date. Notes and treatment are required. Review eligibility and approve discharge into the administrator queue. A doctor can record a deceased outcome from the patient dossier.
- **Administrator:** register patients, assign an unoccupied room, view the 74-bed matrix, and finalize doctor-approved discharges. Completed outcomes release the room. Capacity, occupied rooms and duplicate active patient identifiers are validated.
- **Management:** occupancy, daily reading/visit completion, recoveries, deaths, success rate and mortality warning. The explicitly labelled evaluator toggle is a temporary visual simulation, not a change to stored outcomes.

Actions check the current role as well as patient state. Wrong-role workspaces display instructions to switch roles. Overview, history and analytics remain visible for assessment inspection.

## Discharge rule and calendar assumption

The demo starts on **2026-11-12** and deliberately uses an administrator-controlled simulation date, shown in the UI. Advance it in Settings > Clinical Parameters; it does not silently follow the computer clock. Event timestamps use real ISO timestamps; record dates use the demo calendar.

A complete day means one valid temperature and one doctor visit on a calendar day **before** the current demo date. The three immediately preceding dates must all have a reading strictly below the configurable threshold (default 38 degrees Celsius). Missing dates, missing visits, stale history and fever break eligibility. Today's fever blocks discharge, and today's reading and visit are required before approval and finalization. Admission day can be the first observation day after that calendar day ends. This is an explicit assessment assumption, not clinical guidance.

Only doctors approve; only administrators finalize. Finalization rechecks current clinical criteria so a fever correction or changed date cannot release an ineligible patient. Pending discharge patients continue to occupy a bed and require daily care.

Success rate = recovered finalized discharges / (recovered finalized discharges + recorded deaths). Mortality uses the same completed-outcome denominator; the warning triggers strictly above 15%, not at 15%. The calculation returns zero when no outcomes exist.

## Quick seeded demonstration

The initial dataset contains 18 current patients, 56 available beds, 5 pending readings, 3 fever cases, 2 eligible histories, 1 approved discharge, 8 recoveries and 1 death.

1. **Nurse > Nurse Station:** find Jameson Cole (room 6), record 36.8. The status becomes Completed. A second ordinary entry is unavailable; Correct requires a reason.
2. **Doctor > Doctor Rounds:** find Jameson, Conduct Round, enter notes and treatment. The row becomes Completed and exposes View Visit.
3. Find **Eleanor Vance (room 1)**. Her previous three calendar days have complete fever-free records. Complete today's doctor visit, then Approve Discharge and submit the sign-off.
4. **Administrator > Administration:** finalize Eleanor from the approved queue. Occupancy falls by one and room 1 becomes available.
5. **Management:** verify the new recovery and revised success rate. **Audit Trail** shows the actors, dates and actions.
6. Refresh to verify persistence. Reset demo data through the header confirmation to start again.

## Demonstrate a new admission end to end

1. On demo date November 12, select Administrator, admit a fictional patient to an available room (e.g. room 74).
2. Select Nurse and record 36.8. Select Doctor and complete a visit with notes and treatment.
3. As Administrator, advance the demo date to November 13. Repeat the reading and visit. Repeat for November 14.
4. Advance to November 15. The three preceding complete days now qualify. Record today's temperature and visit, approve as Doctor, then finalize as Administrator.
5. Verify the room is available, the recovery count increased, and the audit history persisted.

Do not advance the clock to simulate a clinical record that has not actually been entered. The automated workflow test performs this sequence as well.

## Validation

`npm test` runs Vitest with React Testing Library against the actual application context and localStorage:

- Multi-day admission, temperature, visit, approval, final discharge and persistence after remount.
- Incorrect roles, premature approval, duplicate readings/visits and repeated finalization.
- Calendar gaps, missing visits, threshold boundaries and stale discharge histories.
- Correction reasons, invalid numeric input and fever blocking a pending release.
- Occupied rooms, duplicate identity, required fields and admission blocked at 74 beds.
- Finalized-only outcome counts, exactly 15% versus greater-than-15% mortality, and terminal outcome immutability.

`npm run build` checks TypeScript and produces a Vercel-compatible bundle. Browser smoke checks cover real reading/visit forms; responsive layouts use a mobile sidebar and horizontally scrollable tables.

## Deploy to Vercel

1. Push this project to `https://github.com/Kartik1006/CareTrack`.
2. Import the repository in Vercel; select **Vite**.
3. Build command: `npm run build`. Output directory: `dist`. Install command: `npm ci`.
4. Deploy without environment variables. `vercel.json` includes SPA fallback routing.

Alternatively, run `npx vercel` and then `npx vercel --prod` from an authenticated Vercel CLI session. Each deployed origin has its own browser-local data; localhost data does not transfer automatically.

## Persistence and Supabase status

This delivery intentionally uses the requested local fallback. The supplied secret alone does not identify a Supabase project URL, and a privileged secret must never ship in browser code. No supplied secret is saved in this repository or used by the app.

Settings includes an optional Supabase **connectivity diagnostic only** using a project URL and public anon/publishable key. Passing this diagnostic does **not** enable cloud sync or authentication. The active data store remains localStorage. The optional environment names are documented in `.env.example`. Never place a service-role or `sb_secret_` key in a `VITE_` variable; these values are bundled publicly.

`supabase/schema.sql` is a starting schema with RLS enabled and no public write policies. A production backend would need authenticated staff identities, server-enforced role policies, transactional admission/discharge operations and protected audit storage before connecting live patient data. Applying the schema alone does not enable those features.

The role switcher is demo access, not secure authentication. Local records and audit logs can be altered using browser tools, reset or backup restoration. This is a single-browser assessment prototype, not a tamper-proof or multi-user clinical system. Use fictional data only. Export a JSON backup from Settings to retain demo work; clearing browser storage removes it.

## Project map

- `src/context/AppContext.tsx`: state, role-checked workflows, audit events and derived metrics.
- `src/utils/clinicalCalculations.ts`: calendar eligibility and completed-outcome calculations.
- `src/services/storage.ts`: local persistence, backup export/import.
- `src/constants/mockData.ts`: reproducible assessment seed data.
- `src/components/`: responsive role dashboards, patient dossier and forms.
- `tests/workflows.test.tsx`: business-rule and workflow regression tests.
- `.openai/hosting.json`: optional private Sites preview identity, independent of Vercel.
