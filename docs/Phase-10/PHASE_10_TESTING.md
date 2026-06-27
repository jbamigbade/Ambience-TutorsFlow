# 🕊️ Phase 10 Testing & Quality Assurance: Communication Hub
### Soli Deo Gloria — Dedicated to systematic validation, secure boundaries, and system stability.

---

## 📘 Overview

This QA manual establishes the systematic verification procedures, role-based boundary testing matrices, API verification steps, and regression checks used to validate the **Communication & Collaboration Hub** in **Phase 10**.

---

## 🧪 1. Manual Verification Routes

Follow these instructions to audit and verify the Communication Hub inside a live web session:

### Step A: Entry & UI Inspection
1. Log in with an account having profile role **Tutor**, **Admin**, **Parent**, or **Student**.
2. Locate the navigation bar and click the new **"Collaboration Hub"** option.
3. Confirm that the interface renders instantly with zero layout flashing or CSS overlapping.
4. Verify the side-by-side split screen layout:
   - Left Panel: Contact Rooms / Active Conversations.
   - Right Panel: Chat log and Care binder tabs ("Direct Messages", "Session Notes", "Checklists", "Timeline Tracker").

### Step B: Compile Session AI & Fallback Verification
1. Log in as a **Tutor**. Open the Collaboration Hub.
2. Select a student and click the **"Create Session Care Note"** button.
3. In the form field, type raw bullet points, for example: `Completed Chapter 4 fractions review. Caleb practiced perseverance. Struggled with denominators but showed grit. Homework assigned.`
4. Select Mathematics under subject, and Perseverance under character theme.
5. Click **"Compile AI Care Package"**.
6. Verify that an animated compiler modal displays.
7. Wait for completion and verify:
   - **AI Session Summary**: Professional instructor notes are generated.
   - **AI Parent Update**: Warm, encouraging update is generated.
   - **Action Checklist**: A list of homework/practice action items is created.
   - **Timeline Tracker**: Custom milestones are mapped out.
8. Disable internet connection or simulate missing API keys. Compile again.
   - Verify that the **Local Fallback Engine** triggers instantly.
   - Confirm that the compiled records incorporate selected Christian Character values (Perseverance, Diligence, etc.) with proper structure.

### Step C: Direct Message Exchanges
1. Open two browser sessions (e.g., Tutor and Parent).
2. Send a message from Tutor to Parent.
3. Verify that the message instantly appends to the sender's screen.
4. Switch to the Parent's browser, refresh, and confirm the message appears, marked with correct timestamps and sender labels.
5. Click "Reply" and send a message back. Confirm bidirectional messaging.

---

## 🛡️ 2. Role-Based Visibility Boundary Matrix

Verify that multi-tenant security gates protect data privacy. Run the following checks to validate privacy boundaries:

| Actor Role | Testing Target | Action / Step | Expected Security Outcome |
|---|---|---|---|
| **Admin** | Organization Oversight | Click "Collaboration Hub" -> Select any active tutor or parent chat room. | **FULL ACCESS**: Admin can read all messages and shared notes. |
| **Tutor** | Student Isolation | Attempt to view a chat room or shared note belonging to an unassigned student. | **BLOCKED**: The interface limits room selection to assigned students. Direct API fetches are blocked with `403 Forbidden`. |
| **Parent** | Family Isolation | Navigate to chat rooms. Attempt to select other parents' student profiles. | **BLOCKED**: Only their own children's profiles and assigned tutors display. Other families' records are invisible. |
| **Student** | Safety Gating | Check the chat room list. Attempt to load messages marked with `is_student_safe = false` or notes where visibility excludes "Student". | **BLOCKED**: Only safe channels and permitted student action checklists display. |

---

## 📡 3. API Endpoint Integration Tests

Verify that server APIs behave correctly under testing payloads:

### Test Case A: Message Delivery
- **Route**: `POST /api/collaboration/messages`
- **Action**: Fetch with valid message object.
- **Assertion**: Expect `201 Created` with the persisted message payload returned.
- **Action**: Fetch with empty `content`.
- **Assertion**: Expect `400 Bad Request` containing validation errors.

### Test Case B: AI Care Package Generator
- **Route**: `POST /api/ai/compile-session`
- **Action**: Fetch with raw notes payload.
- **Assertion**: Expect `200 OK` returning structured JSON with `session_summary`, `parent_update`, `student_checklist`, and `follow_up_timeline`.

---

## 🔄 4. Previous Core Features Regression Checklist

Verify that Phase 10 has zero adverse impact on pre-existing modules:

- [ ] **Supabase Authentication**: Log out and log back in. Ensure session tokens refresh without issue.
- [ ] **AI Test Q&A Generator**: Generate diagnostic practice questions. Verify that step-by-step solutions render.
- [ ] **AI Lesson Planner**: Build a lesson plan including character-reflection prompts. Confirm layout matches expectations.
- [ ] **AI IEP Assistant**: Retrieve a student's IEP profile and verify accommodations load.
- [ ] **AI Tutor Copilot**: Start a live support session. Ensure help cards display correct hints.
- [ ] **AI Parent Copilot**: Access homework help guidelines inside the Parent Dashboard.
- [ ] **Billing & Zoom**: Schedule a lesson and verify Stripe/PayPal triggers and automatic Zoom link generation.
