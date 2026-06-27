# 🧪 Phase 7 Testing Protocols
### Soli Deo Gloria — Glory to God the Father, God the Son, and God the Holy Spirit.

This manual outlines the step-by-step testing protocols to verify the visual, functional, and database-backed mechanisms of the **AI Tutor Copilot** module.

---

## ⚙️ Prerequisites & Environments

Ensure the following environments are active before testing:
* **Frontend Port**: `http://localhost:5173` (Vite 8 development server)
* **Backend Port**: `http://localhost:5000` (Node Express server)
* **API Key Test Configuration**:
  * For live testing: Verify `GEMINI_API_KEY` is set in `backend/.env`.
  * For offline fallback testing: Temporarily remove or rename the API key variable to verify the offline engine.

---

## 🖥️ Test Case 1: Core UI & Tab Access Validation

### Purpose
Verify the entry points and visibility of the AI Tutor Copilot tab on the Tutor Dashboard.

### Instructions
1. Navigate to the Tutor Portal and log in with your tutor account credentials.
2. Verify that the new tab is visible in the left-hand navigation pane of the dashboard:
   * **AI Tutor Copilot** (with a Lucide Sparkles icon, located between AI IEP Assistant and Invite & Availability).
3. Click on **AI Tutor Copilot** and confirm that the configuration panel displays correctly with a glassmorphic design and the workspace empty-state message appears.

---

## 🧭 Test Case 2: AI Tutor Copilot Asset Generation

### Purpose
Verify form submission, active loading state feedback, tab views, and output parsing.

### Instructions
1. Open the **AI Tutor Copilot** tab.
2. Configure the following values in the form:
   * **Student**: Select an active student.
   * **Grade Level**: `7th Grade`
   * **Subject Category**: `Mathematics`
   * **Target Topic**: `Fractions and Reciprocals`
   * **Current Lesson**: `Introduction to Fractions`
   * **Preferred Support Focus**: `Analogy & Metaphor`
   * **Student Challenge**: `Struggles to understand why we flip the second fraction during division.`
3. Click **"Consult AI Copilot™"**.
4. **Verify Active Loading State**:
   * Confirm that a glassmorphic loading overlay appears.
   * Confirm that the loader cycles through incremental status updates (e.g., *"Analyzing student challenge barriers..."*, *"Mapping pedagogical analogy criteria..."*).
5. **Verify Output Tabs**: Once generated, confirm that the preview panel renders the content under four distinct tabs:
   * **Explanations**: Simple Explanation (using analogy) and Deeper Mechanics.
   * **Worked Problems**: Example problem, Practice problems, and Hints.
   * **Live Coaching**: Tutor delivery guides, Common pitfalls, IEP accommodations, and Character reflections.
   * **Post-Session**: Parent summaries and Actionable tutor logs.

---

## 📡 Test Case 3: Supabase Database Synchronization

### Purpose
Verify that generated copilot assets persist to the cloud PostgreSQL database.

### Instructions
1. Ensure the live Supabase database is connected with valid environment credentials.
2. Complete Test Case 2.
3. Click the **"Save Assist"** button.
4. Verify that a success notification toast appears on the screen.
5. In your web browser, open your Supabase project dashboard:
   * Navigate to `Table Editor` -> `public.copilot_records`.
   * Confirm that the saved record is present, populated with correct parameters, and linked to the correct student and tutor UUIDs.
6. Click the **"View Copilot Log"** button in the top-right of the frontend. Verify that your saved run is listed in the history table. Click **"Load"** to reload it into the workspace.

---

## 🛡️ Test Case 4: Offline Fallback Verification

### Purpose
Verify that the platform operates smoothly in local simulation mode without live API credentials, and provides customized templates depending on the subject category.

### Instructions
1. Temporarily disable the Gemini API key in `backend/.env`.
2. Restart the Node.js server.
3. Fill out the Copilot form, choosing `Bible Study` as the subject category, and click generate.
4. Confirm that the generation completes successfully, utilizing the offline fallback rule-engine to populate structured templates containing Christian character reflections and theological insights.
5. Verify that no connection errors or unhandled system failures occur.
