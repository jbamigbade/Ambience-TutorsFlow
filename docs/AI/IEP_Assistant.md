# 🧠 Ambience IEP Assistant™
### Soli Deo Gloria — Glory to God the Father, God the Son, and God the Holy Spirit.

Welcome to the **AI IEP Assistant** architecture and reference manual. This module is engineered to support special educators, tutors, and learning coordinators by converting diagnostic observations into comprehensive, actionable **Individualized Education Program (IEP)** support notes, SMART goals, and parent-friendly progress summaries.

---

## ⚙️ Core Inputs & Diagnostic Parameters

The IEP Assistant collects and processes specialized behavioral and academic indicators to produce compliant support pathways:

1. **Student Context**: Selection of a student profile to retrieve historical context, previous goals, and grade baseline data.
2. **Student Strengths**: Observed areas of proficiency, academic assets, favorite learning methods, and personal interests (e.g., *strong visual learner, excels in vocal participation, highly creative*).
3. **Challenges & Barriers**: Specific learning obstacles, behavioral patterns, or physical limits (e.g., *easily distracted after 15 minutes, struggles with fine motor writing, processing speed delays, difficulty with decoding*).
4. **Current Goals / Foci**: The desired focus area (e.g., *mastery of basic addition facts, identifying main ideas in short paragraphs, building task-completion stamina*).

---

## 📋 Comprehensive AI IEP Outputs

The generated IEP notes are structured into an easy-to-read, high-fidelity profile layout:

* **Strengths Summary**: Formulates a positive, asset-based overview of the student's unique abilities, ensuring tutoring sessions leverage these strengths.
* **Challenges Analysis**: Translates clinical observations into a clear, non-stigmatizing, analytical breakdown of the student's barriers to learning.
* **Custom Accommodation Suggestions**: Actionable accommodation strategies specifically selected for the student's profile (e.g., *providing visual checklists, structured brain breaks every 20 minutes, color-coded graphic organizers, tactile math manipulatives*).
* **SMART Goal Drafting**: Converts vague goals into highly structured, compliant **SMART goals** (*Specific, Measurable, Attainable, Relevant, Time-bound*) containing exact success criteria (e.g., *"Student will identify the main idea of a 5-sentence paragraph with 80% accuracy in 4 out of 5 consecutive trials by September 2026"*).
* **Progress Notes Narrative**: Clear instructions and checklists on how the tutor can track, measure, and record progress objectively during regular sessions.
* **Parent-Friendly Summary**: A warm, positive, jargon-free summary designed for parents, highlighting wins, upcoming focal points, and simple ways they can help at home.
* **Tutor Action Steps**: A practical step-by-step checklist of specific tutoring strategies to apply immediately in the next session.

---

## 🔌 API Architecture & Prompt Engineering

The live assistant utilizes the **Gemini 2.5 Flash API** to generate special education support plans using precise, structured prompts:

```json
POST /api/ai/generate-iep-notes
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "studentId": "std_uuid_456",
  "studentName": "Grace",
  "strengths": "Highly imaginative, excels at verbal communication",
  "challenges": "Struggles with focus during independent writing tasks",
  "currentGoals": "Writing a cohesive paragraph with a topic sentence"
}
```

### Prompt Engineering Guidelines
* **Asset-First Framework**: Instructs the LLM to structure outputs using positive, strength-based phrasing.
* **SMART Formulations**: Enforces the inclusion of exact numeric percentages, trial boundaries, and timelines in drafted goals.
* **Separation of System Instructions**: The backend handles systemic formatting rules, while the tutor provides student-specific inputs, preventing injection anomalies.

---

## 🛡️ Robust Offline Fallback Engine

If Gemini API keys are missing or the platform is running offline, the system switches to the **Offline IEP Assistant Engine**. This engine reads the student's profile and inputs, using special education algorithms to generate highly structured, detailed fallback templates:

```javascript
// Sample fallback logic in backend/server.js
console.log(`[AI IEP Assistant] Utilizing Offline Fallback Engine for Student: ${studentName}`);
const simulatedReport = {
  strengths: `Analytical academic profile for ${studentName}. Key strengths: ${strengths}.`,
  challenges: `Identified primary learning barriers: ${challenges}.`,
  accommodationSuggestions: `1. Visual Schedules & Checklists.\n2. Intersperse tasks with 2-minute brain breaks.\n3. Minimize visual noise.`,
  goalDrafting: `SMART Goal: By the end of 8 weeks, ${studentName} will demonstrate progress on "${currentGoals}" with 80% accuracy in 3 out of 4 baseline checks.`,
  progressNotes: `Formative observation guidelines for measuring ${currentGoals} weekly.`,
  parentSummary: `We had a wonderful session! ${studentName} showed great effort...`,
  tutorSteps: `1. Pre-teach key terms.\n2. Review visual schedules.\n3. Log progress weekly.`
};
```

This guarantees consistent, helpful testing and visual mockups during offline development.

---

## 🗄️ Supabase Persistence Schema

When connected to a live PostgreSQL database, IEP notes are saved to the `public.iep_notes` table to ensure safe persistence:

```sql
CREATE TABLE public.iep_notes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
    tutor_id UUID REFERENCES public.tutors(id) ON DELETE SET NULL NOT NULL,
    strengths TEXT NOT NULL,
    challenges TEXT NOT NULL,
    accommodations TEXT NOT NULL,
    goals TEXT NOT NULL,
    progress_notes TEXT NOT NULL,
    parent_summary TEXT NOT NULL,
    tutor_steps TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

### Multi-Tenant Row Level Security (RLS)
Child diagnostic data is heavily protected using multi-tenant PostgreSQL policies:
* **SELECT**: Accessible only by the assigned student, the student's linked parent, the generating tutor, or platform administrators.
* **INSERT**: Restricted to authenticated users with role `Tutor` or `Admin`.
* **UPDATE / DELETE**: Restricted to the generating tutor, or platform administrators.

---

## 🚀 Step-by-Step User Workflow

1. **Navigate**: Click on the **AI IEP Assistant** tab within the Tutor Dashboard.
2. **Select Student**: Choose a student from the active list. The system automatically populates known goals and context if available.
3. **Draft Observations**: Enter the student's current strengths, challenges, and immediate learning goals.
4. **Trigger Generation**: Click **"Generate IEP Support Plan"** and view the smooth glassmorphic loader.
5. **Interactive Preview**: Review the generated IEP profile across multiple tabs (*Cognitive Profile*, *Accommodations*, *SMART Goals*, *Parent Summary*).
6. **Save**: Click **"Save IEP Note"** to persist the record to the database, instantly updating the student's academic history.
