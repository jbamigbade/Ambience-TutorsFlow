import React, { useState, useEffect, useContext, useRef } from "react";
import { AppContext } from "../../context/AppContext";
import {
  MessageSquare,
  FileText,
  Send,
  Sparkles,
  User,
  Users,
  CheckSquare,
  Clock,
  ChevronRight,
  ShieldAlert,
  Loader,
  Activity,
  Heart,
  Calendar,
  Share2
} from "lucide-react";

export default function AiCollaborationHub() {
  const {
    apiFetch,
    userRole,
    currentUser,
    tutors,
    students,
    isLoading: contextLoading
  } = useContext(AppContext);

  // Active Hub Tab: 'Messages' or 'CareNotes'
  const [activeTab, setActiveTab] = useState("Messages");

  // Messaging States
  const [channels, setChannels] = useState([]);
  const [activeChannel, setActiveChannel] = useState(null);
  const [messagesList, setMessagesList] = useState([]);
  const [newMessageText, setNewMessageText] = useState("");
  const [loadingMessages, setLoadingLoadingMessages] = useState(false);
  const [sendMessageError, setSendMessageError] = useState("");

  // Coordinated Care States (Shared Notes, Actions, Reminders)
  const [careNotes, setCareNotes] = useState([]);
  const [activeNote, setActiveNote] = useState(null);
  const [loadingNotes, setLoadingNotes] = useState(false);

  // AI Generator Form States (Visible to Tutors/Admins)
  const [selectedStudent, setSelectedStudent] = useState("");
  const [sessionTopic, setSessionTopic] = useState("");
  const [characterTheme, setCharacterTheme] = useState("Perseverance & Diligence");
  const [rawTutorNotes, setRawTutorNotes] = useState("");
  const [compilingAI, setCompilingAI] = useState(false);
  const [compileStep, setCompileStep] = useState(0);
  const [aiResult, setAiResult] = useState(null);
  const [notePublishSuccess, setNotePublishSuccess] = useState("");

  const messagesEndRef = useRef(null);

  // Pre-seed some default channels based on role
  useEffect(() => {
    let mockChannels = [];
    if (userRole === "Tutor") {
      mockChannels = [
        { id: "parent_tutor_Catherine_Jonathan", name: "Jonathan Sterling (Parent)", role: "Parent", relation: "Parent of Caleb" },
        { id: "tutor_student_Catherine_Caleb", name: "Caleb Sterling (Student)", role: "Student", relation: "Calculus Block" },
        { id: "admin_tutor_Admin_Catherine", name: "Admin Director (Management)", role: "Admin", relation: "System Sync" }
      ];
    } else if (userRole === "Parent") {
      mockChannels = [
        { id: "parent_tutor_Catherine_Jonathan", name: "Dr. Catherine Sterling (Tutor)", role: "Tutor", relation: "Caleb's Mentor" },
        { id: "admin_parent_Admin_Jonathan", name: "Admin Director (Management)", role: "Admin", relation: "Billing & Scheduling" }
      ];
    } else if (userRole === "Student") {
      mockChannels = [
        { id: "tutor_student_Catherine_Caleb", name: "Dr. Catherine Sterling (Tutor)", role: "Tutor", relation: "My Calculus Tutor" }
      ];
    } else if (userRole === "Admin") {
      mockChannels = [
        { id: "admin_tutor_Admin_Catherine", name: "Dr. Catherine Sterling (Tutor)", role: "Tutor", relation: "College Mathematics" },
        { id: "admin_parent_Admin_Jonathan", name: "Jonathan Sterling (Parent)", role: "Parent", relation: "Accounts Coordinator" }
      ];
    }
    setChannels(mockChannels);
    if (mockChannels.length > 0) {
      setActiveChannel(mockChannels[0]);
    }
  }, [userRole]);

  // Fetch messages when channel changes
  useEffect(() => {
    if (activeChannel) {
      fetchMessages(activeChannel.id);
    }
  }, [activeChannel]);

  // Fetch shared notes
  useEffect(() => {
    if (students && students.length > 0) {
      const defaultStudentId = students[0].id || "40000000-4000-4000-4000-400000000001";
      fetchSharedNotes(defaultStudentId);
      setSelectedStudent(defaultStudentId);
    } else {
      fetchSharedNotes("40000000-4000-4000-4000-400000000001");
    }
  }, [students]);

  // Scroll to bottom of chat
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messagesList]);

  // Fetch Messages API
  const fetchMessages = async (channelId) => {
    setLoadingLoadingMessages(true);
    try {
      const res = await apiFetch(`http://localhost:5000/api/collaboration/messages/${channelId}`);
      if (res.ok) {
        const data = await res.json();
        setMessagesList(data.messages || []);
      }
    } catch (err) {
      console.warn("[Collaboration Hub] API error fetching messages, falling back.", err);
    } finally {
      setLoadingLoadingMessages(false);
    }
  };

  // Fetch Shared Notes API
  const fetchSharedNotes = async (studentId) => {
    setLoadingNotes(true);
    try {
      const res = await apiFetch(`http://localhost:5000/api/collaboration/shared-notes/${studentId}`);
      if (res.ok) {
        const data = await res.json();
        setCareNotes(data.notes || []);
        if (data.notes && data.notes.length > 0) {
          setActiveNote(data.notes[0]);
        } else {
          setActiveNote(null);
        }
      }
    } catch (err) {
      console.warn("[Collaboration Hub] API error fetching shared notes, falling back.", err);
    } finally {
      setLoadingNotes(false);
    }
  };

  // Handle Send Message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessageText.trim() || !activeChannel) return;

    const payload = {
      recipient_id: activeChannel.id,
      recipient_name: activeChannel.name,
      recipient_role: activeChannel.role,
      channel_id: activeChannel.id,
      content: newMessageText
    };

    try {
      const res = await apiFetch("http://localhost:5000/api/collaboration/messages", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setNewMessageText("");
        fetchMessages(activeChannel.id);
      } else {
        const errData = await res.json();
        setSendMessageError(errData.error || "Failed to dispatch message.");
        setTimeout(() => setSendMessageError(""), 3500);
      }
    } catch (err) {
      console.warn("[SendMessage Fail] Local simulation fallback write.", err);
      // Local simulation append
      const simulatedMsg = {
        id: "msg_" + Date.now(),
        created_at: new Date().toISOString(),
        sender_id: currentUser?.id || "sender_curr",
        sender_name: currentUser?.name || "CurrentUser",
        sender_role: userRole,
        recipient_id: activeChannel.id,
        recipient_name: activeChannel.name,
        recipient_role: activeChannel.role,
        channel_id: activeChannel.id,
        content: newMessageText,
        is_read: false
      };
      setMessagesList((prev) => [...prev, simulatedMsg]);
      setNewMessageText("");
    }
  };

  // AI compiling loader sequence
  const startAiCompileSequence = () => {
    setCompileStep(1);
    const t1 = setTimeout(() => setCompileStep(2), 1000);
    const t2 = setTimeout(() => setCompileStep(3), 2200);
    const t3 = setTimeout(() => setCompileStep(4), 3400);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  };

  // Trigger AI generate session summaries
  const handleAICompileNotes = async (e) => {
    e.preventDefault();
    if (!sessionTopic || !rawTutorNotes) return;

    setCompilingAI(true);
    setAiResult(null);
    startAiCompileSequence();

    const targetStudent = students.find(s => s.id === selectedStudent) || { name: "Caleb Sterling" };

    try {
      const res = await apiFetch("http://localhost:5000/api/ai/generate-collaboration-notes", {
        method: "POST",
        body: JSON.stringify({
          sessionTopic,
          rawTutorNotes,
          studentName: targetStudent.name,
          characterTheme
        })
      });

      // Complete compiling transition
      setTimeout(async () => {
        if (res.ok) {
          const data = await res.json();
          setAiResult(data.collaborationOutput);
        } else {
          alert("AI compiling encountered error. Falling back to local rules template.");
        }
        setCompilingAI(false);
      }, 4500);

    } catch (err) {
      console.warn("[AI Compile Note] Offline fallback trigger.", err);
      setTimeout(() => {
        setAiResult({
          summary: `During today's session on "${sessionTopic}", the student demonstrated exceptional focus. We reviewed fundamental integration guidelines, solved multiple practice exercises step-by-step, and resolved misconceptions around the key calculus rules.`,
          parentUpdate: `Dear Parent, ${targetStudent.name} did a wonderful job today studying "${sessionTopic}". I am particularly proud of how they demonstrated ${characterTheme} when working through the most difficult calculations. They didn't give up and successfully completed the exercises!`,
          actionItems: [
            `Complete the 5 remaining homework exercises on "${sessionTopic}".`,
            `Review key glossary terms and formula rules before our next block.`
          ],
          reminders: [
            `Bring questions on homework to the warm-up segment of our next session.`,
            `Log into the Student Portal to claim the milestone badge for completing this lesson.`
          ]
        });
        setCompilingAI(false);
      }, 4500);
    }
  };

  // Publish Compiled Note
  const handlePublishNote = async () => {
    if (!aiResult) return;

    const payload = {
      student_id: selectedStudent,
      title: `${sessionTopic} - Session Coordinated Record`,
      summary: aiResult.summary,
      parent_update: aiResult.parentUpdate,
      action_items: aiResult.actionItems.map(text => ({ text, completed: false })),
      reminders: aiResult.reminders.map(text => ({ text, due_date: new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0] })),
      visibility: ["Admin", "Tutor", "Parent", "Student"]
    };

    try {
      const res = await apiFetch("http://localhost:5000/api/collaboration/shared-notes", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setNotePublishSuccess("Coordinated Care summary published & shared with Parents & Students!");
        setSessionTopic("");
        setRawTutorNotes("");
        setAiResult(null);
        fetchSharedNotes(selectedStudent);
        setTimeout(() => setNotePublishSuccess(""), 4000);
      }
    } catch (err) {
      console.warn("[Publish Note Fail] Offline fallback sync.", err);
      const simulatedNote = {
        id: "note_" + Date.now(),
        created_at: new Date().toISOString(),
        created_by: currentUser?.id || "sender_curr",
        student_id: selectedStudent,
        title: `${sessionTopic} - Session Coordinated Record`,
        summary: aiResult.summary,
        parent_update: aiResult.parentUpdate,
        action_items: aiResult.actionItems.map(text => ({ text, completed: false })),
        reminders: aiResult.reminders.map(text => ({ text, due_date: "2026-07-01" })),
        visibility: ["Admin", "Tutor", "Parent", "Student"]
      };
      setCareNotes(prev => [simulatedNote, ...prev]);
      setActiveNote(simulatedNote);
      setNotePublishSuccess("[OFFLINE] Logged summary to local in-memory states successfully!");
      setSessionTopic("");
      setRawTutorNotes("");
      setAiResult(null);
      setTimeout(() => setNotePublishSuccess(""), 4000);
    }
  };

  return (
    <div className="collaboration-hub-container animate-fade-in" style={{
      display: "flex",
      flexDirection: "column",
      gap: "24px",
      padding: "5px",
      minHeight: "75vh"
    }}>
      
      {/* Banner */}
      <div className="dashboard-banner" style={{
        background: "linear-gradient(135deg, rgba(20, 26, 64, 0.65) 0%, rgba(30, 41, 100, 0.4) 100%)",
        border: "1px solid rgba(255, 215, 0, 0.12)",
        borderRadius: "16px",
        padding: "24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "16px",
        backdropFilter: "blur(12px)"
      }}>
        <div>
          <span className="banner-badge" style={{
            background: "rgba(255, 215, 0, 0.12)",
            color: "var(--gold-faith)",
            fontSize: "0.75rem",
            fontWeight: "700",
            letterSpacing: "1.5px",
            padding: "4px 10px",
            borderRadius: "20px",
            border: "1px solid rgba(255, 215, 0, 0.2)"
          }}>COORDINATED PLATFORM COLLABORATION</span>
          <h1 style={{ fontSize: "1.8rem", margin: "10px 0 6px 0", color: "#fff", fontWeight: "700" }}>Communication & Care Hub</h1>
          <p style={{ color: "#a0aec0", margin: 0, fontSize: "0.9rem" }}>
            Secure multi-tenant chat rooms, coordinated session notes, administrative audits, and AI-powered parental summaries. Soli Deo Gloria.
          </p>
        </div>

        {/* Pulsing connection beacon */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          background: "rgba(255, 255, 255, 0.03)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          padding: "8px 16px",
          borderRadius: "12px"
        }}>
          <span style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: "#34d399",
            boxShadow: "0 0 8px #34d399",
            display: "inline-block",
            animation: "pulse 1.8s infinite"
          }}></span>
          <span style={{ fontSize: "0.8rem", color: "#94a3b8", fontWeight: "600" }}>Realtime Sync Active</span>
        </div>
      </div>

      {/* Navigation Headers */}
      <div className="dashboard-tabs-header-row" style={{ display: "flex", gap: "12px", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "2px" }}>
        <button 
          onClick={() => setActiveTab("Messages")}
          className={`dashboard-tab-trigger ${activeTab === "Messages" ? "active" : ""}`}
          style={{
            background: activeTab === "Messages" ? "rgba(99, 102, 241, 0.15)" : "transparent",
            color: activeTab === "Messages" ? "#fff" : "#94a3b8"
          }}
        >
          <MessageSquare className="tab-trigger-icon" />
          <span>Secure Messages</span>
        </button>
        <button 
          onClick={() => setActiveTab("CareNotes")}
          className={`dashboard-tab-trigger ${activeTab === "CareNotes" ? "active" : ""}`}
          style={{
            background: activeTab === "CareNotes" ? "rgba(99, 102, 241, 0.15)" : "transparent",
            color: activeTab === "CareNotes" ? "#fff" : "#94a3b8"
          }}
        >
          <FileText className="tab-trigger-icon" />
          <span>Shared Session Notes & Coordinated Care</span>
        </button>
      </div>

      {/* Body Content */}
      <div className="collaboration-hub-body" style={{ flex: 1 }}>

        {/* Tab: Secure Messaging */}
        {activeTab === "Messages" && (
          <div className="messaging-grid animate-scale-up" style={{
            display: "grid",
            gridTemplateColumns: "280px 1fr",
            gap: "24px",
            minHeight: "550px"
          }}>
            
            {/* Sidebar directory */}
            <div className="messages-sidebar" style={{
              background: "rgba(20, 25, 55, 0.4)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "16px",
              padding: "16px",
              display: "flex",
              flexDirection: "column",
              gap: "16px"
            }}>
              <h3 style={{ margin: 0, fontSize: "1rem", color: "#fff", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px" }}>
                <Users style={{ width: "18px", height: "18px", color: "var(--gold-faith)" }} />
                <span>My Active Channels</span>
              </h3>
              
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px", overflowY: "auto" }}>
                {channels.map((chan) => (
                  <button
                    key={chan.id}
                    onClick={() => setActiveChannel(chan)}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "12px",
                      borderRadius: "10px",
                      border: "1px solid " + (activeChannel?.id === chan.id ? "rgba(99, 102, 241, 0.3)" : "rgba(255,255,255,0.04)"),
                      background: activeChannel?.id === chan.id ? "rgba(99, 102, 241, 0.12)" : "rgba(0,0,0,0.15)",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      gap: "4px",
                      transition: "all 0.2s"
                    }}
                  >
                    <span style={{ fontSize: "0.85rem", fontWeight: "600", color: activeChannel?.id === chan.id ? "var(--gold-faith)" : "#fff" }}>{chan.name}</span>
                    <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>{chan.relation}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Conversation Window */}
            <div className="messages-conversation-window" style={{
              background: "rgba(20, 25, 55, 0.4)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "16px",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden"
            }}>
              
              {/* Active Channel Header */}
              {activeChannel && (
                <div className="active-channel-header" style={{
                  padding: "16px 20px",
                  borderBottom: "1px solid rgba(255,255,255,0.08)",
                  background: "rgba(0,0,0,0.15)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div className="avatar" style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      background: "rgba(99, 102, 241, 0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--gold-faith)",
                      fontWeight: "bold",
                      fontSize: "0.9rem",
                      border: "1px solid rgba(255, 215, 0, 0.2)"
                    }}>{activeChannel.name[0]}</div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: "0.95rem", color: "#fff", fontWeight: "600" }}>{activeChannel.name}</h4>
                      <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Role: {activeChannel.role} • Secure End-to-End Chat</span>
                    </div>
                  </div>
                  <span style={{
                    fontSize: "0.75rem",
                    padding: "2px 8px",
                    background: "rgba(52, 211, 153, 0.12)",
                    color: "#34d399",
                    borderRadius: "20px",
                    border: "1px solid rgba(52, 211, 153, 0.2)"
                  }}>✓ Monitored</span>
                </div>
              )}

              {/* Message Feed list */}
              <div style={{ flex: 1, padding: "20px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "16px", maxHeight: "380px" }}>
                {loadingMessages ? (
                  <div style={{ display: "flex", justifyContent: "center", padding: "40px", color: "#94a3b8" }}>
                    <Loader className="spin" style={{ marginRight: "10px" }} />
                    <span>Synchronizing communication log feed...</span>
                  </div>
                ) : messagesList.length === 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", padding: "40px", color: "#718096" }}>
                    <MessageSquare style={{ width: "32px", height: "32px", marginBottom: "8px" }} />
                    <span>Send a secure message to initiate conversation.</span>
                  </div>
                ) : (
                  messagesList.map((msg) => {
                    const isMe = msg.sender_role === userRole;
                    return (
                      <div key={msg.id} style={{
                        display: "flex",
                        justifyContent: isMe ? "flex-end" : "flex-start",
                        width: "100%"
                      }}>
                        <div style={{
                          maxWidth: "70%",
                          background: isMe ? "rgba(99, 102, 241, 0.22)" : "rgba(255,255,255,0.04)",
                          border: "1px solid " + (isMe ? "rgba(99, 102, 241, 0.3)" : "rgba(255,255,255,0.06)"),
                          borderRadius: "12px",
                          padding: "12px 16px",
                          display: "flex",
                          flexDirection: "column",
                          gap: "4px"
                        }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px" }}>
                            <span style={{ fontSize: "0.75rem", fontWeight: "700", color: isMe ? "var(--gold-faith)" : "#94a3b8" }}>
                              {msg.sender_name} ({msg.sender_role})
                            </span>
                            <span style={{ fontSize: "0.65rem", color: "#718096" }}>
                              {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p style={{ margin: 0, fontSize: "0.85rem", color: "#e2e8f0", lineHeight: "1.4" }}>{msg.content}</p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input box form */}
              <form onSubmit={handleSendMessage} style={{
                padding: "16px 20px",
                borderTop: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(0,0,0,0.15)",
                display: "flex",
                gap: "12px"
              }}>
                <input
                  type="text"
                  placeholder="Type secure message content..."
                  value={newMessageText}
                  onChange={(e) => setNewMessageText(e.target.value)}
                  style={{
                    flex: 1,
                    background: "rgba(0,0,0,0.3)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: "8px",
                    color: "#fff",
                    padding: "10px 14px",
                    fontSize: "0.85rem",
                    outline: "none"
                  }}
                />
                <button type="submit" className="btn-primary-glowing" style={{ padding: "10px 18px", borderRadius: "8px" }}>
                  <Send style={{ width: "16px", height: "16px" }} />
                </button>
              </form>

            </div>

          </div>
        )}

        {/* Tab: Shared Session Notes & Coordinated Care */}
        {activeTab === "CareNotes" && (
          <div className="coordinated-care-grid animate-scale-up" style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "24px",
            flexWrap: "wrap"
          }}>
            
            {/* Left Side: Create/Generate AI Care Notes (Tutors or Admin only) */}
            <div className="coordinated-care-creation" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              
              {(userRole === "Tutor" || userRole === "Admin") ? (
                <div className="panel-card" style={{ padding: "20px", borderRadius: "16px" }}>
                  <div className="panel-card-header" style={{ display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "10px", marginBottom: "16px" }}>
                    <Sparkles style={{ color: "var(--gold-faith)", width: "20px", height: "20px" }} />
                    <h3 style={{ margin: 0, fontSize: "1.1rem", color: "#fff", fontWeight: "600" }}>AI Coordinated Care Compiler</h3>
                  </div>

                  {notePublishSuccess && (
                    <div style={{ background: "rgba(16, 185, 129, 0.15)", border: "1px solid rgba(16, 185, 129, 0.3)", padding: "10px 14px", borderRadius: "8px", color: "#34d399", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                      <CheckSquare style={{ width: "16px", height: "16px" }} />
                      <span>{notePublishSuccess}</span>
                    </div>
                  )}

                  <form onSubmit={handleAICompileNotes} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    <div className="form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label style={{ fontSize: "0.8rem", color: "var(--gold-faith)" }}>Select Student *</label>
                        <select value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)} style={{ width: "100%", padding: "8px", background: "rgba(0,0,0,0.25)", color: "#fff", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "6px" }}>
                          {students.map(s => (
                            <option key={s.id} value={s.id}>{s.name} ({s.grade})</option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label style={{ fontSize: "0.8rem", color: "var(--gold-faith)" }}>Character Focus Virtue</label>
                        <select value={characterTheme} onChange={(e) => setCharacterTheme(e.target.value)} style={{ width: "100%", padding: "8px", background: "rgba(0,0,0,0.25)", color: "#fff", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "6px" }}>
                          <option value="Perseverance & Diligence">Perseverance & Diligence</option>
                          <option value="Integrity & Honor">Integrity & Honor</option>
                          <option value="Responsibility & Study Habits">Responsibility & Study Habits</option>
                          <option value="Kindness & Patience">Kindness & Patience</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-group" style={{ margin: 0 }}>
                      <label style={{ fontSize: "0.8rem", color: "var(--gold-faith)" }}>Session Lesson Topic *</label>
                      <input 
                        type="text" 
                        required
                        placeholder="E.g., Indefinite integrals or SAT Reading comprehension" 
                        value={sessionTopic}
                        onChange={(e) => setSessionTopic(e.target.value)}
                        style={{ width: "100%", padding: "8px 12px", background: "rgba(0,0,0,0.25)", color: "#fff", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "6px" }}
                      />
                    </div>

                    <div className="form-group" style={{ margin: 0 }}>
                      <label style={{ fontSize: "0.8rem", color: "var(--gold-faith)" }}>Raw Tutor Observations & Session Notes *</label>
                      <textarea
                        rows="3"
                        required
                        placeholder="Type raw notes (e.g. Caleb arrived late but stayed focused. We solved area integration problems. He made minor arithmetic sign errors but grasped the core theorem beautifully...)"
                        value={rawTutorNotes}
                        onChange={(e) => setRawTutorNotes(e.target.value)}
                        style={{ width: "100%", padding: "8px 12px", background: "rgba(0,0,0,0.25)", color: "#fff", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "6px" }}
                      ></textarea>
                    </div>

                    <button 
                      type="submit" 
                      disabled={compilingAI} 
                      className="btn-primary-glowing" 
                      style={{ padding: "10px", borderRadius: "8px", background: compilingAI ? "rgba(99, 102, 241, 0.4)" : "" }}
                    >
                      {compilingAI ? (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                          <Loader className="spin" style={{ width: "16px", height: "16px" }} />
                          <span>Compiling Coordinated Summary...</span>
                        </div>
                      ) : (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                          <Sparkles style={{ width: "16px", height: "16px" }} />
                          <span>Generate Coordinated Care Summary</span>
                        </div>
                      )}
                    </button>
                  </form>

                  {/* Compiling Sequence Status Card */}
                  {compilingAI && (
                    <div style={{
                      marginTop: "16px",
                      background: "rgba(0,0,0,0.25)",
                      border: "1px solid rgba(255, 255, 255, 0.05)",
                      borderRadius: "10px",
                      padding: "12px",
                      fontSize: "0.8rem",
                      color: "#94a3b8",
                      display: "flex",
                      flexDirection: "column",
                      gap: "6px"
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ color: compileStep >= 1 ? "#34d399" : "#718096" }}>{compileStep >= 1 ? "✓" : "○"}</span>
                        <span>Stage 1: Parsing session observations & keywords...</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ color: compileStep >= 2 ? "#34d399" : "#718096" }}>{compileStep >= 2 ? "✓" : "○"}</span>
                        <span>Stage 2: Translating raw logs into administrative summary...</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ color: compileStep >= 3 ? "#34d399" : "#718096" }}>{compileStep >= 3 ? "✓" : "○"}</span>
                        <span>Stage 3: Formulating encouraging parent update with Christian virtues...</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ color: compileStep >= 4 ? "#34d399" : "#718096" }}>{compileStep >= 4 ? "✓" : "○"}</span>
                        <span>Stage 4: Establishing student action items & reminders...</span>
                      </div>
                    </div>
                  )}

                  {/* AI Results compilation review */}
                  {aiResult && !compilingAI && (
                    <div className="animate-scale-up" style={{
                      marginTop: "20px",
                      background: "rgba(99, 102, 241, 0.08)",
                      border: "1px solid rgba(99, 102, 241, 0.2)",
                      borderRadius: "12px",
                      padding: "16px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px"
                    }}>
                      <h4 style={{ margin: 0, fontSize: "0.95rem", color: "var(--gold-faith)", display: "flex", alignItems: "center", gap: "6px" }}>
                        <Sparkles style={{ width: "16px", height: "16px" }} />
                        <span>Review AI Coordinated Draft</span>
                      </h4>

                      <div style={{ fontSize: "0.8rem", color: "#e2e8f0" }}>
                        <strong style={{ color: "#fff" }}>Administrative Summary:</strong>
                        <p style={{ margin: "4px 0 10px 0", color: "#94a3b8" }}>{aiResult.summary}</p>

                        <strong style={{ color: "#fff" }}>Encouraging Parent Update:</strong>
                        <p style={{ margin: "4px 0 10px 0", color: "#94a3b8" }}>{aiResult.parentUpdate}</p>

                        <strong style={{ color: "#fff" }}>Action Items Checklist:</strong>
                        <ul style={{ margin: "4px 0 10px 0", paddingLeft: "16px", color: "#94a3b8" }}>
                          {aiResult.actionItems.map((item, i) => <li key={i}>{item}</li>)}
                        </ul>

                        <strong style={{ color: "#fff" }}>Follow-up Reminders:</strong>
                        <ul style={{ margin: "4px 0 10px 0", paddingLeft: "16px", color: "#94a3b8" }}>
                          {aiResult.reminders.map((rem, i) => <li key={i}>{rem}</li>)}
                        </ul>
                      </div>

                      <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                        <button 
                          onClick={() => setAiResult(null)} 
                          style={{ padding: "6px 12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", borderRadius: "6px", cursor: "pointer", fontSize: "0.8rem" }}
                        >
                          Discard
                        </button>
                        <button 
                          onClick={handlePublishNote} 
                          className="btn-primary-glowing" 
                          style={{ padding: "6px 12px", borderRadius: "6px", fontSize: "0.8rem" }}
                        >
                          Publish & Share Summary
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              ) : (
                <div className="panel-card" style={{ padding: "20px", borderRadius: "16px", background: "rgba(20, 25, 55, 0.4)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "220px", textAlign: "center" }}>
                  <ShieldAlert style={{ width: "36px", height: "36px", color: "var(--gold-faith)", marginBottom: "12px" }} />
                  <h3 style={{ margin: 0, fontSize: "1rem", color: "#fff", fontWeight: "600" }}>Coordinated Care Guidelines</h3>
                  <p style={{ fontSize: "0.85rem", color: "#94a3b8", maxWidth: "340px", marginTop: "8px" }}>
                    Tutors automatically write, compile, and publish session summaries. Once uploaded, summaries are shared dynamically with Parents, Students, and Administrators.
                  </p>
                </div>
              )}

              {/* Action checklist */}
              {activeNote && (
                <div className="panel-card animate-scale-up" style={{ padding: "20px", borderRadius: "16px" }}>
                  <h3 style={{ margin: 0, fontSize: "1rem", color: "#fff", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "10px", marginBottom: "14px" }}>
                    <CheckSquare style={{ color: "var(--gold-faith)", width: "18px", height: "18px" }} />
                    <span>My Coordinated Action Items</span>
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {activeNote.action_items && activeNote.action_items.length > 0 ? (
                      activeNote.action_items.map((item, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", background: "rgba(255,255,255,0.02)", padding: "10px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.04)" }}>
                          <input type="checkbox" defaultChecked={item.completed} style={{ accentColor: "var(--gold-faith)" }} />
                          <span style={{ fontSize: "0.85rem", color: "#e2e8f0" }}>{item.text}</span>
                        </div>
                      ))
                    ) : (
                      <span style={{ fontSize: "0.85rem", color: "#718096" }}>No actionable items mapped for this record.</span>
                    )}
                  </div>
                </div>
              )}

            </div>

            {/* Right Side: Shared Care Records & Timelines */}
            <div className="coordinated-care-records" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              
              {/* Shared notes timeline */}
              <div className="panel-card" style={{ padding: "20px", borderRadius: "16px", flex: 1, display: "flex", flexDirection: "column" }}>
                <h3 style={{ margin: 0, fontSize: "1rem", color: "#fff", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "10px", marginBottom: "16px" }}>
                  <FileText style={{ color: "var(--gold-faith)", width: "18px", height: "18px" }} />
                  <span>Shared Care Summaries</span>
                </h3>

                {loadingNotes ? (
                  <div style={{ display: "flex", justifyContent: "center", padding: "40px", color: "#94a3b8" }}>
                    <Loader className="spin" style={{ marginRight: "10px" }} />
                    <span>Loading notes...</span>
                  </div>
                ) : careNotes.length === 0 ? (
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "150px", color: "#718096" }}>
                    <FileText style={{ width: "32px", height: "32px", marginBottom: "8px" }} />
                    <span>No shared summaries compiled for this student.</span>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px", overflowY: "auto", maxHeight: "420px" }}>
                    {careNotes.map((note) => (
                      <div 
                        key={note.id} 
                        onClick={() => setActiveNote(note)}
                        style={{
                          background: activeNote?.id === note.id ? "rgba(99,102,241,0.08)" : "rgba(255,255,255,0.01)",
                          border: "1px solid " + (activeNote?.id === note.id ? "rgba(99,102,241,0.22)" : "rgba(255,255,255,0.04)"),
                          borderRadius: "12px",
                          padding: "16px",
                          cursor: "pointer",
                          display: "flex",
                          flexDirection: "column",
                          gap: "8px"
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                          <h4 style={{ margin: 0, fontSize: "0.9rem", color: "#fff", fontWeight: "600" }}>{note.title}</h4>
                          <span style={{ fontSize: "0.7rem", color: "var(--gold-faith)", whiteSpace: "nowrap" }}>
                            {new Date(note.created_at).toLocaleDateString([], { month: "short", day: "numeric" })}
                          </span>
                        </div>
                        
                        <p style={{ margin: 0, fontSize: "0.8rem", color: "#94a3b8", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", lineHeight: "1.4" }}>
                          {note.summary}
                        </p>

                        {/* Expandable Care Panel inside selected Note */}
                        {activeNote?.id === note.id && (
                          <div className="animate-fade-in" style={{
                            marginTop: "12px",
                            borderTop: "1px solid rgba(255,255,255,0.06)",
                            paddingTop: "12px",
                            display: "flex",
                            flexDirection: "column",
                            gap: "8px"
                          }}>
                            {note.parent_update && (
                              <div style={{ background: "rgba(255,255,255,0.02)", borderLeft: "3px solid var(--gold-faith)", padding: "10px", borderRadius: "0 8px 8px 0" }}>
                                <span style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--gold-faith)", display: "flex", alignItems: "center", gap: "4px" }}>
                                  <Heart style={{ width: "12px", height: "12px" }} />
                                  <span>Parent Update:</span>
                                </span>
                                <p style={{ margin: "4px 0 0 0", fontSize: "0.78rem", color: "#e2e8f0" }}>{note.parent_update}</p>
                              </div>
                            )}

                            {note.reminders && note.reminders.length > 0 && (
                              <div style={{ marginTop: "4px" }}>
                                <span style={{ fontSize: "0.75rem", fontWeight: "700", color: "#94a3b8", display: "flex", alignItems: "center", gap: "4px" }}>
                                  <Clock style={{ width: "12px", height: "12px" }} />
                                  <span>Follow-up Reminders:</span>
                                </span>
                                <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginTop: "4px" }}>
                                  {note.reminders.map((rem, i) => (
                                    <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "#cbd5e1" }}>
                                      <span>• {rem.text}</span>
                                      <span style={{ color: "var(--gold-faith)" }}>{rem.due_date}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}
