// Ambience TutorsFlow™ Public Pricing Page
// Soli Deo Gloria — Glory to God the Father, God the Son, and God the Holy Spirit.

import React, { useState, useContext } from "react";
import { AppContext } from "../../context/AppContext";
import { 
  Check, 
  Zap, 
  ShieldCheck, 
  HelpCircle, 
  Award, 
  Sparkles, 
  Building, 
  Layers, 
  GraduationCap,
  X,
  Star,
  ArrowRight,
  ChevronDown
} from "lucide-react";

export default function Pricing() {
  const { setCurrentPage, isLoggedIn, upgradeSubscription } = useContext(AppContext);
  const [billingInterval, setBillingInterval] = useState("Monthly");
  const [activeCategory, setActiveCategory] = useState("Student"); // Student, Tutor, Institutional
  const [openFaq, setOpenFaq] = useState(null);

  const STUDENT_PLANS = [
    {
      id: "free",
      name: "Free",
      price: 0,
      description: "Basic learning dashboard and scheduling.",
      perks: [
        "Core scheduling",
        "Standard calendar notes",
        "1 free AI analysis mock try",
        "Community forum access"
      ],
      ctaText: "Start Free",
      action: () => setCurrentPage(isLoggedIn ? "Dashboard" : "Login")
    },
    {
      id: "student_basic",
      name: "Student AI Basic",
      price: 19,
      description: "AI concept explanations and homework guidance.",
      perks: [
        "All Free features",
        "AI concept breakdown",
        "10 homework uploads/mo",
        "Encouraging hints"
      ],
      ctaText: "Choose Basic",
      action: () => setCurrentPage(isLoggedIn ? "Dashboard" : "Login")
    },
    {
      id: "student_plus",
      name: "Student AI Plus",
      price: 49,
      description: "Advanced homework solving and step-by-step guidance.",
      perks: [
        "All Basic features",
        "Unlimited homework uploads",
        "Step-by-step solutions",
        "Similar practice generators",
        "Track mastery analytics",
        "AI Study Vault integration"
      ],
      recommended: true,
      ctaText: "Choose Plus",
      action: () => setCurrentPage(isLoggedIn ? "Dashboard" : "Login")
    },
    {
      id: "student_premium",
      name: "Student AI Premium",
      price: 99,
      description: "VIP level learning tools with custom practice.",
      perks: [
        "All Plus features",
        "Custom practice exam builder",
        "Specialized IEP assistance",
        "Advanced diagnostic SAT/ACT analytics",
        "Priority support (24/7 VIP)"
      ],
      ctaText: "Choose Premium",
      action: () => setCurrentPage(isLoggedIn ? "Dashboard" : "Login")
    }
  ];

  const TUTOR_PLANS = [
    {
      id: "tutor_starter",
      name: "Tutor Starter",
      price: 29,
      description: "Perfect for independent tutors.",
      hours: "0 hours (Ad-hoc coaching)",
      perks: [
        "Included tutoring hours: 0 hours",
        "AI Lesson Planner",
        "AI Tutor Copilot",
        "AI Homework Assistant",
        "Student Progress Analytics",
        "Parent Reports",
        "Character Education integration",
        "Session Notes auto-compiler",
        "Priority Support (Email)"
      ],
      ctaText: "Choose Starter",
      action: () => setCurrentPage(isLoggedIn ? "Dashboard" : "Login")
    },
    {
      id: "tutor_flex",
      name: "Tutor Flex",
      price: 299,
      description: "Includes 4 tutoring hours/month.",
      hours: "4 hours/month",
      perks: [
        "Included tutoring hours: 4 hours",
        "AI Lesson Planner",
        "AI Tutor Copilot",
        "AI Homework Assistant",
        "Student Progress Analytics",
        "Parent Reports",
        "Character Education integration",
        "Session Notes auto-compiler",
        "Priority Support (Chat)"
      ],
      ctaText: "Choose Flex",
      action: () => setCurrentPage(isLoggedIn ? "Dashboard" : "Login")
    },
    {
      id: "tutor_professional",
      name: "Tutor Professional",
      price: 499,
      description: "Includes 8 tutoring hours/month.",
      hours: "8 hours/month",
      recommended: true,
      perks: [
        "Included tutoring hours: 8 hours",
        "AI Lesson Planner",
        "AI Tutor Copilot",
        "AI Homework Assistant",
        "Student Progress Analytics",
        "Parent Reports",
        "Character Education integration",
        "Session Notes auto-compiler",
        "Priority Support (24/7 VIP)"
      ],
      ctaText: "Choose Professional",
      action: () => setCurrentPage(isLoggedIn ? "Dashboard" : "Login")
    },
    {
      id: "tutor_elite",
      name: "Tutor Elite",
      price: 799,
      description: "Includes 16 tutoring hours/month.",
      hours: "16 hours/month",
      perks: [
        "Included tutoring hours: 16 hours",
        "AI Lesson Planner",
        "AI Tutor Copilot",
        "AI Homework Assistant",
        "Student Progress Analytics",
        "Parent Reports",
        "Character Education integration",
        "Session Notes auto-compiler",
        "Priority Support (Dedicated Manager)"
      ],
      ctaText: "Choose Elite",
      action: () => setCurrentPage(isLoggedIn ? "Dashboard" : "Login")
    }
  ];

  const INSTITUTIONAL_PLANS = [
    {
      id: "business",
      name: "Business",
      price: 199,
      description: "Full center control panel with executive analytics.",
      perks: [
        "Administrator Intelligence Center",
        "Multi-tenant audit logs",
        "Custom learning center branding",
        "Unlimited tutors and students",
        "Staff analytical performance tracking",
        "Dedicated database integration space"
      ],
      ctaText: "Contact Sales",
      action: () => setCurrentPage("Contact")
    },
    {
      id: "school",
      name: "School",
      price: 499,
      description: "District and school integration dashboard.",
      perks: [
        "District-wide LMS integration (Canvas/LTI)",
        "School-board diagnostics auditing",
        "Custom school subdomains",
        "Dedicated service accounts",
        "White-glove data migrations",
        "Teacher professional development sessions"
      ],
      ctaText: "Contact Sales",
      action: () => setCurrentPage("Contact")
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: "Custom",
      description: "Fully custom scale deployment for large learning networks.",
      perks: [
        "District-wide Custom SLA agreements",
        "White-glove 24/7 dedicated account manager",
        "Custom AI model fine-tuning on curriculum",
        "Complete multi-tenant system controls",
        "Custom API access & direct database streaming",
        "Unlimited custom LMS connectors"
      ],
      recommended: true,
      ctaText: "Speak with Experts",
      action: () => setCurrentPage("Contact")
    }
  ];

  const getPriceDisplay = (basePrice) => {
    if (typeof basePrice !== "number") return basePrice;
    if (basePrice === 0) return "$0";
    let price = basePrice;
    if (billingInterval === "Yearly") {
      price = Math.floor(basePrice * 0.8);
    }
    return `$${price}`;
  };

  const activePlans = 
    activeCategory === "Student" ? STUDENT_PLANS : 
    activeCategory === "Tutor" ? TUTOR_PLANS : INSTITUTIONAL_PLANS;

  const currentCategoryTitle = 
    activeCategory === "Student" ? "STUDENT AI PLANS" :
    activeCategory === "Tutor" ? "PROFESSIONAL TUTOR PLANS" : "INSTITUTIONAL PLANS";

  const toggleFaq = (idx) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  return (
    <div className="page-container pricing-page animate-fade-in" style={{ padding: "40px 20px", maxWidth: "1240px", margin: "0 auto" }}>
      
      {/* SaaS Hero Banner */}
      <section className="pricing-hero text-center" style={{ marginBottom: "50px" }}>
        <span className="section-subtitle" style={{ 
          display: "inline-flex", 
          alignItems: "center", 
          gap: "6px", 
          color: "var(--accent)", 
          fontWeight: "bold", 
          letterSpacing: "1.5px", 
          fontSize: "12px", 
          textTransform: "uppercase", 
          background: "var(--accent-bg)", 
          padding: "6px 16px", 
          borderRadius: "99px", 
          marginBottom: "15px",
          border: "1px solid var(--accent-border)"
        }}>
          <Sparkles className="h-4 w-4" style={{ color: "#fbbf24" }} />
          Soli Deo Gloria
        </span>
        <h1 style={{ fontSize: "3rem", fontWeight: "900", color: "var(--text-h)", marginBottom: "15px", letterSpacing: "-1px" }}>
          SaaS Pricing Made for Mastery
        </h1>
        <p className="hero-subtitle" style={{ maxWidth: "750px", margin: "0 auto", fontSize: "17px", color: "var(--text)", lineHeight: "1.6" }}>
          Empower your educational journey with state-of-the-art AI. Choose the plan that fits your growth—from individual K-12 homework solvers to multi-tenant school districts.
        </p>

        {/* Billing Cycle Selector */}
        <div style={{ marginTop: "35px", display: "flex", justifyContent: "center", alignItems: "center", gap: "15px" }}>
          <button
            onClick={() => setBillingInterval("Monthly")}
            style={{
              padding: "10px 24px",
              borderRadius: "14px",
              fontSize: "13px",
              fontWeight: "bold",
              border: "1px solid var(--border)",
              cursor: "pointer",
              transition: "all 0.2s ease",
              background: billingInterval === "Monthly" ? "var(--accent)" : "var(--code-bg)",
              color: billingInterval === "Monthly" ? "#fff" : "var(--text)",
              boxShadow: billingInterval === "Monthly" ? "0 4px 12px var(--accent-bg)" : "none"
            }}
          >
            Monthly Billing
          </button>
          <button
            onClick={() => setBillingInterval("Yearly")}
            style={{
              position: "relative",
              padding: "10px 24px",
              borderRadius: "14px",
              fontSize: "13px",
              fontWeight: "bold",
              border: "1px solid var(--border)",
              cursor: "pointer",
              transition: "all 0.2s ease",
              background: billingInterval === "Yearly" ? "var(--accent)" : "var(--code-bg)",
              color: billingInterval === "Yearly" ? "#fff" : "var(--text)",
              boxShadow: billingInterval === "Yearly" ? "0 4px 12px var(--accent-bg)" : "none"
            }}
          >
            Yearly Billing
            <span style={{
              position: "absolute",
              top: "-15px",
              right: "-10px",
              background: "#10b981",
              color: "#fff",
              fontWeight: "900",
              fontSize: "9px",
              padding: "2px 8px",
              borderRadius: "99px",
              textTransform: "uppercase",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
            }}>
              Save 20%
            </span>
          </button>
        </div>

        {/* Category Switcher Tabs */}
        <div style={{ marginTop: "40px", display: "flex", justifyContent: "center", gap: "10px", borderBottom: "1px solid var(--border)", paddingBottom: "15px" }}>
          {[
            { id: "Student", label: "Student AI Plans", icon: GraduationCap },
            { id: "Tutor", label: "Professional Tutor Plans", icon: Layers },
            { id: "Institutional", label: "Institutional Plans", icon: Building }
          ].map((cat) => {
            const CatIcon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "12px 24px",
                  borderRadius: "14px",
                  fontSize: "14px",
                  fontWeight: "bold",
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  background: isActive ? "var(--accent-bg)" : "transparent",
                  color: isActive ? "var(--accent)" : "var(--text)",
                  borderBottom: isActive ? "3px solid var(--accent)" : "3px solid transparent",
                  borderRadius: "14px 14px 0 0"
                }}
              >
                <CatIcon style={{ width: "16px", height: "16px" }} />
                {cat.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Pricing Header Category Banner */}
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <h2 style={{ fontSize: "22px", fontWeight: "800", color: "var(--accent)", letterSpacing: "1px" }}>
          {currentCategoryTitle}
        </h2>
        <p style={{ color: "var(--text)", fontStyle: "italic", fontSize: "14px", marginTop: "5px" }}>
          {activeCategory === "Student" && "Dynamic, AI-powered homework coaching, practice test creation, and real-time concept navigation."}
          {activeCategory === "Tutor" && "Advanced generative planners, progress copilots, parent notification suites, and direct student hours."}
          {activeCategory === "Institutional" && "Enterprise-grade dashboards, compliance auditing, unified billing, and custom integrations."}
        </p>
      </div>

      {/* Plan Grid */}
      <section style={{ marginBottom: "60px" }}>
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", 
          gap: "24px", 
          justifyContent: "center",
          maxWidth: "1200px",
          margin: "0 auto"
        }}>
          {activePlans.map((plan) => (
            <div 
              key={plan.id}
              className={`pricing-card ${plan.recommended ? "best-seller" : ""}`}
              style={{
                background: "var(--code-bg)",
                border: plan.recommended ? "2px solid var(--accent)" : "1px solid var(--border)",
                borderRadius: "24px",
                padding: "35px 25px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                position: "relative",
                transition: "all 0.3s ease",
                boxShadow: plan.recommended ? "0 10px 25px var(--accent-bg)" : "none",
                transform: plan.recommended ? "scale(1.02)" : "none"
              }}
            >
              {plan.recommended && (
                <div className="best-seller-tag" style={{
                  position: "absolute",
                  top: "-15px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: "#fbbf24",
                  color: "#000",
                  padding: "4px 14px",
                  borderRadius: "99px",
                  fontSize: "11px",
                  fontWeight: "800",
                  letterSpacing: "0.5px"
                }}>
                  ⭐ RECOMMENDED
                </div>
              )}

              <div>
                <span style={{ fontSize: "10px", fontWeight: "900", letterSpacing: "1px", textTransform: "uppercase", color: "var(--accent)" }}>
                  {activeCategory.toUpperCase()} PRO
                </span>
                <h3 style={{ fontSize: "22px", fontWeight: "800", color: "var(--text-h)", marginTop: "5px", marginBottom: "8px" }}>
                  {plan.name}
                </h3>
                <p style={{ fontSize: "13px", color: "var(--text)", minHeight: "38px", margin: "0 0 20px 0", lineHeight: "1.4" }}>
                  {plan.description}
                </p>

                <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginBottom: "25px" }}>
                  <span style={{ fontSize: "36px", fontWeight: "900", color: "var(--text-h)" }}>
                    {getPriceDisplay(plan.price)}
                  </span>
                  {typeof plan.price === "number" && (
                    <span style={{ fontSize: "13px", color: "var(--text)" }}>
                      /{billingInterval === "Monthly" ? "mo" : "yr"}
                    </span>
                  )}
                </div>

                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 30px 0", display: "flex", flexDirection: "column", gap: "10px" }}>
                  {plan.perks.map((perk, idx) => (
                    <li key={idx} style={{ fontSize: "13px", display: "flex", alignItems: "start", gap: "8px", color: "var(--text)", lineHeight: "1.4" }}>
                      <Check className="h-4 w-4 shrink-0" style={{ color: "var(--accent)", marginTop: "2px" }} />
                      <span>{perk}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={plan.action}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "14px",
                  border: "none",
                  fontWeight: "bold",
                  fontSize: "13px",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  background: plan.recommended ? "var(--accent)" : "rgba(170, 59, 255, 0.1)",
                  color: plan.recommended ? "#fff" : "var(--accent)",
                  boxShadow: plan.recommended ? "0 4px 12px var(--accent-bg)" : "none"
                }}
              >
                <span>{plan.ctaText}</span>
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive Feature Comparison Matrix */}
      <section style={{ marginBottom: "70px", background: "var(--code-bg)", borderRadius: "24px", padding: "40px 30px", border: "1px solid var(--border)" }}>
        <div style={{ textAlign: "center", marginBottom: "35px" }}>
          <h2 style={{ fontSize: "26px", fontWeight: "800", color: "var(--text-h)" }}>Comprehensive Feature Matrix</h2>
          <p style={{ color: "var(--text)", fontSize: "14px" }}>Compare our plan feature availability across all roles and subscription configurations.</p>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--border)" }}>
                <th style={{ padding: "12px 8px", color: "var(--text-h)", fontWeight: "bold" }}>Feature Segment</th>
                <th style={{ padding: "12px 8px", color: "var(--text-h)", fontWeight: "bold", textAlign: "center" }}>Student Plans</th>
                <th style={{ padding: "12px 8px", color: "var(--text-h)", fontWeight: "bold", textAlign: "center" }}>Tutor Plans</th>
                <th style={{ padding: "12px 8px", color: "var(--text-h)", fontWeight: "bold", textAlign: "center" }}>Institutional</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: "AI Lesson Planner", student: "—", tutor: "Starter, Flex, Pro, Elite", inst: "Yes" },
                { name: "AI Tutor Copilot", student: "—", tutor: "Starter, Flex, Pro, Elite", inst: "Yes" },
                { name: "AI Homework Assistant", student: "Basic, Plus, Premium", tutor: "Starter, Flex, Pro, Elite", inst: "Yes" },
                { name: "AI Study Vault Storage", student: "Plus, Premium", tutor: "Starter, Flex, Pro, Elite", inst: "Yes" },
                { name: "Student Progress Analytics", student: "Plus & Premium", tutor: "Starter, Flex, Pro, Elite", inst: "Yes" },
                { name: "Parent Report Suite", student: "Premium Only", tutor: "Starter, Flex, Pro, Elite", inst: "Yes" },
                { name: "Character Education integration", student: "Premium Only", tutor: "Starter, Flex, Pro, Elite", inst: "Yes" },
                { name: "Session Notes compiler", student: "—", tutor: "Starter, Flex, Pro, Elite", inst: "Yes" },
                { name: "Zoom Integration & Automation", student: "—", tutor: "Flex, Pro, Elite", inst: "Yes" },
                { name: "Administrator Intelligence Center", student: "—", tutor: "—", inst: "Business, School, Enterprise" },
                { name: "LTI Blackboard / Canvas", student: "—", tutor: "—", inst: "School, Enterprise" },
                { name: "White-Glove SLA Guarantee", student: "—", tutor: "—", inst: "Enterprise Only" }
              ].map((row, idx) => (
                <tr key={idx} style={{ borderBottom: "1px solid var(--border)", transition: "background 0.2s" }} className="hover-row">
                  <td style={{ padding: "12px 8px", fontWeight: "600", color: "var(--text-h)" }}>{row.name}</td>
                  <td style={{ padding: "12px 8px", textAlign: "center", color: "var(--text)" }}>{row.student}</td>
                  <td style={{ padding: "12px 8px", textAlign: "center", color: "var(--text)" }}>{row.tutor}</td>
                  <td style={{ padding: "12px 8px", textAlign: "center", color: "var(--text)" }}>{row.inst}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Trust reassurance banner */}
      <section className="pricing-trust-banner" style={{ margin: "50px auto", maxWidth: "900px" }}>
        <div className="trust-inner-banner" style={{ display: "flex", alignItems: "center", gap: "20px", background: "var(--accent-bg)", border: "1px solid var(--accent-border)", padding: "24px", borderRadius: "20px" }}>
          <ShieldCheck className="trust-shield-icon" style={{ width: "40px", height: "40px", color: "var(--accent)", flexShrink: 0 }} />
          <div>
            <h4 style={{ margin: 0, fontSize: "16px", fontWeight: "bold", color: "var(--text-h)" }}>100% Satisfactory Educational Stewardship Guarantee</h4>
            <p style={{ margin: "5px 0 0 0", fontSize: "13px", color: "var(--text)", lineHeight: "1.5" }}>
              Explore any Student, Professional Tutor, or Institutional tier with confidence. Under our faith-inspired commitment to high-ethical stewardships, we support immediate, risk-free plan adjustments, real-time refunds, and persistent sandbox test features.
            </p>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions (Accordion) */}
      <section className="faq-section" style={{ maxWidth: "900px", margin: "0 auto 50px auto" }}>
        <div className="section-header text-center" style={{ marginBottom: "30px" }}>
          <h2 style={{ fontSize: "28px", fontWeight: "800", color: "var(--text-h)" }}>Pricing FAQ</h2>
          <p style={{ color: "var(--text)" }}>Get clarity on subscriptions, role permissions, and billing systems.</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {[
            {
              q: "Can I upgrade or downgrade my subscription level at any time?",
              a: "Absolutely. When logged in, visit the 'My Plan' tab in your user dashboard to change plans instantly. Your resource limits (such as homework uploads and tutor hours) are calculated and credited in real-time."
            },
            {
              q: "What is included in the Professional Tutor plans?",
              a: "Tutor plans replace our single Tutor Pro offering and scale from Starter to Elite. In addition to high-efficiency AI assistants (IEP, lesson planners, parent copilot reports), the Flex, Professional, and Elite plans include 4, 8, or 16 monthly scheduled hours with certified expert tutors respectively."
            },
            {
              q: "Is there real card processing on this site?",
              a: "This dashboard operates in an architectural sandbox environment, simulating live subscription upgrades and billing logs connected directly with the core state. This allows full commercial sandbox simulation without triggering live payments."
            },
            {
              q: "Does the platform support school districts and LMS?",
              a: "Yes! Our Institutional plans (Business, School, and Enterprise) feature specialized LMS integration connectors (LTI Canvas & Blackboard), automated multi-tenant administrators, and white-glove onboarding."
            }
          ].map((faq, idx) => (
            <div 
              key={idx} 
              style={{ 
                background: "var(--code-bg)", 
                border: "1px solid var(--border)", 
                borderRadius: "16px", 
                padding: "20px",
                cursor: "pointer"
              }}
              onClick={() => toggleFaq(idx)}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h4 style={{ margin: 0, fontSize: "15px", fontWeight: "bold", color: "var(--text-h)", display: "flex", alignItems: "center", gap: "10px" }}>
                  <HelpCircle style={{ width: "16px", height: "16px", color: "var(--accent)", flexShrink: 0 }} />
                  {faq.q}
                </h4>
                <ChevronDown style={{ 
                  width: "16px", 
                  height: "16px", 
                  color: "var(--text)", 
                  transform: openFaq === idx ? "rotate(180deg)" : "none",
                  transition: "transform 0.3s ease"
                }} />
              </div>
              {openFaq === idx && (
                <p style={{ marginTop: "12px", fontSize: "13px", color: "var(--text)", lineHeight: "1.6" }}>
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Faith Dedication Signature Footer */}
      <div style={{ textAlign: "center", padding: "20px 0", color: "var(--text)", fontSize: "12px", borderTop: "1px solid var(--border)", marginTop: "40px" }}>
        <p>Soli Deo Gloria — Glory to God the Father, God the Son, and God the Holy Spirit.</p>
      </div>

    </div>
  );
}
