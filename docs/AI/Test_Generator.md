# 🤖 Ambience Test Q&A Generator™ Documentation

## Soli Deo Gloria
*Glory to God the Father, God the Son, and God the Holy Spirit. All academic development and intellectual pursuit are dedicated to His eternal truth and grace.*

---

## 🚀 Overview
The **Ambience Test Q&A Generator™** is the first AI-powered tutoring module introduced in Phase 4 of **Ambience TutorsFlow™**. It bridges advanced generative AI with professional, multi-subject standardized prep pedagogy. 

Designed specifically for tutors and students, this module empowers tutors to instantly generate rigorous, customized, and curriculum-aligned practice assessments, which are immediately synchronized to the student's dashboard workspace.

### Key Features
1. **Curriculum & Standardized Alignment**: Fully aligned to K-12 and national standard formats (SAT, ACT, EOG, IOWA).
2. **Highly Selective Parametrization**: Tutors configure student, subject, topic, grade level, difficulty, question count, and question format (Multiple Choice or Short Answer).
3. **Double-Engined Reliability**:
   * **Live Gemini AI Mode**: Invokes the high-speed, state-of-the-art `gemini-2.5-flash` model.
   * **Offline Rule-Engine Mode**: Fallback containing beautifully crafted curated question databases covering all 11 subject areas.
4. **Rich Pedagogical Output**: For every question generated, the system creates step-by-step solutions, final answer keys, student-friendly hints, common mistakes, and teacher's pedagogical notes.
5. **Interactive Diagnostic Workspace**: Students access assigned tests inside their Student Portal, toggle encouraging hints, verify individual responses instantly, and submit the completed block to receive a **+50 Growth Journey XP** award.

---

## 📁 Architectural Layout & Directory Structure

```
D:\Ambience-TutorsFlow
├── database
│   └── migration_phase4.sql (Database schema & RLS policies for practice_tests)
├── backend
│   └── server.js (API routes, rate-limit protection, Gemini connection, offline rule-engine)
└── frontend
    └── src
        ├── context
        │   └── AppContext.jsx (Synchronizes database state & maps fields)
        └── components
            └── dashboards
                ├── AiTestGenerator.jsx (Tutor portal premium panel selector)
                └── StudentDashboard.jsx (Student portal interactive workspace & diagnostic)
```

---

## 🎓 Multi-Subject Pedagogy Coverage

The AI Test Q&A Generator™ supports **11 subject classes** with distinct pedagogical criteria:

| Subject / Assessment | Focus Criteria & Special Requirements |
| :--- | :--- |
| **Mathematics** | Complex multi-step equations, formulas, proofs, and exhaustive calculations. |
| **Science** | Quantitative physics/chemistry problem solving, cell division mechanics, and biochemistry structures. |
| **History / Social Studies** | Interactive timelines, cause-and-effect mapping, and Document-Based Questions (DBQs). |
| **English / Language Arts** | Reading comprehension blocks, grammar correction, vocabulary context, and analytical writing prompts. |
| **Bible Study** | Scripture-based reflection, memory verse reviews, and character application contexts (Virtues: Integrity, Responsibility, Kindness, Perseverance). |
| **Computer / Technology** | Programmatic syntax snippets (JavaScript, Python, CSS), digital literacy, cybersecurity basics, and CS concepts. |
| **Physical Education / Health** | Nutritional calorie metrics, fitness parameters, sports rules, and healthy habit builders. |
| **SAT Prep** | College Board formatted algebra, grammar correction, and advanced text comprehension. |
| **ACT Prep** | STEM passage interpretation, trigonometry vectors, and reading passages. |
| **EOG Prep** | Grade-aligned state curriculum standards, reading fluency, and mathematics mechanics. |
| **IOWA Prep** | Nationally-normed visual-spatial reasoning and vocabulary benchmarks. |

---

## ⚡ Integration Details

### 1. Database Layer (`public.practice_tests`)
Saves generated outputs persistently.

```sql
CREATE TABLE public.practice_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  tutor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  topic TEXT NOT NULL,
  grade_level TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  config JSONB DEFAULT '{}'::jsonb,
  content JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### 2. Live Gemini Prompt Instruction Blueprint
```javascript
const systemInstruction = `You are Ambience Test Q&A Generator™, an elite, corporate-grade pedagogical AI engine...
The output MUST be a single, valid JSON object matching this structure:
{
  "title": "String",
  "questions": [
    {
      "id": 1,
      "question": "String",
      "options": ["String", "String", "String", "String"],
      "hint": "String",
      "answer": "String",
      "solution": "String",
      "common_mistakes": "String",
      "teacher_notes": "String"
    }
  ]
}`;
```

---

## 🛡️ Security & Defensive Hardening
1. **Role-Based Authorization (`requireRole`)**: Test generation is secured behind a gated tutor/admin privilege filter: `requireRole(["Tutor", "Admin"])`.
2. **Defensive Validation**: Inputs are fully sanitized and checked before invoking live API pipelines.
3. **No Placeholders**: Strict prompt constraints guarantee the AI returns final, valid, and fully-formed responses rather than incomplete answers.
