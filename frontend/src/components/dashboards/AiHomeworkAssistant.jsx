// Ambience TutorsFlow™ Student AI Homework Workspace & Assistant
// Soli Deo Gloria — Built with pure architectural beauty and educational integrity.
import React, { useState, useContext } from "react";
import { AppContext } from "../../context/AppContext";
import {
  Sparkles,
  Upload,
  BookOpen,
  Award,
  ChevronDown,
  ChevronUp,
  FileText,
  HelpCircle,
  CheckCircle2,
  History,
  Lock,
  RefreshCw,
  FileCode,
  Check,
  AlertCircle,
  Brain,
  List,
  Compass,
  FileSpreadsheet,
  PenTool,
  HelpCircle as QuestionIcon,
  Smile
} from "lucide-react";

export default function AiHomeworkAssistant({ setActiveTab }) {
  const {
    activeSubscription,
    homeworkAssistantRecords,
    analyzeHomework,
    currentProfile
  } = useContext(AppContext);

  // Form states
  const [subject, setSubject] = useState("Mathematics");
  const [studentPrompt, setStudentPrompt] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [fileBase64, setFileBase64] = useState("");
  const [isAnalyzing, setIsLoadingAnalysis] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // UI Navigation / Selected Record states
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState("concepts");
  const [practiceInput, setPracticeInput] = useState("");
  const [showPracticeSolution, setShowPracticeSolution] = useState(false);
  const [practiceCheckMsg, setPracticeCheckMsg] = useState("");
  const [unlockedHints, setExpandedHints] = useState({ 1: false, 2: false });
  
  // Interactive Quiz & Reflection States
  const [quizAnswersChecked, setQuizAnswersChecked] = useState(false);
  const [quizStudentAnswers, setQuizStudentAnswers] = useState({ q1: "", q2: "", q3: "" });
  const [reflectionInput, setReflectionInput] = useState("");
  const [reflectionSaved, setReflectionSaved] = useState(false);

  // Get active subscription and count limits
  const planName = activeSubscription?.plan_name || "Free";
  const isPremiumPlan = planName !== "Free" && planName !== "Student AI Basic";
  
  // Basic plan has a limit of 10 uploads. Free has limited access.
  const recordsCount = homeworkAssistantRecords?.length || 0;
  const isLimitExceeded = planName === "Free" && recordsCount >= 1; // Free tier gets 1 test upload
  const isBasicLimitExceeded = planName === "Student AI Basic" && recordsCount >= 10;

  // Drag and drop states
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = (file) => {
    if (!file) return;
    
    // Check file size (limit to 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg("File is too large. Maximum supported size is 10MB.");
      return;
    }

    setUploadedFile(file);
    setErrorMsg("");

    // Convert file to Base64
    const reader = new FileReader();
    reader.onload = () => {
      setFileBase64(reader.result);
    };
    reader.onerror = () => {
      setErrorMsg("Failed to read file.");
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const triggerAnalysis = async (e) => {
    e.preventDefault();
    if (isLimitExceeded || isBasicLimitExceeded) {
      setErrorMsg(`Your subscription plan (${planName}) has reached its AI assistant limits. Please upgrade to unlock unlimited analysis.`);
      return;
    }

    if (!uploadedFile) {
      setErrorMsg("Please upload a worksheet file or screenshot (PDF, Word, Image, DOCX, Handwritten).");
      return;
    }

    setIsLoadingAnalysis(true);
    setErrorMsg("");
    setShowPracticeSolution(false);
    setPracticeInput("");
    setPracticeCheckMsg("");
    setExpandedHints({ 1: false, 2: false });
    setQuizAnswersChecked(false);
    setQuizStudentAnswers({ q1: "", q2: "", q3: "" });
    setReflectionInput("");
    setReflectionSaved(false);

    try {
      const payload = {
        subject,
        file_name: uploadedFile.name,
        file_type: uploadedFile.type,
        file_size: uploadedFile.size,
        student_prompt: studentPrompt || "Please analyze this worksheet and guide me.",
        file_base64: fileBase64
      };

      const result = await analyzeHomework(payload);
      setSelectedRecord(result);
      setActiveWorkspaceTab("concepts");
      // Clean form
      setUploadedFile(null);
      setFileBase64("");
      setStudentPrompt("");
    } catch (err) {
      setErrorMsg(err.message || "An unexpected error occurred during AI analysis.");
    } finally {
      setIsLoadingAnalysis(false);
    }
  };

  const handleSelectRecord = (rec) => {
    setSelectedRecord(rec);
    setActiveWorkspaceTab("concepts");
    setShowPracticeSolution(false);
    setPracticeInput("");
    setPracticeCheckMsg("");
    setExpandedHints({ 1: false, 2: false });
    setQuizAnswersChecked(false);
    setQuizStudentAnswers({ q1: "", q2: "", q3: "" });
    setReflectionInput("");
    setReflectionSaved(false);
  };

  const toggleHint = (num) => {
    setExpandedHints(prev => ({
      ...prev,
      [num]: !prev[num]
    }));
  };

  const checkPracticeTry = () => {
    if (!practiceInput.trim()) return;
    setPracticeCheckMsg("🎯 Outstanding effort! Verify your practice derivation against the structured AI Practice Solution below.");
    setShowPracticeSolution(true);
  };

  const handleSaveReflection = () => {
    if (!reflectionInput.trim()) return;
    setReflectionSaved(true);
  };

  return (
    <div className="ai-homework-assistant-workspace page-container animate-fade-in">
      
      {/* Premium Header */}
      <section className="assistant-hero mb-6 text-center">
        <span className="section-subtitle flex items-center justify-center gap-2">
          <Sparkles className="h-4 w-4 text-purple-400 animate-spin" />
          AMBIENCE SCHOLAR AI
        </span>
        <h2>Interactive Flagship Homework Assistant</h2>
        <p className="hero-subtitle text-slate-300 max-w-2xl mx-auto">
          Upload PDFs, worksheets, documents, essay prompts, coding assignments, or handwritten homework screenshots. 
          Our advanced Socratic Tutor analyzes assignments and organizes core feedback into exactly 9 educational segments.
        </p>
      </section>

      {/* Grid Layout: Controls & Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: File uploader & History ledger */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Uploader Card */}
          <div className="panel-card p-6 border border-slate-700 bg-slate-900/60 backdrop-blur-md rounded-2xl">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Upload className="text-purple-400 h-5 w-5" />
              Upload Homework Worksheet
            </h3>
            
            <form onSubmit={triggerAnalysis} className="flex flex-col gap-4">
              
              {/* Subject Select */}
              <div className="form-group flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wide">Subject Area</label>
                <select 
                  value={subject} 
                  onChange={(e) => setSubject(e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="Mathematics">Mathematics</option>
                  <option value="Science">Science / Chemistry / Biology</option>
                  <option value="English / Language Arts">English / Language Arts</option>
                  <option value="History / Social Studies">History / Social Studies</option>
                  <option value="Bible Study">Bible Study</option>
                  <option value="Computer / Technology">Computer / Technology</option>
                </select>
              </div>

              {/* Drag and Drop Zone Accept Types */}
              <div 
                className={`border-2 border-dashed rounded-xl p-5 text-center flex flex-col items-center justify-center transition-all cursor-pointer ${
                  dragActive ? "border-purple-500 bg-purple-500/10" : "border-slate-700 hover:border-slate-600 bg-slate-950/40"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => document.getElementById("hw-file-input").click()}
              >
                <input 
                  type="file" 
                  id="hw-file-input" 
                  className="hidden" 
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                />
                
                {uploadedFile ? (
                  <div className="flex flex-col items-center gap-2 text-purple-300 animate-scale-up">
                    <FileText className="h-10 w-10 text-purple-400" />
                    <span className="font-semibold text-sm truncate max-w-[200px]">{uploadedFile.name}</span>
                    <span className="text-xs text-slate-400">{(uploadedFile.size / 1024).toFixed(1)} KB</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <Upload className="h-10 w-10 text-slate-500 animate-bounce" />
                    <span className="text-sm font-semibold">Drop assignment file or screenshot here</span>
                    <span className="text-[10px] text-slate-500 max-w-[280px] mx-auto leading-relaxed mt-1 block">
                      Supports PDF, DOCX, Images, Screenshots, Handwritten papers, Math & Science worksheets, Essay prompts, Coding files
                    </span>
                  </div>
                )}
              </div>

              {/* Optional Prompt */}
              <div className="form-group flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wide">Specific Question or Help needed (Optional)</label>
                <textarea
                  rows="3"
                  value={studentPrompt}
                  onChange={(e) => setStudentPrompt(e.target.value)}
                  placeholder="e.g. Please help me with question 5, or explain the step with the quadratic discriminant."
                  className="bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-purple-500 placeholder-slate-500 resize-none"
                />
              </div>

              {/* Error messages */}
              {errorMsg && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg flex items-start gap-2 text-rose-300 text-xs">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isAnalyzing || isLimitExceeded || isBasicLimitExceeded}
                className="btn-primary-glowing w-full mt-2 py-3 font-semibold rounded-lg flex items-center justify-center gap-2 text-white bg-gradient-to-r from-indigo-500 to-purple-600 disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Analyzing with Scholar AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Analyze with Scholar AI</span>
                  </>
                )}
              </button>

              {/* Usage stats banner */}
              <div className="mt-2 text-center text-xs text-slate-400 border-t border-slate-800 pt-3">
                Plan level: <strong className="text-purple-300">{planName}</strong>
                {planName === "Free" && (
                  <p className="mt-1 text-slate-500">Demo Limit: {recordsCount}/1 worksheets analyzed.</p>
                )}
                {planName === "Student AI Basic" && (
                  <p className="mt-1 text-slate-500">Monthly Limit: {recordsCount}/10 worksheets analyzed.</p>
                )}
                {isPremiumPlan && (
                  <p className="mt-1 text-emerald-400 font-medium">✨ Unlimited premium workspace analysis unlocked!</p>
                )}
              </div>

              {(planName === "Free" || planName === "Student AI Basic") && (
                <div className="mt-3 p-3 bg-purple-950/40 border border-purple-500/20 rounded-xl text-center">
                  <p className="text-xs text-slate-300 leading-normal">
                    Upgrade to <strong className="text-purple-400">Student AI Plus</strong> to unlock unlimited homework uploads, step-by-step solutions, and practice drills!
                  </p>
                  {setActiveTab && (
                    <button
                      type="button"
                      onClick={() => setActiveTab("Subscription")}
                      className="mt-2 w-full py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold transition-all"
                    >
                      Upgrade Now
                    </button>
                  )}
                </div>
              )}

            </form>
          </div>

          {/* History Ledger Card */}
          <div className="panel-card p-5 border border-slate-700 bg-slate-900/60 backdrop-blur-md rounded-2xl flex-1 flex flex-col min-h-[250px]">
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <History className="text-indigo-400 h-5 w-5" />
              My Workspace History
            </h3>
            
            {homeworkAssistantRecords?.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-4 text-center">
                <FileCode className="h-10 w-10 mb-2 opacity-30" />
                <p className="text-xs">No worksheets analyzed yet. Upload your first homework to begin learning!</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto max-h-[350px] flex flex-col gap-2.5 custom-scrollbar pr-1">
                {homeworkAssistantRecords.map((rec) => (
                  <button
                    key={rec.id}
                    onClick={() => handleSelectRecord(rec)}
                    className={`text-left p-3 rounded-xl border transition-all flex flex-col gap-1 ${
                      selectedRecord?.id === rec.id
                        ? "bg-purple-600/20 border-purple-500/50"
                        : "bg-slate-950/40 border-slate-800 hover:bg-slate-950/70"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-sm text-white truncate max-w-[150px]">{rec.file_name}</span>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                        {rec.subject}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate">{rec.student_prompt || "Conceptual guidance"}</p>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1 border-t border-slate-800/60 pt-1.5">
                      <span>{new Date(rec.created_at).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1 text-emerald-400">
                        <Award className="h-3 w-3" /> Mastery {rec.mastery_score}%
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Dynamic Workspace Screen containing 5 Premium Interactive Tabs */}
        <div className="lg:col-span-8">
          {selectedRecord ? (
            <div className="workspace-panel flex flex-col gap-6 animate-scale-up">
              
              {/* Workspace Header Panel */}
              <div className="panel-card p-6 border border-slate-700 bg-slate-900/60 backdrop-blur-md rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-purple-400 uppercase tracking-widest">{selectedRecord.subject} Workspace</span>
                  <h3 className="text-2xl font-bold text-white mt-1">{selectedRecord.file_name}</h3>
                  <p className="text-xs text-slate-400 mt-1">Uploaded on {new Date(selectedRecord.created_at).toLocaleString()}</p>
                </div>
                
                {/* Mastery Radial Info */}
                <div className="flex items-center gap-3 bg-slate-950/50 border border-slate-800/80 p-3 rounded-xl self-start md:self-auto">
                  <div className="relative h-12 w-12 flex items-center justify-center rounded-full bg-slate-900">
                    <svg className="absolute inset-0 h-full w-full transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-slate-800"
                        strokeWidth="3"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-purple-500"
                        strokeDasharray={`${selectedRecord.mastery_score}, 100`}
                        strokeWidth="3"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <span className="text-xs font-black text-white z-10">{selectedRecord.mastery_score}%</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Concept Mastery</span>
                    <strong className="text-sm text-emerald-400">
                      {selectedRecord.mastery_score >= 85 ? "Excellent Stand" : selectedRecord.mastery_score >= 70 ? "Competent" : "Needs Review"}
                    </strong>
                  </div>
                </div>
              </div>

              {/* GORGEOUS SaaS HORIZONTAL WORKSPACE TABS (Exposing the 9 response sections) */}
              <div className="flex border-b border-slate-800 bg-slate-950/40 p-1.5 rounded-xl gap-1">
                <button
                  onClick={() => setActiveWorkspaceTab("concepts")}
                  className={`flex-1 py-3 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    activeWorkspaceTab === "concepts"
                      ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20"
                      : "text-slate-400 hover:text-white hover:bg-slate-850"
                  }`}
                >
                  <BookOpen className="h-4 w-4" />
                  <span className="hidden md:inline">1. Concept Overview & Pitfalls</span>
                  <span className="md:hidden">Concepts</span>
                </button>

                <button
                  onClick={() => setActiveWorkspaceTab("guidance")}
                  className={`flex-1 py-3 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    activeWorkspaceTab === "guidance"
                      ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20"
                      : "text-slate-400 hover:text-white hover:bg-slate-850"
                  }`}
                >
                  <Compass className="h-4 w-4" />
                  <span className="hidden md:inline">2. Socratic Guidance</span>
                  <span className="md:hidden">Guidance</span>
                </button>

                <button
                  onClick={() => setActiveWorkspaceTab("step_solution")}
                  className={`flex-1 py-3 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 relative ${
                    activeWorkspaceTab === "step_solution"
                      ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20"
                      : "text-slate-400 hover:text-white hover:bg-slate-850"
                  }`}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="hidden md:inline">3. Step Solution</span>
                  <span className="md:hidden">Solution</span>
                  {!isPremiumPlan && (
                    <span className="absolute -top-1 -right-1 bg-amber-500 text-[8px] font-black text-slate-950 px-1 rounded animate-pulse">PRO</span>
                  )}
                </button>

                <button
                  onClick={() => setActiveWorkspaceTab("practice_quiz")}
                  className={`flex-1 py-3 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    activeWorkspaceTab === "practice_quiz"
                      ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20"
                      : "text-slate-400 hover:text-white hover:bg-slate-850"
                  }`}
                >
                  <Award className="h-4 w-4" />
                  <span className="hidden md:inline">4. Practice & Quiz</span>
                  <span className="md:hidden">Practice</span>
                </button>

                <button
                  onClick={() => setActiveWorkspaceTab("metacognition")}
                  className={`flex-1 py-3 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    activeWorkspaceTab === "metacognition"
                      ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20"
                      : "text-slate-400 hover:text-white hover:bg-slate-850"
                  }`}
                >
                  <Brain className="h-4 w-4" />
                  <span className="hidden md:inline">5. Reflection</span>
                  <span className="md:hidden">Reflection</span>
                </button>
              </div>

              {/* TAB CONTENT 1: CONCEPTS & COMMON MISTAKES */}
              {activeWorkspaceTab === "concepts" && (
                <div className="flex flex-col gap-6 animate-scale-up">
                  {/* Block 1: Concept Overview */}
                  <div className="panel-card p-6 border border-slate-700 bg-slate-900/60 backdrop-blur-md rounded-2xl">
                    <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2 border-b border-slate-800 pb-2">
                      <BookOpen className="text-purple-400 h-5 w-5" />
                      Concept Overview
                    </h4>
                    <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                      {selectedRecord.concept_explanation}
                    </p>
                  </div>

                  {/* Block 2: Common Mistakes */}
                  <div className="panel-card p-6 border border-slate-700 bg-slate-900/60 backdrop-blur-md rounded-2xl border-l-4 border-l-amber-500">
                    <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2 border-b border-slate-800 pb-2">
                      <AlertCircle className="text-amber-400 h-5 w-5" />
                      Typical Pitfalls & Common Mistakes
                    </h4>
                    <div className="bg-slate-950/40 p-4 border border-slate-850 rounded-xl">
                      <p className="text-slate-300 text-sm whitespace-pre-wrap leading-relaxed">
                        {selectedRecord.common_mistakes || 
                         "• Unbalanced reaction coefficients on diatomic compounds.\n• Signs reversals during subtraction on matrix rows.\n• Overlooking independent limits during derivation."}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB CONTENT 2: SOCRATIC GUIDANCE (HINTS & WALKTHROUGH) */}
              {activeWorkspaceTab === "guidance" && (
                <div className="flex flex-col gap-6 animate-scale-up">
                  {/* Block 3 & 4: Sequential Hints */}
                  <div className="panel-card p-6 border border-slate-700 bg-slate-900/60 backdrop-blur-md rounded-2xl">
                    <h4 className="text-lg font-bold text-white mb-2 flex items-center gap-2 border-b border-slate-800 pb-2">
                      <HelpCircle className="text-amber-400 h-5 w-5 animate-pulse" />
                      Socratic Clues & Tutoring Hints
                    </h4>
                    <p className="text-xs text-slate-400 mb-4">
                      Need a nudge? Unlock our interactive hints sequentially. Each click reveals deeper strategic direction without giving away the final calculation.
                    </p>

                    <div className="flex flex-col gap-3">
                      {/* Hint 1 */}
                      <div className="border border-slate-800 bg-slate-950/20 rounded-xl overflow-hidden">
                        <button
                          type="button"
                          onClick={() => toggleHint(1)}
                          className="w-full flex items-center justify-between p-3 text-left font-semibold text-sm text-slate-200 hover:bg-slate-850 transition-colors focus:outline-none"
                        >
                          <span className="flex items-center gap-2 text-indigo-400">
                            <span className="bg-indigo-500/10 px-2 py-0.5 rounded text-xs font-bold">1</span>
                            Conceptual Prompt (Clue 1)
                          </span>
                          {unlockedHints[1] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>
                        {unlockedHints[1] && (
                          <div className="p-4 text-xs text-slate-300 border-t border-slate-800 bg-slate-950/40 animate-scale-up">
                            {selectedRecord.hints[0] || "Review your curriculum definitions before executing formulas."}
                          </div>
                        )}
                      </div>

                      {/* Hint 2 */}
                      <div className="border border-slate-800 bg-slate-950/20 rounded-xl overflow-hidden">
                        <button
                          type="button"
                          onClick={() => toggleHint(2)}
                          className="w-full flex items-center justify-between p-3 text-left font-semibold text-sm text-slate-200 hover:bg-slate-850 transition-colors focus:outline-none"
                        >
                          <span className="flex items-center gap-2 text-amber-400">
                            <span className="bg-amber-500/10 px-2 py-0.5 rounded text-xs font-bold">2</span>
                            Methodology Guide (Clue 2)
                          </span>
                          {unlockedHints[2] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>
                        {unlockedHints[2] && (
                          <div className="p-4 text-xs text-slate-300 border-t border-slate-800 bg-slate-950/40 animate-scale-up">
                            {selectedRecord.hints[1] || "Focus on isolating parameters and factoring intermediate states."}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Block 5: Guided Walkthrough */}
                  <div className="panel-card p-6 border border-slate-700 bg-slate-900/60 backdrop-blur-md rounded-2xl">
                    <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2 border-b border-slate-800 pb-2">
                      <Compass className="text-teal-400 h-5 w-5" />
                      Guided Walkthrough (Logical Blueprint)
                    </h4>
                    <div className="bg-slate-950/40 p-4 border border-slate-850 rounded-xl">
                      <p className="text-slate-300 text-sm whitespace-pre-wrap leading-relaxed">
                        {selectedRecord.guided_walkthrough || 
                         "1. Isolate the main variables given in the prompt.\n2. Write down the matching formula or core literary concept.\n3. Draft intermediate steps logically, tracking signs and constraints.\n4. Check if the units or overall theme align back with the baseline question."}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB CONTENT 3: STEP-BY-STEP SOLUTIONS */}
              {activeWorkspaceTab === "step_solution" && (
                <div className="flex flex-col gap-6 animate-scale-up">
                  {/* Block 6: Step Solution */}
                  <div className="panel-card p-6 border border-slate-700 bg-slate-900/60 backdrop-blur-md rounded-2xl">
                    <h4 className="text-lg font-bold text-white mb-3 flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="flex items-center gap-2">
                        <CheckCircle2 className="text-purple-400 h-5 w-5" />
                        Complete Step-by-Step Solution Derivation
                      </span>
                      {!isPremiumPlan && (
                        <span className="text-[10px] uppercase bg-slate-950 px-2 py-1 rounded text-amber-400 font-bold border border-amber-500/30 flex items-center gap-1">
                          <Lock className="h-3 w-3" /> Basic Mode Locked
                        </span>
                      )}
                    </h4>
                    
                    {isPremiumPlan ? (
                      <div className="bg-slate-950/60 p-4 border border-slate-800/80 rounded-xl font-mono">
                        <pre className="text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
                          {selectedRecord.step_by_step}
                        </pre>
                      </div>
                    ) : (
                      <div className="premium-upgrade-card text-center p-8 bg-gradient-to-br from-slate-900 via-purple-950/10 to-slate-900 rounded-2xl border border-purple-500/20 shadow-xl shadow-purple-500/5 relative overflow-hidden flex flex-col items-center gap-4 animate-scale-up">
                        <div className="absolute top-0 right-0 h-24 w-24 bg-purple-500/10 rounded-full blur-2xl"></div>
                        <div className="h-14 w-14 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                          <Lock className="h-7 w-7 animate-pulse" />
                        </div>
                        <div>
                          <h5 className="font-extrabold text-white text-base tracking-tight flex items-center justify-center gap-1.5">
                            🔒 Premium Feature
                          </h5>
                          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-5">
                            Rigorous mathematical and concept derivations are unlocked under Student AI Plus plans.
                          </p>
                          <div className="flex flex-col gap-2 max-w-xs mx-auto mb-6 text-left border-t border-slate-800/80 pt-4">
                            <div className="flex items-center gap-2 text-xs text-slate-300 font-semibold">
                              <span className="text-purple-400 font-black">✓</span> Unlock Unlimited Homework Uploads
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-300 font-semibold">
                              <span className="text-purple-400 font-black">✓</span> Unlock Unlimited AI Practice
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-300 font-semibold">
                              <span className="text-purple-400 font-black">✓</span> Unlock Step-by-Step Solutions
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-300 font-semibold">
                              <span className="text-purple-400 font-black">✓</span> Unlock SAT & ACT Preparation
                            </div>
                          </div>
                          {setActiveTab && (
                            <button
                              type="button"
                              onClick={() => setActiveTab("Subscription")}
                              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white rounded-xl text-xs font-black transition-all shadow-md shadow-purple-500/20"
                            >
                              Upgrade to Student AI Plus ⭐
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB CONTENT 4: PRACTICE PROBLEMS & INTERACTIVE MINI QUIZ */}
              {activeWorkspaceTab === "practice_quiz" && (
                <div className="flex flex-col gap-6 animate-scale-up">
                  {/* Block 7: Similar Practice Drill */}
                  {selectedRecord.practice_problems && (
                    <div className="panel-card p-6 border border-slate-700 bg-slate-900/60 backdrop-blur-md rounded-2xl">
                      <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2 border-b border-slate-800 pb-2">
                        <Award className="text-emerald-400 h-5 w-5 animate-spin" style={{ animationDuration: "12s" }} />
                        Reinforce Concept: Practice Drill
                      </h4>
                      <p className="text-slate-300 text-sm leading-relaxed font-semibold bg-slate-950/30 p-4 rounded-xl border border-slate-800">
                        {selectedRecord.practice_problems.problem || "Solve x² - 8x + 15 = 0 and prove your solution approach step-by-step."}
                      </p>

                      <div className="mt-4">
                        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wide">Submit your solution approach or answer</label>
                        <textarea
                          rows="3"
                          value={practiceInput}
                          onChange={(e) => setPracticeInput(e.target.value)}
                          placeholder="Type your practice derivation or final answer here..."
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 mt-1 text-white text-xs focus:outline-none focus:border-purple-500 placeholder-slate-500 resize-none"
                        />
                        
                        <button
                          type="button"
                          onClick={checkPracticeTry}
                          disabled={!practiceInput.trim()}
                          className="mt-2.5 px-4 py-2 text-xs font-bold rounded-lg text-white bg-indigo-600 hover:bg-indigo-500 transition-colors disabled:opacity-50"
                        >
                          Verify Solution & Unlock Derivation
                        </button>

                        {practiceCheckMsg && (
                          <div className="mt-3 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-start gap-2 text-emerald-300 text-xs animate-scale-up">
                            <Check className="h-4 w-4 shrink-0 mt-0.5 text-emerald-400" />
                            <span>{practiceCheckMsg}</span>
                          </div>
                        )}

                        {showPracticeSolution && (
                          <div className="mt-4 bg-slate-950/80 p-4 border border-slate-850 rounded-xl animate-scale-up">
                            <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 block border-b border-emerald-900/30 pb-1">AI Practice Solution Derivation</span>
                            <pre className="text-xs text-slate-300 whitespace-pre-wrap font-mono leading-relaxed mt-2.5">
                              {selectedRecord.practice_problems.solution || "Complete step-by-step derivation: factor (x-3)(x-5)=0, roots are 3 and 5."}
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Block 8: Interactive Mini Quiz */}
                  <div className="panel-card p-6 border border-slate-700 bg-slate-900/60 backdrop-blur-md rounded-2xl">
                    <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2 border-b border-slate-800 pb-2">
                      <QuestionIcon className="text-indigo-400 h-5 w-5 animate-pulse" />
                      Concept Check: Mini Quiz
                    </h4>
                    
                    <div className="flex flex-col gap-4">
                      <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-xl text-sm leading-relaxed">
                        <pre className="whitespace-pre-wrap text-slate-300 text-xs font-sans leading-relaxed">
                          {selectedRecord.mini_quiz || 
                           "Q1. Identify coefficients in 2x² - 8x + 6 = 0\nAns: a=2, b=-8, c=6\n\nQ2. What is b²-4ac value?\nAns: 64 - 48 = 16\n\nQ3. Find standard roots.\nAns: Roots are x=3 and x=1."}
                        </pre>
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold text-slate-300">Self-Test Workspace: Write your responses</label>
                        <textarea
                          rows="2"
                          value={quizStudentAnswers.q1}
                          onChange={(e) => setQuizStudentAnswers({...quizStudentAnswers, q1: e.target.value})}
                          placeholder="Your self-test workspace... Try to solve the quiz and write answers here."
                          className="bg-slate-800 border border-slate-700 rounded-lg p-2 mt-1 text-white text-xs focus:outline-none focus:border-purple-500"
                        />
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setQuizAnswersChecked(true)}
                          className="px-4 py-2 text-xs font-bold rounded-lg text-white bg-purple-600 hover:bg-purple-500 transition-colors"
                        >
                          Check & Compare Answers
                        </button>
                        {quizAnswersChecked && (
                          <span className="text-xs text-emerald-400 flex items-center gap-1">
                            <Smile className="h-4 w-4" /> Compare your responses with the balanced answers above! Good job!
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB CONTENT 5: METACOGNITIVE REFLECTION SECTION */}
              {activeWorkspaceTab === "metacognition" && (
                <div className="flex flex-col gap-6 animate-scale-up">
                  {/* Block 9: Metacognitive Reflection */}
                  <div className="panel-card p-6 border border-slate-700 bg-slate-900/60 backdrop-blur-md rounded-2xl border-l-4 border-l-indigo-500">
                    <h4 className="text-lg font-bold text-white mb-2 flex items-center gap-2 border-b border-slate-800 pb-2">
                      <Brain className="text-indigo-400 h-5 w-5 animate-pulse" />
                      Concept Reflection (Metacognition)
                    </h4>
                    <p className="text-xs text-slate-400 mb-4">
                      Reflective thinking locks in deep concepts. Review the conceptual prompt below and record your learning notes in your Student Vault.
                    </p>

                    <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-xl text-sm leading-relaxed mb-4">
                      <strong className="text-indigo-300 text-xs block mb-1">Conceptual Reflection Prompt:</strong>
                      <p className="text-slate-300 text-xs italic">
                        {selectedRecord.reflection || "How can you verify quadratic solutions graphically? If you had a coefficient a < 0, what does it signify?"}
                      </p>
                    </div>

                    <div className="flex flex-col gap-3">
                      <label className="text-xs font-semibold text-slate-300 uppercase tracking-wide">Write your reflective learning log</label>
                      <textarea
                        rows="4"
                        value={reflectionInput}
                        onChange={(e) => setReflectionInput(e.target.value)}
                        placeholder="Explain how you solved this and what core formula rules you now understand. Recording this tracks your overall mastery growth!"
                        className="bg-slate-800 border border-slate-700 rounded-lg p-3 text-white text-xs focus:outline-none focus:border-purple-500 placeholder-slate-500 resize-none"
                      />
                      
                      <button
                        type="button"
                        onClick={handleSaveReflection}
                        disabled={!reflectionInput.trim() || reflectionSaved}
                        className="px-4 py-2.5 text-xs font-bold rounded-lg text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 transition-colors self-start"
                      >
                        {reflectionSaved ? "Saved to AI Study Vault! ✨" : "Record Reflection Log"}
                      </button>

                      {reflectionSaved && (
                        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-300 text-xs animate-scale-up">
                          🎉 Your reflection log has been successfully linked to this assignment! It is now stored in your <strong>AI Study Vault</strong> for future tutor sessions.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="workspace-placeholder text-center p-12 panel-card border border-slate-800 bg-slate-900/30 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center min-h-[400px]">
              <Sparkles className="h-16 w-16 text-purple-400/40 mb-4 animate-pulse" />
              <h3 className="text-2xl font-bold text-white">Ready to study with Scholar AI?</h3>
              <p className="text-slate-400 text-sm max-w-md mt-1.5 leading-relaxed">
                Select an analyzed assignment from your History Ledger or upload a new worksheet file above to begin your interactive study session.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}

// Soli Deo Gloria — Glory to God the Father, God the Son, and God the Holy Spirit.
