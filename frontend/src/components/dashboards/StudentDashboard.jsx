import React, { useContext, useState } from "react";
import { AppContext } from "../../context/AppContext";
import AiCollaborationHub from "./AiCollaborationHub";
import {
  Sparkles,
  Calendar,
  BookOpen,
  Award,
  Zap,
  CheckCircle2,
  Clock,
  Download,
  AlertTriangle,
  Gift,
  Flame,
  ChevronRight,
  Heart,
  FileText,
  CheckSquare
} from "lucide-react";

export default function StudentDashboard() {
  const {
    students,
    assignments,
    bookings,
    completeAssignment,
    getLevelInfo,
    checkInDaily,
    addStudentReflection,
    updateCharacterGoals,
    CHARACTER_BADGES,
    awardPoints,
    currentProfile,
    isLoading,
    authError,
    practiceTests
  } = useContext(AppContext);

  // Focus on the student linked to active profile, or fallback to first student
  const student = students.find((s) => s.id === currentProfile?.id) || students[0];
  const levelData = getLevelInfo(student.points);

  // Filter assignments & bookings for this student
  const studentAssignments = assignments.filter((asg) => asg.studentId === student.id);
  const studentBookings = bookings.filter((bk) => bk.studentName === student.name);

  const [activeTab, setActiveTab] = useState("Journey"); // Journey, Character, Sessions, Assignments, Resources
  const [checkedInToday, setCheckedInToday] = useState(false);
  const [showRewardModal, setShowRewardModal] = useState(false);

  // Character Journey States
  const [newReflection, setNewReflection] = useState("");
  const [reflectionTheme, setReflectionTheme] = useState("Responsibility");
  const [isEditingGoals, setIsEditingGoals] = useState(false);
  const [editTheme, setEditTheme] = useState(student.weeklyCharacterTheme || "");
  const [editGoals, setEditGoals] = useState(student.leadershipGoals || "");

  // Practice Exams & IEP Checklist States
  const [satSelectedAns, setSatSelectedAns] = useState(null);
  const [satQuizSubmitted, setSatQuizSubmitted] = useState(false);
  const [satQuizIsCorrect, setSatQuizIsCorrect] = useState(false);
  
  // Dynamic Practice Test Workspace States
  const [activePracticeTest, setActivePracticeTest] = useState(null);
  const [studentAnswers, setStudentAnswers] = useState({}); // { questionIndex: choice }
  const [expandedHints, setExpandedHints] = useState({}); // { questionIndex: true/false }
  const [checkedAnswers, setCheckedAnswers] = useState({}); // { questionIndex: { isCorrect, submitted } }
  const [testScore, setTestScore] = useState(null); // { correct, total }
  const [completedTests, setCompletedTests] = useState({}); // { testId: scoreText }
  const [iepChecklist, setIepChecklist] = useState([
    { id: "iep_1", task: "Log into TutorsFlow & check weekly character theme", completed: true },
    { id: "iep_2", task: "Review trigonometry double-angle formulas checklist", completed: false },
    { id: "iep_3", task: "Settle study environment & clear social media distractions", completed: false },
    { id: "iep_4", task: "Complete one SAT Prep Practice problem block", completed: false },
    { id: "iep_5", task: "Spend 5 minutes in prayer or reflection on my goals", completed: true }
  ]);

  const THEMES = [
    "Integrity", "Responsibility", "Respect", "Kindness", "Honesty",
    "Perseverance", "Gratitude", "Self-Control", "Leadership", "Empathy",
    "Time Management", "Digital Citizenship", "Teamwork", "Problem Solving", "Resilience"
  ];

  const handleDailyCheckIn = () => {
    if (!checkedInToday) {
      checkInDaily();
      setCheckedInToday(true);
    }
  };

  const handleReflectionSubmit = (e) => {
    e.preventDefault();
    if (!newReflection.trim()) return;
    addStudentReflection(student.id, newReflection, reflectionTheme);
    setNewReflection("");
  };

  const handleGoalsSubmit = (e) => {
    e.preventDefault();
    updateCharacterGoals(student.id, editTheme, editGoals);
    setIsEditingGoals(false);
  };

  const handleToggleChecklist = (id) => {
    setIepChecklist((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const handleSatQuizSubmit = (e) => {
    e.preventDefault();
    if (satSelectedAns === null) return;
    setSatQuizSubmitted(true);
    if (satSelectedAns === "B") {
      setSatQuizIsCorrect(true);
      awardPoints(50); // Award 50 points to student
    } else {
      setSatQuizIsCorrect(false);
    }
  };

  // Dynamic Practice Test handlers
  const handleStartPracticeTest = (test) => {
    setActivePracticeTest(test);
    setStudentAnswers({});
    setExpandedHints({});
    setCheckedAnswers({});
    setTestScore(null);
  };

  const handleSelectAnswer = (qIndex, choice) => {
    setStudentAnswers((prev) => ({
      ...prev,
      [qIndex]: choice
    }));
  };

  const handleToggleHint = (qIndex) => {
    setExpandedHints((prev) => ({
      ...prev,
      [qIndex]: !prev[qIndex]
    }));
  };

  const handleCheckQuestionAnswer = (qIndex, question) => {
    const chosen = studentAnswers[qIndex];
    if (!chosen) return;
    
    const isCorrect = chosen.trim().toLowerCase() === question.answer.trim().toLowerCase() || 
                      question.answer.trim().toLowerCase().includes(chosen.trim().toLowerCase());
                      
    setCheckedAnswers((prev) => ({
      ...prev,
      [qIndex]: { submitted: true, isCorrect }
    }));
  };

  const handleSubmitPracticeTest = () => {
    if (!activePracticeTest) return;
    
    let correctCount = 0;
    const questions = activePracticeTest.content.questions;
    
    questions.forEach((q, idx) => {
      const chosen = studentAnswers[idx] || "";
      const isCorrect = chosen.trim().toLowerCase() === q.answer.trim().toLowerCase() || 
                        q.answer.trim().toLowerCase().includes(chosen.trim().toLowerCase());
      if (isCorrect) {
        correctCount++;
      }
    });

    setTestScore({ correct: correctCount, total: questions.length });
    setCompletedTests((prev) => ({
      ...prev,
      [activePracticeTest.id]: `${correctCount}/${questions.length} Correct`
    }));

    // Award +50 XP on completion
    awardPoints(50);
  };

  return (
    <div className="dashboard-content animate-fade-in">
      
      {isLoading && (
        <div className="loading-spinner-overlay" style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "15px 20px",
          background: "rgba(30, 41, 59, 0.4)",
          backdropFilter: "blur(12px)",
          borderRadius: "12px",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          margin: "15px 0",
          color: "#94a3b8",
          gap: "12px"
        }}>
          <div className="spinner" style={{
            width: "20px",
            height: "20px",
            border: "3px solid rgba(255,255,255,0.1)",
            borderTop: "3px solid #6366f1",
            borderRadius: "50%",
            animation: "spin 1s linear infinite"
          }}></div>
          <span>Synchronizing live database records...</span>
        </div>
      )}

      {authError && (
        <div className="error-banner" style={{
          padding: "15px",
          background: "rgba(239, 68, 68, 0.1)",
          backdropFilter: "blur(8px)",
          color: "#f87171",
          border: "1px solid rgba(239, 68, 68, 0.2)",
          borderRadius: "12px",
          margin: "15px 0",
          fontSize: "14px"
        }}>
          ⚠️ Database Sync Issue: {authError}
        </div>
      )}
      
      {/* Student Welcome Hero Header */}
      <div className="dashboard-banner student-banner">
        <div className="banner-text">
          <span className="banner-badge">STUDENT PORTAL</span>
          <h1>Welcome Back, {student.name}!</h1>
          <p>
            Your dedication builds character, mastery, and future achievements. Soli Deo Gloria.
          </p>
        </div>
        <div className="streak-widget" onClick={handleDailyCheckIn}>
          <div className={`streak-fire-wrapper ${checkedInToday ? "checked-in" : ""}`}>
            <Flame className="streak-icon" />
            <span>{student.streak}</span>
          </div>
          <button className={`btn-streak-checkin ${checkedInToday ? "disabled" : ""}`} disabled={checkedInToday}>
            {checkedInToday ? "Checked In!" : "Daily Check-in (+15 pts)"}
          </button>
        </div>
      </div>

      {/* Main Student Hub Grid */}
      <div className="dashboard-grid-layout">
        
        {/* Left Column: Navigation Sidebar */}
        <div className="dashboard-sidebar">
          <div className="dashboard-nav-card">
            <h4>Hub Shortcuts</h4>
            <div className="sidebar-nav-list">
              <button className={`sidebar-nav-btn ${activeTab === "Journey" ? "active" : ""}`} onClick={() => setActiveTab("Journey")}>
                <Award className="sidebar-nav-icon" />
                <span>Growth Journey™</span>
                <ChevronRight className="chevron-right-arrow" />
              </button>
              <button className={`sidebar-nav-btn ${activeTab === "Character" ? "active" : ""}`} onClick={() => setActiveTab("Character")}>
                <Heart className="sidebar-nav-icon text-rose-500 animate-pulse" />
                <span>Character Journey™</span>
                <ChevronRight className="chevron-right-arrow" />
              </button>
              <button className={`sidebar-nav-btn ${activeTab === "Sessions" ? "active" : ""}`} onClick={() => setActiveTab("Sessions")}>
                <Calendar className="sidebar-nav-icon" />
                <span>Upcoming Sessions ({studentBookings.length})</span>
                <ChevronRight className="chevron-right-arrow" />
              </button>
              <button className={`sidebar-nav-btn ${activeTab === "Assignments" ? "active" : ""}`} onClick={() => setActiveTab("Assignments")}>
                <BookOpen className="sidebar-nav-icon" />
                <span>My Assignments ({studentAssignments.filter(a => a.status === "Pending").length})</span>
                <ChevronRight className="chevron-right-arrow" />
              </button>
              <button className={`sidebar-nav-btn ${activeTab === "Exams" ? "active" : ""}`} onClick={() => setActiveTab("Exams")}>
                <FileText className="sidebar-nav-icon text-amber-500" />
                <span>Practice Exams</span>
                <ChevronRight className="chevron-right-arrow" />
              </button>
              <button className={`sidebar-nav-btn ${activeTab === "IEP" ? "active" : ""}`} onClick={() => setActiveTab("IEP")}>
                <CheckSquare className="sidebar-nav-icon text-teal-500" />
                <span>IEP Support</span>
                <ChevronRight className="chevron-right-arrow" />
              </button>
              <button className={`sidebar-nav-btn ${activeTab === "Resources" ? "active" : ""}`} onClick={() => setActiveTab("Resources")}>
                <Download className="sidebar-nav-icon" />
                <span>Study Resources</span>
                <ChevronRight className="chevron-right-arrow" />
              </button>
              <button className={`sidebar-nav-btn ${activeTab === "Collaboration" ? "active" : ""}`} onClick={() => setActiveTab("Collaboration")}>
                <BookOpen className="sidebar-nav-icon text-indigo-400" />
                <span>Collaboration Hub</span>
                <ChevronRight className="chevron-right-arrow" />
              </button>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="academic-standing-card">
            <h4>Academic Overview</h4>
            <div className="progress-radial-container">
              <div className="circular-progress-bar">
                <span className="progress-value">{student.overallProgress}%</span>
              </div>
              <p>Overall Curriculum Mastery</p>
            </div>
            <div className="subject-grades-list">
              {student.subjects.map((subj) => (
                <div key={subj.name} className="subject-grade-row">
                  <span>{subj.name}</span>
                  <strong>{subj.grade} ({subj.progress}%)</strong>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Panel Body */}
        <div className="dashboard-main-panel">
          
          {/* Growth Journey Panel */}
          {activeTab === "Journey" && (
            <div className="panel-card animate-scale-up">
              <div className="panel-card-header">
                <h3>Growth Journey™ Level Tracker</h3>
                <span className="current-level-tag" style={{ background: levelData.current.color }}>
                  {levelData.current.badge} {levelData.current.name} Rank
                </span>
              </div>

              <div className="journey-interactive-map">
                <div className="map-badge-display" style={{ background: levelData.current.gradient }}>
                  <span className="map-badge-icon">{levelData.current.badge}</span>
                  <h2>{levelData.current.name}</h2>
                  <p>XP Level State • {student.points} Points Earned</p>
                </div>

                <div className="journey-progress-indicator-box">
                  <div className="progress-text-row">
                    <span>XP Points Meter</span>
                    <span>{student.points} / {levelData.next ? levelData.next.minPoints : "Max"} XP</span>
                  </div>
                  <div className="journey-bar-wrapper">
                    <div className="journey-bar-progress" style={{ width: `${levelData.progress}%` }}></div>
                  </div>
                  {levelData.next ? (
                    <p className="journey-help-p">
                      🌟 Earn <strong>{levelData.next.minPoints - student.points} more points</strong> by checking in or completing assignments to rank up to <strong>{levelData.next.name} {levelData.next.badge}</strong>!
                    </p>
                  ) : (
                    <p className="journey-help-p">👑 Ambassador is the ultimate level of academic mastery! Soli Deo Gloria!</p>
                  )}
                </div>

                <div className="current-level-perks-box">
                  <h5>Active Level Perks</h5>
                  <p>{levelData.current.perks}</p>
                </div>

                <div className="rewards-grid-mini">
                  <div className="reward-item-box locked-v">
                    <span className="reward-box-emoji">🎓</span>
                    <h5>Peer Mentoring Program</h5>
                    <span className="lock-tag">Unlocks at 1500 XP</span>
                  </div>
                  <div className="reward-item-box active-v" onClick={() => setShowRewardModal(true)}>
                    <span className="reward-box-emoji">📜</span>
                    <h5>VIP Cheat-Sheets</h5>
                    <span className="view-reward-btn">Access Files</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Character Journey Panel */}
          {activeTab === "Character" && (
            <div className="panel-card animate-scale-up">
              <div className="panel-card-header">
                <h3>Character Journey™ Pillar</h3>
                <span className="current-level-tag text-white bg-gradient-to-r from-rose-500 to-pink-500">
                  💝 Virtues & Life Skills
                </span>
              </div>

              {/* Weekly Theme & Goals */}
              <div className="character-themes-container bg-gradient-to-br from-indigo-50/50 to-rose-50/30 p-6 rounded-2xl border border-indigo-100/60 mb-6">
                {!isEditingGoals ? (
                  <div>
                    <div className="theme-header-row flex justify-between items-center mb-4">
                      <div>
                        <span className="text-xs font-bold text-indigo-600 tracking-wider uppercase">Weekly Focus Pillar</span>
                        <h4 className="text-2xl font-extrabold text-slate-800">{student.weeklyCharacterTheme}</h4>
                      </div>
                      <button 
                        className="btn-secondary py-1.5 px-4 text-xs font-semibold rounded-lg"
                        onClick={() => {
                          setEditTheme(student.weeklyCharacterTheme);
                          setEditGoals(student.leadershipGoals);
                          setIsEditingGoals(true);
                        }}
                      >
                        ✏️ Refine My Goals
                      </button>
                    </div>
                    
                    <div className="leadership-goals-section border-t border-indigo-100/40 pt-4">
                      <span className="text-xs font-bold text-emerald-600 tracking-wider uppercase">My Leadership Goals</span>
                      <p className="text-slate-700 italic mt-1 font-medium bg-white/70 p-3 rounded-xl border border-indigo-50">
                        " {student.leadershipGoals} "
                      </p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleGoalsSubmit} className="space-y-4 animate-scale-up">
                    <h4 className="font-bold text-indigo-900 text-lg">Update Theme & Leadership Goals</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">Weekly Theme Pillar</label>
                        <input 
                          type="text" 
                          value={editTheme}
                          onChange={(e) => setEditTheme(e.target.value)}
                          className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                          placeholder="e.g. Integrity & Digital Citizenship"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">Leadership Goals</label>
                        <input 
                          type="text" 
                          value={editGoals}
                          onChange={(e) => setEditGoals(e.target.value)}
                          className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                          placeholder="e.g. Help my group finish the trig proofs cleanly."
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <button 
                        type="button" 
                        className="btn-secondary py-1.5 px-4 text-xs rounded-lg"
                        onClick={() => setIsEditingGoals(false)}
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className="btn-primary py-1.5 px-4 text-xs text-white rounded-lg bg-indigo-600 hover:bg-indigo-700"
                      >
                        Save Goals
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Badges and Encouragements Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Character Badges */}
                <div className="badges-card border border-slate-100 p-5 rounded-2xl bg-white shadow-sm">
                  <h4 className="font-extrabold text-slate-800 text-base mb-3 flex items-center gap-2">
                    🎖️ Character Badges Earned
                  </h4>
                  <div className="grid grid-cols-3 gap-3">
                    {CHARACTER_BADGES.map((badge) => {
                      const isUnlocked = student.unlockedBadges?.includes(badge.name);
                      return (
                        <div 
                          key={badge.name} 
                          className={`badge-holder-card p-3 rounded-xl border text-center transition-all ${
                            isUnlocked 
                              ? "bg-amber-50/50 border-amber-200 shadow-sm" 
                              : "bg-slate-50/30 border-slate-100 opacity-40 grayscale"
                          }`}
                          title={badge.desc}
                        >
                          <span className="text-3xl block mb-1">{badge.emoji}</span>
                          <span className="text-[11px] font-bold block leading-tight text-slate-700">{badge.name}</span>
                          <span className="text-[9px] text-slate-500 font-semibold mt-1 block">
                            {isUnlocked ? "Unlocked" : "Locked"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Parent Encouragement Desk */}
                <div className="encouragements-card border border-slate-100 p-5 rounded-2xl bg-white shadow-sm flex flex-col justify-between">
                  <div>
                    <h4 className="font-extrabold text-slate-800 text-base mb-3 flex items-center gap-2">
                      💌 Parent Encouragement Desk
                    </h4>
                    <div className="encouragements-scroller space-y-3 overflow-y-auto max-h-[160px] pr-1">
                      {(!student.parentEncouragements || student.parentEncouragements.length === 0) ? (
                        <p className="text-xs text-slate-400 italic text-center py-6">
                          No encouragement cards loaded yet. Write one as a parent to see it show up here!
                        </p>
                      ) : (
                        student.parentEncouragements.map((enc) => (
                          <div key={enc.id} className="enc-card bg-rose-50/40 p-3 rounded-xl border border-rose-100/50 animate-scale-up">
                            <p className="text-xs text-slate-700 italic font-medium">" {enc.text} "</p>
                            <div className="flex justify-between items-center mt-2 text-[10px] text-rose-600 font-bold">
                              <span>— From {enc.author}</span>
                              <span className="opacity-80">📅 {enc.date}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Reflection Submitter & Log */}
              <div className="reflections-block border border-slate-100 p-5 rounded-2xl bg-white shadow-sm">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Submission Form */}
                  <form onSubmit={handleReflectionSubmit} className="space-y-4">
                    <div>
                      <h4 className="font-extrabold text-slate-800 text-base flex items-center gap-2 mb-1">
                        📝 Log a Growth Reflection™
                      </h4>
                      <p className="text-xs text-slate-500 mb-3">
                        Ponder your efforts. Writing reflection reports awards you <strong>+25 Growth Points</strong>!
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">Select Active Quality</label>
                        <select 
                          value={reflectionTheme} 
                          onChange={(e) => setReflectionTheme(e.target.value)}
                          className="w-full p-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
                        >
                          {THEMES.map(theme => (
                            <option key={theme} value={theme}>{theme}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-end">
                        <span className="text-[11px] text-indigo-600 font-bold bg-indigo-50/50 border border-indigo-100/50 rounded-lg p-2 block w-full text-center">
                          💡 Reflect to Level Up Faster!
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">My Reflection Notes</label>
                      <textarea 
                        rows="3"
                        value={newReflection}
                        onChange={(e) => setNewReflection(e.target.value)}
                        placeholder="Write down how you demonstrated this quality today, how you overcame challenge with prayerful perseverance..."
                        className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                      ></textarea>
                    </div>

                    <button 
                      type="submit" 
                      className="btn-primary-glowing w-full py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-indigo-600 to-rose-600 text-white hover:from-indigo-700 hover:to-rose-700"
                    >
                      Submit Reflection Card (+25 XP)
                    </button>
                  </form>

                  {/* Reflections Log */}
                  <div className="reflections-log-section border-t lg:border-t-0 lg:border-l border-slate-100 pt-4 lg:pt-0 lg:pl-6">
                    <h4 className="font-extrabold text-slate-800 text-base mb-3">
                      📓 Growth Reflection Log
                    </h4>
                    <div className="reflections-scroller space-y-3 overflow-y-auto max-h-[230px] pr-1">
                      {(!student.growthReflections || student.growthReflections.length === 0) ? (
                        <p className="text-xs text-slate-400 italic text-center py-12">
                          No reflections recorded yet. Complete the form to log your first entry!
                        </p>
                      ) : (
                        student.growthReflections.map((refl) => (
                          <div key={refl.id} className="refl-log-card bg-slate-50/50 border border-slate-100 p-3.5 rounded-xl animate-scale-up">
                            <div className="flex justify-between items-center mb-1.5">
                              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600 uppercase tracking-wide">
                                {refl.theme}
                              </span>
                              <span className="text-[10px] text-slate-400 font-medium">📅 {refl.date}</span>
                            </div>
                            <p className="text-xs text-slate-600 font-medium leading-relaxed">
                              {refl.text}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* Upcoming Sessions Panel */}
          {activeTab === "Sessions" && (
            <div className="panel-card animate-scale-up">
              <div className="panel-card-header">
                <h3>My Upcoming Tutorials</h3>
                <p>Prepare worksheets and formula sheets ahead of these session slots.</p>
              </div>

              {studentBookings.length === 0 ? (
                <div className="empty-state-view">
                  <Calendar className="empty-state-icon" />
                  <h4>No Sessions Scheduled</h4>
                  <p>You have no active tutorial bookings. Consult your parent to schedule a session!</p>
                </div>
              ) : (
                <div className="bookings-table-wrapper">
                  <div className="dashboard-list">
                    {studentBookings.map((bk) => (
                      <div key={bk.id} className="list-item booking-item">
                        <div className="item-meta">
                          <span className="item-icon-circle bg-blue">🎓</span>
                          <div>
                            <h4>{bk.subject} Session</h4>
                            <p>Taught by: <strong>{bk.tutorName}</strong></p>
                            {bk.zoomJoinUrl && (
                              <a
                                href={bk.zoomJoinUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="zoom-btn join-zoom-btn animate-pulse"
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "0.5rem",
                                  marginTop: "0.6rem",
                                  padding: "0.4rem 0.8rem",
                                  backgroundColor: "#2d8cff",
                                  color: "white",
                                  borderRadius: "6px",
                                  fontSize: "0.75rem",
                                  fontWeight: "bold",
                                  textDecoration: "none",
                                  boxShadow: "0 0 10px rgba(45, 140, 255, 0.4)",
                                  transition: "transform 0.2s ease"
                                }}
                              >
                                <span style={{ marginRight: "4px" }}>📹</span> Join Zoom Classroom
                              </a>
                            )}
                          </div>
                        </div>
                        <div className="item-schedule-info text-right">
                          <p className="schedule-date">📅 {bk.date}</p>
                          <p className="schedule-time">⏰ {bk.time}</p>
                        </div>
                        <div className="item-status-pill">
                          <span className="status-pill confirmed">Active</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Assignments Panel */}
          {activeTab === "Assignments" && (
            <div className="panel-card animate-scale-up">
              <div className="panel-card-header">
                <h3>My Assignments Ledger</h3>
                <p>Complete your assignments to earn massive points towards your Growth Journey™ rank!</p>
              </div>

              <div className="assignments-tab-list">
                {studentAssignments.length === 0 ? (
                  <div className="empty-state-view">
                    <BookOpen className="empty-state-icon" />
                    <h4>All Caught Up!</h4>
                    <p>No assignments currently listed. Keep up the brilliant effort!</p>
                  </div>
                ) : (
                  <div className="assignments-table">
                    {studentAssignments.map((asg) => (
                      <div key={asg.id} className={`assignment-row-card ${asg.status.toLowerCase()}`}>
                        <div className="asg-row-left">
                          <div className={`asg-status-icon ${asg.status.toLowerCase()}`}>
                            {asg.status === "Completed" ? <CheckCircle2 /> : <Clock />}
                          </div>
                          <div>
                            <h4>{asg.title}</h4>
                            <p className="asg-desc">{asg.desc}</p>
                            <div className="asg-meta-row">
                              <span className="asg-subj-tag">{asg.subject}</span>
                              <span className="asg-due-date">Due: {asg.dueDate}</span>
                            </div>
                          </div>
                        </div>

                        <div className="asg-row-right text-right">
                          <span className="asg-points-pill">+{asg.points} XP</span>
                          {asg.status === "Pending" ? (
                            <button
                              className="btn-complete-asg"
                              onClick={() => completeAssignment(asg.id)}
                            >
                              Mark as Completed
                            </button>
                          ) : (
                            <span className="completed-badge">✓ Submitted</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Practice Exams Panel */}
          {activeTab === "Exams" && (
            <div className="panel-card animate-scale-up">
              <div className="panel-card-header">
                <h3>Practice Exams & Diagnostics</h3>
                <p>Track test readiness across national standardized tests. Soli Deo Gloria.</p>
              </div>

              {/* Diagnostic Scorecard */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 p-4 rounded-xl border border-amber-200/50 text-center">
                  <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">SAT Math Readiness</span>
                  <h4 className="text-3xl font-extrabold text-slate-800 mt-1">710 <span className="text-sm font-medium text-slate-500">/ 800</span></h4>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: "88.75%" }}></div>
                  </div>
                  <p className="text-[10px] text-amber-700 font-semibold mt-1">Excellent (Top 10%) • Goal: 760</p>
                </div>

                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 p-4 rounded-xl border border-indigo-200/50 text-center">
                  <span className="text-xs font-bold text-indigo-800 uppercase tracking-wider">SAT Reading/Writing</span>
                  <h4 className="text-3xl font-extrabold text-slate-800 mt-1">680 <span className="text-sm font-medium text-slate-500">/ 800</span></h4>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div className="bg-indigo-500 h-full rounded-full" style={{ width: "85%" }}></div>
                  </div>
                  <p className="text-[10px] text-indigo-700 font-semibold mt-1">Strong (Top 15%) • Goal: 720</p>
                </div>

                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-4 rounded-xl border border-emerald-200/50 text-center">
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Overall Readiness Score</span>
                  <h4 className="text-3xl font-extrabold text-emerald-700 mt-1">87%</h4>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: "87%" }}></div>
                  </div>
                  <p className="text-[10px] text-emerald-700 font-semibold mt-1">Highly Ready for Exam Day!</p>
                </div>
              </div>

              {/* Standardized Tests Selector & Practice Quiz split workspace layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="border border-slate-100 p-5 rounded-2xl bg-white shadow-sm flex flex-col">
                  <h4 className="font-extrabold text-slate-800 text-base mb-2 flex items-center gap-2 text-indigo-700">
                    📝 My Assigned AI Practice Tests
                  </h4>
                  <p className="text-xs text-slate-500 mb-4">
                    Select an AI-generated personalized test to begin your workspace challenge.
                  </p>
                  
                  <div className="space-y-3 overflow-y-auto max-h-[380px] pr-1">
                    {(() => {
                      const assignedTests = practiceTests.filter((t) => t.studentId === student.id || !t.studentId);
                      if (assignedTests.length === 0) {
                        return (
                          <div className="text-center py-12 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                            <p className="text-xs text-slate-400 italic">No personalized practice tests assigned yet.</p>
                            <p className="text-[10px] text-slate-400 mt-1">Check back once your tutor generates a test for you!</p>
                          </div>
                        );
                      }
                      return assignedTests.map((t) => {
                        const scoreText = completedTests[t.id];
                        const isActive = activePracticeTest?.id === t.id;
                        return (
                          <div 
                            key={t.id} 
                            className={`p-3.5 rounded-xl border transition-all ${
                              isActive 
                                ? "bg-indigo-50/50 border-indigo-300 shadow-sm" 
                                : scoreText 
                                  ? "bg-emerald-50/20 border-emerald-200" 
                                  : "border-slate-100 bg-white hover:bg-slate-50/50 hover:shadow-xs"
                            }`}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex flex-wrap gap-1">
                                <span className="text-[9px] font-extrabold px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-md uppercase tracking-wide">
                                  {t.subject}
                                </span>
                                <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wide ${
                                  t.difficulty === "Easy" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                                  t.difficulty === "Hard" ? "bg-rose-50 text-rose-700 border border-rose-100" : 
                                  "bg-amber-50 text-amber-700 border border-amber-100"
                                }`}>
                                  {t.difficulty}
                                </span>
                              </div>
                              <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded">
                                {t.content?.questions?.length || 0} Qs
                              </span>
                            </div>
                            <h5 className="font-extrabold text-slate-800 text-xs mb-1">{t.title}</h5>
                            <p className="text-[10px] text-slate-500 mb-3 font-semibold">
                              Topic: {t.topic} • Grade: {t.gradeLevel}
                            </p>
                            
                            <div className="flex justify-between items-center pt-2 border-t border-slate-50">
                              {scoreText ? (
                                <span className="text-[11px] font-extrabold text-emerald-600 flex items-center gap-1">
                                  ✓ Completed ({scoreText})
                                </span>
                              ) : (
                                <span className="text-[10px] text-slate-400 font-semibold italic">Not Started</span>
                              )}
                              
                              <button
                                onClick={() => handleStartPracticeTest(t)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                  isActive
                                    ? "bg-indigo-600 text-white cursor-default shadow-xs"
                                    : "bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 border border-slate-200/50"
                                }`}
                              >
                                {isActive ? "In Workspace" : "Start Quiz"}
                              </button>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>

                {/* Right Column: Active Practice Workspace or Fallback Quiz */}
                <div className="border border-slate-100 p-5 rounded-2xl bg-white shadow-sm flex flex-col">
                  {activePracticeTest ? (
                    <div className="flex flex-col h-full animate-scale-up">
                      <div className="flex justify-between items-start mb-4 border-b border-slate-100 pb-3">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] font-extrabold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                              Interactive Workspace
                            </span>
                            <span className="text-[9px] font-extrabold text-rose-600 uppercase tracking-wider bg-rose-50 px-2 py-0.5 rounded border border-rose-100 animate-pulse">
                              +50 XP Reward
                            </span>
                          </div>
                          <h4 className="font-extrabold text-slate-800 text-sm mt-1.5">
                            {activePracticeTest.title}
                          </h4>
                          <p className="text-[10px] text-slate-500 mt-0.5 font-semibold">
                            Subject: <strong className="text-slate-700">{activePracticeTest.subject}</strong> • Topic: <strong className="text-slate-700">{activePracticeTest.topic}</strong>
                          </p>
                        </div>
                        <button 
                          onClick={() => setActivePracticeTest(null)}
                          className="text-[11px] text-slate-400 hover:text-rose-600 font-extrabold transition-all border border-slate-100 hover:border-rose-100 rounded-lg px-2 py-1"
                        >
                          ✕ Exit
                        </button>
                      </div>

                      <div className="space-y-5 overflow-y-auto max-h-[380px] pr-1 mb-4">
                        {activePracticeTest.content?.questions?.map((q, qIndex) => {
                          const chosenAnswer = studentAnswers[qIndex];
                          const checked = checkedAnswers[qIndex];
                          const isHintExpanded = expandedHints[qIndex];
                          const isTestSubmitted = testScore !== null;
                          const showPedagogicalResponse = checked?.submitted || isTestSubmitted;
                          
                          // Custom correctness logic
                          const checkCorrect = checked?.isCorrect || (isTestSubmitted && (
                            chosenAnswer?.trim().toLowerCase() === q.answer.trim().toLowerCase() || 
                            q.answer.trim().toLowerCase().includes(chosenAnswer?.trim().toLowerCase())
                          ));

                          return (
                            <div key={q.id || qIndex} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 relative">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-[9px] font-extrabold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                                  QUESTION {qIndex + 1} OF {activePracticeTest.content.questions.length}
                                </span>
                              </div>
                              <p className="text-xs text-slate-700 font-extrabold mb-3 leading-relaxed">
                                {q.question}
                              </p>

                              {/* Render options if multiple choice, else render text input */}
                              {q.options && q.options.length > 0 ? (
                                <div className="grid grid-cols-1 gap-2 mb-3">
                                  {q.options.map((opt, oIdx) => {
                                    const optionLetter = String.fromCharCode(65 + oIdx); // A, B, C, D
                                    const isSelected = chosenAnswer === opt || chosenAnswer === optionLetter;
                                    return (
                                      <label 
                                        key={oIdx} 
                                        className={`flex items-center gap-3 p-2.5 rounded-xl border text-[11px] font-bold cursor-pointer transition-all ${
                                          isSelected 
                                            ? "bg-indigo-50/40 border-indigo-300 text-indigo-800" 
                                            : "border-slate-100 bg-white hover:bg-slate-50/50 text-slate-600"
                                        }`}
                                      >
                                        <input 
                                          type="radio" 
                                          name={`q-${qIndex}`} 
                                          value={opt}
                                          checked={isSelected}
                                          onChange={() => !showPedagogicalResponse && handleSelectAnswer(qIndex, opt)}
                                          disabled={showPedagogicalResponse}
                                          className="text-indigo-600 focus:ring-indigo-400"
                                        />
                                        <span>{opt}</span>
                                      </label>
                                    );
                                  })}
                                </div>
                              ) : (
                                <div className="mb-3">
                                  <input
                                    type="text"
                                    value={chosenAnswer || ""}
                                    onChange={(e) => !showPedagogicalResponse && handleSelectAnswer(qIndex, e.target.value)}
                                    disabled={showPedagogicalResponse}
                                    placeholder="Type your short answer or numerical value here..."
                                    className="w-full p-2.5 text-xs font-bold rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-400 focus:outline-none bg-white text-slate-700"
                                  />
                                </div>
                              )}

                              {/* Interactive Hint Toggle */}
                              <div className="mb-3">
                                <button
                                  type="button"
                                  onClick={() => handleToggleHint(qIndex)}
                                  className="text-[10px] text-amber-600 hover:text-amber-700 font-extrabold flex items-center gap-1 transition-all"
                                >
                                  💡 {isHintExpanded ? "Hide Hint" : "Get a Hint"}
                                </button>
                                {isHintExpanded && (
                                  <div className="mt-1.5 p-3 rounded-lg bg-amber-50/30 border border-amber-200/40 text-amber-800 text-[10px] font-bold leading-relaxed animate-scale-up">
                                    <strong>Hint:</strong> {q.hint || "Review your formulas and read the prompt instructions thoroughly."}
                                  </div>
                                )}
                              </div>

                              {/* Action or Solution block */}
                              {!showPedagogicalResponse ? (
                                <button
                                  type="button"
                                  disabled={!chosenAnswer}
                                  onClick={() => handleCheckQuestionAnswer(qIndex, q)}
                                  className={`px-3 py-1.5 text-[10px] font-extrabold rounded-lg text-white transition-all ${
                                    chosenAnswer 
                                      ? "bg-slate-800 hover:bg-slate-900 cursor-pointer" 
                                      : "bg-slate-200 text-slate-400 cursor-not-allowed"
                                  }`}
                                >
                                  Verify Answer
                                </button>
                              ) : (
                                <div className="mt-3 space-y-2.5 border-t border-slate-100 pt-3 animate-scale-up">
                                  {/* Result Banner */}
                                  <div className={`p-2.5 rounded-xl border text-[11px] font-extrabold flex items-center gap-2 ${
                                    checkCorrect
                                      ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
                                      : "bg-rose-50 border-rose-200 text-rose-800"
                                  }`}>
                                    <span>{checkCorrect ? "✓ Correct Answer!" : "✗ Needs Review"}</span>
                                  </div>

                                  {/* Step-by-step details */}
                                  <div className="p-3 rounded-xl border border-indigo-50 bg-indigo-50/10 space-y-2 text-[10px] leading-relaxed">
                                    {/* Solutions */}
                                    {activePracticeTest.config.includeSolutions !== false && q.solution && (
                                      <div className="border-b border-slate-100 pb-2">
                                        <span className="font-extrabold text-indigo-700 uppercase tracking-wide">📐 Step-by-Step Solving:</span>
                                        <p className="text-slate-600 font-bold mt-1 whitespace-pre-line bg-white/60 p-2 rounded-lg border border-slate-50">
                                          {q.solution}
                                        </p>
                                      </div>
                                    )}

                                    {/* Answer Key */}
                                    {activePracticeTest.config.includeAnswerKey !== false && q.answer && (
                                      <div className="border-b border-slate-100 pb-2">
                                        <span className="font-extrabold text-teal-700 uppercase tracking-wide">🔑 Correct Answer Key:</span>
                                        <p className="text-slate-800 font-extrabold mt-0.5">
                                          {q.answer}
                                        </p>
                                      </div>
                                    )}

                                    {/* Common Mistakes */}
                                    {q.common_mistakes && (
                                      <div className="border-b border-slate-100 pb-2">
                                        <span className="font-extrabold text-amber-700 uppercase tracking-wide">⚠️ Common Student Pitfalls:</span>
                                        <p className="text-amber-800/90 font-semibold mt-0.5 italic">
                                          {q.common_mistakes}
                                        </p>
                                      </div>
                                    )}

                                    {/* Teacher Notes */}
                                    {q.teacher_notes && (
                                      <div>
                                        <span className="font-extrabold text-slate-500 uppercase tracking-wide">📓 Teacher's Guidance:</span>
                                        <p className="text-slate-600 font-semibold mt-0.5">
                                          {q.teacher_notes}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Submit block */}
                      {testScore === null ? (
                        <button
                          type="button"
                          onClick={handleSubmitPracticeTest}
                          className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-rose-600 text-white font-extrabold rounded-xl hover:from-indigo-700 hover:to-rose-700 transition-all text-xs flex justify-center items-center gap-1.5 shadow-sm"
                        >
                          <Sparkles className="w-4 h-4 animate-spin-slow" /> Submit Diagnostic Workspace (+50 XP)
                        </button>
                      ) : (
                        <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50 text-center animate-scale-up">
                          <h5 className="font-extrabold text-emerald-800 text-xs mb-1">🎉 Practice Completed!</h5>
                          <p className="text-xs text-emerald-700 font-semibold mb-3">
                            Achieved {testScore.correct} / {testScore.total} correct responses. Added +50 Growth Points to your character rank!
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              setActivePracticeTest(null);
                              setTestScore(null);
                            }}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-extrabold rounded-lg transition-all"
                          >
                            Close Workspace
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Fallback SAT Challenge Problem */
                    <div className="animate-scale-up">
                      <h4 className="font-extrabold text-slate-800 text-base mb-1 flex items-center gap-2">
                        ⚡ SAT Practice Challenge Problem
                      </h4>
                      <p className="text-xs text-slate-500 mb-3">Answer correctly to award yourself <strong>+50 Growth Points</strong>!</p>
                      
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-4">
                        <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100">SAT MATH - NO CALCULATOR</span>
                        <p className="text-xs text-slate-700 font-bold mt-2 leading-relaxed">
                          "Find the remainder of P(x) = x³ - 3x² + 5x - 7 when divided by (x - 2)."
                        </p>
                      </div>

                      <form onSubmit={handleSatQuizSubmit} className="space-y-3">
                        <div className="grid grid-cols-1 gap-2">
                          {[
                            { key: "A", text: "A)  3" },
                            { key: "B", text: "B)  -1 (Remainder Theorem calculation)" },
                            { key: "C", text: "C)  5" },
                            { key: "D", text: "D)  -7" }
                          ].map((opt) => (
                            <label 
                              key={opt.key} 
                              className={`flex items-center gap-3 p-2.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                                satSelectedAns === opt.key 
                                  ? "bg-indigo-50/50 border-indigo-300" 
                                  : "border-slate-100 hover:bg-slate-50/50"
                              }`}
                            >
                              <input 
                                type="radio" 
                                name="sat-quiz" 
                                value={opt.key}
                                checked={satSelectedAns === opt.key}
                                onChange={() => !satQuizSubmitted && setSatSelectedAns(opt.key)}
                                disabled={satQuizSubmitted}
                                className="text-indigo-600 focus:ring-indigo-400"
                              />
                              <span>{opt.text}</span>
                            </label>
                          ))}
                        </div>

                        {!satQuizSubmitted ? (
                          <button 
                            type="submit" 
                            disabled={satSelectedAns === null}
                            className={`w-full py-2 text-xs font-bold rounded-xl text-white transition-all bg-indigo-600 hover:bg-indigo-700 ${
                              satSelectedAns === null ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                          >
                            Submit Practice Answer
                          </button>
                        ) : (
                          <div className={`p-3.5 rounded-xl border text-xs font-semibold leading-relaxed animate-scale-up ${
                            satQuizIsCorrect 
                              ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
                              : "bg-rose-50 border-rose-200 text-rose-800"
                          }`}>
                            {satQuizIsCorrect ? (
                              <p>
                                🎉 <strong>Amen! Correct Answer!</strong> By the Remainder Theorem, P(2) = 2³ - 3(2)² + 5(2) - 7 = 8 - 12 + 10 - 7 = -1. You earned <strong>+50 Growth Journey Points</strong>!
                              </p>
                            ) : (
                              <p>
                                ❌ <strong>Incorrect, but keep persevering!</strong> Hint: Plug x = 2 into P(x) to evaluate P(2) according to the Remainder Theorem. Click Reset to try again.
                              </p>
                            )}
                            {!satQuizIsCorrect && (
                              <button 
                                type="button" 
                                className="mt-2 text-xs text-indigo-600 font-bold underline"
                                onClick={() => {
                                  setSatQuizSubmitted(false);
                                  setSatSelectedAns(null);
                                }}
                              >
                                Try Again
                              </button>
                            )}
                          </div>
                        )}
                      </form>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* IEP Support Panel */}
          {activeTab === "IEP" && (
            <div className="panel-card animate-scale-up">
              <div className="panel-card-header">
                <h3>IEP Support & Focus Hub</h3>
                <p>Customized learning goals and accommodations. Every child is beautifully created. Soli Deo Gloria.</p>
              </div>

              {/* Accommodations and Intervention Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="border border-slate-100 p-5 rounded-2xl bg-white shadow-sm">
                  <h4 className="font-extrabold text-slate-800 text-base mb-3 flex items-center gap-2 text-indigo-700">
                    🛡️ Active Accommodations
                  </h4>
                  <ul className="space-y-2.5">
                    {student.iepAccommodations?.map((acc, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-600 font-semibold bg-indigo-50/20 p-2.5 rounded-xl border border-indigo-100/50">
                        <span className="text-indigo-600 font-extrabold mt-0.5">•</span>
                        <span>{acc}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-xl mt-4">
                    <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider">Intervention Strategy</span>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed italic">
                      "{student.iepInterventionPlan}"
                    </p>
                  </div>
                </div>

                {/* Executive Functioning Interactive Checklist */}
                <div className="border border-slate-100 p-5 rounded-2xl bg-white shadow-sm flex flex-col justify-between">
                  <div>
                    <h4 className="font-extrabold text-slate-800 text-base mb-1 flex items-center gap-2 text-teal-700">
                      📋 Executive Functioning Checklist
                    </h4>
                    <p className="text-xs text-slate-500 mb-3">Tick off completed micro-steps to stay organized and calm.</p>
                    
                    <div className="space-y-2">
                      {iepChecklist.map((item) => (
                        <div 
                          key={item.id} 
                          onClick={() => handleToggleChecklist(item.id)}
                          className={`flex items-center gap-3 p-2.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                            item.completed 
                              ? "bg-teal-50/30 border-teal-200 text-teal-800 line-through opacity-85" 
                              : "border-slate-100 hover:bg-slate-50/50"
                          }`}
                        >
                          <input 
                            type="checkbox" 
                            checked={item.completed}
                            onChange={() => {}} // Handled by outer click
                            className="text-teal-600 focus:ring-teal-400 rounded-md"
                          />
                          <span>{item.task}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 mt-4">
                    <div className="flex justify-between text-xs font-bold text-teal-800 mb-1.5">
                      <span>Checklist Progress</span>
                      <span>{Math.round((iepChecklist.filter(i => i.completed).length / iepChecklist.length) * 100)}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-teal-500 h-full rounded-full transition-all duration-300" 
                        style={{ width: `${(iepChecklist.filter(i => i.completed).length / iepChecklist.length) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* IEP Observations Scroller */}
              <div className="border border-slate-100 p-5 rounded-2xl bg-white shadow-sm">
                <h4 className="font-extrabold text-slate-800 text-base mb-3">
                  👀 Tutor IEP Progress Observations
                </h4>
                <div className="space-y-3.5 max-h-[250px] overflow-y-auto pr-1">
                  {student.iepTutorObservations?.map((obs) => (
                    <div key={obs.id} className="bg-slate-50/60 p-4 rounded-xl border border-slate-100/80">
                      <p className="text-xs text-slate-700 leading-relaxed font-semibold italic">
                        "{obs.text}"
                      </p>
                      <div className="flex justify-between items-center mt-3 text-[10px] text-indigo-600 font-bold">
                        <span>— Observed by {obs.tutor}</span>
                        <span className="opacity-80">📅 {obs.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Resources Panel */}
          {activeTab === "Resources" && (
            <div className="panel-card animate-scale-up">
              <div className="panel-card-header">
                <h3>Unlocked Study Vault</h3>
                <p>Download diagnostic sheets, exam cheat-sheets, and organization matrices.</p>
              </div>

              <div className="resources-downloads-grid">
                <div className="resource-item-card">
                  <div className="resource-icon-badge">📈</div>
                  <div>
                    <h4>Pre-Calculus: Double Angle Formula Sheet</h4>
                    <p>Full collection of formulas and sample proofs verified by Dr. Elijah.</p>
                    <button className="btn-icon-text">
                      <Download className="btn-icon-tiny" />
                      <span>Download PDF</span>
                    </button>
                  </div>
                </div>

                <div className="resource-item-card">
                  <div className="resource-icon-badge">📝</div>
                  <div>
                    <h4>SAT Reading: Active Recall Framework</h4>
                    <p>High-impact methodology for passage scanning and key theme identification.</p>
                    <button className="btn-icon-text">
                      <Download className="btn-icon-tiny" />
                      <span>Download PDF</span>
                    </button>
                  </div>
                </div>

                <div className="resource-item-card locked">
                  <div className="resource-icon-badge">🔒</div>
                  <div>
                    <h4>Calculus II Series & Taylor Cheat-Sheet</h4>
                    <p>Requires Scholar level (500 pts) to unlock study access.</p>
                    <span className="locked-badge-indicator">Locked • Scholar Level</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "Collaboration" && (
            <div className="animate-scale-up">
              <AiCollaborationHub />
            </div>
          )}

        </div>
      </div>

      {/* Rewards Mock Modal */}
      {showRewardModal && (
        <div className="modal-backdrop" onClick={() => setShowRewardModal(false)}>
          <div className="modal-content text-center" onClick={(e) => e.stopPropagation()}>
            <Award className="modal-header-icon" />
            <h2>Active Reward Unlocked!</h2>
            <p>Your current level: <strong>Builder</strong> has unlocked the digital VIP resources bundle!</p>
            <div className="modal-items-list text-left">
              <p>🟢 Active Recalls Cheat-sheet (PDF)</p>
              <p>🟢 Pre-Algebra & Algebra Formula card (Interactive)</p>
              <p>🟢 Focus-music Study Soundtracks (.mp3)</p>
            </div>
            <button className="btn-primary" onClick={() => setShowRewardModal(false)}>
              <span>Close & Return</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
