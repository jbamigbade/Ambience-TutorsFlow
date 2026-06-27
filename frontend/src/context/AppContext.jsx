import React, { createContext, useState, useEffect } from "react";
import { supabase, isSupabaseConfigured } from "../supabaseClient";
import {
  SERVICES,
  INITIAL_TUTORS,
  INITIAL_STUDENTS,
  INITIAL_ASSIGNMENTS,
  INITIAL_MESSAGES,
  INITIAL_INVOICES,
  INITIAL_SESSION_NOTES,
  INITIAL_BOOKINGS,
  GROWTH_JOURNEY_LEVELS,
  INITIAL_CHARACTER_NOTES,
  CHARACTER_BADGES
} from "../data/mockData";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Navigation & User roles
  const [currentPage, setCurrentPage] = useState("Home"); // Home, About, Services, Pricing, Booking, Contact, Login, Dashboard
  const [userRole, setUserRole] = useState("Student"); // Student, Parent, Tutor, Admin
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Controls whether private dashboards or login screen are visible
  const [session, setSession] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentProfile, setCurrentProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  // Application Data States (Simulated local DB or populated live from Supabase)
  const [tutors, setTutors] = useState(INITIAL_TUTORS);
  const [students, setStudents] = useState(INITIAL_STUDENTS);
  const [assignments, setAssignments] = useState(INITIAL_ASSIGNMENTS);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [invoices, setInvoices] = useState(INITIAL_INVOICES);
  const [sessionNotes, setSessionNotes] = useState(INITIAL_SESSION_NOTES);
  const [bookings, setBookings] = useState(INITIAL_BOOKINGS);
  const [characterNotes, setCharacterNotes] = useState(INITIAL_CHARACTER_NOTES);
  const [practiceTests, setPracticeTests] = useState([]);
  const [lessonPlans, setLessonPlans] = useState([]);
  const [iepNotes, setIepNotes] = useState([]);
  const [copilotRecords, setCopilotRecords] = useState([]);
  const [parentCopilotRecords, setParentCopilotRecords] = useState([]);


  // Live Zoom Integration States
  const [tutorZoomStatus, setTutorZoomStatus] = useState("Not Connected"); // Connected, Not Connected, Reconnect Required
  const [tutorManualZoomLink, setTutorManualZoomLink] = useState("");

  // ==========================================
  // 1. SUPABASE AUTH & LIVE STATE SYNC
  // ==========================================

  // Method to fetch all tables from Supabase and map them to local states
  const fetchLiveDatabaseData = async (user) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      console.log("[Supabase Sync] Fetching live multi-tenant data for user:", user.email);

      // A. Fetch Profiles & Current User Role
      const { data: profile, error: profileErr } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileErr) throw profileErr;

      setCurrentProfile(profile);
      setUserRole(profile.role);
      setIsLoggedIn(true);

      // B. Fetch Tutors Linked with Profiles
      const { data: dbTutors, error: tutorsErr } = await supabase
        .from("tutors")
        .select("*, profiles:id(name, email, avatar_url)");

      if (!tutorsErr && dbTutors) {
        const formattedTutors = dbTutors.map((t) => ({
          id: t.id,
          name: t.profiles?.name || "Academic Specialist",
          role: t.specialty_role,
          rating: parseFloat(t.rating) || 5.0,
          reviews: t.reviews_count || 0,
          subjects: t.subjects || [],
          image: t.profiles?.avatar_url || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200",
          bio: t.bio || ""
        }));
        setTutors(formattedTutors);
      }

      // C. Fetch Students Linked with Profiles, IEP, Badges, Reflections
      const { data: dbStudents, error: studentsErr } = await supabase
        .from("students")
        .select("*, profiles:id(name, email, avatar_url)");

      if (!studentsErr && dbStudents) {
        // Fetch supplemental relationships in parallel
        const [
          { data: iepG },
          { data: iepA },
          { data: iepO },
          { data: refls },
          { data: encs }
        ] = await Promise.all([
          supabase.from("iep_goals").select("*"),
          supabase.from("iep_accommodations").select("*"),
          supabase.from("iep_observations").select("*"),
          supabase.from("character_reflections").select("*"),
          supabase.from("parent_encouragements").select("*")
        ]);

        const formattedStudents = dbStudents.map((s) => {
          const studentGoals = iepG ? iepG.filter((g) => g.student_id === s.id).map(g => ({ id: g.id, text: g.goal_text, progress: g.progress_percentage })) : [];
          const studentAccomms = iepA ? iepA.filter((a) => a.student_id === s.id).map(a => a.accommodation_text) : [];
          const studentObs = iepO ? iepO.filter((o) => o.student_id === s.id).map(o => ({ id: o.id, date: o.logged_date, tutor: "Mrs. Sarah Jenkins", text: o.observation_text })) : [];
          const studentReflections = refls ? refls.filter((r) => r.student_id === s.id).map(r => ({ id: r.id, date: r.logged_date, theme: r.theme, text: r.reflection_text })) : [];
          const studentEncouragements = encs ? encs.filter((e) => e.student_id === s.id).map(e => ({ id: e.id, date: e.logged_date, author: "Grace Sterling", text: e.encouragement_text })) : [];

          return {
            id: s.id,
            parentId: s.parent_id,
            name: s.profiles?.name || "Student Name",
            grade: s.grade,
            parentName: "Grace Sterling", // mapped for demo integrity
            parentEmail: s.profiles?.email ? `parent_${s.profiles.email}` : "grace@sterling.com",
            level: s.level,
            points: s.points,
            streak: s.streak,
            completedSessions: s.completed_sessions,
            overallProgress: s.overall_progress,
            subjects: [
              { name: "Pre-Calculus", progress: 88, grade: "A-" },
              { name: "SAT Prep", progress: 81, grade: "B+" },
              { name: "Science", progress: 83, grade: "B" }
            ],
            exams: [
              { id: "ex_1", name: "SAT Practice Test", date: "June 28, 2026", status: "Upcoming" },
              { id: "ex_2", name: "Pre-Calculus Unit 5 Test", date: "July 2, 2026", status: "Upcoming" }
            ],
            weeklyCharacterTheme: s.weekly_character_theme || "Responsibility & Integrity",
            leadershipGoals: s.leadership_goals || "Support study circles and submit tasks with honor.",
            characterMetrics: {
              integrity: s.character_integrity,
              responsibility: s.character_responsibility,
              kindness: s.character_kindness,
              perseverance: s.character_perseverance,
              leadership: s.character_leadership
            },
            unlockedBadges: s.unlocked_badges || ["Rising Star"],
            growthReflections: studentReflections,
            parentEncouragements: studentEncouragements,
            iepGoals: studentGoals,
            iepAccommodations: studentAccomms,
            iepInterventionPlan: s.iep_intervention_plan || "Scaffold steps, checklist routines, and build character.",
            iepTutorObservations: studentObs
          };
        });
        setStudents(formattedStudents);
      }

      // D. Fetch Bookings
      const { data: dbBookings, error: bookingsErr } = await supabase
        .from("bookings")
        .select("*, student:student_id(profiles:id(name)), tutor:tutor_id(profiles:id(name))");

      if (!bookingsErr && dbBookings) {
        const formattedBookings = dbBookings.map((b) => ({
          id: b.id,
          studentName: b.student?.profiles?.name || "Caleb Sterling",
          tutorName: b.tutor?.profiles?.name || "Mrs. Sarah Jenkins",
          subject: b.subject,
          date: b.date,
          time: b.time_slot,
          status: b.status,
          zoomJoinUrl: b.zoom_join_url,
          zoomStartUrl: b.zoom_start_url,
          zoomMeetingId: b.zoom_meeting_id
        }));
        setBookings(formattedBookings);
      }

      // E. Fetch Assignments
      const { data: dbAsgs, error: asgsErr } = await supabase.from("assignments").select("*");
      if (!asgsErr && dbAsgs) {
        const formattedAsgs = dbAsgs.map((a) => ({
          id: a.id,
          studentId: a.student_id,
          title: a.title,
          subject: a.subject,
          dueDate: a.due_date,
          status: a.status,
          points: a.points_award,
          desc: a.description
        }));
        setAssignments(formattedAsgs);
      }

      // F. Fetch Session Notes
      const { data: dbNotes, error: notesErr } = await supabase
        .from("session_notes")
        .select("*, student:student_id(profiles:id(name)), tutor:tutor_id(profiles:id(name))");
      if (!notesErr && dbNotes) {
        const formattedNotes = dbNotes.map((n) => ({
          id: n.id,
          studentId: n.student_id,
          studentName: n.student?.profiles?.name || "Student",
          tutorName: n.tutor?.profiles?.name || "Tutor",
          date: n.logged_date,
          subject: n.subject,
          summary: n.summary,
          nextSteps: n.next_steps
        }));
        setSessionNotes(formattedNotes);
      }

      // G. Fetch Character Notes
      const { data: dbCharNotes, error: charErr } = await supabase.from("character_notes").select("*");
      if (!charErr && dbCharNotes) {
        const formattedChar = dbCharNotes.map((c) => ({
          id: c.id,
          studentId: c.student_id,
          tutorName: "Mrs. Sarah Jenkins",
          date: c.logged_date,
          theme: c.theme,
          studentResponse: c.student_response,
          strengthObserved: c.strength_observed,
          areaForGrowth: c.area_for_growth,
          recommendation: c.recommendation
        }));
        setCharacterNotes(formattedChar);
      }

      // H. Fetch Messages
      const { data: dbMsg, error: msgErr } = await supabase
        .from("messages")
        .select("*, sender:sender_id(profiles:id(name, role)), receiver:receiver_id(profiles:id(name, role))");
      if (!msgErr && dbMsg) {
        const formattedMsg = dbMsg.map((m) => ({
          id: m.id,
          from: m.sender?.profiles?.name || "User",
          to: m.receiver?.profiles?.name || "User",
          roleFrom: m.sender?.profiles?.role || "Student",
          roleTo: m.receiver?.profiles?.role || "Student",
          time: new Date(m.created_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
          text: m.message_text,
          unread: m.is_unread
        }));
        setMessages(formattedMsg);
      }

      // I. Fetch Invoices
      const { data: dbInvs, error: invsErr } = await supabase.from("invoices").select("*");
      if (!invsErr && dbInvs) {
        const formattedInvs = dbInvs.map((i) => ({
          id: i.id,
          studentName: i.student_name,
          amount: parseFloat(i.amount) || 0,
          dueDate: i.due_date,
          status: i.status,
          billingPeriod: i.billing_period,
          service: i.service_description
        }));
        setInvoices(formattedInvs);
      }

      // J. Fetch Practice Tests
      const { data: dbTests, error: testsErr } = await supabase
        .from("practice_tests")
        .select("*")
        .order("created_at", { ascending: false });

      if (!testsErr && dbTests) {
        const formattedTests = dbTests.map((t) => ({
          id: t.id,
          studentId: t.student_id,
          tutorId: t.tutor_id,
          title: t.title,
          subject: t.subject,
          topic: t.topic,
          gradeLevel: t.grade_level,
          difficulty: t.difficulty,
          config: t.config,
          content: t.content,
          createdAt: t.created_at,
          updatedAt: t.updated_at
        }));
        setPracticeTests(formattedTests);
      }

      // K. Fetch Lesson Plans
      const { data: dbLessonPlans, error: lpErr } = await supabase
        .from("lesson_plans")
        .select("*")
        .order("created_at", { ascending: false });

      if (!lpErr && dbLessonPlans) {
        const formattedLPs = dbLessonPlans.map((lp) => ({
          id: lp.id,
          studentId: lp.student_id,
          tutorId: lp.tutor_id,
          title: lp.title,
          gradeLevel: lp.grade_level,
          subject: lp.subject,
          topic: lp.topic,
          duration: lp.duration,
          learningObjective: lp.learning_objective,
          difficulty: lp.difficulty,
          config: lp.config,
          content: lp.content,
          createdAt: lp.created_at,
          updatedAt: lp.updated_at
        }));
        setLessonPlans(formattedLPs);
      }

      // L. Fetch IEP Notes
      const { data: dbIEPs, error: iepErr } = await supabase
        .from("iep_notes")
        .select("*")
        .order("created_at", { ascending: false });

      if (!iepErr && dbIEPs) {
        const formattedIEPs = dbIEPs.map((iep) => ({
          id: iep.id,
          studentId: iep.student_id,
          tutorId: iep.tutor_id,
          strengths: iep.strengths,
          challenges: iep.challenges,
          accommodations: iep.accommodations,
          goals: iep.goals,
          progressNotes: iep.progress_notes,
          parentSummary: iep.parent_summary,
          tutorSteps: iep.tutor_steps,
          createdAt: iep.created_at,
          updatedAt: iep.updated_at
        }));
        setIepNotes(formattedIEPs);
      }

      // M. Fetch Copilot Records
      const { data: dbCopilot, error: copErr } = await supabase
        .from("copilot_records")
        .select("*")
        .order("created_at", { ascending: false });

      if (!copErr && dbCopilot) {
        const formattedCopilot = dbCopilot.map((cr) => ({
          id: cr.id,
          studentId: cr.student_id,
          tutorId: cr.tutor_id,
          subject: cr.subject,
          topic: cr.topic,
          gradeLevel: cr.grade_level,
          sessionContext: cr.session_context,
          studentChallenge: cr.student_challenge,
          supportType: cr.support_type,
          content: cr.content,
          createdAt: cr.created_at,
          updatedAt: cr.updated_at
        }));
        setCopilotRecords(formattedCopilot);
      }

      // N. Fetch Parent Copilot Records
      const { data: dbParentCopilot, error: pCopErr } = await supabase
        .from("parent_copilot_records")
        .select("*")
        .order("created_at", { ascending: false });

      if (!pCopErr && dbParentCopilot) {
        const formattedParentCopilot = dbParentCopilot.map((cr) => ({
          id: cr.id,
          studentId: cr.student_id,
          parentId: cr.parent_id,
          subject: cr.subject,
          topic: cr.topic,
          currentAssignment: cr.current_assignment,
          parentConcern: cr.parent_concern,
          supportType: cr.support_type,
          content: cr.content,
          createdAt: cr.created_at,
          updatedAt: cr.updated_at
        }));
        setParentCopilotRecords(formattedParentCopilot);
      }

    } catch (err) {
      console.error("[Supabase Sync] Error during database sync:", err.message);
      setAuthError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Auth Status check on component load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("zoom_status") === "success") {
      setTutorZoomStatus("Connected");
      setCurrentPage("Dashboard");
      setUserRole("Tutor");
      setIsLoggedIn(true);
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    // Reactively poll backend to check Zoom status
    const fetchZoomStatus = async () => {
      try {
        const response = await apiFetch("http://localhost:5000/api/zoom/status/tut_1");
        if (response.ok) {
          const data = await response.json();
          if (data.status) {
            setTutorZoomStatus(data.status);
          }
        }
      } catch (err) {
        console.log("[Zoom Status] Express server is offline; keeping local state simulation.");
      }
    };
    fetchZoomStatus();
    fetchPracticeTests();

    // Supabase auth subscription and state sync
    if (isSupabaseConfigured()) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        setCurrentUser(session?.user ?? null);
        if (session?.user) {
          fetchLiveDatabaseData(session.user);
        }
      });

      const {
        data: { subscription }
      } = supabase.auth.onAuthStateChange((_event, newSession) => {
        setSession(newSession);
        setCurrentUser(newSession?.user ?? null);
        if (newSession?.user) {
          fetchLiveDatabaseData(newSession.user);
        } else {
          setIsLoggedIn(false);
          setUserRole("Student");
        }
      });

      return () => subscription.unsubscribe();
    }
  }, []);

  // Set mock profile in Sandbox Mode when logged in or role changes
  useEffect(() => {
    if (!isSupabaseConfigured() && isLoggedIn) {
      if (userRole === "Student") {
        setCurrentProfile({
          name: "Caleb Sterling",
          email: "student.caleb@ambience.com",
          role: "Student",
          avatar_url: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200"
        });
      } else if (userRole === "Parent") {
        setCurrentProfile({
          name: "Grace Sterling",
          email: "parent.grace@ambience.com",
          role: "Parent",
          avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"
        });
      } else if (userRole === "Tutor") {
        setCurrentProfile({
          name: "Mrs. Sarah Jenkins",
          email: "tutor.sarah@ambience.com",
          role: "Tutor",
          avatar_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200"
        });
      } else if (userRole === "Admin") {
        setCurrentProfile({
          name: "Admin Director",
          email: "admin@ambience.com",
          role: "Admin",
          avatar_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200"
        });
      }
    } else if (!isLoggedIn) {
      setCurrentProfile(null);
    }
  }, [isLoggedIn, userRole]);

  // Auth Operations
  const signUpUser = async (email, password, name, role) => {
    if (!isSupabaseConfigured()) {
      alert("[Sandbox] Signup simulated locally!");
      return true;
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role
        }
      }
    });
    if (error) throw error;
    return data;
  };

  const signInUser = async (email, password) => {
    if (!isSupabaseConfigured()) {
      alert("[Sandbox] Simulated credentials login success!");
      return true;
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    return data;
  };

  const signOutUser = async () => {
    if (!isSupabaseConfigured()) {
      setIsLoggedIn(false);
      setCurrentPage("Home");
      return;
    }
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setIsLoggedIn(false);
    setCurrentPage("Home");
  };

  const resetUserPassword = async (email) => {
    if (!isSupabaseConfigured()) {
      alert("[Sandbox] Password reset link simulated locally!");
      return true;
    }
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}${window.location.pathname}?type=recovery`,
    });
    if (error) throw error;
    return data;
  };

  const updateUserPassword = async (newPassword) => {
    if (!isSupabaseConfigured()) {
      alert("[Sandbox] Password update simulated locally!");
      return true;
    }
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    });
    if (error) throw error;
    return data;
  };

  // ==========================================
  // 2. GROWTH JOURNEY LEVELING METRICS
  // ==========================================
  const getLevelInfo = (points) => {
    for (let i = 0; i < GROWTH_JOURNEY_LEVELS.length; i++) {
      const lvl = GROWTH_JOURNEY_LEVELS[i];
      if (points >= lvl.minPoints && points <= lvl.maxPoints) {
        const nextLvl = GROWTH_JOURNEY_LEVELS[i + 1] || null;
        const progress = nextLvl
          ? ((points - lvl.minPoints) / (lvl.maxPoints - lvl.minPoints + 1)) * 100
          : 100;
        return {
          current: lvl,
          next: nextLvl,
          progress: Math.min(Math.max(progress, 0), 100)
        };
      }
    }
    return {
      current: GROWTH_JOURNEY_LEVELS[0],
      next: GROWTH_JOURNEY_LEVELS[1],
      progress: 0
    };
  };

  // ==========================================
  // 3. SECURE WRITE MUTATION HANDLERS
  // ==========================================

  // A. Session Booking & Auto Zoom Meeting Creation
  const bookSession = async (bookingData) => {
    let zoomJoinUrl = "";
    let zoomStartUrl = "";
    let zoomMeetingId = "";

    if (tutorZoomStatus === "Connected") {
      try {
        const response = await apiFetch("http://localhost:5000/api/zoom/create-meeting", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tutorId: "tut_1",
            topic: `${bookingData.subject} with ${bookingData.tutorName || "Mrs. Sarah Jenkins"}`,
            startTime: `${bookingData.date}T12:00:00`,
            duration: 60
          })
        });
        if (response.ok) {
          const data = await response.json();
          zoomJoinUrl = data.joinUrl;
          zoomStartUrl = data.startUrl;
          zoomMeetingId = data.meetingId;
        } else {
          throw new Error("Zoom meeting API error response");
        }
      } catch (err) {
        console.warn("[Zoom API] Connection to backend failed, falling back to simulated session links.", err);
        const meetId = Math.floor(100000000 + Math.random() * 900000000);
        zoomJoinUrl = `https://zoom.us/j/${meetId}?pwd=simulatedPasscode`;
        zoomStartUrl = `https://zoom.us/s/${meetId}?role=host&tutor=tut_1`;
        zoomMeetingId = meetId.toString();
      }
    } else if (tutorManualZoomLink) {
      zoomJoinUrl = tutorManualZoomLink;
      zoomStartUrl = tutorManualZoomLink;
      zoomMeetingId = "Manual";
    }

    if (isSupabaseConfigured() && currentUser) {
      try {
        // Resolve a default tutor and student UUID from records
        const { data: stdProf } = await supabase.from("students").select("id").limit(1).maybeSingle();
        const { data: tutProf } = await supabase.from("tutors").select("id").limit(1).maybeSingle();

        const { error } = await supabase.from("bookings").insert({
          student_id: stdProf?.id || currentUser.id,
          tutor_id: tutProf?.id || currentUser.id,
          subject: bookingData.subject,
          date: bookingData.date,
          time_slot: bookingData.time || "4:00 PM - 5:00 PM",
          status: "Confirmed",
          zoom_join_url: zoomJoinUrl,
          zoom_start_url: zoomStartUrl,
          zoom_meeting_id: zoomMeetingId
        });

        if (error) throw error;
        await fetchLiveDatabaseData(currentUser);
      } catch (err) {
        console.error("[Supabase Book] Error inserting booking:", err.message);
      }
    } else {
      // Offline fallback state update
      const newBooking = {
        id: `bk_${Date.now()}`,
        studentName: "Caleb Sterling",
        tutorName: bookingData.tutorName || "Mrs. Sarah Jenkins",
        subject: bookingData.subject,
        date: bookingData.date,
        time: bookingData.time || "4:00 PM - 5:00 PM",
        status: "Confirmed",
        zoomJoinUrl,
        zoomStartUrl,
        zoomMeetingId
      };
      setBookings((prev) => [newBooking, ...prev]);
    }

    // Auto-dispatch Parent Invoice
    const invoiceAmount = 75.00;
    if (isSupabaseConfigured() && currentUser) {
      try {
        await supabase.from("invoices").insert({
          parent_id: currentUser.id,
          student_name: "Caleb Sterling",
          amount: invoiceAmount,
          due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          status: "Unpaid",
          billing_period: "Ad-hoc Booking Fee",
          service_description: `${bookingData.subject} Session Booking`
        });
      } catch (err) {
        console.error("[Supabase Invoice] Auto creation failed:", err.message);
      }
    } else {
      const newInvoice = {
        id: `inv_${Math.floor(1000 + Math.random() * 9000)}`,
        studentName: "Caleb Sterling",
        amount: invoiceAmount,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric"
        }),
        status: "Unpaid",
        billingPeriod: "Ad-hoc Booking Fee",
        service: `${bookingData.subject} Session Booking with ${bookingData.tutorName || "Mrs. Sarah Jenkins"}`
      };
      setInvoices((prev) => [newInvoice, ...prev]);
    }

    return true;
  };

  // B. Complete Student Assignment (Updates score/streak and database)
  const completeAssignment = async (assignmentId) => {
    if (isSupabaseConfigured() && currentUser) {
      try {
        // Complete the assignment in db
        const { error: asgErr } = await supabase
          .from("assignments")
          .update({ status: "Completed" })
          .eq("id", assignmentId);

        if (asgErr) throw asgErr;

        // Fetch corresponding assignment points to award
        const targetAsg = assignments.find((a) => a.id === assignmentId);
        const pointsAward = targetAsg ? targetAsg.points : 30;

        // Award points in student record
        const { data: stdRec } = await supabase
          .from("students")
          .select("points, streak")
          .eq("id", currentUser.id)
          .single();

        if (stdRec) {
          const newPoints = stdRec.points + pointsAward;
          const lvlInfo = getLevelInfo(newPoints);
          await supabase
            .from("students")
            .update({
              points: newPoints,
              level: lvlInfo.current.name,
              streak: stdRec.streak + 1
            })
            .eq("id", currentUser.id);
        }

        await fetchLiveDatabaseData(currentUser);
      } catch (err) {
        console.error("[Supabase Assignment] Complete error:", err.message);
      }
    } else {
      // Local state fallback logic
      setAssignments((prev) =>
        prev.map((asg) => {
          if (asg.id === assignmentId && asg.status !== "Completed") {
            awardPoints(asg.points);
            return { ...asg, status: "Completed" };
          }
          return asg;
        })
      );
    }
  };

  // C. Award Points
  const awardPoints = async (pts) => {
    if (isSupabaseConfigured() && currentUser) {
      try {
        const { data: stdRec } = await supabase.from("students").select("points, streak").eq("id", currentUser.id).single();
        if (stdRec) {
          const newPoints = stdRec.points + pts;
          const lvlInfo = getLevelInfo(newPoints);
          await supabase.from("students").update({
            points: newPoints,
            level: lvlInfo.current.name,
            streak: stdRec.streak + 1
          }).eq("id", currentUser.id);
          await fetchLiveDatabaseData(currentUser);
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      setStudents((prev) =>
        prev.map((std) => {
          if (std.id === "std_1") {
            const newPoints = std.points + pts;
            const lvlInfo = getLevelInfo(newPoints);
            return {
              ...std,
              points: newPoints,
              level: lvlInfo.current.name,
              streak: std.streak + 1
            };
          }
          return std;
        })
      );
    }
  };

  // D. Check-In Daily
  const checkInDaily = () => {
    awardPoints(15);
  };

  // E. Invoice Payment
  const payInvoice = async (invoiceId) => {
    if (isSupabaseConfigured() && currentUser) {
      try {
        await supabase.from("invoices").update({ status: "Paid" }).eq("id", invoiceId);
        await fetchLiveDatabaseData(currentUser);
      } catch (err) {
        console.error(err);
      }
    } else {
      setInvoices((prev) =>
        prev.map((inv) => (inv.id === invoiceId ? { ...inv, status: "Paid" } : inv))
      );
    }
  };

  // F. Secure Messages
  const sendMessage = async (fromName, toName, text, roleFrom, roleTo) => {
    if (isSupabaseConfigured() && currentUser) {
      try {
        // Look up receiver profile dynamically or default to active roster IDs
        const { data: destUser } = await supabase.from("profiles").select("id").eq("name", toName).maybeSingle();
        const receiverId = destUser?.id || currentUser.id;

        const { error } = await supabase.from("messages").insert({
          sender_id: currentUser.id,
          receiver_id: receiverId,
          message_text: text,
          is_unread: true
        });

        if (error) throw error;
        await fetchLiveDatabaseData(currentUser);
      } catch (err) {
        console.error("[Supabase Message] Send failed:", err.message);
      }
    } else {
      const newMsg = {
        id: `msg_${Date.now()}`,
        from: fromName,
        to: toName,
        roleFrom,
        roleTo,
        time: "Just Now",
        text,
        unread: false
      };
      setMessages((prev) => [...prev, newMsg]);
    }
  };

  // G. Session Notes
  const addSessionNote = async (studentId, tutorName, subject, summary, nextSteps) => {
    if (isSupabaseConfigured() && currentUser) {
      try {
        await supabase.from("session_notes").insert({
          student_id: studentId,
          tutor_id: currentUser.id,
          subject,
          summary,
          next_steps: nextSteps,
          logged_date: new Date().toISOString().split("T")[0]
        });

        // Boost student progress dynamically upon logging session notes
        const { data: std } = await supabase.from("students").select("overall_progress").eq("id", studentId).single();
        if (std) {
          await supabase.from("students").update({
            overall_progress: Math.min(std.overall_progress + 4, 100)
          }).eq("id", studentId);
        }

        await fetchLiveDatabaseData(currentUser);
      } catch (err) {
        console.error(err);
      }
    } else {
      const activeStudent = students.find((s) => s.id === studentId);
      const newNote = {
        id: `note_${Date.now()}`,
        studentId,
        studentName: activeStudent ? activeStudent.name : "Caleb Sterling",
        tutorName,
        date: new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric"
        }),
        subject,
        summary,
        nextSteps
      };
      setSessionNotes((prev) => [newNote, ...prev]);

      setStudents((prev) =>
        prev.map((std) => {
          if (std.id === studentId) {
            return {
              ...std,
              overallProgress: Math.min(std.overallProgress + 4, 100)
            };
          }
          return std;
        })
      );
    }
  };

  // H. Add Assignment
  const addAssignment = async (studentId, title, subject, dueDate, points, desc) => {
    if (isSupabaseConfigured() && currentUser) {
      try {
        await supabase.from("assignments").insert({
          student_id: studentId,
          title,
          subject,
          due_date: dueDate,
          points_award: parseInt(points) || 30,
          description: desc,
          status: "Pending"
        });
        await fetchLiveDatabaseData(currentUser);
      } catch (err) {
        console.error(err);
      }
    } else {
      const newAsg = {
        id: `asg_${Date.now()}`,
        studentId,
        title,
        subject,
        dueDate,
        status: "Pending",
        points: parseInt(points) || 30,
        desc
      };
      setAssignments((prev) => [newAsg, ...prev]);
    }
  };

  // I. Add Character Reflection
  const addStudentReflection = async (studentId, text, theme) => {
    if (isSupabaseConfigured() && currentUser) {
      try {
        await supabase.from("character_reflections").insert({
          student_id: currentUser.id,
          theme,
          reflection_text: text,
          logged_date: new Date().toISOString().split("T")[0]
        });

        // Grant 25 points bonus
        const { data: std } = await supabase.from("students").select("points").eq("id", currentUser.id).single();
        if (std) {
          const newPoints = std.points + 25;
          const lvlInfo = getLevelInfo(newPoints);
          await supabase.from("students").update({
            points: newPoints,
            level: lvlInfo.current.name
          }).eq("id", currentUser.id);
        }

        await fetchLiveDatabaseData(currentUser);
      } catch (err) {
        console.error(err);
      }
    } else {
      const newRefl = {
        id: `refl_${Date.now()}`,
        date: new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric"
        }),
        theme,
        text
      };

      setStudents((prev) =>
        prev.map((std) => {
          if (std.id === studentId) {
            const newPoints = std.points + 25;
            const lvlInfo = getLevelInfo(newPoints);
            return {
              ...std,
              points: newPoints,
              level: lvlInfo.current.name,
              growthReflections: [newRefl, ...(std.growthReflections || [])]
            };
          }
          return std;
        })
      );
    }
  };

  // J. Add Parent Encouragement
  const addParentEncouragement = async (studentId, text) => {
    if (isSupabaseConfigured() && currentUser) {
      try {
        await supabase.from("parent_encouragements").insert({
          student_id: studentId,
          parent_id: currentUser.id,
          encouragement_text: text,
          logged_date: new Date().toISOString().split("T")[0]
        });
        await fetchLiveDatabaseData(currentUser);
      } catch (err) {
        console.error(err);
      }
    } else {
      const newEnc = {
        id: `enc_${Date.now()}`,
        date: new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric"
        }),
        author: "Grace Sterling",
        text
      };

      setStudents((prev) =>
        prev.map((std) => {
          if (std.id === studentId) {
            return {
              ...std,
              parentEncouragements: [newEnc, ...(std.parentEncouragements || [])]
            };
          }
          return std;
        })
      );
    }
  };

  // K. Add Tutor Character Note
  const addTutorCharacterNote = async (studentId, tutorName, theme, studentResponse, strengthObserved, areaForGrowth, recommendation) => {
    if (isSupabaseConfigured() && currentUser) {
      try {
        await supabase.from("character_notes").insert({
          student_id: studentId,
          tutor_id: currentUser.id,
          theme,
          student_response: studentResponse,
          strength_observed: strengthObserved,
          area_for_growth: areaForGrowth,
          recommendation,
          logged_date: new Date().toISOString().split("T")[0]
        });

        // Award points & update specific character metrics dynamically
        const { data: std } = await supabase.from("students").select("points, character_integrity, character_responsibility, character_kindness, character_perseverance, character_leadership").eq("id", studentId).single();
        if (std) {
          const newPoints = std.points + 10;
          const lvlInfo = getLevelInfo(newPoints);
          
          const strengthKey = strengthObserved.toLowerCase().trim();
          const updates = {
            points: newPoints,
            level: lvlInfo.current.name
          };

          if (strengthKey === "integrity") updates.character_integrity = Math.min(std.character_integrity + 1, 5);
          else if (strengthKey === "responsibility") updates.character_responsibility = Math.min(std.character_responsibility + 1, 5);
          else if (strengthKey === "kindness") updates.character_kindness = Math.min(std.character_kindness + 1, 5);
          else if (strengthKey === "perseverance") updates.character_perseverance = Math.min(std.character_perseverance + 1, 5);
          else if (strengthKey === "leadership") updates.character_leadership = Math.min(std.character_leadership + 1, 5);

          await supabase.from("students").update(updates).eq("id", studentId);
        }

        await fetchLiveDatabaseData(currentUser);
      } catch (err) {
        console.error(err);
      }
    } else {
      const newNote = {
        id: `c_note_${Date.now()}`,
        studentId,
        tutorName,
        date: new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric"
        }),
        theme,
        studentResponse,
        strengthObserved,
        areaForGrowth,
        recommendation
      };

      setCharacterNotes((prev) => [newNote, ...prev]);

      setStudents((prev) =>
        prev.map((std) => {
          if (std.id === studentId) {
            const metrics = { ...std.characterMetrics };
            const strengthKey = strengthObserved.toLowerCase().replace(" ", "_");
            if (metrics[strengthKey] !== undefined) {
              metrics[strengthKey] = Math.min(metrics[strengthKey] + 1, 5);
            }
            const newPoints = std.points + 10;
            const lvlInfo = getLevelInfo(newPoints);
            return {
              ...std,
              points: newPoints,
              level: lvlInfo.current.name,
              characterMetrics: metrics
            };
          }
          return std;
        })
      );
    }
  };

  // L. Character Goals
  const updateCharacterGoals = async (studentId, weeklyTheme, leadershipGoals) => {
    if (isSupabaseConfigured() && currentUser) {
      try {
        await supabase
          .from("students")
          .update({
            weekly_character_theme: weeklyTheme,
            leadership_goals: leadershipGoals
          })
          .eq("id", studentId);
        await fetchLiveDatabaseData(currentUser);
      } catch (err) {
        console.error(err);
      }
    } else {
      setStudents((prev) =>
        prev.map((std) => {
          if (std.id === studentId) {
            return {
              ...std,
              weeklyCharacterTheme: weeklyTheme,
              leadershipGoals: leadershipGoals
            };
          }
          return std;
        })
      );
    }
  };

  // M. Unlocked Badges
  const awardBadge = async (studentId, badgeName) => {
    if (isSupabaseConfigured() && currentUser) {
      try {
        const { data: std } = await supabase.from("students").select("unlocked_badges, points").eq("id", studentId).single();
        if (std) {
          const currentBadges = std.unlocked_badges || [];
          if (!currentBadges.includes(badgeName)) {
            const newPoints = std.points + 50;
            const lvlInfo = getLevelInfo(newPoints);
            await supabase.from("students").update({
              unlocked_badges: [...currentBadges, badgeName],
              points: newPoints,
              level: lvlInfo.current.name
            }).eq("id", studentId);
            await fetchLiveDatabaseData(currentUser);
          }
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      setStudents((prev) =>
        prev.map((std) => {
          if (std.id === studentId) {
            const badges = std.unlockedBadges || [];
            if (!badges.includes(badgeName)) {
              const newPoints = std.points + 50;
              const lvlInfo = getLevelInfo(newPoints);
              return {
                ...std,
                points: newPoints,
                level: lvlInfo.current.name,
                unlockedBadges: [...badges, badgeName]
              };
            }
          }
          return std;
        })
      );
    }
  };

  // N. IEP Support Updates
  const updateStudentIep = async (studentId, goals, accommodations, interventionPlan) => {
    if (isSupabaseConfigured() && currentUser) {
      try {
        // Update basic intervention plan in student record
        await supabase
          .from("students")
          .update({ iep_intervention_plan: interventionPlan })
          .eq("id", studentId);

        // Update IEP Goals progress in parallel
        await Promise.all(
          goals.map((g) =>
            supabase
              .from("iep_goals")
              .update({ progress_percentage: g.progress })
              .eq("id", g.id)
          )
        );

        await fetchLiveDatabaseData(currentUser);
      } catch (err) {
        console.error(err);
      }
    } else {
      setStudents((prev) =>
        prev.map((std) => {
          if (std.id === studentId) {
            return {
              ...std,
              iepGoals: goals,
              iepAccommodations: accommodations,
              iepInterventionPlan: interventionPlan
            };
          }
          return std;
        })
      );
    }
  };

  // O. Daily/Weekly IEP observations logged by tutors
  const addIepObservation = async (studentId, tutorName, text) => {
    if (isSupabaseConfigured() && currentUser) {
      try {
        await supabase.from("iep_observations").insert({
          student_id: studentId,
          tutor_id: currentUser.id,
          observation_text: text,
          logged_date: new Date().toISOString().split("T")[0]
        });
        await fetchLiveDatabaseData(currentUser);
      } catch (err) {
        console.error(err);
      }
    } else {
      const newObs = {
        id: `obs_${Date.now()}`,
        date: new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric"
        }),
        tutor: tutorName,
        text: text
      };
      setStudents((prev) =>
        prev.map((std) => {
          if (std.id === studentId) {
            return {
              ...std,
              iepTutorObservations: [newObs, ...(std.iepTutorObservations || [])]
            };
          }
          return std;
        })
      );
    }
  };

  // P. Financial Invoices
  const addInvoice = async (invoiceData) => {
    if (isSupabaseConfigured() && currentUser) {
      try {
        await supabase.from("invoices").insert({
          parent_id: currentUser.id,
          student_name: invoiceData.studentName,
          amount: parseFloat(invoiceData.amount) || 0,
          due_date: invoiceData.dueDate,
          status: "Unpaid",
          billing_period: invoiceData.billingPeriod || "Current Period",
          service_description: invoiceData.service
        });
        await fetchLiveDatabaseData(currentUser);
      } catch (err) {
        console.error(err);
      }
    } else {
      const newInvoice = {
        id: `inv_${Math.floor(1000 + Math.random() * 9000)}`,
        studentName: invoiceData.studentName,
        amount: parseFloat(invoiceData.amount) || 0,
        dueDate: invoiceData.dueDate,
        status: "Unpaid",
        billingPeriod: invoiceData.billingPeriod || "Current Period",
        service: invoiceData.service
      };
      setInvoices((prev) => [newInvoice, ...prev]);
    }
  };

  // Q. Structured System Audit Logging & Diagnostics
  const logAudit = (action, metadata = {}) => {
    const timestamp = new Date().toISOString();
    const userEmail = currentUser?.email || "anonymous-sandbox";
    const userRoleText = userRole || "Guest";
    console.log(`[AUDIT LOG] [${timestamp}] User: ${userEmail} (${userRoleText}) | Action: ${action} | Details:`, JSON.stringify(metadata));
  };

  // Admin User Registration & Onboarding Methods with Supabase Sync & Offline Sandbox Cascade
  const addTutor = async (newTutor) => {
    logAudit("create_tutor_request", { name: newTutor.name, role: newTutor.role });
    if (isSupabaseConfigured() && currentUser) {
      try {
        const tempId = crypto.randomUUID ? crypto.randomUUID() : `tut-${Math.random().toString(36).substr(2, 9)}`;
        const tutorEmail = `${newTutor.name.toLowerCase().replace(/[^a-z0-9]/g, "")}@ambience.com`;
        
        // 1. Write the public profile record
        const { error: profErr } = await supabase.from("profiles").insert({
          id: tempId,
          name: newTutor.name,
          email: tutorEmail,
          role: "Tutor",
          avatar_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200"
        });

        if (profErr) {
          if (profErr.code === "23503") {
            console.warn("[Supabase Profiles] Profile insert rejected: ID is not registered in auth.users. Proceeding to offline sandbox fallback.");
            throw profErr;
          }
          throw profErr;
        }

        // 2. Write the tutor metadata record
        const { error: tutErr } = await supabase.from("tutors").insert({
          id: tempId,
          specialty_role: newTutor.role,
          bio: newTutor.bio,
          subjects: newTutor.subjects,
          rating: 5.0,
          reviews_count: 0
        });

        if (tutErr) throw tutErr;

        logAudit("create_tutor_success_database", { id: tempId, name: newTutor.name });
        await fetchLiveDatabaseData(currentUser);
      } catch (err) {
        console.error("[Supabase Admin] Direct Tutor insert failed (foreign key reference requires auth accounts). Cascading to secure sandbox mode.", err.message);
        // Fallback to local sandbox state update
        setTutors((prev) => [
          ...prev,
          {
            id: `tut_${Date.now()}`,
            rating: 5.0,
            reviews: 0,
            image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200",
            ...newTutor
          }
        ]);
      }
    } else {
      // Offline local update
      setTutors((prev) => [
        ...prev,
        {
          id: `tut_${Date.now()}`,
          rating: 5.0,
          reviews: 0,
          image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200",
          ...newTutor
        }
      ]);
    }
  };

  const deleteTutor = async (id) => {
    logAudit("delete_tutor_request", { id });
    if (isSupabaseConfigured() && currentUser) {
      try {
        const { error } = await supabase.from("profiles").delete().eq("id", id);
        if (error) throw error;
        logAudit("delete_tutor_success_database", { id });
        await fetchLiveDatabaseData(currentUser);
      } catch (err) {
        console.error("[Supabase Admin] Error deleting tutor, running sandbox fallback:", err.message);
        setTutors((prev) => prev.filter((t) => t.id !== id));
      }
    } else {
      setTutors((prev) => prev.filter((t) => t.id !== id));
    }
  };

  const addStudent = async (newStudent) => {
    logAudit("create_student_request", { name: newStudent.name, grade: newStudent.grade });
    if (isSupabaseConfigured() && currentUser) {
      try {
        const tempId = crypto.randomUUID ? crypto.randomUUID() : `std-${Math.random().toString(36).substr(2, 9)}`;
        const studentEmail = `${newStudent.name.toLowerCase().replace(/[^a-z0-9]/g, "")}@ambience.com`;

        // 1. Write the profile record
        const { error: profErr } = await supabase.from("profiles").insert({
          id: tempId,
          name: newStudent.name,
          email: studentEmail,
          role: "Student",
          avatar_url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200"
        });

        if (profErr) {
          if (profErr.code === "23503") {
            console.warn("[Supabase Profiles] Profile insert rejected: ID is not registered in auth.users. Proceeding to offline sandbox fallback.");
            throw profErr;
          }
          throw profErr;
        }

        // Search parent profile if exists
        let parentId = null;
        const { data: parentProf } = await supabase
          .from("profiles")
          .select("id")
          .eq("email", newStudent.parentEmail)
          .maybeSingle();
        
        if (parentProf) {
          parentId = parentProf.id;
        }

        // 2. Write the student metadata record
        const { error: stdErr } = await supabase.from("students").insert({
          id: tempId,
          grade: newStudent.grade,
          parent_id: parentId,
          level: "Explorer",
          points: 0,
          streak: 1,
          completed_sessions: 0,
          overall_progress: 0,
          weekly_character_theme: "Kindness & Responsibility",
          leadership_goals: "Support my study circle partners and complete worksheets on time.",
          character_integrity: 3,
          character_responsibility: 3,
          character_kindness: 3,
          character_perseverance: 3,
          character_leadership: 3,
          unlocked_badges: ["🌱"]
        });

        if (stdErr) throw stdErr;

        logAudit("create_student_success_database", { id: tempId, name: newStudent.name });
        await fetchLiveDatabaseData(currentUser);
      } catch (err) {
        console.error("[Supabase Admin] Direct Student insert failed (foreign key reference requires auth accounts). Cascading to secure sandbox mode.", err.message);
        setStudents((prev) => [
          ...prev,
          {
            id: `std_${Date.now()}`,
            level: "Explorer",
            points: 0,
            streak: 1,
            completedSessions: 0,
            overallProgress: 0,
            subjects: [],
            exams: [],
            weeklyCharacterTheme: "Kindness & Responsibility",
            leadershipGoals: "Support my study circle partners and complete worksheets on time.",
            characterMetrics: {
              integrity: 3,
              responsibility: 3,
              kindness: 3,
              perseverance: 3,
              leadership: 3
            },
            unlockedBadges: ["Rising Star"],
            growthReflections: [],
            parentEncouragements: [],
            ...newStudent
          }
        ]);
      }
    } else {
      setStudents((prev) => [
        ...prev,
        {
          id: `std_${Date.now()}`,
          level: "Explorer",
          points: 0,
          streak: 1,
          completedSessions: 0,
          overallProgress: 0,
          subjects: [],
          exams: [],
          weeklyCharacterTheme: "Kindness & Responsibility",
          leadershipGoals: "Support my study circle partners and complete worksheets on time.",
          characterMetrics: {
            integrity: 3,
            responsibility: 3,
            kindness: 3,
            perseverance: 3,
            leadership: 3
          },
          unlockedBadges: ["Rising Star"],
          growthReflections: [],
          parentEncouragements: [],
          ...newStudent
        }
      ]);
    }
  };

  const deleteStudent = async (id) => {
    logAudit("delete_student_request", { id });
    if (isSupabaseConfigured() && currentUser) {
      try {
        const { error } = await supabase.from("profiles").delete().eq("id", id);
        if (error) throw error;
        logAudit("delete_student_success_database", { id });
        await fetchLiveDatabaseData(currentUser);
      } catch (err) {
        console.error("[Supabase Admin] Error deleting student, running sandbox fallback:", err.message);
        setStudents((prev) => prev.filter((s) => s.id !== id));
      }
    } else {
      setStudents((prev) => prev.filter((s) => s.id !== id));
    }
  };

  // Additional Operational CRUD Handlers

  // Bookings Cancellations
  const cancelBooking = async (bookingId) => {
    logAudit("cancel_booking_request", { bookingId });
    if (isSupabaseConfigured() && currentUser) {
      try {
        const { error } = await supabase
          .from("bookings")
          .update({ status: "Cancelled" })
          .eq("id", bookingId);
        if (error) throw error;
        logAudit("cancel_booking_success_database", { bookingId });
        await fetchLiveDatabaseData(currentUser);
      } catch (err) {
        console.error("[Supabase Bookings] Cancel booking failed, calling offline fallback:", err.message);
        setBookings((prev) =>
          prev.map((b) => (b.id === bookingId ? { ...b, status: "Cancelled" } : b))
        );
      }
    } else {
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: "Cancelled" } : b))
      );
    }
  };

  // Bookings Rescheduling
  const rescheduleBooking = async (bookingId, newDate, newTimeSlot) => {
    logAudit("reschedule_booking_request", { bookingId, newDate, newTimeSlot });
    if (isSupabaseConfigured() && currentUser) {
      try {
        const { error } = await supabase
          .from("bookings")
          .update({
            date: newDate,
            time_slot: newTimeSlot,
            status: "Confirmed"
          })
          .eq("id", bookingId);
        if (error) throw error;
        logAudit("reschedule_booking_success_database", { bookingId, newDate, newTimeSlot });
        await fetchLiveDatabaseData(currentUser);
      } catch (err) {
        console.error("[Supabase Bookings] Reschedule failed, calling offline fallback:", err.message);
        setBookings((prev) =>
          prev.map((b) =>
            b.id === bookingId
              ? { ...b, date: newDate, time: newTimeSlot, status: "Confirmed" }
              : b
          )
        );
      }
    } else {
      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId
            ? { ...b, date: newDate, time: newTimeSlot, status: "Confirmed" }
            : b
        )
      );
    }
  };

  // Assignments / Homework Deletion
  const deleteAssignment = async (assignmentId) => {
    logAudit("delete_assignment_request", { assignmentId });
    if (isSupabaseConfigured() && currentUser) {
      try {
        const { error } = await supabase
          .from("assignments")
          .delete()
          .eq("id", assignmentId);
        if (error) throw error;
        logAudit("delete_assignment_success_database", { assignmentId });
        await fetchLiveDatabaseData(currentUser);
      } catch (err) {
        console.error("[Supabase Homework] Delete assignment failed, calling offline fallback:", err.message);
        setAssignments((prev) => prev.filter((a) => a.id !== assignmentId));
      }
    } else {
      setAssignments((prev) => prev.filter((a) => a.id !== assignmentId));
    }
  };

  // Session Notes Deletion
  const deleteSessionNote = async (noteId) => {
    logAudit("delete_session_note_request", { noteId });
    if (isSupabaseConfigured() && currentUser) {
      try {
        const { error } = await supabase
          .from("session_notes")
          .delete()
          .eq("id", noteId);
        if (error) throw error;
        logAudit("delete_session_note_success_database", { noteId });
        await fetchLiveDatabaseData(currentUser);
      } catch (err) {
        console.error("[Supabase Notes] Delete note failed, calling offline fallback:", err.message);
        setSessionNotes((prev) => prev.filter((n) => n.id !== noteId));
      }
    } else {
      setSessionNotes((prev) => prev.filter((n) => n.id !== noteId));
    }
  };

  // Character Notes Deletion
  const deleteCharacterNote = async (noteId) => {
    logAudit("delete_character_note_request", { noteId });
    if (isSupabaseConfigured() && currentUser) {
      try {
        const { error } = await supabase
          .from("character_notes")
          .delete()
          .eq("id", noteId);
        if (error) throw error;
        logAudit("delete_character_note_success_database", { noteId });
        await fetchLiveDatabaseData(currentUser);
      } catch (err) {
        console.error("[Supabase Character] Delete note failed, calling offline fallback:", err.message);
        setCharacterNotes((prev) => prev.filter((c) => c.id !== noteId));
      }
    } else {
      setCharacterNotes((prev) => prev.filter((c) => c.id !== noteId));
    }
  };

  // IEP Goals Management (Add Goal)
  const addIepGoal = async (studentId, goalText) => {
    logAudit("add_iep_goal_request", { studentId, goalText });
    if (isSupabaseConfigured() && currentUser) {
      try {
        const { error } = await supabase
          .from("iep_goals")
          .insert({
            student_id: studentId,
            goal_text: goalText,
            progress_percentage: 0
          });
        if (error) throw error;
        logAudit("add_iep_goal_success_database", { studentId, goalText });
        await fetchLiveDatabaseData(currentUser);
      } catch (err) {
        console.error("[Supabase IEP] Add goal failed, calling offline fallback:", err.message);
        setStudents((prev) =>
          prev.map((s) => {
            if (s.id === studentId) {
              const newGoal = {
                id: `goal_${Date.now()}`,
                text: goalText,
                progress: 0
              };
              return {
                ...s,
                iepGoals: [...(s.iepGoals || []), newGoal]
              };
            }
            return s;
          })
        );
      }
    } else {
      setStudents((prev) =>
        prev.map((s) => {
          if (s.id === studentId) {
            const newGoal = {
              id: `goal_${Date.now()}`,
              text: goalText,
              progress: 0
            };
            return {
              ...s,
              iepGoals: [...(s.iepGoals || []), newGoal]
            };
          }
          return s;
        })
      );
    }
  };

  // IEP Goals Management (Delete Goal)
  const deleteIepGoal = async (studentId, goalId) => {
    logAudit("delete_iep_goal_request", { studentId, goalId });
    if (isSupabaseConfigured() && currentUser) {
      try {
        const { error } = await supabase
          .from("iep_goals")
          .delete()
          .eq("id", goalId);
        if (error) throw error;
        logAudit("delete_iep_goal_success_database", { studentId, goalId });
        await fetchLiveDatabaseData(currentUser);
      } catch (err) {
        console.error("[Supabase IEP] Delete goal failed, calling offline fallback:", err.message);
        setStudents((prev) =>
          prev.map((s) => {
            if (s.id === studentId) {
              return {
                ...s,
                iepGoals: (s.iepGoals || []).filter((g) => g.id !== goalId)
              };
            }
            return s;
          })
        );
      }
    } else {
      setStudents((prev) =>
        prev.map((s) => {
          if (s.id === studentId) {
            return {
              ...s,
              iepGoals: (s.iepGoals || []).filter((g) => g.id !== goalId)
            };
          }
          return s;
        })
      );
    }
  };

  // Phase 4: Practice Tests / AI Test Generator Helpers
  const fetchPracticeTests = async () => {
    if (isSupabaseConfigured() && currentUser) {
      try {
        const { data, error } = await supabase
          .from("practice_tests")
          .select("*")
          .order("created_at", { ascending: false });
        if (!error && data) {
          const formatted = data.map((t) => ({
            id: t.id,
            studentId: t.student_id,
            tutorId: t.tutor_id,
            title: t.title,
            subject: t.subject,
            topic: t.topic,
            gradeLevel: t.grade_level,
            difficulty: t.difficulty,
            config: t.config,
            content: t.content,
            createdAt: t.created_at,
            updatedAt: t.updated_at
          }));
          setPracticeTests(formatted);
        }
      } catch (err) {
        console.error("[Database] Error loading practice tests:", err);
      }
    } else {
      try {
        const res = await apiFetch("http://localhost:5000/api/ai/practice-tests");
        const data = await res.json();
        if (data.status === "Success" && data.practiceTests) {
          setPracticeTests(data.practiceTests);
        }
      } catch (err) {
        console.log("[Offline DB] Express server is offline; keeping local in-memory practice tests.");
      }
    }
  };

  const addPracticeTest = async (studentId, title, subject, topic, gradeLevel, difficulty, config, content) => {
    if (isSupabaseConfigured() && currentUser) {
      try {
        const { error } = await supabase.from("practice_tests").insert({
          student_id: studentId || null,
          tutor_id: currentUser.id,
          title,
          subject,
          topic,
          grade_level: gradeLevel,
          difficulty,
          config,
          content
        });
        if (error) throw error;
        await fetchLiveDatabaseData(currentUser);
        return true;
      } catch (err) {
        console.error("[Database] Error inserting practice test:", err);
        return false;
      }
    } else {
      try {
        const res = await apiFetch("http://localhost:5000/api/ai/practice-tests", {
          method: "POST",
          body: JSON.stringify({
            studentId,
            tutorId: currentUser?.id || "tut_1",
            title,
            subject,
            topic,
            gradeLevel,
            difficulty,
            config,
            content
          })
        });
        const data = await res.json();
        if (data.status === "Success") {
          await fetchPracticeTests();
          return true;
        }
      } catch (err) {
        console.error("[Offline DB] Error saving practice test via API:", err);
        const newTest = {
          id: `test_${Date.now()}`,
          studentId: studentId || null,
          tutorId: currentUser?.id || "tut_1",
          title,
          subject,
          topic,
          gradeLevel,
          difficulty,
          config,
          content,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setPracticeTests((prev) => [newTest, ...prev]);
        return true;
      }
    }
  };

  const addLessonPlan = async (studentId, title, gradeLevel, subject, topic, duration, learningObjective, difficulty, config, content) => {
    if (isSupabaseConfigured() && currentUser) {
      try {
        const { error } = await supabase.from("lesson_plans").insert({
          student_id: studentId || null,
          tutor_id: currentUser.id,
          title,
          grade_level: gradeLevel,
          subject,
          topic,
          duration,
          learning_objective: learningObjective,
          difficulty,
          config,
          content
        });
        if (error) throw error;
        await fetchLiveDatabaseData(currentUser);
        return true;
      } catch (err) {
        console.error("[Database] Error inserting lesson plan:", err);
        return false;
      }
    } else {
      // In simulation mode, add to memory
      const newLP = {
        id: `lp_${Date.now()}`,
        studentId: studentId || null,
        tutorId: currentUser?.id || "tut_1",
        title,
        gradeLevel,
        subject,
        topic,
        duration,
        learningObjective,
        difficulty,
        config,
        content,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setLessonPlans((prev) => [newLP, ...prev]);
      return true;
    }
  };

  const addIepNote = async (studentId, strengths, challenges, accommodations, goals, progressNotes, parentSummary, tutorSteps) => {
    if (isSupabaseConfigured() && currentUser) {
      try {
        const { error } = await supabase.from("iep_notes").insert({
          student_id: studentId,
          tutor_id: currentUser.id,
          strengths,
          challenges,
          accommodations,
          goals,
          progress_notes: progressNotes,
          parent_summary: parentSummary,
          tutor_steps: tutorSteps
        });
        if (error) throw error;
        await fetchLiveDatabaseData(currentUser);
        return true;
      } catch (err) {
        console.error("[Database] Error inserting IEP notes:", err);
        return false;
      }
    } else {
      // In simulation mode, add to memory
      const newIEP = {
        id: `iep_${Date.now()}`,
        studentId,
        tutorId: currentUser?.id || "tut_1",
        strengths,
        challenges,
        accommodations,
        goals,
        progressNotes,
        parentSummary,
        tutorSteps,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setIepNotes((prev) => [newIEP, ...prev]);
      return true;
    }
  };

  const addCopilotRecord = async (studentId, subject, topic, gradeLevel, sessionContext, studentChallenge, supportType, content) => {
    if (isSupabaseConfigured() && currentUser) {
      try {
        const { error } = await supabase.from("copilot_records").insert({
          student_id: studentId || null,
          tutor_id: currentUser.id,
          subject,
          topic,
          grade_level: gradeLevel,
          session_context: sessionContext || "",
          student_challenge: studentChallenge || "",
          support_type: supportType || "",
          content
        });
        if (error) throw error;
        await fetchLiveDatabaseData(currentUser);
        return true;
      } catch (err) {
        console.error("[Database] Error inserting copilot record:", err);
        return false;
      }
    } else {
      // In simulation mode, add to memory
      const newRec = {
        id: `cop_${Date.now()}`,
        studentId: studentId || null,
        tutorId: currentUser?.id || "tut_1",
        subject,
        topic,
        gradeLevel,
        sessionContext: sessionContext || "",
        studentChallenge: studentChallenge || "",
        supportType: supportType || "",
        content,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setCopilotRecords((prev) => [newRec, ...prev]);
      return true;
    }
  };

  const addParentCopilotRecord = async (studentId, subject, topic, currentAssignment, parentConcern, supportType, content) => {
    if (isSupabaseConfigured() && currentUser) {
      try {
        const { error } = await supabase.from("parent_copilot_records").insert({
          student_id: studentId || null,
          parent_id: currentUser.id,
          subject,
          topic,
          current_assignment: currentAssignment || "",
          parent_concern: parentConcern || "",
          support_type: supportType || "",
          content
        });
        if (error) throw error;
        await fetchLiveDatabaseData(currentUser);
        return true;
      } catch (err) {
        console.error("[Database] Error inserting parent copilot record:", err);
        return false;
      }
    } else {
      // In simulation mode, add to memory
      const newRec = {
        id: `pcop_${Date.now()}`,
        studentId: studentId || null,
        parentId: currentUser?.id || "par_1",
        subject,
        topic,
        currentAssignment: currentAssignment || "",
        parentConcern: parentConcern || "",
        supportType: supportType || "",
        content,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setParentCopilotRecords((prev) => [newRec, ...prev]);
      return true;
    }
  };


  const apiFetch = async (url, options = {}) => {
    const headers = { ...(options.headers || {}) };
    
    let token = null;
    if (isSupabaseConfigured()) {
      try {
        const { data: { session: freshSession } } = await supabase.auth.getSession();
        if (freshSession?.access_token) {
          token = freshSession.access_token;
        }
      } catch (err) {
        console.warn("[Auth] Failed to refresh session dynamically, falling back to local state token.");
      }
    }

    if (!token && session?.access_token) {
      token = session.access_token;
    }
    
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    } else {
      headers["Authorization"] = `Bearer sim_token_${userRole}_${currentUser?.id || "tut_1"}_${currentUser?.email || "sandbox@ambience.com"}`;
    }
    
    if (!headers["Content-Type"] && !(options.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }

    return fetch(url, {
      ...options,
      headers
    });
  };

  return (
    <AppContext.Provider
      value={{
        apiFetch,
        currentPage,
        setCurrentPage,
        userRole,
        setUserRole,
        isLoggedIn,
        setIsLoggedIn,
        tutors,
        students,
        assignments,
        messages,
        invoices,
        sessionNotes,
        bookings,
        setBookings,
         characterNotes,
        practiceTests,
        fetchPracticeTests,
        addPracticeTest,
        lessonPlans,
        addLessonPlan,
        iepNotes,
        addIepNote,
        copilotRecords,
        addCopilotRecord,
        parentCopilotRecords,
        addParentCopilotRecord,
        tutorZoomStatus,
        setTutorZoomStatus,
        tutorManualZoomLink,
        setTutorManualZoomLink,
        CHARACTER_BADGES,
        getLevelInfo,
        bookSession,
        completeAssignment,
        awardPoints,
        checkInDaily,
        payInvoice,
        sendMessage,
        addSessionNote,
        addAssignment,
        addStudentReflection,
        addParentEncouragement,
        addTutorCharacterNote,
        updateCharacterGoals,
        awardBadge,
        updateStudentIep,
        addIepObservation,
        addInvoice,
        addTutor,
        deleteTutor,
        addStudent,
        deleteStudent,
        cancelBooking,
        rescheduleBooking,
        deleteAssignment,
        deleteSessionNote,
        deleteCharacterNote,
        addIepGoal,
        deleteIepGoal,
        logAudit,
        // Supabase Authenticators
        signUpUser,
        signInUser,
        signOutUser,
        resetUserPassword,
        updateUserPassword,
        currentUser,
        session,
        currentProfile,
        setCurrentProfile,
        isLoading,
        setIsLoading,
        authError,
        setAuthError
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
