import React, { useContext, useState, useEffect } from "react";
import { AppContext } from "../../context/AppContext";
import {
  TrendingUp,
  Users,
  GraduationCap,
  Mail,
  Clock,
  DollarSign,
  CreditCard,
  Percent,
  CheckCircle,
  AlertCircle,
  ShieldCheck,
  Sparkles,
  History,
  FileSpreadsheet
} from "lucide-react";

export default function AiAdminIntelligence() {
  const {
    tutors,
    students,
    invoices,
    adminInsights,
    addAdminInsight,
    apiFetch,
    isLoading: isDbLoading
  } = useContext(AppContext);

  // Filter States
  const [dateRange, setDateRange] = useState("Last 30 Days");
  const [selectedTutor, setSelectedTutor] = useState("All Tutors");
  const [selectedStudent, setSelectedStudent] = useState("All Students");
  const [selectedSubject, setSelectedSubject] = useState("All Subjects");
  const [selectedGrade, setSelectedGrade] = useState("All Grades");
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState("All Statuses");

  // Generator & State Managers
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [insights, setInsights] = useState(null);
  const [source, setSource] = useState("");
  const [error, setError] = useState(null);
  const [successMsg, setSuccessSuccessMsg] = useState("");

  const steps = [
    "Compiling platform-level telemetry metrics...",
    "Querying Supabase PostgreSQL schema & transactional tables...",
    "Executing multi-tenant risk-detection audit logs...",
    "Running Gemini 2.5 Flash administrative algorithms...",
    "Formulating tactical interventions & operational blueprints..."
  ];

  // Auto-run animated step indicator if loading
  useEffect(() => {
    let interval;
    if (loading) {
      interval = setInterval(() => {
        setLoadingStep((prev) => {
          if (prev < steps.length - 1) return prev + 1;
          return prev;
        });
      }, 1500);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLoadingStep(0);
    setError(null);
    setInsights(null);
    setSource("");

    const filters = {
      dateRange,
      tutor: selectedTutor,
      student: selectedStudent,
      subject: selectedSubject,
      gradeLevel: selectedGrade,
      paymentStatus: selectedPaymentStatus
    };

    try {
      const response = await apiFetch("http://localhost:5000/api/ai/generate-admin-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filters })
      });

      if (!response.ok) {
        throw new Error(`Platform error (${response.status}): Failed to compile intelligence report.`);
      }

      const data = await response.json();
      if (data.status === "Success" && data.insightsOutput) {
        setInsights(data.insightsOutput);
        setSource(data.source);

        // Attempt to save to database / local memory context
        const saved = await addAdminInsight(filters, data.insightsOutput);
        if (saved) {
          setSuccessSuccessMsg("Platform intelligence report successfully stored and archived.");
          setTimeout(() => setSuccessSuccessMsg(""), 4000);
        }
      } else {
        throw new Error("Invalid or empty response format from intelligence backend.");
      }
    } catch (err) {
      console.error("[Intelligence Center] Error compiling report:", err);
      setError(err.message || "An unexpected error occurred during intelligence report compilation.");
    } finally {
      setLoading(false);
    }
  };

  const handleReloadHistory = (record) => {
    setInsights(record.content);
    setSource("RELOADED_FROM_ARCHIVE");
    
    // Restore filters if present
    if (record.filters) {
      setDateRange(record.filters.dateRange || "Last 30 Days");
      setSelectedTutor(record.filters.tutor || "All Tutors");
      setSelectedStudent(record.filters.student || "All Students");
      setSelectedSubject(record.filters.subject || "All Subjects");
      setSelectedGrade(record.filters.gradeLevel || "All Grades");
      setSelectedPaymentStatus(record.filters.paymentStatus || "All Statuses");
    }
  };

  return (
    <div className="ai-intelligence-center animate-fade-in">
      
      {/* Introduction Card */}
      <div className="intelligence-intro-card" style={{
        background: "rgba(30, 41, 59, 0.45)",
        backdropFilter: "blur(16px)",
        borderRadius: "16px",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        padding: "24px",
        marginBottom: "24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "20px"
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
            <span style={{
              background: "linear-gradient(135deg, #a855f7 0%, #6366f1 100%)",
              color: "#ffffff",
              fontSize: "11px",
              fontWeight: "700",
              padding: "4px 10px",
              borderRadius: "50px",
              letterSpacing: "1px",
              textTransform: "uppercase"
            }}>Intelligence Center</span>
            <Sparkles style={{ width: "16px", height: "16px", color: "#e9d5ff", animation: "pulse 2s infinite" }} />
          </div>
          <h2 style={{ fontSize: "24px", fontWeight: "700", color: "#f8fafc", margin: "0 0 6px 0" }}>
            Administrator Intelligence Center™
          </h2>
          <p style={{ fontSize: "14px", color: "#94a3b8", margin: 0, lineHeight: "1.5" }}>
            Audit organizational status, monitor real-time student trends, evaluate tutor ratings, and dispatch administrative interventions using high-fidelity Christian Character and academic diagnostics.
          </p>
        </div>
        <div style={{
          background: "rgba(99, 102, 241, 0.1)",
          padding: "16px",
          borderRadius: "50%",
          border: "1px solid rgba(99, 102, 241, 0.25)"
        }}>
          <ShieldCheck style={{ width: "36px", height: "36px", color: "#818cf8" }} />
        </div>
      </div>

      {/* Configuration & Filters Row */}
      <form onSubmit={handleGenerate} style={{
        background: "rgba(15, 23, 42, 0.4)",
        border: "1px solid rgba(255, 255, 255, 0.06)",
        backdropFilter: "blur(12px)",
        borderRadius: "16px",
        padding: "20px",
        marginBottom: "24px"
      }}>
        <h3 style={{ fontSize: "16px", color: "#e2e8f0", margin: "0 0 16px 0", display: "flex", alignItems: "center", gap: "8px" }}>
          <FileSpreadsheet style={{ width: "18px", height: "18px", color: "#a855f7" }} />
          <span>Platform Metrics Filters</span>
        </h3>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px",
          marginBottom: "20px"
        }}>
          {/* Date Range */}
          <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "12px", color: "#94a3b8", fontWeight: "600" }}>Date Range</label>
            <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} style={{
              background: "rgba(30, 41, 59, 0.6)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "8px",
              padding: "10px",
              color: "#f8fafc",
              fontSize: "14px"
            }}>
              <option value="Last 7 Days">Last 7 Days</option>
              <option value="Last 15 Days">Last 15 Days</option>
              <option value="Last 30 Days">Last 30 Days</option>
              <option value="Last 90 Days">Last 90 Days</option>
              <option value="Year to Date">Year to Date</option>
            </select>
          </div>

          {/* Tutor */}
          <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "12px", color: "#94a3b8", fontWeight: "600" }}>Filter Tutor</label>
            <select value={selectedTutor} onChange={(e) => setSelectedTutor(e.target.value)} style={{
              background: "rgba(30, 41, 59, 0.6)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "8px",
              padding: "10px",
              color: "#f8fafc",
              fontSize: "14px"
            }}>
              <option value="All Tutors">All Tutors</option>
              {tutors.map(t => (
                <option key={t.id} value={t.name}>{t.name}</option>
              ))}
            </select>
          </div>

          {/* Student */}
          <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "12px", color: "#94a3b8", fontWeight: "600" }}>Filter Student</label>
            <select value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)} style={{
              background: "rgba(30, 41, 59, 0.6)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "8px",
              padding: "10px",
              color: "#f8fafc",
              fontSize: "14px"
            }}>
              <option value="All Students">All Students</option>
              {students.map(s => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Subject */}
          <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "12px", color: "#94a3b8", fontWeight: "600" }}>Filter Subject</label>
            <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} style={{
              background: "rgba(30, 41, 59, 0.6)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "8px",
              padding: "10px",
              color: "#f8fafc",
              fontSize: "14px"
            }}>
              <option value="All Subjects">All Subjects</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Algebra">Algebra</option>
              <option value="Pre-Calculus">Pre-Calculus</option>
              <option value="Calculus">Calculus</option>
              <option value="Science">Science</option>
              <option value="English/Language Arts">English/Language Arts</option>
              <option value="Bible Study">Bible Study</option>
              <option value="Computer Tech">Computer Tech</option>
            </select>
          </div>

          {/* Grade */}
          <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "12px", color: "#94a3b8", fontWeight: "600" }}>Grade level</label>
            <select value={selectedGrade} onChange={(e) => setSelectedGrade(e.target.value)} style={{
              background: "rgba(30, 41, 59, 0.6)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "8px",
              padding: "10px",
              color: "#f8fafc",
              fontSize: "14px"
            }}>
              <option value="All Grades">All Grades</option>
              <option value="Elementary (K-5)">Elementary (K-5)</option>
              <option value="Middle School (6-8)">Middle School (6-8)</option>
              <option value="9th Grade">9th Grade</option>
              <option value="10th Grade">10th Grade</option>
              <option value="11th Grade">11th Grade</option>
              <option value="12th Grade">12th Grade</option>
            </select>
          </div>

          {/* Payment Status */}
          <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "12px", color: "#94a3b8", fontWeight: "600" }}>Payment status</label>
            <select value={selectedPaymentStatus} onChange={(e) => setSelectedPaymentStatus(e.target.value)} style={{
              background: "rgba(30, 41, 59, 0.6)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "8px",
              padding: "10px",
              color: "#f8fafc",
              fontSize: "14px"
            }}>
              <option value="All Statuses">All Statuses</option>
              <option value="Paid">Paid</option>
              <option value="Unpaid">Unpaid</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary-glowing" style={{
          width: "100%",
          padding: "14px 20px",
          background: "linear-gradient(135deg, #a855f7 0%, #6366f1 100%)",
          color: "#ffffff",
          border: "none",
          borderRadius: "8px",
          fontWeight: "700",
          fontSize: "15px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px",
          transition: "transform 0.2s, box-shadow 0.2s",
          opacity: loading ? 0.7 : 1,
          boxShadow: "0 4px 15px rgba(99, 102, 241, 0.3)"
        }}>
          <Sparkles style={{ width: "18px", height: "18px", animation: "spin 2s linear infinite" }} />
          <span>{loading ? "Compiling Organization Intelligence Report..." : "Generate Platform Intelligence"}</span>
        </button>
      </form>

      {/* System Status Notifications */}
      {successMsg && (
        <div className="success-banner text-center" style={{
          padding: "12px",
          background: "rgba(16, 185, 129, 0.12)",
          backdropFilter: "blur(8px)",
          color: "#34d399",
          border: "1px solid rgba(16, 185, 129, 0.25)",
          borderRadius: "12px",
          marginBottom: "24px",
          fontSize: "14px"
        }}>
          ✅ {successMsg}
        </div>
      )}

      {error && (
        <div className="error-banner" style={{
          padding: "15px",
          background: "rgba(239, 68, 68, 0.12)",
          backdropFilter: "blur(8px)",
          color: "#f87171",
          border: "1px solid rgba(239, 68, 68, 0.25)",
          borderRadius: "12px",
          marginBottom: "24px",
          fontSize: "14px",
          display: "flex",
          alignItems: "center",
          gap: "10px"
        }}>
          <AlertCircle style={{ width: "18px", height: "18px" }} />
          <span>Compile Error: {error}</span>
        </div>
      )}

      {/* Animated step-by-step loading state */}
      {loading && (
        <div className="intelligence-loading-container" style={{
          background: "rgba(30, 41, 59, 0.4)",
          backdropFilter: "blur(12px)",
          borderRadius: "16px",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          padding: "40px 24px",
          textAlign: "center",
          marginBottom: "24px"
        }}>
          <div className="spinner" style={{
            width: "50px",
            height: "50px",
            border: "4px solid rgba(255,255,255,0.05)",
            borderTop: "4px solid #a855f7",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            margin: "0 auto 24px auto"
          }}></div>
          <h4 style={{ color: "#f8fafc", fontSize: "18px", fontWeight: "600", margin: "0 0 8px 0" }}>
            Compiling Intelligence Report
          </h4>
          <p style={{ color: "#818cf8", fontSize: "14px", fontWeight: "700", margin: "0 0 16px 0" }}>
            {steps[loadingStep]}
          </p>
          <div style={{
            maxWidth: "400px",
            background: "rgba(255,255,255,0.05)",
            height: "6px",
            borderRadius: "10px",
            margin: "0 auto",
            overflow: "hidden"
          }}>
            <div style={{
              width: `${((loadingStep + 1) / steps.length) * 100}%`,
              background: "linear-gradient(90deg, #a855f7, #6366f1)",
              height: "100%",
              transition: "width 0.5s ease"
            }}></div>
          </div>
        </div>
      )}

      {/* Insights Display Section */}
      {insights && (
        <div className="insights-results-dashboard animate-scale-up">
          
          {/* Source indicator */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "16px"
          }}>
            <span style={{ fontSize: "12px", color: "#64748b" }}>
              Source: <strong style={{ color: source === "GEMINI_API" ? "#a855f7" : "#38bdf8" }}>{source}</strong>
            </span>
            <span style={{ fontSize: "12px", color: "#64748b" }}>
              Generated: <strong>{new Date().toLocaleDateString()}</strong>
            </span>
          </div>

          {/* KPI Display Panel */}
          <h3 style={{ fontSize: "18px", color: "#f1f5f9", margin: "0 0 16px 0", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "8px" }}>
            Platform Telemetry Metrics
          </h3>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "16px",
            marginBottom: "32px"
          }}>
            {/* 1. Overview */}
            <div style={kpiCardStyle}>
              <div style={kpiHeaderStyle}>
                <TrendingUp style={{ color: "#38bdf8", width: "18px", height: "18px" }} />
                <span style={kpiLabelStyle}>Organization Overview</span>
              </div>
              <p style={kpiTextStyle}>{insights.organizationOverview}</p>
            </div>

            {/* 2. Active Tutors */}
            <div style={kpiCardStyle}>
              <div style={kpiHeaderStyle}>
                <Users style={{ color: "#a855f7", width: "18px", height: "18px" }} />
                <span style={kpiLabelStyle}>Active Tutors</span>
              </div>
              <p style={kpiTextStyle}>{insights.activeTutors}</p>
            </div>

            {/* 3. Active Students */}
            <div style={kpiCardStyle}>
              <div style={kpiHeaderStyle}>
                <GraduationCap style={{ color: "#10b981", width: "18px", height: "18px" }} />
                <span style={kpiLabelStyle}>Active Students</span>
              </div>
              <p style={kpiTextStyle}>{insights.activeStudents}</p>
            </div>

            {/* 4. Parent Engagement */}
            <div style={kpiCardStyle}>
              <div style={kpiHeaderStyle}>
                <Mail style={{ color: "#f43f5e", width: "18px", height: "18px" }} />
                <span style={kpiLabelStyle}>Parent Engagement</span>
              </div>
              <p style={kpiTextStyle}>{insights.parentEngagement}</p>
            </div>

            {/* 5. Bookings */}
            <div style={kpiCardStyle}>
              <div style={kpiHeaderStyle}>
                <Clock style={{ color: "#fbbf24", width: "18px", height: "18px" }} />
                <span style={kpiLabelStyle}>Bookings Summary</span>
              </div>
              <p style={kpiTextStyle}>{insights.bookings}</p>
            </div>

            {/* 6. Revenue */}
            <div style={kpiCardStyle}>
              <div style={kpiHeaderStyle}>
                <DollarSign style={{ color: "#22c55e", width: "18px", height: "18px" }} />
                <span style={kpiLabelStyle}>Revenue Collected</span>
              </div>
              <p style={kpiTextStyle}>{insights.revenue}</p>
            </div>

            {/* 7. Outstanding Invoices */}
            <div style={kpiCardStyle}>
              <div style={kpiHeaderStyle}>
                <CreditCard style={{ color: "#f97316", width: "18px", height: "18px" }} />
                <span style={kpiLabelStyle}>Outstanding Invoices</span>
              </div>
              <p style={kpiTextStyle}>{insights.outstandingInvoices}</p>
            </div>

            {/* 8. AI Usage Metrics */}
            <div style={kpiCardStyle}>
              <div style={kpiHeaderStyle}>
                <Percent style={{ color: "#ec4899", width: "18px", height: "18px" }} />
                <span style={kpiLabelStyle}>AI Adoption Metrics</span>
              </div>
              <p style={kpiTextStyle}>{insights.aiUsageMetrics}</p>
            </div>

            {/* 9. Student Progress Trends */}
            <div style={kpiCardStyle}>
              <div style={kpiHeaderStyle}>
                <TrendingUp style={{ color: "#818cf8", width: "18px", height: "18px" }} />
                <span style={kpiLabelStyle}>Student Progress Trends</span>
              </div>
              <p style={kpiTextStyle}>{insights.studentProgressTrends}</p>
            </div>

            {/* 10. Tutor Activity */}
            <div style={kpiCardStyle}>
              <div style={kpiHeaderStyle}>
                <CheckCircle style={{ color: "#06b6d4", width: "18px", height: "18px" }} />
                <span style={kpiLabelStyle}>Tutor Activity Logs</span>
              </div>
              <p style={kpiTextStyle}>{insights.tutorActivity}</p>
            </div>

            {/* 11. At-Risk Students */}
            <div style={kpiCardStyle}>
              <div style={kpiHeaderStyle}>
                <AlertCircle style={{ color: "#f87171", width: "18px", height: "18px" }} />
                <span style={kpiLabelStyle}>At-Risk Students Overview</span>
              </div>
              <p style={kpiTextStyle}>{insights.atRiskStudents}</p>
            </div>
          </div>

          {/* AI recommendations */}
          <h3 style={{ fontSize: "18px", color: "#f1f5f9", margin: "0 0 16px 0", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "8px" }}>
            AI-Powered Tactical Intelligence
          </h3>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "20px",
            marginBottom: "32px"
          }}>
            {/* Risk Detection */}
            <div style={panelCardStyle("rgba(239, 68, 68, 0.08)", "rgba(239, 68, 68, 0.2)")}>
              <h4 style={panelTitleStyle("#f87171")}>⚠️ Student Risk Detection</h4>
              <p style={panelTextStyle}>{insights.insights?.studentRiskDetection}</p>
            </div>

            {/* Tutor Performance */}
            <div style={panelCardStyle("rgba(99, 102, 241, 0.08)", "rgba(99, 102, 241, 0.2)")}>
              <h4 style={panelTitleStyle("#a5b4fc")}>⭐ Tutor Performance Summary</h4>
              <p style={panelTextStyle}>{insights.insights?.tutorPerformance}</p>
            </div>

            {/* Parent Engagement */}
            <div style={panelCardStyle("rgba(236, 72, 153, 0.08)", "rgba(236, 72, 153, 0.2)")}>
              <h4 style={panelTitleStyle("#fbcfe8")}>💬 Parent Engagement Summary</h4>
              <p style={panelTextStyle}>{insights.insights?.parentEngagement}</p>
            </div>

            {/* Revenue Observations */}
            <div style={panelCardStyle("rgba(34, 197, 94, 0.08)", "rgba(34, 197, 94, 0.2)")}>
              <h4 style={panelTitleStyle("#86efac")}>💵 Revenue & Billing Observations</h4>
              <p style={panelTextStyle}>{insights.insights?.revenueObservations}</p>
            </div>

            {/* Suggested Interventions */}
            <div style={panelCardStyle("rgba(251, 191, 36, 0.08)", "rgba(251, 191, 36, 0.2)")}>
              <h4 style={panelTitleStyle("#fde047")}>💡 Suggested Interventions</h4>
              <p style={panelTextStyle}>{insights.insights?.suggestedInterventions}</p>
            </div>

            {/* Operational Recommendations */}
            <div style={panelCardStyle("rgba(6, 182, 212, 0.08)", "rgba(6, 182, 212, 0.2)")}>
              <h4 style={panelTitleStyle("#67e8f9")}>⚙️ Operational Recommendations</h4>
              <p style={panelTextStyle}>{insights.insights?.operationalRecommendations}</p>
            </div>
          </div>
        </div>
      )}

      {/* Saved Insights History List */}
      {adminInsights.length > 0 && (
        <div style={{
          background: "rgba(15, 23, 42, 0.3)",
          border: "1px solid rgba(255, 255, 255, 0.06)",
          borderRadius: "16px",
          padding: "20px"
        }}>
          <h3 style={{ fontSize: "16px", color: "#e2e8f0", margin: "0 0 16px 0", display: "flex", alignItems: "center", gap: "8px" }}>
            <History style={{ width: "18px", height: "18px", color: "#6366f1" }} />
            <span>Archived Intelligence Reports ({adminInsights.length})</span>
          </h3>
          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            maxHeight: "300px",
            overflowY: "auto"
          }}>
            {adminInsights.map((record) => (
              <div key={record.id} style={{
                background: "rgba(30, 41, 59, 0.4)",
                borderRadius: "12px",
                border: "1px solid rgba(255, 255, 255, 0.05)",
                padding: "14px 16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "10px"
              }}>
                <div>
                  <h4 style={{ fontSize: "14px", color: "#f1f5f9", margin: "0 0 4px 0" }}>
                    Report for {record.filters?.student || "All Students"} • {record.filters?.subject || "All Subjects"}
                  </h4>
                  <p style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>
                    Filters: Tutor: {record.filters?.tutor || "All"}, Date: {record.filters?.dateRange || "All"} | Archived {new Date(record.createdAt).toLocaleString()}
                  </p>
                </div>
                <button className="btn-secondary" onClick={() => handleReloadHistory(record)} style={{
                  padding: "6px 12px",
                  fontSize: "12px",
                  fontWeight: "600",
                  cursor: "pointer",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "6px",
                  background: "rgba(255,255,255,0.05)",
                  color: "#e2e8f0"
                }}>Reload Archive</button>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

// Styling Tokens to ensure elite aesthetic look
const kpiCardStyle = {
  background: "rgba(30, 41, 59, 0.35)",
  backdropFilter: "blur(10px)",
  borderRadius: "12px",
  border: "1px solid rgba(255, 255, 255, 0.05)",
  padding: "16px",
  display: "flex",
  flexDirection: "column",
  gap: "10px",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)"
};

const kpiHeaderStyle = {
  display: "flex",
  alignItems: "center",
  gap: "8px"
};

const kpiLabelStyle = {
  fontSize: "13px",
  color: "#94a3b8",
  fontWeight: "700"
};

const kpiTextStyle = {
  fontSize: "13px",
  color: "#cbd5e1",
  margin: 0,
  lineHeight: "1.5"
};

const panelCardStyle = (bg, border) => ({
  background: bg,
  borderRadius: "14px",
  border: `1px solid ${border}`,
  padding: "20px",
  display: "flex",
  flexDirection: "column",
  gap: "10px",
  boxShadow: "0 10px 30px rgba(0,0,0,0.1)"
});

const panelTitleStyle = (color) => ({
  fontSize: "15px",
  fontWeight: "700",
  color: color,
  margin: 0,
  textTransform: "uppercase",
  letterSpacing: "0.5px"
});

const panelTextStyle = {
  fontSize: "13px",
  color: "#e2e8f0",
  margin: 0,
  lineHeight: "1.6",
  whiteSpace: "pre-line"
};
