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
  Activity,
  MonitorPlay,
  Heart
} from "lucide-react";

export default function AiTutorCopilot() {
  const { students, addCopilotRecord, apiFetch, copilotRecords } = useContext(AppContext);

  // Form states
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [subject, setSubject] = useState("Mathematics");
  const [topic, setTopic] = useState("");
  const [gradeLevel, setGradeLevel] = useState("7th Grade");
  const [currentLesson, setCurrentLesson] = useState("");
  const [studentChallenge, setStudentChallenge] = useState("");
  const [supportType, setSupportType] = useState("Analogy");

  // UX states
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState("");
  const [generatedOutput, setGeneratedOutput] = useState(null);
  const [generationSource, setGenerationSource] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [activeTab, setActiveTab] = useState("explanations"); // explanations, assets, coaching, outcomes
  const [showHistory, setShowHistory] = useState(false);

  // Auto-populate some data based on student selected
  useEffect(() => {
    if (selectedStudentId) {
      const student = students.find((s) => s.id === selectedStudentId);
      if (student) {
        // Pre-fill challenge or context if we can
        setStudentChallenge("Needs concrete visualizations. Easily overwhelmed by heavy vocabulary or multi-step computational steps.");
        setCurrentLesson("Active Learning Integration Unit 1");
      }
    } else {
      setStudentChallenge("");
      setCurrentLesson("");
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
      "Analyzing student profile and specific challenge barriers...",
      "Mapping pedagogical analogy criteria...",
      "Drafting conceptual and advanced mechanical breakdowns...",
      "Formulating step-by-step Worked Example guides...",
      "Scaffolding practice problems with intelligent incremental hints...",
      "Extracting common user mistakes and classroom IEP accommodations...",
      "Injecting Grit, Diligence, or Perseverance Character Reflections...",
      "Compiling final parent updates and actionable tutor notes..."
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

      const response = await apiFetch("http://localhost:5000/api/ai/generate-copilot", {
        method: "POST",
        body: JSON.stringify({
          studentId: selectedStudentId || null,
          studentName,
          subject,
          topic: topic.trim(),
          gradeLevel,
          currentLesson: currentLesson.trim(),
          studentChallenge: studentChallenge.trim(),
          supportType
        })
      });

      clearInterval(stepInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to communicate with Tutor Copilot AI engine.");
      }

      const data = await response.json();
      if (data.status === "Success" && data.copilotOutput) {
        setGeneratedOutput(data.copilotOutput);
        setGenerationSource(data.source === "GEMINI_API" ? "Gemini 2.5 Flash (Live AI)" : "Ambience Offline Rule-Engine (Fallback)");
      } else {
        throw new Error("Invalid response format received from Tutor Copilot.");
      }
    } catch (err) {
      clearInterval(stepInterval);
      console.error("[AI Tutor Copilot] Execution failed:", err);
      setErrorMessage(err.message || "An unexpected error occurred during Copilot execution.");
    } finally {
      setIsGenerating(false);
      setGenerationStep("");
    }
  };

  const handleSaveOutput = async () => {
    if (!generatedOutput) return;
    try {
      const success = await addCopilotRecord(
        selectedStudentId || null,
        subject,
        topic.trim(),
        gradeLevel,
        currentLesson.trim(),
        studentChallenge.trim(),
        supportType,
        generatedOutput
      );

      if (success) {
        setSuccessMessage("✓ Copilot assistance assets successfully synchronized to your academic database!");
        setTimeout(() => setSuccessMessage(""), 4000);
      } else {
        throw new Error("Database update failed while logging copilot records.");
      }
    } catch (err) {
      console.error("[AI Tutor Copilot] Saving failed:", err);
      setErrorMessage(err.message || "Failed to save copilot records.");
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
          <span className="badge-tag"><Sparkles size={12} /> AI Tutor Assistant</span>
          <h1 className="view-title text-gradient">AI Tutor Copilot™</h1>
          <p className="view-subtitle">
            Get instant, real-time pedagogical support, dynamic analogies, IEP accommodations, and character-building guidelines.
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
            <h2 className="card-title">Saved Copilot Assistances</h2>
            <p className="card-subtitle">Previous real-time support runs saved by tutors</p>
          </div>
          <div className="table-responsive">
            {copilotRecords.length === 0 ? (
              <div className="empty-state">
                <History size={48} className="empty-icon" />
                <h3>No Copilot Runs Logged</h3>
                <p>Your generated real-time tutoring assistances will appear here once saved.</p>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Subject & Topic</th>
                    <th>Grade & Student</th>
                    <th>Support Type</th>
                    <th>Created At</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {copilotRecords.map((rec) => {
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
                          <div className="text-xs text-muted">{rec.gradeLevel}</div>
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
                              setGradeLevel(rec.gradeLevel);
                              setSelectedStudentId(rec.studentId || "");
                              setStudentChallenge(rec.studentChallenge || "");
                              setSupportType(rec.supportType || "Analogy");
                              setCurrentLesson(rec.sessionContext || "");
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
              <h2 className="card-title">Tutoring Context</h2>
              <p className="card-subtitle">Provide details about the student, subject, and immediate barriers</p>
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
                  <label htmlFor="grade-select">Grade Level</label>
                  <select
                    id="grade-select"
                    value={gradeLevel}
                    onChange={(e) => setGradeLevel(e.target.value)}
                  >
                    <option value="Preschool">Preschool</option>
                    <option value="Kindergarten">Kindergarten</option>
                    <option value="1st Grade">1st Grade</option>
                    <option value="2nd Grade">2nd Grade</option>
                    <option value="3rd Grade">3rd Grade</option>
                    <option value="4th Grade">4th Grade</option>
                    <option value="5th Grade">5th Grade</option>
                    <option value="6th Grade">6th Grade</option>
                    <option value="7th Grade">7th Grade</option>
                    <option value="8th Grade">8th Grade</option>
                    <option value="9th Grade">9th Grade</option>
                    <option value="10th Grade">10th Grade</option>
                    <option value="11th Grade">11th Grade</option>
                    <option value="12th Grade">12th Grade</option>
                    <option value="College">College</option>
                    <option value="SAT Prep">SAT Prep</option>
                    <option value="ACT Prep">ACT Prep</option>
                    <option value="EOG Prep">EOG Prep</option>
                    <option value="IOWA Prep">IOWA Prep</option>
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

                <div className="form-group">
                  <label htmlFor="topic-input">Target Topic / Term</label>
                  <input
                    id="topic-input"
                    type="text"
                    placeholder="e.g. Inverses, Cell Division, Run-on Sentences, Romans 12"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="lesson-input">Current Lesson / Session Unit (Optional)</label>
                  <input
                    id="lesson-input"
                    type="text"
                    placeholder="e.g. Chapter 3, Section 4.2 review"
                    value={currentLesson}
                    onChange={(e) => setCurrentLesson(e.target.value)}
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="support-select">Preferred Primary Support Type Focus</label>
                  <select
                    id="support-select"
                    value={supportType}
                    onChange={(e) => setSupportType(e.target.value)}
                  >
                    <option value="Analogy">Analogy & Metaphor (Recommended)</option>
                    <option value="Visual Aid description">Visual Aid & Diagram Models</option>
                    <option value="Socratic Prompting">Socratic Dialogue & Inquiries</option>
                    <option value="Step-by-step Scaffolding">Detailed Scaffolding Steps</option>
                    <option value="Mnemonic device">Mnemonics & Memory Aids</option>
                    <option value="Gamified Drill">Gamified Review Drill Descriptions</option>
                  </select>
                </div>

                <div className="form-group full-width">
                  <label htmlFor="challenge-textarea">Active Student Challenge / Immediate Barrier</label>
                  <textarea
                    id="challenge-textarea"
                    rows="3"
                    placeholder="e.g. Struggles to understand why we flip fractions during division, or gets frustrated and loses confidence immediately."
                    value={studentChallenge}
                    onChange={(e) => setStudentChallenge(e.target.value)}
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
                    <Sparkles className="animate-spin icon-gold" /> Loading Copilot Cues...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} /> Consult AI Copilot™
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
                <h3 className="loader-title">Ambience Copilot Processing...</h3>
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
                    <Save size={14} /> Save Assist
                  </button>
                </div>

                <h2 className="workspace-title">{topic} Assistance</h2>
                <p className="workspace-subtitle">Tailored assets for {gradeLevel} {subject}</p>

                {/* Sub tabs inside the result */}
                <div className="workspace-tabs">
                  <button
                    className={`tab-btn ${activeTab === "explanations" ? "active" : ""}`}
                    onClick={() => setActiveTab("explanations")}
                  >
                    <Lightbulb size={14} /> Explanations
                  </button>
                  <button
                    className={`tab-btn ${activeTab === "assets" ? "active" : ""}`}
                    onClick={() => setActiveTab("assets")}
                  >
                    <FileText size={14} /> Worked Problems
                  </button>
                  <button
                    className={`tab-btn ${activeTab === "coaching" ? "active" : ""}`}
                    onClick={() => setActiveTab("coaching")}
                  >
                    <Brain size={14} /> Live Coaching
                  </button>
                  <button
                    className={`tab-btn ${activeTab === "outcomes" ? "active" : ""}`}
                    onClick={() => setActiveTab("outcomes")}
                  >
                    <CheckSquare size={14} /> Post-Session
                  </button>
                </div>

                {/* CONTENT BLOCKS BY TAB */}
                <div className="workspace-content">
                  {activeTab === "explanations" && (
                    <div className="content-slide fade-in">
                      <div className="content-block analogy-block">
                        <h4><Lightbulb size={16} /> Intuitive Explanation & Analogy</h4>
                        <p className="whitespace-pre-line">{generatedOutput.simpleExplanation}</p>
                      </div>
                      <div className="content-block">
                        <h4><Compass size={16} /> Deeper Mechanics & Terminology</h4>
                        <p className="whitespace-pre-line">{generatedOutput.deeperExplanation}</p>
                      </div>
                    </div>
                  )}

                  {activeTab === "assets" && (
                    <div className="content-slide fade-in">
                      <div className="content-block sample-problem-block">
                        <h4><CheckCircle size={16} className="icon-green" /> Step-by-Step Worked Example</h4>
                        <p className="whitespace-pre-line text-code">{generatedOutput.exampleProblem}</p>
                      </div>
                      <div className="content-block practice-problems-block">
                        <h4><FileText size={16} className="icon-blue" /> Practice Drill Problems</h4>
                        <p className="whitespace-pre-line text-code">{generatedOutput.practiceProblems}</p>
                      </div>
                      <div className="content-block hints-block">
                        <h4><HelpCircle size={16} className="icon-gold" /> Scaffolding Hints</h4>
                        <p className="whitespace-pre-line">{generatedOutput.hints}</p>
                      </div>
                    </div>
                  )}

                  {activeTab === "coaching" && (
                    <div className="content-slide fade-in">
                      <div className="content-block guide-block">
                        <h4><Brain size={16} /> Tutor Session Delivery Guide</h4>
                        <p className="whitespace-pre-line">{generatedOutput.teachingGuide}</p>
                      </div>
                      <div className="content-block mistake-block">
                        <h4><AlertTriangle size={16} className="icon-gold" /> Common Student Pitfalls</h4>
                        <p className="whitespace-pre-line">{generatedOutput.commonMistakes}</p>
                      </div>
                      <div className="content-block iep-block">
                        <h4><ShieldAlert size={16} className="icon-blue" /> Adaptive IEP Suggestions</h4>
                        <p className="whitespace-pre-line">{generatedOutput.iepAccommodations}</p>
                      </div>
                      {generatedOutput.characterReflection && (
                        <div className="content-block character-block">
                          <h4><Sparkles size={16} className="icon-gold" /> Diligence & Grit Character reflections</h4>
                          <p className="whitespace-pre-line">{generatedOutput.characterReflection}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === "outcomes" && (
                    <div className="content-slide fade-in">
                      <div className="content-block parent-summary-block">
                        <h4><User className="icon-blue" size={16} /> Encouraging Parent Update</h4>
                        <p className="whitespace-pre-line font-italic">"{generatedOutput.parentSummary}"</p>
                      </div>
                      <div className="content-block tutor-notes-block">
                        <h4><FileText size={16} /> Actionable Post-Session Log</h4>
                        <p className="whitespace-pre-line">{generatedOutput.tutorNotes}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // DEFAULT EMPTY PLACEHOLDER
              <div className="empty-state">
                <Sparkles size={48} className="empty-icon pulse-animation" />
                <h3>Tutor Copilot Workspace</h3>
                <p>Fill out the tutoring details on the left, then trigger copilot advice. Live guides, analogies, examples, and reflections will load here.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
