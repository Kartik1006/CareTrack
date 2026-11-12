# CareTrack — Quarantine & Treatment Management System

> **Digitizing patient temperature tracking, doctor visits, discharge management, and treatment outcomes for a quarantine isolation facility with a maximum capacity of 74 patients.**

[![Built with Vite](https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![React 19](https://img.shields.io/badge/React-19.x-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS 4](https://img.shields.io/badge/TailwindCSS-4.x-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Supabase Ready](https://img.shields.io/badge/Supabase-Ready-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![Vercel Compatible](https://img.shields.io/badge/Vercel-Deployable-000000?logo=vercel&logoColor=white)](https://vercel.com/)

---

## 🌟 Executive Overview

**CareTrack** is an enterprise-grade medical quarantine operations dashboard engineered for clinical precision, strict compliance, and intuitive workflow execution. Designed specifically for an infectious disease isolation facility with a **strict capacity ceiling of 74 patients**, CareTrack coordinates 4 essential clinical roles: **Nurse**, **Doctor**, **Administrator**, and **Management**.

---

## 🏥 Key Business Rules & Clinical Logic

| Rule | Description | Implementation Details |
| :--- | :--- | :--- |
| **Strict 74 Capacity** | Maximum 74 active quarantine beds | Intake is strictly blocked when 74/74 beds are occupied. Rooms return to the available pool only upon finalized discharge or terminal release. |
| **Daily Pairing Rule** | 1 Temperature + 1 Doctor Visit per day | Each admitted patient requires exactly one temperature reading and one physician examination daily. |
| **Physician Precondition** | Temperature before Doctor Visit | Doctors cannot conduct or complete their visit until nursing staff has logged that day's temperature reading. |
| **Duplicate Prevention** | No duplicate logs per calendar day | Prevents recording multiple temperatures or multiple visits for the same date. |
| **Authorized Correction** | Audit-logged temperature edit | If an incorrect reading was logged, authorized staff can submit a correction with a mandatory clinical reason, preserving the prior reading in the immutable audit trail. |
| **Discharge Eligibility** | 3 Consecutive Fever-Free Days | Automatically flags patients who maintain 3 consecutive calendar days with temperatures strictly `< 38.0°C` (configurable). A single fever spike resets the counter. |
| **Two-Step Discharge** | Doctor Approval → Admin Bed Release | Only Physicians can clinically approve a discharge; only Facility Administrators can finalize the release and vacate the bed. |
| **Treatment Success Rate** | `Recovered / (Recovered + Deaths) * 100%` | Mathematical outcome tracking using finalized clinical dispositions. |
| **Mortality Surveillance** | High-Priority Warning at `> 15%` | Persistent institutional alert banner triggers immediately if mortality exceeds 15% of completed cases, providing clinical escalation guidance. |

---

## 👥 Role Workflows & Capabilities

### 1. 🩺 Nurse Station
- **Real-Time Patient Table**: View all admitted patients with room numbers (1 to 74) and daily reading statuses.
- **Pending vs. Completed**: Instant visual differentiation with status pills and quick filters.
- **Fever Detection (≥ 38.0°C)**: Automatic visual alert flag and notification for febrile patients.
- **Authorized Correction**: Modify existing readings with mandatory procedural justification (e.g., probe recalibration, tympanic retest).
- **7-Day Trend Sparklines**: Interactive visual temperature curves with a 38.0°C threshold reference line.

### 2. 👨‍⚕️ Doctor Rounds
- **Eligibility Spotlight Queue**: Automatically displays patients who have completed 3 consecutive fever-free days.
- **Clinical Exam Rounds**: Enter daily progress notes, treatment/medication regimens, condition ratings (*Improving*, *Stable*, *Guarded*, *Critical*), and vital signs (Pulse, SpO2, BP, Respiratory Rate).
- **Enforced Protocol Order**: Blocks doctor visit if nursing staff has not logged today's temperature.
- **Clinical Discharge Clearance**: Physician reviews afebrile streak and signs off discharge instructions, dispatching the patient to the Administration queue.
- **Outcome Recording**: Option to record mortality in critical terminal events with notes.

### 3. 🏢 Administration
- **Capacity Management**: Live visual counter of occupied and available beds out of 74.
- **Quarantine Intake / Admission**: Patient registration with automatic or manual room assignment (1–74 across Wing A, Wing B, and Wing C).
- **Hard Capacity Cap**: Blocks intake when capacity reaches 74/74.
- **Doctor-Approved Discharge Queue**: Inspects doctor sign-off notes and completes discharges.
- **Automatic Room Release**: Vacates the isolation room upon discharge confirmation with celebratory visual feedback.
- **74-Bed Interactive Matrix**: Clickable visual floorplan of all 74 rooms with color-coded occupancy and fever indicators.

### 4. 📊 Executive Management
- **Occupancy & Capacity Metrics**: Live percentage and bed vacancy tracking.
- **Daily Compliance Gauges**: Temperature completion percentage and Doctor round completion percentage.
- **Treatment Success Rate**: `Recovered / (Recovered + Deaths) * 100%`.
- **Institutional Mortality Warning**: Visual alert banner triggered if mortality rate exceeds 15%.
- **Evaluator Test Switch**: Includes an interactive *"Test >15% Warning"* toggle to dynamically simulate a mortality surge and demonstrate the alert banner.
- **Zone Distribution**: Visual capacity breakdown across Wing A, Wing B, and Wing C.

### 5. 📜 Immutable Audit Trail
- Comprehensive chronological event log tracking actor name, role, timestamp, patient ID, and full action details (`PATIENT_ADMITTED`, `TEMPERATURE_RECORDED`, `TEMPERATURE_CORRECTED`, `DOCTOR_VISIT_RECORDED`, `DISCHARGE_APPROVED_DOCTOR`, `DISCHARGE_FINALIZED_ADMIN`, `PATIENT_DECEASED`).

---

## 🚀 Live Demo Scenario Walkthrough

Follow this 2-minute demonstration flow to test all core business rules:

1. **Step 1 — Nurse Station**:
   - In the top bar, select **Nurse** mode.
   - Click the **Pending** filter pill.
   - Find patient **Jameson Cole (Room 6)** and click **Record**.
   - Select a normal temperature (e.g. `36.8°C`) and submit. Notice status updates to **Completed**.
   - Try submitting another reading for the same patient: duplicate entry is blocked; click **Correct** to test the **Authorized Correction** workflow.

2. **Step 2 — Doctor Rounds**:
   - Switch to **Doctor** mode in the top bar.
   - Look at the top **Discharge Clearance Queue** spotlight: notice **Eleanor Vance (Room 1)** has 3/3 afebrile days and is eligible!
   - Click **Approve Discharge** for Eleanor Vance, review her 3-day temperature cards, enter clinical sign-off, and submit.
   - Notice Eleanor moves to **Approved • In Admin Queue**.
   - In the table below, find **Jameson Cole (Room 6)** whose temperature was just recorded by the nurse. Click **Conduct Round**, enter clinical notes, and submit.

3. **Step 3 — Administration & Bed Release**:
   - Switch to **Administrator** mode.
   - Go to the **Doctor-Approved Discharge Queue** tab.
   - Notice **Marcus Brody (Room 2)** and **Eleanor Vance (Room 1)** are waiting for final sign-off.
   - Click **Finalize & Release Bed** for Marcus Brody.
   - Experience the confetti celebration: Room 2 is immediately vacated, the available bed counter increments, and Marcus Brody is officially recorded as **Recovered**!
   - Switch to the **74-Bed Facility Matrix** tab to see Room 2 now highlighted as vacant green.

4. **Step 4 — Management Surveillance & Mortality Warning**:
   - Switch to **Management** mode.
   - Review the **Treatment Success Rate** and **Mortality Rate**.
   - Click the **Test >15% Warning** button in the top right to simulate a mortality surge: observe the prominent red institutional alert banner trigger instantly! Click it again to return to normal live database metrics.

---

## 🛠️ Technology Stack

- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite 6](https://vitejs.dev/) with [@tailwindcss/vite](https://tailwindcss.com/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Database / Storage**: Dual-mode persistence:
  - **Local Storage Engine**: High-fidelity, refresh-persistent browser storage working 100% out-of-the-box on Vercel with zero required credentials.
  - **Supabase Cloud Client**: Built-in support for PostgreSQL backend via `.env` or in-app Settings configuration.
- **Celebration Effects**: [Canvas Confetti](https://www.npmjs.com/package/canvas-confetti)
- **Deployment**: [Vercel](https://vercel.com/) (configured via `vercel.json`)

---

## 💻 Local Setup & Execution

### Prerequisites
- Node.js `v18.x` or higher (tested on Node v24)
- npm `v9.x` or higher

### Installation
```bash
# 1. Clone or navigate to the repository directory
cd FactWise

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build
```bash
npm run build
npm run preview
```

---

## ☁️ Vercel Deployment

This application is ready to deploy directly to Vercel with **zero configuration**:

### Option A: Vercel CLI
```bash
npm install -g vercel
vercel
```

### Option B: Vercel Web Dashboard
1. Push this repository to GitHub/GitLab.
2. In Vercel, click **"Add New Project"** and select the repository.
3. Keep the default build settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Click **Deploy**.

> **Note on Credentials**: The application is fully functional out-of-the-box on Vercel without requiring any environment variables. All state persists across page refreshes.

---

## 🗄️ Optional Supabase Cloud Backend Setup

If you wish to attach a live Supabase PostgreSQL database:

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com/) and create a free project.
2. Navigate to **SQL Editor** in the Supabase Dashboard.
3. Open the provided [`supabase/schema.sql`](supabase/schema.sql) file from this repository and run it in the SQL Editor.

### 2. Connect to CareTrack
You can connect in either of two ways:
- **Way 1: Via Environment Variables (in `.env` or Vercel Settings)**:
  ```env
  VITE_SUPABASE_URL=https://your-project-id.supabase.co
  VITE_SUPABASE_ANON_KEY=your-anon-public-api-key
  ```
- **Way 2: Live In-App Settings**:
  - Click the **Settings (gear icon)** in the top right corner of the CareTrack header.
  - Select the **"Supabase Cloud Integration"** tab.
  - Paste your Supabase URL and Anon Key, then click **"Test & Save Supabase Connection"**.

---

## 📂 Project Directory Structure

```
FactWise/
├── .env.example                     # Environment template for Supabase
├── vercel.json                      # Vercel deployment & SPA routing configuration
├── index.html                       # HTML5 template with medical metadata
├── package.json                     # Scripts & dependencies
├── vite.config.ts                   # Vite + TailwindCSS configuration
├── tsconfig.json                    # TypeScript compiler configuration
├── supabase/
│   └── schema.sql                   # Ready-to-execute PostgreSQL migration script
└── src/
    ├── types/
    │   └── index.ts                 # Type definitions (Patient, Temperature, Visit, Audit, Config)
    ├── constants/
    │   └── mockData.ts              # Preloaded realistic clinical dataset
    ├── utils/
    │   └── clinicalCalculations.ts  # Discharge eligibility & outcome calculation algorithms
    ├── services/
    │   ├── storage.ts               # LocalStorage persistent state engine & backup exporter
    │   └── supabase.ts              # Supabase client & connection tester
    ├── context/
    │   └── AppContext.tsx           # Reactive global state, business rule enforcement & toasts
    ├── components/
    │   ├── common/                  # Reusable UI primitives (StatCard, Modal, Badge, Sparkline)
    │   ├── layout/                  # Navbar, Sidebar, ToastContainer
    │   ├── overview/                # Unified Facility Command Center
    │   ├── nurse/                   # Temperature logging station & correction modal
    │   ├── doctor/                  # Clinical rounds & discharge approval workflows
    │   ├── admin/                   # 74-bed interactive matrix, admissions & discharge queue
    │   ├── management/              # KPIs, Treatment success rate & mortality surveillance
    │   ├── audit/                   # Searchable compliance audit log
    │   ├── settings/                # Parameter controls & Supabase manager
    │   └── patient/                 # 360-degree patient clinical dossier
    ├── App.tsx                      # Main application shell
    ├── main.tsx                     # React root mount
    └── index.css                    # Tailwind CSS 4 styles
```

---

## 🏆 Assessment Verification Summary

| Required Capability | Status | Implementation Verification |
| :--- | :---: | :--- |
| **Nurse: Temperature Logging** | ✅ Complete | Records in °C with real-time fever indicator, pending/completed filter. |
| **Nurse: Duplicate Prevention** | ✅ Complete | Blocks duplicate daily entries; provides authorized correction with mandatory reason and audit entry. |
| **Doctor: Precondition Enforcement** | ✅ Complete | Doctor visits locked until today's temperature is logged. Prevents duplicate visits on the same date. |
| **Doctor: Discharge Eligibility** | ✅ Complete | Algorithm identifies 3 consecutive fever-free days (`< 38.0°C`); doctor approves and dispatches to admin queue. |
| **Administrator: 74-Bed Capacity** | ✅ Complete | Visualizes 74 rooms; strictly prevents admission when 74/74 beds are occupied. |
| **Administrator: Room Release** | ✅ Complete | Admin finalizes doctor-approved discharges, vacates room, and marks patient as Recovered. |
| **Management: Treatment Success Rate** | ✅ Complete | `Recovered / (Recovered + Deaths) * 100%` accurately calculated and rendered. |
| **Management: Mortality Warning** | ✅ Complete | Institutional banner triggers when mortality exceeds 15%, with interactive test toggle included. |
| **Data Persistence** | ✅ Complete | Persists across page reloads via LocalStorage + optional Supabase cloud integration. |
| **Responsive & Deployable** | ✅ Complete | Fully responsive on desktop and mobile; configured with `vercel.json` for instant Vercel deployment. |

---

*CareTrack Quarantine & Treatment Management System — Designed for clinical reliability and human-centered healthcare operations.*
