import React, { useContext } from "react";
import { AppContext } from "../../context/AppContext";
import { Sparkles, Calendar, BookOpen, Heart, Award, ArrowRight, ShieldCheck, Zap } from "lucide-react";
import { SERVICES, GROWTH_JOURNEY_LEVELS } from "../../data/mockData";

export default function Home() {
  const { setCurrentPage, setIsLoggedIn, setUserRole } = useContext(AppContext);

  const quickEnterRole = (role) => {
    setUserRole(role);
    setIsLoggedIn(true);
    setCurrentPage("Dashboard");
  };

  return (
    <div className="page-container home-page animate-fade-in">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-grid">
          <div className="hero-text-content">
            <span className="hero-badge">
              <Sparkles className="badge-icon" />
              <span>Academic Excellence + Character Development + Family Support</span>
            </span>
            <h1 className="hero-title">
              Empowering Students.<br />
              Supporting Families.<br />
              <span className="gradient-text">Building Futures.</span>
            </h1>
            <p className="hero-subtitle">
              Ambience TutorsFlow™ seamlessly integrates premium academic coaching, robust character education, and collaborative parent-tutor tracking to cultivate exceptional scholars.
            </p>
            <div className="hero-actions">
              <button className="btn-primary-glowing" onClick={() => setCurrentPage("Booking")}>
                <Calendar className="btn-icon" />
                <span>Book a Session</span>
              </button>
              <button className="btn-secondary" onClick={() => setCurrentPage("Services")}>
                <span>Explore Services</span>
                <ArrowRight className="btn-icon" />
              </button>
            </div>
            
            <div className="hero-trust-indicators">
              <div className="trust-indicator">
                <span className="trust-count">98%</span>
                <span className="trust-label">Success Rate</span>
              </div>
              <div className="trust-indicator-divider"></div>
              <div className="trust-indicator">
                <span className="trust-count">1-on-1</span>
                <span className="trust-label">Expert Mentoring</span>
              </div>
              <div className="trust-indicator-divider"></div>
              <div className="trust-indicator">
                <span className="trust-count">15,000+</span>
                <span className="trust-label">Hours Tutored</span>
              </div>
            </div>
          </div>

          <div className="hero-visual-card">
            <div className="glowing-card">
              <div className="card-header">
                <span className="status-dot-active"></span>
                <span className="card-tag">Growth Journey™ Tracker</span>
              </div>
              
              <div className="simulated-progress">
                <div className="student-profile-mini">
                  <div className="avatar-med">C</div>
                  <div>
                    <h4>Caleb Sterling</h4>
                    <p>Current Level: <strong>Builder</strong></p>
                  </div>
                  <span className="badge-emoji">🛠️</span>
                </div>

                <div className="progress-slider-container">
                  <div className="slider-labels">
                    <span>Explorer 🧭</span>
                    <span>Scholar 📜</span>
                  </div>
                  <div className="slider-bar">
                    <div className="slider-progress" style={{ width: "68%" }}></div>
                    <div className="slider-handle" style={{ left: "68%" }}></div>
                  </div>
                  <div className="points-display">
                    <strong>340 pts</strong> / 500 pts to Scholar
                  </div>
                </div>

                <div className="unlocked-reward">
                  <Award className="reward-icon" />
                  <div>
                    <h5>Recent Unlock: Formula Cheat-Sheet</h5>
                    <p>Pre-Calculus & Trigonometric Identities active.</p>
                  </div>
                </div>
              </div>

              <div className="card-overlay-footer">
                <p>Interactive student rewards designed to motivate progress and inspire study routine.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Dedication Section */}
      <section className="dedication-section">
        <div className="section-content text-center">
          <p className="theological-statement">
            "Whatever you do, work heartily, as for the Lord and not for men..." — Colossians 3:23
          </p>
          <div className="glory-badge-mini">Soli Deo Gloria</div>
        </div>
      </section>

      {/* Services Grid Section */}
      <section className="home-services">
        <div className="section-header">
          <span className="section-subtitle">Academic Portfolios</span>
          <h2>World-Class Educational Services</h2>
          <p className="section-desc">From primary school phonics to advanced college differential equations, we tailor instruction to fit every goal.</p>
        </div>

        <div className="services-summary-grid">
          {Object.keys(SERVICES).map((key, index) => {
            const group = SERVICES[key];
            const icons = [<BookOpen />, <Award />, <Sparkles />, <ShieldCheck />];
            return (
              <div key={key} className="service-group-card">
                <div className="card-icon-header">
                  {icons[index]}
                </div>
                <h3>{group.title}</h3>
                <p>{group.description}</p>
                <ul className="service-card-list">
                  {group.items.slice(0, 3).map((item) => (
                    <li key={item.id}>✨ {item.name}</li>
                  ))}
                  {group.items.length > 3 && <li className="more-items">And {group.items.length - 3} more...</li>}
                </ul>
                <button className="text-btn" onClick={() => setCurrentPage("Services")}>
                  <span>View Full Curriculum</span>
                  <ArrowRight className="btn-icon-tiny" />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Unique Feature: Growth Journey Section */}
      <section className="home-growth-journey">
        <div className="growth-journey-grid">
          <div className="growth-text">
            <span className="journey-accent-badge">EXCLUSIVE ADVANTAGE</span>
            <h2>Our Custom Growth Journey™</h2>
            <p>
              We believe students excel when their milestones are recognized. Through the <strong>Growth Journey™</strong> track, students earn XP points for completed sessions, check-ins, and assignments. As they advance through ranks, they unlock exclusive benefits, resources, and custom awards.
            </p>
            <div className="journey-tiers">
              {GROWTH_JOURNEY_LEVELS.map((lvl) => (
                <div key={lvl.name} className="tier-pill">
                  <span className="tier-badge">{lvl.badge}</span>
                  <span className="tier-name">{lvl.name}</span>
                </div>
              ))}
            </div>
            <button className="btn-primary" onClick={() => setCurrentPage("About")}>
              <span>How It Works</span>
            </button>
          </div>

          <div className="growth-graphic">
            <div className="growth-timeline">
              <div className="timeline-node active">
                <div className="node-icon">🧭</div>
                <div className="node-info">
                  <h4>1. Explorer (0 - 199 pts)</h4>
                  <p>Building core study habits and routine.</p>
                </div>
              </div>
              <div className="timeline-node active current">
                <div className="node-icon">🛠️</div>
                <div className="node-info">
                  <h4>2. Builder (200 - 499 pts)</h4>
                  <p>Strengthening fundamentals, solving complex proofs.</p>
                </div>
              </div>
              <div className="timeline-node">
                <div className="node-icon">📜</div>
                <div className="node-info">
                  <h4>3. Scholar (500 - 899 pts)</h4>
                  <p>Advanced diagnostic checks and test strategies.</p>
                </div>
              </div>
              <div className="timeline-node">
                <div className="node-icon">🏆</div>
                <div className="node-info">
                  <h4>4. Achiever (900 - 1499 pts)</h4>
                  <p>Academic leadership and peer-collaboration.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials-section">
        <div className="section-header text-center">
          <h2>Loved by Parents, Trusted by Families</h2>
          <p>Read honest reviews from families whose children have climbed to new heights.</p>
        </div>

        <div className="testimonials-grid">
          <div className="testimonial-card">
            <div className="stars">⭐⭐⭐⭐⭐</div>
            <p className="testimonial-text">
              "The connection between the Parent Dashboard and Tutor messages is seamless. I instantly see what Caleb did, his tutor's notes, and pay bills in one tap. Caleb's Pre-Calculus grade rose from a C to an A-!"
            </p>
            <div className="testimonial-author">
              <div className="avatar-sm">G</div>
              <div>
                <h5>Grace Sterling</h5>
                <p>Parent of Caleb (11th Grader)</p>
              </div>
            </div>
          </div>

          <div className="testimonial-card">
            <div className="stars">⭐⭐⭐⭐⭐</div>
            <p className="testimonial-text">
              "As a college student preparing for Differential Equations, I struggled with integrals. Dr. Elijah mapped out a custom matrix review. The digital formula cards unlocked via the Growth Journey saved my semester."
            </p>
            <div className="testimonial-author">
              <div className="avatar-sm">M</div>
              <div>
                <h5>Marcus Thornton</h5>
                <p>College Sophomore</p>
              </div>
            </div>
          </div>

          <div className="testimonial-card">
            <div className="stars">⭐⭐⭐⭐⭐</div>
            <p className="testimonial-text">
              "Working with Ambience TutorsFlow is a joy. The interactive assignments creator lets me assign custom prep questions in seconds. Watching students rank up in real-time makes teaching incredibly fulfilling."
            </p>
            <div className="testimonial-author">
              <div className="avatar-sm">S</div>
              <div>
                <h5>Mrs. Sarah Jenkins</h5>
                <p>K-12 Reading & Science Specialist</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action CTA */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Ignite Your Student's Growth Journey™?</h2>
          <p>Get started today with our flexible packages, professional tutors, and advanced study analytics dashboards.</p>
          <div className="cta-buttons">
            <button className="btn-primary-glowing" onClick={() => setCurrentPage("Booking")}>
              <span>Schedule Initial Assessment</span>
            </button>
            <button className="btn-outline-white" onClick={() => setCurrentPage("Pricing")}>
              <span>View Membership Tiers</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
