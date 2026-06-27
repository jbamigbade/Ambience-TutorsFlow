import React, { useState, useContext, useEffect } from "react";
import { AppContext } from "../../context/AppContext";
import {
  Sparkles,
  User,
  CheckCircle,
  FileText,
  Save,
  Brain,
  Lightbulb,
  Compass,
  HelpCircle,
  AlertTriangle,
  History,
  GraduationCap,
  BookOpen,
  Eye,
  CheckSquare,
  ShieldAlert,
  MonitorPlay,
  Heart,
  Activity
} from "lucide-react";

export default function AiParentCopilot() {
  const { students, addParentCopilotRecord, apiFetch, parentCopilotRecords } = useContext(AppContext);

  // Form states
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [subject, setSubject] = useState("Mathematics");
  const [topic, setTopic] = useState("");
  const [currentAssignment, setCurrentAssignment] = useState("");
  const [parentConcern, setParentConcern] = useState("");
  const [supportType, setSupportType] = useState("At-home coaching");

  // UX states
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState("");
  const [generatedOutput, setGeneratedOutput] = useState(null);
  const [generationSource, setGenerationSource] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [activeTab, setActiveTab] = useState("explanations"); // explanations, practice, discussions, reflections
  const [showHistory, setShowHistory] = useState(false);

  // Auto-populate student detail defaults
  useEffect(() => {
    if (selectedStudentId) {
      const student = students.find((s) => s.id === selectedStudentId);
      if (student) {
        setParentConcern("Needs reassurance. Easily frustrated when initial calculation steps are incorrect.");
        setCurrentAssignment("Unit 2 Homework Assignment");
      }
    } else {
      setParentConcern("");
      setCurrentAssignment("");
    }
  }, [selectedStudentId, students]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!topic.trim()) {
      setErrorMessage("Please specify a target topic first.");
      return;
    }

    setIsGenerating(true);
    setErrorMessage("");
    setSuccessMessage("");
    setGeneratedOutput(null);

    const steps = [
      "Analyzing student profile and at-home learning context...",
      "Drafting parent-friendly conceptual analogies...",
      "Formulating homework support guidance (building student autonomy)...",
      "Designing interactive at-home review drills...",
      "Composing confidence-boosting student encouragement cards...",
      "Structuring dialogue lists for the tutor and student...",
      "Synthesizing Christian character and Bible study reflections...",
      "Adding custom adaptive IEP-friendly support triggers..."
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

      const response = await apiFetch("http://localhost:5000/api/ai/generate-parent-copilot", {
        method: "POST",
        body: JSON.stringify({
          studentId: selectedStudentId || null,
          studentName,
          subject,
          topic: topic.trim(),
          currentAssignment: currentAssignment.trim(),
          parentConcern: parentConcern.trim(),
          supportType
        })
      });

      clearInterval(stepInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to communicate with Parent Copilot AI engine.");
      }

      const data = await response.json();
      if (data.status === "Success" && data.copilotOutput) {
        setGeneratedOutput(data.copilotOutput);
        setGenerationSource(data.source === "GEMINI_API" ? "Gemini 2.5 Flash (Live AI)" : "Ambience Offline Rule-Engine (Fallback)");
      } else {
        throw new Error("Invalid response format received from Parent Copilot.");
      }
    } catch (err) {
      clearInterval(stepInterval);
      console.error("[AI Parent Copilot] Execution failed:", err);
      setErrorMessage(err.message || "An unexpected error occurred during Copilot execution.");
    } finally {
      setIsGenerating(false);
      setGenerationStep("");
    }
  };

  const handleSaveOutput = async () => {
    if (!generatedOutput) return;
    try {
      const success = await addParentCopilotRecord(
        selectedStudentId || null,
        subject,
        topic.trim(),
        currentAssignment.trim(),
        parentConcern.trim(),
        supportType,
        generatedOutput
      );

      if (success) {
        setSuccessMessage("✓ Parent assistance assets successfully synchronized to your academic database!");
        setTimeout(() => setSuccessMessage(""), 4000);
      } else {
        throw new Error("Database update failed while logging parent copilot records.");
      }
    } catch (err) {
      console.error("[AI Parent Copilot] Saving failed:", err);
      setErrorMessage(err.message || "Failed to save parent copilot records.");
    }
  };

  // Get matching subject icon
  const getSubjectIcon = (sub) => {
    const s = sub.toLowerCase();
    if (s.includes("math") || s.includes("calculus") || s.includes("algebra")) return <GraduationCap className="icon-gold" />;
    if (s.includes("science") || s.includes("physics") || s.includes("chem")) return <Brain className="icon-blue" />;
    if (s.includes("english") || s.includes("language") || s.includes("ela")) return <BookOpen className="icon-green" />;
    if (s.includes("history") || s.includes("social")) return <Compass className="icon-indigo" />;
    if (s.includes("bible")) return <Heart className="icon-pink" style={{ color: "var(--accent-pink)" }} />;
    if (s.includes("computer") || s.includes("tech")) return <MonitorPlay className="icon-blue" />;
    if (s.includes("physical") || s.includes("health")) return <Activity className="icon-gold" />;
    return <Sparkles className="icon-purple" />;
  };

  return (
    <div className="dashboard-view fade-in">
      <div className="view-header">
        <div>
          <span className="badge-tag"><Sparkles size={12} /> AI Parent Assistant</span>
          <h1 className="view-title text-gradient">AI Parent Copilot™</h1>
          <p className="view-subtitle">
            Get instant at-home homework coaching, interactive practice plans, encouragement messages, and specialized IEP guidelines.
          </p>
        </div>
        <button
          className="btn-secondary"
          onClick={() => setShowHistory(!showHistory)}
        >
          <History size={16} /> {showHistory ? "Back to Copilot" : "View Copilot Log"}
        </button>
      </div>

      {successMessage && (
        <div className="alert-box success-alert">
          <CheckCircle size={18} />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="alert-box error-alert">
          <AlertTriangle size={18} />
          <span>{errorMessage}</span>
        </div>
      )}

      {showHistory ? (
        // HISTORY VIEW LOGS
        <div className="glass-card table-card">
          <div className="card-header">
            <h2 className="card-title">Saved Parent Copilot Assistances</h2>
            <p className="card-subtitle">Previous at-home support runs saved by parents</p>
          </div>
          <div className="table-responsive">
            {parentCopilotRecords.length === 0 ? (
              <div className="empty-state">
                <History size={48} className="empty-icon" />
                <h3>No Parent Copilot Runs Logged</h3>
                <p>Your generated at-home assistances will appear here once saved.</p>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Subject & Topic</th>
                    <th>Student & Assignment</th>
                    <th>Support Type</th>
                    <th>Created At</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {parentCopilotRecords.map((rec) => {
                    const studentObj = students.find((s) => s.id === rec.studentId);
                    return (
                      <tr key={rec.id}>
                        <td>
                          <div className="cell-with-icon">
                            {getSubjectIcon(rec.subject)}
                            <div>
                              <div className="font-semibold">{rec.topic}</div>
                              <div className="text-xs text-muted">{rec.subject}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="font-semibold">{studentObj ? studentObj.name : "General (No Student)"}</div>
                          <div className="text-xs text-muted">{rec.currentAssignment || "No assignment specified"}</div>
                        </td>
                        <td>
                          <span className="badge badge-accent">{rec.supportType}</span>
                        </td>
                        <td className="text-xs text-muted">
                          {new Date(rec.createdAt).toLocaleDateString()} at {new Date(rec.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td>
                          <button
                            className="btn-icon"
                            onClick={() => {
                              setGeneratedOutput(rec.content);
                              setSubject(rec.subject);
                              setTopic(rec.topic);
                              setSelectedStudentId(rec.studentId || "");
                              setParentConcern(rec.parentConcern || "");
                              setSupportType(rec.supportType || "At-home coaching");
                              setCurrentAssignment(rec.currentAssignment || "");
                              setShowHistory(false);
                            }}
                            title="Load to Workspace"
                          >
                            <Eye size={16} /> Load
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      ) : (
        // MAIN WORKSPACE INTERFACE
        <div className="grid-2col">
          {/* CONFIGURATION PANEL */}
          <div className="glass-card">
            <div className="card-header">
              <h2 className="card-title">At-Home Learning Context</h2>
              <p className="card-subtitle">Provide details about your child's topic, homework, and current challenges</p>
            </div>
            <form onSubmit={handleGenerate} className="card-form">
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="student-select">Student (Optional)</label>
                  <select
                    id="student-select"
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                  >
                    <option value="">-- General / Non-Specific Student --</option>
                    {students.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.name} ({st.gradeLevel || "K-12"})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="subject-select">Subject Category</label>
                  <select
                    id="subject-select"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  >
                    <option value="Mathematics">Mathematics</option>
                    <option value="Science">Science</option>
                    <option value="English / Language Arts">English / Language Arts</option>
                    <option value="History / Social Studies">History / Social Studies</option>
                    <option value="Bible Study">Bible Study</option>
                    <option value="Computer / Technology">Computer / Technology</option>
                    <option value="Physical Education / Health">Physical Education / Health</option>
                    <option value="SAT">SAT</option>
                    <option value="ACT">ACT</option>
                    <option value="EOG">EOG</option>
                    <option value="IOWA">IOWA</option>
                  </select>
                </div>

                <div className="form-group full-width">
                  <label htmlFor="topic-input">Target Topic / Concept</label>
                  <input
                    id="topic-input"
                    type="text"
                    placeholder="e.g. Fraction Division, Photosynthesis, Comma Splices, Psalm 23"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="assignment-input">Current Assignment or Test Prep Context</label>
                  <input
                    id="assignment-input"
                    type="text"
                    placeholder="e.g. Worksheet 5, SAT Diagnostic Chapter 2, Chapter 4 practice test"
                    value={currentAssignment}
                    onChange={(e) => setCurrentAssignment(e.target.value)}
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="support-select">Primary Support Type Focus</label>
                  <select
                    id="support-select"
                    value={supportType}
                    onChange={(e) => setSupportType(e.target.value)}
                  >
                    <option value="At-home coaching">At-Home Homework Coaching (Recommended)</option>
                    <option value="Socratic dialogue guide">Active Discovery Dialogues</option>
                    <option value="Interactive drills">Interactive Drills & Practice Games</option>
                    <option value="Structured breakdown">Step-by-Step Task Breakdowns</option>
                    <option value="Confidence building">Focus on Building Study Confidence</option>
                  </select>
                </div>

                <div className="form-group full-width">
                  <label htmlFor="concern-textarea">Parent Concerns / Specific Learning Hurdles</label>
                  <textarea
                    id="concern-textarea"
                    rows="3"
                    placeholder="e.g. Easily gets frustrated and shuts down when getting a step wrong. Needs slow steps and extra reassurance."
                    value={parentConcern}
                    onChange={(e) => setParentConcern(e.target.value)}
                  ></textarea>
                </div>
              </div>

              <button
                type="submit"
                className="btn-primary full-width"
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Sparkles className="animate-spin icon-gold" /> Loading Parent Cues...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} /> Consult Parent Copilot™
                  </>
                )}
              </button>
            </form>
          </div>

          {/* OUTPUT & PREVIEW PANEL */}
          <div className="glass-card">
            {isGenerating ? (
              // STEPPING LOADER
              <div className="interactive-loader">
                <Brain size={48} className="pulse-icon icon-blue" />
                <h3 className="loader-title">Ambience Parent Copilot Processing...</h3>
                <p className="loader-step">{generationStep}</p>
                <div className="loader-bar-container">
                  <div className="loader-bar-fill"></div>
                </div>
              </div>
            ) : generatedOutput ? (
              // INTERACTIVE RESULTS
              <div className="generated-workspace">
                <div className="output-badge-container">
                  <span className="source-tag">Source: {generationSource}</span>
                  <button className="btn-save" onClick={handleSaveOutput}>
                    <Save size={14} /> Save Assets
                  </button>
                </div>

                <h2 className="workspace-title">{topic} Parent Guide</h2>
                <p className="workspace-subtitle">Empowering at-home learning for {subject}</p>

                {/* Sub tabs inside the result */}
                <div className="workspace-tabs">
                  <button
                    className={`tab-btn ${activeTab === "explanations" ? "active" : ""}`}
                    onClick={() => setActiveTab("explanations")}
                  >
                    <Lightbulb size={14} /> Explanations
                  </button>
                  <button
                    className={`tab-btn ${activeTab === "practice" ? "active" : ""}`}
                    onClick={() => setActiveTab("practice")}
                  >
                    <CheckCircle size={14} /> Practice Plan
                  </button>
                  <button
                    className={`tab-btn ${activeTab === "discussions" ? "active" : ""}`}
                    onClick={() => setActiveTab("discussions")}
                  >
                    <Compass size={14} /> Communication
                  </button>
                  <button
                    className={`tab-btn ${activeTab === "reflections" ? "active" : ""}`}
                    onClick={() => setActiveTab("reflections")}
                  >
                    <Sparkles size={14} /> Reflections & Tips
                  </button>
                </div>

                {/* CONTENT BLOCKS BY TAB */}
                <div className="workspace-content">
                  {activeTab === "explanations" && (
                    <div className="content-slide fade-in">
                      <div className="content-block analogy-block">
                        <h4><Lightbulb size={16} /> Parent-Friendly Conceptual Explanation</h4>
                        <p className="whitespace-pre-line">{generatedOutput.parentExplanation}</p>
                      </div>
                      <div className="content-block">
                        <h4><FileText size={16} /> Progress Milestone Summary</h4>
                        <p className="whitespace-pre-line">{generatedOutput.progressSummary}</p>
                      </div>
                    </div>
                  )}

                  {activeTab === "practice" && (
                    <div className="content-slide fade-in">
                      <div className="content-block sample-problem-block">
                        <h4><Activity size={16} className="icon-green" /> Homework Support Guide</h4>
                        <p className="whitespace-pre-line">{generatedOutput.homeworkGuide}</p>
                      </div>
                      <div className="content-block practice-problems-block">
                        <h4><Brain size={16} className="icon-blue" /> At-Home Interactive Practice drills</h4>
                        <p className="whitespace-pre-line">{generatedOutput.atHomePractice}</p>
                      </div>
                      <div className="content-block hints-block">
                        <h4><Heart size={16} className="icon-gold" /> Confidence Encouragement Card</h4>
                        <p className="whitespace-pre-line font-italic">"{generatedOutput.studentEncouragement}"</p>
                      </div>
                    </div>
                  )}

                  {activeTab === "discussions" && (
                    <div className="content-slide fade-in">
                      <div className="content-block guide-block">
                        <h4><HelpCircle size={16} /> Diagnostic Questions to Ask Student</h4>
                        <p className="whitespace-pre-line">{generatedOutput.studentQuestions}</p>
                      </div>
                      <div className="content-block mistake-block">
                        <h4><User size={16} className="icon-blue" /> Constructive Questions for the Tutor</h4>
                        <p className="whitespace-pre-line">{generatedOutput.tutorQuestions}</p>
                      </div>
                    </div>
                  )}

                  {activeTab === "reflections" && (
                    <div className="content-slide fade-in">
                      <div className="content-block character-block">
                        <h4><Sparkles size={16} className="icon-gold" /> Patience & Diligence Character Reflection</h4>
                        <p className="whitespace-pre-line">{generatedOutput.characterReflection}</p>
                      </div>
                      {generatedOutput.bibleReflection && (
                        <div className="content-block bible-block">
                          <h4><Heart size={16} className="icon-pink" style={{ color: "var(--accent-pink)" }} /> Bible Study Learning Truth</h4>
                          <p className="whitespace-pre-line">{generatedOutput.bibleReflection}</p>
                        </div>
                      )}
                      <div className="content-block iep-block">
                        <h4><ShieldAlert size={16} className="icon-blue" /> Adaptive IEP Support Tips</h4>
                        <p className="whitespace-pre-line">{generatedOutput.iepSupportTips}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // DEFAULT EMPTY PLACEHOLDER
              <div className="empty-state">
                <Sparkles size={48} className="empty-icon pulse-animation" />
                <h3>Parent Copilot Workspace</h3>
                <p>Fill out the learning details on the left, then consult the copilot. Parent guides, homework tips, interactive drills, and encouraging messages will load here.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
