import React, { useContext } from "react";
import { AppContext } from "../context/AppContext";
import { Sparkles, Mail, Phone, MapPin, Award } from "lucide-react";

export default function Footer() {
  const { setCurrentPage } = useContext(AppContext);

  return (
    <footer className="footer">
      <div className="footer-top-wave"></div>
      
      <div className="footer-content">
        <div className="footer-grid">
          <div className="footer-brand-section">
            <div className="footer-logo">
              <span className="footer-logo-icon">📘</span>
              <h3>Ambience <span>TutorsFlow™</span></h3>
            </div>
            <p className="footer-tagline">
              Empowering Students. Supporting Families. Building Futures.
            </p>
            <p className="footer-agency">
              Under Ambience Technology LLC. Built with premium excellence for outstanding achievements.
            </p>
          </div>

          <div className="footer-links-section">
            <h4>Quick Nav</h4>
            <ul>
              <li><button onClick={() => setCurrentPage("Home")}>Home</button></li>
              <li><button onClick={() => setCurrentPage("About")}>About Us</button></li>
              <li><button onClick={() => setCurrentPage("Services")}>Academic Services</button></li>
              <li><button onClick={() => setCurrentPage("Pricing")}>Membership Pricing</button></li>
              <li><button onClick={() => setCurrentPage("Booking")}>Book a Session</button></li>
              <li><button onClick={() => setCurrentPage("Contact")}>Get Support</button></li>
            </ul>
          </div>

          <div className="footer-services-section">
            <h4>Our Services</h4>
            <ul>
              <li>K-12 Core Academics</li>
              <li>College Mathematics Pro</li>
              <li>SAT & ACT Prep Courses</li>
              <li>State Exam Prep (EOG/EOC)</li>
              <li>IEP Support & Study Skills</li>
              <li>Growth Journey™ Awards</li>
            </ul>
          </div>

          <div className="footer-contact-section">
            <h4>Get in Touch</h4>
            <div className="contact-info-list">
              <div className="contact-item">
                <Mail className="contact-icon" />
                <span>support@ambienceflow.com</span>
              </div>
              <div className="contact-item">
                <Phone className="contact-icon" />
                <span>+1 (888) 555-FLOW</span>
              </div>
              <div className="contact-item">
                <MapPin className="contact-icon" />
                <span>Charlotte, NC (HQ) | Global Online</span>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-divider"></div>

        <div className="footer-bottom">
          <div className="faith-dedication">
            <Award className="faith-icon" />
            <span>Soli Deo Gloria</span>
            <p className="faith-translation">
              Glory to God the Father, God the Son, and God the Holy Spirit.
            </p>
          </div>
          <div className="copyright-info">
            <p>&copy; {new Date().getFullYear()} Ambience Technology LLC. All rights reserved.</p>
            <p className="compliance">Terms of Service | Privacy Policy | IEP Accommodations Statement</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
