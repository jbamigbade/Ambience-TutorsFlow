import React, { useContext } from "react";
import { AppProvider, AppContext } from "./context/AppContext";

// Public pages
import Home from "./components/public/Home";
import About from "./components/public/About";
import Services from "./components/public/Services";
import Pricing from "./components/public/Pricing";
import Booking from "./components/public/Booking";
import BecomeTutor from "./components/public/BecomeTutor";
import Contact from "./components/public/Contact";
import Login from "./components/public/Login";

// Private Dashboards
import StudentDashboard from "./components/dashboards/StudentDashboard";
import ParentDashboard from "./components/dashboards/ParentDashboard";
import TutorDashboard from "./components/dashboards/TutorDashboard";
import AdminDashboard from "./components/dashboards/AdminDashboard";

// Base layouts
import Navigation from "./components/Navigation";
import Footer from "./components/Footer";

import "./App.css";

function AppContent() {
  const { currentPage, userRole, isLoggedIn } = useContext(AppContext);

  // Router view-switcher logic
  const renderPage = () => {
    switch (currentPage) {
      case "Home":
        return <Home />;
      case "About":
        return <About />;
      case "Services":
        return <Services />;
      case "Pricing":
        return <Pricing />;
      case "Booking":
        case "FindTutor":
        return <Booking />;
      case "BecomeTutor":
        return <BecomeTutor />;
      case "Contact":
        return <Contact />;
      case "Login":
        return <Login />;
      case "Dashboard":
        // Client-side secure route guard
        if (!isLoggedIn) {
          return <Login />;
        }
        // Render specific dashboard based on active simulation role
        switch (userRole) {
          case "Student":
            return <StudentDashboard />;
          case "Parent":
            return <ParentDashboard />;
          case "Tutor":
            return <TutorDashboard />;
          case "Admin":
            return <AdminDashboard />;
          default:
            return <StudentDashboard />;
        }
      default:
        return <Home />;
    }
  };

  return (
    <div className="app-container">
      {/* Universal navigation bar */}
      <Navigation />

      {/* Main viewport area */}
      <main className="main-viewport">
        {renderPage()}
      </main>

      {/* Universal footer */}
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
