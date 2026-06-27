import React, { useState, useContext, useEffect } from "react";
import { AppContext } from "../../context/AppContext";
import {
  Sparkles,
  User,
  CheckCircle,
  FileText,
  Save,
  Brain,
  ListPlus,
  Compass,
  Award,
  BookMarked,
  ShieldCheck,
  ClipboardList,
  HeartHandshake
} from "lucide-react";

export default function AiIepAssistant() {
  const { students, addIepNote, apiFetch } = useContext(AppContext);

  // Form states
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [strengths, setStrengths] = useState("");
  const [challenges, setChallenges] = useState("");
  const [currentGoals, setCurrentGoals] = useState("");

  // UX states
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState("");
  const [generatedReport, setGeneratedReport] = useState(null);
  const [generationSource, setGenerationSource] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [activeTab, setActiveTab] = useState("profile"); // profile, accommodations, goals, family

  // Auto-populate when student selection changes
  useEffect(() => {
    if (selectedStudentId) {
      const student = students.find((s) => s.id === selectedStudentId);
      if (student) {
        // Pre-fill fields with student context if available
        setStrengths(`Intrinsically motivated. Excellent verbal communication. Highly creative.`);
        setChallenges(`Struggles with focus during long computational math strings or multi-step word problems.`);
        
        const existingGoals = student.iepGoals?.map((g) => g.text).join("; ") || "";
        setCurrentGoals(existingGoals || "Build double-checking habits and focus.");
      }
    } else {
      setStrengths("");
      setChallenges("");
      setCurrentGoals("");
    }
  }, [selectedStudentId, students]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!selectedStudentId) {
      setErrorMessage("Please select a target student first.");
      return;
    }
    if (!strengths.trim() || !challenges.trim()) {
      setErrorMessage("Please provide brief summaries for student strengths and challenges.");
      return;
    }

    setIsGenerating(true);
    setErrorMessage("");
    setSuccessMessage("");
    setGeneratedReport(null);

    const steps = [
      "Reviewing student IEP constraints and historical metrics...",
      "Formulating behavioral & academic accommodation suggestions...",
      "Drafting specific SMART learning milestones...",
      "Designing weekly tracking and progress rules...",
      "Synthesizing parent-friendly encouraging review...",
      "Compiling actionable tutor checklist guidelines..."
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
      const selectedStudentObj = students.find((s) => s.id === selectedStudentId);
      const studentName = selectedStudentObj ? selectedStudentObj.name : "Student";

      const response = await apiFetch("http://localhost:5000/api/ai/generate-iep-notes", {
        method: "POST",
        body: JSON.stringify({
          studentId: selectedStudentId,
          studentName,
          strengths: strengths.trim(),
          challenges: challenges.trim(),
          currentGoals: currentGoals.trim()
        })
      });

      clearInterval(stepInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to communicate with IEP AI engine.");
      }

      const data = await response.json();
      if (data.status === "Success" && data.iepReport) {
        setGeneratedReport(data.iepReport);
        setGenerationSource(data.source === "GEMINI_API" ? "Gemini 2.5 Flash (Live AI)" : "Ambience Offline Rule-Engine (Fallback)");
      } else {
        throw new Error("Invalid response format received from IEP Assistant.");
      }
    } catch (err) {
      clearInterval(stepInterval);
      console.error("[AI IEP Assistant] Execution failed:", err);
      setErrorMessage(err.message || "An unexpected error occurred during IEP report generation.");
    } finally {
      setIsGenerating(false);
      setGenerationStep("");
    }
  };

  const handleSaveReport = async () => {
    if (!generatedReport || !selectedStudentId) return;
    try {
      const success = await addIepNote(
        selectedStudentId,
        generatedReport.strengths,
        generatedReport.challenges,
        generatedReport.accommodationSuggestions,
        generatedReport.goalDrafting,
        generatedReport.progressNotes,
        generatedReport.parentSummary,
        generatedReport.tutorSteps
      );

      if (success) {
        const studentObj = students.find((s) => s.id === selectedStudentId);
        setSuccessMessage(`✓ IEP support session note for ${studentObj?.name} successfully synchronized to database!`);
        setTimeout(() => setSuccessMessage(""), 4000);
      } else {
        throw new Error("Database update failed while logging IEP notes.");
      }
    } catch (err) {
      setErrorMessage(err.message || "Unable to save IEP note to roster.");
    }
  };

  return (
    <div className="ai-iep-wrapper">
      <div className="panel-card" style={{ marginBottom: "24px" }}>
        <div className="panel-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 style={{ display: "flex", alignItems: "center", gap: "8px", margin: 0 }}>
              <ShieldCheck size={20} style={{ color: "var(--turquoise-accent)" }} />
              AI IEP Assistant™ <span className="premium-label" style={{ fontSize: "10px", padding: "2px 6px", background: "rgba(16, 185, 129, 0.15)", color: "#34d399", border: "1px solid rgba(16, 185, 129, 0.3)", borderRadius: "20px" }}>v2.0 Beta</span>
            </h3>
            <p style={{ margin: "4px 0 0 0" }}>Formulate professional special education accommodations, track goals, and generate parent communications in seconds.</p>
          </div>
          <span style={{ fontSize: "24px" }}>📋</span>
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
          
          {/* Student Select */}
          <div className="form-group" style={{ marginBottom: "16px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <User size={12} /> Target Student *
            </label>
            <select
              required
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
            >
              <option value="">-- Choose Student to Fetch IEP Context --</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.grade})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            
            {/* Student Strengths */}
            <div className="form-group">
              <label>Student Strengths / Motivators *</label>
              <textarea
                required
                rows="3"
                placeholder="What does the student excel at or enjoy? (e.g. eager reader, strong conceptualizer)"
                value={strengths}
                onChange={(e) => setStrengths(e.target.value)}
                style={{ width: "100%", background: "#0c0f33", border: "1px solid #2e3573", color: "#fff", padding: "10px", borderRadius: "6px", fontSize: "13px", resize: "none" }}
              />
            </div>

            {/* Student Challenges */}
            <div className="form-group">
              <label>Learning Challenges / Distractors *</label>
              <textarea
                required
                rows="3"
                placeholder="What holds them back? (e.g. gets frustrated easily, struggles with calculations)"
                value={challenges}
                onChange={(e) => setChallenges(e.target.value)}
                style={{ width: "100%", background: "#0c0f33", border: "1px solid #2e3573", color: "#fff", padding: "10px", borderRadius: "6px", fontSize: "13px", resize: "none" }}
              />
            </div>

          </div>

          {/* Goals / Foci */}
          <div className="form-group" style={{ marginTop: "16px" }}>
            <label>Current Goals or Interventions (Optional)</label>
            <input
              type="text"
              placeholder="E.g., Complete math worksheets without visual outbursts; double check work"
              value={currentGoals}
              onChange={(e) => setCurrentGoals(e.target.value)}
              style={{ width: "100%", background: "#0c0f33", border: "1px solid #2e3573", color: "#fff", padding: "10px", borderRadius: "6px" }}
            />
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
                <span>Generate IEP Strategies & Goals</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Generated IEP Note View */}
      {generatedReport && (
        <div className="panel-card animate-scale-up" style={{ border: "1px solid rgba(16, 185, 129, 0.25)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "1rem" }}>
            <div>
              <span className="online-capsule" style={{ background: "rgba(16, 185, 129, 0.12)", color: "#10b981", fontSize: "11px" }}>
                ✨ {generationSource}
              </span>
              <h3 style={{ margin: "8px 0 0 0", color: "#fff" }}>
                IEP Support Summary: {students.find((s) => s.id === selectedStudentId)?.name}
              </h3>
            </div>

            <button
              onClick={handleSaveReport}
              className="btn-primary-glowing"
              style={{ background: "linear-gradient(135deg, #10b981, #059669)", fontSize: "12px", padding: "8px 16px" }}
            >
              <Save size={13} style={{ marginRight: "4px" }} />
              <span>Save to Roster & Database</span>
            </button>
          </div>

          {/* Tabs Navigation */}
          <div className="dashboard-tabs-header-row" style={{ marginTop: "1.5rem", marginBottom: "1rem", background: "rgba(255,255,255,0.02)", borderRadius: "8px", padding: "4px" }}>
            <button
              className={`dashboard-tab-trigger ${activeTab === "profile" ? "active" : ""}`}
              onClick={() => setActiveTab("profile")}
              style={{ padding: "8px 16px", fontSize: "12px", border: "none" }}
            >
              <Brain size={12} style={{ marginRight: "4px" }} /> Cognitive Profile
            </button>
            <button
              className={`dashboard-tab-trigger ${activeTab === "accommodations" ? "active" : ""}`}
              onClick={() => setActiveTab("accommodations")}
              style={{ padding: "8px 16px", fontSize: "12px", border: "none" }}
            >
              <ClipboardList size={12} style={{ marginRight: "4px" }} /> Accommodations
            </button>
            <button
              className={`dashboard-tab-trigger ${activeTab === "goals" ? "active" : ""}`}
              onClick={() => setActiveTab("goals")}
              style={{ padding: "8px 16px", fontSize: "12px", border: "none" }}
            >
              <Award size={12} style={{ marginRight: "4px" }} /> SMART Goal Drafting
            </button>
            <button
              className={`dashboard-tab-trigger ${activeTab === "family" ? "active" : ""}`}
              onClick={() => setActiveTab("family")}
              style={{ padding: "8px 16px", fontSize: "12px", border: "none" }}
            >
              <HeartHandshake size={12} style={{ marginRight: "4px" }} /> Parent & Tutor Action Steps
            </button>
          </div>

          {/* Tab Content Display */}
          <div className="plan-preview-box" style={{ background: "rgba(0,0,0,0.2)", borderRadius: "10px", padding: "20px", border: "1px solid rgba(255,255,255,0.03)" }}>
            
            {activeTab === "profile" && (
              <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <h5 style={{ color: "#34d399", textTransform: "uppercase", margin: "0 0 6px 0", fontSize: "11px", letterSpacing: "1px" }}>
                    Student Cognitive Strengths
                  </h5>
                  <p style={{ margin: 0, color: "#e2e8f0", fontSize: "14px", lineHeight: "1.6" }}>{generatedReport.strengths}</p>
                </div>

                <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "16px" }}>
                  <h5 style={{ color: "#f87171", textTransform: "uppercase", margin: "0 0 6px 0", fontSize: "11px", letterSpacing: "1px" }}>
                    Behavioral & Academic Challenges
                  </h5>
                  <p style={{ margin: 0, color: "#e2e8f0", fontSize: "14px", lineHeight: "1.6" }}>{generatedReport.challenges}</p>
                </div>
              </div>
            )}

            {activeTab === "accommodations" && (
              <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <h5 style={{ color: "var(--turquoise-accent)", textTransform: "uppercase", margin: "0 0 6px 0", fontSize: "11px", letterSpacing: "1px" }}>
                    Customized Classroom Accommodations
                  </h5>
                  <p style={{ margin: 0, color: "#e2e8f0", fontSize: "13.5px", lineHeight: "1.7", whiteSpace: "pre-line" }}>
                    {generatedReport.accommodationSuggestions}
                  </p>
                </div>
              </div>
            )}

            {activeTab === "goals" && (
              <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <h5 style={{ color: "var(--gold-faith)", textTransform: "uppercase", margin: "0 0 6px 0", fontSize: "11px", letterSpacing: "1px" }}>
                    SMART Goal Drafts (Measurable Milestones)
                  </h5>
                  <p style={{ margin: 0, color: "#e2e8f0", fontSize: "13.5px", lineHeight: "1.7", whiteSpace: "pre-line" }}>
                    {generatedReport.goalDrafting}
                  </p>
                </div>

                <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "16px" }}>
                  <h5 style={{ color: "#a78bfa", textTransform: "uppercase", margin: "0 0 6px 0", fontSize: "11px", letterSpacing: "1px" }}>
                    Progress Monitoring & Tracking Notes
                  </h5>
                  <p style={{ margin: 0, color: "#cbd5e1", fontSize: "13px", lineHeight: "1.6", whiteSpace: "pre-line" }}>
                    {generatedReport.progressNotes}
                  </p>
                </div>
              </div>
            )}

            {activeTab === "family" && (
              <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <h5 style={{ color: "var(--turquoise-accent)", textTransform: "uppercase", margin: "0 0 6px 0", fontSize: "11px", letterSpacing: "1px" }}>
                    Parent-Friendly Summary & Partnership Actions
                  </h5>
                  <p style={{ margin: 0, color: "#e2e8f0", fontSize: "13.5px", lineHeight: "1.7", whiteSpace: "pre-line" }}>
                    {generatedReport.parentSummary}
                  </p>
                </div>

                <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "16px" }}>
                  <h5 style={{ color: "#38bdf8", textTransform: "uppercase", margin: "0 0 6px 0", fontSize: "11px", letterSpacing: "1px" }}>
                    Tutor Action Steps & Focus Instructions
                  </h5>
                  <p style={{ margin: 0, color: "#cbd5e1", fontSize: "13px", lineHeight: "1.6", whiteSpace: "pre-line" }}>
                    {generatedReport.tutorSteps}
                  </p>
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
