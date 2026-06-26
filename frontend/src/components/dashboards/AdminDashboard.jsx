import React, { useContext, useState, useEffect } from "react";
import { AppContext } from "../../context/AppContext";
import {
  Users,
  GraduationCap,
  ShieldCheck,
  TrendingUp,
  Plus,
  Trash,
  Settings,
  Mail,
  AlertCircle,
  FileSpreadsheet,
  CheckCircle,
  DollarSign,
  Search,
  Percent,
  Clock,
  CreditCard
} from "lucide-react";

export default function AdminDashboard() {
  const {
    tutors,
    students,
    invoices,
    addTutor,
    deleteTutor,
    addStudent,
    deleteStudent,
    apiFetch
  } = useContext(AppContext);

  const [activeSubTab, setActiveSubTab] = useState("Telemetry"); // Telemetry, Tutors, Students, Billing
  
  // New Tutor form states
  const [tutName, setTutName] = useState("");
  const [tutRole, setTutRole] = useState("Junior Academic Coach");
  const [tutBio, setTutBio] = useState("");
  const [tutSubjects, setTutSubjects] = useState("");
  const [tutSuccess, setTutSuccess] = useState(false);

  // New Student form states
  const [stdName, setStdName] = useState("");
  const [stdGrade, setStdGrade] = useState("10th Grade");
  const [stdParent, setStdParent] = useState("");
  const [stdParentEmail, setStdParentEmail] = useState("");
  const [stdSuccess, setStdSuccess] = useState(false);

  // Live Multi-Provider Financial States
  const [billingStats, setBillingStats] = useState({
    grossRevenue: 375.00,
    commissionCollected: 75.00,
    tutorEarningsPayout: 300.00,
    transactions: [],
    invoices: [],
    subscriptions: []
  });
  const [loadingBilling, setLoadingBilling] = useState(true);
  const [commissionRate, setCommissionRate] = useState(20);
  const [commissionSuccess, setCommissionSuccess] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [zelleVerificationSuccess, setZelleVerificationSuccess] = useState("");

  const fetchBillingStats = async () => {
    try {
      const response = await apiFetch("http://localhost:5000/api/payments/dashboard-stats?role=Admin");
      if (response.ok) {
        const data = await response.json();
        setBillingStats(data);
      } else {
        throw new Error("API error");
      }
    } catch (err) {
      console.warn("[Admin Dashboard Stats] Offline fallback triggered. Populating simulation ledgers.", err);
      // Fallback local calculations
      const paidInvoices = invoices.filter(i => i.status === "Paid");
      const totalGross = paidInvoices.reduce((sum, i) => sum + i.amount, 0);
      const totalComm = parseFloat((totalGross * (commissionRate / 100)).toFixed(2));
      const totalPayout = parseFloat((totalGross - totalComm).toFixed(2));

      setBillingStats({
        grossRevenue: totalGross || 375.00,
        commissionCollected: totalComm || 75.00,
        tutorEarningsPayout: totalPayout || 300.00,
        transactions: [
          {
            id: "pay_1",
            studentName: "Caleb Sterling",
            subject: "Pre-Calculus Tutoring Block",
            date: "2026-06-15",
            timeSlot: "4:00 PM - 5:00 PM",
            amount: 150.00,
            commissionPercent: 20,
            commissionAmount: 30.00,
            tutorEarnings: 120.00,
            provider: "STRIPE",
            status: "Paid"
          },
          {
            id: "pay_2",
            studentName: "Caleb Sterling",
            subject: "Reading Remediation Block",
            date: "2026-06-20",
            timeSlot: "5:15 PM - 6:15 PM",
            amount: 75.00,
            commissionPercent: 20,
            commissionAmount: 15.00,
            tutorEarnings: 60.00,
            provider: "PAYPAL",
            status: "Paid"
          },
          {
            id: "pay_3",
            studentName: "Caleb Sterling",
            subject: "IEP Support Session",
            date: "2026-06-25",
            timeSlot: "4:00 PM - 5:00 PM",
            amount: 150.00,
            commissionPercent: 20,
            commissionAmount: 30.00,
            tutorEarnings: 120.00,
            provider: "ZELLE",
            status: "Pending_Verification",
            zelleReferenceCode: "ZL_9281A837"
          }
        ],
        invoices: invoices,
        subscriptions: [
          {
            id: "sub_1",
            studentName: "Caleb Sterling",
            tutorName: "Mrs. Sarah Jenkins",
            amount: 300.00,
            billingInterval: "Monthly",
            status: "Active",
            provider: "stripe",
            createdAt: "2026-06-10",
            nextBillingDate: "2026-07-10"
          }
        ]
      });
    } finally {
      setLoadingBilling(false);
    }
  };

  const fetchCommissionPolicy = async () => {
    try {
      const response = await apiFetch("http://localhost:5000/api/payments/commission/org_1");
      if (response.ok) {
        const data = await response.json();
        setCommissionRate(data.commissionPercent || 20);
      }
    } catch (err) {
      console.warn("[Admin Commission Policy] Offline fallback. Mapped default 20%.", err);
    }
  };

  useEffect(() => {
    fetchBillingStats();
    fetchCommissionPolicy();
  }, [invoices]);

  const handleVerifyZelle = async (paymentId) => {
    try {
      const response = await apiFetch("http://localhost:5000/api/payments/verify-zelle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId })
      });
      if (response.ok) {
        setZelleVerificationSuccess(`Payment #${paymentId} successfully verified! Booking confirmed.`);
        fetchBillingStats();
        setTimeout(() => setZelleVerificationSuccess(""), 4000);
      } else {
        const errData = await response.json();
        alert(`Error verifying payment: ${errData.error || "Verification failed."}`);
      }
    } catch (err) {
      console.warn("[Verify Zelle] Offline fallback triggered.", err);
      setZelleVerificationSuccess(`[OFFLINE] Verified Zelle payment locally!`);
      setBillingStats(prev => {
        const updatedTransactions = prev.transactions.map(tx => tx.id === paymentId ? { ...tx, status: "Paid", paidAt: new Date().toISOString() } : tx);
        return {
          ...prev,
          transactions: updatedTransactions
        };
      });
      setTimeout(() => setZelleVerificationSuccess(""), 4000);
    }
  };

  const handleUpdateCommissionPolicy = async (e) => {
    e.preventDefault();
    try {
      const response = await apiFetch("http://localhost:5000/api/payments/commission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgId: "org_1", commissionPercent: commissionRate })
      });
      if (response.ok) {
        setCommissionSuccess(`Commission policy updated to ${commissionRate}% successfully!`);
        fetchBillingStats();
        setTimeout(() => setCommissionSuccess(""), 3500);
      } else {
        throw new Error("Update policy failed");
      }
    } catch (err) {
      console.warn("[Save Commission] Offline fallback. Saved locally.", err);
      setCommissionSuccess(`[OFFLINE] Commission rate saved locally: ${commissionRate}%`);
      setTimeout(() => setCommissionSuccess(""), 3500);
    }
  };

  // Calculate stats
  const totalRevenue = invoices
    .filter((i) => i.status === "Paid")
    .reduce((sum, i) => sum + i.amount, 0);

  const pendingRevenue = invoices
    .filter((i) => i.status === "Unpaid")
    .reduce((sum, i) => sum + i.amount, 0);

  const handleAddTutorSubmit = (e) => {
    e.preventDefault();
    if (!tutName || !tutBio) return;

    addTutor({
      name: tutName,
      role: tutRole,
      bio: tutBio,
      subjects: tutSubjects ? tutSubjects.split(",").map((s) => s.trim()) : ["General Studies"]
    });

    setTutName("");
    setTutBio("");
    setTutSubjects("");
    setTutSuccess(true);
    setTimeout(() => setTutSuccess(false), 3000);
  };

  const handleAddStudentSubmit = (e) => {
    e.preventDefault();
    if (!stdName || !stdParent || !stdParentEmail) return;

    addStudent({
      name: stdName,
      grade: stdGrade,
      parentName: stdParent,
      parentEmail: stdParentEmail,
      overallProgress: 0,
      subjects: []
    });

    setStdName("");
    setStdParent("");
    setStdParentEmail("");
    setStdSuccess(true);
    setTimeout(() => setStdSuccess(false), 3000);
  };

  return (
    <div className="dashboard-content admin-dashboard animate-fade-in">
      
      {/* Admin Header */}
      <div className="dashboard-banner admin-banner">
        <div className="banner-text">
          <span className="banner-badge">ADMINISTRATOR PORTAL</span>
          <h1>System Telemetry & Controls</h1>
          <p>
            Manage educational services, approve tutors, audit financial ledgers, and view platform metrics. Soli Deo Gloria.
          </p>
        </div>
        <div className="admin-status-node">
          <Settings className="admin-spin-icon" />
          <span>Database Online • 4 Roles Synchronized</span>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="dashboard-tabs-header-row">
        <button className={`dashboard-tab-trigger ${activeSubTab === "Telemetry" ? "active" : ""}`} onClick={() => setActiveSubTab("Telemetry")}>
          <TrendingUp className="tab-trigger-icon" />
          <span>Platform Telemetry</span>
        </button>
        <button className={`dashboard-tab-trigger ${activeSubTab === "Tutors" ? "active" : ""}`} onClick={() => setActiveSubTab("Tutors")}>
          <Users className="tab-trigger-icon" />
          <span>Manage Tutors ({tutors.length})</span>
        </button>
        <button className={`dashboard-tab-trigger ${activeSubTab === "Students" ? "active" : ""}`} onClick={() => setActiveSubTab("Students")}>
          <GraduationCap className="tab-trigger-icon" />
          <span>Manage Students ({students.length})</span>
        </button>
        <button className={`dashboard-tab-trigger ${activeSubTab === "Billing" ? "active" : ""}`} onClick={() => setActiveSubTab("Billing")}>
          <FileSpreadsheet className="tab-trigger-icon" />
          <span>Billing Audits</span>
        </button>
      </div>

      {/* Admin Main Window Panels */}
      <div className="admin-panel-body">
        
        {/* Tab: Platform Telemetry */}
        {activeSubTab === "Telemetry" && (
          <div className="telemetry-grid animate-scale-up">
            
            {/* KPI Cards Row */}
            <div className="overview-kpis">
              <div className="kpi-card purple-kpi">
                <span className="kpi-label">Settled Gross Revenue</span>
                <h3>${(billingStats.grossRevenue || 0).toFixed(2)}</h3>
                <p>Collected across payment channels</p>
              </div>

              <div className="kpi-card green-kpi">
                <span className="kpi-label">Platform Commissions</span>
                <h3>${(billingStats.commissionCollected || 0).toFixed(2)}</h3>
                <p>Total share accumulated ({commissionRate}%)</p>
              </div>

              <div className="kpi-card gold-kpi">
                <span className="kpi-label">Net Tutor Disbursements</span>
                <h3>${(billingStats.tutorEarningsPayout || 0).toFixed(2)}</h3>
                <p>Disbursed to mentor accounts</p>
              </div>

              <div className="kpi-card teal-kpi">
                <span className="kpi-label">Active Instructors</span>
                <h3>{tutors.length} Verified</h3>
                <p>100% credentials verified</p>
              </div>
            </div>

            {/* Service Distribution Report mockup */}
            <div className="telemetry-chart-card">
              <h3>Academic Portfolio Share</h3>
              <p>Platform distribution by student registration categories.</p>
              
              <div className="progress-bars-distribution">
                <div className="telemetry-dist-row">
                  <span>K-12 Core Academics (42%)</span>
                  <div className="meter-wrapper"><div className="meter-fill" style={{ width: "42%" }}></div></div>
                </div>
                <div className="telemetry-dist-row">
                  <span>College Mathematics (28%)</span>
                  <div className="meter-wrapper"><div className="meter-fill" style={{ width: "28%" }}></div></div>
                </div>
                <div className="telemetry-dist-row">
                  <span>SAT & ACT Course Prep (20%)</span>
                  <div className="meter-wrapper"><div className="meter-fill" style={{ width: "20%" }}></div></div>
                </div>
                <div className="telemetry-dist-row">
                  <span>IEP & Specialized Services (10%)</span>
                  <div className="meter-wrapper"><div className="meter-fill" style={{ width: "10%" }}></div></div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Tab: Manage Tutors */}
        {activeSubTab === "Tutors" && (
          <div className="admin-manage-grid animate-scale-up">
            
            {/* Lead Tutors list */}
            <div className="manage-list-box">
              <h3>Tutor Records</h3>
              <p>Click "Deactivate" to suspend portal credentials.</p>

              <div className="admin-records-list">
                {tutors.map((t) => (
                  <div key={t.id} className="record-row-item">
                    <div className="record-meta-info">
                      <img src={t.image} alt={t.name} className="record-mini-img" />
                      <div>
                        <h4>{t.name}</h4>
                        <p>{t.role} • <strong>Rating: ⭐{t.rating}</strong></p>
                      </div>
                    </div>
                    <button className="btn-deactivate" onClick={() => deleteTutor(t.id)}>
                      <Trash className="btn-icon-tiny" />
                      <span>Deactivate</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Add Tutor form */}
            <div className="manage-form-box">
              <h3>Approve Certified Tutor</h3>
              <p>Initialize a mentor credential file in our active SQL server.</p>

              {tutSuccess ? (
                <div className="success-banner text-center">
                  <CheckCircle className="success-tick-icon" />
                  <h4>Tutor Registered Successfully!</h4>
                  <p>Credentials active. Tutor has been populated inside selection dropdowns.</p>
                </div>
              ) : (
                <form onSubmit={handleAddTutorSubmit} className="admin-inline-form">
                  <div className="form-group">
                    <label>Tutor Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="E.g., Dr. Hannah Abbott"
                      value={tutName}
                      onChange={(e) => setTutName(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Assigned Specialty Role *</label>
                    <select value={tutRole} onChange={(e) => setTutRole(e.target.value)}>
                      <option value="Senior College Mathematics Lead">Senior College Mathematics Lead</option>
                      <option value="Certified IEP Intervention Specialist">Certified IEP Intervention Specialist</option>
                      <option value="K-12 Creative Core Mentor">K-12 Creative Core Mentor</option>
                      <option value="Secondary Standardized Exam Tutor">Secondary Standardized Exam Tutor</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Core Competency Subjects (comma-separated) *</label>
                    <input
                      type="text"
                      required
                      placeholder="E.g., Pre-Calculus, Calculus I, Calculus II, SAT Prep"
                      value={tutSubjects}
                      onChange={(e) => setTutSubjects(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Tutor Statement & Biography *</label>
                    <textarea
                      rows="3"
                      required
                      placeholder="Academic degree, pedagogy philosophies, and professional goals..."
                      value={tutBio}
                      onChange={(e) => setTutBio(e.target.value)}
                    ></textarea>
                  </div>

                  <button type="submit" className="btn-primary-glowing">
                    <Plus className="btn-icon" />
                    <span>Register Certified Tutor</span>
                  </button>
                </form>
              )}
            </div>

          </div>
        )}

        {/* Tab: Manage Students */}
        {activeSubTab === "Students" && (
          <div className="admin-manage-grid animate-scale-up">
            
            {/* Student Records */}
            <div className="manage-list-box">
              <h3>Student Registry Records</h3>
              <p>Active student profile files.</p>

              <div className="admin-records-list">
                {students.map((s) => (
                  <div key={s.id} className="record-row-item">
                    <div className="record-meta-info">
                      <div className="avatar-placeholder">{s.name[0]}</div>
                      <div>
                        <h4>{s.name}</h4>
                        <p>{s.grade} • Streak: {s.streak} Days • Level: <strong>{s.level}</strong></p>
                      </div>
                    </div>
                    <button className="btn-deactivate" onClick={() => deleteStudent(s.id)}>
                      <Trash className="btn-icon-tiny" />
                      <span>Deactivate</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Add Student Form */}
            <div className="manage-form-box">
              <h3>Onboard Student Profile</h3>
              <p>Onboard student profile and link parent billing coordinates.</p>

              {stdSuccess ? (
                <div className="success-banner text-center">
                  <CheckCircle className="success-tick-icon" />
                  <h4>Student Registered Successfully!</h4>
                  <p>Profile mapped to Growth Journey™ and active dashboards synced.</p>
                </div>
              ) : (
                <form onSubmit={handleAddStudentSubmit} className="admin-inline-form">
                  <div className="form-group">
                    <label>Student Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="E.g., Sophia Sterling"
                      value={stdName}
                      onChange={(e) => setStdName(e.target.value)}
                    />
                  </div>

                  <div className="form-row-grid">
                    <div className="form-group">
                      <label>Grade Level *</label>
                      <select value={stdGrade} onChange={(e) => setStdGrade(e.target.value)}>
                        <option value="Elementary School">Elementary School</option>
                        <option value="Middle School">Middle School</option>
                        <option value="9th Grade">9th Grade</option>
                        <option value="10th Grade">10th Grade</option>
                        <option value="11th Grade">11th Grade</option>
                        <option value="12th Grade">12th Grade</option>
                        <option value="College Undergraduate">College Undergraduate</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Primary Parent / Guardian *</label>
                      <input
                        type="text"
                        required
                        placeholder="E.g., Grace Sterling"
                        value={stdParent}
                        onChange={(e) => setStdParent(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Parent Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="grace@sterling.com"
                      value={stdParentEmail}
                      onChange={(e) => setStdParentEmail(e.target.value)}
                    />
                  </div>

                  <button type="submit" className="btn-primary-glowing">
                    <Plus className="btn-icon" />
                    <span>Onboard Student Ledger</span>
                  </button>
                </form>
              )}
            </div>

          </div>
        )}

        {/* Tab: Billing Audits */}
        {activeSubTab === "Billing" && (
          <div className="billing-audits-container animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            
            {/* Top Row: Commission Policy & Zelle Verification Queue */}
            <div className="billing-top-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px" }}>
              
              {/* Card 1: Commission Policy Configuration */}
              <div className="panel-card" style={{ background: "rgba(20, 30, 60, 0.45)", backdropFilter: "blur(12px)", border: "1px solid rgba(255, 215, 0, 0.15)", borderRadius: "16px", padding: "20px" }}>
                <div className="panel-card-header" style={{ marginBottom: "16px", borderBottom: "1px solid rgba(255, 255, 255, 0.1)", paddingBottom: "10px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <Percent style={{ color: "var(--gold-faith)", width: "20px", height: "20px" }} />
                    <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "600", color: "#fff" }}>Organization Commission Split</h3>
                  </div>
                  <p style={{ fontSize: "0.85rem", color: "#a0aec0", margin: "4px 0 0 0" }}>Adjust the revenue split percentage automatically deducted by the platform.</p>
                </div>

                {commissionSuccess && (
                  <div style={{ background: "rgba(16, 185, 129, 0.15)", border: "1px solid rgba(16, 185, 129, 0.3)", padding: "10px 14px", borderRadius: "8px", color: "#34d399", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
                    <CheckCircle style={{ width: "16px", height: "16px", flexShrink: 0 }} />
                    <span>{commissionSuccess}</span>
                  </div>
                )}

                <form onSubmit={handleUpdateCommissionPolicy} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", marginBottom: "8px" }}>
                      <span style={{ fontSize: "0.9rem", color: "#fff" }}>Platform Take Rate</span>
                      <span style={{ fontSize: "1.2rem", fontWeight: "bold", color: "var(--gold-faith)", textShadow: "0 0 8px rgba(255, 215, 0, 0.3)" }}>{commissionRate}%</span>
                    </div>
                    
                    <input 
                      type="range" 
                      min="0" 
                      max="50" 
                      step="1"
                      value={commissionRate} 
                      onChange={(e) => setCommissionRate(parseInt(e.target.value))}
                      style={{ 
                        width: "100%", 
                        height: "6px", 
                        background: "rgba(255,255,255,0.1)", 
                        borderRadius: "3px", 
                        outline: "none",
                        accentColor: "var(--gold-faith)"
                      }}
                    />
                    
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "#718096", marginTop: "4px" }}>
                      <span>0% (Free Platform)</span>
                      <span>25% (Standard)</span>
                      <span>50% (Max Commission)</span>
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.8rem", color: "#a0aec0", background: "rgba(255, 255, 255, 0.03)", padding: "10px", borderRadius: "8px", border: "1px solid rgba(255, 255, 255, 0.05)" }}>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span>Tutor Split: <strong>{100 - commissionRate}%</strong></span>
                      <span>Platform Share: <strong>{commissionRate}%</strong></span>
                    </div>
                    <button type="submit" className="btn-primary-glowing" style={{ padding: "6px 12px", fontSize: "0.8rem", borderRadius: "6px" }}>
                      Save Policy
                    </button>
                  </div>
                </form>
              </div>

              {/* Card 2: Zelle Verification Queue */}
              <div className="panel-card" style={{ background: "rgba(20, 30, 60, 0.45)", backdropFilter: "blur(12px)", border: "1px solid rgba(255, 215, 0, 0.15)", borderRadius: "16px", padding: "20px", display: "flex", flexDirection: "column" }}>
                <div className="panel-card-header" style={{ marginBottom: "16px", borderBottom: "1px solid rgba(255, 255, 255, 0.1)", paddingBottom: "10px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <ShieldCheck style={{ color: "var(--gold-faith)", width: "20px", height: "20px" }} />
                    <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "600", color: "#fff" }}>Zelle Verification Queue</h3>
                  </div>
                  <p style={{ fontSize: "0.85rem", color: "#a0aec0", margin: "4px 0 0 0" }}>Approve bank transfers and auto-create sessions + Zoom details.</p>
                </div>

                {zelleVerificationSuccess && (
                  <div style={{ background: "rgba(16, 185, 129, 0.15)", border: "1px solid rgba(16, 185, 129, 0.3)", padding: "10px 14px", borderRadius: "8px", color: "#34d399", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
                    <CheckCircle style={{ width: "16px", height: "16px", flexShrink: 0 }} />
                    <span>{zelleVerificationSuccess}</span>
                  </div>
                )}

                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "10px", maxHeight: "200px", overflowY: "auto", paddingRight: "4px" }}>
                  {billingStats.transactions.filter(t => t.provider === "ZELLE" && t.status === "Pending_Verification").length === 0 ? (
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", color: "#a0aec0", minHeight: "130px", background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.1)", borderRadius: "8px", padding: "10px" }}>
                      <CheckCircle style={{ width: "24px", height: "24px", color: "#34d399", marginBottom: "8px" }} />
                      <span style={{ fontSize: "0.85rem", fontWeight: "500" }}>All clear! No pending Zelle transfers.</span>
                      <span style={{ fontSize: "0.75rem", color: "#718096" }}>Manual bank audits are fully up to date.</span>
                    </div>
                  ) : (
                    billingStats.transactions.filter(t => t.provider === "ZELLE" && t.status === "Pending_Verification").map((tx) => (
                      <div key={tx.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.03)", padding: "12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.06)", gap: "10px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <span style={{ fontSize: "0.85rem", fontWeight: "600", color: "#fff" }}>{tx.studentName}</span>
                            <span style={{ fontSize: "0.75rem", background: "rgba(255, 215, 0, 0.15)", color: "var(--gold-faith)", padding: "1px 6px", borderRadius: "10px", border: "1px solid rgba(255, 215, 0, 0.2)" }}>Zelle Pending</span>
                          </div>
                          <span style={{ fontSize: "0.75rem", color: "#a0aec0" }}>{tx.subject || "Tutoring Session"}</span>
                          <span style={{ fontSize: "0.7rem", color: "#718096", fontFamily: "monospace" }}>Ref Code: <strong style={{ color: "#fff" }}>{tx.zelleReferenceCode || "N/A"}</strong></span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
                          <span style={{ fontSize: "0.95rem", fontWeight: "bold", color: "#fff" }}>${tx.amount.toFixed(2)}</span>
                          <button 
                            onClick={() => handleVerifyZelle(tx.id)} 
                            className="btn-primary-glowing" 
                            style={{ 
                              padding: "4px 10px", 
                              fontSize: "0.75rem", 
                              borderRadius: "4px", 
                              background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                              border: "none",
                              boxShadow: "0 0 10px rgba(16, 185, 129, 0.3)"
                            }}
                          >
                            Verify & Provision
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

            {/* Bottom Section: Cumulative Revenue Logs / Historical Ledger */}
            <div className="panel-card animate-scale-up" style={{ padding: "20px", borderRadius: "16px" }}>
              <div className="panel-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", marginBottom: "20px", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "12px" }}>
                <div>
                  <h3 style={{ fontSize: "1.2rem", fontWeight: "600", color: "#fff", margin: 0 }}>Cumulative Platform Revenue Ledger</h3>
                  <p style={{ fontSize: "0.85rem", color: "#a0aec0", margin: "4px 0 0 0" }}>Historical log of all cleared transactions, provider channels, and commission splits.</p>
                </div>
                
                {/* Elegant Search Input */}
                <div style={{ position: "relative", minWidth: "260px" }}>
                  <Search style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", width: "16px", height: "16px", color: "rgba(255,255,255,0.4)" }} />
                  <input 
                    type="text" 
                    placeholder="Search by student or transaction ID..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ 
                      width: "100%", 
                      padding: "8px 12px 8px 36px", 
                      borderRadius: "8px", 
                      border: "1px solid rgba(255,255,255,0.15)", 
                      background: "rgba(0,0,0,0.25)", 
                      color: "#fff", 
                      fontSize: "0.85rem",
                      outline: "none"
                    }} 
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery("")} 
                      style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", border: "none", background: "none", color: "rgba(255,255,255,0.4)", fontSize: "0.8rem", cursor: "pointer" }}
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Transactions Ledger Table */}
              <div style={{ overflowX: "auto" }}>
                <table className="parent-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ textAlign: "left", borderBottom: "1px solid rgba(255, 255, 255, 0.15)" }}>
                      <th style={{ padding: "12px", color: "var(--gold-faith)", fontSize: "0.85rem", fontWeight: "600" }}>Transaction ID</th>
                      <th style={{ padding: "12px", color: "var(--gold-faith)", fontSize: "0.85rem", fontWeight: "600" }}>Parent & Student</th>
                      <th style={{ padding: "12px", color: "var(--gold-faith)", fontSize: "0.85rem", fontWeight: "600" }}>Booking Details</th>
                      <th style={{ padding: "12px", color: "var(--gold-faith)", fontSize: "0.85rem", fontWeight: "600" }}>Gross Amount</th>
                      <th style={{ padding: "12px", color: "var(--gold-faith)", fontSize: "0.85rem", fontWeight: "600" }}>Platform Split</th>
                      <th style={{ padding: "12px", color: "var(--gold-faith)", fontSize: "0.85rem", fontWeight: "600" }}>Tutor Earnings</th>
                      <th style={{ padding: "12px", color: "var(--gold-faith)", fontSize: "0.85rem", fontWeight: "600" }}>Channel</th>
                      <th style={{ padding: "12px", color: "var(--gold-faith)", fontSize: "0.85rem", fontWeight: "600" }}>Audit Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {billingStats.transactions.filter(tx => {
                      if (!searchQuery) return true;
                      const q = searchQuery.toLowerCase();
                      return (
                        (tx.id && tx.id.toLowerCase().includes(q)) ||
                        (tx.studentName && tx.studentName.toLowerCase().includes(q)) ||
                        (tx.transactionId && tx.transactionId.toLowerCase().includes(q)) ||
                        (tx.zelleReferenceCode && tx.zelleReferenceCode.toLowerCase().includes(q))
                      );
                    }).length === 0 ? (
                      <tr>
                        <td colSpan="8" style={{ textAlign: "center", padding: "30px", color: "#a0aec0" }}>
                          No matching financial transactions found.
                        </td>
                      </tr>
                    ) : (
                      billingStats.transactions
                        .filter(tx => {
                          if (!searchQuery) return true;
                          const q = searchQuery.toLowerCase();
                          return (
                            (tx.id && tx.id.toLowerCase().includes(q)) ||
                            (tx.studentName && tx.studentName.toLowerCase().includes(q)) ||
                            (tx.transactionId && tx.transactionId.toLowerCase().includes(q)) ||
                            (tx.zelleReferenceCode && tx.zelleReferenceCode.toLowerCase().includes(q))
                          );
                        })
                        .map((tx) => {
                          const isZellePending = tx.provider === "ZELLE" && tx.status === "Pending_Verification";
                          
                          // Style payment provider badges
                          let providerBadgeStyle = {
                            background: "rgba(255,255,255,0.05)",
                            color: "#fff",
                            border: "1px solid rgba(255,255,255,0.1)"
                          };
                          if (tx.provider === "STRIPE") {
                            providerBadgeStyle = {
                              background: "rgba(99, 91, 255, 0.15)",
                              color: "#7b75ff",
                              border: "1px solid rgba(99, 91, 255, 0.25)"
                            };
                          } else if (tx.provider === "PAYPAL") {
                            providerBadgeStyle = {
                              background: "rgba(0, 112, 186, 0.15)",
                              color: "#0079c1",
                              border: "1px solid rgba(0, 112, 186, 0.25)"
                            };
                          } else if (tx.provider === "ZELLE") {
                            providerBadgeStyle = {
                              background: "rgba(116, 52, 211, 0.15)",
                              color: "#ab7cff",
                              border: "1px solid rgba(116, 52, 211, 0.25)"
                            };
                          }

                          return (
                            <tr key={tx.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", background: isZellePending ? "rgba(245, 158, 11, 0.02)" : "transparent" }}>
                              <td style={{ padding: "12px", fontFamily: "monospace", fontSize: "0.8rem", color: "#a0aec0" }}>
                                {tx.transactionId || tx.id}
                              </td>
                              <td style={{ padding: "12px" }}>
                                <div style={{ fontWeight: "600", color: "#fff", fontSize: "0.85rem" }}>{tx.studentName}</div>
                                <span style={{ fontSize: "0.75rem", color: "#718096" }}>Parent Acct</span>
                              </td>
                              <td style={{ padding: "12px" }}>
                                <div style={{ color: "#e2e8f0", fontSize: "0.85rem" }}>{tx.subject || "Academic Mentorship Block"}</div>
                                <div style={{ fontSize: "0.75rem", color: "#718096" }}>{tx.date} • {tx.timeSlot}</div>
                              </td>
                              <td style={{ padding: "12px", fontSize: "0.85rem", color: "#fff" }}>
                                <strong>${tx.amount.toFixed(2)}</strong>
                              </td>
                              <td style={{ padding: "12px", fontSize: "0.85rem", color: "var(--gold-faith)" }}>
                                <span>${(tx.commissionAmount || 0).toFixed(2)}</span>
                                <span style={{ fontSize: "0.7rem", color: "#718096", marginLeft: "4px" }}>({tx.commissionPercent || commissionRate}%)</span>
                              </td>
                              <td style={{ padding: "12px", fontSize: "0.85rem", color: "#34d399", fontWeight: "600" }}>
                                ${((tx.tutorEarnings !== undefined) ? tx.tutorEarnings : (tx.amount - (tx.commissionAmount || 0))).toFixed(2)}
                              </td>
                              <td style={{ padding: "12px" }}>
                                <span style={{ 
                                  fontSize: "0.75rem", 
                                  fontWeight: "bold", 
                                  padding: "2px 8px", 
                                  borderRadius: "4px",
                                  ...providerBadgeStyle
                                }}>
                                  {tx.provider}
                                </span>
                              </td>
                              <td style={{ padding: "12px" }}>
                                <span style={{ 
                                  fontSize: "0.75rem", 
                                  fontWeight: "500", 
                                  padding: "2px 8px", 
                                  borderRadius: "12px",
                                  background: isZellePending ? "rgba(245, 158, 11, 0.15)" : "rgba(16, 185, 129, 0.15)",
                                  color: isZellePending ? "#fbbf24" : "#34d399",
                                  border: isZellePending ? "1px solid rgba(245, 158, 11, 0.25)" : "1px solid rgba(16, 185, 129, 0.25)"
                                }}>
                                  {isZellePending ? "Pending Verification" : "✓ Paid & Settled"}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
