# 🧪 Phase 4 Testing Guide — AI Test Q&A Generator™

## Soli Deo Gloria
*Glory to God the Father, God the Son, and God the Holy Spirit. Dedicated in appreciation for His grace which enables our testing, verifying, and deployment processes.*

---

## 🎯 Testing Overview

The testing protocol for Phase 4 verifies that the **Ambience Test Q&A Generator™** is completely production-ready. The test plan covers API routing, live LLM prompt execution, rule-based fallbacks, multi-tenant database synchronization, interactive student workflows, and production build compilations.

---

## 📋 Comprehensive Test Cases

### Test Case 1: Backend Generation Router Authentication & Security
* **Objective**: Ensure that only authenticated Tutors and Admins can access the generator.
* **Steps**:
  1. Make an unauthenticated POST call to `/api/ai/generate-test` with a tool like Postman or curl.
  2. Verify that the response returns `401 Unauthorized` or `403 Forbidden`.
  3. Log in as a **Student** and attempt to call the route. Verify access is rejected.
  4. Log in as a **Tutor** and call the route with valid payload. Verify access is allowed.

### Test Case 2: Live Gemini AI REST Integration
* **Objective**: Confirm that the API successfully crafts prompts and returns valid JSON matching the exact system schema.
* **Steps**:
  1. Set a valid `GEMINI_API_KEY` in `backend/.env`.
  2. Trigger a test generation for **Mathematics** on "Quadratic Equations".
  3. Verify the console logs: `[AI Test Engine] Calling Live Gemini AI...`
  4. Inspect the returned JSON structure. Confirm it matches:
     * `title`: Strong premium title
     * `questions`: Array of objects containing `id`, `question`, `options` (if multiple choice), `hint`, `answer`, `solution`, `common_mistakes`, and `teacher_notes`.

### Test Case 3: Offline High-Fidelity Rule-Engine Fallback
* **Objective**: Verify that the application falls back gracefully if AI keys are missing or invalid, or if the server is offline.
* **Steps**:
  1. Remove or comment out the `GEMINI_API_KEY` in `backend/.env`.
  2. Trigger test generation for various subjects (e.g. **Science** on "photosynthesis" or **Bible Study** on "faith").
  3. Verify the console logs: `[AI Test Engine] Utilizing Offline Fallback Engine...`
  4. Ensure that the returned questions are fully complete and structured.

### Test Case 4: Tutor Generator Page Configuration Flow
* **Objective**: Verify the UI selectors, loading indicators, and test saving in the Tutor Portal.
* **Steps**:
  1. Access the Tutor Dashboard and navigate to the **AI Test Generator** tab.
  2. Configure a test: Select Caleb Sterling as the Student, Mathematics as the Subject, Quadratic Equations as the Topic, Medium Difficulty, and 2 Questions.
  3. Ensure "Include Solutions" and "Include Answer Key" toggles are active.
  4. Click **Generate Practice Test**.
  5. Verify that a beautiful glassmorphic loader screen appears with a spinner and descriptive progress text.
  6. On successful generation, confirm that the preview shows the questions, hints, solutions, and notes clearly.
  7. Click **Assign & Save to Student**. Verify the success alert.

### Test Case 5: Student Workspace Diagnostic Experience
* **Objective**: Test the end-to-end interactive student testing suite.
* **Steps**:
  1. Log in as the Student (Caleb Sterling) and go to the **Practice Exams** tab.
  2. Verify that the Left Column correctly displays the newly assigned test under **My Assigned AI Practice Tests**.
  3. Click **Start Quiz** on the assigned test.
  4. Verify that the Right Column dynamically switches to the **Interactive Workspace** rendering the title, subject, topic, and questions.
  5. Click **Get a Hint** on Question 1. Ensure the correct student-friendly hint reveals smoothly.
  6. Select an answer choice and click **Verify Answer**. Confirm that:
     * The input/choices are locked for that question.
     * The correctness banner (Correct/Incorrect) displays with appropriate colors.
     * The step-by-step mathematical or conceptual solution, correct answer key, common mistakes, and teacher's notes are revealed.
  7. Answer all remaining questions.
  8. Click **Submit Diagnostic Workspace**.
  9. Verify that:
     * The score display reflects the correct score.
     * An XP award notification of **+50 XP** is rendered.
     * The Left Column test card status updates to `✓ Completed (Score X/Y)`.
     * The student's overall XP indicator ranks up (verifying points are synchronized).

### Test Case 6: Static SAT Challenge Problem Preservation
* **Objective**: Ensure that previous student testing features remain operational as a default fallback.
* **Steps**:
  1. Open the **Practice Exams** tab on the Student Dashboard.
  2. With no active test selected, verify that the Right Column renders the **SAT Practice Challenge Problem**.
  3. Submit a correct answer (Option B). Ensure the `+50 Growth Points` notification displays.
  4. Click reset to verify trying again.

---

## ⚙️ Production Build & Verification

To verify there are no syntax anomalies or React compilation warnings, execute a production build:

```powershell
# Navigate to the frontend directory
cd frontend

# Run production build compilation
npm run build
```

Verify that Vite compiles all assets successfully under 1000ms.
