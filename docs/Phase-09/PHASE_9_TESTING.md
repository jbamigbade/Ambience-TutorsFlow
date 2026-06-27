# 🛡️ Phase 9 Testing & Quality Assurance: Administrator Intelligence Center™
### Soli Deo Gloria — Dedicated to systematic verification, precise audits, and robust stability.

---

## 📘 Overview

This manual establishes the systematic verification procedures, QA parameters, regression checks, and automated/manual vectors used to approve the **Administrator Intelligence Center™** in **Phase 9**.

---

## 🧪 1. Manual Verification Routes

Follow these steps to manually audit and verify the Intelligence Center inside a live browser session:

### Step A: Access & Gating
1. Log into the platform using an account with the profile role set to **Admin**.
2. Navigate to the **Admin Portal** on your dashboard.
3. Observe the tab header row. Confirm that a new option labeled **"Intelligence Center"** displays next to the "Billing Audits" button, accompanied by a `ShieldCheck` icon.
4. Click the tab. Confirm that the **Administrator Intelligence Center** panel renders instantly with zero UI flashing or styling misalignments.

### Step B: Compile & Loader Testing
1. Click the glowing **"Compile Educational Intelligence"** button on the control header.
2. Confirm that an animated compiling overlay displays.
3. Verify that the compiling milestones update sequentially:
   - *Scanning historical billing ledgers...*
   - *Parsing active student lesson registries...*
   - *Synthesizing tutor copilot activities...*
   - *Formulating strategic administrative recommendations...*
4. Confirm that the loader is responsive and does not block browser rendering.

### Step C: Result Verification & Navigation
1. Once compilation finishes, confirm that the loader fades out and the compiled metrics render on screen.
2. Navigate through the result sub-tabs:
   - **Student Risks**: Check if at-risk students are listed, with detailed risk indicators and suggested actions.
   - **Tutor Activities**: Verify tutor performance summaries, average ratings, and workload recommendations.
   - **Parent Engagement**: Audit parent copilot stats, topics questioned, and active concerns.
   - **Revenue Insights**: Confirm billing observations, pending verification lists, and revenue split stats.
   - **Strategic Directives**: Check operational guidelines and systemic educational tips.

---

## 🎛️ 2. Multi-Parameter Filter Audits

Test the dropdown filter systems to confirm reactive data filtering. Verify that selected configurations are passed to the backend server during compilation:

| Filter Parameter | Verification Actions | Expected Behavior |
|---|---|---|
| **Date Range** | Select "Last 30 Days" -> Compile | Insights are scoped strictly to the selected period. |
| **Tutor** | Select "Mrs. Sarah Jenkins" -> Compile | Statistics filter for sessions mapped to this tutor. |
| **Student** | Select "Caleb Sterling" -> Compile | Risk indicators prioritize Caleb's study habits. |
| **Subject** | Select "Pre-Calculus" -> Compile | Telemetry isolates Pre-Calculus lessons and tests. |
| **Grade Level** | Select "Elementary School" -> Compile | Metrics focus on core younger learners. |
| **Payment Status**| Select "Pending Verification" -> Compile | Highlights outstanding manual Zelle transfers. |

---

## 🛡️ 3. Row-Level Security (RLS) & Access Safeguards

To prevent cross-role leaks and access violations, verify database gating:

1. **Tutor Access Bypass**: Log in as a tutor. Confirm that the "Intelligence Center" tab is completely hidden. Try executing a direct GET/POST fetch to `/api/ai/admin-insights-records`. Verify that the backend blocks the call with a 403 Access Denied.
2. **Parent Access Bypass**: Log in as a parent. Confirm that the tab is hidden and any direct endpoint fetching is rejected.
3. **Admin Verification**: Log in as an Admin. Execute a compilation and verify that Supabase writes the data to `public.admin_insights` cleanly. Check the Supabase console to confirm that the row exists and contains the correct JSON data.

---

## 🔄 4. Previous Core Features Regression Checks

Verify that Phase 9 does not impact pre-existing features. Test the following core capabilities:

- **AI Test Generator**: Generate a Math practice test inside the Tutor portal. Verify that questions and answers generate cleanly.
- **AI Lesson Planner**: Build a Science lesson plan with Homework. Verify that objectives, Guided Practice, and Exit Tickets generate with standard formatting.
- **AI IEP Assistant**: Access an active student's IEP profile. Ensure accommodations load with zero issues.
- **AI Tutor Copilot**: Start a live tutoring session support simulation. Verify step-by-step guidance is available.
- **AI Parent Copilot**: Log in as a parent and access the parent copilot. Ensure at-home learning suggestions load correctly.
- **Payments / Zelle Verification**: Audit and approve a pending Zelle payment. Confirm that the session is booked and the Zoom meeting is provisioned.
