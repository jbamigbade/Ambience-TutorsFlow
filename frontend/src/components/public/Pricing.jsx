import React, { useContext } from "react";
import { AppContext } from "../../context/AppContext";
import { Check, ShieldCheck, HelpCircle, Award } from "lucide-react";

export default function Pricing() {
  const { setCurrentPage } = useContext(AppContext);

  return (
    <div className="page-container pricing-page animate-fade-in">
      <section className="pricing-hero text-center">
        <span className="section-subtitle">MEMBERSHIPS</span>
        <h1>Transparent, Tiered Plans</h1>
        <p className="hero-subtitle">
          All-inclusive academic subscriptions. No contracts, no hidden registration fees. Includes 1-on-1 tutoring hours, complete access to dashboards, and full integration with the Growth Journey™ rewards.
        </p>
      </section>

      {/* Pricing Cards */}
      <section className="pricing-cards-section">
        <div className="pricing-grid">
          {/* Tier 1 */}
          <div className="pricing-card">
            <span className="card-badge-small">CORE HABITS</span>
            <h3>Explorer Core</h3>
            <p className="card-desc">Ideal for K-12 students building key academic habits and routines.</p>
            <div className="price-box">
              <span className="currency">$</span>
              <span className="amount">290</span>
              <span className="period">/mo</span>
            </div>
            
            <ul className="plan-perks-list">
              <li><Check className="perk-icon" /> 4 hours of 1-on-1 expert tutoring /mo</li>
              <li><Check className="perk-icon" /> Access to K-12 Core subjects</li>
              <li><Check className="perk-icon" /> Base Student & Parent dashboards</li>
              <li><Check className="perk-icon" /> Growth Journey™ level reward unlocks</li>
              <li><Check className="perk-icon" /> Weekly progress logs emailed</li>
            </ul>

            <button className="btn-secondary" onClick={() => setCurrentPage("Booking")}>
              <span>Start Explorer Trial</span>
            </button>
          </div>

          {/* Tier 2 */}
          <div className="pricing-card best-seller">
            <div className="best-seller-tag">⭐ RECOMMENDED</div>
            <span className="card-badge-small accent">ADVANCED TEST PREP</span>
            <h3>Scholar Elite</h3>
            <p className="card-desc">Perfect for high-schoolers, SAT/ACT prep, and advanced college maths.</p>
            <div className="price-box">
              <span className="currency">$</span>
              <span className="amount">450</span>
              <span className="period">/mo</span>
            </div>
            
            <ul className="plan-perks-list">
              <li><Check className="perk-icon" /> 8 hours of 1-on-1 expert tutoring /mo</li>
              <li><Check className="perk-icon" /> Complete K-12 & College Mathematics access</li>
              <li><Check className="perk-icon" /> SAT, ACT, and EOG diagnostic exams vault</li>
              <li><Check className="perk-icon" /> Double points bonus on Study Streaks</li>
              <li><Check className="perk-icon" /> Direct messaging with Senior Tutors</li>
              <li><Check className="perk-icon" /> Monthly comprehensive analytics report</li>
            </ul>

            <button className="btn-primary-glowing" onClick={() => setCurrentPage("Booking")}>
              <span>Subscribe to Scholar Elite</span>
            </button>
          </div>

          {/* Tier 3 */}
          <div className="pricing-card">
            <span className="card-badge-small">COMPREHENSIVE IEP & SPECIALIZED</span>
            <h3>Ambassador VIP</h3>
            <p className="card-desc">Designed for intensive diagnostic prep, executive planning, & IEP compliance.</p>
            <div className="price-box">
              <span className="currency">$</span>
              <span className="amount">750</span>
              <span className="period">/mo</span>
            </div>
            
            <ul className="plan-perks-list">
              <li><Check className="perk-icon" /> 14 hours of 1-on-1 tutoring /mo</li>
              <li><Check className="perk-icon" /> Tailored IEP accommodation mapping support</li>
              <li><Check className="perk-icon" /> Direct executive functioning habit coaching</li>
              <li><Check className="perk-icon" /> Unlimited homework creation and grading</li>
              <li><Check className="perk-icon" /> Priority slots and rescheduling leeway</li>
              <li><Check className="perk-icon" /> Bi-weekly direct consultations with directors</li>
            </ul>

            <button className="btn-secondary" onClick={() => setCurrentPage("Booking")}>
              <span>Apply for Ambassador VIP</span>
            </button>
          </div>
        </div>
      </section>

      {/* Trust reassurance banner */}
      <section className="pricing-trust-banner">
        <div className="trust-inner-banner">
          <ShieldCheck className="trust-shield-icon" />
          <div>
            <h4>100% Grace-Period Satisfaction Guarantee</h4>
            <p>If you don't find the perfect tutor match or see improvement within your first two sessions, request a full refund. We support your academic goals with pure grace and dedication.</p>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="faq-section">
        <div className="section-header text-center">
          <h2>Pricing & Membership FAQ</h2>
          <p>Get answers to all questions regarding bills, hours, and tutor alignments.</p>
        </div>

        <div className="faq-grid">
          <div className="faq-item">
            <h4><HelpCircle className="faq-icon" /> Can I roll over unused hours to the next month?</h4>
            <p>Yes! Up to 2 hours of tutoring can roll over into the subsequent billing cycle to accommodate busy exam times or family events.</p>
          </div>
          <div className="faq-item">
            <h4><HelpCircle className="faq-icon" /> Can we switch tutors if the match isn't optimal?</h4>
            <p>Absolutely. You can request a tutor re-match at any time via your Parent Dashboard. We'll consult your schedule and student's learning style to find a perfect partner.</p>
          </div>
          <div className="faq-item">
            <h4><HelpCircle className="faq-icon" /> Are diagnostic exam materials included?</h4>
            <p>Yes. All diagnostic resources, SAT practice checks, State EOG/EOC guides, and Growth Journey worksheets are fully included in the Scholar and Ambassador memberships.</p>
          </div>
          <div className="faq-item">
            <h4><HelpCircle className="faq-icon" /> How do payments and invoices work?</h4>
            <p>Invoices are generated on the 1st of every month and are payable securely through the Parent Dashboard. We accept major credit cards and bank transfers.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
