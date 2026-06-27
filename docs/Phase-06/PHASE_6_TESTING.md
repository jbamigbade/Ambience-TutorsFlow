# 🧪 Phase 6 Testing Protocols
### Soli Deo Gloria — Glory to God the Father, God the Son, and God the Holy Spirit.

This manual outlines the step-by-step testing protocols to verify the visual, functional, and database-backed mechanisms of the **AI Lesson Planner** and **AI IEP Assistant** modules.

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
Verify the entry points and visibility of the new AI features on the Tutor Dashboard.

### Instructions
1. Navigate to the Tutor Portal and log in with your tutor account credentials.
2. Verify that two new tabs are visible in the left-hand navigation pane of the dashboard:
   * **AI Lesson Planner** (with a Lucide BookOpen/Sparkles icon)
   * **AI IEP Assistant** (with a Lucide Brain/UserCheck icon)
3. Click on **AI Lesson Planner** and confirm that the planning configuration panel displays correctly with a glassmorphic design.
4. Click on **AI IEP Assistant** and confirm that the diagnostic form fields display correctly.

---

## 🍎 Test Case 2: AI Lesson Planner Generation

### Purpose
Verify form submission, active loading state feedback, tab views, and output parsing for the Lesson Planner.

### Instructions
1. Open the **AI Lesson Planner** tab.
2. Configure the following values in the form:
   * **Student**: Choose any student from the dropdown (e.g., *Alex*).
   * **Grade Level**: `8th Grade`
   * **Subject**: `Science`
   * **Topic**: `Photosynthesis and Cellular Energy`
   * **Duration**: `45 minutes`
   * **Learning Objective**: `Understand how chlorophyll captures light energy.`
   * **Difficulty**: `Medium`
   * **Toggles**: Enable *Include Homework*, *Include Assessment*, and *Include Character Education Reflection*.
3. Click the glowing **"Generate Lesson Plan"** button.
4. **Verify Active Loading State**:
   * Confirm that a glassmorphic loading overlay appears.
   * Confirm that the loader cycles through incremental status updates (e.g., *"Formulating objectives..."*, *"Drafting lesson structure..."*, *"Injecting character reflections..."*).
5. **Verify Output Tabs**: Once generated, confirm that the preview panel renders the content under four distinct tabs:
   * **Overview**: Title, Grade, Subject, and Measurable SWBAT Objectives.
   * **Instruction**: Detailed Warm-up activity and Step-by-Step Direct Instruction.
   * **Practice**: Guided and Independent practice activities.
   * **Teacher Cues**: Homework, Exit Ticket, Teacher Guide, and Differentiation strategies.

---

## 🧠 Test Case 3: AI IEP Assistant Generation

### Purpose
Verify the creation of specialized special education accommodations, SMART goals, progress notes, and parent summaries.

### Instructions
1. Open the **AI IEP Assistant** tab.
2. Configure the form using the following test observations:
   * **Student**: Select an active student.
   * **Student Strengths**: `Excellent verbal communicator, highly creative, works well with visual guides.`
   * **Challenges**: `Processing delays, easily distracted, struggles to write long responses.`
   * **Current Goals**: `To write a cohesive, structured paragraph.`
3. Click **"Generate IEP Support Plan"**.
4. Once completed, verify that the diagnostic tabs display the appropriate outputs:
   * **Cognitive Profile**: Strength and challenge summaries.
   * **Accommodations**: Tailored suggestions like visual timers and graphic organizers.
   * **SMART Goals**: Quantitative goals with progress metrics.
   * **Parent Steps**: Positive home-support updates and parent-friendly summaries.

---

## 📡 Test Case 4: Supabase Database Synchronization

### Purpose
Verify that generated plans and reports persist to the cloud PostgreSQL database.

### Instructions
1. Ensure the live Supabase database is connected with valid environment credentials.
2. Complete either Test Case 2 or Test Case 3.
3. Click the **"Save Lesson Plan"** or **"Save IEP Note"** button.
4. Verify that a success notification toast appears on the screen.
5. In your web browser, open your Supabase project dashboard:
   * Navigate to `Table Editor` -> `public.lesson_plans` or `public.iep_notes`.
   * Confirm that the saved record is present, populated with correct parameters, and linked to the correct student and tutor UUIDs.
6. Refresh the Tutor Dashboard and confirm that the saved items appear in the student's academic history lists.

---

## 🛡️ Test Case 5: Offline Fallback Verification

### Purpose
Verify that the platform operates smoothly in local simulation mode without live API credentials.

### Instructions
1. Temporarily disable the Gemini API key in `backend/.env`.
2. Restart the Node.js server.
3. Fill out either the Lesson Planner or IEP Assistant form and click generate.
4. Confirm that the generation completes successfully, utilizing the offline fallback rule-engine to populate structured templates.
5. Verify that no connection errors or unhandled system failures occur.
