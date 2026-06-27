# 🛠️ Phase 8 Technical Notes
### Soli Deo Gloria — Engineering for the Glory of God.

---

## 💾 1. Database Schema (`public.parent_copilot_records`)

The database table was established in [migration_phase8.sql](file:///D:/Ambience-TutorsFlow/database/migration_phase8.sql) with the following structure:

```sql
CREATE TABLE IF NOT EXISTS public.parent_copilot_records (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    subject TEXT NOT NULL,
    topic TEXT NOT NULL,
    current_assignment TEXT,
    parent_concern TEXT,
    support_type TEXT,
    content JSONB DEFAULT '{}'::JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

### PostgreSQL Row-Level Security (RLS) Policies:
- **SELECT Policy**: Restricts read access to the logged-in parent, the linked student, their assigned tutor, or platform administrators.
- **INSERT Policy**: Allows only parents and system administrators to create parent copilot records.
- **ALL/UPDATE/DELETE Policy**: restircts full mutation privileges to the parent creator of the record or administrators.

---

## 🔌 2. Backend API Implementation (`backend/server.js`)

Two primary REST endpoints were appended:

### A. GET `/api/ai/parent-copilot-records`
Retrieves previous runs stored in the local memory database fallback during offline execution:
- URL parameters supported: `studentId`, `parentId`.

### B. POST `/api/ai/parent-copilot-records`
Caches generated runs in the local memory database fallback during offline execution.

### C. POST `/api/ai/generate-parent-copilot`
Handles the core Generation business logic:
1. **API Validation**: Checks if `GEMINI_API_KEY` or `AI_API_KEY` is present and active.
2. **Gemini 2.5 Flash API Execution**: If enabled, invokes the live AI model with system instructions forcing a strict JSON layout:
   - `parentExplanation`
   - `homeworkGuide`
   - `atHomePractice`
   - `studentEncouragement`
   - `progressSummary`
   - `tutorQuestions`
   - `studentQuestions`
   - `characterReflection`
   - `bibleReflection`
   - `iepSupportTips`
3. **Offline High-Fidelity Rule-Engine Fallback**: If keys are missing or offline, dynamically assembles realistic support guides mapped specifically to the topic, subject categories, and custom parent concerns.

---

## 🎛️ 3. State Management & Real-Time Sync (`frontend/src/context/AppContext.jsx`)

The frontend Context API was upgraded to integrate parent copilot assets seamlessly:
- **State Initialization**: `const [parentCopilotRecords, setParentCopilotRecords] = useState([]);`
- **Dynamic Database Synchronization**: Inside the `fetchLiveDatabaseData` function, queries the `parent_copilot_records` table on login/updates, formatting records in-memory.
- **Save Hooks**: `addParentCopilotRecord` automatically handles conditional branching:
  - If a live Supabase server is detected, inserts the record to PostgreSQL and triggers an asynchronous database fetch.
  - If offline, generates a local randomized UUID and adds it to the memory state list.

---

## 🖥️ 4. Frontend Component Design (`AiParentCopilot.jsx`)

- **Design Aesthetic**: Built with glassmorphism, responsive form grids, rich input drop-downs, and a custom multi-tab preview screen.
- **Stepping Loader**: Uses an interactive, CSS-animated linear bar with real-time text updates (e.g., *"Drafting parent-friendly conceptual analogies..."*) to visual-level load transitions.
- **Icon Assets**: Imported exclusively from standard, tested Lucide React vector maps (`Sparkles`, `Brain`, `Heart`, `Activity`, `CheckSquare`, `ShieldAlert`, etc.).
