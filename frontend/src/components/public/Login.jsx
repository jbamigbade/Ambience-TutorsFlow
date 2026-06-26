import React, { useState, useContext, useEffect } from "react";
import { AppContext } from "../../context/AppContext";
import { isSupabaseConfigured } from "../../supabaseClient";
import { GraduationCap, Lock, ShieldCheck, Mail, LogIn, Sparkles, Award, UserPlus } from "lucide-react";

export default function Login() {
  const { setCurrentPage, setUserRole, setIsLoggedIn, signInUser, signUpUser, resetUserPassword, updateUserPassword } = useContext(AppContext);
  const [selectedRole, setSelectedRole] = useState("Student"); // Student, Parent, Tutor, Admin
  const [isRegisterMode, setIsRegisterMode] = useState(false); // Sign In vs Sign Up toggle
  const [isForgotPasswordMode, setIsForgotPasswordMode] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    if (params.get("type") === "recovery" || hashParams.get("type") === "recovery") {
      setIsResetMode(true);
      setErrorMsg("");
      setSuccessMsg("");
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    try {
      if (isResetMode) {
        if (newPassword !== confirmPassword) {
          throw new Error("Passwords do not match.");
        }
        await updateUserPassword(newPassword);
        setSuccessMsg("Your password has been updated successfully! You can now sign in.");
        setIsResetMode(false);
        setIsRegisterMode(false);
        setIsForgotPasswordMode(false);
      } else if (isForgotPasswordMode) {
        await resetUserPassword(forgotEmail);
        setSuccessMsg("If an account exists, a secure password reset link has been dispatched to your email.");
      } else if (isRegisterMode) {
        // Sign up logic with Supabase metadata triggers
        await signUpUser(email, password, name, selectedRole);
        if (isSupabaseConfigured()) {
          setSuccessMsg("Account created successfully! A confirmation link has been sent to your email. Please check your inbox and verify before logging in.");
          setIsRegisterMode(false);
        } else {
          // Simulator auto-login
          setUserRole(selectedRole);
          setIsLoggedIn(true);
          setCurrentPage("Dashboard");
        }
      } else {
        // Sign in logic
        const success = await signInUser(email, password);
        if (success) {
          if (!isSupabaseConfigured()) {
            setUserRole(selectedRole);
          }
          setIsLoggedIn(true);
          setCurrentPage("Dashboard");
        } else {
          throw new Error("Login failed. Check connection.");
        }
      }
    } catch (err) {
      setErrorMsg(err.message || "An unexpected security authentication error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (role) => {
    if (isSupabaseConfigured()) {
      setErrorMsg("Demo bypass shortcut is disabled when live Supabase configuration is active.");
      return;
    }
    setUserRole(role);
    setIsLoggedIn(true);
    setCurrentPage("Dashboard");
  };

  return (
    <div className="page-container login-page animate-fade-in">
      <section className="login-container">
        <div className="login-card-grid">
          
          {/* Left Column: Authentic Credentials Management */}
          <div className="login-form-side">
            <div className="login-header">
              <GraduationCap className="login-logo-icon" />
              <h3>
                {isResetMode 
                  ? "Update Your " 
                  : isForgotPasswordMode 
                    ? "Reset Your " 
                    : isRegisterMode 
                      ? "Create Your " 
                      : "Sign In to "} 
                <span>TutorsFlow™</span>
              </h3>
              <p>
                {isResetMode 
                  ? "Enter your new password below to secure your account." 
                  : isForgotPasswordMode 
                    ? "Enter your email address to receive a secure recovery link." 
                    : isRegisterMode 
                      ? "Join our premium faith-inspired learning network today." 
                      : "Enter your credentials to access your secure custom dashboard."}
              </p>
            </div>

            {errorMsg && (
              <div className="error-banner animate-pulse" style={{ padding: "10px", background: "rgba(239, 68, 68, 0.12)", color: "#ef4444", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: "6px", fontSize: "12px", marginBottom: "1rem" }}>
                ⚠️ {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="success-banner" style={{ padding: "10px", background: "rgba(16, 185, 129, 0.12)", color: "#10b981", border: "1px solid rgba(16, 185, 129, 0.2)", borderRadius: "6px", fontSize: "12.5px", marginBottom: "1rem" }}>
                ✅ {successMsg}
              </div>
            )}

            {isResetMode ? (
              <form onSubmit={handleSubmit} className="login-form-inputs">
                <div className="form-group">
                  <label>New Password</label>
                  <div className="input-with-icon">
                    <Lock className="input-icon" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Confirm New Password</label>
                  <div className="input-with-icon">
                    <Lock className="input-icon" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="btn-primary-glowing btn-full-width" 
                  disabled={loading}
                  style={{ opacity: loading ? 0.7 : 1 }}
                >
                  <ShieldCheck className="btn-icon" />
                  <span>{loading ? "Updating Password..." : "Update Password Securely"}</span>
                </button>

                <div className="login-sublinks">
                  <a 
                    href="#back" 
                    onClick={(e) => {
                      e.preventDefault();
                      setIsResetMode(false);
                      setIsForgotPasswordMode(false);
                      setErrorMsg("");
                      setSuccessMsg("");
                    }}
                    style={{ color: "var(--primary-glow)", fontWeight: "bold" }}
                  >
                    Back to Sign In
                  </a>
                </div>
              </form>
            ) : isForgotPasswordMode ? (
              <form onSubmit={handleSubmit} className="login-form-inputs">
                <div className="form-group">
                  <label>Email Address</label>
                  <div className="input-with-icon">
                    <Mail className="input-icon" />
                    <input
                      type="email"
                      placeholder="name@tutorsflow.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="btn-primary-glowing btn-full-width" 
                  disabled={loading}
                  style={{ opacity: loading ? 0.7 : 1 }}
                >
                  <Mail className="btn-icon" />
                  <span>{loading ? "Sending Link..." : "Send Reset Link"}</span>
                </button>

                <div className="login-sublinks">
                  <a 
                    href="#back" 
                    onClick={(e) => {
                      e.preventDefault();
                      setIsForgotPasswordMode(false);
                      setErrorMsg("");
                      setSuccessMsg("");
                    }}
                    style={{ color: "var(--primary-glow)", fontWeight: "bold" }}
                  >
                    Back to Sign In
                  </a>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSubmit} className="login-form-inputs">
                
                {/* Registration: Full Display Name */}
                {isRegisterMode && (
                  <div className="form-group animate-scale-up">
                    <label>Full Display Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Grace Sterling"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      style={{ width: "100%", background: "#0c0f33", border: "1px solid #2e3573", color: "#fff", padding: "10px", borderRadius: "6px", fontSize: "13px" }}
                      required={isRegisterMode}
                    />
                  </div>
                )}

                <div className="form-group">
                  <label>Select Your Profile Role</label>
                  <div className="role-pills-row">
                    <button
                      type="button"
                      className={`role-pill-btn ${selectedRole === "Student" ? "active" : ""}`}
                      onClick={() => setSelectedRole("Student")}
                    >
                      🎓 Student
                    </button>
                    <button
                      type="button"
                      className={`role-pill-btn ${selectedRole === "Parent" ? "active" : ""}`}
                      onClick={() => setSelectedRole("Parent")}
                    >
                      🛡️ Parent
                    </button>
                    <button
                      type="button"
                      className={`role-pill-btn ${selectedRole === "Tutor" ? "active" : ""}`}
                      onClick={() => setSelectedRole("Tutor")}
                    >
                      💼 Tutor
                    </button>
                    <button
                      type="button"
                      className={`role-pill-btn ${selectedRole === "Admin" ? "active" : ""}`}
                      onClick={() => setSelectedRole("Admin")}
                    >
                      ⚙️ Admin
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label>Email Address</label>
                  <div className="input-with-icon">
                    <Mail className="input-icon" />
                    <input
                      type="email"
                      placeholder="name@tutorsflow.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Password</label>
                  <div className="input-with-icon">
                    <Lock className="input-icon" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="btn-primary-glowing btn-full-width" 
                  disabled={loading}
                  style={{ opacity: loading ? 0.7 : 1 }}
                >
                  {isRegisterMode ? <UserPlus className="btn-icon" /> : <LogIn className="btn-icon" />}
                  <span>
                    {loading 
                      ? "Authenticating Security..." 
                      : isRegisterMode 
                        ? "Create Live SaaS Account" 
                        : "Log In Securely"}
                  </span>
                </button>

                <div className="login-sublinks" style={{ display: "flex", justifyContent: "space-between", gap: "10px", marginTop: "10px", flexWrap: "wrap" }}>
                  <a 
                    href="#toggle" 
                    onClick={(e) => {
                      e.preventDefault();
                      setIsRegisterMode(!isRegisterMode);
                      setIsForgotPasswordMode(false);
                      setErrorMsg("");
                      setSuccessMsg("");
                    }}
                    style={{ color: "var(--primary-glow)", fontWeight: "bold", fontSize: "12.5px" }}
                  >
                    {isRegisterMode ? "Already a member? Sign In" : "New member? Create an account"}
                  </a>
                  {!isRegisterMode && (
                    <a 
                      href="#forgot" 
                      onClick={(e) => {
                        e.preventDefault();
                        setIsForgotPasswordMode(true);
                        setErrorMsg("");
                        setSuccessMsg("");
                      }}
                      style={{ color: "#a5b4fc", fontSize: "12.5px" }}
                    >
                      Forgot Password?
                    </a>
                  )}
                </div>
              </form>
            )}
          </div>

          {/* Right Column: Interactive Sandbox Demo Shortcuts */}
          <div className="login-demo-side">
            <span className="demo-badge">
              {isSupabaseConfigured() ? "LIVE MULTI-TENANT PROD MODE" : "OFFLINE DEMO SANDBOX"}
            </span>
            <h3>Interactive Demo Portals</h3>
            <p className="demo-side-desc">
              {isSupabaseConfigured() 
                ? "Your live Supabase database is connected! You can register a live account or use the sandbox portals below for quick, synchronized inspections."
                : "Ambience TutorsFlow™ features four fully simulated, synchronized dashboards. Click any role below to bypass authentication and inspect the reactive connections!"}
            </p>

            {!isSupabaseConfigured() ? (
              <div className="demo-shortcuts-list">
                <button className="demo-shortcut-card student" onClick={() => handleQuickDemo("Student")}>
                  <div className="shortcut-icon-wrapper">🎓</div>
                  <div className="shortcut-info">
                    <h4>Demo Student Dashboard</h4>
                    <p>Check streaks, submit assignments, view Growth Journey™ badges.</p>
                  </div>
                </button>

                <button className="demo-shortcut-card parent" onClick={() => handleQuickDemo("Parent")}>
                  <div className="shortcut-icon-wrapper">🛡️</div>
                  <div className="shortcut-info">
                    <h4>Demo Parent Dashboard</h4>
                    <p>Inspect attendance, message tutors, pay simulated invoices.</p>
                  </div>
                </button>

                <button className="demo-shortcut-card tutor" onClick={() => handleQuickDemo("Tutor")}>
                  <div className="shortcut-icon-wrapper">💼</div>
                  <div className="shortcut-info">
                    <h4>Demo Tutor Dashboard</h4>
                    <p>Add assignments, log session notes, view hours and schedules.</p>
                  </div>
                </button>

                <button className="demo-shortcut-card admin" onClick={() => handleQuickDemo("Admin")}>
                  <div className="shortcut-icon-wrapper">⚙️</div>
                  <div className="shortcut-info">
                    <h4>Demo Admin Dashboard</h4>
                    <p>Manage users, review revenue reports, inspect system telemetry.</p>
                  </div>
                </button>
              </div>
            ) : (
              <div className="demo-prod-notice" style={{ padding: "20px", background: "rgba(16, 185, 129, 0.08)", border: "1px solid rgba(16, 185, 129, 0.2)", borderRadius: "8px", margin: "1.5rem 0", textAlign: "left" }}>
                <p style={{ color: "#10b981", fontSize: "14px", fontWeight: "600", margin: "0 0 10px 0", display: "flex", alignItems: "center", gap: "8px" }}>🛡️ Live Cryptographic Auth Active</p>
                <p style={{ color: "#a5b4fc", fontSize: "12.5px", margin: "0", lineHeight: "1.6" }}>
                  For production security, direct bypass and mock logins are disabled. Please create a live account or sign in with your secure credentials to view live transactional dashboards.
                </p>
              </div>
            )}

            <div className="demo-dedication-stamp">
              <Award className="dedication-stamp-icon" />
              <span>Soli Deo Gloria — Done with pure integrity.</span>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
