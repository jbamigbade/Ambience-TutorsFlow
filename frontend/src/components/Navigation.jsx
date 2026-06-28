import React, { useContext, useState, useEffect } from "react";
import { AppContext } from "../context/AppContext";
import {
  GraduationCap,
  LogIn,
  ChevronDown,
  Award,
  Globe,
  User,
  ShieldAlert,
  Bell,
  Search,
  X,
  MessageSquare,
  Calendar,
  BookOpen,
  FileText,
  DollarSign,
  Check,
  Activity,
  Sparkles,
  UserCheck
} from "lucide-react";

export default function Navigation() {
  const {
    currentPage,
    setCurrentPage,
    userRole,
    setUserRole,
    isLoggedIn,
    setIsLoggedIn,
    signOutUser,
    // Database search tables
    tutors,
    students,
    assignments,
    messages,
    invoices,
    sessionNotes,
    characterNotes,
    lessonPlans,
    homeworkAssistantRecords,
    // Notifications state
    notifications,
    markNotificationRead,
    markAllNotificationsRead
  } = useContext(AppContext);

  const [showRoleSelector, setShowRoleSelector] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Keyboard accessibility listeners (e.g. Esc key closes modals/dropdowns)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setShowSearchModal(false);
        setShowNotifications(false);
        setShowRoleSelector(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleNavClick = (page) => {
    setCurrentPage(page);
    setShowRoleSelector(false);
    setShowNotifications(false);
  };

  const handleLoginToggle = async () => {
    if (isLoggedIn) {
      await signOutUser();
      setShowRoleSelector(false);
      setShowNotifications(false);
    } else {
      setCurrentPage("Login");
    }
  };

  const selectRoleAndEnter = (role) => {
    setUserRole(role);
    setIsLoggedIn(true);
    setCurrentPage("Dashboard");
    setShowRoleSelector(false);
    setShowNotifications(false);
  };

  // Notification count
  const unreadCount = notifications ? notifications.filter((n) => n.unread).length : 0;

  // Category Icon helper
  const getNotifIcon = (category) => {
    switch (category) {
      case "reminders":
        return BookOpen;
      case "sessions":
        return Calendar;
      case "messages":
        return MessageSquare;
      case "updates":
        return Activity;
      case "renewals":
        return Sparkles;
      case "payments":
        return DollarSign;
      case "progress":
        return Award;
      case "achievements":
        return Award;
      default:
        return Bell;
    }
  };

  // Universal Search Algorithm
  const getSearchResults = () => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    const results = [];

    // 1. Students
    if (students) {
      students.forEach((s) => {
        if (s.name?.toLowerCase().includes(query) || s.grade?.toLowerCase().includes(query)) {
          results.push({ type: "Student", title: s.name, subtitle: `${s.grade} • Level: ${s.level}`, item: s });
        }
      });
    }

    // 2. Tutors
    if (tutors) {
      tutors.forEach((t) => {
        if (
          t.name?.toLowerCase().includes(query) ||
          t.role?.toLowerCase().includes(query) ||
          t.subjects?.some((sub) => sub.toLowerCase().includes(query))
        ) {
          results.push({ type: "Tutor", title: t.name, subtitle: `${t.role} • ${t.subjects?.join(", ")}`, item: t });
        }
      });
    }

    // 3. Parents
    if (students) {
      const parentsAdded = new Set();
      students.forEach((s) => {
        if (s.parentName && !parentsAdded.has(s.parentName)) {
          if (s.parentName.toLowerCase().includes(query) || s.parentEmail?.toLowerCase().includes(query)) {
            parentsAdded.add(s.parentName);
            results.push({ type: "Parent", title: s.parentName, subtitle: `Parent of ${s.name} • ${s.parentEmail}`, item: s });
          }
        }
      });
    }

    // 4. Assignments
    if (assignments) {
      assignments.forEach((a) => {
        if (a.title?.toLowerCase().includes(query) || a.subject?.toLowerCase().includes(query) || a.desc?.toLowerCase().includes(query)) {
          results.push({ type: "Assignment", title: a.title, subtitle: `${a.subject} • Due: ${a.dueDate} • Status: ${a.status}`, item: a });
        }
      });
    }

    // 5. Homework (Homework Assistant records)
    if (homeworkAssistantRecords) {
      homeworkAssistantRecords.forEach((h) => {
        if (h.prompt?.toLowerCase().includes(query) || h.subject?.toLowerCase().includes(query) || h.feedback?.toLowerCase().includes(query)) {
          results.push({
            type: "Homework",
            title: h.prompt?.substring(0, 60) + "...",
            subtitle: `AI Homework Assistant • Subject: ${h.subject} • Grade: ${h.grade || "N/A"}`,
            item: h
          });
        }
      });
    }

    // 6. Lesson Plans
    if (lessonPlans) {
      lessonPlans.forEach((l) => {
        if (l.title?.toLowerCase().includes(query) || l.subject?.toLowerCase().includes(query) || l.topic?.toLowerCase().includes(query)) {
          results.push({ type: "Lesson Plan", title: l.title || l.topic, subtitle: `${l.subject} • Objectives: ${l.objectives}`, item: l });
        }
      });
    }

    // 7. Invoices
    if (invoices) {
      invoices.forEach((i) => {
        if (i.id?.toLowerCase().includes(query) || i.studentName?.toLowerCase().includes(query) || i.service?.toLowerCase().includes(query)) {
          results.push({ type: "Invoice", title: `Invoice #${i.id}`, subtitle: `${i.studentName} • ${i.service} • $${i.amount.toFixed(2)} • ${i.status}`, item: i });
        }
      });
    }

    // 8. Messages
    if (messages) {
      messages.forEach((m) => {
        if (m.from?.toLowerCase().includes(query) || m.to?.toLowerCase().includes(query) || m.text?.toLowerCase().includes(query)) {
          results.push({ type: "Message", title: `Msg from ${m.from}`, subtitle: `To ${m.to} • ${m.text?.substring(0, 80)}...`, item: m });
        }
      });
    }

    // 9. Reports (Session notes / character notes)
    if (sessionNotes) {
      sessionNotes.forEach((sn) => {
        if (sn.summary?.toLowerCase().includes(query) || sn.studentName?.toLowerCase().includes(query) || sn.subject?.toLowerCase().includes(query)) {
          results.push({
            type: "Report (Session)",
            title: `Session Note: ${sn.studentName}`,
            subtitle: `${sn.subject} by ${sn.tutorName} • ${sn.summary?.substring(0, 80)}...`,
            item: sn
          });
        }
      });
    }
    if (characterNotes) {
      characterNotes.forEach((cn) => {
        if (cn.studentResponse?.toLowerCase().includes(query) || cn.strengthObserved?.toLowerCase().includes(query) || cn.areaForGrowth?.toLowerCase().includes(query)) {
          results.push({
            type: "Report (Virtue)",
            title: `Virtue Note: ${cn.theme}`,
            subtitle: `Observed: ${cn.strengthObserved} • Growth: ${cn.areaForGrowth}`,
            item: cn
          });
        }
      });
    }

    return results;
  };

  return (
    <header className="navbar-container">
      {/* Dev Role switcher banner */}
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
        <div className="logo-section" onClick={() => handleNavClick("Home")} tabIndex="0" role="button" aria-label="Ambience TutorsFlow Logo, go to home">
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
          <button className={`nav-link ${currentPage === "Services" ? "active" : ""}`} onClick={() => handleNavClick("Services")}>Features</button>
          <button className={`nav-link ${currentPage === "Pricing" ? "active" : ""}`} onClick={() => handleNavClick("Pricing")}>Pricing</button>
          <button className={`nav-link ${currentPage === "About" ? "active" : ""}`} onClick={() => handleNavClick("About")}>About</button>
          <button className={`nav-link ${currentPage === "Contact" ? "active" : ""}`} onClick={() => handleNavClick("Contact")}>Contact</button>
          
          {isLoggedIn && (
            <button className={`nav-link dashboard-link ${currentPage === "Dashboard" ? "active" : ""}`} onClick={() => handleNavClick("Dashboard")}>
              My Dashboard
            </button>
          )}
        </div>

        <div className="nav-actions">
          {/* Universal Search Button */}
          {isLoggedIn && (
            <button
              className="nav-action-icon-btn search-trigger-btn"
              onClick={() => setShowSearchModal(true)}
              aria-label="Open universal database search modal"
              title="Search database"
            >
              <Search size={20} />
            </button>
          )}

          {/* Interactive Notification Center */}
          {isLoggedIn && (
            <div className="notif-dropdown-container">
              <button
                className={`nav-action-icon-btn notif-trigger-btn ${unreadCount > 0 ? "has-unreads" : ""}`}
                onClick={() => setShowNotifications(!showNotifications)}
                aria-label={`Open notifications dropdown. ${unreadCount} unread items.`}
                title="Notifications"
              >
                <Bell size={20} />
                {unreadCount > 0 && <span className="notif-badge-indicator animate-pulse">{unreadCount}</span>}
              </button>

              {showNotifications && (
                <div className="notifications-dropdown-menu animate-scale-up" onClick={(e) => e.stopPropagation()}>
                  <div className="notif-dropdown-header">
                    <div className="notif-header-title">
                      <Bell size={16} className="notif-bell-icon" />
                      <span>Notifications</span>
                      {unreadCount > 0 && <span className="notif-header-badge">{unreadCount} New</span>}
                    </div>
                    {unreadCount > 0 && (
                      <button className="notif-mark-all-btn" onClick={markAllNotificationsRead}>
                        Mark all read
                      </button>
                    )}
                  </div>
                  
                  <div className="notif-dropdown-body">
                    {(!notifications || notifications.length === 0) ? (
                      <div className="notif-empty-state">
                        <p>No notifications at this time.</p>
                      </div>
                    ) : (
                      notifications.map((notif) => {
                        const NotifIcon = getNotifIcon(notif.category);
                        return (
                          <div key={notif.id} className={`notif-item ${notif.unread ? "unread" : ""}`}>
                            <div className={`notif-icon-container ${notif.category}`}>
                              <NotifIcon size={14} />
                            </div>
                            <div className="notif-item-content">
                              <div className="notif-item-title-row">
                                <span className="notif-item-title">{notif.title}</span>
                                <span className="notif-item-time">{notif.time}</span>
                              </div>
                              <p className="notif-item-msg">{notif.message}</p>
                              <div className="notif-item-actions">
                                <button
                                  className="notif-item-go"
                                  onClick={() => {
                                    setCurrentPage(notif.targetPage || "Dashboard");
                                    setShowNotifications(false);
                                  }}
                                >
                                  View
                                </button>
                                {notif.unread && (
                                  <button
                                    className="notif-item-read-trigger"
                                    onClick={() => markNotificationRead(notif.id)}
                                  >
                                    Mark read
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                  <div className="notif-dropdown-footer">
                    <span>Faith-Inspired Tutoring Platform • Soli Deo Gloria</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {isLoggedIn ? (
            <div className="user-dropdown-container">
              <button className="user-profile-badge" onClick={() => setShowRoleSelector(!showRoleSelector)} aria-label="Open profile view switcher menu">
                <div className="avatar-placeholder">
                  {userRole ? userRole[0] : "S"}
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

      {/* Universal database search modal overlay */}
      {showSearchModal && (
        <div className="search-modal-backdrop" onClick={() => setShowSearchModal(false)}>
          <div className="search-modal-container animate-scale-up" onClick={(e) => e.stopPropagation()}>
            <div className="search-modal-header">
              <Search className="search-modal-icon" />
              <input
                type="text"
                placeholder="Search students, tutors, assignments, plans, invoices, reports, messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-modal-input"
                autoFocus
                aria-label="Universal database search query"
              />
              <button className="search-modal-close" onClick={() => setShowSearchModal(false)} aria-label="Close search modal">
                <X size={20} />
              </button>
            </div>
            
            <div className="search-modal-body">
              {searchQuery.trim() === "" ? (
                <div className="search-empty-state">
                  <p>Type to search across Ambience TutorsFlow™ database...</p>
                  <div className="search-tips">
                    <span className="search-tip-tag">Students</span>
                    <span className="search-tip-tag">Tutors</span>
                    <span className="search-tip-tag">Parents</span>
                    <span className="search-tip-tag">Assignments</span>
                    <span className="search-tip-tag">Homework</span>
                    <span className="search-tip-tag">Invoices</span>
                    <span className="search-tip-tag">Messages</span>
                    <span className="search-tip-tag">Plans</span>
                    <span className="search-tip-tag">Reports</span>
                  </div>
                </div>
              ) : getSearchResults().length === 0 ? (
                <div className="search-no-results">
                  <p>No records found matching "{searchQuery}"</p>
                </div>
              ) : (
                <div className="search-results-list">
                  <p className="search-results-count">{getSearchResults().length} matches found</p>
                  {getSearchResults().map((res, index) => (
                    <div
                      key={index}
                      className="search-result-item"
                      onClick={() => {
                        setCurrentPage("Dashboard");
                        setShowSearchModal(false);
                      }}
                    >
                      <div className="search-result-type-badge">{res.type}</div>
                      <div className="search-result-info">
                        <div className="search-result-title">{res.title}</div>
                        <div className="search-result-subtitle">{res.subtitle}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="search-modal-footer">
              <span>Soli Deo Gloria • Version 1.0 Release Candidate</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

// Soli Deo Gloria — Glory to God the Father, God the Son, and God the Holy Spirit.
