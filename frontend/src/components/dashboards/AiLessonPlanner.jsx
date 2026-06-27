import React, { useState, useContext } from "react";
import { AppContext } from "../../context/AppContext";
import {
  Sparkles,
  User,
  GraduationCap,
  BookOpen,
  Clock,
  Gauge,
  CheckCircle,
  FileText,
  Save,
  Brain,
  HelpCircle,
  Lightbulb,
  Award,
  ChevronDown,
  ChevronUp,
  Sliders,
  Compass
} from "lucide-react";

export default function AiLessonPlanner() {
  const { students, addLessonPlan, apiFetch, currentUser } = useContext(AppContext);

  // Form states
  const [selectedStudent, setSelectedStudent] = useState("");
  const [gradeLevel, setGradeLevel] = useState("7th Grade");
  const [subject, setSubject] = useState("Mathematics");
  const [topic, setTopic] = useState("");
  const [duration, setDuration] = useState("60 minutes");
  const [learningObjective, setLearningObjective] = useState("");
  const [difficulty, setDifficulty] = useState("Medium");
  const [includeHomework, setIncludeHomework] = useState(true);
  const [includeAssessment, setIncludeAssessment] = useState(true);
  const [includeCharacterEducation, setIncludeCharacterEducation] = useState(true);

  // UX states
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState("");
  const [generatedPlan, setGeneratedPlan] = useState(null);
  const [generationSource, setGenerationSource] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [activePreviewTab, setActivePreviewTab] = useState("outline"); // outline, teacher, student

  const SUBJECTS = [
    "Mathematics",
    "Science",
    "History / Social Studies",
    "English / Language Arts",
    "Bible Study",
    "Computer / Technology",
    "Physical Education / Health",
    "SAT",
    "ACT",
    "EOG",
    "IOWA"
  ];

  const gradeLevels = [
    "Kindergarten",
    "1st Grade",
    "2nd Grade",
    "3rd Grade",
    "4th Grade",
    "5th Grade",
    "6th Grade",
    "7th Grade",
    "8th Grade",
    "9th Grade",
    "10th Grade",
    "11th Grade",
    "12th Grade",
    "College / Test Prep"
  ];

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!topic.trim()) {
      setErrorMessage("Please specify a topic or skill focus for the lesson plan.");
      return;
    }

    setIsGenerating(true);
    setErrorMessage("");
    setSuccessMessage("");
    setGeneratedPlan(null);

    const steps = [
      "Analyzing educational standards and student level...",
      "Mapping custom warm-up scaffolding...",
      "Synthesizing structured direct instructions...",
      "Drafting independent practice & exit checks...",
      "Injecting character development prompts...",
      "Finalizing comprehensive lesson blueprint..."
    ];

    let currentStepIndex = 0;
    setGenerationStep(steps[0]);
    const stepInterval = setInterval(() => {
      currentStepIndex++;
      if (currentStepIndex < steps.length) {
        setGenerationStep(steps[currentStepIndex]);
      }
    }, 1500);

    try {
      const response = await apiFetch("http://localhost:5000/api/ai/generate-lesson-plan", {
        method: "POST",
        body: JSON.stringify({
          studentId: selectedStudent || null,
          gradeLevel,
          subject,
          topic: topic.trim(),
          duration,
          learningObjective: learningObjective.trim() || undefined,
          difficulty,
          includeHomework,
          includeAssessment,
          includeCharacterEducation
        })
      });

      clearInterval(stepInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to communicate with lesson planner AI engine.");
      }

      const data = await response.json();
      if (data.status === "Success" && data.lessonPlan) {
        setGeneratedPlan(data.lessonPlan);
        setGenerationSource(data.source === "GEMINI_API" ? "Gemini 2.5 Flash (Live AI)" : "Ambience Offline Rule-Engine (Fallback)");
      } else {
        throw new Error("Invalid response format received from lesson planner.");
      }
    } catch (err) {
      clearInterval(stepInterval);
      console.error("[AI Lesson Planner] Execution failed:", err);
      setErrorMessage(err.message || "An unexpected error occurred during lesson plan generation.");
    } finally {
      setIsGenerating(false);
      setGenerationStep("");
    }
  };

  const handleSavePlan = async () => {
    if (!generatedPlan) return;
    try {
      const config = {
        includeHomework,
        includeAssessment,
        includeCharacterEducation
      };

      const success = await addLessonPlan(
        selectedStudent || null,
        generatedPlan.lessonTitle,
        gradeLevel,
        subject,
        topic.trim(),
        duration,
        learningObjective.trim() || generatedPlan.objectives,
        difficulty,
        config,
        generatedPlan
      );

      if (success) {
        const studentObj = students.find((s) => s.id === selectedStudent);
        const target = studentObj ? studentObj.name : "Roster learning registry";
        setSuccessMessage(`✓ Lesson plan "${generatedPlan.lessonTitle}" successfully synchronized to database for ${target}!`);
        setTimeout(() => setSuccessMessage(""), 4000);
      } else {
        throw new Error("Database error occurred while saving the lesson plan.");
      }
    } catch (err) {
      setErrorMessage(err.message || "Unable to save lesson plan to roster.");
    }
  };

  return (
    <div className="ai-planner-wrapper">
      <div className="panel-card" style={{ marginBottom: "24px" }}>
        <div className="panel-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 style={{ display: "flex", alignItems: "center", gap: "8px", margin: 0 }}>
              <Sparkles size={20} style={{ color: "var(--turquoise-accent)" }} />
              AI Lesson Planner™ <span className="premium-label" style={{ fontSize: "10px", padding: "2px 6px", background: "rgba(168, 85, 247, 0.15)", color: "#c084fc", border: "1px solid rgba(168, 85, 247, 0.3)", borderRadius: "20px" }}>v2.0 Beta</span>
            </h3>
            <p style={{ margin: "4px 0 0 0" }}>Engineered pedagogical plans tailored precisely to students' goals and unique character attributes.</p>
          </div>
          <span style={{ fontSize: "24px" }}>📚</span>
        </div>

        {errorMessage && (
          <div className="error-banner animate-scale-up" style={{ padding: "12px", background: "rgba(239, 68, 68, 0.12)", color: "#f87171", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: "8px", margin: "1rem 0" }}>
            <strong>Issue Encountered:</strong> {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="success-banner animate-scale-up" style={{ padding: "12px", background: "rgba(23, 233, 206, 0.12)", color: "var(--turquoise-accent)", border: "1px solid rgba(23, 233, 206, 0.2)", borderRadius: "8px", margin: "1rem 0" }}>
            {successMessage}
          </div>
        )}

        <form onSubmit={handleGenerate} className="tutor-action-form" style={{ marginTop: "1.5rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
            
            {/* Student selection */}
            <div className="form-group">
              <label style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <User size={12} /> Target Student (Optional)
              </label>
              <select value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)}>
                <option value="">-- Sandbox Mode (No Student Associated) --</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.grade})
                  </option>
                ))}
              </select>
            </div>

            {/* Subject */}
            <div className="form-group">
              <label style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <BookOpen size={12} /> Course Subject
              </label>
              <select value={subject} onChange={(e) => setSubject(e.target.value)}>
                {SUBJECTS.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>

            {/* Grade level */}
            <div className="form-group">
              <label style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <GraduationCap size={12} /> Grade level
              </label>
              <select value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)}>
                {gradeLevels.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl}
                  </option>
                ))}
              </select>
            </div>

            {/* Duration */}
            <div className="form-group">
              <label style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Clock size={12} /> Class Duration
              </label>
              <select value={duration} onChange={(e) => setDuration(e.target.value)}>
                <option value="30 minutes">30 minutes</option>
                <option value="45 minutes">45 minutes</option>
                <option value="60 minutes">60 minutes</option>
                <option value="90 minutes">90 minutes</option>
                <option value="120 minutes">120 minutes</option>
              </select>
            </div>

          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "16px", marginTop: "16px" }}>
            
            {/* Topic / Concepts */}
            <div className="form-group">
              <label style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Compass size={12} /> Lesson Topic or Skills Focus *
              </label>
              <input
                type="text"
                required
                placeholder="E.g., Trigonometric identities, Phonics consonant blends, Cold War timeline, Essay thesis statements"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                style={{ width: "100%", background: "#0c0f33", border: "1px solid #2e3573", color: "#fff", padding: "10px", borderRadius: "6px" }}
              />
            </div>

            {/* Difficulty */}
            <div className="form-group">
              <label style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Gauge size={12} /> Target Difficulty Level
              </label>
              <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                <option value="Beginner / Intro">Beginner / Intro</option>
                <option value="Medium / Standard">Medium / Standard</option>
                <option value="Advanced / Honors">Advanced / Honors</option>
                <option value="Remedial / Review">Remedial / Review</option>
              </select>
            </div>

          </div>

          {/* Optional learning objective */}
          <div className="form-group" style={{ marginTop: "16px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Brain size={12} /> Custom Learning Objective (Optional)
            </label>
            <input
              type="text"
              placeholder="E.g., Understand double angle formula derivation. Leave blank for automated formulation."
              value={learningObjective}
              onChange={(e) => setLearningObjective(e.target.value)}
              style={{ width: "100%", background: "#0c0f33", border: "1px solid #2e3573", color: "#fff", padding: "10px", borderRadius: "6px" }}
            />
          </div>

          {/* Core Configuration Toggles */}
          <div style={{ marginTop: "1.5rem", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "1.2rem" }}>
            <p style={{ fontSize: "11px", textTransform: "uppercase", color: "var(--text-slate)", fontWeight: "bold", letterSpacing: "1px", marginBottom: "12px" }}>
              📋 Module Outputs Config
            </p>
            
            <div style={{ display: "flex", flexWrap: "wrap", gap: "24px" }}>
              <label className="checkbox-label" style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", color: "#fff", fontSize: "13px" }}>
                <input
                  type="checkbox"
                  checked={includeHomework}
                  onChange={(e) => setIncludeHomework(e.target.checked)}
                  style={{ accentColor: "var(--turquoise-accent)" }}
                />
                Include Reinforcing Homework
              </label>

              <label className="checkbox-label" style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", color: "#fff", fontSize: "13px" }}>
                <input
                  type="checkbox"
                  checked={includeAssessment}
                  onChange={(e) => setIncludeAssessment(e.target.checked)}
                  style={{ accentColor: "var(--turquoise-accent)" }}
                />
                Include Formative Assessment (Exit Ticket)
              </label>

              <label className="checkbox-label" style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", color: "#fff", fontSize: "13px" }}>
                <input
                  type="checkbox"
                  checked={includeCharacterEducation}
                  onChange={(e) => setIncludeCharacterEducation(e.target.checked)}
                  style={{ accentColor: "var(--turquoise-accent)" }}
                />
                Weave Character Education Virtues
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={isGenerating}
            className="btn-primary-glowing"
            style={{ width: "100%", justifyContent: "center", marginTop: "1.5rem" }}
          >
            {isGenerating ? (
              <>
                <div className="spinner" style={{ width: "16px", height: "16px", border: "2px solid rgba(255,255,255,0.1)", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 1s linear infinite", marginRight: "8px" }} />
                <span>{generationStep}</span>
              </>
            ) : (
              <>
                <Sparkles size={14} className="btn-icon" style={{ marginRight: "6px" }} />
                <span>Generate High-Fidelity Lesson Plan</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Generated Plan Output Block */}
      {generatedPlan && (
        <div className="panel-card animate-scale-up" style={{ border: "1px solid rgba(23, 233, 206, 0.25)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "1rem" }}>
            <div>
              <span className="online-capsule" style={{ background: "rgba(23, 233, 206, 0.12)", color: "var(--turquoise-accent)", fontSize: "11px" }}>
                ✨ {generationSource}
              </span>
              <h3 style={{ margin: "8px 0 0 0", color: "#fff" }}>{generatedPlan.lessonTitle}</h3>
            </div>
            
            <button
              onClick={handleSavePlan}
              className="btn-primary-glowing"
              style={{ background: "linear-gradient(135deg, #10b981, #059669)", fontSize: "12px", padding: "8px 16px" }}
            >
              <Save size={13} style={{ marginRight: "4px" }} />
              <span>Save Plan to Roster</span>
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="dashboard-tabs-header-row" style={{ marginTop: "1.5rem", marginBottom: "1rem", background: "rgba(255,255,255,0.02)", borderRadius: "8px", padding: "4px" }}>
            <button
              className={`dashboard-tab-trigger ${activePreviewTab === "outline" ? "active" : ""}`}
              onClick={() => setActivePreviewTab("outline")}
              style={{ padding: "8px 16px", fontSize: "12px", border: "none" }}
            >
              <Compass size={12} style={{ marginRight: "4px" }} /> Lesson Overview
            </button>
            <button
              className={`dashboard-tab-trigger ${activePreviewTab === "teacher" ? "active" : ""}`}
              onClick={() => setActivePreviewTab("teacher")}
              style={{ padding: "8px 16px", fontSize: "12px", border: "none" }}
            >
              <Sliders size={12} style={{ marginRight: "4px" }} /> Teacher Guide & Notes
            </button>
            <button
              className={`dashboard-tab-trigger ${activePreviewTab === "content" ? "active" : ""}`}
              onClick={() => setActivePreviewTab("content")}
              style={{ padding: "8px 16px", fontSize: "12px", border: "none" }}
            >
              <FileText size={12} style={{ marginRight: "4px" }} /> Full Pedagogical Steps
            </button>
          </div>

          {/* Tab Contents */}
          <div className="plan-preview-box" style={{ background: "rgba(0,0,0,0.2)", borderRadius: "10px", padding: "20px", border: "1px solid rgba(255,255,255,0.03)" }}>
            
            {activePreviewTab === "outline" && (
              <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <h5 style={{ color: "var(--turquoise-accent)", textTransform: "uppercase", margin: "0 0 6px 0", fontSize: "11px", letterSpacing: "1px" }}>
                    Learning Objectives
                  </h5>
                  <p style={{ margin: 0, color: "#e2e8f0", fontSize: "14px", lineHeight: "1.6" }}>{generatedPlan.objectives}</p>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "16px" }}>
                  <div>
                    <h5 style={{ color: "#c084fc", textTransform: "uppercase", margin: "0 0 6px 0", fontSize: "11px", letterSpacing: "1px" }}>
                      Target Group & Difficulty
                    </h5>
                    <p style={{ margin: 0, color: "#fff", fontSize: "13px" }}>
                      {gradeLevel} • {subject} ({difficulty})
                    </p>
                  </div>
                  <div>
                    <h5 style={{ color: "var(--gold-faith)", textTransform: "uppercase", margin: "0 0 6px 0", fontSize: "11px", letterSpacing: "1px" }}>
                      Estimated Class Time
                    </h5>
                    <p style={{ margin: 0, color: "#fff", fontSize: "13px" }}>{duration}</p>
                  </div>
                </div>

                {generatedPlan.differentiationNotes && (
                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "16px" }}>
                    <h5 style={{ color: "var(--gold-faith)", textTransform: "uppercase", margin: "0 0 6px 0", fontSize: "11px", letterSpacing: "1px", display: "flex", alignItems: "center", gap: "4px" }}>
                      <Lightbulb size={12} /> Differentiation & Accommodations
                    </h5>
                    <p style={{ margin: 0, color: "#cbd5e1", fontSize: "13px", lineHeight: "1.6", whiteSpace: "pre-line" }}>{generatedPlan.differentiationNotes}</p>
                  </div>
                )}
              </div>
            )}

            {activePreviewTab === "teacher" && (
              <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <h5 style={{ color: "var(--turquoise-accent)", textTransform: "uppercase", margin: "0 0 6px 0", fontSize: "11px", letterSpacing: "1px" }}>
                    Step-by-Step Teacher Guide
                  </h5>
                  <p style={{ margin: 0, color: "#e2e8f0", fontSize: "13.5px", lineHeight: "1.7", whiteSpace: "pre-line" }}>
                    {generatedPlan.teacherGuide}
                  </p>
                </div>

                {generatedPlan.homework && (
                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "16px" }}>
                    <h5 style={{ color: "#c084fc", textTransform: "uppercase", margin: "0 0 6px 0", fontSize: "11px", letterSpacing: "1px", display: "flex", alignItems: "center", gap: "4px" }}>
                      <Award size={12} /> Assigned Homework Block
                    </h5>
                    <p style={{ margin: 0, color: "#e2e8f0", fontSize: "13px", lineHeight: "1.6", whiteSpace: "pre-line" }}>{generatedPlan.homework}</p>
                  </div>
                )}
              </div>
            )}

            {activePreviewTab === "content" && (
              <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                
                {/* Warm-Up */}
                <div>
                  <h5 style={{ color: "var(--gold-faith)", textTransform: "uppercase", margin: "0 0 6px 0", fontSize: "11px", letterSpacing: "1px" }}>
                    🚀 1. Hook & Warm-Up Activity
                  </h5>
                  <p style={{ margin: 0, color: "#e2e8f0", fontSize: "13px", lineHeight: "1.6", whiteSpace: "pre-line" }}>{generatedPlan.warmUp}</p>
                </div>

                {/* Direct Instruction */}
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "16px" }}>
                  <h5 style={{ color: "var(--turquoise-accent)", textTransform: "uppercase", margin: "0 0 6px 0", fontSize: "11px", letterSpacing: "1px" }}>
                    📖 2. Direct Instruction
                  </h5>
                  <p style={{ margin: 0, color: "#e2e8f0", fontSize: "13px", lineHeight: "1.6", whiteSpace: "pre-line" }}>{generatedPlan.directInstruction}</p>
                </div>

                {/* Guided Practice */}
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "16px" }}>
                  <h5 style={{ color: "#c084fc", textTransform: "uppercase", margin: "0 0 6px 0", fontSize: "11px", letterSpacing: "1px" }}>
                    🤝 3. Guided Practice
                  </h5>
                  <p style={{ margin: 0, color: "#e2e8f0", fontSize: "13px", lineHeight: "1.6", whiteSpace: "pre-line" }}>{generatedPlan.guidedPractice}</p>
                </div>

                {/* Independent Practice */}
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "16px" }}>
                  <h5 style={{ color: "#38bdf8", textTransform: "uppercase", margin: "0 0 6px 0", fontSize: "11px", letterSpacing: "1px" }}>
                    📝 4. Independent Student Practice
                  </h5>
                  <p style={{ margin: 0, color: "#e2e8f0", fontSize: "13px", lineHeight: "1.6", whiteSpace: "pre-line" }}>{generatedPlan.independentPractice}</p>
                </div>

                {/* Exit Ticket */}
                {generatedPlan.exitTicket && (
                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "16px" }}>
                    <h5 style={{ color: "#f43f5e", textTransform: "uppercase", margin: "0 0 6px 0", fontSize: "11px", letterSpacing: "1px" }}>
                      🏁 5. Exit Ticket / Assessment
                    </h5>
                    <p style={{ margin: 0, color: "#e2e8f0", fontSize: "13px", lineHeight: "1.6", whiteSpace: "pre-line" }}>{generatedPlan.exitTicket}</p>
                  </div>
                )}

              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
