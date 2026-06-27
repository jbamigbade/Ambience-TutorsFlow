import React, { useState, useContext } from "react";
import { AppContext } from "../../context/AppContext";
import {
  Sparkles,
  User,
  GraduationCap,
  BookOpen,
  FileQuestion,
  Gauge,
  ListPlus,
  Eye,
  CheckCircle,
  HelpCircle,
  AlertTriangle,
  FileText,
  Save,
  ChevronDown,
  ChevronUp,
  Cpu,
  Brain,
  Award,
  BookMarked
} from "lucide-react";

export default function AiTestGenerator() {
  const { students, addPracticeTest, apiFetch, currentUser } = useContext(AppContext);

  // Selector form states
  const [selectedStudent, setSelectedStudent] = useState("");
  const [gradeLevel, setGradeLevel] = useState("9th Grade");
  const [subject, setSubject] = useState("Mathematics");
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("Medium");
  const [questionCount, setQuestionCount] = useState(3);
  const [questionType, setQuestionType] = useState("Multiple Choice");
  const [includeSolutions, setIncludeSolutions] = useState(true);
  const [includeAnswerKey, setIncludeAnswerKey] = useState(true);

  // UX states
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState("");
  const [generatedTest, setGeneratedTest] = useState(null);
  const [generationSource, setGenerationSource] = useState("");
  const [activePreviewTab, setActivePreviewTab] = useState("teacher"); // student, teacher
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [expandedSolutions, setExpandedSolutions] = useState({});

  // Subjects based on strict requirements
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

  // Topics suggestions for dropdown ease
  const TOPIC_SUGGESTIONS = {
    "Mathematics": ["quadratic equations", "trigonometric identities", "calculus derivatives", "algebra linear systems", "probability and distribution"],
    "Science": ["photosynthesis", "cellular respiration", "chemical equilibrium", "plate tectonics", "kinematics"],
    "History / Social Studies": ["american revolution", "cold war timeline", "civil rights movement", "magna carta cause and effect", "world war ii dbq"],
    "English / Language Arts": ["reading comprehension", "grammatical corrections", "persuasive writing prompts", "vocabulary in context"],
    "Bible Study": ["fruits of the spirit", "heroes of faith", "sermon on the mount", "psalm 23 reflection", "proverbs wisdom lessons"],
    "Computer / Technology": ["coding basics", "artificial intelligence literacy", "cybersecurity basics", "data structures", "html and css basics"],
    "Physical Education / Health": ["nutrition and wellness", "cardiovascular fitness", "sports rules and safety", "healthy sleep habits", "first aid basics"],
    "SAT": ["math calculator active", "reading and writing context", "algebra passport", "heart of algebra"],
    "ACT": ["english grammatical rules", "math coordinate geometry", "science data analysis", "reading informational texts"],
    "EOG": ["8th grade math review", "reading textual comprehension", "science scientific inquiry"],
    "IOWA": ["vocabulary development", "mathematical calculation", "social studies timelines"]
  };

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

  // Auto-fill topic suggestion on subject change
  const handleSubjectChange = (e) => {
    const sub = e.target.value;
    setSubject(sub);
    if (TOPIC_SUGGESTIONS[sub] && TOPIC_SUGGESTIONS[sub].length > 0) {
      setTopic(TOPIC_SUGGESTIONS[sub][0]);
    } else {
      setTopic("");
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!topic.trim()) {
      setErrorMessage("Please specify a topic or concept to generate a test.");
      return;
    }

    setIsGenerating(true);
    setErrorMessage("");
    setSuccessMessage("");
    setGeneratedTest(null);

    // Dynamic loading status messages
    const steps = [
      "Analyzing curriculum and alignment...",
      "Crafting pedagogical questions and options...",
      "Formulating detailed step-by-step solutions...",
      "Synthesizing teacher notes and common mistakes...",
      "Finalizing Q&A formatting rules..."
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
      const response = await apiFetch("http://localhost:5000/api/ai/generate-test", {
        method: "POST",
        body: JSON.stringify({
          studentId: selectedStudent || null,
          gradeLevel,
          subject,
          topic: topic.trim(),
          difficulty,
          questionCount: parseInt(questionCount),
          questionType,
          includeSolutions,
          includeAnswerKey
        })
      });

      clearInterval(stepInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to communicate with AI engine.");
      }

      const data = await response.json();
      if (data.status === "Success" && data.practiceTest) {
        setGeneratedTest(data.practiceTest);
        setGenerationSource(data.source === "GEMINI_API" ? "Gemini 2.5 Flash (Live AI)" : "Ambience Offline Rule-Engine (Fallback)");
      } else {
        throw new Error("Invalid response format received from test generator.");
      }
    } catch (err) {
      clearInterval(stepInterval);
      console.error("[AI Generator] Execution failed:", err);
      setErrorMessage(err.message || "An unexpected error occurred during test generation.");
    } finally {
      setIsGenerating(false);
      setGenerationStep("");
    }
  };

  const handleAssignAndSave = async () => {
    if (!generatedTest) return;
    try {
      const config = {
        questionCount,
        questionType,
        includeSolutions,
        includeAnswerKey
      };

      const success = await addPracticeTest(
        selectedStudent || null,
        generatedTest.title,
        subject,
        topic.trim(),
        gradeLevel,
        difficulty,
        config,
        generatedTest
      );

      if (success) {
        const studentObj = students.find((s) => s.id === selectedStudent);
        const assignmentTarget = studentObj ? studentObj.name : "Learning Hub registry";
        setSuccessMessage(`Soli Deo Gloria! Practice test "${generatedTest.title}" successfully compiled and assigned to ${assignmentTarget}.`);
      } else {
        throw new Error("Unable to record practice test schema to database.");
      }
    } catch (err) {
      setErrorMessage(err.message || "Failed to save and assign practice test.");
    }
  };

  const toggleSolution = (index) => {
    setExpandedSolutions((prev) => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <div className="animate-scale-up" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      
      {/* HEADER HERO PANEL */}
      <div className="panel-card" style={{
        background: "linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.8) 100%)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        backdropFilter: "blur(12px)",
        padding: "24px",
        borderRadius: "16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "20px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{
            background: "linear-gradient(135deg, #a855f7 0%, #6366f1 100%)",
            borderRadius: "12px",
            padding: "12px",
            boxShadow: "0 8px 24px rgba(99, 102, 241, 0.3)"
          }}>
            <Sparkles style={{ width: "28px", height: "28px", color: "#fff" }} />
          </div>
          <div>
            <h2 style={{ fontSize: "22px", fontWeight: "700", color: "#f8fafc", margin: "0 0 4px 0", fontFamily: "'Outfit', sans-serif" }}>
              AI Test Q&A Generator™
            </h2>
            <p style={{ fontSize: "14px", color: "#94a3b8", margin: "0" }}>
              Curate and construct high-rigor practice exams with deep step-by-step solutions, hints, and mistake analysis.
            </p>
          </div>
        </div>
        <div style={{
          fontSize: "11px",
          color: "rgba(168, 85, 247, 0.8)",
          border: "1px solid rgba(168, 85, 247, 0.3)",
          padding: "6px 12px",
          borderRadius: "99px",
          background: "rgba(168, 85, 247, 0.05)",
          fontWeight: "600",
          letterSpacing: "0.5px"
        }}>
          SOLI DEO GLORIA
        </div>
      </div>

      {/* NOTIFICATIONS */}
      {errorMessage && (
        <div style={{
          background: "rgba(239, 68, 68, 0.1)",
          border: "1px solid rgba(239, 68, 68, 0.2)",
          borderRadius: "8px",
          padding: "14px 18px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          color: "#fca5a5",
          fontSize: "14px"
        }}>
          <AlertTriangle style={{ width: "18px", height: "18px", flexShrink: "0" }} />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div style={{
          background: "rgba(34, 197, 94, 0.1)",
          border: "1px solid rgba(34, 197, 94, 0.2)",
          borderRadius: "8px",
          padding: "14px 18px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          color: "#86efac",
          fontSize: "14px"
        }}>
          <CheckCircle style={{ width: "18px", height: "18px", flexShrink: "0" }} />
          <span>{successMessage}</span>
        </div>
      )}

      {/* TWO COLUMNS WORKSPACE */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1.8fr", gap: "24px", alignItems: "start" }}>
        
        {/* LEFT COLUMN: CONFIGURATION PANEL */}
        <div className="panel-card" style={{
          background: "rgba(15, 23, 42, 0.4)",
          border: "1px solid rgba(255, 255, 255, 0.05)",
          backdropFilter: "blur(16px)",
          padding: "24px",
          borderRadius: "16px",
          boxShadow: "0 12px 36px rgba(0, 0, 0, 0.15)"
        }}>
          <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#f1f5f9", margin: "0 0 18px 0", display: "flex", alignItems: "center", gap: "8px" }}>
            <Cpu style={{ width: "18px", height: "18px", color: "#a855f7" }} />
            Curriculum Parameters
          </h3>

          <form onSubmit={handleGenerate} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            
            {/* STUDENT SELECT */}
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#94a3b8", marginBottom: "6px" }}>
                Select Recipient Student (Optional)
              </label>
              <div style={{ position: "relative" }}>
                <select
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  style={{
                    width: "100%",
                    background: "rgba(15, 23, 42, 0.6)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "8px",
                    padding: "10px 14px",
                    color: "#f1f5f9",
                    fontSize: "14px",
                    outline: "none",
                    appearance: "none"
                  }}
                >
                  <option value="">-- Save to general Learning Hub registry --</option>
                  {students.map((std) => (
                    <option key={std.id} value={std.id}>
                      {std.name} ({std.grade})
                    </option>
                  ))}
                </select>
                <User style={{ position: "absolute", right: "12px", top: "12px", width: "16px", height: "16px", color: "#64748b", pointerEvents: "none" }} />
              </div>
            </div>

            {/* GRADE LEVEL */}
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#94a3b8", marginBottom: "6px" }}>
                Academic Grade Alignment
              </label>
              <div style={{ position: "relative" }}>
                <select
                  value={gradeLevel}
                  onChange={(e) => setGradeLevel(e.target.value)}
                  style={{
                    width: "100%",
                    background: "rgba(15, 23, 42, 0.6)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "8px",
                    padding: "10px 14px",
                    color: "#f1f5f9",
                    fontSize: "14px",
                    outline: "none",
                    appearance: "none"
                  }}
                >
                  {gradeLevels.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
                <GraduationCap style={{ position: "absolute", right: "12px", top: "12px", width: "16px", height: "16px", color: "#64748b", pointerEvents: "none" }} />
              </div>
            </div>

            {/* SUBJECT */}
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#94a3b8", marginBottom: "6px" }}>
                Academic Subject Class
              </label>
              <div style={{ position: "relative" }}>
                <select
                  value={subject}
                  onChange={handleSubjectChange}
                  style={{
                    width: "100%",
                    background: "rgba(15, 23, 42, 0.6)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "8px",
                    padding: "10px 14px",
                    color: "#f1f5f9",
                    fontSize: "14px",
                    outline: "none",
                    appearance: "none"
                  }}
                >
                  {SUBJECTS.map((sub) => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
                <BookOpen style={{ position: "absolute", right: "12px", top: "12px", width: "16px", height: "16px", color: "#64748b", pointerEvents: "none" }} />
              </div>
            </div>

            {/* TOPIC INPUT / AUTO SUGGEST */}
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#94a3b8", marginBottom: "6px" }}>
                Lesson Topic or Keyword
              </label>
              <input
                type="text"
                placeholder="e.g. quadratic equations, photosynthesis..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                style={{
                  width: "100%",
                  background: "rgba(15, 23, 42, 0.6)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "8px",
                  padding: "10px 14px",
                  color: "#f1f5f9",
                  fontSize: "14px",
                  outline: "none"
                }}
              />
              {TOPIC_SUGGESTIONS[subject] && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "8px" }}>
                  {TOPIC_SUGGESTIONS[subject].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setTopic(s)}
                      style={{
                        background: topic === s ? "rgba(168, 85, 247, 0.2)" : "rgba(255, 255, 255, 0.03)",
                        border: topic === s ? "1px solid rgba(168, 85, 247, 0.4)" : "1px solid rgba(255, 255, 255, 0.05)",
                        borderRadius: "99px",
                        padding: "3px 10px",
                        fontSize: "11px",
                        color: topic === s ? "#d8b4fe" : "#94a3b8",
                        cursor: "pointer",
                        transition: "all 0.2s"
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* DIFFICULTY & QUESTION COUNT GRID */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#94a3b8", marginBottom: "6px" }}>
                  Difficulty Rigor
                </label>
                <div style={{ position: "relative" }}>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    style={{
                      width: "100%",
                      background: "rgba(15, 23, 42, 0.6)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      borderRadius: "8px",
                      padding: "10px 14px",
                      color: "#f1f5f9",
                      fontSize: "14px",
                      outline: "none",
                      appearance: "none"
                    }}
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                    <option value="Expert">Expert</option>
                  </select>
                  <Gauge style={{ position: "absolute", right: "12px", top: "12px", width: "16px", height: "16px", color: "#64748b", pointerEvents: "none" }} />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#94a3b8", marginBottom: "6px" }}>
                  Question Count
                </label>
                <div style={{ position: "relative" }}>
                  <select
                    value={questionCount}
                    onChange={(e) => setQuestionCount(e.target.value)}
                    style={{
                      width: "100%",
                      background: "rgba(15, 23, 42, 0.6)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      borderRadius: "8px",
                      padding: "10px 14px",
                      color: "#f1f5f9",
                      fontSize: "14px",
                      outline: "none",
                      appearance: "none"
                    }}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <option key={num} value={num}>{num} Questions</option>
                    ))}
                  </select>
                  <ListPlus style={{ position: "absolute", right: "12px", top: "12px", width: "16px", height: "16px", color: "#64748b", pointerEvents: "none" }} />
                </div>
              </div>
            </div>

            {/* QUESTION TYPE */}
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#94a3b8", marginBottom: "6px" }}>
                Assessment Layout
              </label>
              <div style={{ position: "relative" }}>
                <select
                  value={questionType}
                  onChange={(e) => setQuestionType(e.target.value)}
                  style={{
                    width: "100%",
                    background: "rgba(15, 23, 42, 0.6)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "8px",
                    padding: "10px 14px",
                    color: "#f1f5f9",
                    fontSize: "14px",
                    outline: "none",
                    appearance: "none"
                  }}
                >
                  <option value="Multiple Choice">Multiple Choice (4 Options)</option>
                  <option value="Short Answer">Short Q&A / Fill Blank</option>
                  <option value="Free Response">Analytical Free Response</option>
                </select>
                <FileQuestion style={{ position: "absolute", right: "12px", top: "12px", width: "16px", height: "16px", color: "#64748b", pointerEvents: "none" }} />
              </div>
            </div>

            {/* EXTRAS CHECKBOXES */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "10px 0" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", color: "#cbd5e1", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={includeSolutions}
                  onChange={(e) => setIncludeSolutions(e.target.checked)}
                  style={{ width: "16px", height: "16px", accentColor: "#a855f7" }}
                />
                <span>Include Step-by-Step Solutions</span>
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", color: "#cbd5e1", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={includeAnswerKey}
                  onChange={(e) => setIncludeAnswerKey(e.target.checked)}
                  style={{ width: "16px", height: "16px", accentColor: "#a855f7" }}
                />
                <span>Generate Answer Key</span>
              </label>
            </div>

            {/* ACTION GENERATE BUTTON */}
            <button
              type="submit"
              disabled={isGenerating}
              className="btn-primary"
              style={{
                background: "linear-gradient(135deg, #a855f7 0%, #6366f1 100%)",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                padding: "12px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: isGenerating ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                boxShadow: "0 4px 18px rgba(168, 85, 247, 0.25)",
                transition: "transform 0.2s"
              }}
            >
              <Sparkles style={{ width: "16px", height: "16px" }} />
              {isGenerating ? "Processing..." : "Generate AI Test"}
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN: PREVIEW PANEL */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* IS LOADING STATE */}
          {isGenerating && (
            <div className="panel-card" style={{
              background: "rgba(15, 23, 42, 0.4)",
              border: "1px solid rgba(255, 255, 255, 0.05)",
              borderRadius: "16px",
              padding: "48px 24px",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "20px",
              minHeight: "450px"
            }}>
              <div style={{ position: "relative", width: "80px", height: "80px" }}>
                <div style={{
                  position: "absolute",
                  border: "4px solid rgba(168, 85, 247, 0.15)",
                  borderTop: "4px solid #a855f7",
                  borderRadius: "50%",
                  width: "100%",
                  height: "100%",
                  animation: "spin 1.2s linear infinite"
                }}></div>
                <Brain style={{
                  width: "36px",
                  height: "36px",
                  color: "#6366f1",
                  position: "absolute",
                  left: "22px",
                  top: "22px",
                  animation: "pulse 1.5s ease-in-out infinite"
                }} />
              </div>
              <div>
                <h4 style={{ fontSize: "18px", fontWeight: "600", color: "#f1f5f9", margin: "0 0 6px 0" }}>
                  Engineering Assessment
                </h4>
                <p style={{ fontSize: "14px", color: "#a855f7", margin: "0", fontWeight: "500" }}>
                  {generationStep}
                </p>
                <p style={{ fontSize: "12px", color: "#64748b", marginTop: "12px" }}>
                  This can take up to 10 seconds. Building detailed pedagogy.
                </p>
              </div>
            </div>
          )}

          {/* EMPTY STATE */}
          {!isGenerating && !generatedTest && (
            <div className="panel-card" style={{
              background: "rgba(15, 23, 42, 0.2)",
              border: "1px dashed rgba(255, 255, 255, 0.1)",
              borderRadius: "16px",
              padding: "64px 24px",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "16px",
              minHeight: "450px"
            }}>
              <FileText style={{ width: "48px", height: "48px", color: "#475569" }} />
              <div>
                <h4 style={{ fontSize: "16px", fontWeight: "600", color: "#94a3b8", margin: "0 0 6px 0" }}>
                  No Assessment Generated Yet
                </h4>
                <p style={{ fontSize: "13px", color: "#64748b", maxWidth: "320px", margin: "0 auto" }}>
                  Select student grade, subject, and topic in the configuration panel then trigger generation.
                </p>
              </div>
            </div>
          )}

          {/* PREVIEW CONTAINER */}
          {!isGenerating && generatedTest && (
            <div className="panel-card" style={{
              background: "rgba(15, 23, 42, 0.4)",
              border: "1px solid rgba(255, 255, 255, 0.05)",
              backdropFilter: "blur(16px)",
              borderRadius: "16px",
              overflow: "hidden",
              boxShadow: "0 12px 36px rgba(0, 0, 0, 0.15)"
            }}>
              
              {/* TOP HEADER PREVIEW BAR */}
              <div style={{
                background: "rgba(15, 23, 42, 0.8)",
                padding: "16px 24px",
                borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "12px"
              }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{
                      background: "rgba(168, 85, 247, 0.1)",
                      border: "1px solid rgba(168, 85, 247, 0.3)",
                      color: "#d8b4fe",
                      fontSize: "11px",
                      padding: "2px 8px",
                      borderRadius: "4px",
                      fontWeight: "600"
                    }}>
                      {gradeLevel}
                    </span>
                    <span style={{
                      background: "rgba(99, 102, 241, 0.1)",
                      border: "1px solid rgba(99, 102, 241, 0.3)",
                      color: "#c7d2fe",
                      fontSize: "11px",
                      padding: "2px 8px",
                      borderRadius: "4px",
                      fontWeight: "600"
                    }}>
                      {subject}
                    </span>
                  </div>
                  <h4 style={{ fontSize: "16px", fontWeight: "700", color: "#f8fafc", margin: "6px 0 0 0" }}>
                    {generatedTest.title}
                  </h4>
                  <p style={{ fontSize: "11px", color: "#64748b", margin: "4px 0 0 0" }}>
                    Engine: <strong style={{ color: "#a855f7" }}>{generationSource}</strong>
                  </p>
                </div>

                {/* SAVE AND ASSIGN BUTTON */}
                <button
                  type="button"
                  onClick={handleAssignAndSave}
                  className="btn-primary"
                  style={{
                    background: "rgba(34, 197, 94, 0.15)",
                    border: "1px solid rgba(34, 197, 94, 0.3)",
                    color: "#4ade80",
                    borderRadius: "8px",
                    padding: "8px 14px",
                    fontSize: "13px",
                    fontWeight: "600",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                  }}
                >
                  <Save style={{ width: "14px", height: "14px" }} />
                  {selectedStudent ? "Assign to Student" : "Save to Learning Hub"}
                </button>
              </div>

              {/* TABS SELECTOR ROW */}
              <div style={{
                display: "flex",
                borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                background: "rgba(0, 0, 0, 0.2)"
              }}>
                <button
                  type="button"
                  onClick={() => setActivePreviewTab("teacher")}
                  style={{
                    flex: "1",
                    padding: "12px",
                    background: activePreviewTab === "teacher" ? "rgba(15, 23, 42, 0.3)" : "transparent",
                    border: "none",
                    borderBottom: activePreviewTab === "teacher" ? "2px solid #a855f7" : "2px solid transparent",
                    color: activePreviewTab === "teacher" ? "#f1f5f9" : "#64748b",
                    fontSize: "13px",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                >
                  Teacher Q&A & Solutions View
                </button>
                <button
                  type="button"
                  onClick={() => setActivePreviewTab("student")}
                  style={{
                    flex: "1",
                    padding: "12px",
                    background: activePreviewTab === "student" ? "rgba(15, 23, 42, 0.3)" : "transparent",
                    border: "none",
                    borderBottom: activePreviewTab === "student" ? "2px solid #6366f1" : "2px solid transparent",
                    color: activePreviewTab === "student" ? "#f1f5f9" : "#64748b",
                    fontSize: "13px",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                >
                  Student Workspace Mock Preview
                </button>
              </div>

              {/* PREVIEW CONTENT SCROLLER */}
              <div style={{ padding: "24px", maxHeight: "550px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "20px" }}>
                
                {activePreviewTab === "student" ? (
                  /* STUDENT VIEW */
                  <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    <div style={{
                      background: "rgba(255, 255, 255, 0.02)",
                      border: "1px solid rgba(255, 255, 255, 0.05)",
                      borderRadius: "8px",
                      padding: "12px 16px",
                      fontSize: "12px",
                      color: "#94a3b8"
                    }}>
                      📝 <strong>Student Notice:</strong> Solutions, teacher context notes, and answers are fully hidden. Tap hints if you need a conceptual guiding light.
                    </div>
                    {generatedTest.questions.map((q, idx) => (
                      <div key={idx} style={{
                        border: "1px solid rgba(255, 255, 255, 0.04)",
                        background: "rgba(255, 255, 255, 0.01)",
                        borderRadius: "10px",
                        padding: "16px"
                      }}>
                        <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                          <span style={{
                            background: "rgba(99, 102, 241, 0.2)",
                            color: "#c7d2fe",
                            fontSize: "12px",
                            fontWeight: "700",
                            borderRadius: "4px",
                            padding: "2px 8px",
                            marginTop: "2px"
                          }}>
                            Q{idx + 1}
                          </span>
                          <div style={{ flex: "1" }}>
                            <p style={{ margin: "0 0 12px 0", color: "#f1f5f9", fontSize: "14px", fontWeight: "500", whiteSpace: "pre-wrap" }}>
                              {q.question}
                            </p>
                            
                            {/* Options if MC */}
                            {q.options && q.options.length > 0 && (
                              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "12px" }}>
                                {q.options.map((opt, oIdx) => (
                                  <div key={oIdx} style={{
                                    background: "rgba(15, 23, 42, 0.3)",
                                    border: "1px solid rgba(255, 255, 255, 0.08)",
                                    borderRadius: "6px",
                                    padding: "8px 12px",
                                    fontSize: "13px",
                                    color: "#cbd5e1",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px"
                                  }}>
                                    <span style={{ fontWeight: "700", color: "#6366f1" }}>{String.fromCharCode(65 + oIdx)}.</span>
                                    <span>{opt}</span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Hint Trigger */}
                            <div style={{
                              background: "rgba(168, 85, 247, 0.03)",
                              border: "1px dashed rgba(168, 85, 247, 0.15)",
                              borderRadius: "6px",
                              padding: "8px 12px",
                              fontSize: "12px",
                              color: "#d8b4fe"
                            }}>
                              💡 <strong>Encouraging Hint:</strong> {q.hint || "Deconstruct the question criteria step by step."}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* TEACHER VIEW (WITH DEEP SOLUTIONS) */
                  <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                    {generatedTest.questions.map((q, idx) => (
                      <div key={idx} style={{
                        border: "1px solid rgba(255, 255, 255, 0.05)",
                        background: "rgba(0, 0, 0, 0.15)",
                        borderRadius: "12px",
                        padding: "18px"
                      }}>
                        <div style={{ display: "flex", gap: "10px", alignItems: "flex-start", marginBottom: "14px" }}>
                          <span style={{
                            background: "linear-gradient(135deg, #a855f7 0%, #6366f1 100%)",
                            color: "#fff",
                            fontSize: "11px",
                            fontWeight: "800",
                            borderRadius: "4px",
                            padding: "3px 8px"
                          }}>
                            Q{idx + 1}
                          </span>
                          <div style={{ flex: "1" }}>
                            <p style={{ margin: "0 0 10px 0", color: "#f8fafc", fontSize: "14px", fontWeight: "600", whiteSpace: "pre-wrap" }}>
                              {q.question}
                            </p>
                          </div>
                        </div>

                        {/* Options if MC */}
                        {q.options && q.options.length > 0 && (
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", margin: "0 0 14px 28px" }}>
                            {q.options.map((opt, oIdx) => (
                              <div key={oIdx} style={{
                                background: "rgba(15, 23, 42, 0.4)",
                                border: "1px solid rgba(255, 255, 255, 0.06)",
                                borderRadius: "6px",
                                padding: "8px 12px",
                                fontSize: "12px",
                                color: "#94a3b8"
                              }}>
                                <span style={{ fontWeight: "700", color: "#a855f7", marginRight: "6px" }}>{String.fromCharCode(65 + oIdx)}.</span>
                                <span>{opt}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Solutions collapsible */}
                        <div style={{ marginLeft: "28px", display: "flex", flexDirection: "column", gap: "10px" }}>
                          
                          {/* ANSWER KEY */}
                          <div style={{
                            background: "rgba(34, 197, 94, 0.05)",
                            border: "1px solid rgba(34, 197, 94, 0.15)",
                            padding: "8px 12px",
                            borderRadius: "6px",
                            fontSize: "13px",
                            color: "#a7f3d0",
                            fontWeight: "500"
                          }}>
                            🔑 <strong>Answer Key:</strong> {q.answer}
                          </div>

                          {/* EXPANDABLE PEDAGOGICAL SOLUTION */}
                          <div style={{ border: "1px solid rgba(255, 255, 255, 0.04)", borderRadius: "6px", overflow: "hidden" }}>
                            <button
                              type="button"
                              onClick={() => toggleSolution(idx)}
                              style={{
                                width: "100%",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                padding: "8px 12px",
                                background: "rgba(255, 255, 255, 0.02)",
                                border: "none",
                                cursor: "pointer",
                                color: "#e2e8f0",
                                fontSize: "12px",
                                fontWeight: "600"
                              }}
                            >
                              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                <Award style={{ width: "14px", height: "14px", color: "#f59e0b" }} />
                                Detailed Step-by-Step Problem Solving
                              </span>
                              {expandedSolutions[idx] ? <ChevronUp style={{ width: "14px", height: "14px" }} /> : <ChevronDown style={{ width: "14px", height: "14px" }} />}
                            </button>

                            {expandedSolutions[idx] && (
                              <div style={{
                                padding: "12px",
                                background: "rgba(15, 23, 42, 0.5)",
                                borderTop: "1px solid rgba(255, 255, 255, 0.04)",
                                fontSize: "13px",
                                color: "#cbd5e1",
                                lineHeight: "1.6",
                                whiteSpace: "pre-wrap"
                              }}>
                                {q.solution || "No detailed solution included."}
                              </div>
                            )}
                          </div>

                          {/* COMMON MISTAKES */}
                          {q.common_mistakes && (
                            <div style={{
                              background: "rgba(239, 68, 68, 0.03)",
                              border: "1px solid rgba(239, 68, 68, 0.1)",
                              padding: "8px 12px",
                              borderRadius: "6px",
                              fontSize: "12px",
                              color: "#fca5a5"
                            }}>
                              ⚠️ <strong>Common Mistake:</strong> {q.common_mistakes}
                            </div>
                          )}

                          {/* TEACHER NOTES */}
                          {q.teacher_notes && (
                            <div style={{
                              background: "rgba(99, 102, 241, 0.03)",
                              border: "1px solid rgba(99, 102, 241, 0.1)",
                              padding: "8px 12px",
                              borderRadius: "6px",
                              fontSize: "12px",
                              color: "#c7d2fe"
                            }}>
                              🍎 <strong>Teaching Note & IEP Accommodation:</strong> {q.teacher_notes}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* QUICK DOCUMENTATION TIP */}
          <div className="panel-card" style={{
            background: "rgba(15, 23, 42, 0.3)",
            border: "1px solid rgba(255, 255, 255, 0.05)",
            padding: "16px",
            borderRadius: "12px",
            display: "flex",
            alignItems: "flex-start",
            gap: "10px"
          }}>
            <HelpCircle style={{ width: "16px", height: "16px", color: "#6366f1", marginTop: "2px" }} />
            <div>
              <h5 style={{ fontSize: "12px", fontWeight: "600", color: "#cbd5e1", margin: "0 0 2px 0" }}>
                Multi-subject Dual Mode
              </h5>
              <p style={{ fontSize: "11px", color: "#64748b", margin: "0", lineHeight: "1.4" }}>
                Assessing a student automatically maps questions to their dashboard under "Exams & Q&A". In offline mode, a rich curated repository models the answers, giving tutors extreme speed during demo checks.
              </p>
            </div>
          </div>

        </div>
      </div>
      
      {/* CSS Spinners styles inline */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
}
