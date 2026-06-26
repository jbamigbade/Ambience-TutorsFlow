import React, { useState } from "react";
import { Mail, Phone, MapPin, Send, HelpCircle, CheckCircle } from "lucide-react";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "Parent",
    message: ""
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.message) {
      setSubmitted(true);
    }
  };

  return (
    <div className="page-container contact-page animate-fade-in">
      <section className="contact-hero text-center">
        <span className="section-subtitle">GET IN TOUCH</span>
        <h1>We're Here to Support You</h1>
        <p className="hero-subtitle">
          Have questions about pricing, curriculum, tutor scheduling, or custom IEP accommodation plans? Send us a message, and our enrollment experts will connect within 12 hours.
        </p>
      </section>

      <section className="contact-grid-section">
        <div className="contact-grid">
          
          {/* Left Column: Info Card */}
          <div className="contact-info-card">
            <span className="info-card-badge">HEADQUARTERS</span>
            <h2>Ambience Technology LLC</h2>
            <p className="info-card-tagline">Empowering Students. Supporting Families. Building Futures.</p>
            
            <div className="office-details-list">
              <div className="office-item">
                <MapPin className="office-icon" />
                <div>
                  <h5>Mailing & HQ Address</h5>
                  <p>1200 Prosperity Parkway, Suite 500, Charlotte, NC 28269</p>
                </div>
              </div>
              <div className="office-item">
                <Phone className="office-icon" />
                <div>
                  <h5>Enrollment Support</h5>
                  <p>+1 (888) 555-FLOW (3569)</p>
                </div>
              </div>
              <div className="office-item">
                <Mail className="office-icon" />
                <div>
                  <h5>Support Inbox</h5>
                  <p>support@ambienceflow.com</p>
                </div>
              </div>
            </div>

            <div className="info-card-dedication">
              <p>"Soli Deo Gloria" — All of our work is dedicated to the ultimate glory of God the Father, Son, and Holy Spirit.</p>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="contact-form-card">
            {submitted ? (
              <div className="form-success-wrapper text-center animate-scale-up">
                <div className="success-circle">
                  <CheckCircle className="check-success-icon" />
                </div>
                <h3>Message Received!</h3>
                <p>Thank you for reaching out, {formData.name}. Our academic coordination team has logged your inquiry and will contact you shortly.</p>
                <button className="btn-secondary" onClick={() => setSubmitted(false)}>
                  <span>Submit Another Inquiry</span>
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="contact-form-inner">
                <h3>Send an Inquiry</h3>
                <p>Complete the details below, and an expert will follow up.</p>

                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>I am registering as a: *</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  >
                    <option value="Parent">Parent / Guardian</option>
                    <option value="Student">Student (K-12 or College)</option>
                    <option value="Tutor">Applying as a Tutor</option>
                    <option value="Admin">School Administrator</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>How can we assist you? *</label>
                  <textarea
                    rows="4"
                    required
                    placeholder="Describe your child's academic goals or special IEP goals..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  ></textarea>
                </div>

                <button type="submit" className="btn-primary-glowing btn-full-width">
                  <Send className="btn-icon" />
                  <span>Send Secure Message</span>
                </button>
              </form>
            )}
          </div>

        </div>
      </section>
    </div>
  );
}
