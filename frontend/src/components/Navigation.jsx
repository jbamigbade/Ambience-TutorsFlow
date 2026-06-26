import React, { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import { GraduationCap, LogIn, ChevronDown, Award, Globe, User, ShieldAlert } from "lucide-react";

export default function Navigation() {
  const {
    currentPage,
    setCurrentPage,
    userRole,
    setUserRole,
    isLoggedIn,
    setIsLoggedIn,
    signOutUser
  } = useContext(AppContext);

  const [showRoleSelector, setShowRoleSelector] = useState(false);

  const handleNavClick = (page) => {
    setCurrentPage(page);
    setShowRoleSelector(false);
  };

  const handleLoginToggle = async () => {
    if (isLoggedIn) {
      await signOutUser();
      setShowRoleSelector(false);
    } else {
      setCurrentPage("Login");
    }
  };

  const selectRoleAndEnter = (role) => {
    setUserRole(role);
    setIsLoggedIn(true);
    setCurrentPage("Dashboard");
    setShowRoleSelector(false);
  };

  return (
    <header className="navbar-container">
      {/* Dev Role switcher badge at the very top */}
      <div className="dev-banner">
        <span>🕊️ Faith-Inspired SaaS Prototype — Soli Deo Gloria</span>
        <div className="dev-controls">
          <span className="dev-label">Instant Dashboard View:</span>
          <button onClick={() => selectRoleAndEnter("Student")} className={`dev-role-btn ${isLoggedIn && userRole === "Student" ? "active" : ""}`}>Student</button>
          <button onClick={() => selectRoleAndEnter("Parent")} className={`dev-role-btn ${isLoggedIn && userRole === "Parent" ? "active" : ""}`}>Parent</button>
          <button onClick={() => selectRoleAndEnter("Tutor")} className={`dev-role-btn ${isLoggedIn && userRole === "Tutor" ? "active" : ""}`}>Tutor</button>
          <button onClick={() => selectRoleAndEnter("Admin")} className={`dev-role-btn ${isLoggedIn && userRole === "Admin" ? "active" : ""}`}>Admin</button>
        </div>
      </div>

      <nav className="navbar">
        <div className="logo-section" onClick={() => handleNavClick("Home")}>
          <div className="logo-badge">
            <GraduationCap className="logo-icon" />
          </div>
          <div className="logo-text">
            <h2>Ambience <span>TutorsFlow™</span></h2>
            <p>Soli Deo Gloria</p>
          </div>
        </div>

        <div className="nav-links">
          <button className={`nav-link ${currentPage === "Home" ? "active" : ""}`} onClick={() => handleNavClick("Home")}>Home</button>
          <button className={`nav-link ${currentPage === "About" ? "active" : ""}`} onClick={() => handleNavClick("About")}>About</button>
          <button className={`nav-link ${currentPage === "Services" ? "active" : ""}`} onClick={() => handleNavClick("Services")}>Services</button>
          <button className={`nav-link ${currentPage === "Booking" || currentPage === "FindTutor" ? "active" : ""}`} onClick={() => handleNavClick("FindTutor")}>Find a Tutor</button>
          <button className={`nav-link ${currentPage === "BecomeTutor" ? "active" : ""}`} onClick={() => handleNavClick("BecomeTutor")}>Become a Tutor</button>
          <button className={`nav-link ${currentPage === "Pricing" ? "active" : ""}`} onClick={() => handleNavClick("Pricing")}>Pricing</button>
          <button className={`nav-link ${currentPage === "Contact" ? "active" : ""}`} onClick={() => handleNavClick("Contact")}>Contact</button>
          
          {isLoggedIn && (
            <button className={`nav-link dashboard-link ${currentPage === "Dashboard" ? "active" : ""}`} onClick={() => handleNavClick("Dashboard")}>
              My Dashboard
            </button>
          )}
        </div>

        <div className="nav-actions">
          {isLoggedIn ? (
            <div className="user-dropdown-container">
              <button className="user-profile-badge" onClick={() => setShowRoleSelector(!showRoleSelector)}>
                <div className="avatar-placeholder">
                  {userRole[0]}
                </div>
                <span>{userRole} Menu</span>
                <ChevronDown className="chevron-icon" />
              </button>
              
              {showRoleSelector && (
                <div className="role-dropdown-menu">
                  <div className="dropdown-header">Switch Profiles</div>
                  <button onClick={() => selectRoleAndEnter("Student")}>🎓 Student View</button>
                  <button onClick={() => selectRoleAndEnter("Parent")}>🛡️ Parent View</button>
                  <button onClick={() => selectRoleAndEnter("Tutor")}>💼 Tutor View</button>
                  <button onClick={() => selectRoleAndEnter("Admin")}>⚙️ Admin View</button>
                  <div className="dropdown-divider"></div>
                  <button className="logout-action-btn" onClick={handleLoginToggle}>Log Out</button>
                </div>
              )}
            </div>
          ) : (
            <button className="btn-primary login-nav-btn" onClick={handleLoginToggle}>
              <LogIn className="btn-icon" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </nav>
    </header>
  );
}
