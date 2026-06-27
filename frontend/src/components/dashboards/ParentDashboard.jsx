import React, { useContext, useState, useEffect } from "react";
import { AppContext } from "../../context/AppContext";
import {
  ShieldCheck,
  Calendar,
  MessageSquare,
  DollarSign,
  User,
  Activity,
  Send,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Heart,
  Award,
  CreditCard,
  Download,
  RefreshCw,
  Printer,
  Lock,
  FileText,
  Trash2,
  Sliders,
  Check
} from "lucide-react";

export default function ParentDashboard() {
  const {
    students,
    bookings,
    invoices,
    messages,
    sessionNotes,
    payInvoice,
    sendMessage,
    tutors,
    characterNotes,
    addParentEncouragement,
    apiFetch,
    currentProfile,
    isLoading,
    authError
  } = useContext(AppContext);

  // Focus on student linked to parent profile or fallback to demo student Caleb Sterling
  const student = students.find((s) => s.parentId === currentProfile?.id) || students.find((s) => s.id === "std_1") || students[0];
  const studentBookings = (bookings || []).filter((bk) => bk.studentName === student.name);

  const [activeSubTab, setActiveSubTab] = useState("Overview"); // Overview, Character, Attendance, Reports, Chat, Billing
  const [selectedTutorId, setSelectedTutorId] = useState("tut_2"); // Sarah Jenkins default
  const [chatInput, setChatInput] = useState("");
  const [payingInvoiceId, setPayingInvoiceId] = useState(null);
  const [ccNumber, setCcNumber] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  
  // Advanced Payment States
  const [billingStats, setBillingStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState("stripe");
  const [zelleCode, setZelleCode] = useState("");
  const [paypalEmail, setPaypalEmail] = useState("grace@sterling.com");
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Parent Encouragement note text state
  const [encouragementText, setEncouragementText] = useState("");

  // Filter messages relating to parent Grace Sterling
  const parentMessages = messages.filter(
    (m) =>
      (m.from === "Grace Sterling" && m.to === tutors.find((t) => t.id === selectedTutorId)?.name) ||
      (m.from === tutors.find((t) => t.id === selectedTutorId)?.name && m.to === "Grace Sterling")
  );

  const fetchBillingStats = async () => {
    try {
      const response = await apiFetch("http://localhost:5000/api/payments/dashboard-stats?role=Parent&parentId=parent_1");
      if (response.ok) {
        const data = await response.json();
        setBillingStats(data);
      }
    } catch (err) {
      console.warn("[Dual-Mode Payment Ledger] Offline fallback triggered. Simulating local states.", err);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchBillingStats();
  }, [invoices]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const activeTutor = tutors.find((t) => t.id === selectedTutorId);
    if (!activeTutor) return;

    sendMessage(
      "Grace Sterling",
      activeTutor.name,
      chatInput,
      "Parent",
      "Tutor"
    );
    setChatInput("");
  };

  const handlePayInvoiceSubmit = async (e) => {
    e.preventDefault();
    if (!payingInvoiceId) return;

    const targetInvoice = invoices.find(inv => inv.id === payingInvoiceId);
    if (!targetInvoice) return;

    const amount = targetInvoice.amount;
    const isSubscription = selectedProvider === "paypal" && targetInvoice.service.toLowerCase().includes("block");

    // Prepare payment creation payload
    const sessionData = {
      provider: selectedProvider,
      studentId: student.id,
      tutorId: "tut_1", // Sarah Jenkins
      tutorName: "Mrs. Sarah Jenkins",
      subject: targetInvoice.service.replace("Tutoring", "").replace("Block", "").trim(),
      date: new Date().toISOString().split("T")[0],
      timeSlot: "4:00 PM - 5:00 PM",
      amount: amount,
      paymentType: isSubscription ? "Subscription" : "One-Time",
      orgId: "org_1"
    };

    try {
      setPaymentLoading(true);
      
      // 1. Create Checkout Session
      const sessionResponse = await apiFetch("http://localhost:5000/api/payments/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sessionData)
      });

      if (!sessionResponse.ok) {
        throw new Error("Failed to create checkout session on backend.");
      }

      const sessionResult = await sessionResponse.json();
      const sessionId = sessionResult.sessionId;

      // 2. Confirm Payment Session
      const confirmData = {
        sessionId: sessionId,
        paymentMethod: selectedProvider === "stripe" ? "Visa ending in 4242" : `PayPal Account: ${paypalEmail}`,
        payerEmail: paypalEmail,
        zelleReferenceCode: selectedProvider === "zelle" ? zelleCode : null
      };

      const confirmResponse = await apiFetch("http://localhost:5000/api/payments/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(confirmData)
      });

      if (!confirmResponse.ok) {
        throw new Error("Failed to confirm payment on backend.");
      }

      const confirmResult = await confirmResponse.json();
      
      // Local state update via context (sync with Supabase/Mock)
      payInvoice(payingInvoiceId);
      
      setPaymentSuccess(true);
      fetchBillingStats(); // reload stats from backend

      setTimeout(() => {
        setPayingInvoiceId(null);
        setPaymentSuccess(false);
        setCcNumber("");
        setZelleCode("");
      }, 2500);

    } catch (err) {
      console.warn("[Dual Mode Checkout] Backend payment endpoint offline. Processing using in-memory local state fallback.", err);
      
      // Fallback local update
      payInvoice(payingInvoiceId);
      setPaymentSuccess(true);
      
      setTimeout(() => {
        setPayingInvoiceId(null);
        setPaymentSuccess(false);
        setCcNumber("");
        setZelleCode("");
      }, 2500);
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleCancelSubscription = async (subId) => {
    if (!window.confirm("Are you sure you want to cancel this recurring subscription?")) return;
    try {
      const response = await apiFetch("http://localhost:5000/api/subscriptions/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriptionId: subId })
      });
      if (response.ok) {
        alert("Subscription cancelled successfully!");
        fetchBillingStats();
      } else {
        alert("Failed to cancel subscription on server.");
      }
    } catch (err) {
      console.warn("[Dual-Mode Subscription] Offline fallback triggered.", err);
      alert("Subscription cancelled successfully (Local offline state updated)!");
      if (billingStats && billingStats.subscriptions) {
        const updatedSubs = billingStats.subscriptions.map(s => 
          s.id === subId ? { ...s, status: "Cancelled", cancelledAt: new Date().toISOString() } : s
        );
        setBillingStats({ ...billingStats, subscriptions: updatedSubs });
      }
    }
  };

  const handleDownloadReceipt = (tx) => {
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <title>Ambience TutorsFlow Receipt - ${tx.id}</title>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #fafafa; color: #333; padding: 20px; }
    .receipt { max-width: 600px; margin: auto; background: white; padding: 30px; border-radius: 8px; border: 1px solid #eee; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
    .header { text-align: center; border-bottom: 2px solid #6366f1; padding-bottom: 20px; margin-bottom: 20px; }
    .logo { font-size: 24px; font-weight: bold; color: #4f46e5; letter-spacing: -0.5px; }
    .title { font-size: 14px; text-transform: uppercase; color: #666; margin-top: 5px; }
    .details { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px; font-size: 14px; }
    .details div span { color: #888; font-size: 12px; display: block; }
    .details div strong { color: #222; }
    .items { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    .items th { text-align: left; border-bottom: 1px solid #ddd; padding: 10px 0; font-size: 13px; color: #555; }
    .items td { padding: 12px 0; border-bottom: 1px solid #eee; font-size: 14px; }
    .total-row { font-size: 16px; font-weight: bold; text-align: right; margin-top: 15px; border-top: 2px solid #eee; padding-top: 15px; }
    .footer { text-align: center; font-size: 11px; color: #999; margin-top: 30px; line-height: 1.5; }
  </style>
</head>
<body>
  <div class="receipt">
    <div class="header">
      <div class="logo">🕊️ Ambience TutorsFlow™</div>
      <div class="title">Official Payment Receipt</div>
    </div>
    <div class="details">
      <div>
        <span>TRANSACTION ID</span>
        <strong>${tx.transactionId || tx.id || 'N/A'}</strong>
      </div>
      <div>
        <span>PAYMENT DATE</span>
        <strong>${tx.paidAt ? tx.paidAt.split("T")[0] : (tx.date || new Date().toISOString().split("T")[0])}</strong>
      </div>
      <div>
        <span>PAYER</span>
        <strong>Grace Sterling (parent_1)</strong>
      </div>
      <div>
        <span>STUDENT LINKED</span>
        <strong>Caleb Sterling</strong>
      </div>
      <div>
        <span>PAYMENT RAIL</span>
        <strong>${(tx.provider || 'STRIPE').toUpperCase()}</strong>
      </div>
      <div>
        <span>AUDIT STATUS</span>
        <strong style="color: ${tx.status === 'Paid' ? '#10b981' : '#f59e0b'};">${(tx.status || 'Paid').toUpperCase()}</strong>
      </div>
    </div>
    <table class="items">
      <thead>
        <tr>
          <th>Service Description</th>
          <th>Tutor</th>
          <th style="text-align: right;">Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>${tx.subject || 'Academic Coaching Tuition'}</td>
          <td>${tx.tutorName || 'Mrs. Sarah Jenkins'}</td>
          <td style="text-align: right;">$${(tx.amount || 0).toFixed(2)}</td>
        </tr>
      </tbody>
    </table>
    <div class="total-row">
      Total Paid: $${(tx.amount || 0).toFixed(2)}
    </div>
    <div class="footer">
      Thank you for partnering with Ambience TutorsFlow™.<br>
      Academic Excellence • Individualized IEP Support • Character Education<br>
      Soli Deo Gloria.
    </div>
  </div>
  <script>window.print();</script>
</body>
</html>
    `;
    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Ambience_Receipt_${tx.id}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleEncouragementSubmit = (e) => {
    e.preventDefault();
    if (!encouragementText.trim()) return;
    addParentEncouragement(student.id, encouragementText);
    setEncouragementText("");
  };

  // Filter Character Education notes for this student
  const studentCharacterNotes = characterNotes.filter((note) => note.studentId === student.id);

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

      {/* Parent Portal welcome bar */}
      <div className="dashboard-banner parent-banner">
        <div className="banner-text">
          <span className="banner-badge">PARENT PORTAL</span>
          <h1>Welcome Back, {currentProfile?.name || "Grace Sterling"}!</h1>
          <p>
            Stay engaged with your student's learning roadmap. Thank you for your partnership!
          </p>
        </div>
        <div className="parent-student-link-badge">
          <span>Student Linked:</span>
          <strong>🎓 {student?.name || "Caleb Sterling"} ({student?.grade || "11th"})</strong>
        </div>
      </div>

      {/* Parent Nav Tabs */}
      <div className="dashboard-tabs-header-row">
        <button className={`dashboard-tab-trigger ${activeSubTab === "Overview" ? "active" : ""}`} onClick={() => setActiveSubTab("Overview")}>
          <User className="tab-trigger-icon" />
          <span>Student Overview</span>
        </button>
        <button className={`dashboard-tab-trigger ${activeSubTab === "Character" ? "active" : ""}`} onClick={() => setActiveSubTab("Character")}>
          <Heart className="tab-trigger-icon text-rose-500 animate-pulse" />
          <span>Character Growth Tracker</span>
        </button>
        <button className={`dashboard-tab-trigger ${activeSubTab === "Attendance" ? "active" : ""}`} onClick={() => setActiveSubTab("Attendance")}>
          <Activity className="tab-trigger-icon" />
          <span>Attendance Logs</span>
        </button>
        <button className={`dashboard-tab-trigger ${activeSubTab === "Reports" ? "active" : ""}`} onClick={() => setActiveSubTab("Reports")}>
          <TrendingUp className="tab-trigger-icon" />
          <span>Progress Reports</span>
        </button>
        <button className={`dashboard-tab-trigger ${activeSubTab === "Chat" ? "active" : ""}`} onClick={() => setActiveSubTab("Chat")}>
          <MessageSquare className="tab-trigger-icon" />
          <span>Tutor Messages</span>
        </button>
        <button className={`dashboard-tab-trigger ${activeSubTab === "IEP" ? "active" : ""}`} onClick={() => setActiveSubTab("IEP")}>
          <ShieldCheck className="tab-trigger-icon text-teal-600" />
          <span>IEP Tracker</span>
        </button>
        <button className={`dashboard-tab-trigger ${activeSubTab === "Billing" ? "active" : ""}`} onClick={() => setActiveSubTab("Billing")}>
          <DollarSign className="tab-trigger-icon" />
          <span>Payments Ledger</span>
        </button>
      </div>

      {/* Main Sub-Tab Layout Panels */}
      <div className="parent-panel-body">
        
        {/* Sub-Tab: Student Overview */}
        {activeSubTab === "Overview" && (
          <div className="parent-overview-grid animate-scale-up">
            
            {/* KPI Cards */}
            <div className="overview-kpis">
              <div className="kpi-card green-kpi">
                <span className="kpi-label">Overall Progress</span>
                <h3>{student.overallProgress}%</h3>
                <div className="kpi-micro-bar">
                  <div className="kpi-micro-fill" style={{ width: `${student.overallProgress}%` }}></div>
                </div>
              </div>

              <div className="kpi-card gold-kpi">
                <span className="kpi-label">Growth Journey™</span>
                <h3>{student.level}</h3>
                <p>{student.points} XP Accumulated</p>
              </div>

              <div className="kpi-card teal-kpi">
                <span className="kpi-label">Study Streak</span>
                <h3>🔥 {student.streak} Days</h3>
                <p>Consistent daily habits</p>
              </div>

              <div className="kpi-card purple-kpi">
                <span className="kpi-label">Completed Sessions</span>
                <h3>{student.completedSessions} Classes</h3>
                <p>100% attendance rate</p>
              </div>
            </div>

            {/* Right Column: Sessions & Reports Stack */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              
              {/* Upcoming Live Sessions Card */}
              <div className="session-notes-card" style={{ background: "rgba(255, 255, 255, 0.015)", border: "1px solid var(--border-light, rgba(255,255,255,0.06))" }}>
                <div className="card-heading-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h3>Upcoming Live Sessions</h3>
                  <span className="info-pill" style={{ backgroundColor: "#2d8cff", color: "white", fontSize: "10px", fontWeight: "bold", padding: "3px 8px", borderRadius: "12px" }}>Live Classroom</span>
                </div>
                {studentBookings.length === 0 ? (
                  <p className="no-data-p" style={{ padding: "12px 0", color: "rgba(255,255,255,0.4)", fontSize: "12px" }}>No upcoming sessions scheduled.</p>
                ) : (
                  <div className="notes-vertical-feed" style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "10px" }}>
                    {studentBookings.map((bk) => (
                      <div key={bk.id} className="note-card-item" style={{ borderLeft: "4px solid #2d8cff", paddingLeft: "12px", background: "rgba(255,255,255,0.01)", borderRadius: "0 8px 8px 0" }}>
                        <div className="note-card-meta" style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px" }}>
                          <strong>{bk.subject} Session</strong>
                          <span style={{ color: "rgba(255,255,255,0.5)" }}>📅 {bk.date} • {bk.time}</span>
                        </div>
                        <p className="note-summary" style={{ fontSize: "11px", margin: "0 0 6px 0", color: "rgba(255,255,255,0.7)" }}>
                          Lead Tutor: <strong>{bk.tutorName}</strong>
                        </p>
                        {bk.zoomJoinUrl && (
                          <div style={{ marginTop: "6px" }}>
                            <a
                              href={bk.zoomJoinUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="zoom-btn join-zoom-btn animate-pulse"
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "0.5rem",
                                padding: "0.4rem 0.8rem",
                                backgroundColor: "#2d8cff",
                                color: "white",
                                borderRadius: "6px",
                                fontSize: "0.72rem",
                                fontWeight: "bold",
                                textDecoration: "none",
                                boxShadow: "0 0 10px rgba(45, 140, 255, 0.4)",
                                transition: "transform 0.2s ease"
                              }}
                            >
                              <span style={{ marginRight: "4px" }}>📹</span> Join Zoom Classroom
                            </a>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Session Notes from Tutors */}
              <div className="session-notes-card">
                <div className="card-heading-row">
                  <h3>Latest Session Reports</h3>
                  <span className="info-pill">Tutor Feedback</span>
                </div>
                {sessionNotes.length === 0 ? (
                  <p className="no-data-p">No session notes published yet.</p>
                ) : (
                  <div className="notes-vertical-feed">
                    {sessionNotes.map((note) => (
                      <div key={note.id} className="note-card-item">
                        <div className="note-card-meta">
                          <strong>{note.subject} Note</strong>
                          <span>📅 {note.date} • Taught by {note.tutorName}</span>
                        </div>
                        <p className="note-summary">
                          <strong>Review:</strong> {note.summary}
                        </p>
                        {note.nextSteps && (
                          <p className="note-steps">
                            <strong>Next Steps:</strong> {note.nextSteps}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* Sub-Tab: Character Growth Tracker */}
        {activeSubTab === "Character" && (
          <div className="character-growth-tracker animate-scale-up space-y-6">
            
            {/* Faith-inspired header banner */}
            <div className="bg-gradient-to-br from-rose-500/5 to-indigo-500/5 border border-indigo-100/50 p-6 rounded-2xl flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div>
                <span className="text-xs font-bold text-rose-600 uppercase tracking-wider block mb-1">Noble Character Development</span>
                <h3 className="text-xl font-extrabold text-slate-800">Caleb's Character Growth Tracker</h3>
                <p className="text-xs text-slate-500 mt-0.5">Focusing on critical character dimensions alongside world-class academic tutoring.</p>
              </div>
              <div className="bg-white/80 p-3 rounded-xl border border-rose-100 text-right max-w-md">
                <p className="text-xs font-semibold text-rose-700 italic">"Train up a child in the way he should go; even when he is old he will not depart from it."</p>
                <span className="text-[10px] text-slate-400 font-bold block mt-1">— Proverbs 22:6</span>
              </div>
            </div>

            {/* Core Metrics & Parent Encouragement Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left 2 Columns: Character Dimensions Meters */}
              <div className="lg:col-span-2 border border-slate-100 p-6 rounded-2xl bg-white shadow-sm">
                <h4 className="font-extrabold text-slate-800 text-base mb-4 flex items-center gap-2">
                  📊 Core Virtues Assessment
                </h4>

                <div className="space-y-5">
                  {/* Metric: Integrity */}
                  <div className="metric-progress-box">
                    <div className="flex justify-between items-center mb-1 text-xs">
                      <strong className="text-indigo-900 font-bold flex items-center gap-1.5">
                        🛡️ Integrity
                      </strong>
                      <span className="font-bold text-indigo-600">Level {student.characterMetrics?.integrity || 4} / 5</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(student.characterMetrics?.integrity || 4) * 20}%` }}></div>
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium mt-1">Doing what is right, honest, and honorable in all academic evaluations.</p>
                  </div>

                  {/* Metric: Responsibility */}
                  <div className="metric-progress-box">
                    <div className="flex justify-between items-center mb-1 text-xs">
                      <strong className="text-teal-900 font-bold flex items-center gap-1.5">
                        🛠️ Responsibility
                      </strong>
                      <span className="font-bold text-teal-600">Level {student.characterMetrics?.responsibility || 5} / 5</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-teal-500 rounded-full" style={{ width: `${(student.characterMetrics?.responsibility || 5) * 20}%` }}></div>
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium mt-1">Completing worksheets, diagnostic prep, and checking in independently.</p>
                  </div>

                  {/* Metric: Kindness */}
                  <div className="metric-progress-box">
                    <div className="flex justify-between items-center mb-1 text-xs">
                      <strong className="text-rose-900 font-bold flex items-center gap-1.5">
                        💖 Kindness
                      </strong>
                      <span className="font-bold text-rose-600">Level {student.characterMetrics?.kindness || 4} / 5</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-rose-500 rounded-full" style={{ width: `${(student.characterMetrics?.kindness || 4) * 20}%` }}></div>
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium mt-1">Compassion, warmth, and respectful communication with tutors and family.</p>
                  </div>

                  {/* Metric: Perseverance */}
                  <div className="metric-progress-box">
                    <div className="flex justify-between items-center mb-1 text-xs">
                      <strong className="text-violet-900 font-bold flex items-center gap-1.5">
                        🎯 Perseverance
                      </strong>
                      <span className="font-bold text-violet-600">Level {student.characterMetrics?.perseverance || 5} / 5</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-violet-500 rounded-full" style={{ width: `${(student.characterMetrics?.perseverance || 5) * 20}%` }}></div>
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium mt-1">Sticking to challenging math proofs and test preparation sessions without quitting.</p>
                  </div>

                  {/* Metric: Leadership */}
                  <div className="metric-progress-box">
                    <div className="flex justify-between items-center mb-1 text-xs">
                      <strong className="text-amber-900 font-bold flex items-center gap-1.5">
                        👑 Leadership
                      </strong>
                      <span className="font-bold text-amber-600">Level {student.characterMetrics?.leadership || 4} / 5</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(student.characterMetrics?.leadership || 4) * 20}%` }}></div>
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium mt-1">Modeling noble character and inspiring peers in study circles.</p>
                  </div>
                </div>
              </div>

              {/* Right 1 Column: Send Parent Encouragement Note */}
              <div className="border border-slate-100 p-6 rounded-2xl bg-white shadow-sm flex flex-col justify-between">
                <div>
                  <h4 className="font-extrabold text-slate-800 text-base mb-1 flex items-center gap-1.5">
                    ✉️ Parent Encouragement Card
                  </h4>
                  <p className="text-[11px] text-slate-500 mb-4">
                    Send a note of encouragement directly to Caleb's Student Dashboard in real-time.
                  </p>

                  <form onSubmit={handleEncouragementSubmit} className="space-y-3">
                    <textarea 
                      rows="4"
                      value={encouragementText}
                      onChange={(e) => setEncouragementText(e.target.value)}
                      placeholder="e.g. Caleb, we noticed your focus in Algebra. We are incredibly proud of your work ethic!"
                      className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-rose-400 focus:outline-none"
                    ></textarea>
                    <button 
                      type="submit" 
                      className="btn-primary-glowing py-2 w-full text-xs font-bold text-white rounded-xl bg-gradient-to-r from-rose-500 to-indigo-600 hover:from-rose-600 hover:to-indigo-700"
                    >
                      Publish Encouragement Card
                    </button>
                  </form>
                </div>

                <div className="border-t border-slate-100 pt-4 mt-4">
                  <h5 className="text-xs font-bold text-slate-700 mb-2">Previous Blessings</h5>
                  <div className="space-y-2 max-h-[110px] overflow-y-auto pr-1">
                    {(!student.parentEncouragements || student.parentEncouragements.length === 0) ? (
                      <p className="text-[10px] text-slate-400 italic">No notes logged yet.</p>
                    ) : (
                      student.parentEncouragements.map(enc => (
                        <div key={enc.id} className="p-2 bg-slate-50/50 rounded-lg border border-slate-100 text-[10px] text-slate-500">
                          <p className="italic">"{enc.text}"</p>
                          <span className="text-[8px] text-slate-400 font-bold block text-right mt-1">📅 {enc.date}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

            </div>

            {/* Tutor Character Notes Feed */}
            <div className="border border-slate-100 p-6 rounded-2xl bg-white shadow-sm">
              <h4 className="font-extrabold text-slate-800 text-base mb-1.5 flex items-center gap-1.5">
                📜 Tutor Character Education Notes
              </h4>
              <p className="text-xs text-slate-500 mb-4">
                Review verified character reflections, response audits, and strength insights filed by Caleb's tutors.
              </p>

              {studentCharacterNotes.length === 0 ? (
                <div className="p-12 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/20">
                  <span className="text-3xl block mb-2">📓</span>
                  <h5 className="font-bold text-slate-700">No Character Notes Registered</h5>
                  <p className="text-xs text-slate-400 mt-1">Check back once tutors submit character reviews from active sessions.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {studentCharacterNotes.map((note) => (
                    <div key={note.id} className="p-5 rounded-2xl border border-slate-100 bg-slate-50/40 relative animate-scale-up">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-600 uppercase tracking-wide">
                            Theme: {note.theme}
                          </span>
                          <h5 className="font-bold text-slate-800 text-sm mt-1.5">Filed by {note.tutorName}</h5>
                        </div>
                        <span className="text-[10px] font-semibold text-slate-400">📅 {note.date}</span>
                      </div>

                      <div className="space-y-2 text-xs text-slate-600">
                        <p>
                          <strong>Student Response:</strong> {note.studentResponse}
                        </p>
                        <p>
                          <strong>Observed Strength:</strong> <span className="font-bold text-indigo-600">✨ {note.strengthObserved}</span>
                        </p>
                        <p>
                          <strong>Area for Growth:</strong> {note.areaForGrowth}
                        </p>
                        <p className="bg-white/70 p-2.5 rounded-xl border border-indigo-50/50 mt-1">
                          <strong>Tutor Recommendation:</strong> <span className="text-indigo-900 italic">" {note.recommendation} "</span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* Sub-Tab: Attendance Logs */}
        {activeSubTab === "Attendance" && (
          <div className="panel-card animate-scale-up">
            <h3>Attendance Checklist</h3>
            <p>Verification logs for K-12, College math, and standardized exam sessions.</p>
            
            <table className="parent-table">
              <thead>
                <tr>
                  <th>Session Date</th>
                  <th>Core Subject</th>
                  <th>Lead Tutor</th>
                  <th>Attendance Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>June 22, 2026</td>
                  <td>Pre-Calculus</td>
                  <td>Mrs. Sarah Jenkins</td>
                  <td><span className="status-badge-present">✓ Present (On Time)</span></td>
                </tr>
                <tr>
                  <td>June 18, 2026</td>
                  <td>SAT Prep Math</td>
                  <td>Dr. Elijah Vance</td>
                  <td><span className="status-badge-present">✓ Present (On Time)</span></td>
                </tr>
                <tr>
                  <td>June 15, 2026</td>
                  <td>Pre-Calculus</td>
                  <td>Mrs. Sarah Jenkins</td>
                  <td><span className="status-badge-present">✓ Present (On Time)</span></td>
                </tr>
                <tr>
                  <td>June 11, 2026</td>
                  <td>Science (Physics)</td>
                  <td>Benjamin Mercer</td>
                  <td><span className="status-badge-present">✓ Present (On Time)</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Sub-Tab: Progress Reports */}
        {activeSubTab === "Reports" && (
          <div className="panel-card animate-scale-up">
            <h3>Grades & Growth Reports</h3>
            <p>Subject-by-subject curriculum comprehension logs and diagnostic goals.</p>

            <div className="subject-reports-grid">
              {student.subjects.map((subj) => (
                <div key={subj.name} className="subject-report-bar-box">
                  <div className="report-bar-heading">
                    <h4>{subj.name}</h4>
                    <strong>Grade: {subj.grade}</strong>
                  </div>
                  <div className="report-bar-meter">
                    <div className="report-bar-fill" style={{ width: `${subj.progress}%` }}></div>
                  </div>
                  <div className="report-bar-details">
                    <span>Comprehension: {subj.progress}%</span>
                    <span>Goal Target: A (95%)</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="progress-analysis-summary">
              <h5>Coordinator Assessment Report:</h5>
              <p>
                Caleb is making outstanding leaps in Pre-Calculus proofs. His transition from mechanical memorization to logical derivation is highly noticeable. In SAT Reading, we are shifting focus towards complex historical passage vocabulary to boost his scores past the 720 mark.
              </p>
            </div>
          </div>
        )}

        {/* Sub-Tab: Tutor Messages */}
        {activeSubTab === "Chat" && (
          <div className="panel-card chat-panel-card animate-scale-up">
            <div className="chat-layout-grid">
              
              {/* Tutor Selector sidebar */}
              <div className="chat-tutors-list">
                <h4>Linked Tutors</h4>
                {tutors.map((t) => (
                  <button
                    key={t.id}
                    className={`tutor-chat-btn ${selectedTutorId === t.id ? "active" : ""}`}
                    onClick={() => setSelectedTutorId(t.id)}
                  >
                    <img src={t.image} alt={t.name} className="chat-tutor-avatar" />
                    <div className="text-left">
                      <h5>{t.name}</h5>
                      <p>{t.role}</p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Chat Thread Container */}
              <div className="chat-thread-container">
                <div className="chat-thread-header">
                  <h4>Conversing with {tutors.find((t) => t.id === selectedTutorId)?.name}</h4>
                  <span className="online-capsule">Active Connection</span>
                </div>

                <div className="chat-messages-scroll">
                  {parentMessages.length === 0 ? (
                    <p className="no-chat-p">Initiate a conversation by sending a message below.</p>
                  ) : (
                    parentMessages.map((m) => (
                      <div key={m.id} className={`chat-message-row ${m.from === "Grace Sterling" ? "sent" : "received"}`}>
                        <div className="message-bubble">
                          <p>{m.text}</p>
                          <span className="message-timestamp">{m.time}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <form className="chat-input-row" onSubmit={handleSendMessage}>
                  <input
                    type="text"
                    placeholder="Type your message to Caleb's tutor..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    required
                  />
                  <button type="submit" className="btn-chat-send">
                    <Send className="chat-send-icon" />
                  </button>
                </form>
              </div>

            </div>
          </div>
        )}
        {/* Sub-Tab: IEP Progress Tracker */}
        {activeSubTab === "IEP" && (
          <div className="panel-card animate-scale-up">
            <div className="panel-card-header">
              <h3>IEP Progress Tracker — Caleb Sterling</h3>
              <p>Follow Caleb's accommodations, individualized learning milestones, and tutor observations. Soli Deo Gloria.</p>
            </div>

            {/* IEP Goals Cards */}
            <div className="mb-6">
              <h4 className="font-extrabold text-slate-800 text-base mb-3 flex items-center gap-2 text-indigo-700">
                🎯 IEP Individualized Learning Goals
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {student.iepGoals?.map((goal) => (
                  <div key={goal.id} className="p-4 rounded-xl border border-slate-100 bg-white shadow-sm flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full uppercase tracking-wider">Goal Focus</span>
                      <p className="text-xs text-slate-700 font-semibold mt-2 leading-relaxed">
                        {goal.text}
                      </p>
                    </div>
                    <div className="mt-4 border-t border-slate-50 pt-3">
                      <div className="flex justify-between items-center text-[11px] font-bold text-slate-600 mb-1">
                        <span>Goal Progress</span>
                        <span className="text-indigo-600">{goal.progress}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${goal.progress}%` }}></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Accommodations Overview */}
              <div className="border border-slate-100 p-5 rounded-2xl bg-white shadow-sm">
                <h4 className="font-extrabold text-slate-800 text-base mb-3 flex items-center gap-2 text-indigo-700">
                  🛡️ Deployed IEP Accommodations
                </h4>
                <div className="space-y-2">
                  {student.iepAccommodations?.map((acc, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 rounded-xl border border-indigo-100/30 bg-indigo-50/10">
                      <span className="text-indigo-600 font-extrabold text-sm">•</span>
                      <span className="text-xs text-slate-600 font-semibold leading-relaxed">
                        {acc}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="bg-emerald-50/40 border border-emerald-100 p-4 rounded-xl mt-4">
                  <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider">Active Intervention Strategy</span>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed italic">
                    "{student.iepInterventionPlan}"
                  </p>
                </div>
              </div>

              {/* IEP Observations Scroller */}
              <div className="border border-slate-100 p-5 rounded-2xl bg-white shadow-sm flex flex-col justify-between">
                <div>
                  <h4 className="font-extrabold text-slate-800 text-base mb-3 text-teal-700">
                    👀 Tutor IEP Observations
                  </h4>
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                    {student.iepTutorObservations?.map((obs) => (
                      <div key={obs.id} className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                        <p className="text-xs text-slate-700 font-semibold italic leading-relaxed">
                          "{obs.text}"
                        </p>
                        <div className="flex justify-between items-center mt-2.5 text-[10px] text-teal-600 font-bold">
                          <span>— Logged by {obs.tutor}</span>
                          <span className="opacity-80">📅 {obs.date}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Sub-Tab: Payments Ledger */}
        {activeSubTab === "Billing" && (
          <div className="animate-scale-up" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            
            {/* Financial Overview KPI Row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px" }}>
              <div className="kpi-card green-kpi" style={{ minHeight: "100px" }}>
                <span className="kpi-label">Settled Tuition</span>
                <h3>${(billingStats?.grossRevenue || 225.00).toFixed(2)}</h3>
                <p>Tax-deductible educational expenses</p>
              </div>
              <div className="kpi-card gold-kpi" style={{ minHeight: "100px" }}>
                <span className="kpi-label">Outstanding Invoices</span>
                <h3>
                  ${(invoices.filter(i => i.status === "Unpaid").reduce((sum, i) => sum + i.amount, 0)).toFixed(2)}
                </h3>
                <p>{invoices.filter(i => i.status === "Unpaid").length} pending invoices due</p>
              </div>
              <div className="kpi-card purple-kpi" style={{ minHeight: "100px" }}>
                <span className="kpi-label">Active Subscriptions</span>
                <h3>
                  {billingStats?.subscriptions ? billingStats.subscriptions.filter(s => s.status === "Active").length : 1} Plan(s)
                </h3>
                <p>Auto-billed via Stripe / PayPal</p>
              </div>
            </div>

            <div className="billing-flex-layout" style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "20px" }}>
              
              {/* Unpaid Invoices */}
              <div className="panel-card" style={{ height: "fit-content" }}>
                <div className="panel-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: "16px" }}>Outstanding Invoices</h3>
                    <p style={{ margin: 0, fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>Pay securely via Stripe, PayPal or administrator-verified Zelle.</p>
                  </div>
                  <span style={{ fontSize: "11px", background: "rgba(245, 158, 11, 0.1)", color: "#f59e0b", padding: "2px 8px", borderRadius: "10px", fontWeight: "bold" }}>Action Required</span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {invoices.filter(i => i.status === "Unpaid").length === 0 ? (
                    <div style={{ textAlign: "center", padding: "30px 10px", color: "rgba(255,255,255,0.4)" }}>
                      <CheckCircle size={30} style={{ color: "#10b981", marginBottom: "8px" }} />
                      <p style={{ margin: 0, fontSize: "12px" }}>All invoices fully settled. Soli Deo Gloria!</p>
                    </div>
                  ) : (
                    invoices.filter(i => i.status === "Unpaid").map((inv) => (
                      <div key={inv.id} className="invoice-row-card unpaid" style={{ background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.03)", padding: "16px", borderRadius: "12px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <div>
                            <h4 style={{ margin: "0 0 4px 0", fontSize: "14px", color: "#fff" }}>Invoice #{inv.id} — {inv.service}</h4>
                            <p style={{ margin: 0, fontSize: "11px", color: "rgba(255,255,255,0.5)" }}>
                              Billing Cycle: {inv.billingPeriod} • Due Date: <strong>{inv.dueDate}</strong>
                            </p>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <span style={{ fontSize: "15px", fontWeight: "bold", color: "#fff", display: "block" }}>${inv.amount.toFixed(2)}</span>
                            <button
                              className="btn-pay-now"
                              style={{
                                marginTop: "8px",
                                padding: "5px 12px",
                                fontSize: "11px",
                                background: "linear-gradient(135deg, #4f46e5, #6366f1)",
                                border: "none",
                                borderRadius: "6px",
                                color: "white",
                                fontWeight: "bold",
                                cursor: "pointer",
                                boxShadow: "0 2px 10px rgba(99, 102, 241, 0.3)"
                              }}
                              onClick={() => setPayingInvoiceId(inv.id)}
                            >
                              Pay Invoice
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Subscriptions Card */}
              <div className="panel-card" style={{ height: "fit-content" }}>
                <h3 style={{ fontSize: "16px", marginBottom: "5px" }}>Active Subscription Plans</h3>
                <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", marginBottom: "15px" }}>Manage recurring weekly academic blocks and coaching suites.</p>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {(billingStats?.subscriptions || subscriptionsDb).map(sub => (
                    <div key={sub.id} style={{ background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: "10px", padding: "12px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <h4 style={{ margin: "0 0 2px 0", fontSize: "13px", color: "#fff" }}>Weekly Study Suite ({sub.billingInterval})</h4>
                          <p style={{ margin: 0, fontSize: "10px", color: "rgba(255,255,255,0.4)" }}>
                            Tutor: <strong>{sub.tutorName}</strong> • Provider: {sub.provider?.toUpperCase()}
                          </p>
                        </div>
                        <span style={{ fontSize: "13px", fontWeight: "bold", color: "#fff" }}>${sub.amount.toFixed(2)}/mo</span>
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.03)", marginTop: "10px", paddingTop: "8px", fontSize: "10px" }}>
                        {sub.status === "Active" ? (
                          <span style={{ color: "#10b981", fontWeight: "bold" }}>✓ Next Invoice: {sub.nextBillingDate}</span>
                        ) : (
                          <span style={{ color: "rgba(255,255,255,0.3)" }}>Cancelled on {sub.cancelledAt?.split("T")[0] || "recently"}</span>
                        )}
                        {sub.status === "Active" && (
                          <button 
                            onClick={() => handleCancelSubscription(sub.id)}
                            style={{ background: "none", border: "none", color: "#f87171", cursor: "pointer", fontWeight: "bold", padding: 0 }}
                          >
                            Cancel Plan
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Payment & Audit History */}
            <div className="panel-card">
              <h3 style={{ fontSize: "16px", marginBottom: "5px" }}>Payment & Receipt Auditing Log</h3>
              <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", marginBottom: "15px" }}>Official ledger of all tuition payments. Click Download to save your tax-deductible educational receipt.</p>

              <table className="parent-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <th style={{ textAlign: "left", padding: "10px", fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>Date</th>
                    <th style={{ textAlign: "left", padding: "10px", fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>Billing Item</th>
                    <th style={{ textAlign: "left", padding: "10px", fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>Provider</th>
                    <th style={{ textAlign: "left", padding: "10px", fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>Amount</th>
                    <th style={{ textAlign: "left", padding: "10px", fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>Audit Status</th>
                    <th style={{ textAlign: "right", padding: "10px", fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(billingStats?.transactions || paymentsDb).map((tx) => (
                    <tr key={tx.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.02)" }}>
                      <td style={{ padding: "12px 10px", fontSize: "12px", color: "rgba(255,255,255,0.7)" }}>
                        {tx.paidAt ? tx.paidAt.split("T")[0] : tx.date}
                      </td>
                      <td style={{ padding: "12px 10px", fontSize: "12px", fontWeight: "600", color: "#fff" }}>
                        {tx.subject}
                      </td>
                      <td style={{ padding: "12px 10px", fontSize: "11px" }}>
                        <span style={{ padding: "2px 6px", borderRadius: "4px", background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.7)" }}>
                          {tx.provider}
                        </span>
                      </td>
                      <td style={{ padding: "12px 10px", fontSize: "12px", fontWeight: "bold", color: "#fff" }}>
                        ${tx.amount.toFixed(2)}
                      </td>
                      <td style={{ padding: "12px 10px", fontSize: "11px" }}>
                        {tx.status === "Paid" ? (
                          <span style={{ color: "#10b981", background: "rgba(16, 185, 129, 0.1)", padding: "2px 8px", borderRadius: "10px", fontWeight: "bold" }}>✓ Settled (Paid)</span>
                        ) : tx.status === "Pending_Verification" ? (
                          <span style={{ color: "#f59e0b", background: "rgba(245, 158, 11, 0.1)", padding: "2px 8px", borderRadius: "10px", fontWeight: "bold" }}>⏳ Zelle Verification Pending</span>
                        ) : (
                          <span style={{ color: "#f87171", background: "rgba(239, 68, 68, 0.1)", padding: "2px 8px", borderRadius: "10px", fontWeight: "bold" }}>Refunded</span>
                        )}
                      </td>
                      <td style={{ padding: "12px 10px", textAlign: "right" }}>
                        {tx.status === "Paid" && (
                          <button
                            onClick={() => handleDownloadReceipt(tx)}
                            style={{
                              background: "rgba(99, 102, 241, 0.1)",
                              border: "1px solid rgba(99, 102, 241, 0.2)",
                              borderRadius: "6px",
                              color: "#818cf8",
                              padding: "4px 8px",
                              fontSize: "11px",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              fontWeight: "bold"
                            }}
                          >
                            <Download size={10} /> Download Receipt
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        )}

      </div>

      {/* Credit Card / Multi-Provider Checkout Modal */}
      {payingInvoiceId && (
        <div className="modal-backdrop">
          <div className="modal-content animate-scale-up" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "480px" }}>
            {paymentSuccess ? (
              <div className="text-center animate-scale-up" style={{ padding: "30px 10px" }}>
                <CheckCircle className="payment-success-modal-icon" style={{ color: "#10b981", fontSize: "40px", margin: "0 auto 15px auto" }} />
                <h3 style={{ fontSize: "18px", color: "#fff", marginBottom: "8px" }}>Payment Processed!</h3>
                {selectedProvider === "zelle" ? (
                  <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)" }}>
                    Zelle authorization code registered successfully. Our Administrator will verify this transfer, auto-generate Zoom links, and alert you in under 10 minutes.
                  </p>
                ) : (
                  <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)" }}>
                    Invoice settled successfully. Your tutor's earnings have updated, receipts were emailed, and Zoom virtual classroom meeting details have been updated.
                  </p>
                )}
              </div>
            ) : (
              <div className="payment-modal-form" style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h3 style={{ margin: 0, fontSize: "18px" }}>Settle Student Invoice</h3>
                  <button 
                    onClick={() => setPayingInvoiceId(null)}
                    style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer" }}
                  >
                    ✕
                  </button>
                </div>
                
                <p style={{ margin: 0, fontSize: "12px", color: "rgba(255,255,255,0.6)" }}>
                  Settle Invoice #{payingInvoiceId} for <strong>${invoices.find((i) => i.id === payingInvoiceId)?.amount.toFixed(2)}</strong>.
                </p>

                {/* Provider Selector */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", background: "rgba(255,255,255,0.02)", padding: "4px", borderRadius: "8px" }}>
                  <button 
                    className={`provider-tab ${selectedProvider === "stripe" ? "active" : ""}`}
                    style={{
                      padding: "8px 5px",
                      background: selectedProvider === "stripe" ? "linear-gradient(135deg, #6366f1, #4f46e5)" : "none",
                      border: "none",
                      borderRadius: "6px",
                      color: "#fff",
                      fontSize: "11px",
                      fontWeight: "bold",
                      cursor: "pointer"
                    }}
                    onClick={() => setSelectedProvider("stripe")}
                  >
                    💳 Stripe (Primary)
                  </button>
                  <button 
                    className={`provider-tab ${selectedProvider === "paypal" ? "active" : ""}`}
                    style={{
                      padding: "8px 5px",
                      background: selectedProvider === "paypal" ? "linear-gradient(135deg, #3b82f6, #1d4ed8)" : "none",
                      border: "none",
                      borderRadius: "6px",
                      color: "#fff",
                      fontSize: "11px",
                      fontWeight: "bold",
                      cursor: "pointer"
                    }}
                    onClick={() => setSelectedProvider("paypal")}
                  >
                    🅿️ PayPal Sandbox
                  </button>
                  <button 
                    className={`provider-tab ${selectedProvider === "zelle" ? "active" : ""}`}
                    style={{
                      padding: "8px 5px",
                      background: selectedProvider === "zelle" ? "linear-gradient(135deg, #a855f7, #7e22ce)" : "none",
                      border: "none",
                      borderRadius: "6px",
                      color: "#fff",
                      fontSize: "11px",
                      fontWeight: "bold",
                      cursor: "pointer"
                    }}
                    onClick={() => setSelectedProvider("zelle")}
                  >
                    ⚡ Zelle verified
                  </button>
                </div>

                <form onSubmit={handlePayInvoiceSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px", marginTop: "10px" }}>
                  
                  {/* STRIPE CARD CHECKOUT FORM */}
                  {selectedProvider === "stripe" && (
                    <>
                      <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                        <label style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)" }}>Cardholder Name</label>
                        <input type="text" value="Grace Sterling" disabled className="disabled-input" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", padding: "8px 12px", borderRadius: "6px", color: "rgba(255,255,255,0.4)" }} />
                      </div>

                      <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                        <label style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)" }}>Credit Card Number *</label>
                        <input
                          type="text"
                          required
                          placeholder="4111 2222 3333 4444"
                          value={ccNumber}
                          onChange={(e) => setCcNumber(e.target.value)}
                          style={{ background: "#0c0f33", border: "1px solid #2e3573", padding: "8px 12px", borderRadius: "6px", color: "#fff" }}
                        />
                      </div>

                      <div className="card-expiry-cvv-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                        <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                          <label style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)" }}>Expiry Date *</label>
                          <input type="text" placeholder="MM/YY" required style={{ background: "#0c0f33", border: "1px solid #2e3573", padding: "8px 12px", borderRadius: "6px", color: "#fff" }} />
                        </div>
                        <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                          <label style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)" }}>CVV Code *</label>
                          <input type="password" placeholder="•••" required maxLength="3" style={{ background: "#0c0f33", border: "1px solid #2e3573", padding: "8px 12px", borderRadius: "6px", color: "#fff" }} />
                        </div>
                      </div>
                    </>
                  )}

                  {/* PAYPAL BILLING GATEWAY */}
                  {selectedProvider === "paypal" && (
                    <div style={{ background: "rgba(59, 130, 246, 0.05)", border: "1px solid rgba(59, 130, 246, 0.15)", padding: "15px", borderRadius: "10px", display: "flex", flexDirection: "column", gap: "10px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{ fontSize: "20px" }}>🅿️</span>
                        <div>
                          <h4 style={{ margin: 0, fontSize: "13px", color: "#fff" }}>PayPal Express Checkout Sandbox</h4>
                          <p style={{ margin: 0, fontSize: "10px", color: "rgba(255,255,255,0.5)" }}>Fast, secure checkout via PayPal credentials.</p>
                        </div>
                      </div>
                      
                      <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                        <label style={{ fontSize: "10px", color: "rgba(255,255,255,0.6)" }}>PayPal Account Email</label>
                        <input 
                          type="email" 
                          required 
                          value={paypalEmail} 
                          onChange={(e) => setPaypalEmail(e.target.value)}
                          style={{ background: "#0c0f33", border: "1px solid #2e3573", padding: "8px 12px", borderRadius: "6px", color: "#fff", fontSize: "12px" }} 
                        />
                      </div>

                      <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", pt: "10px", marginTop: "5px" }}>
                        <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "11px", cursor: "pointer", color: "rgba(255,255,255,0.7)" }}>
                          <input type="checkbox" defaultChecked style={{ cursor: "pointer" }} />
                          <span>Link this invoice payment as a monthly recurring subscription block</span>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* ZELLE VERIFICATION ROUTE */}
                  {selectedProvider === "zelle" && (
                    <div style={{ background: "rgba(168, 85, 247, 0.05)", border: "1px solid rgba(168, 85, 247, 0.15)", padding: "15px", borderRadius: "10px", display: "flex", flexDirection: "column", gap: "12px" }}>
                      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", pb: "8px" }}>
                        <span style={{ fontSize: "11px", fontWeight: "bold", color: "#c084fc", uppercase: "true", tracking: "wider" }}>Zelle Instruction Checklist</span>
                      </div>
                      <ol style={{ margin: 0, paddingLeft: "15px", fontSize: "11px", color: "rgba(255,255,255,0.7)", display: "flex", flexDirection: "column", gap: "6px" }}>
                        <li>Open your preferred banking application.</li>
                        <li>Send exactly <strong>${invoices.find((i) => i.id === payingInvoiceId)?.amount.toFixed(2)}</strong> to <strong>payments@ambience.com</strong>.</li>
                        <li>Copy the Zelle authorization / reference code.</li>
                        <li>Paste that reference code in the input below.</li>
                      </ol>

                      <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "5px", marginTop: "5px" }}>
                        <label style={{ fontSize: "10px", color: "rgba(255,255,255,0.6)" }}>Zelle Reference/Auth Code *</label>
                        <input
                          type="text"
                          required
                          placeholder="ZL_81729A"
                          value={zelleCode}
                          onChange={(e) => setZelleCode(e.target.value)}
                          style={{ background: "#0c0f33", border: "1px solid #2e3573", padding: "8px 12px", borderRadius: "6px", color: "#fff", textTransform: "uppercase" }}
                        />
                      </div>
                    </div>
                  )}

                  <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                    <button 
                      type="submit" 
                      className="btn-primary-glowing"
                      disabled={paymentLoading}
                      style={{
                        flex: 1,
                        background: "linear-gradient(135deg, #10b981, #059669)",
                        border: "none",
                        borderRadius: "8px",
                        padding: "10px 15px",
                        color: "white",
                        fontWeight: "bold",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        boxShadow: "0 4px 15px rgba(16, 185, 129, 0.3)"
                      }}
                    >
                      {paymentLoading ? "Settiing payment rails..." : (
                        <>
                          <Lock size={12} /> Confirm Secure Payment
                        </>
                      )}
                    </button>
                    <button 
                      type="button" 
                      className="btn-secondary" 
                      onClick={() => setPayingInvoiceId(null)}
                      style={{ padding: "10px 15px" }}
                    >
                      Cancel
                    </button>
                  </div>

                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
