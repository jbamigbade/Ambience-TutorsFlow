# 🍎 Ambience Lesson Planner™
### Soli Deo Gloria — Glory to God the Father, God the Son, and God the Holy Spirit.

Welcome to the **AI Lesson Planner** architecture and reference manual. This module equips educators and tutors with state-of-the-art pedagogical generation tools, leveraging the high-speed and ultra-capable **Gemini 2.5 Flash API** to generate comprehensive, standards-aligned, and character-reinforced lesson structures in seconds.

---

## ⚙️ Core Inputs & Target Metatables

The generator accepts detailed classroom configurations to output bespoke lesson frameworks:

1. **Student Context**: Linked directly to a profile in the multi-tenant database to customize activities for specific learning styles.
2. **Grade Level**: Preschool through 12th grade, plus specialized test prep tiers (SAT, ACT, AP, IOWA, EOG).
3. **Subject**: Math, Algebra, Science, Chemistry, Biology, Physics, English Language Arts (ELA), History, or custom domains.
4. **Topic**: Specific curriculum modules (e.g., *Quadratic Formula*, *Active Voice*, *Cellular Respiration*).
5. **Duration**: Time-bound session lengths (e.g., 30, 45, 60, or 90 minutes).
6. **Learning Objective**: Desired focal goals or specific behavioral targets (e.g., "SWBAT solve double-digit division with remainders").
7. **Difficulty Level**: Scaffolding tiers (*Beginner*, *Intermediate*, *Advanced*, *Rigorous*).
8. **Homework Toggle**: Option to automatically append a reinforcement assignment.
9. **Assessment Toggle**: Option to attach a formative exit ticket check.
10. **Character Education Toggles**: Infuses Christian values and traditional character metrics—specifically **Grit, Integrity, Diligence, and Perseverance**—into activities, stories, and reflection notes.

---

## 💎 Output Pedagogical Blocks

The output is formatted inside a beautiful, glassmorphic tabbed layout on the frontend, containing:

* **Lesson Title**: An engaging, premium title tailored to attract the student's focus.
* **Objectives**: Clear, measurable SWBAT (Students Will Be Able To) objectives mapping cognitive benchmarks.
* **Warm-up Activity (5-10 mins)**: High-energy engagement hooks, activating prior knowledge and introducing key terms.
* **Direct Instruction (15-20 mins)**: Concrete teaching milestones, rules, notation standards, and 3 explicit step-by-step master examples.
* **Guided Practice (15 mins)**: Scaffolding tasks where the tutor and student collaborate with gradual release.
* **Independent Practice (15 mins)**: Solo practice drills with clear boundary conditions.
* **Exit Ticket**: Fast formative checks checking for conceptual mastery before the session ends.
* **Homework**: Clear, scaffolded take-home review tasks to secure knowledge retention.
* **Teacher Guide**: Timing outlines, common pitfalls to monitor, and specific positive reinforcement cues.
* **Differentiation Notes**: Tailored accommodation tactics for struggling students and enrichment extensions for advanced students.

---

## 🔌 API Architecture & Prompt Engineering

The live generator routes to the **Gemini 2.5 Flash API** using the following structured system instructions and parameters:

```json
POST /api/ai/generate-lesson-plan
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "studentId": "std_uuid_123",
  "gradeLevel": "7th Grade",
  "subject": "Mathematics",
  "topic": "Solving Single-Variable Equations",
  "duration": "60 minutes",
  "learningObjective": "Isolate variables using inverse operations",
  "difficulty": "Medium",
  "includeHomework": true,
  "includeAssessment": true,
  "includeCharacterEducation": true
}
```

### Prompt Constraints
To prevent JSON malformations or parsing errors, the backend executes strict prompt formatting:
1. **Strict Response Type**: Forces `responseMimeType: "application/json"`.
2. **System Instruction Isolation**: The backend separates system constraints (role, JSON structure, output schema, value embeddings) from user-specified variables (the student's details, topic, difficulty).
3. **No Markdown Wrappers**: Specifically instructs the LLM not to wrap responses in backticks (````` ```json ````).

---

## 🛡️ Robust Offline Fallback Engine

If the user is testing offline or API keys are missing, the system automatically redirects to a high-fidelity **Offline Pedagogical Rule-Engine**. Rather than throwing a generic error, this engine reads incoming parameters and constructs a highly organized, customized markdown-formatted lesson outline:

```javascript
// Sample fallback logic in backend/server.js
let title = `${gradeLevel} - Structured Lesson: ${topic}`;
let obj = `Students will master "${topic}" at a ${difficulty} difficulty tier within ${duration}.`;
if (includeCharacterEducation) {
  obj += ` Incorporates reflections on 'Diligence and Perseverance'.`;
}
```

This guarantees that developers and evaluators experience beautiful dashboard outcomes without incurring live API costs or requiring immediate setup.

---

## 🗄️ Supabase Persistence Schema

When a live database is active, generated lesson plans are stored in the `public.lesson_plans` table.

```sql
CREATE TABLE public.lesson_plans (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    tutor_id UUID REFERENCES public.tutors(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    grade_level TEXT NOT NULL,
    subject TEXT NOT NULL,
    topic TEXT NOT NULL,
    duration TEXT NOT NULL,
    learning_objective TEXT,
    difficulty TEXT NOT NULL,
    config JSONB DEFAULT '{}'::JSONB NOT NULL,
    content JSONB DEFAULT '{}'::JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

### Multi-Tenant Row Level Security (RLS)
The table is fully isolated via PostgreSQL RLS policies to safeguard child privacy:
* **SELECT**: Accessible by the assigned student, the student's linked parent, the generating tutor, or platform administrators.
* **INSERT**: Allowed only for users with role `Tutor` or `Admin`.
* **UPDATE / DELETE**: Restricted to the owning tutor who generated the plan, or platform administrators.

---

## 🚀 Step-by-Step User Workflow

1. **Dashboard Entry**: Access the Tutor Dashboard. Click on the **AI Lesson Planner** tab.
2. **Configure Settings**: Select a student from the dropdown, choose grade, subject, and type the topic.
3. **Toggle Pedagogical Aids**: Adjust switches for Homework, Assessments, and Character Education features.
4. **Trigger Generation**: Click the glowing **"Generate Lesson Plan"** button.
5. **Interactive Loading**: Observe the premium glassmorphic loader cycling through actual pedagogical stage updates (e.g., *"Formulating objectives..."*, *"Drafting exit ticket..."*, *"Injecting character goals..."*).
6. **Review & Save**: Switch between tabs (*Overview*, *Instruction*, *Practice*, *Teacher Guide*) to inspect the lesson plan. Click **"Save Lesson Plan"** to securely persist it to the cloud database.
