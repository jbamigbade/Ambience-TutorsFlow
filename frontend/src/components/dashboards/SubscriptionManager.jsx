// Ambience TutorsFlow™ Subscription Management Dashboard UI
// Soli Deo Gloria — Built with pure architectural beauty and SaaS monetization systems.

import React, { useState, useContext } from "react";
import { AppContext } from "../../context/AppContext";
import {
  Check,
  Zap,
  ShieldCheck,
  HelpCircle,
  Award,
  Sparkles,
  Lock,
  Building,
  Users,
  GraduationCap,
  Calendar,
  Layers,
  ChevronRight,
  Info,
  CreditCard,
  Download,
  RefreshCw,
  FileText,
  Receipt,
  Coins,
  Printer,
  ChevronDown,
  Percent,
  TrendingUp,
  Clock
} from "lucide-react";

export default function SubscriptionManager() {
  const {
    activeSubscription,
    upgradeSubscription,
    currentProfile
  } = useContext(AppContext);

  const [billingInterval, setBillingInterval] = useState("Monthly");
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Stripe Prep Placeholders & Simulated Checkouts
  const [simulatedCheckoutUrl, setSimulatedCheckoutUrl] = useState("");
  const [simulatedPortalUrl, setSimulatedPortalUrl] = useState("");

  // Payment Form States
  const [updatingCard, setUpdatingCard] = useState(false);
  const [cardName, setCardName] = useState(currentProfile?.name || "Grace Sterling");
  const [cardNumber, setCardNumber] = useState("•••• •••• •••• 4242");
  const [cardExpiry, setCardExpiry] = useState("12/28");
  const [cardCvv, setCardCvv] = useState("•••");
  const [isEditingCard, setIsEditingCard] = useState(false);

  // Selected Invoice for printable modal
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Coupons / Promotional Codes
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);

  // Family Plans Prep State
  const [familyPlanEnabled, setFamilyPlanEnabled] = useState(false);
  const [familyMembersCount, setFamilyMembersCount] = useState(1);

  const activePlanName = activeSubscription?.plan_name || "Free";
  const userRole = currentProfile?.role || "Student";

  const SUBSCRIPTION_PLANS = [
    {
      category: "STUDENT AI PLANS",
      icon: GraduationCap,
      plans: [
        {
          id: "free",
          name: "Free",
          price: 0,
          description: "Basic learning dashboard and scheduling.",
          perks: ["Core scheduling", "Standard calendar notes", "1 free AI analysis mock try", "Community forum access"]
        },
        {
          id: "student_basic",
          name: "Student AI Basic",
          price: 19,
          description: "AI concept explanations and homework guidance.",
          perks: ["All Free features", "AI concept breakdown", "10 homework uploads/mo", "Encouraging hints"]
        },
        {
          id: "student_plus",
          name: "Student AI Plus",
          price: 49,
          description: "Advanced homework solving and step solutions.",
          perks: ["All Basic features", "Unlimited homework uploads", "Step-by-step solutions", "Similar practice generators", "Track mastery analytics", "AI Study Vault integration"],
          recommended: true
        },
        {
          id: "student_premium",
          name: "Student AI Premium",
          price: 99,
          description: "VIP level learning tools with custom practice.",
          perks: ["All Plus features", "Custom practice exam builder", "Specialized IEP assistance", "Advanced diagnostic SAT/ACT analytics", "Priority support (24/7 VIP)"]
        }
      ]
    },
    {
      category: "PROFESSIONAL TUTOR PLANS",
      icon: Layers,
      plans: [
        {
          id: "tutor_starter",
          name: "Tutor Starter",
          price: 29,
          description: "Perfect for independent tutors.",
          perks: [
            "Included tutoring hours: 0 hours",
            "AI Lesson Planner",
            "AI Tutor Copilot",
            "AI Homework Assistant",
            "Student Progress Analytics",
            "Parent Reports",
            "Character Education integration",
            "Session Notes auto-compiler",
            "Priority Support"
          ]
        },
        {
          id: "tutor_flex",
          name: "Tutor Flex",
          price: 299,
          description: "Includes 4 tutoring hours/month.",
          perks: [
            "Included tutoring hours: 4 hours",
            "AI Lesson Planner",
            "AI Tutor Copilot",
            "AI Homework Assistant",
            "Student Progress Analytics",
            "Parent Reports",
            "Character Education integration",
            "Session Notes auto-compiler",
            "Priority Support"
          ]
        },
        {
          id: "tutor_professional",
          name: "Tutor Professional",
          price: 499,
          description: "Includes 8 tutoring hours/month.",
          perks: [
            "Included tutoring hours: 8 hours",
            "AI Lesson Planner",
            "AI Tutor Copilot",
            "AI Homework Assistant",
            "Student Progress Analytics",
            "Parent Reports",
            "Character Education integration",
            "Session Notes auto-compiler",
            "Priority Support"
          ],
          recommended: true
        },
        {
          id: "tutor_elite",
          name: "Tutor Elite",
          price: 799,
          description: "Includes 16 tutoring hours/month.",
          perks: [
            "Included tutoring hours: 16 hours",
            "AI Lesson Planner",
            "AI Tutor Copilot",
            "AI Homework Assistant",
            "Student Progress Analytics",
            "Parent Reports",
            "Character Education integration",
            "Session Notes auto-compiler",
            "Priority Support"
          ]
        }
      ]
    },
    {
      category: "INSTITUTIONAL PLANS",
      icon: Building,
      plans: [
        {
          id: "business",
          name: "Business",
          price: 199,
          description: "Full center control panel with executive analytics.",
          perks: ["Administrator Intelligence Center", "Multi-tenant audits", "Custom center branding", "Unlimited tutors and students", "Staff analytical tracking"]
        },
        {
          id: "school",
          name: "School",
          price: 499,
          description: "District and school integration dashboard.",
          perks: ["District-wide LMS integration", "School-board diagnostics auditing", "Custom school subdomains", "Dedicated service accounts", "LTI Canvas connectors"]
        },
        {
          id: "enterprise",
          name: "Enterprise",
          price: 999,
          description: "Fully custom scale deployment for large learning networks.",
          perks: ["District-wide Custom SLA", "White-glove 24/7 dedicated support", "Custom AI Fine-Tuning", "Complete multi-tenant system controls", "Custom LMS Connectors & integrations"],
          recommended: true
        }
      ]
    }
  ];

  const handleUpgrade = async (planName) => {
    setLoadingPlan(planName);
    setErrorMsg("");
    setSuccessMsg("");
    setSimulatedCheckoutUrl("");
    try {
      // Simulate future Stripe Checkout Session creation
      setSuccessMsg(`🚀 Preparing secure checkout for ${planName}...`);
      
      setTimeout(async () => {
        try {
          await upgradeSubscription(planName, billingInterval);
          setSimulatedCheckoutUrl(`https://checkout.stripe.com/pay/cs_test_ambience_${Date.now()}`);
          setSuccessMsg(`🎉 Successfully subscribed to ${planName}! (Simulated Sandbox Upgrade & Secure Token Synced with Stripe backend).`);
        } catch (innerErr) {
          setErrorMsg(innerErr.message || "Upgrade transaction failed.");
        } finally {
          setLoadingPlan(null);
        }
      }, 1000);
    } catch (err) {
      setErrorMsg(err.message || "Upgrade transaction failed.");
      setLoadingPlan(null);
    }
  };

  const handleStripePortal = () => {
    setSuccessMsg("🔄 Redirecting to secure Stripe Customer Billing Portal...");
    setTimeout(() => {
      setSimulatedPortalUrl(`https://billing.stripe.com/p/session/test_ambience_portal_${Date.now()}`);
      setSuccessMsg("🎉 Managed payment methods, active subscriptions, and invoicing downloaded from Stripe customer portal.");
    }, 1200);
  };

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setCouponError("");
    if (couponCode.toUpperCase() === "SOLIDEOGLORIA") {
      setCouponApplied(true);
      setDiscountPercent(50);
      setSuccessMsg("🕊️ Coupon applied successfully! Special Promo 'SOLIDEOGLORIA' - 50% discount will be applied to all simulation plan upgrades!");
    } else {
      setCouponError("Invalid promo code. Please enter 'SOLIDEOGLORIA' for faith-inspired discounts.");
    }
  };

  const getPriceDisplay = (basePrice) => {
    if (typeof basePrice !== "number") return basePrice;
    if (basePrice === 0) return "$0";
    let price = basePrice;
    if (billingInterval === "Yearly") {
      price = Math.floor(basePrice * 0.8);
    }
    if (couponApplied) {
      price = Math.floor(price * (1 - discountPercent / 100));
    }
    return `$${price}`;
  };

  const handleUpdateCardSubmit = (e) => {
    e.preventDefault();
    setUpdatingCard(true);
    setSuccessMsg("");
    setErrorMsg("");

    setTimeout(() => {
      setUpdatingCard(false);
      setIsEditingCard(false);
      setSuccessMsg("💳 Payment method updated successfully! Secure token generated and synced with Stripe Billing Sandbox.");
    }, 1200);
  };

  const getCurrentPlanDetails = () => {
    const allPlans = SUBSCRIPTION_PLANS.flatMap(cat => cat.plans);
    const plan = allPlans.find(p => p.name.toLowerCase() === activePlanName.toLowerCase() || p.id.toLowerCase() === activePlanName.toLowerCase()) || { price: 0, description: "Basic trial learning access" };
    return {
      price: plan.price,
      cost: getPriceDisplay(plan.price),
      desc: plan.description
    };
  };

  const currentDetails = getCurrentPlanDetails();

  const getMockInvoices = () => {
    if (activePlanName === "Free") return [];

    const amount = typeof currentDetails.price === "number" ? currentDetails.price : 99;
    const intervalLabel = billingInterval === "Monthly" ? "mo" : "yr";
    const discountedPrice = billingInterval === "Yearly" ? Math.floor(amount * 0.8) : amount;
    const finalPrice = couponApplied ? Math.floor(discountedPrice * 0.5) : discountedPrice;

    return [
      {
        id: "INV-2026-9048",
        date: "2026-06-27",
        plan: activePlanName,
        billingCycle: billingInterval,
        amount: finalPrice,
        status: "Paid"
      },
      {
        id: "INV-2026-3421",
        date: "2026-05-27",
        plan: activePlanName,
        billingCycle: "Monthly",
        amount: amount,
        status: "Paid"
      },
      {
        id: "INV-2026-1052",
        date: "2026-04-27",
        plan: activePlanName,
        billingCycle: "Monthly",
        amount: amount,
        status: "Paid"
      }
    ];
  };

  const invoices = getMockInvoices();

  const handlePrint = (invoice) => {
    const printWindow = window.open("", "_blank");
    const content = `
      <html>
        <head>
          <title>Receipt ${invoice.id}</title>
          <style>
            body { font-family: sans-serif; color: #1e293b; padding: 40px; }
            .receipt-box { max-width: 600px; margin: auto; border: 1px solid #e2e8f0; padding: 30px; border-radius: 12px; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #6366f1; padding-bottom: 20px; }
            .company { font-weight: 800; font-size: 20px; color: #4f46e5; }
            .invoice-title { font-size: 14px; text-align: right; color: #64748b; }
            .details { margin: 30px 0; font-size: 14px; line-height: 1.6; }
            .items-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            .items-table th { background: #f1f5f9; text-align: left; padding: 10px; font-size: 12px; text-transform: uppercase; }
            .items-table td { padding: 12px 10px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
            .total-row td { font-weight: bold; border-top: 2px solid #e2e8f0; }
            .dedication { text-align: center; margin-top: 40px; font-style: italic; font-size: 12px; color: #94a3b8; }
          </style>
        </head>
        <body>
          <div class="receipt-box">
            <div class="header">
              <div class="company">Ambience TutorsFlow™</div>
              <div class="invoice-title">
                <strong>RECEIPT OF PAYMENT</strong><br/>
                Invoice ID: ${invoice.id}<br/>
                Date: ${invoice.date}
              </div>
            </div>
            
            <div class="details">
              <strong>Billed To:</strong> ${cardName}<br/>
              <strong>Payment Method:</strong> Visa ending in ${cardNumber.slice(-4)}<br/>
              <strong>Billing System:</strong> Simulated Stripe SSL Sandbox<br/>
            </div>

            <table class="items-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Interval</th>
                  <th style="text-align: right;">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Ambience TutorsFlow - Premium Subscription Plan [${invoice.plan}]</td>
                  <td>${invoice.billingCycle}</td>
                  <td style="text-align: right;">$${invoice.amount}.00</td>
                </tr>
                <tr class="total-row">
                  <td colspan="2">Total Paid</td>
                  <td style="text-align: right;">$${invoice.amount}.00</td>
                </tr>
              </tbody>
            </table>

            <div class="dedication">
              Soli Deo Gloria — Glory to God the Father, God the Son, and God the Holy Spirit.<br/>
              Thank you for partnering with Ambience TutorsFlow™!
            </div>
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `;
    printWindow.document.write(content);
    printWindow.document.close();
  };

  const handleDownloadTxt = (invoice) => {
    const text = `
=========================================
      AMBIENCE TUTORSFLOW™ RECEIPT
=========================================
Invoice ID      : ${invoice.id}
Date            : ${invoice.date}
Plan            : ${invoice.plan}
Billing Cycle   : ${invoice.billingCycle}
Amount Paid     : $${invoice.amount}.00 USD
Status          : Successful (PAID)
Billed To       : ${cardName}
Payment Method  : Visa ending in ${cardNumber.slice(-4)}
Security System : Simulated Stripe SSL Sandbox

-----------------------------------------
Thank you for your valuable partnership in 
faith-inspired learning and academic excellence!

Dedication:
Soli Deo Gloria — Glory to God the Father, 
God the Son, and God the Holy Spirit.
=========================================
`;
    const element = document.createElement("a");
    const file = new Blob([text], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${invoice.id}_receipt.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Quota & limits calculator
  const getResourceQuotas = () => {
    switch (activePlanName) {
      case "Free":
        return { uploads: "1 / 1", uploadsPct: 100, ai: "1 / 5", aiPct: 20, hours: "0 / 0", hoursPct: 0 };
      case "Student AI Basic":
        return { uploads: "3 / 10", uploadsPct: 30, ai: "42 / 100", aiPct: 42, hours: "0 / 0", hoursPct: 0 };
      case "Student AI Plus":
        return { uploads: "12 / Unlimited", uploadsPct: 15, ai: "250 / Unlimited", aiPct: 10, hours: "0 / 0", hoursPct: 0 };
      case "Student AI Premium":
        return { uploads: "50 / Unlimited", uploadsPct: 5, ai: "420 / Unlimited", aiPct: 5, hours: "0 / 0", hoursPct: 0 };
      case "Tutor Starter":
        return { uploads: "Unlimited", uploadsPct: 100, ai: "Unlimited", aiPct: 100, hours: "0 / 0", hoursPct: 0 };
      case "Tutor Flex":
        return { uploads: "Unlimited", uploadsPct: 100, ai: "Unlimited", aiPct: 100, hours: "1 / 4", hoursPct: 25 };
      case "Tutor Professional":
        return { uploads: "Unlimited", uploadsPct: 100, ai: "Unlimited", aiPct: 100, hours: "3 / 8", hoursPct: 37 };
      case "Tutor Elite":
        return { uploads: "Unlimited", uploadsPct: 100, ai: "Unlimited", aiPct: 100, hours: "5 / 16", hoursPct: 31 };
      default:
        return { uploads: "Unlimited", uploadsPct: 100, ai: "Unlimited", aiPct: 100, hours: "Unlimited", hoursPct: 100 };
    }
  };

  const quotas = getResourceQuotas();

  return (
    <div className="subscription-manager-workspace page-container animate-fade-in" style={{ paddingBottom: "60px", maxWidth: "1200px", margin: "0 auto" }}>
      
      {/* SaaS Hero Banner */}
      <section className="subscription-hero text-center mb-8">
        <span className="section-subtitle flex items-center justify-center gap-1.5" style={{ color: "var(--accent)" }}>
          <Sparkles className="h-4 w-4 text-amber-400 animate-pulse" />
          Unified Billing & SaaS Workspace
        </span>
        <h2 style={{ fontSize: "28px", fontWeight: "900", margin: "10px 0" }}>My Plan & Subscriptions</h2>
        <p className="hero-subtitle max-w-2xl mx-auto text-slate-300" style={{ fontSize: "14px", lineHeight: "1.6" }}>
          Empower your academic journey with elite, AI-driven learning tools and instant real-time synchronization. Upgrade, monitor limits, or update billing credentials below.
        </p>

        {/* Current Active Plan Card */}
        <div className="mt-8 max-w-2xl mx-auto bg-slate-900/60 border border-purple-500/30 p-6 rounded-2xl text-left flex items-start gap-4 shadow-xl" style={{ backdropFilter: "blur(12px)", background: "var(--code-bg)" }}>
          <div className="p-3 bg-purple-600/10 border border-purple-500/20 rounded-xl" style={{ background: "var(--accent-bg)" }}>
            <Award className="h-8 w-8 text-purple-400" style={{ color: "var(--accent)" }} />
          </div>
          <div className="flex-grow">
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-purple-400 uppercase font-black tracking-widest" style={{ color: "var(--accent)" }}>Active Plan Profile</span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/20">
                ACTIVE
              </span>
            </div>
            <h3 className="text-xl font-extrabold text-white mt-1 mb-0.5" style={{ color: "var(--text-h)" }}>{activePlanName}</h3>
            <p className="text-slate-400 text-xs leading-normal" style={{ color: "var(--text)" }}>{currentDetails.desc}</p>
            
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 pt-4 border-t border-slate-800/80 text-xs text-slate-400" style={{ borderTopColor: "var(--border)" }}>
              <div>
                <span className="text-slate-500" style={{ color: "var(--text)" }}>Rate:</span> <strong className="text-white" style={{ color: "var(--text-h)" }}>{currentDetails.price === 0 ? "Free Access" : `${currentDetails.cost}/${billingInterval === "Monthly" ? "mo" : "yr"}`}</strong>
              </div>
              <div>
                <span className="text-slate-500" style={{ color: "var(--text)" }}>Billing Cycle:</span> <strong className="text-white" style={{ color: "var(--text-h)" }}>{billingInterval}</strong>
              </div>
              <div>
                <span className="text-slate-500" style={{ color: "var(--text)" }}>Method:</span> <strong className="text-white" style={{ color: "var(--text-h)" }}>Visa (ending in {cardNumber.slice(-4)})</strong>
              </div>
              <div>
                <span className="text-slate-500" style={{ color: "var(--text)" }}>Renewal:</span> <strong className="text-white" style={{ color: "var(--text-h)" }}>July 27, 2026</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Billing Cycle Selector */}
        <div className="mt-8 flex justify-center items-center gap-3">
          <button
            onClick={() => setBillingInterval("Monthly")}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              billingInterval === "Monthly"
                ? "bg-purple-600 text-white shadow-lg shadow-purple-500/10"
                : "bg-slate-800/60 text-slate-400 hover:bg-slate-750"
            }`}
            style={{
              background: billingInterval === "Monthly" ? "var(--accent)" : "rgba(170,59,255,0.05)",
              color: billingInterval === "Monthly" ? "#fff" : "var(--text)"
            }}
          >
            Monthly Billing
          </button>
          <button
            onClick={() => setBillingInterval("Yearly")}
            className={`relative px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              billingInterval === "Yearly"
                ? "bg-purple-600 text-white shadow-lg shadow-purple-500/10"
                : "bg-slate-800/60 text-slate-400 hover:bg-slate-750"
            }`}
            style={{
              background: billingInterval === "Yearly" ? "var(--accent)" : "rgba(170,59,255,0.05)",
              color: billingInterval === "Yearly" ? "#fff" : "var(--text)"
            }}
          >
            Yearly Billing
            <span className="absolute -top-3.5 -right-4 bg-emerald-500 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse" style={{ background: "#10b981", color: "#fff" }}>
              Save 20%
            </span>
          </button>
        </div>
      </section>

      {/* Transaction Notifications */}
      {successMsg && (
        <div className="max-w-4xl mx-auto mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-start gap-2.5 text-emerald-300 text-sm animate-scale-up" style={{ background: "rgba(16,185,129,0.1)", borderColor: "rgba(16,185,129,0.3)", color: "#10b981" }}>
          <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-400 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="max-w-4xl mx-auto mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-start gap-2.5 text-rose-300 text-sm animate-scale-up" style={{ background: "rgba(244,63,94,0.1)", borderColor: "rgba(244,63,94,0.3)", color: "#f43f5e" }}>
          <Info className="h-5 w-5 shrink-0 text-rose-400 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Stripe Interactive Checkout Placeholder URL */}
      {simulatedCheckoutUrl && (
        <div className="max-w-4xl mx-auto mb-6 p-4 bg-purple-500/10 border border-purple-500/30 rounded-2xl flex flex-col gap-2 text-sm animate-scale-up" style={{ background: "var(--accent-bg)", borderColor: "var(--accent-border)", color: "var(--accent)" }}>
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            <strong>Secure Stripe Checkout Session Created!</strong>
          </div>
          <p className="text-xs text-slate-300" style={{ color: "var(--text)" }}>In a production system, you would be redirected to Stripe Checkout to finalize your transaction. Open the secure token URL below to view:</p>
          <a href={simulatedCheckoutUrl} target="_blank" rel="noopener noreferrer" className="font-mono text-xs underline font-bold" style={{ color: "var(--accent)" }}>{simulatedCheckoutUrl}</a>
        </div>
      )}

      {/* ----------------------------------------------------
          SECTION: IMMERSIVE PLAN USAGE LIMITS & RESOURCE METRICS
          ---------------------------------------------------- */}
      <section className="max-w-6xl mx-auto mb-12">
        <h3 className="text-lg font-black text-white mb-6 flex items-center gap-2 uppercase tracking-wide" style={{ color: "var(--text-h)" }}>
          <Coins className="h-5 w-5 text-amber-400" />
          Live Plan Resource Quotas & Usage Tracker
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Homework Upload Tracker */}
          <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between" style={{ background: "var(--code-bg)", borderColor: "var(--border)" }}>
            <div>
              <div className="flex justify-between items-start mb-3">
                <span className="text-[10px] text-purple-400 uppercase font-bold tracking-wider" style={{ color: "var(--accent)" }}>AI Homework Assistant</span>
                <Sparkles className="h-4 w-4 text-purple-400" style={{ color: "var(--accent)" }} />
              </div>
              <h4 className="text-sm font-bold text-white mb-1" style={{ color: "var(--text-h)" }}>Homework Uploads</h4>
              <p className="text-slate-400 text-xs mb-4" style={{ color: "var(--text)" }}>Uploaded PDFs, DOCX, work assignments, and screenshots.</p>
              
              <div className="flex justify-between text-xs text-slate-300 font-bold mb-1.5" style={{ color: "var(--text-h)" }}>
                <span>Usage Status</span>
                <span>{quotas.uploads}</span>
              </div>
              <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,0.1)" }}>
                <div 
                  className="h-full rounded-full transition-all duration-500" 
                  style={{ 
                    width: `${quotas.uploadsPct}%`,
                    background: activePlanName === "Free" ? "#ef4444" : "var(--accent)"
                  }}
                ></div>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 mt-4" style={{ color: "var(--text)" }}>
              {activePlanName === "Free" ? "🔒 Limit reached. Upgrade to Student AI Plus for Unlimited uploads." : "⚡ Unlimited quotas enabled with your current tier."}
            </p>
          </div>

          {/* Card 2: AI Requests Tracker */}
          <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between" style={{ background: "var(--code-bg)", borderColor: "var(--border)" }}>
            <div>
              <div className="flex justify-between items-start mb-3">
                <span className="text-[10px] text-purple-400 uppercase font-bold tracking-wider" style={{ color: "var(--accent)" }}>Generative Tokens</span>
                <TrendingUp className="h-4 w-4 text-purple-400" style={{ color: "var(--accent)" }} />
              </div>
              <h4 className="text-sm font-bold text-white mb-1" style={{ color: "var(--text-h)" }}>AI Requests</h4>
              <p className="text-slate-400 text-xs mb-4" style={{ color: "var(--text)" }}>Prompt generations, mini quizzes, step solutions, and practice tests.</p>
              
              <div className="flex justify-between text-xs text-slate-300 font-bold mb-1.5" style={{ color: "var(--text-h)" }}>
                <span>Usage Status</span>
                <span>{quotas.ai}</span>
              </div>
              <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,0.1)" }}>
                <div 
                  className="h-full rounded-full transition-all duration-500" 
                  style={{ 
                    width: `${quotas.aiPct}%`,
                    background: "var(--accent)"
                  }}
                ></div>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 mt-4" style={{ color: "var(--text)" }}>
              ⚡ Monitored real-time system tokens.
            </p>
          </div>

          {/* Card 3: Tutor Hours Tracker */}
          <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between" style={{ background: "var(--code-bg)", borderColor: "var(--border)" }}>
            <div>
              <div className="flex justify-between items-start mb-3">
                <span className="text-[10px] text-purple-400 uppercase font-bold tracking-wider" style={{ color: "var(--accent)" }}>Human Instruction</span>
                <Clock className="h-4 w-4 text-purple-400" style={{ color: "var(--accent)" }} />
              </div>
              <h4 className="text-sm font-bold text-white mb-1" style={{ color: "var(--text-h)" }}>Included Tutor Hours</h4>
              <p className="text-slate-400 text-xs mb-4" style={{ color: "var(--text)" }}>Included live 1-on-1 coaching sessions per month.</p>
              
              <div className="flex justify-between text-xs text-slate-300 font-bold mb-1.5" style={{ color: "var(--text-h)" }}>
                <span>Usage Status</span>
                <span>{quotas.hours}</span>
              </div>
              <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,0.1)" }}>
                <div 
                  className="h-full rounded-full transition-all duration-500" 
                  style={{ 
                    width: `${quotas.hoursPct}%`,
                    background: "#10b981"
                  }}
                ></div>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 mt-4" style={{ color: "var(--text)" }}>
              {activePlanName.startsWith("Tutor") ? "📅 Certified professional tutor hours sync'd with booking calendar." : "💡 Upgrade to a Tutor Plan to include professional 1-on-1 hours."}
            </p>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------
          SUBSCRIPTION PLANS CATEGORIZED GRID
          ---------------------------------------------------- */}
      <section className="max-w-6xl mx-auto mb-12">
        <h3 className="text-lg font-black text-white mb-6 flex items-center gap-2 uppercase tracking-wide" style={{ color: "var(--text-h)" }}>
          <GraduationCap className="h-5 w-5 text-purple-400" style={{ color: "var(--accent)" }} />
          Select Plan & Upgrade Center
        </h3>

        <div className="flex flex-col gap-10">
          {SUBSCRIPTION_PLANS.map((cat) => {
            const CategoryIcon = cat.icon;
            return (
              <div key={cat.category} className="subscription-category-block">
                <h4 className="text-sm font-black text-slate-400 mb-4 flex items-center gap-2 tracking-wide uppercase" style={{ color: "var(--text-h)" }}>
                  <CategoryIcon className="h-4 w-4 text-purple-400" style={{ color: "var(--accent)" }} />
                  {cat.category}
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {cat.plans.map((plan) => {
                    const isActive = activePlanName.toLowerCase() === plan.name.toLowerCase() || activePlanName.toLowerCase() === plan.id.toLowerCase();
                    
                    return (
                      <div 
                        key={plan.id}
                        className={`pricing-card relative flex flex-col justify-between p-6 border rounded-2xl transition-all ${
                          isActive
                            ? "bg-purple-600/10 border-purple-500 shadow-xl shadow-purple-500/5 scale-[1.02]"
                            : plan.recommended
                            ? "bg-slate-900/80 border-purple-500/40 shadow-lg shadow-purple-500/2 hover:scale-[1.01]"
                            : "bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80"
                        }`}
                        style={{
                          background: isActive ? "var(--accent-bg)" : "var(--code-bg)",
                          borderColor: isActive ? "var(--accent)" : "var(--border)"
                        }}
                      >
                        {/* Recommendations or Active Badges */}
                        {isActive && (
                          <span className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider shadow" style={{ background: "var(--accent)" }}>
                            Current Plan
                          </span>
                        )}
                        {!isActive && plan.recommended && (
                          <span className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-amber-500 text-slate-950 text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider shadow">
                            Recommended
                          </span>
                        )}

                        <div>
                          {/* Title & Desc */}
                          <h4 className="text-base font-bold text-white mb-1" style={{ color: "var(--text-h)" }}>{plan.name}</h4>
                          <p className="text-slate-400 text-xs min-h-[36px] line-clamp-2 leading-normal" style={{ color: "var(--text)" }}>{plan.description}</p>
                          
                          {/* Pricing */}
                          <div className="my-4 flex items-baseline gap-1">
                            <span className="text-2xl font-black text-white" style={{ color: "var(--text-h)" }}>{getPriceDisplay(plan.price)}</span>
                            {typeof plan.price === "number" && (
                              <span className="text-xs text-slate-500">/{billingInterval === "Monthly" ? "mo" : "yr"}</span>
                            )}
                          </div>

                          {/* Perks list */}
                          <ul className="flex flex-col gap-2 border-t border-slate-800/80 pt-4 mb-6" style={{ borderTopColor: "var(--border)" }}>
                            {plan.perks.map((perk, i) => (
                              <li key={i} className="text-xs text-slate-300 flex items-start gap-1.5 leading-normal" style={{ color: "var(--text)" }}>
                                <Check className="h-3.5 w-3.5 text-purple-400 shrink-0 mt-0.5" style={{ color: "var(--accent)" }} />
                                <span>{perk}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Upgrade trigger button */}
                        <button
                          onClick={() => handleUpgrade(plan.name)}
                          disabled={isActive || loadingPlan !== null}
                          className="w-full py-2 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 focus:outline-none"
                          style={{
                            background: isActive ? "rgba(0,0,0,0.05)" : "var(--accent)",
                            color: isActive ? "var(--text)" : "#fff",
                            cursor: isActive ? "default" : "pointer"
                          }}
                        >
                          {loadingPlan === plan.name ? (
                            <>
                              <span className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                              <span>Syncing...</span>
                            </>
                          ) : isActive ? (
                            <>
                              <ShieldCheck className="h-3.5 w-3.5 text-purple-400" style={{ color: "var(--accent)" }} />
                              <span>Active Plan</span>
                            </>
                          ) : (
                            <>
                              <Zap className="h-3 w-3" />
                              <span>Upgrade Tier</span>
                            </>
                          )}
                        </button>

                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ----------------------------------------------------
          SECTION: SECURE STRIPE / BILLING SANDBOX (CARD & RECEIPTS)
          ---------------------------------------------------- */}
      <section className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Card Updater & Promotions Column */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between" style={{ backdropFilter: "blur(12px)", background: "var(--code-bg)", borderColor: "var(--border)" }}>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: "var(--text-h)" }}>
                <CreditCard className="h-4 w-4 text-purple-400" style={{ color: "var(--accent)" }} />
                Secure Payment Method
              </h3>

              {/* Simulated Credit Card Graphic */}
              <div className="relative w-full h-44 bg-gradient-to-br from-indigo-700 via-purple-800 to-slate-900 rounded-xl p-5 text-white flex flex-col justify-between shadow-lg overflow-hidden mb-6">
                <div className="flex justify-between items-center">
                  <div className="w-10 h-7 bg-amber-400/80 rounded-md border border-amber-300/40 relative overflow-hidden flex items-center justify-center">
                    <div className="absolute inset-0 border-t border-b border-amber-600/30"></div>
                  </div>
                  <strong className="text-sm font-black tracking-widest italic text-indigo-200">VISA</strong>
                </div>

                <div className="text-lg font-black tracking-widest font-mono text-center my-4 text-white/90">
                  {cardNumber}
                </div>

                <div className="flex justify-between items-end">
                  <div>
                    <span className="text-[8px] text-slate-300 block uppercase tracking-widest font-bold">Card Holder</span>
                    <span className="text-xs font-bold font-mono">{cardName}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[8px] text-slate-300 block uppercase tracking-widest font-bold">Expires</span>
                    <span className="text-xs font-bold font-mono">{cardExpiry}</span>
                  </div>
                </div>
                
                <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-purple-500/20 rounded-full blur-2xl"></div>
              </div>

              {/* Interactive Billing form */}
              {!isEditingCard ? (
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingCard(true)}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-750 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                    style={{ background: "rgba(170,59,255,0.1)", color: "var(--accent)" }}
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>Update Payment Card</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleStripePortal}
                    className="w-full py-2 bg-slate-850 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                    style={{ background: "var(--border)", color: "var(--text-h)" }}
                  >
                    <Building className="h-3.5 w-3.5" />
                    <span>Manage in Stripe Customer Portal</span>
                  </button>
                </div>
              ) : (
                <form onSubmit={handleUpdateCardSubmit} className="space-y-4 animate-fade-in">
                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1" style={{ color: "var(--text)" }}>Cardholder Name</label>
                    <input
                      type="text"
                      required
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl text-xs text-white"
                      style={{ background: "rgba(0,0,0,0.05)", border: "1px solid var(--border)", color: "var(--text-h)" }}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1" style={{ color: "var(--text)" }}>Card Number</label>
                    <input
                      type="text"
                      required
                      pattern="[0-9 •]*"
                      maxLength={19}
                      placeholder="4111 1111 1111 4242"
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl text-xs text-white"
                      style={{ background: "rgba(0,0,0,0.05)", border: "1px solid var(--border)", color: "var(--text-h)" }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1" style={{ color: "var(--text)" }}>Expiry</label>
                      <input
                        type="text"
                        required
                        placeholder="MM/YY"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl text-xs text-white"
                        style={{ background: "rgba(0,0,0,0.05)", border: "1px solid var(--border)", color: "var(--text-h)" }}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1" style={{ color: "var(--text)" }}>CVV</label>
                      <input
                        type="password"
                        required
                        maxLength={3}
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl text-xs text-white"
                        style={{ background: "rgba(0,0,0,0.05)", border: "1px solid var(--border)", color: "var(--text-h)" }}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      disabled={updatingCard}
                      className="flex-grow py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                      style={{ background: "var(--accent)" }}
                    >
                      {updatingCard ? (
                        <>
                          <span className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                          <span>Syncing Card...</span>
                        </>
                      ) : (
                        <span>Save Changes</span>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingCard(false)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-white rounded-xl text-xs font-bold transition-all"
                      style={{ background: "rgba(0,0,0,0.05)", color: "var(--text)" }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
            
            <div className="mt-6 pt-4 border-t border-slate-850 text-[10px] text-slate-500 flex items-start gap-1.5" style={{ borderTopColor: "var(--border)" }}>
              <Info className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
              <span>Updates execute securely in compliance with Stripe PCI-DSS billing protocols. No actual credit cards will be billed.</span>
            </div>
          </div>

          {/* Coupon Entry Form */}
          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between" style={{ backdropFilter: "blur(12px)", background: "var(--code-bg)", borderColor: "var(--border)" }}>
            <h3 className="text-sm font-black text-white uppercase tracking-wider mb-2 flex items-center gap-2" style={{ color: "var(--text-h)" }}>
              <Percent className="h-4 w-4 text-amber-500" />
              Apply Coupon / Promo Code
            </h3>
            <p className="text-xs text-slate-400 mb-4" style={{ color: "var(--text)" }}>Have a promotional or commercial family plan voucher? Apply below for discounts.</p>
            
            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <input
                type="text"
                placeholder="Voucher or Promo code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                disabled={couponApplied}
                className="flex-grow px-3 py-2 bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl text-xs text-white"
                style={{ background: "rgba(0,0,0,0.05)", border: "1px solid var(--border)", color: "var(--text-h)" }}
              />
              <button 
                type="submit" 
                disabled={couponApplied}
                className="px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs hover:bg-amber-400 transition-all"
                style={{ background: "var(--accent)", color: "#fff" }}
              >
                Apply
              </button>
            </form>
            {couponError && <p className="text-[10px] text-rose-500 mt-2">{couponError}</p>}
            {couponApplied && <p className="text-[10px] text-emerald-500 mt-2 font-bold">✓ Coupon 'SOLIDEOGLORIA' active (50% Off)!</p>}
          </div>

          {/* Family Plan Settings Preparation */}
          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between" style={{ backdropFilter: "blur(12px)", background: "var(--code-bg)", borderColor: "var(--border)" }}>
            <h3 className="text-sm font-black text-white uppercase tracking-wider mb-2 flex items-center gap-2" style={{ color: "var(--text-h)" }}>
              <Users className="h-4 w-4 text-purple-400" style={{ color: "var(--accent)" }} />
              Family Account Plan (Multi-seat)
            </h3>
            <p className="text-xs text-slate-400 mb-4" style={{ color: "var(--text)" }}>Add multiple students or children to a single subscription invoice with unified family discount privileges.</p>
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-white" style={{ color: "var(--text-h)" }}>Enable Unified Seats?</span>
              <button
                onClick={() => setFamilyPlanEnabled(!familyPlanEnabled)}
                className="px-4 py-1 rounded-full text-xs font-bold transition-all"
                style={{
                  background: familyPlanEnabled ? "var(--accent)" : "rgba(0,0,0,0.05)",
                  color: familyPlanEnabled ? "#fff" : "var(--text)"
                }}
              >
                {familyPlanEnabled ? "Enabled" : "Disabled"}
              </button>
            </div>
            {familyPlanEnabled && (
              <div className="mt-4 pt-4 border-t border-slate-800 flex justify-between items-center animate-fade-in" style={{ borderTopColor: "var(--border)" }}>
                <span className="text-xs text-slate-300" style={{ color: "var(--text)" }}>Active Child Seats:</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => setFamilyMembersCount(Math.max(1, familyMembersCount - 1))} className="px-2 py-0.5 bg-slate-800 rounded text-xs">-</button>
                  <span className="text-xs text-white font-bold" style={{ color: "var(--text-h)" }}>{familyMembersCount}</span>
                  <button onClick={() => setFamilyMembersCount(familyMembersCount + 1)} className="px-2 py-0.5 bg-slate-800 rounded text-xs">+</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mock Invoices LEDGER Column */}
        <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between" style={{ backdropFilter: "blur(12px)", background: "var(--code-bg)", borderColor: "var(--border)" }}>
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: "var(--text-h)" }}>
              <Receipt className="h-4 w-4 text-purple-400" style={{ color: "var(--accent)" }} />
              Billing Receipts & Invoicing Ledger
            </h3>

            {invoices.length === 0 ? (
              <div className="h-60 border border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center gap-2 text-slate-500" style={{ borderColor: "var(--border)" }}>
                <FileText className="h-8 w-8 text-slate-600" />
                <p className="text-xs">No payment history generated for current trial plan.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase tracking-wider" style={{ borderBottomColor: "var(--border)" }}>
                      <th className="pb-3">Date</th>
                      <th className="pb-3">Invoice ID</th>
                      <th className="pb-3">Plan Details</th>
                      <th className="pb-3 text-right">Amount</th>
                      <th className="pb-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((invoice, idx) => (
                      <tr key={idx} className="border-b border-slate-800/60 hover:bg-slate-900/20 text-slate-300 transition-all" style={{ borderBottomColor: "var(--border)", color: "var(--text)" }}>
                        <td className="py-3.5">{invoice.date}</td>
                        <td className="py-3.5 font-mono text-[11px] text-white" style={{ color: "var(--text-h)" }}>{invoice.id}</td>
                        <td className="py-3.5">
                          <span className="text-white font-bold" style={{ color: "var(--text-h)" }}>{invoice.plan}</span>
                          <span className="text-[10px] text-slate-500 ml-1.5 font-black uppercase">({invoice.billingCycle})</span>
                        </td>
                        <td className="py-3.5 text-right font-black text-white" style={{ color: "var(--text-h)" }}>${invoice.amount}.00</td>
                        <td className="py-3.5">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handlePrint(invoice)}
                              title="Print Receipt"
                              className="p-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded hover:text-white transition-all focus:outline-none"
                              style={{ background: "rgba(170,59,255,0.1)", color: "var(--accent)" }}
                            >
                              <Printer className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDownloadTxt(invoice)}
                              title="Download TXT Invoice"
                              className="p-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded hover:text-white transition-all focus:outline-none"
                              style={{ background: "rgba(170,59,255,0.1)", color: "var(--accent)" }}
                            >
                              <Download className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div style={{ marginTop: "40px", borderTop: "1px solid var(--border)", paddingTop: "15px", textAlign: "center", color: "var(--text)", fontSize: "11px" }}>
            🕊️ Soli Deo Gloria — Glory to God the Father, God the Son, and God the Holy Spirit.
          </div>
        </div>
      </section>

    </div>
  );
}
