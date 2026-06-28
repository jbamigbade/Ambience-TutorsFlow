// Ambience TutorsFlow™ Student AI Study Vault Component
// Soli Deo Gloria — Built with pure architectural beauty, academic excellence, and premium user experience.

import React, { useState, useContext } from "react";
import { AppContext } from "../../context/AppContext";
import {
  Search,
  Filter,
  BookOpen,
  Award,
  Calendar,
  Clock,
  Sparkles,
  X,
  ChevronRight,
  FolderOpen,
  TrendingUp,
  Brain,
  CheckCircle2,
  FileText,
  AlertCircle,
  HelpCircle,
  FileCode,
  ShieldAlert
} from "lucide-react";

export default function AiStudyVault() {
  const { homeworkAssistantRecords, bookings } = useContext(AppContext);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedRecord, setSelectedRecord] = useState(null);

  // Map database subjects to user-friendly tags
  const mapSubjectToTag = (sub) => {
    if (!sub) return "General";
    const s = sub.toLowerCase();
    if (s.includes("math")) return "Math";
    if (s.includes("science") || s.includes("chem") || s.includes("biol")) return "Science";
    if (s.includes("english") || s.includes("lang")) return "English";
    if (s.includes("history") || s.includes("social")) return "History";
    if (s.includes("bible")) return "Bible";
    if (s.includes("comp") || s.includes("tech")) return "Computer Science";
    if (s.includes("sat")) return "SAT";
    if (s.includes("act")) return "ACT";
    return "Other";
  };

  // Subject categories list
  const SUBJECTS = ["All", "Math", "Science", "English", "History", "Bible", "Computer Science", "SAT", "ACT"];
  
  // Format types (based on file names or subjects or prompts)
  const TYPES = ["All", "Homework", "Essays", "Quizzes"];

  const getRecordType = (rec) => {
    const name = (rec.file_name || "").toLowerCase();
    const prompt = (rec.student_prompt || "").toLowerCase();
    if (name.includes("essay") || name.includes("write") || name.includes("prompt") || prompt.includes("essay") || prompt.includes("write")) {
      return "Essays";
    }
    if (name.includes("quiz") || name.includes("test") || name.includes("exam") || prompt.includes("quiz") || prompt.includes("test")) {
      return "Quizzes";
    }
    return "Homework";
  };

  // Filter records
  const filteredRecords = (homeworkAssistantRecords || []).filter((rec) => {
    const mappedSub = mapSubjectToTag(rec.subject);
    const recType = getRecordType(rec);

    const matchesSubject = selectedSubject === "All" || mappedSub === selectedSubject;
    const matchesType = selectedType === "All" || recType === selectedType;
    
    const term = searchQuery.toLowerCase();
    const matchesSearch = 
      (rec.file_name || "").toLowerCase().includes(term) ||
      (rec.subject || "").toLowerCase().includes(term) ||
      (rec.student_prompt || "").toLowerCase().includes(term) ||
      (rec.concept_explanation || "").toLowerCase().includes(term);

    return matchesSubject && matchesType && matchesSearch;
  });

  // Calculate mastery statistics
  const totalUploads = homeworkAssistantRecords?.length || 0;
  const avgMastery = totalUploads > 0 
    ? Math.round(homeworkAssistantRecords.reduce((acc, curr) => acc + (curr.mastery_score || 0), 0) / totalUploads)
    : 0;

  // Count by mapped subject
  const subjectDistribution = (homeworkAssistantRecords || []).reduce((acc, curr) => {
    const tag = mapSubjectToTag(curr.subject);
    acc[tag] = (acc[tag] || 0) + 1;
    return acc;
  }, {});

  // Past interactive tutor sessions (from bookings)
  const pastSessions = (bookings || []).filter(b => {
    const isPast = new Date(b.date) < new Date();
    return isPast;
  });

  return (
    <div className="ai-study-vault-container flex flex-col gap-6">
      
      {/* Header Panel */}
      <section className="vault-hero text-center p-6 border border-slate-800 bg-slate-900/40 backdrop-blur-md rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 h-40 w-40 bg-purple-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 h-40 w-40 bg-indigo-500/5 rounded-full blur-3xl"></div>
        
        <span className="section-subtitle flex items-center justify-center gap-2">
          <FolderOpen className="h-4 w-4 text-purple-400" />
          AI STUDY VAULT
        </span>
        <h2 className="text-2xl font-black text-white mt-1">Your Personal Academic Archive</h2>
        <p className="text-slate-400 text-xs mt-1.5 max-w-lg mx-auto">
          Every uploaded worksheet, Socratic explanation, and feedback log is automatically indexed, analyzed, and stored here for perfect review and revision.
        </p>
      </section>

      {/* Analytics Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Total Documents Card */}
        <div className="panel-card p-5 border border-slate-800 bg-slate-900/40 backdrop-blur-md rounded-2xl flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
            <FileText className="h-6 w-6 text-purple-400" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest block">Stored Explanations</span>
            <strong className="text-2xl font-black text-white">{totalUploads}</strong>
            <span className="text-[10px] text-emerald-400 block mt-0.5">Fully Organized</span>
          </div>
        </div>

        {/* Average Concept Mastery */}
        <div className="panel-card p-5 border border-slate-800 bg-slate-900/40 backdrop-blur-md rounded-2xl flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
            <TrendingUp className="h-6 w-6 text-emerald-400" />
          </div>
          <div className="flex-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest block">Average Concept Mastery</span>
            <div className="flex items-baseline gap-2">
              <strong className="text-2xl font-black text-white">{avgMastery}%</strong>
              <span className={`text-[10px] font-bold ${avgMastery >= 85 ? "text-emerald-400" : avgMastery >= 70 ? "text-indigo-400" : "text-amber-400"}`}>
                {avgMastery >= 85 ? "Outstanding" : avgMastery >= 70 ? "Competent" : "Needs Practice"}
              </span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
              <div 
                className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${avgMastery}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Mastered Subjects */}
        <div className="panel-card p-5 border border-slate-800 bg-slate-900/40 backdrop-blur-md rounded-2xl flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
            <Brain className="h-6 w-6 text-amber-400" />
          </div>
          <div className="flex-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest block">Active Study Subjects</span>
            <strong className="text-2xl font-black text-white">{Object.keys(subjectDistribution).length}</strong>
            <div className="flex gap-1.5 mt-1 overflow-x-auto pb-0.5">
              {Object.keys(subjectDistribution).map(sub => (
                <span key={sub} className="text-[9px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">
                  {sub} ({subjectDistribution[sub]})
                </span>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Main Filter & Search Control Panel */}
      <div className="panel-card p-5 border border-slate-800 bg-slate-900/40 backdrop-blur-md rounded-2xl flex flex-col gap-4">
        
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search documents, formulas, Socratic answers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950/40 border border-slate-800 rounded-xl py-2 px-10 text-white text-xs focus:outline-none focus:border-purple-500 placeholder-slate-500"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute right-3 top-3 text-slate-500 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Subject Filter Row */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
            <Filter className="h-3 w-3 text-purple-400" /> Filter by Subject
          </span>
          <div className="flex flex-wrap gap-1.5">
            {SUBJECTS.map((sub) => (
              <button
                key={sub}
                onClick={() => setSelectedSubject(sub)}
                className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border transition-all ${
                  selectedSubject === sub
                    ? "bg-purple-600 border-purple-500 text-white shadow-md shadow-purple-500/10"
                    : "border-slate-800 bg-slate-950/20 text-slate-400 hover:text-white hover:border-slate-700"
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
        </div>

        {/* Format Type Filter Row */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
            <FileText className="h-3 w-3 text-indigo-400" /> Filter by Material Type
          </span>
          <div className="flex gap-1.5">
            {TYPES.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border transition-all ${
                  selectedType === type
                    ? "bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-500/10"
                    : "border-slate-800 bg-slate-950/20 text-slate-400 hover:text-white hover:border-slate-700"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Grid: Search Results & Tutor Sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Area: Results List (8 columns) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-extrabold text-white flex items-center gap-1.5">
              <FolderOpen className="text-purple-400 h-4 w-4" />
              Archived Explanations ({filteredRecords.length})
            </h4>
            <span className="text-[10px] text-slate-500 font-bold">Click an item to study</span>
          </div>

          {filteredRecords.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredRecords.map((rec) => {
                const subTag = mapSubjectToTag(rec.subject);
                const recType = getRecordType(rec);

                return (
                  <div
                    key={rec.id}
                    onClick={() => setSelectedRecord(rec)}
                    className="panel-card p-4 border border-slate-800 bg-slate-900/20 hover:bg-slate-900/40 hover:border-slate-700 rounded-xl cursor-pointer transition-all flex flex-col justify-between group relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 h-1.5 w-full bg-slate-800 group-hover:bg-purple-600/50 transition-colors"></div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider ${
                          subTag === "Math" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                          subTag === "Science" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                          subTag === "English" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                          subTag === "History" ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" :
                          subTag === "Bible" ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" :
                          "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                        }`}>
                          {subTag}
                        </span>
                        <span className="text-[9px] font-bold text-slate-500 bg-slate-950 px-2 py-0.5 rounded">
                          {recType}
                        </span>
                      </div>

                      <h5 className="font-extrabold text-sm text-white group-hover:text-purple-400 transition-colors truncate">
                        {rec.file_name}
                      </h5>
                      <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 italic">
                        "{rec.student_prompt || "Conceptual guidance worksheet"}"
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(rec.created_at).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1 font-bold text-emerald-400">
                        <Award className="h-3 w-3" />
                        Mastery {rec.mastery_score}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center p-12 border border-slate-800/80 bg-slate-900/10 rounded-2xl flex flex-col items-center justify-center">
              <ShieldAlert className="h-10 w-10 text-slate-600 mb-2 animate-pulse" />
              <h5 className="font-extrabold text-slate-400 text-sm">No Explanations Found</h5>
              <p className="text-[11px] text-slate-500 mt-1 max-w-xs">
                Try refining your filters or search keywords, or upload a worksheet to start archiving.
              </p>
            </div>
          )}
        </div>

        {/* Right Area: Tutor Sessions Review (4 columns) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <h4 className="text-sm font-extrabold text-white flex items-center gap-1.5">
            <Calendar className="text-indigo-400 h-4 w-4" />
            Tutor Sessions Review
          </h4>

          <div className="panel-card p-4 border border-slate-800 bg-slate-900/40 backdrop-blur-md rounded-2xl flex flex-col gap-3 max-h-[400px] overflow-y-auto">
            {pastSessions.length > 0 ? (
              pastSessions.map((session, index) => (
                <div 
                  key={session.id || index}
                  className="bg-slate-950/40 border border-slate-850 p-3 rounded-xl flex flex-col gap-1.5"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <strong className="text-xs text-white block">{session.subject}</strong>
                      <span className="text-[9px] text-slate-400">with {session.tutorName}</span>
                    </div>
                    <span className="text-[9px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-1.5 py-0.5 rounded font-bold">
                      Completed
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-850/60 pt-1.5 mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> {session.date}
                    </span>
                    <span>{session.time}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-500">
                <p className="text-xs">No previous tutoring sessions found in the archive ledger.</p>
                <span className="text-[10px] text-slate-600 block mt-1">Book a session to get custom notes!</span>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* OVERLAY PANEL: REOPEN EXPLANATION DETAILS */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex justify-end animate-fade-in">
          <div className="w-full max-w-2xl bg-slate-900 border-l border-slate-800 h-full overflow-y-auto flex flex-col justify-between shadow-2xl relative">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800 bg-slate-950/40 sticky top-0 z-10 backdrop-blur-md flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest">
                  {selectedRecord.subject} Archive
                </span>
                <h3 className="text-xl font-black text-white mt-1">{selectedRecord.file_name}</h3>
                <p className="text-[10px] text-slate-500">
                  Created on {new Date(selectedRecord.created_at).toLocaleString()}
                </p>
              </div>
              <button 
                onClick={() => setSelectedRecord(null)}
                className="h-8 w-8 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700/60 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body: Display Socratic blocks */}
            <div className="p-6 flex flex-col gap-6 flex-1">
              
              {/* Concept Overview */}
              <div className="bg-slate-950/20 border border-slate-800 p-5 rounded-2xl">
                <h5 className="text-xs font-black text-white uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                  <BookOpen className="text-purple-400 h-4 w-4" /> 1. Concept Overview
                </h5>
                <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {selectedRecord.concept_explanation}
                </p>
              </div>

              {/* Sequential Hints */}
              <div className="bg-slate-950/20 border border-slate-800 p-5 rounded-2xl">
                <h5 className="text-xs font-black text-white uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <HelpCircle className="text-amber-400 h-4 w-4" /> 2. Socratic Hints
                </h5>
                <div className="flex flex-col gap-2.5">
                  <div className="p-3 bg-slate-950/40 border border-slate-850 rounded-xl">
                    <span className="text-[9px] font-bold text-indigo-400 uppercase block mb-1">Hint 1: Clue</span>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {selectedRecord.hints?.[0] || "Review matching conceptual definitions."}
                    </p>
                  </div>
                  <div className="p-3 bg-slate-950/40 border border-slate-850 rounded-xl">
                    <span className="text-[9px] font-bold text-amber-400 uppercase block mb-1">Hint 2: Strategy</span>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {selectedRecord.hints?.[1] || "Focus on factoring or isolating core values."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Guided Walkthrough */}
              <div className="bg-slate-950/20 border border-slate-800 p-5 rounded-2xl">
                <h5 className="text-xs font-black text-white uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                  <Award className="text-teal-400 h-4 w-4" /> 3. Guided Walkthrough
                </h5>
                <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {selectedRecord.guided_walkthrough || "Outline steps to derive solutions carefully."}
                </p>
              </div>

              {/* Step solution */}
              <div className="bg-slate-950/20 border border-slate-800 p-5 rounded-2xl relative overflow-hidden">
                <h5 className="text-xs font-black text-white uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                  <CheckCircle2 className="text-emerald-400 h-4 w-4" /> 4. Step-by-Step Solution
                </h5>
                <pre className="text-[11px] text-emerald-300 bg-slate-950/60 p-4 border border-slate-850 rounded-xl font-mono leading-relaxed whitespace-pre-wrap">
                  {selectedRecord.step_by_step}
                </pre>
              </div>

              {/* Common Mistakes */}
              {selectedRecord.common_mistakes && (
                <div className="bg-slate-950/20 border border-slate-800 p-5 rounded-2xl">
                  <h5 className="text-xs font-black text-white uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                    <AlertCircle className="text-rose-400 h-4 w-4" /> 5. Typical Pitfalls & Common Mistakes
                  </h5>
                  <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap bg-rose-500/5 border border-rose-500/10 p-4 rounded-xl">
                    {selectedRecord.common_mistakes}
                  </p>
                </div>
              )}

              {/* Practice problems */}
              {selectedRecord.practice_problems && (
                <div className="bg-slate-950/20 border border-slate-800 p-5 rounded-2xl">
                  <h5 className="text-xs font-black text-white uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                    <Sparkles className="text-purple-400 h-4 w-4" /> 6. Custom Practice Drill
                  </h5>
                  <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-xl">
                    <p className="text-xs text-slate-300 leading-relaxed font-semibold">
                      {selectedRecord.practice_problems.problem || "Solve similar questions using our modular solver."}
                    </p>
                  </div>
                </div>
              )}

              {/* Mini Quiz */}
              {selectedRecord.mini_quiz && (
                <div className="bg-slate-950/20 border border-slate-800 p-5 rounded-2xl">
                  <h5 className="text-xs font-black text-white uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                    <HelpCircle className="text-indigo-400 h-4 w-4" /> 7. Concept Check: Mini Quiz
                  </h5>
                  <pre className="text-xs text-slate-300 font-sans leading-relaxed whitespace-pre-wrap bg-slate-950/40 p-4 rounded-xl border border-slate-850">
                    {selectedRecord.mini_quiz}
                  </pre>
                </div>
              )}

              {/* Metacognition Reflection */}
              {selectedRecord.reflection && (
                <div className="bg-slate-950/20 border border-slate-800 p-5 rounded-2xl">
                  <h5 className="text-xs font-black text-white uppercase tracking-widest mb-2 flex items-center gap-1.5">
                    <Brain className="text-indigo-400 h-4 w-4 animate-pulse" /> 8. Metacognitive Reflection
                  </h5>
                  <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-xl text-xs leading-relaxed mb-3">
                    <strong className="text-indigo-300 text-[10px] block mb-1">Conceptual Reflection Prompt:</strong>
                    <p className="text-slate-300 italic">"{selectedRecord.reflection}"</p>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-slate-800 bg-slate-950/60 sticky bottom-0 z-10 flex justify-end">
              <button 
                onClick={() => setSelectedRecord(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all"
              >
                Done Reviewing
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

// Soli Deo Gloria — Glory to God the Father, God the Son, and God the Holy Spirit.
