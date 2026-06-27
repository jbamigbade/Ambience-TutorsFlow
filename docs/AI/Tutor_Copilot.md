# 🧭 Ambience Tutor Copilot™
### Soli Deo Gloria — Glory to God the Father, God the Son, and God the Holy Spirit.

Welcome to the **AI Tutor Copilot** engineering and architecture manual. This module is designed to provide real-time, live-session scaffolding and pedagogical assets to tutors, allowing them to deliver customized analogies, worked examples, and IEP-aligned adaptive accommodations within seconds of a student encountering a learning barrier.

---

## ⚙️ Core Inputs & Educational Parameters

The Tutor Copilot accepts detailed tutoring variables to formulate responsive tutoring guides:

1. **Student (Optional)**: Connects directly to an active student's dashboard profile for full educational context.
2. **Grade Level**: Preschool through 12th Grade, plus Test Prep options (SAT, ACT, AP, EOG, IOWA).
3. **Subject Category**: Full coverage of core and specialized subjects, including:
   * **Mathematics**: Arithmetic, Algebra, Pre-Calculus, Calculus, Geometry, Statistics.
   * **Science**: Physics, Chemistry, Biology, Environmental, Earth Sciences.
   * **English / Language Arts**: Reading comprehension, grammar, writing structure, literature analysis.
   * **History / Social Studies**: Geography, Civics, US/World History, Economics.
   * **Bible Study**: Scripture contexts, historical theological references, practical life reflections.
   * **Computer / Technology**: Programming logic, software syntax, cybersecurity basics, digital media.
   * **Physical Education / Health**: Wellness, nutrition, exercise mechanics, sportsmanship guidelines.
   * **Test Prep**: Standardized test diagnostic strategies (SAT, ACT, EOG, IOWA).
4. **Target Topic / Term**: The exact concept causing difficulty (e.g. *quadratic equations, active transport, run-on sentences, Romans 12:1*).
5. **Current Lesson / Session Unit**: The lesson title or page number for current context.
6. **Active Student Challenge**: The specific immediate barrier observed by the tutor (e.g., *cannot understand flipping fraction reciprocals, gets discouraged immediately, memory focus delays*).
7. **Preferred Primary Support Type Focus**: Selects the primary teaching strategy used to address the barrier:
   * **Analogy & Metaphor**: Child-friendly analogies.
   * **Visual Aid & Diagram Models**: Spatial, geometric, or graphical layouts.
   * **Socratic Dialogue & Inquiries**: Guides the student to discover the answer using structured questions.
   * **Detailed Scaffolding Steps**: Step-by-step conceptual breakdowns.
   * **Mnemonics & Memory Aids**: Verbal acronyms, stories, or key associations.
   * **Gamified Review Drills**: Structured in-session educational games.

---

## 📋 Generated Copilot Output Blocks

The generator outputs structured blocks that display in a beautiful, multi-tab layout:

* **Simple Explanation (Analogy)**: An intuitive, child-friendly explanation of the topic using the requested support style.
* **Deeper Mechanics & Terminology**: A rigorous, detailed breakdown of the underlying scientific/mathematical rules, formulas, and vocabulary.
* **Tutor Session Delivery Guide**: Step-by-step timing, instructional guidelines, and focus cues to help the tutor explain the concept.
* **Worked Example Problem**: A clear, step-by-step example problem showing the solution process.
* **Practice Drill Problems**: 2-3 scaffolded practice problems tailored to the student's level.
* **Scaffolding Hints**: Step-by-step hints to guide the student toward independent problem-solving.
* **Common Student Pitfalls**: Misconceptions, mechanical slips, or common errors to watch for.
* **Adaptive IEP Suggestions**: Specialized classroom and session accommodation ideas tailored to the student's specific challenges.
* **Character Reflection Notes**: Embeds Christian virtues—specifically **Grit, Diligence, Integrity, and Perseverance**—directly into the learning experience.
* **Encouraging Parent Update**: A positive, jargon-free summary of the session's wins and next steps, ready to share with parents.
* **Actionable Post-Session Log**: Actionable notes and future session suggestions to help the tutor plan upcoming lessons.

---

## 🔌 API Architecture & Live Gemini Integration

The live copilot routes to the **Gemini 2.5 Flash API** using structured prompts:

```json
POST /api/ai/generate-copilot
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "studentId": "std_uuid_789",
  "studentName": "Alex",
  "subject": "Mathematics",
  "topic": "Negative Exponents",
  "gradeLevel": "8th Grade",
  "currentLesson": "Algebra Basics Chapter 2",
  "studentChallenge": "Doesn't understand why a negative exponent means division, gets frustrated.",
  "supportType": "Analogy"
}
```

### Prompt Constraints
1. **Strict Output Type**: Uses `responseMimeType: "application/json"` parameters to ensure clean, predictable outputs.
2. **System Prompt Isolation**: Keeps systemic formatting and layout instructions separate from user-provided inputs, resulting in higher-quality responses.
3. **MIME Integrity**: Enforces direct JSON parsing without markdown wrappers or backticks.

---

## 🛡️ Robust Offline Fallback Engine

If Gemini API keys are missing, the system redirects to an **Offline High-Fidelity Fallback Engine**. This engine checks the selected subject category and dynamically generates highly detailed, structured, and customized templates for each subject (Math, Science, ELA, Bible Study, Tech, and more). This ensures consistent testing and visual mockups during development.

---

## 🗄️ Supabase Persistence Schema

When a live database is active, generated copilot assets are saved in the `public.copilot_records` table:

```sql
CREATE TABLE public.copilot_records (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    tutor_id UUID REFERENCES public.tutors(id) ON DELETE SET NULL,
    subject TEXT NOT NULL,
    topic TEXT NOT NULL,
    grade_level TEXT NOT NULL,
    session_context TEXT,
    student_challenge TEXT,
    support_type TEXT,
    content JSONB DEFAULT '{}'::JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

### Multi-Tenant Row-Level Security (RLS)
Child diagnostic data is heavily protected using multi-tenant PostgreSQL policies:
* **SELECT**: Accessible only by the assigned student, their linked parent, the generating tutor, or platform administrators.
* **INSERT**: Restricted to authenticated users with role `Tutor` or `Admin`.
* **UPDATE / DELETE**: Restricted to the generating tutor, or platform administrators.

---

## 🚀 Step-by-Step User Workflow

1. **Navigate**: Click on the **AI Tutor Copilot** tab within the Tutor Dashboard.
2. **Define Context**: Select a student from the active list. Select the subject category, grade level, and type the target topic.
3. **Customize Support**: Provide optional lesson contexts, specify the student's immediate learning challenge, and select your preferred support type (e.g., *Analogy*).
4. **Trigger Generation**: Click **"Consult AI Copilot™"** and watch the interactive, multi-step loader cycle through actual pedagogical milestones.
5. **Interactive Review**: Once completed, review the generated assets across four tab views:
   * **Explanations**: Analogy and Deeper Mechanics.
   * **Worked Problems**: Example problem, Practice problems, and Hints.
   * **Live Coaching**: Tutor guides, Pitfalls, IEP accommodations, and Character reflections.
   * **Post-Session**: Parent summary updates and Actionable tutor logs.
6. **Save**: Click **"Save Assist"** to persist the record to the cloud database, instantly updating the student's academic history.
