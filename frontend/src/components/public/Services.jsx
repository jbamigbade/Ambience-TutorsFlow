import React, { useState, useContext } from "react";
import { AppContext } from "../../context/AppContext";
import { SERVICES } from "../../data/mockData";
import { BookOpen, GraduationCap, FileCheck, Star, Sparkles, ArrowRight, Heart } from "lucide-react";

export default function Services() {
  const { setCurrentPage } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState("K12"); // K12, COLLEGE, CHARACTER_ED, EXAMS, SPECIALIZED

  const getTabIcon = (tab) => {
    switch (tab) {
      case "K12": return <BookOpen className="tab-icon" />;
      case "COLLEGE": return <GraduationCap className="tab-icon" />;
      case "CHARACTER_ED": return <Heart className="tab-icon" />;
      case "EXAMS": return <FileCheck className="tab-icon" />;
      case "SPECIALIZED": return <Star className="tab-icon" />;
      default: return <Sparkles className="tab-icon" />;
    }
  };

  return (
    <div className="page-container services-page animate-fade-in">
      <section className="services-hero text-center">
        <span className="section-subtitle">OUR CURRICULUM</span>
        <h1>Tailored Learning Paths</h1>
        <p className="hero-subtitle">
          Comprehensive, rigorous, and individualized subject coaching. Explore our portfolios designed to bolster mastery, elevate confidence, and establish strong academic habits.
        </p>
      </section>

      {/* Interactive Tabs */}
      <section className="services-tabs-container">
        <div className="tabs-header">
          {Object.keys(SERVICES).map((key) => (
            <button
              key={key}
              className={`tab-btn ${activeTab === key ? "active" : ""}`}
              onClick={() => setActiveTab(key)}
            >
              {getTabIcon(key)}
              <span>{SERVICES[key].title}</span>
            </button>
          ))}
        </div>

        {/* Tab Body */}
        <div className="tab-body-card">
          <div className="tab-body-info">
            <span className="tab-body-category-tag">Featured Portfolio</span>
            <h2>{SERVICES[activeTab].title}</h2>
            <p className="tab-category-desc">{SERVICES[activeTab].description}</p>
          </div>

          <div className="subject-cards-grid">
            {SERVICES[activeTab].items.map((subj) => (
              <div key={subj.id} className="subject-item-card">
                <div className="subject-item-decoration">✨</div>
                <h3>{subj.name}</h3>
                <p>{subj.desc}</p>
                <div className="subject-item-footer">
                  <span className="curriculum-standard">Diagnostic Enabled</span>
                  <span className="learning-format">1-on-1 Online</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Custom Learning Cycle Section */}
      <section className="learning-cycle-section">
        <div className="section-header text-center">
          <span className="section-subtitle">METHODOLOGY</span>
          <h2>The Ambience Learning Cycle™</h2>
          <p className="section-desc">Our scientific and collaborative process for continuous student growth.</p>
        </div>

        <div className="cycle-grid">
          <div className="cycle-card">
            <span className="cycle-number">01</span>
            <h3>Diagnostic Check</h3>
            <p>We map out the student's current proficiency, strengths, and areas of hesitation to establish an baseline metrics plan.</p>
          </div>
          <div className="cycle-card">
            <span className="cycle-number">02</span>
            <h3>Custom Match</h3>
            <p>Students are paired with a certified tutor matching their level, goal, and academic requirements (IEP / advanced prep).</p>
          </div>
          <div className="cycle-card">
            <span className="cycle-number">03</span>
            <h3>Collaborative Flow</h3>
            <p>Every session includes interactive 1-on-1 tutoring, homework assignments, parent notes, and instant dashboard syncs.</p>
          </div>
          <div className="cycle-card">
            <span className="cycle-number">04</span>
            <h3>Growth Reward™</h3>
            <p>Students check in daily, complete challenges, earn Growth Journey points, level up, and unlock advanced study resources.</p>
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="services-cta">
        <div className="glowing-blue-card text-center">
          <h2>Need a Customized Learning Blueprint?</h2>
          <p>Contact our enrollment coordinators to discuss your student's IEP goals or specialized requirements.</p>
          <div className="cta-buttons-center">
            <button className="btn-primary" onClick={() => setCurrentPage("Booking")}>
              <span>Book Assessment Now</span>
            </button>
            <button className="btn-secondary" onClick={() => setCurrentPage("Contact")}>
              <span>Talk to an Expert</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
