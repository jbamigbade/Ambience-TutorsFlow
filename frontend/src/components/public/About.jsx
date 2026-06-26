import React, { useContext } from "react";
import { AppContext } from "../../context/AppContext";
import { Heart, Shield, BookOpen, Star, Sparkles, User, Award } from "lucide-react";
import { GROWTH_JOURNEY_LEVELS } from "../../data/mockData";

export default function About() {
  const { tutors, setCurrentPage } = useContext(AppContext);

  return (
    <div className="page-container about-page animate-fade-in">
      {/* Intro Banner */}
      <section className="about-hero">
        <div className="text-center">
          <span className="theological-statement">"Soli Deo Gloria" — To God alone be the glory.</span>
          <h1>Our Foundation & Mission</h1>
          <p className="hero-subtitle">
            Ambience TutorsFlow™ is born out of a vision by Ambience Technology LLC to provide elite educational coaching that respects and supports families, inspires students, and maintains theological integrity.
          </p>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="philosophy-section">
        <div className="philosophy-grid">
          <div className="philosophy-box">
            <Heart className="philosophy-icon" />
            <h3>Family Support</h3>
            <p>
              We believe parents are the primary educators of their children. Our dashboards are built to ensure total clarity on attendance, progress, notes, and goals so parents are true partners.
            </p>
          </div>

          <div className="philosophy-box">
            <BookOpen className="philosophy-icon" />
            <h3>Academic Excellence</h3>
            <p>
              From core K-12 subjects to complex college mathematics, our certified educators employ high-impact, science-backed learning mechanics that yield tangible grade increases.
            </p>
          </div>

          <div className="philosophy-box">
            <Shield className="philosophy-icon" />
            <h3>Executive Habits</h3>
            <p>
              Knowledge alone isn't enough. We coach students in active recall, time management, organizational structures, and positive mental habits to build lifelong builders and scholars.
            </p>
          </div>
        </div>
      </section>

      {/* Growth Journey Detailed Breakdown */}
      <section className="about-growth-details">
        <div className="section-header text-center">
          <span className="section-subtitle">THE REWARDS MECHANISM</span>
          <h2>The Growth Journey™ Tiers</h2>
          <p className="section-desc">
            How we incentivize active study, routine checklists, and milestone achievements. Every 10 points can represent completed tasks, high scores, or study streak check-ins.
          </p>
        </div>

        <div className="growth-levels-full-grid">
          {GROWTH_JOURNEY_LEVELS.map((lvl, index) => (
            <div key={lvl.name} className="growth-level-card-full" style={{ borderLeft: `6px solid ${lvl.color}` }}>
              <div className="lvl-card-header">
                <span className="lvl-badge-big">{lvl.badge}</span>
                <div>
                  <h4>Level {index + 1}: {lvl.name}</h4>
                  <span className="lvl-range">{lvl.minPoints} - {lvl.maxPoints === 99999 ? "∞" : lvl.maxPoints} Points</span>
                </div>
              </div>
              <p className="lvl-perks">
                <strong>Unlocked Benefits:</strong> {lvl.perks}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Team Profiles */}
      <section className="about-team-section">
        <div className="section-header text-center">
          <span className="section-subtitle">OUR MENTORS</span>
          <h2>Meet Our Certified Tutors</h2>
          <p className="section-desc">Our tutoring staff comprises accomplished university researchers, certified IEP advisors, and test prep coaches.</p>
        </div>

        <div className="tutor-profiles-grid">
          {tutors.map((tutor) => (
            <div key={tutor.id} className="tutor-profile-card">
              <div className="tutor-image-container">
                <img src={tutor.image} alt={tutor.name} className="tutor-profile-image" />
                <span className="tutor-card-rating">⭐ {tutor.rating} ({tutor.reviews} reviews)</span>
              </div>
              <div className="tutor-card-info">
                <h3>{tutor.name}</h3>
                <span className="tutor-role-pill">{tutor.role}</span>
                <p className="tutor-bio">{tutor.bio}</p>
                <div className="tutor-specialties">
                  {tutor.subjects.map((subj) => (
                    <span key={subj} className="subj-tag">{subj}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Soli Deo Gloria Dedication */}
      <section className="theological-dedication">
        <div className="theological-card text-center">
          <Award className="theological-award-icon" />
          <h2>Soli Deo Gloria</h2>
          <p className="theological-body">
            "To God the Father, God the Son, and God the Holy Spirit be all the glory."
          </p>
          <p className="theological-description">
            Ambience TutorsFlow™ is dedicated as an instrument of service. We strive for absolute excellence, modeling the love, wisdom, and diligence instructed by Christ, and fostering an environment of grace, respect, and profound academic discovery.
          </p>
          <button className="btn-primary" onClick={() => setCurrentPage("Booking")}>
            <span>Join Our Academic Family Today</span>
          </button>
        </div>
      </section>
    </div>
  );
}
