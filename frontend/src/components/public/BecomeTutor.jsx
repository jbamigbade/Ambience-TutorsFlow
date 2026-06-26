import React, { useState } from "react";
import { Sparkles, Award, ShieldCheck, Heart, Users, BookOpen, Send, Clock, DollarSign, CheckCircle } from "lucide-react";

export default function BecomeTutor() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    timezone: "America/New_York",
    hourlyRate: "65",
    bio: "",
    subjects: "",
    experience: "5+ Years",
    faithAlignment: "Yes",
    gradeLevels: []
  });

  const [submitted, setSubmitted] = useState(false);

  const handleGradeLevelChange = (level) => {
    setFormData(prev => {
      const current = [...prev.gradeLevels];
      if (current.includes(level)) {
        return { ...prev, gradeLevels: current.filter(l => l !== level) };
      } else {
        return { ...prev, gradeLevels: [...current, level] };
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.bio) return;
    setSubmitted(true);
  };

  return (
    <div className="page-container become-tutor-page animate-fade-in">
      
      {/* Hero Section */}
      <section className="become-hero text-center" style={{ padding: "80px 24px 60px" }}>
        <span className="section-subtitle" style={{ letterSpacing: "2px", color: "var(--gold-faith)", fontWeight: "bold" }}>
          JOIN THE COHORT
        </span>
        <h1 style={{ fontSize: "3rem", fontWeight: "900", color: "#fff", margin: "12px 0" }}>
          Empower Scholars & <span className="gradient-text">Inspire Virtues</span>
        </h1>
        <p className="hero-subtitle" style={{ maxWidth: "800px", margin: "0 auto", color: "var(--text-slate)", fontSize: "1.2rem", lineHeight: "1.6" }}>
          Partner with Ambience TutorsFlow™ to deliver corporate-grade academic coaching paired with robust, faith-inspired character education. Manage your entire professional tutoring practice in one elegant workspace.
        </p>
      </section>

      {/* Theological Statement & Dedication */}
      <section className="dedication-section" style={{ background: "rgba(13, 18, 51, 0.3)", padding: "24px", textAlign: "center", marginBottom: "50px", borderY: "1px solid var(--border-glass)" }}>
        <p className="theological-statement" style={{ fontStyle: "italic", color: "var(--gold-faith)" }}>
          "Train up a child in the way he should go; even when he is old he will not depart from it." — Proverbs 22:6
        </p>
        <div className="glory-badge-mini" style={{ textTransform: "uppercase", fontSize: "11px", fontWeight: "bold", letterSpacing: "1px" }}>
          Soli Deo Gloria
        </div>
      </section>

      {/* Value Propositions for Tutors */}
      <section className="tutor-benefits-section" style={{ marginBottom: "80px", padding: "0 24px" }}>
        <div className="section-header text-center" style={{ marginBottom: "40px" }}>
          <h2 style={{ fontSize: "2rem", color: "#fff" }}>Why Tutoring with Us Flows Differently</h2>
          <p style={{ color: "var(--text-slate)", maxWidth: "600px", margin: "10px auto" }}>
            We provide the advanced software utility, client matching, and curriculum assets so you can focus entirely on your student's learning and moral growth.
          </p>
        </div>

        <div className="services-summary-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
          
          <div className="service-group-card" style={{ background: "rgba(13, 18, 51, 0.45)", border: "1px solid var(--border-glass)", padding: "30px", borderRadius: "16px" }}>
            <div className="card-icon-header" style={{ color: "var(--turquoise-accent)", marginBottom: "16px" }}><DollarSign size={32} /></div>
            <h3 style={{ color: "#fff", marginBottom: "12px" }}>Premium Rates & Auto-Pay</h3>
            <p style={{ color: "var(--text-slate)", fontSize: "0.95rem", lineHeight: "1.5" }}>
              Set your own professional rate starting at <strong>$55–$95+/hr</strong>. Our system automates professional parent invoicing and handles electronic stripe clearings seamlessly.
            </p>
          </div>

          <div className="service-group-card" style={{ background: "rgba(13, 18, 51, 0.45)", border: "1px solid var(--border-glass)", padding: "30px", borderRadius: "16px" }}>
            <div className="card-icon-header" style={{ color: "var(--indigo-glowing)", marginBottom: "16px" }}><Clock size={32} /></div>
            <h3 style={{ color: "#fff", marginBottom: "12px" }}>Automated Roster Control</h3>
            <p style={{ color: "var(--text-slate)", fontSize: "0.95rem", lineHeight: "1.5" }}>
              Input your weekly timezoneavailability blocks. Parents view calendar openings and register sessions directly. No constant scheduling back-and-forth.
            </p>
          </div>

          <div className="service-group-card" style={{ background: "rgba(13, 18, 51, 0.45)", border: "1px solid var(--border-glass)", padding: "30px", borderRadius: "16px" }}>
            <div className="card-icon-header" style={{ color: "var(--gold-faith)", marginBottom: "16px" }}><Award size={32} /></div>
            <h3 style={{ color: "#fff", marginBottom: "12px" }}>Growth Journey™ Motives</h3>
            <p style={{ color: "var(--text-slate)", fontSize: "0.95rem", lineHeight: "1.5" }}>
              Leverage our gamified scholar ranks. Mark assignments finished or log reflections to reward student points, streak multipliers, and moral virtue badges.
            </p>
          </div>

          <div className="service-group-card" style={{ background: "rgba(13, 18, 51, 0.45)", border: "1px solid var(--border-glass)", padding: "30px", borderRadius: "16px" }}>
            <div className="card-icon-header" style={{ color: "var(--turquoise-accent)", marginBottom: "16px" }}><ShieldCheck size={32} /></div>
            <h3 style={{ color: "#fff", marginBottom: "12px" }}>Structured IEP Support</h3>
            <p style={{ color: "var(--text-slate)", fontSize: "0.95rem", lineHeight: "1.5" }}>
              Support neurodivergent learners. Track progress on formalized goals, register classroom accommodations, and document academic tutor observations securely.
            </p>
          </div>

        </div>
      </section>

      {/* Target Market Sectors */}
      <section className="sectors-section" style={{ marginBottom: "80px", padding: "60px 24px", background: "rgba(4, 6, 21, 0.5)", borderY: "1px solid rgba(255,255,255,0.04)" }}>
        <div className="section-header text-center" style={{ marginBottom: "40px" }}>
          <h2 style={{ fontSize: "2rem", color: "#fff" }}>Serving All Spheres of Learning</h2>
          <p style={{ color: "var(--text-slate)", maxWidth: "600px", margin: "10px auto" }}>
            Tutors on our platform coordinate with families, church networks, hybrid academies, and independent local learning centers.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px", maxWidth: "1200px", margin: "0 auto" }}>
          
          <div style={{ background: "rgba(255,255,255,0.01)", padding: "24px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.03)" }}>
            <h4 style={{ color: "var(--gold-faith)", margin: "0 0 10px 0" }}>💒 Churches & Parochial Groups</h4>
            <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--text-slate)", lineHeight: "1.5" }}>
              Equip church ministries and parish networks with premium, faith-aligned academic resources to support community discipleship and educational care.
            </p>
          </div>

          <div style={{ background: "rgba(255,255,255,0.01)", padding: "24px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.03)" }}>
            <h4 style={{ color: "var(--gold-faith)", margin: "0 0 10px 0" }}>🏡 Homeschool Co-ops & Pods</h4>
            <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--text-slate)", lineHeight: "1.5" }}>
              Provide hybrid educators with unified grade reporting, custom curriculum, dynamic homework registries, and direct IEP support systems.
            </p>
          </div>

          <div style={{ background: "rgba(255,255,255,0.01)", padding: "24px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.03)" }}>
            <h4 style={{ color: "var(--gold-faith)", margin: "0 0 10px 0" }}>🏫 Learning Centers & Academies</h4>
            <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--text-slate)", lineHeight: "1.5" }}>
              Streamline multi-tutor coordination, student streak metrics, parent communication, and structured, printable performance cards.
            </p>
          </div>

        </div>
      </section>

      {/* Tutor Application Form */}
      <section className="application-form-section" style={{ maxWidth: "720px", margin: "0 auto 100px", padding: "0 24px" }}>
        <div style={{ background: "rgba(13, 18, 51, 0.4)", border: "1px solid var(--border-glass)", padding: "40px", borderRadius: "16px", backdropFilter: "blur(10px)" }}>
          {submitted ? (
            <div className="text-center animate-scale-up" style={{ padding: "40px 20px" }}>
              <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "rgba(23, 233, 206, 0.1)", display: "flex", alignItems: "center", justifyCenter: "center", margin: "0 auto 20px", color: "var(--turquoise-accent)", border: "1px solid rgba(23, 233, 206, 0.3)" }}>
                <CheckCircle size={32} style={{ margin: "auto" }} />
              </div>
              <h2 style={{ color: "#fff", marginBottom: "10px" }}>Application Received Securely!</h2>
              <p style={{ color: "var(--text-slate)", fontSize: "0.95rem", lineHeight: "1.6", marginBottom: "24px" }}>
                Soli Deo Gloria. Thank you, {formData.fullName}. Our academic-theological review team will review your application bio, and send an interview slot schedule within 48 hours.
              </p>
              <button className="btn-secondary" onClick={() => {
                setFormData({
                  fullName: "",
                  email: "",
                  phone: "",
                  timezone: "America/New_York",
                  hourlyRate: "65",
                  bio: "",
                  subjects: "",
                  experience: "5+ Years",
                  faithAlignment: "Yes",
                  gradeLevels: []
                });
                setSubmitted(false);
              }}>
                Apply with Another Profile
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <h3 style={{ fontSize: "1.5rem", color: "#fff", marginBottom: "8px", textCenter: "center" }}>Tutor Covenant & Application</h3>
              <p style={{ color: "var(--text-slate)", fontSize: "0.9rem", marginBottom: "30px", textCenter: "center" }}>
                Apply to become an approved mentor on Ambience TutorsFlow™. Start building your premium coaching roster.
              </p>

              <div className="form-group" style={{ marginBottom: "20px" }}>
                <label style={{ color: "#fff", fontSize: "11px", display: "block", marginBottom: "6px", textTransform: "uppercase" }}>Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Mrs. Sarah Jenkins"
                  value={formData.fullName}
                  onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                  style={{ width: "100%", background: "#0c0f33", border: "1px solid #2e3573", color: "#fff", padding: "10px", borderRadius: "6px" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
                <div className="form-group">
                  <label style={{ color: "#fff", fontSize: "11px", display: "block", marginBottom: "6px", textTransform: "uppercase" }}>Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="sarah@tutorsflow.com"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    style={{ width: "100%", background: "#0c0f33", border: "1px solid #2e3573", color: "#fff", padding: "10px", borderRadius: "6px" }}
                  />
                </div>
                <div className="form-group">
                  <label style={{ color: "#fff", fontSize: "11px", display: "block", marginBottom: "6px", textTransform: "uppercase" }}>Phone Number</label>
                  <input
                    type="text"
                    placeholder="+1 (555) 019-2834"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    style={{ width: "100%", background: "#0c0f33", border: "1px solid #2e3573", color: "#fff", padding: "10px", borderRadius: "6px" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "16px", marginBottom: "20px" }}>
                <div className="form-group">
                  <label style={{ color: "#fff", fontSize: "11px", display: "block", marginBottom: "6px", textTransform: "uppercase" }}>Primary Timezone *</label>
                  <select
                    value={formData.timezone}
                    onChange={e => setFormData({ ...formData, timezone: e.target.value })}
                    style={{ width: "100%", background: "#0c0f33", border: "1px solid #2e3573", color: "#fff", padding: "10px", borderRadius: "6px" }}
                  >
                    <option value="America/New_York">Eastern Time (EST / EDT)</option>
                    <option value="America/Chicago">Central Time (CST / CDT)</option>
                    <option value="America/Denver">Mountain Time (MST / MDT)</option>
                    <option value="America/Los_Angeles">Pacific Time (PST / PDT)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label style={{ color: "#fff", fontSize: "11px", display: "block", marginBottom: "6px", textTransform: "uppercase" }}>Preferred Hourly Rate ($)</label>
                  <input
                    type="number"
                    min="40"
                    max="150"
                    value={formData.hourlyRate}
                    onChange={e => setFormData({ ...formData, hourlyRate: e.target.value })}
                    style={{ width: "100%", background: "#0c0f33", border: "1px solid #2e3573", color: "#fff", padding: "10px", borderRadius: "6px" }}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: "20px" }}>
                <label style={{ color: "#fff", fontSize: "11px", display: "block", marginBottom: "6px", textTransform: "uppercase" }}>Grade Level Focus (Select All That Apply)</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "4px" }}>
                  {["K-5 Primary", "6-8 Middle School", "9-12 High School", "College Level"].map(lvl => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => handleGradeLevelChange(lvl)}
                      style={{
                        padding: "8px 14px",
                        borderRadius: "6px",
                        fontSize: "12px",
                        fontWeight: "600",
                        cursor: "pointer",
                        border: formData.gradeLevels.includes(lvl) ? "1px solid var(--turquoise-accent)" : "1px solid rgba(255,255,255,0.08)",
                        background: formData.gradeLevels.includes(lvl) ? "rgba(23, 233, 206, 0.12)" : "rgba(255,255,255,0.02)",
                        color: formData.gradeLevels.includes(lvl) ? "var(--turquoise-accent)" : "var(--text-slate)",
                        transition: "all 0.2s"
                      }}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
                <div className="form-group">
                  <label style={{ color: "#fff", fontSize: "11px", display: "block", marginBottom: "6px", textTransform: "uppercase" }}>Years of Tutoring Experience</label>
                  <select
                    value={formData.experience}
                    onChange={e => setFormData({ ...formData, experience: e.target.value })}
                    style={{ width: "100%", background: "#0c0f33", border: "1px solid #2e3573", color: "#fff", padding: "10px", borderRadius: "6px" }}
                  >
                    <option value="1-2 Years">1-2 Years</option>
                    <option value="3-4 Years">3-2 Years</option>
                    <option value="5+ Years">5+ Years (Preferred)</option>
                    <option value="Certified State Teacher">Certified K-12 Teacher</option>
                  </select>
                </div>
                <div className="form-group">
                  <label style={{ color: "#fff", fontSize: "11px", display: "block", marginBottom: "6px", textTransform: "uppercase" }}>Align with Character Theme?</label>
                  <select
                    value={formData.faithAlignment}
                    onChange={e => setFormData({ ...formData, faithAlignment: e.target.value })}
                    style={{ width: "100%", background: "#0c0f33", border: "1px solid #2e3573", color: "#fff", padding: "10px", borderRadius: "6px" }}
                  >
                    <option value="Yes">Yes, gladly integrate noble virtues</option>
                    <option value="Neutral">Comfortable teaching moral themes</option>
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: "20px" }}>
                <label style={{ color: "#fff", fontSize: "11px", display: "block", marginBottom: "6px", textTransform: "uppercase" }}>Subjects You Specialize In *</label>
                <input
                  type="text"
                  required
                  placeholder="Pre-Calculus, Phonics Reading, Writing, SAT Math"
                  value={formData.subjects}
                  onChange={e => setFormData({ ...formData, subjects: e.target.value })}
                  style={{ width: "100%", background: "#0c0f33", border: "1px solid #2e3573", color: "#fff", padding: "10px", borderRadius: "6px" }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: "30px" }}>
                <label style={{ color: "#fff", fontSize: "11px", display: "block", marginBottom: "6px", textTransform: "uppercase" }}>Professional Biography & Theological Integration Statement *</label>
                <textarea
                  rows="4"
                  required
                  placeholder="Tell us about your background, pedagogical approach, and alignment with motivating learners toward virtuous excellence..."
                  value={formData.bio}
                  onChange={e => setFormData({ ...formData, bio: e.target.value })}
                  style={{ width: "100%", background: "#0c0f33", border: "1px solid #2e3573", color: "#fff", padding: "10px", borderRadius: "6px", fontSize: "13px", lineHeight: "1.5" }}
                />
              </div>

              <button type="submit" className="btn-primary-glowing" style={{ width: "100%", justifyCenter: "center", display: "flex", gap: "8px" }}>
                <Send size={14} className="btn-icon" />
                <span>Submit Approved Tutor Application</span>
              </button>
            </form>
          )}
        </div>
      </section>

    </div>
  );
}
