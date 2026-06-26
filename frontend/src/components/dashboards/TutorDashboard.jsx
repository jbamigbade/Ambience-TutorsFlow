import React, { useContext, useState, useEffect } from "react";
import { AppContext } from "../../context/AppContext";
import {
  Calendar,
  Users,
  MessageSquare,
  BookOpen,
  CheckCircle,
  PlusCircle,
  TrendingUp,
  Award,
  Send,
  Plus,
  ShieldCheck,
  DollarSign,
  Sliders,
  Edit,
  Save,
  UserCheck,
  FileText,
  X,
  Clock,
  Video,
  MapPin,
  Mail,
  PlusSquare,
  Check,
  Trash2,
  UserPlus,
  Download,
  Printer,
  Heart,
  Lock
} from "lucide-react";

export default function TutorDashboard() {
  const {
    students,
    bookings,
    setBookings,
    assignments,
    messages,
    sessionNotes,
    characterNotes,
    sendMessage,
    addSessionNote,
    addAssignment,
    addTutorCharacterNote,
    awardBadge,
    CHARACTER_BADGES,
    updateStudentIep,
    addIepObservation,
    addInvoice,
    invoices,
    payInvoice,
    completeAssignment,
    tutorZoomStatus,
    setTutorZoomStatus,
    tutorManualZoomLink,
    setTutorManualZoomLink,
    apiFetch
  } = useContext(AppContext);

  // Sub-Navigation Tabs
  // Tabs: Schedule, Students, Homework, Notes, Reports, Revenue, Chat, Profile
  const [activeSubTab, setActiveSubTab] = useState("Schedule");
  const [selectedStudentId, setSelectedStudentId] = useState("std_1"); // Caleb default

  // ----------------------------------------------------
  // 1. TUTOR PROFILE & SETTINGS STATES
  // ----------------------------------------------------
  const tutorName = "Mrs. Sarah Jenkins";
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "Mrs. Sarah Jenkins",
    role: "K-12 Reading & IEP Consultant",
    hourlyRate: "65",
    rating: "5.0 (98 reviews)",
    weeklyHours: "12.5",
    bio: "M.Ed. in Special Education. Passionate about empowering neurodivergent children and formulating custom learning strategies. Grounded in corporate-grade academic coaching and dedicated to encouraging virtuous growth in young minds.",
    subjects: ["Reading", "Writing", "IEP Support", "Study Skills", "Character Education"],
    status: "Active & Accepting Students",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200",
    certifications: ["State Board Special Ed Credential", "Phonics Master Facilitator", "ADHD Executive Support Certified"]
  });

  const [weeklyAvailability, setWeeklyAvailability] = useState({
    Monday: ["3:00 PM - 4:30 PM", "5:00 PM - 6:30 PM"],
    Tuesday: ["2:00 PM - 3:30 PM", "4:00 PM - 5:30 PM"],
    Wednesday: ["3:00 PM - 4:30 PM", "5:00 PM - 6:30 PM"],
    Thursday: ["2:00 PM - 3:30 PM", "4:00 PM - 5:30 PM"],
    Friday: ["1:00 PM - 2:30 PM", "3:00 PM - 4:30 PM"]
  });
  const [availabilityTimezone, setAvailabilityTimezone] = useState("America/New_York (EST)");
  const [availabilitySuccess, setAvailabilitySuccess] = useState("");

  // Fetch Saved Availability on mount
  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const response = await apiFetch("http://localhost:5000/api/tutors/availability/tut_1");
        if (response.ok) {
          const data = await response.json();
          if (data.availability && Object.keys(data.availability).length > 0) {
            setWeeklyAvailability(data.availability);
          }
        }
      } catch (err) {
        console.warn("[Database] Offline. Using mock tutor weekly availability.", err);
      }
    };
    fetchAvailability();
  }, []);

  const handleSaveAvailability = async (e) => {
    e.preventDefault();
    try {
      const response = await apiFetch("http://localhost:5000/api/tutors/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tutorId: "tut_1",
          availability: weeklyAvailability
        })
      });
      if (response.ok) {
        setAvailabilitySuccess("Preferred weekly availability saved to database successfully!");
      } else {
        throw new Error("Backend save failed");
      }
    } catch (err) {
      console.warn("[Database] Offline, saved weekly availability locally.", err);
      setAvailabilitySuccess("Preferred weekly availability saved locally (Offline mode)!");
    }
    setTimeout(() => setAvailabilitySuccess(""), 3500);
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setIsEditingProfile(false);
  };

  // Reschedule & Cancellation overlay states
  const [reschedulingSession, setReschedulingSession] = useState(null); // booking object
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("3:00 PM - 4:30 PM");
  const [rescheduleError, setRescheduleError] = useState("");
  const [rescheduleSuccess, setRescheduleSuccess] = useState("");

  const [cancellingSession, setCancellingSession] = useState(null); // booking object
  const [cancelReason, setCancelReason] = useState("");
  const [cancelError, setCancelError] = useState("");
  const [cancelSuccess, setCancelSuccess] = useState("");

  // ----------------------------------------------------
  // 2. DAILY SCHEDULE & LIVE CLASSROOM STATES
  // ----------------------------------------------------
  const [todaySessionStatus, setTodaySessionStatus] = useState({
    "bk_1": "Pending" // Pending, In Progress, Completed, No Show
  });
  const [showLiveRoom, setShowLiveRoom] = useState(false);
  const [liveMinutesLeft, setLiveMinutesLeft] = useState(60);
  const [classroomChat, setClassroomChat] = useState([
    { sender: "System", text: "Classroom generated successfully. Connection stable." },
    { sender: "Mrs. Sarah Jenkins", text: "Welcome back Caleb! Let's get started on our proofs review today." },
    { sender: "Caleb Sterling", text: "Hi Mrs. Jenkins, I have my formula sheets ready." }
  ]);
  const [classroomChatInput, setClassroomChatInput] = useState("");
  const [currentLessonSlide, setCurrentLessonSlide] = useState(1);
  const totalLessonSlides = 4;
  const lessonSlidesContent = {
    1: {
      title: "Trigonometric Identities - Core Focus",
      text: "Review the reciprocal and quotient identities. Recall that: \n\n• csc(θ) = 1 / sin(theta)\n• sec(θ) = 1 / cos(theta)\n• cot(θ) = 1 / tan(theta)",
      diagram: "📐 Reference Triangle: x-y coordinate plane mapping angle theta."
    },
    2: {
      title: "Double Angle Formulas",
      text: "Master these fundamental formulas for our worksheet proofs: \n\n• sin(2θ) = 2 sin(theta)cos(theta)\n• cos(2θ) = cos²(theta) - sin²(theta)\n• cos(2θ) = 2cos²(theta) - 1",
      diagram: "🛡️ Master proof structures to decrease performance anxiety!"
    },
    3: {
      title: "Interactive Proof Checklist",
      text: "When proving identities, apply these steps: \n\n1. Express all functions in terms of sines and cosines.\n2. Work on the more complex side first.\n3. Look for common denominators.",
      diagram: "🧩 Step-by-step scaffolding reduces math blocks!"
    },
    4: {
      title: "Lesson Achievements",
      text: "Caleb showed exceptional responsibility and focus during today's proof review. \n\n• Comprehension level: ⭐⭐⭐⭐⭐\n• Performance: Excellent under extension guidelines.",
      diagram: "🏆 Soli Deo Gloria - Glory to God alone!"
    }
  };

  // Timer simulation
  useEffect(() => {
    let timer;
    if (showLiveRoom && liveMinutesLeft > 0) {
      timer = setInterval(() => {
        setLiveMinutesLeft(prev => prev - 1);
      }, 60000); // decrement simulated minute
    }
    return () => clearInterval(timer);
  }, [showLiveRoom, liveMinutesLeft]);

  const handleLaunchClassroom = (bk) => {
    setLiveMinutesLeft(60);
    setShowLiveRoom(true);
    setTodaySessionStatus(prev => ({ ...prev, [bk.id]: "In Progress" }));
    if (bk.zoomStartUrl) {
      window.open(bk.zoomStartUrl, "_blank");
    }
  };

  const handleSendClassroomChat = (e) => {
    e.preventDefault();
    if (!classroomChatInput.trim()) return;
    setClassroomChat(prev => [...prev, { sender: "Mrs. Sarah Jenkins", text: classroomChatInput.trim() }]);
    setClassroomChatInput("");
  };

  const handleCompleteClassroomSession = (bkId) => {
    setShowLiveRoom(false);
    setTodaySessionStatus(prev => ({ ...prev, [bkId]: "Completed" }));
    // Automatically switch to Notes tab so tutor can record summary notes!
    setActiveSubTab("Notes");
    setNoteSubject("Pre-Calculus");
  };

  // Ad-hoc Session Booking
  const [adhocStudent, setAdhocStudent] = useState("std_1");
  const [adhocSubject, setAdhocSubject] = useState("Pre-Calculus");
  const [adhocDate, setAdhocDate] = useState("");
  const [adhocTime, setAdhocTime] = useState("4:00 PM - 5:00 PM");
  const [adhocSuccess, setAdhocSuccess] = useState("");

  const handleBookAdhoc = async (e) => {
    e.preventDefault();
    if (!adhocDate) return;
    
    const targetStudent = allStudents.find(s => s.id === adhocStudent);

    // Create Zoom Links
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
            topic: `${adhocSubject} Session with Mrs. Sarah Jenkins`,
            startTime: `${adhocDate}T16:00:00`,
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

    const newBooking = {
      id: `bk_${Date.now()}`,
      studentName: targetStudent ? targetStudent.name : "Caleb Sterling",
      tutorName: tutorName,
      subject: adhocSubject,
      date: adhocDate,
      time: adhocTime,
      status: "Confirmed",
      zoomJoinUrl,
      zoomStartUrl,
      zoomMeetingId
    };

    // Push into context bookings
    setBookings(prev => [newBooking, ...prev]);
    
    // Auto-create invoice
    addInvoice({
      studentName: targetStudent ? targetStudent.name : "Caleb Sterling",
      amount: "75.00",
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      billingPeriod: "Ad-hoc Booking Fee",
      service: `${adhocSubject} Session Booking with ${tutorName}`
    });

    setAdhocSuccess("Ad-hoc session booked & Zoom classroom generated successfully!");
    setAdhocDate("");
    setTimeout(() => setAdhocSuccess(""), 3500);
  };

  // ----------------------------------------------------
  // 3. MULTI-STUDENT & IEP STATES
  // ----------------------------------------------------
  const [localStudents, setLocalStudents] = useState([
    {
      id: "std_2",
      name: "Hannah Vance",
      grade: "9th Grade",
      parentName: "Thomas Vance",
      parentEmail: "thomas@vance.com",
      level: "Explorer",
      points: 120,
      streak: 3,
      completedSessions: 4,
      overallProgress: 65,
      subjects: [
        { name: "Reading", progress: 72, grade: "B-" },
        { name: "Writing", progress: 68, grade: "C+" }
      ],
      exams: [
        { id: "ex_3", name: "Grade 9 Reading Assessment", date: "July 5, 2026", status: "Upcoming" }
      ],
      weeklyCharacterTheme: "Kindness & Gratitude",
      leadershipGoals: "Help clean up study material and thank parent/instructor after sessions.",
      characterMetrics: {
        integrity: 4,
        responsibility: 3,
        kindness: 5,
        perseverance: 3,
        leadership: 3
      },
      unlockedBadges: ["Rising Star"],
      growthReflections: [
        { id: "refl_2", date: "June 20, 2026", theme: "Kindness", text: "I shared my study templates with a classmate who was struggling." }
      ],
      parentEncouragements: [
        { id: "enc_2", date: "June 21, 2026", author: "Thomas Vance", text: "Proud of your reading focus, Hannah! We love seeing you happy." }
      ],
      iepGoals: [
        { id: "iep_g4", text: "Build phonics comprehension and visual vocabulary templates.", progress: 55 }
      ],
      iepAccommodations: [
        "Visual flashcards",
        "Frequent positive feedback loops"
      ],
      iepInterventionPlan: "Focus on visual reading aids and vocabulary templates to ease performance stress.",
      iepTutorObservations: [
        { id: "obs_3", date: "June 21, 2026", tutor: "Mrs. Sarah Jenkins", text: "Hannah made great strides with flashcards today. Her response rate was excellent." }
      ]
    },
    {
      id: "std_3",
      name: "Samuel Mercer",
      grade: "12th Grade",
      parentName: "Rebecca Mercer",
      parentEmail: "rebecca@mercer.com",
      level: "Scholar",
      points: 620,
      streak: 11,
      completedSessions: 32,
      overallProgress: 91,
      subjects: [
        { name: "SAT Prep Math", progress: 94, grade: "A" },
        { name: "Reading & Writing", progress: 89, grade: "A-" }
      ],
      exams: [
        { id: "ex_4", name: "Official SAT Examination", date: "July 12, 2026", status: "Upcoming" }
      ],
      weeklyCharacterTheme: "Perseverance & Respect",
      leadershipGoals: "Aim for a perfect 1600 SAT score and treat all study reviews with active interest.",
      characterMetrics: {
        integrity: 5,
        responsibility: 5,
        kindness: 4,
        perseverance: 5,
        leadership: 4
      },
      unlockedBadges: ["Rising Star", "Perseverance Champion", "Problem Solver"],
      growthReflections: [
        { id: "refl_3", date: "June 19, 2026", theme: "Perseverance", text: "Maintained a strict daily 45-minute SAT prep calendar without breaking my streak." }
      ],
      parentEncouragements: [
        { id: "enc_3", date: "June 20, 2026", author: "Rebecca Mercer", text: "Your discipline is inspiring, Sam! We're behind you all the way." }
      ],
      iepGoals: [
        { id: "iep_g5", text: "Reduce test-day performance anxiety on SAT math practice sets.", progress: 85 }
      ],
      iepAccommodations: [
        "Extended time for full-length diagnostics",
        "Comfortable, low-noise environment"
      ],
      iepInterventionPlan: "Scaffold advanced algebra equations, implement mock exam routines, and build breathing-breaks habits.",
      iepTutorObservations: [
        { id: "obs_4", date: "June 20, 2026", tutor: "Benjamin Mercer", text: "Samuel was highly focused during the timed algebra practice sets today." }
      ]
    }
  ]);

  // Combine central students state + local ones
  const allStudents = [
    ...students, // Caleb from AppContext
    ...localStudents
  ];

  const activeStudent = allStudents.find((s) => s.id === selectedStudentId);

  // IEP Support Manager States
  const [iepInterventionPlanEdit, setIepInterventionPlanEdit] = useState("");
  const [newAccommodation, setNewAccommodation] = useState("");
  const [iepObsText, setIepObsText] = useState("");
  const [iepObsSubmitted, setIepObsSubmitted] = useState(false);
  const [iepSuccessMessage, setIepSuccessMessage] = useState("");
  const [iepGoalsProgress, setIepGoalsProgress] = useState({});

  // Sync IEP States when student selection changes
  useEffect(() => {
    if (activeStudent) {
      setIepInterventionPlanEdit(activeStudent.iepInterventionPlan || "");
      const progressMap = {};
      activeStudent.iepGoals?.forEach((goal) => {
        progressMap[goal.id] = goal.progress;
      });
      setIepGoalsProgress(progressMap);
    }
  }, [selectedStudentId]);

  // IEP Handlers supporting context or local states
  const handleAddAccommodation = (e) => {
    e.preventDefault();
    if (!newAccommodation.trim() || !activeStudent) return;
    
    const updatedAccs = [...(activeStudent.iepAccommodations || []), newAccommodation.trim()];
    
    if (activeStudent.id === "std_1") {
      updateStudentIep(activeStudent.id, activeStudent.iepGoals, updatedAccs, activeStudent.iepInterventionPlan);
    } else {
      setLocalStudents(prev => prev.map(s => s.id === activeStudent.id ? { ...s, iepAccommodations: updatedAccs } : s));
    }
    
    setNewAccommodation("");
    setIepSuccessMessage("Added accommodation successfully!");
    setTimeout(() => setIepSuccessMessage(""), 3000);
  };

  const handleRemoveAccommodation = (accToRemove) => {
    if (!activeStudent) return;
    const updatedAccs = (activeStudent.iepAccommodations || []).filter(acc => acc !== accToRemove);
    
    if (activeStudent.id === "std_1") {
      updateStudentIep(activeStudent.id, activeStudent.iepGoals, updatedAccs, activeStudent.iepInterventionPlan);
    } else {
      setLocalStudents(prev => prev.map(s => s.id === activeStudent.id ? { ...s, iepAccommodations: updatedAccs } : s));
    }
  };

  const handleUpdateGoalProgress = (goalId, newProgress) => {
    setIepGoalsProgress((prev) => ({
      ...prev,
      [goalId]: parseInt(newProgress)
    }));
  };

  const handleSaveIepChanges = (e) => {
    e.preventDefault();
    if (!activeStudent) return;

    const updatedGoals = activeStudent.iepGoals?.map((goal) => ({
      ...goal,
      progress: iepGoalsProgress[goal.id] !== undefined ? iepGoalsProgress[goal.id] : goal.progress
    })) || [];

    if (activeStudent.id === "std_1") {
      updateStudentIep(activeStudent.id, updatedGoals, activeStudent.iepAccommodations, iepInterventionPlanEdit);
    } else {
      setLocalStudents(prev => prev.map(s => s.id === activeStudent.id ? { ...s, iepGoals: updatedGoals, iepInterventionPlan: iepInterventionPlanEdit } : s));
    }

    setIepSuccessMessage("IEP goals & intervention plan updated!");
    setTimeout(() => setIepSuccessMessage(""), 3500);
  };

  const handleSaveIepObservation = (e) => {
    e.preventDefault();
    if (!iepObsText.trim() || !activeStudent) return;

    if (activeStudent.id === "std_1") {
      addIepObservation(activeStudent.id, tutorName, iepObsText.trim());
    } else {
      const newObs = {
        id: `obs_${Date.now()}`,
        date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
        tutor: tutorName,
        text: iepObsText.trim()
      };
      setLocalStudents(prev => prev.map(s => s.id === activeStudent.id ? { ...s, iepTutorObservations: [newObs, ...(s.iepTutorObservations || [])] } : s));
    }

    setIepObsText("");
    setIepObsSubmitted(true);
    setTimeout(() => setIepObsSubmitted(false), 3000);
  };

  // ----------------------------------------------------
  // 4. INVITE PARENT & STUDENT STATES
  // ----------------------------------------------------
  const [inviteData, setInviteData] = useState({
    studentName: "",
    grade: "9th Grade",
    parentName: "",
    parentEmail: "",
    coursePackage: "K-12 Reading Block (10 Sessions)",
    rate: "65"
  });
  const [pendingInvites, setPendingInvites] = useState([
    {
      id: "inv_p1",
      studentName: "Lucas Thompson",
      grade: "5th Grade",
      parentName: "Arthur Thompson",
      parentEmail: "arthur@thompson.com",
      coursePackage: "Executive Functioning Pack (5 Sessions)",
      rate: "70",
      dateSent: "June 24, 2026",
      status: "Pending Registration"
    }
  ]);
  const [inviteSuccess, setInviteSuccess] = useState("");

  const handleSendInvite = (e) => {
    e.preventDefault();
    if (!inviteData.studentName || !inviteData.parentEmail) return;

    const newInvite = {
      id: `inv_${Date.now()}`,
      studentName: inviteData.studentName,
      grade: inviteData.grade,
      parentName: inviteData.parentName,
      parentEmail: inviteData.parentEmail,
      coursePackage: inviteData.coursePackage,
      rate: inviteData.rate,
      dateSent: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
      status: "Pending Registration"
    };

    setPendingInvites(prev => [newInvite, ...prev]);
    setInviteSuccess(`Invitation successfully transmitted to ${inviteData.parentEmail}!`);
    
    setInviteData({
      studentName: "",
      grade: "9th Grade",
      parentName: "",
      parentEmail: "",
      coursePackage: "K-12 Reading Block (10 Sessions)",
      rate: "65"
    });
    setTimeout(() => setInviteSuccess(""), 4000);
  };

  const handleWithdrawInvite = (id) => {
    setPendingInvites(prev => prev.filter(inv => inv.id !== id));
  };

  // ----------------------------------------------------
  // 5. ASSIGNMENTS STATES
  // ----------------------------------------------------
  const [asgTitle, setAsgTitle] = useState("");
  const [asgSubject, setAsgSubject] = useState("Pre-Calculus");
  const [asgDueDate, setAsgDueDate] = useState("");
  const [asgPoints, setAsgPoints] = useState("40");
  const [asgDesc, setAsgDesc] = useState("");
  const [asgSubmitted, setAsgSubmitted] = useState(false);

  const handleCreateAssignment = (e) => {
    e.preventDefault();
    if (!asgTitle || !asgDesc) return;

    addAssignment(
      selectedStudentId,
      asgTitle,
      asgSubject,
      asgDueDate || "June 30, 2026",
      asgPoints,
      asgDesc
    );

    setAsgTitle("");
    setAsgDesc("");
    setAsgSubmitted(true);
    setTimeout(() => setAsgSubmitted(false), 3000);
  };

  // Toggle completion of assignments inside the dashboard
  const handleToggleAssignmentStatus = (id) => {
    // In our mock DB, we can manually change the status or invoke the context completion
    const asg = assignments.find(a => a.id === id);
    if (asg && asg.status !== "Completed") {
      // Use central trigger that credits points
      assignments.forEach(a => {
        if (a.id === id) {
          a.status = "Completed";
          // award caleb points
          if (a.studentId === "std_1") {
            completeAssignment(id);
          }
        }
      });
      // Force component re-render
      setLocalStudents(prev => [...prev]);
    }
  };

  const handleDeleteAssignmentStatus = (id) => {
    const idx = assignments.findIndex(a => a.id === id);
    if (idx > -1) {
      assignments.splice(idx, 1);
      setLocalStudents(prev => [...prev]);
    }
  };

  // ----------------------------------------------------
  // 6. SESSION NOTES (ACADEMIC & CHARACTER) STATES
  // ----------------------------------------------------
  const [notesSubTab, setNotesSubTab] = useState("Academic");
  const [noteSubject, setNoteSubject] = useState("Pre-Calculus");
  const [noteSummary, setNoteSummary] = useState("");
  const [noteNextSteps, setNoteNextSteps] = useState("");
  const [noteSubmitted, setNoteSummarySubmitted] = useState(false);

  const [charTheme, setCharTheme] = useState("Responsibility");
  const [charResponse, setCharResponse] = useState("");
  const [charStrength, setCharStrength] = useState("Integrity");
  const [charGrowth, setCharGrowth] = useState("");
  const [charRecommendation, setCharRecommendation] = useState("");
  const [charSubmitted, setCharSubmitted] = useState(false);

  const [selectedBadge, setSelectedBadge] = useState("Rising Star");
  const [badgeSuccessMessage, setBadgeSuccessMessage] = useState("");

  const handleSaveNotes = (e) => {
    e.preventDefault();
    if (!noteSummary || !activeStudent) return;

    if (activeStudent.id === "std_1") {
      addSessionNote(
        selectedStudentId,
        tutorName,
        noteSubject,
        noteSummary,
        noteNextSteps
      );
    } else {
      const newNote = {
        id: `note_${Date.now()}`,
        studentId: selectedStudentId,
        studentName: activeStudent.name,
        tutorName,
        date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
        subject: noteSubject,
        summary: noteSummary,
        nextSteps: noteNextSteps
      };
      sessionNotes.unshift(newNote); // prepend
      // update progress local
      setLocalStudents(prev => prev.map(s => s.id === selectedStudentId ? { ...s, overallProgress: Math.min(s.overallProgress + 4, 100) } : s));
    }

    setNoteSummary("");
    setNoteNextSteps("");
    setNoteSummarySubmitted(true);
    setTimeout(() => setNoteSummarySubmitted(false), 3000);
  };

  const handleSaveCharacterNotes = (e) => {
    e.preventDefault();
    if (!charResponse || !charGrowth || !charRecommendation || !activeStudent) return;

    if (activeStudent.id === "std_1") {
      addTutorCharacterNote(
        selectedStudentId,
        tutorName,
        charTheme,
        charResponse,
        charStrength,
        charGrowth,
        charRecommendation
      );
    } else {
      const newCharNote = {
        id: `c_note_${Date.now()}`,
        studentId: selectedStudentId,
        tutorName,
        date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
        theme: charTheme,
        studentResponse: charResponse,
        strengthObserved: charStrength,
        areaForGrowth: charGrowth,
        recommendation: charRecommendation
      };
      characterNotes.unshift(newCharNote);

      // update points and metrics locally
      setLocalStudents(prev => prev.map(s => {
        if (s.id === selectedStudentId) {
          const metrics = { ...s.characterMetrics };
          const strengthKey = charStrength.toLowerCase().replace(" ", "_");
          if (metrics[strengthKey] !== undefined) {
            metrics[strengthKey] = Math.min(metrics[strengthKey] + 1, 5);
          }
          return {
            ...s,
            points: s.points + 10,
            characterMetrics: metrics
          };
        }
        return s;
      }));
    }

    setCharResponse("");
    setCharGrowth("");
    setCharRecommendation("");
    setCharSubmitted(true);
    setTimeout(() => setCharSubmitted(false), 3000);
  };

  const handleAwardBadgeSubmit = (e) => {
    e.preventDefault();
    if (!activeStudent) return;
    
    if (activeStudent.id === "std_1") {
      awardBadge(selectedStudentId, selectedBadge);
    } else {
      setLocalStudents(prev => prev.map(s => {
        if (s.id === selectedStudentId) {
          const badges = s.unlockedBadges || [];
          if (!badges.includes(selectedBadge)) {
            return {
              ...s,
              points: s.points + 50,
              unlockedBadges: [...badges, selectedBadge]
            };
          }
        }
        return s;
      }));
    }
    
    setBadgeSuccessMessage(`Successfully awarded "${selectedBadge}" badge to ${activeStudent.name}! +50 XP Credited.`);
    setTimeout(() => setBadgeSuccessMessage(""), 3500);
  };

  // ----------------------------------------------------
  // 7. PROGRESS REPORTS STATES
  // ----------------------------------------------------
  const [reportType, setReportType] = useState("Monthly Progress Review");
  const [reportPeriod, setReportPeriod] = useState("June 1 - June 30, 2026");
  const [reportAcademicEval, setReportAcademicEval] = useState("");
  const [reportCharacterEval, setReportCharacterEval] = useState("");
  const [reportScores, setReportAcademicScores] = useState({
    Focus: "4",
    Participation: "4",
    Responsibility: "5",
    Perseverance: "4",
    Comprehension: "4"
  });
  const [reportSuccess, setReportSuccess] = useState("");
  const [selectedViewReport, setSelectedViewReport] = useState(null);

  const [generatedReports, setGeneratedReports] = useState([
    {
      id: "rep_1",
      studentId: "std_1",
      studentName: "Caleb Sterling",
      type: "Monthly Progress Review",
      period: "May 1 - May 31, 2026",
      date: "June 1, 2026",
      tutor: "Mrs. Sarah Jenkins",
      academicEval: "Caleb has shown excellent performance in algebraic equations and trig identities. His attention to detail has significantly improved.",
      characterEval: "Exceptional responsibility displayed during self-directed homework hours. Showing great perseverance.",
      scores: {
        Focus: 4,
        Participation: 4,
        Responsibility: 5,
        Perseverance: 4,
        Comprehension: 5
      }
    }
  ]);

  const handleCreateReport = (e) => {
    e.preventDefault();
    if (!reportAcademicEval || !reportCharacterEval || !activeStudent) return;

    const newReport = {
      id: `rep_${Date.now()}`,
      studentId: selectedStudentId,
      studentName: activeStudent.name,
      type: reportType,
      period: reportPeriod,
      date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
      tutor: tutorName,
      academicEval: reportAcademicEval,
      characterEval: reportCharacterEval,
      scores: {
        Focus: parseInt(reportScores.Focus),
        Participation: parseInt(reportScores.Participation),
        Responsibility: parseInt(reportScores.Responsibility),
        Perseverance: parseInt(reportScores.Perseverance),
        Comprehension: parseInt(reportScores.Comprehension)
      }
    };

    setGeneratedReports(prev => [newReport, ...prev]);
    setReportAcademicEval("");
    setReportCharacterEval("");
    setReportSuccess("Progress Report compiled and stored successfully!");
    setTimeout(() => setReportSuccess(""), 3500);
  };

  const handleScoreChange = (competency, val) => {
    setReportAcademicScores(prev => ({ ...prev, [competency]: val }));
  };

  const handleEmailParentReport = (rep) => {
    alert(`Success: Report card emailed securely to ${activeStudent ? activeStudent.parentEmail : 'parent'}. Directly linked to Parent Portal!`);
  };

  // ----------------------------------------------------
  // 8. REVENUE & BILLING STATES
  // ----------------------------------------------------
  const [invoiceStudent, setInvoiceStudent] = useState("Caleb Sterling");
  const [invoiceService, setInvoiceService] = useState("SAT Prep Core Block (10 Sessions)");
  const [invoiceAmount, setInvoiceAmount] = useState("600");
  const [invoiceDueDate, setInvoiceDueDate] = useState("2026-07-10");
  const [invoiceBillingPeriod, setInvoiceBillingPeriod] = useState("July 1 - July 31, 2026");
  const [invoiceSuccessMessage, setInvoiceSuccessMessage] = useState("");

  const [revenueStats, setRevenueStats] = useState({
    grossRevenue: 375.00,
    commissionCollected: 75.00,
    tutorEarningsPayout: 300.00,
    transactions: [],
    invoices: []
  });
  const [loadingRevenue, setLoadingRevenue] = useState(true);

  const fetchTutorRevenue = async () => {
    try {
      const response = await apiFetch("http://localhost:5000/api/payments/dashboard-stats?role=Tutor&tutorId=tut_1");
      if (response.ok) {
        const data = await response.json();
        setRevenueStats(data);
      } else {
        throw new Error("API response error");
      }
    } catch (err) {
      console.warn("[Tutor Revenue Ledger] Offline fallback triggered. Simulating local states.", err);
      // Construct dynamic stats from local invoices context if API is offline
      const paidInvoices = invoices.filter(inv => inv.status === "Paid" && (inv.studentName === "Caleb Sterling" || inv.studentName === "Hannah Vance"));
      const totalGross = paidInvoices.reduce((sum, inv) => sum + inv.amount, 0);
      const totalComm = parseFloat((totalGross * 0.20).toFixed(2));
      const totalNet = parseFloat((totalGross - totalComm).toFixed(2));
      
      setRevenueStats({
        grossRevenue: totalGross || 375.00,
        commissionCollected: totalComm || 75.00,
        tutorEarningsPayout: totalNet || 300.00,
        transactions: [
          {
            id: "pay_1",
            studentName: "Caleb Sterling",
            subject: "Pre-Calculus Tutoring Block",
            date: "2026-06-15",
            timeSlot: "4:00 PM - 5:00 PM",
            amount: 150.00,
            commissionPercent: 20,
            commissionAmount: 30.00,
            tutorEarnings: 120.00,
            provider: "STRIPE",
            status: "Paid"
          },
          {
            id: "pay_2",
            studentName: "Caleb Sterling",
            subject: "Reading Remediation Block",
            date: "2026-06-20",
            timeSlot: "5:15 PM - 6:15 PM",
            amount: 75.00,
            commissionPercent: 20,
            commissionAmount: 15.00,
            tutorEarnings: 60.00,
            provider: "PAYPAL",
            status: "Paid"
          }
        ],
        invoices: invoices
      });
    } finally {
      setLoadingRevenue(false);
    }
  };

  useEffect(() => {
    fetchTutorRevenue();
  }, [invoices]);

  const handleCreateInvoiceSubmit = async (e) => {
    e.preventDefault();
    if (!invoiceService || !invoiceAmount) return;

    const invoicePayload = {
      studentName: invoiceStudent,
      amount: parseFloat(invoiceAmount) || 0,
      dueDate: invoiceDueDate,
      billingPeriod: invoiceBillingPeriod,
      service: invoiceService
    };

    // 1. Sync to backend API
    try {
      const response = await apiFetch("http://localhost:5000/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invoicePayload)
      });
      if (!response.ok) {
        throw new Error("Backend save failed");
      }
    } catch (err) {
      console.warn("[Invoice Sync] Offline mode. Mapped locally inside context.", err);
    }

    // 2. Call context addInvoice so frontend is updated
    addInvoice(invoicePayload);

    setInvoiceSuccessMessage("Invoice generated! Real-time sync posted bill directly to Parent Portal.");
    setInvoiceService("SAT Prep Core Block (10 Sessions)");
    setInvoiceAmount("600");
    fetchTutorRevenue();
    setTimeout(() => setInvoiceSuccessMessage(""), 3500);
  };

  // ----------------------------------------------------
  // 9. CHAT MESSAGING STATES & CONFIG
  // ----------------------------------------------------
  const [chatInput, setChatInput] = useState("");
  const [selectedParentId, setSelectedParentId] = useState("parent_1"); // Grace default

  const parentsMap = {
    parent_1: { name: "Grace Sterling", student: "Caleb Sterling", avatar: "G" },
    parent_2: { name: "Thomas Vance", student: "Hannah Vance", avatar: "T" },
    parent_3: { name: "Rebecca Mercer", student: "Samuel Mercer", avatar: "R" }
  };

  const activeParent = parentsMap[selectedParentId];

  // Filter messages based on selected parent
  const filteredMessages = messages.filter(
    (m) =>
      (m.from === tutorName && m.to === activeParent.name) ||
      (m.from === activeParent.name && m.to === tutorName)
  );

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    sendMessage(
      tutorName,
      activeParent.name,
      chatInput,
      "Tutor",
      "Parent"
    );
    setChatInput("");
  };

  return (
    <div className="dashboard-content animate-fade-in">
      
      {/* SCOPED CUSTOM STYLES */}
      <style>{`
        .tutor-custom-styles { display: none; }
        
        /* Layout Grids */
        .profile-summary-header {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 24px;
          background: rgba(13, 18, 51, 0.45);
          border: 1px solid var(--border-glass);
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 30px;
          backdrop-filter: blur(10px);
        }
        
        .profile-card-left {
          text-align: center;
          border-right: 1px solid rgba(255, 255, 255, 0.08);
          padding-right: 24px;
        }
        
        .profile-card-avatar {
          width: 110px;
          height: 110px;
          border-radius: 50%;
          border: 3px solid var(--indigo-glowing);
          object-fit: cover;
          box-shadow: 0 0 20px rgba(83, 69, 255, 0.3);
          margin: 0 auto 12px;
        }
        
        .profile-status-badge {
          background: rgba(23, 233, 206, 0.12);
          color: var(--turquoise-accent);
          border: 1px solid rgba(23, 233, 206, 0.3);
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.5px;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        .profile-rate-txt {
          font-size: 14px;
          color: var(--gold-faith);
          font-weight: bold;
          margin-top: 6px;
        }
        
        .profile-card-right h2 {
          font-family: var(--sans);
          font-size: 24px;
          font-weight: 800;
          color: var(--text-white);
          margin: 0 0 4px 0;
        }
        
        .profile-role-title {
          font-size: 15px;
          color: var(--text-slate);
          font-weight: 500;
          margin-bottom: 12px;
        }
        
        .profile-bio-text {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.8);
          line-height: 1.6;
          margin-bottom: 16px;
        }
        
        .profile-pills-row {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 16px;
        }
        
        .profile-pill {
          background: rgba(83, 69, 255, 0.15);
          color: var(--text-white);
          border: 1px solid rgba(83, 69, 255, 0.3);
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 600;
        }
        
        /* Stats row inside profile header */
        .header-stats-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-top: 16px;
        }
        
        .header-stat-box {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 10px;
          padding: 12px;
          text-align: center;
        }
        
        .header-stat-box h4 {
          margin: 0;
          font-size: 12px;
          color: var(--text-slate);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .header-stat-box h2 {
          margin: 4px 0 0 0;
          font-size: 20px;
          font-weight: 800;
          color: var(--text-white);
        }

        /* Classroom simulator */
        .live-classroom-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(4, 6, 21, 0.98);
          z-index: 1000;
          display: grid;
          grid-template-columns: 1fr 340px;
          padding: 24px;
          gap: 24px;
        }

        .classroom-main-panel {
          display: flex;
          flex-direction: column;
          background: #0b0f33;
          border: 1px solid var(--border-glass);
          border-radius: 16px;
          padding: 20px;
          position: relative;
        }

        .classroom-video-feeds {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          height: 180px;
          margin-bottom: 20px;
        }

        .video-box {
          background: rgba(7, 10, 30, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .video-box img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0.75;
        }

        .video-box-label {
          position: absolute;
          bottom: 12px;
          left: 12px;
          background: rgba(0, 0, 0, 0.6);
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 600;
          color: var(--text-white);
        }

        .classroom-whiteboard {
          flex-grow: 1;
          background: #070a1e;
          border: 1px solid rgba(83, 69, 255, 0.2);
          border-radius: 12px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          box-shadow: inset 0 0 30px rgba(0,0,0,0.8);
        }

        .whiteboard-slide-content h3 {
          color: var(--turquoise-accent);
          margin-top: 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding-bottom: 8px;
        }

        .slide-diagram-box {
          background: rgba(83, 69, 255, 0.1);
          border: 1px dashed var(--indigo-glowing);
          border-radius: 8px;
          padding: 12px;
          font-family: var(--sans);
          font-size: 13px;
          color: var(--gold-faith);
          margin-top: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .whiteboard-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 16px;
        }

        .classroom-sidebar {
          background: #0a0d2d;
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .classroom-chat-header {
          padding: 16px;
          background: rgba(255,255,255,0.02);
          border-bottom: 1px solid rgba(255,255,255,0.05);
          font-weight: bold;
          color: var(--text-white);
        }

        .classroom-chat-scroll {
          flex-grow: 1;
          padding: 16px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .classroom-chat-msg {
          font-size: 12px;
          line-height: 1.4;
        }

        .classroom-chat-msg strong {
          color: var(--turquoise-accent);
          display: block;
          margin-bottom: 2px;
        }

        .classroom-chat-msg.system {
          background: rgba(255, 255, 255, 0.03);
          padding: 8px;
          border-radius: 6px;
          border-left: 2px solid var(--gold-faith);
          color: var(--gold-faith);
        }

        .classroom-chat-form {
          padding: 12px;
          background: rgba(255,255,255,0.02);
          border-top: 1px solid rgba(255,255,255,0.05);
          display: flex;
          gap: 8px;
        }

        .classroom-chat-form input {
          flex-grow: 1;
          background: rgba(0,0,0,0.3);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 6px;
          padding: 8px 12px;
          color: #fff;
          font-size: 12px;
        }

        /* Set Availability grid */
        .availability-days-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 12px;
          margin-bottom: 20px;
        }

        .availability-day-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          padding: 14px;
          text-align: center;
        }

        .availability-day-card.active {
          border-color: var(--turquoise-accent);
          background: rgba(23, 233, 206, 0.02);
        }

        .availability-day-title {
          font-weight: 700;
          color: var(--text-white);
          font-size: 14px;
          margin-bottom: 10px;
        }

        .availability-time-block {
          background: rgba(83, 69, 255, 0.12);
          color: var(--text-white);
          border: 1px solid rgba(83, 69, 255, 0.25);
          border-radius: 6px;
          padding: 4px 8px;
          font-size: 11px;
          font-weight: 600;
          margin-bottom: 6px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .availability-remove-btn {
          cursor: pointer;
          color: var(--text-slate);
        }
        .availability-remove-btn:hover {
          color: #f87171;
        }

        /* Students tab elements */
        .student-selector-row {
          display: flex;
          gap: 12px;
          overflow-x: auto;
          padding-bottom: 16px;
          margin-bottom: 24px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }

        .student-picker-card {
          background: rgba(13, 18, 51, 0.4);
          border: 1px solid rgba(255,255,255,0.06);
          padding: 16px;
          border-radius: 12px;
          min-width: 180px;
          cursor: pointer;
          transition: all 0.25s ease;
          text-align: left;
        }

        .student-picker-card:hover {
          background: rgba(83, 69, 255, 0.1);
          border-color: rgba(83, 69, 255, 0.3);
          transform: translateY(-2px);
        }

        .student-picker-card.active {
          background: rgba(83, 69, 255, 0.2);
          border-color: var(--indigo-glowing);
          box-shadow: 0 0 15px rgba(83, 69, 255, 0.25);
        }

        .student-card-avatar {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--indigo-primary), var(--turquoise-accent));
          color: #fff;
          font-weight: bold;
          font-size: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 8px;
        }

        .student-picker-card h4 {
          margin: 0 0 2px 0;
          font-size: 15px;
          color: var(--text-white);
        }

        .student-picker-card p {
          margin: 0;
          font-size: 11px;
          color: var(--text-slate);
        }

        .student-details-grid {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 24px;
        }

        .student-micro-progress {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.04);
          border-radius: 10px;
          padding: 12px;
          margin-bottom: 10px;
        }

        .micro-progress-meta {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          margin-bottom: 6px;
        }

        .progress-track {
          height: 6px;
          background: rgba(255,255,255,0.06);
          border-radius: 10px;
          overflow: hidden;
        }

        .progress-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--indigo-primary), var(--turquoise-accent));
          border-radius: 10px;
        }

        /* CSS Horizontal Bar Chart for character metrics */
        .character-bars-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .character-bar-row {
          display: grid;
          grid-template-columns: 110px 1fr 30px;
          align-items: center;
          gap: 12px;
        }

        .character-bar-lbl {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-slate);
          text-transform: capitalize;
        }

        .character-star-dots {
          display: flex;
          gap: 4px;
        }

        .star-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.08);
        }

        .star-dot.filled {
          background: var(--gold-faith);
          box-shadow: 0 0 6px var(--gold-faith);
        }

        /* Report Modal Card Overlay */
        .report-modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(4, 6, 21, 0.9);
          backdrop-filter: blur(8px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }

        .report-card-print-box {
          background: #ffffff;
          color: #1a202c;
          width: 100%;
          max-width: 680px;
          max-height: 90vh;
          overflow-y: auto;
          border-radius: 12px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          position: relative;
        }

        .report-header-banner {
          background: linear-gradient(135deg, #070a1e, #161d4a);
          color: #ffffff;
          padding: 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 5px solid #f3b007;
        }

        .report-printable-body {
          padding: 30px;
        }

        .report-printable-section-title {
          font-family: 'Playfair Display', serif;
          border-bottom: 2px solid #e2e8f0;
          padding-bottom: 6px;
          margin-bottom: 12px;
          color: #070a1e;
          font-size: 16px;
          font-weight: 700;
        }

        .report-comp-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 12px;
          text-align: center;
          margin-top: 12px;
        }

        .report-comp-card {
          background: #f7fafc;
          border: 1px solid #edf2f7;
          border-radius: 8px;
          padding: 10px;
        }

        .report-comp-card h5 {
          margin: 0;
          font-size: 11px;
          color: #718096;
          text-transform: uppercase;
        }

        .report-comp-card strong {
          font-size: 18px;
          color: #5345ff;
        }

        /* Billing panels */
        .billing-stat-cards {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }

        .billing-stat-card {
          background: rgba(13, 18, 51, 0.4);
          border: 1px solid var(--border-glass);
          border-radius: 12px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .billing-stat-icon-wrapper {
          width: 48px;
          height: 48px;
          border-radius: 10px;
          background: rgba(83, 69, 255, 0.15);
          border: 1px solid rgba(83, 69, 255, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--turquoise-accent);
        }

        .billing-stat-card-text h5 {
          margin: 0;
          font-size: 11px;
          color: var(--text-slate);
          text-transform: uppercase;
        }

        .billing-stat-card-text h2 {
          margin: 4px 0 0 0;
          font-size: 22px;
          font-weight: 800;
          color: #fff;
        }

        .billing-flex-layout {
          display: grid;
          grid-template-columns: 1fr 1.3fr;
          gap: 24px;
        }

        /* Multi-thread Chat styling */
        .chat-layout-multithread {
          display: grid;
          grid-template-columns: 240px 1fr;
          border: 1px solid var(--border-glass);
          border-radius: 16px;
          background: rgba(13, 18, 51, 0.35);
          height: 520px;
          overflow: hidden;
        }

        .chat-parents-sidebar {
          border-right: 1px solid rgba(255, 255, 255, 0.06);
          background: rgba(0, 0, 0, 0.15);
          display: flex;
          flex-direction: column;
        }

        .chat-sidebar-search {
          padding: 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          font-weight: 700;
          color: var(--text-white);
        }

        .chat-parent-thread-row {
          width: 100%;
          background: transparent;
          border: none;
          padding: 14px 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          text-align: left;
          border-bottom: 1px solid rgba(255, 255, 255, 0.02);
          transition: all 0.2s ease;
        }

        .chat-parent-thread-row:hover {
          background: rgba(255,255,255,0.02);
        }

        .chat-parent-thread-row.active {
          background: rgba(83, 69, 255, 0.15);
          border-left: 3px solid var(--turquoise-accent);
        }

        .chat-parent-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #5345ff;
          color: #fff;
          font-weight: bold;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
        }

        .chat-parent-meta h5 {
          margin: 0;
          font-size: 13px;
          color: var(--text-white);
        }

        .chat-parent-meta p {
          margin: 0;
          font-size: 10px;
          color: var(--text-slate);
        }
      `}</style>

      {/* ----------------------------------------------------
          TUTOR PROFILE SUMMARY HEADER
          ---------------------------------------------------- */}
      <div className="profile-summary-header animate-scale-up">
        <div className="profile-card-left">
          <img src={profileData.avatar} alt="Sarah" className="profile-card-avatar" />
          <div className="profile-status-badge">
            <span style={{ display: "inline-block", width: "6px", height: "6px", borderRadius: "50%", background: "#17e9ce" }}></span>
            <span>{profileData.status}</span>
          </div>
          <p className="profile-rate-txt">${profileData.hourlyRate}.00 / hour</p>
          <button 
            className="btn-secondary" 
            style={{ padding: "6px 12px", fontSize: "11px", marginTop: "12px", gap: "4px" }}
            onClick={() => setIsEditingProfile(!isEditingProfile)}
          >
            {isEditingProfile ? <X size={12} /> : <Edit size={12} />}
            <span>{isEditingProfile ? "Cancel" : "Edit Profile"}</span>
          </button>
        </div>

        <div className="profile-card-right">
          {isEditingProfile ? (
            <form onSubmit={handleSaveProfile} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="form-group">
                  <label style={{ color: "#fff", fontSize: "11px" }}>Tutor Name</label>
                  <input 
                    type="text" 
                    value={profileData.name} 
                    onChange={e => setProfileData({...profileData, name: e.target.value})} 
                    style={{ background: "#0c0f33", border: "1px solid #2e3573", color: "#fff", padding: "6px", borderRadius: "6px" }}
                  />
                </div>
                <div className="form-group">
                  <label style={{ color: "#fff", fontSize: "11px" }}>Professional Title</label>
                  <input 
                    type="text" 
                    value={profileData.role} 
                    onChange={e => setProfileData({...profileData, role: e.target.value})} 
                    style={{ background: "#0c0f33", border: "1px solid #2e3573", color: "#fff", padding: "6px", borderRadius: "6px" }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label style={{ color: "#fff", fontSize: "11px" }}>Short Biography</label>
                <textarea 
                  rows="2" 
                  value={profileData.bio} 
                  onChange={e => setProfileData({...profileData, bio: e.target.value})} 
                  style={{ background: "#0c0f33", border: "1px solid #2e3573", color: "#fff", padding: "6px", borderRadius: "6px", fontSize: "12px" }}
                ></textarea>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="form-group">
                  <label style={{ color: "#fff", fontSize: "11px" }}>Hourly Tutoring Rate ($)</label>
                  <input 
                    type="number" 
                    value={profileData.hourlyRate} 
                    onChange={e => setProfileData({...profileData, hourlyRate: e.target.value})} 
                    style={{ background: "#0c0f33", border: "1px solid #2e3573", color: "#fff", padding: "6px", borderRadius: "6px" }}
                  />
                </div>
                <div className="form-group">
                  <label style={{ color: "#fff", fontSize: "11px" }}>Active Status</label>
                  <select 
                    value={profileData.status} 
                    onChange={e => setProfileData({...profileData, status: e.target.value})} 
                    style={{ background: "#0c0f33", border: "1px solid #2e3573", color: "#fff", padding: "6px", borderRadius: "6px" }}
                  >
                    <option value="Active & Accepting Students">Active & Accepting Students</option>
                    <option value="Busy / Block Booked">Busy / Block Booked</option>
                    <option value="Away on Sabbatical">Away on Sabbatical</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="btn-primary-glowing" style={{ alignSelf: "flex-start", padding: "6px 16px", fontSize: "12px" }}>
                <Save size={12} className="btn-icon" />
                <span>Save Profile Changes</span>
              </button>
            </form>
          ) : (
            <>
              <h2>{profileData.name}</h2>
              <p className="profile-role-title">{profileData.role}</p>
              <p className="profile-bio-text">"{profileData.bio}"</p>
              
              <div className="profile-pills-row">
                {profileData.subjects.map(sub => (
                  <span key={sub} className="profile-pill">{sub}</span>
                ))}
              </div>

              <div className="header-stats-row">
                <div className="header-stat-box">
                  <h4>Today's Sessions</h4>
                  <h2>1 Session</h2>
                </div>
                <div className="header-stat-box">
                  <h4>My Students</h4>
                  <h2>{allStudents.length} Active</h2>
                </div>
                <div className="header-stat-box">
                  <h4>Tutor Rating</h4>
                  <h2>⭐ {profileData.rating}</h2>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ----------------------------------------------------
          TUTOR SUB NAVIGATION ROW (8 MODULES)
          ---------------------------------------------------- */}
      <div className="dashboard-tabs-header-row" style={{ flexWrap: "wrap", rowGap: "10px" }}>
        <button className={`dashboard-tab-trigger ${activeSubTab === "Schedule" ? "active" : ""}`} onClick={() => setActiveSubTab("Schedule")}>
          <Calendar className="tab-trigger-icon" />
          <span>Daily Schedule</span>
        </button>
        <button className={`dashboard-tab-trigger ${activeSubTab === "Students" ? "active" : ""}`} onClick={() => setActiveSubTab("Students")}>
          <Users className="tab-trigger-icon" />
          <span>My Students & IEP</span>
        </button>
        <button className={`dashboard-tab-trigger ${activeSubTab === "Homework" ? "active" : ""}`} onClick={() => setActiveSubTab("Homework")}>
          <PlusCircle className="tab-trigger-icon" />
          <span>Learning Hub</span>
        </button>
        <button className={`dashboard-tab-trigger ${activeSubTab === "Notes" ? "active" : ""}`} onClick={() => setActiveSubTab("Notes")}>
          <BookOpen className="tab-trigger-icon" />
          <span>Session Notes</span>
        </button>
        <button className={`dashboard-tab-trigger ${activeSubTab === "Reports" ? "active" : ""}`} onClick={() => setActiveSubTab("Reports")}>
          <FileText className="tab-trigger-icon" />
          <span>Progress Reports</span>
        </button>
        <button className={`dashboard-tab-trigger ${activeSubTab === "Revenue" ? "active" : ""}`} onClick={() => setActiveSubTab("Revenue")}>
          <DollarSign className="tab-trigger-icon" />
          <span>Financials & Revenue</span>
        </button>
        <button className={`dashboard-tab-trigger ${activeSubTab === "Chat" ? "active" : ""}`} onClick={() => setActiveSubTab("Chat")}>
          <MessageSquare className="tab-trigger-icon" />
          <span>Direct Chats</span>
        </button>
        <button className={`dashboard-tab-trigger ${activeSubTab === "Profile" ? "active" : ""}`} onClick={() => setActiveSubTab("Profile")}>
          <Sliders className="tab-trigger-icon" />
          <span>Invite & Availability</span>
        </button>
      </div>

      {/* ----------------------------------------------------
          TAB: SCHEDULE & AD-HOC BLOCK
          ---------------------------------------------------- */}
      {activeSubTab === "Schedule" && (
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "24px" }} className="animate-scale-up">
          
          <div className="panel-card">
            <div className="panel-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3>Today's Scheduled Sessions</h3>
                <p>Launch live Zoom virtual classrooms with reactive databases.</p>
              </div>
              <span className="online-capsule" style={{ background: "rgba(23, 233, 206, 0.12)", color: "var(--turquoise-accent)" }}>Active Day</span>
            </div>

            <div className="tutor-sessions-list" style={{ marginTop: "1.5rem" }}>
              {bookings.filter(bk => bk.date === "2026-06-26" || bk.id === "bk_1").map((bk) => {
                const status = todaySessionStatus[bk.id] || "Pending";
                return (
                  <div key={bk.id} className="tutor-session-row-card" style={{ border: status === "In Progress" ? "1px solid #17e9ce" : "" }}>
                    <div className="session-left-meta">
                      <span className="session-card-icon-badge" style={{ fontSize: "1.5rem" }}>
                        {status === "Completed" ? "✅" : status === "In Progress" ? "🎥" : "📅"}
                      </span>
                      <div>
                        <h4>{bk.subject} Session</h4>
                        <p>Student: <strong>{bk.studentName}</strong> • Platform: Zoom Classroom</p>
                        
                        {status === "Pending" && <span className="online-capsule" style={{ background: "rgba(255,255,255,0.06)", fontSize: "10px", padding: "2px 8px" }}>Ready to Launch</span>}
                        {status === "In Progress" && <span className="online-capsule animate-pulse" style={{ background: "rgba(23, 233, 206, 0.15)", color: "#17e9ce", fontSize: "10px", padding: "2px 8px" }}>Active Now</span>}
                        {status === "Completed" && <span className="online-capsule" style={{ background: "rgba(16, 185, 129, 0.15)", color: "#10b981", fontSize: "10px", padding: "2px 8px" }}>✓ Session Finished</span>}
                        {status === "No Show" && <span className="online-capsule" style={{ background: "rgba(239, 68, 68, 0.15)", color: "#f87171", fontSize: "10px", padding: "2px 8px" }}>No Show</span>}
                      </div>
                    </div>
                    
                    <div className="session-right-schedule text-right">
                      <p className="session-sc-date" style={{ fontWeight: "700", color: "#fff" }}>TODAY</p>
                      <p className="session-sc-time" style={{ fontSize: "12px" }}>{bk.time}</p>
                    </div>

                    <div style={{ display: "flex", gap: "8px" }}>
                      {status === "Pending" && (
                        <>
                          <button className="btn-primary-glowing" style={{ padding: "6px 12px", fontSize: "12px", gap: "4px" }} onClick={() => handleLaunchClassroom(bk)}>
                            <Video size={13} />
                            <span>Launch Room</span>
                          </button>
                          <button 
                            className="btn-secondary" 
                            style={{ padding: "6px", minWidth: "32px", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171" }}
                            onClick={() => setTodaySessionStatus(prev => ({ ...prev, [bk.id]: "No Show" }))}
                            title="Mark No Show"
                          >
                            <X size={13} />
                          </button>
                        </>
                      )}
                      {status === "In Progress" && (
                        <button className="btn-primary-glowing" style={{ padding: "6px 12px", fontSize: "12px", background: "linear-gradient(135deg, #be185d, #be185d)" }} onClick={() => handleLaunchClassroom(bk)}>
                          <span>Re-Join Room</span>
                        </button>
                      )}
                      {status === "Completed" && (
                        <button className="btn-secondary" style={{ padding: "6px 12px", fontSize: "12px" }} onClick={() => { setActiveSubTab("Notes"); setNoteSubject(bk.subject); }}>
                          Write Summary
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Upcoming sessions chronological list */}
            <h3 style={{ marginTop: "2rem", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "1.5rem" }}>Upcoming Tutorial Registry</h3>
            <p style={{ fontSize: "13px", color: "var(--text-slate)" }}>Synched roster showing scheduled courses and exam blocks.</p>
            
            <div className="tutor-sessions-list" style={{ marginTop: "1rem" }}>
              {bookings.filter(bk => bk.id !== "bk_1").map((bk) => (
                <div key={bk.id} className="tutor-session-row-card" style={{ background: "rgba(255,255,255,0.01)", display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center", justifyContent: "space-between" }}>
                  <div className="session-left-meta" style={{ flex: "1 1 200px" }}>
                    <span className="session-card-icon-badge" style={{ background: "rgba(255,255,255,0.03)" }}>📅</span>
                    <div>
                      <h4 style={{ margin: 0 }}>{bk.subject} Session</h4>
                      <p style={{ margin: "2px 0 0 0" }}>Student: <strong>{bk.studentName}</strong> • Digital Classroom</p>
                      {bk.status && (
                        <span style={{ 
                          fontSize: "10px", 
                          padding: "2px 6px", 
                          borderRadius: "4px", 
                          background: bk.status === "Cancelled" ? "rgba(239,68,68,0.15)" : "rgba(16,185,129,0.15)", 
                          color: bk.status === "Cancelled" ? "#f87171" : "#34d399", 
                          border: bk.status === "Cancelled" ? "1px solid rgba(239,68,68,0.3)" : "1px solid rgba(16,185,129,0.3)",
                          marginTop: "4px",
                          display: "inline-block"
                        }}>
                          {bk.status}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="session-right-schedule text-right" style={{ flex: "1 1 120px" }}>
                    <p className="session-sc-date" style={{ color: "#fff", margin: 0 }}>{bk.date}</p>
                    <p className="session-sc-time" style={{ margin: "2px 0 0 0" }}>{bk.time}</p>
                  </div>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    <button className="btn-secondary" style={{ padding: "6px 12px", fontSize: "11px" }} onClick={() => { setActiveSubTab("Notes"); setNoteSubject(bk.subject); }}>
                      Pre-Write Notes
                    </button>
                    {bk.status !== "Cancelled" && (
                      <>
                        <button 
                          className="btn-secondary" 
                          style={{ padding: "6px 12px", fontSize: "11px", color: "var(--gold-faith)" }} 
                          onClick={() => {
                            setReschedulingSession(bk);
                            setRescheduleDate(bk.date);
                            setRescheduleTime(bk.time);
                          }}
                        >
                          Reschedule
                        </button>
                        <button 
                          className="btn-secondary" 
                          style={{ padding: "6px 12px", fontSize: "11px", color: "#f87171" }} 
                          onClick={() => {
                            setCancellingSession(bk);
                            setCancelReason("");
                          }}
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Book Ad-hoc Session */}
          <div className="panel-card">
            <div className="panel-card-header">
              <h3>Book Ad-Hoc Session</h3>
              <p>Directly register emergency lessons, generating synchronized bills instantly.</p>
            </div>

            {adhocSuccess && (
              <div className="success-banner animate-scale-up" style={{ padding: "12px", background: "rgba(23, 233, 206, 0.12)", color: "var(--turquoise-accent)", borderRadius: "8px", margin: "1rem 0" }}>
                {adhocSuccess}
              </div>
            )}

            <form onSubmit={handleBookAdhoc} className="tutor-action-form" style={{ marginTop: "1rem" }}>
              <div className="form-group">
                <label>Select Student *</label>
                <select value={adhocStudent} onChange={e => setAdhocStudent(e.target.value)} style={{ width: "100%" }}>
                  {allStudents.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.grade})</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Core Course / Exam Subject *</label>
                <select value={adhocSubject} onChange={e => setAdhocSubject(e.target.value)} style={{ width: "100%" }}>
                  <option value="Pre-Calculus">Pre-Calculus</option>
                  <option value="Reading & Writing">Reading & Writing</option>
                  <option value="SAT Prep Math">SAT Prep Math</option>
                  <option value="Science (Physics)">Science (Physics)</option>
                  <option value="IEP Support Sessions">IEP Support Sessions</option>
                </select>
              </div>

              <div className="form-group">
                <label>Select Date *</label>
                <input 
                  type="date" 
                  required 
                  value={adhocDate} 
                  onChange={e => setAdhocDate(e.target.value)} 
                  style={{ width: "100%", background: "#0c0f33", border: "1px solid #2e3573", color: "#fff", padding: "10px", borderRadius: "6px" }}
                />
              </div>

              <div className="form-group">
                <label>Time Slot Interval *</label>
                <input 
                  type="text" 
                  value={adhocTime} 
                  onChange={e => setAdhocTime(e.target.value)} 
                  placeholder="E.g., 4:00 PM - 5:00 PM" 
                  style={{ width: "100%", background: "#0c0f33", border: "1px solid #2e3573", color: "#fff", padding: "10px", borderRadius: "6px" }}
                />
              </div>

              <button type="submit" className="btn-primary-glowing" style={{ width: "100%", justifyContent: "center" }}>
                <PlusSquare size={14} className="btn-icon" />
                <span>Confirm & Sync Session</span>
              </button>
            </form>
          </div>

        </div>
      )}

      {/* ----------------------------------------------------
          LIVE CLASSROOM SIMULATOR ROOM OVERLAY
          ---------------------------------------------------- */}
      {showLiveRoom && (
        <div className="live-classroom-overlay">
          <div className="classroom-main-panel">
            
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span className="online-capsule animate-pulse" style={{ background: "rgba(239, 68, 68, 0.2)", color: "#f87171" }}>LIVE</span>
                <h3 style={{ margin: 0, color: "#fff" }}>Zoom Interactive Classroom</h3>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ fontSize: "14px", color: "var(--gold-faith)", fontWeight: "bold" }}>
                  ⏳ {liveMinutesLeft} minutes left
                </span>
                <button 
                  className="btn-primary-glowing" 
                  style={{ background: "linear-gradient(135deg, #10b981, #059669)", padding: "6px 14px", fontSize: "11px" }}
                  onClick={() => handleCompleteClassroomSession("bk_1")}
                >
                  Complete Session
                </button>
              </div>
            </div>

            {/* Video feeds */}
            <div className="classroom-video-feeds">
              <div className="video-box">
                <img src={profileData.avatar} alt="Tutor Video" />
                <span className="video-box-label">Mrs. Sarah Jenkins (Tutor) - Connected</span>
              </div>
              <div className="video-box">
                <img src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200" alt="Student Video" />
                <span className="video-box-label">Caleb Sterling (Student) - Connected</span>
              </div>
            </div>

            {/* Whiteboard Workspace */}
            <div className="classroom-whiteboard">
              <div className="whiteboard-slide-content">
                <span style={{ fontSize: "11px", color: "var(--text-slate)", fontWeight: "bold", textTransform: "uppercase" }}>
                  Interactive Lesson Sheet • Slide {currentLessonSlide} of {totalLessonSlides}
                </span>
                <h3>{lessonSlidesContent[currentLessonSlide].title}</h3>
                
                <p style={{ whiteSpace: "pre-wrap", fontSize: "13px", lineHeight: "1.6", color: "rgba(255,255,255,0.95)" }}>
                  {lessonSlidesContent[currentLessonSlide].text}
                </p>

                <div className="slide-diagram-box">
                  <span>💡</span>
                  <span>{lessonSlidesContent[currentLessonSlide].diagram}</span>
                </div>
              </div>

              <div className="whiteboard-controls">
                <button 
                  className="btn-secondary" 
                  disabled={currentLessonSlide === 1}
                  onClick={() => setCurrentLessonSlide(prev => Math.max(1, prev - 1))}
                  style={{ padding: "4px 12px", fontSize: "11px" }}
                >
                  Previous Slide
                </button>
                <div style={{ display: "flex", gap: "6px" }}>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: currentLessonSlide === 1 ? "#17e9ce" : "rgba(255,255,255,0.2)" }}></span>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: currentLessonSlide === 2 ? "#17e9ce" : "rgba(255,255,255,0.2)" }}></span>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: currentLessonSlide === 3 ? "#17e9ce" : "rgba(255,255,255,0.2)" }}></span>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: currentLessonSlide === 4 ? "#17e9ce" : "rgba(255,255,255,0.2)" }}></span>
                </div>
                <button 
                  className="btn-primary-glowing" 
                  disabled={currentLessonSlide === totalLessonSlides}
                  onClick={() => setCurrentLessonSlide(prev => Math.min(totalLessonSlides, prev + 1))}
                  style={{ padding: "4px 12px", fontSize: "11px" }}
                >
                  Next Slide
                </button>
              </div>
            </div>

          </div>

          {/* Right Chat sidebar */}
          <div className="classroom-sidebar">
            <div className="classroom-chat-header">
              💬 Classroom Live Chat
            </div>
            <div className="classroom-chat-scroll">
              {classroomChat.map((c, i) => (
                <div key={i} className={`classroom-chat-msg ${c.sender === "System" ? "system" : ""}`}>
                  <strong>{c.sender}</strong>
                  <span>{c.text}</span>
                </div>
              ))}
            </div>
            <form onSubmit={handleSendClassroomChat} className="classroom-chat-form">
              <input 
                type="text" 
                value={classroomChatInput} 
                onChange={e => setClassroomChatInput(e.target.value)} 
                placeholder="Send chat message..."
              />
              <button type="submit" className="btn-primary-glowing" style={{ padding: "6px" }}>
                <Send size={12} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------
          TAB: MY STUDENTS & IEP RECORDS
          ---------------------------------------------------- */}
      {activeSubTab === "Students" && (
        <div className="animate-scale-up">
          
          {/* Horizontal student selection row */}
          <div className="student-selector-row">
            {allStudents.map(std => (
              <button 
                key={std.id}
                className={`student-picker-card ${selectedStudentId === std.id ? "active" : ""}`}
                onClick={() => setSelectedStudentId(std.id)}
              >
                <div className="student-card-avatar">{std.name.charAt(0)}</div>
                <h4>{std.name}</h4>
                <p>{std.grade}</p>
              </button>
            ))}
          </div>

          {activeStudent && (
            <div className="student-details-grid">
              
              {/* Left Column: Academic overview and reflections */}
              <div>
                <div className="panel-card" style={{ marginBottom: "24px" }}>
                  <div className="panel-card-header" style={{ display: "flex", justifyContent: "space-between" }}>
                    <div>
                      <h3>Student Profile Summary</h3>
                      <p>Currently logged records mapping academic progress.</p>
                    </div>
                    <span className="online-capsule" style={{ background: "linear-gradient(135deg, #be185d, #be185d)" }}>
                      🏆 {activeStudent.level} Rank
                    </span>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", margin: "1.5rem 0" }}>
                    <div style={{ background: "rgba(255,255,255,0.02)", padding: "12px", borderRadius: "8px", textCenter: "center" }}>
                      <span style={{ fontSize: "11px", color: "var(--text-slate)", display: "block" }}>STREAK</span>
                      <strong style={{ fontSize: "20px", color: "#fff" }}>🔥 {activeStudent.streak} Days</strong>
                    </div>
                    <div style={{ background: "rgba(255,255,255,0.02)", padding: "12px", borderRadius: "8px", textCenter: "center" }}>
                      <span style={{ fontSize: "11px", color: "var(--text-slate)", display: "block" }}>POINTS ACQUIRED</span>
                      <strong style={{ fontSize: "20px", color: "#fff" }}>✨ {activeStudent.points} XP</strong>
                    </div>
                    <div style={{ background: "rgba(255,255,255,0.02)", padding: "12px", borderRadius: "8px", textCenter: "center" }}>
                      <span style={{ fontSize: "11px", color: "var(--text-slate)", display: "block" }}>COMPLETED SESSIONS</span>
                      <strong style={{ fontSize: "20px", color: "#fff" }}>📚 {activeStudent.completedSessions} Blocks</strong>
                    </div>
                  </div>

                  <h4>Academic Course Ledger</h4>
                  <div style={{ marginTop: "1rem" }}>
                    {activeStudent.subjects?.map(sub => (
                      <div key={sub.name} className="student-micro-progress">
                        <div className="micro-progress-meta">
                          <strong style={{ color: "#fff" }}>{sub.name} Grade</strong>
                          <span style={{ color: "var(--turquoise-accent)", fontWeight: "bold" }}>
                            {sub.grade} ({sub.progress}%)
                          </span>
                        </div>
                        <div className="progress-track">
                          <div className="progress-bar-fill" style={{ width: `${sub.progress}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Character Reflection Timeline */}
                <div className="panel-card">
                  <h3>Recent Character Reflections</h3>
                  <p>Inspirational logs compiled directly by the student.</p>
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "1rem" }}>
                    {activeStudent.growthReflections?.length === 0 ? (
                      <p style={{ fontStyle: "italic", fontSize: "13px" }}>No reflections submitted yet.</p>
                    ) : (
                      activeStudent.growthReflections?.map(refl => (
                        <div key={refl.id} style={{ background: "rgba(255,255,255,0.02)", padding: "16px", borderRadius: "10px", borderLeft: "3px solid var(--turquoise-accent)" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "6px" }}>
                            <strong style={{ color: "#fff" }}>Theme Taught: {refl.theme}</strong>
                            <span>{refl.date}</span>
                          </div>
                          <p style={{ margin: 0, fontSize: "13px", lineHeight: "1.5", fontStyle: "italic" }}>"{refl.text}"</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Character radar scores and IEP Support */}
              <div>
                
                {/* Character radar representation */}
                <div className="panel-card" style={{ marginBottom: "24px" }}>
                  <h3>Character Metrics</h3>
                  <p>Standardized score assessments aligned with noble virtues.</p>
                  
                  <div className="character-bars-list" style={{ marginTop: "1.5rem" }}>
                    {Object.entries(activeStudent.characterMetrics || {}).map(([key, value]) => (
                      <div key={key} className="character-bar-row">
                        <span className="character-bar-lbl">{key.replace("_", " ")}</span>
                        <div style={{ height: "4px", background: "rgba(255,255,255,0.05)", borderRadius: "2px", overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${value * 20}%`, background: "var(--gold-faith)" }}></div>
                        </div>
                        <span style={{ fontSize: "12px", fontWeight: "bold", color: "var(--gold-faith)", textAlign: "right" }}>
                          {value}/5
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* IEP SUPPORT MANAGER */}
                <div className="panel-card">
                  <div className="panel-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <h3>IEP Support Manager</h3>
                      <p>Configure goals and accommodations in real-time.</p>
                    </div>
                    <ShieldCheck className="tab-trigger-icon" style={{ color: "var(--turquoise-accent)" }} />
                  </div>

                  {iepSuccessMessage && (
                    <div className="success-banner animate-scale-up" style={{ padding: "8px", background: "rgba(16, 185, 129, 0.12)", color: "#10b981", borderRadius: "6px", fontSize: "12px" }}>
                      {iepSuccessMessage}
                    </div>
                  )}

                  {/* IEP Goals List */}
                  <form onSubmit={handleSaveIepChanges} style={{ marginTop: "1.5rem" }}>
                    <h5 style={{ margin: "0 0 10px 0", color: "#fff", textTransform: "uppercase", fontSize: "11px" }}>Current IEP Goals</h5>
                    {activeStudent.iepGoals?.length === 0 ? (
                      <p style={{ fontStyle: "italic", fontSize: "12px" }}>No formal IEP goals defined.</p>
                    ) : (
                      activeStudent.iepGoals?.map(goal => (
                        <div key={goal.id} style={{ marginBottom: "14px" }}>
                          <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.9)", margin: "0 0 4px 0" }}>{goal.text}</p>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <input 
                              type="range" 
                              min="0" 
                              max="100" 
                              value={iepGoalsProgress[goal.id] !== undefined ? iepGoalsProgress[goal.id] : goal.progress}
                              onChange={e => handleUpdateGoalProgress(goal.id, e.target.value)}
                              style={{ flexGrow: 1 }}
                            />
                            <span style={{ fontSize: "11px", fontWeight: "bold", width: "30px", color: "var(--turquoise-accent)" }}>
                              {iepGoalsProgress[goal.id] !== undefined ? iepGoalsProgress[goal.id] : goal.progress}%
                            </span>
                          </div>
                        </div>
                      ))
                    )}

                    {/* Intervention plan text */}
                    <div className="form-group" style={{ marginTop: "1.5rem" }}>
                      <label style={{ fontSize: "11px", textTransform: "uppercase" }}>Intervention Strategy Plan</label>
                      <textarea 
                        rows="2" 
                        value={iepInterventionPlanEdit} 
                        onChange={e => setIepInterventionPlanEdit(e.target.value)}
                        style={{ fontSize: "12px", width: "100%", background: "#0c0f33", border: "1px solid #2e3573", color: "#fff", padding: "6px", borderRadius: "6px" }}
                      />
                    </div>

                    <button type="submit" className="btn-secondary" style={{ padding: "6px 12px", fontSize: "11px" }}>
                      Save IEP Roster Updates
                    </button>
                  </form>

                  {/* Accommodations and tag ledger */}
                  <h5 style={{ margin: "1.5rem 0 10px 0", color: "#fff", textTransform: "uppercase", fontSize: "11px" }}>Active Accommodations</h5>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {activeStudent.iepAccommodations?.map(acc => (
                      <span key={acc} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", padding: "4px 8px", borderRadius: "6px", fontSize: "11px", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                        <span>{acc}</span>
                        <X size={10} style={{ cursor: "pointer", color: "#f87171" }} onClick={() => handleRemoveAccommodation(acc)} />
                      </span>
                    ))}
                  </div>

                  <form onSubmit={handleAddAccommodation} style={{ display: "flex", gap: "8px", marginTop: "1rem" }}>
                    <input 
                      type="text" 
                      placeholder="Add custom accommodation..." 
                      value={newAccommodation}
                      onChange={e => setNewAccommodation(e.target.value)}
                      style={{ flexGrow: 1, background: "#0c0f33", border: "1px solid #2e3573", color: "#fff", padding: "6px", borderRadius: "6px", fontSize: "12px" }}
                    />
                    <button type="submit" className="btn-secondary" style={{ padding: "6px 12px" }}>
                      Add
                    </button>
                  </form>

                  {/* Tutor observation logs */}
                  <h5 style={{ margin: "1.5rem 0 10px 0", color: "#fff", textTransform: "uppercase", fontSize: "11px" }}>Tutor IEP Observation Feed</h5>
                  {iepObsSubmitted && (
                    <p style={{ color: "var(--turquoise-accent)", fontSize: "11px" }}>Observation logged securely!</p>
                  )}
                  <form onSubmit={handleSaveIepObservation} style={{ display: "flex", gap: "8px", marginBottom: "1rem" }}>
                    <input 
                      type="text" 
                      placeholder="Record new classroom observations..." 
                      value={iepObsText}
                      onChange={e => setIepObsText(e.target.value)}
                      style={{ flexGrow: 1, background: "#0c0f33", border: "1px solid #2e3573", color: "#fff", padding: "6px", borderRadius: "6px", fontSize: "12px" }}
                    />
                    <button type="submit" className="btn-secondary" style={{ padding: "6px 12px" }}>
                      Log Observation
                    </button>
                  </form>

                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "150px", overflowY: "auto" }}>
                    {activeStudent.iepTutorObservations?.map(obs => (
                      <div key={obs.id} style={{ background: "rgba(0,0,0,0.15)", padding: "10px", borderRadius: "6px", fontSize: "11px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", color: "var(--turquoise-accent)", marginBottom: "4px" }}>
                          <strong>{obs.tutor}</strong>
                          <span>{obs.date}</span>
                        </div>
                        <p style={{ margin: 0, fontStyle: "italic" }}>"{obs.text}"</p>
                      </div>
                    ))}
                  </div>

                </div>

              </div>

            </div>
          )}

        </div>
      )}

      {/* ----------------------------------------------------
          TAB: HOMEWORK & LEARNING HUB
          ---------------------------------------------------- */}
      {activeSubTab === "Homework" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.3fr", gap: "24px" }} className="animate-scale-up">
          
          {/* Create Assignment form */}
          <div className="panel-card">
            <div className="panel-card-header">
              <h3>Dispatch Homework Assignment</h3>
              <p>Creates active checklist sheets instantly synced to the student dashboard.</p>
            </div>

            {asgSubmitted ? (
              <div className="success-banner animate-scale-up text-center">
                <CheckCircle className="success-tick-icon" />
                <h4>Assignment Dispatched Successfully!</h4>
                <p>This checklist item has been posted to Caleb's student profile.</p>
              </div>
            ) : (
              <form onSubmit={handleCreateAssignment} className="tutor-action-form">
                <div className="form-group">
                  <label>Select Target Learner *</label>
                  <select value={selectedStudentId} onChange={(e) => setSelectedStudentId(e.target.value)} style={{ width: "100%" }}>
                    {allStudents.map((s) => (
                      <option key={s.id} value={s.id}>{s.name} ({s.grade})</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Subject Focus *</label>
                  <select value={asgSubject} onChange={(e) => setAsgSubject(e.target.value)} style={{ width: "100%" }}>
                    <option value="Pre-Calculus">Pre-Calculus</option>
                    <option value="Reading & Writing">Reading & Writing</option>
                    <option value="SAT Prep Math">SAT Prep Math</option>
                    <option value="Science">Science (Physics)</option>
                    <option value="Character Education">Character Education</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Assignment Header Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="E.g., Trigonometric Proofs Challenge Sheet"
                    value={asgTitle}
                    onChange={(e) => setAsgTitle(e.target.value)}
                    style={{ width: "100%", background: "#0c0f33", border: "1px solid #2e3573", color: "#fff", padding: "10px", borderRadius: "6px" }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div className="form-group">
                    <label>Due Date *</label>
                    <input
                      type="date"
                      value={asgDueDate}
                      onChange={(e) => setAsgDueDate(e.target.value)}
                      style={{ width: "100%", background: "#0c0f33", border: "1px solid #2e3573", color: "#fff", padding: "10px", borderRadius: "6px" }}
                    />
                  </div>
                  <div className="form-group">
                    <label>Points Value (XP) *</label>
                    <input
                      type="number"
                      value={asgPoints}
                      onChange={(e) => setAsgPoints(e.target.value)}
                      style={{ width: "100%", background: "#0c0f33", border: "1px solid #2e3573", color: "#fff", padding: "10px", borderRadius: "6px" }}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Detailed Guidelines & Exercises *</label>
                  <textarea
                    rows="3"
                    required
                    placeholder="Provide step-by-step concepts, page numbers, and study instructions..."
                    value={asgDesc}
                    onChange={(e) => setAsgDesc(e.target.value)}
                    style={{ width: "100%", background: "#0c0f33", border: "1px solid #2e3573", color: "#fff", padding: "10px", borderRadius: "6px" }}
                  ></textarea>
                </div>

                <button type="submit" className="btn-primary-glowing" style={{ width: "100%", justifyContent: "center" }}>
                  <Plus className="btn-icon" />
                  <span>Dispatch Challenge Sheet</span>
                </button>
              </form>
            )}
          </div>

          {/* Assignments hub and logs */}
          <div className="panel-card">
            <div className="panel-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3>Learning Hub Ledger</h3>
                <p>Track sheet completion. Resolves directly to central databases.</p>
              </div>
              <select 
                value={selectedStudentId} 
                onChange={e => setSelectedStudentId(e.target.value)}
                style={{ background: "#0c0f33", border: "1px solid #2e3573", color: "#fff", padding: "6px 12px", borderRadius: "6px", fontSize: "12px" }}
              >
                {allStudents.map(s => (
                  <option key={s.id} value={s.id}>{s.name.split(' ')[0]}'s Feed</option>
                ))}
              </select>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "1.5rem" }}>
              {assignments.filter(a => a.studentId === selectedStudentId).length === 0 ? (
                <p style={{ fontStyle: "italic", fontSize: "13px" }}>No assignments currently dispatched for this student.</p>
              ) : (
                assignments.filter(a => a.studentId === selectedStudentId).map((asg) => (
                  <div key={asg.id} style={{ background: "rgba(255,255,255,0.015)", padding: "16px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.03)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                      <div>
                        <h4 style={{ margin: "0 0 2px 0", color: "#fff", fontSize: "14px" }}>{asg.title}</h4>
                        <p style={{ margin: 0, fontSize: "11px", color: "var(--text-slate)" }}>
                          Subject: {asg.subject} • Due: {asg.dueDate}
                        </p>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "11px", fontWeight: "bold", color: "var(--gold-faith)" }}>+{asg.points} XP</span>
                        {asg.status === "Completed" ? (
                          <span className="online-capsule" style={{ background: "rgba(16, 185, 129, 0.12)", color: "#10b981", fontSize: "10px", padding: "2px 8px" }}>Finished</span>
                        ) : (
                          <span className="online-capsule" style={{ background: "rgba(245, 158, 11, 0.12)", color: "#f59e0b", fontSize: "10px", padding: "2px 8px" }}>Pending</span>
                        )}
                      </div>
                    </div>

                    <p style={{ margin: "0 0 12px 0", fontSize: "12px", color: "rgba(255,255,255,0.85)", lineHeight: "1.4" }}>{asg.desc}</p>

                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                      {asg.status !== "Completed" && (
                        <button 
                          className="btn-secondary" 
                          style={{ padding: "4px 10px", fontSize: "11px", borderColor: "rgba(16, 185, 129, 0.3)", color: "#10b981" }}
                          onClick={() => handleToggleAssignmentStatus(asg.id)}
                        >
                          <Check size={11} style={{ marginRight: "4px" }} />
                          <span>Mark Finished</span>
                        </button>
                      )}
                      <button 
                        className="btn-secondary" 
                        style={{ padding: "4px 8px", color: "#f87171" }}
                        onClick={() => handleDeleteAssignmentStatus(asg.id)}
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      )}

      {/* ----------------------------------------------------
          TAB: SESSION NOTES & BADGES (ACADEMIC VS CHARACTER)
          ---------------------------------------------------- */}
      {activeSubTab === "Notes" && (
        <div className="panel-card animate-scale-up">
          <div className="panel-card-header">
            <h3>Log Session Feedback & Notes</h3>
            <p>Submitted notes instantly appear in Parent Overview and push Caleb's overall progress forward!</p>
          </div>

          {/* Note Sub-Tabs */}
          <div className="notes-subtabs-row" style={{ display: "flex", gap: "10px", margin: "1.5rem 0", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "12px" }}>
            <button 
              type="button" 
              className={`dashboard-tab-trigger ${notesSubTab === "Academic" ? "active" : ""}`}
              style={{ 
                padding: "8px 16px", 
                borderRadius: "6px", 
                border: "none", 
                cursor: "pointer",
                background: notesSubTab === "Academic" ? "linear-gradient(135deg, #5345ff, #17e9ce)" : "transparent",
                color: notesSubTab === "Academic" ? "#070a1e" : "var(--text-slate)",
                fontWeight: "bold",
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}
              onClick={() => setNotesSubTab("Academic")}
            >
              📚 Academic Feedback
            </button>
            <button 
              type="button" 
              className={`dashboard-tab-trigger ${notesSubTab === "Character" ? "active" : ""}`}
              style={{ 
                padding: "8px 16px", 
                borderRadius: "6px", 
                border: "none", 
                cursor: "pointer",
                background: notesSubTab === "Character" ? "linear-gradient(135deg, #5345ff, #17e9ce)" : "transparent",
                color: notesSubTab === "Character" ? "#070a1e" : "var(--text-slate)",
                fontWeight: "bold",
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}
              onClick={() => setNotesSubTab("Character")}
            >
              ✨ Character & Virtues Notes
            </button>
          </div>

          {notesSubTab === "Academic" ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
              <div>
                {noteSubmitted ? (
                  <div className="success-banner animate-scale-up text-center" style={{ padding: "24px" }}>
                    <CheckCircle className="success-tick-icon" />
                    <h4>Academic Notes Logged!</h4>
                    <p>The report cards and metrics have updated. Student overall progress +4%.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSaveNotes} className="tutor-action-form">
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                      <div className="form-group">
                        <label>Student Tutored *</label>
                        <select value={selectedStudentId} onChange={(e) => setSelectedStudentId(e.target.value)} style={{ width: "100%" }}>
                          {allStudents.map((s) => (
                            <option key={s.id} value={s.id}>{s.name} ({s.grade})</option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Core Subject *</label>
                        <select value={noteSubject} onChange={(e) => setNoteSubject(e.target.value)} style={{ width: "100%" }}>
                          <option value="Pre-Calculus">Pre-Calculus</option>
                          <option value="Reading & Writing">Reading & Writing</option>
                          <option value="SAT Prep Math">SAT Prep Math</option>
                          <option value="Science">Science (Physics)</option>
                          <option value="Character Education">Character Education</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Comprehension Summary *</label>
                      <textarea
                        rows="4"
                        required
                        placeholder="Discuss what was practiced, where the student thrived, or what concepts required further practice..."
                        value={noteSummary}
                        onChange={(e) => setNoteSummary(e.target.value)}
                        style={{ width: "100%", background: "#0c0f33", border: "1px solid #2e3573", color: "#fff", padding: "10px", borderRadius: "6px" }}
                      ></textarea>
                    </div>

                    <div className="form-group">
                      <label>Recommended Next Steps / Homework</label>
                      <textarea
                        rows="2"
                        placeholder="E.g., Complete page proofs, practice trig identities before Friday..."
                        value={noteNextSteps}
                        onChange={(e) => setNoteNextSteps(e.target.value)}
                        style={{ width: "100%", background: "#0c0f33", border: "1px solid #2e3573", color: "#fff", padding: "10px", borderRadius: "6px" }}
                      ></textarea>
                    </div>

                    <button type="submit" className="btn-primary-glowing" style={{ width: "100%", justifyContent: "center" }}>
                      <span>Submit Session Notes</span>
                    </button>
                  </form>
                )}
              </div>

              {/* Session notes log feed */}
              <div>
                <h4 style={{ margin: "0 0 12px 0", color: "#fff" }}>Historical Feedback Registry</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxHeight: "400px", overflowY: "auto" }}>
                  {sessionNotes.filter(n => n.studentId === selectedStudentId).length === 0 ? (
                    <p style={{ fontStyle: "italic", fontSize: "13px" }}>No past notes recorded for this student.</p>
                  ) : (
                    sessionNotes.filter(n => n.studentId === selectedStudentId).map(note => (
                      <div key={note.id} style={{ background: "rgba(255,255,255,0.015)", padding: "16px", border: "1px solid rgba(255,255,255,0.03)", borderRadius: "10px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--turquoise-accent)", marginBottom: "6px" }}>
                          <strong>{note.tutorName} • {note.subject}</strong>
                          <span>{note.date}</span>
                        </div>
                        <p style={{ margin: "0 0 8px 0", fontSize: "13px", color: "#fff", lineHeight: "1.4" }}>{note.summary}</p>
                        {note.nextSteps && (
                          <div style={{ borderTop: "1px dashed rgba(255,255,255,0.06)", paddingTop: "6px", fontSize: "11px", color: "var(--gold-faith)" }}>
                            <strong>Next Steps:</strong> {note.nextSteps}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Character and Virtues Layout */
            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "24px" }}>
              
              {/* Character notes form */}
              <div className="char-notes-form-container">
                <div className="section-title-badge-row" style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "1rem" }}>
                  <span style={{ fontSize: "1.2rem" }}>📝</span>
                  <h4 style={{ margin: 0, fontWeight: "700", color: "#fff" }}>Log Character Virtues & Notes</h4>
                </div>
                
                {charSubmitted ? (
                  <div className="success-banner animate-scale-up text-center" style={{ padding: "2rem", background: "rgba(13, 148, 136, 0.1)", borderRadius: "8px", border: "1px solid rgba(13, 148, 136, 0.3)" }}>
                    <CheckCircle className="success-tick-icon" style={{ color: "#17e9ce", width: "40px", height: "40px", marginBottom: "10px" }} />
                    <h4 style={{ color: "#17e9ce" }}>Character Notes Logged!</h4>
                    <p style={{ color: "#fff", fontSize: "0.9rem" }}>Virtue metrics updated on parent portal. Student was credited +10 XP.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSaveCharacterNotes} className="tutor-action-form">
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                      <div className="form-group">
                        <label>Character Theme *</label>
                        <select value={charTheme} onChange={(e) => setCharTheme(e.target.value)} style={{ width: "100%" }}>
                          <option value="Integrity">Integrity</option>
                          <option value="Responsibility">Responsibility</option>
                          <option value="Respect">Respect</option>
                          <option value="Kindness">Kindness</option>
                          <option value="Honesty">Honesty</option>
                          <option value="Perseverance">Perseverance</option>
                          <option value="Gratitude">Gratitude</option>
                          <option value="Self-Control">Self-Control</option>
                          <option value="Leadership">Leadership</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Strength Observed *</label>
                        <select value={charStrength} onChange={(e) => setCharStrength(e.target.value)} style={{ width: "100%" }}>
                          <option value="Integrity">Integrity</option>
                          <option value="Responsibility">Responsibility</option>
                          <option value="Kindness">Kindness</option>
                          <option value="Perseverance">Perseverance</option>
                          <option value="Leadership">Leadership</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Student Response *</label>
                      <textarea
                        rows="2"
                        required
                        placeholder="How did the learner respond to the theme taught?"
                        value={charResponse}
                        onChange={(e) => setCharResponse(e.target.value)}
                        style={{ width: "100%", background: "#0c0f33", border: "1px solid #2e3573", color: "#fff", padding: "10px", borderRadius: "6px" }}
                      ></textarea>
                    </div>

                    <div className="form-group">
                      <label>Observed Growth Detail *</label>
                      <textarea
                        rows="2"
                        required
                        placeholder="Describe specific strengths or steps observed during the block..."
                        value={charGrowth}
                        onChange={(e) => setCharGrowth(e.target.value)}
                        style={{ width: "100%", background: "#0c0f33", border: "1px solid #2e3573", color: "#fff", padding: "10px", borderRadius: "6px" }}
                      ></textarea>
                    </div>

                    <div className="form-group">
                      <label>Follow-up Recommendation *</label>
                      <textarea
                        rows="2"
                        required
                        placeholder="E.g., Complete chore boards or family responsibility checklists..."
                        value={charRecommendation}
                        onChange={(e) => setCharRecommendation(e.target.value)}
                        style={{ width: "100%", background: "#0c0f33", border: "1px solid #2e3573", color: "#fff", padding: "10px", borderRadius: "6px" }}
                      ></textarea>
                    </div>

                    <button type="submit" className="btn-primary-glowing" style={{ width: "100%", justifyContent: "center" }}>
                      <span>Submit Character Notes</span>
                    </button>
                  </form>
                )}
              </div>

              {/* Award character badge */}
              <div className="char-badge-award-container" style={{ borderLeft: "1px solid rgba(255,255,255,0.06)", paddingLeft: "24px" }}>
                <div className="section-title-badge-row" style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "1rem" }}>
                  <span style={{ fontSize: "1.2rem" }}>🏆</span>
                  <h4 style={{ margin: 0, fontWeight: "700", color: "#fff" }}>Award Character Badge</h4>
                </div>
                
                <p style={{ fontSize: "12px", color: "var(--text-slate)", marginBottom: "1.5rem" }}>
                  Acknowledge milestones! Awarding badges awards +50 XP and displays instantly on profiles.
                </p>

                <form onSubmit={handleAwardBadgeSubmit} className="tutor-action-form">
                  <div className="form-group">
                    <label>Choose Badge *</label>
                    <select 
                      value={selectedBadge} 
                      onChange={(e) => setSelectedBadge(e.target.value)}
                      style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #2e3573", background: "#0c0f33", color: "#fff" }}
                    >
                      {CHARACTER_BADGES.map((badge) => (
                        <option key={badge.name} value={badge.name}>
                          {badge.emoji} {badge.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {(() => {
                    const badgeObj = CHARACTER_BADGES.find(b => b.name === selectedBadge);
                    if (!badgeObj) return null;
                    return (
                      <div 
                        className="badge-preview-card animate-scale-up" 
                        style={{
                          background: "rgba(255, 255, 255, 0.01)",
                          border: "1px dashed rgba(83, 69, 255, 0.3)",
                          borderRadius: "12px",
                          padding: "1.5rem",
                          textAlign: "center",
                          margin: "1.5rem 0"
                        }}
                      >
                        <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>{badgeObj.emoji}</div>
                        <h4 style={{ margin: "0 0 0.5rem 0", color: "#fff", fontWeight: "bold" }}>{badgeObj.name}</h4>
                        <p style={{ margin: 0, fontSize: "12px", color: "var(--text-slate)", fontStyle: "italic" }}>"{badgeObj.desc}"</p>
                      </div>
                    );
                  })()}

                  <button 
                    type="submit" 
                    className="btn-primary-glowing" 
                    style={{ 
                      width: "100%", 
                      justifyContent: "center", 
                      background: "linear-gradient(135deg, #5345ff, #be185d)" 
                    }}
                  >
                    <Award className="btn-icon" style={{ marginRight: "6px" }} />
                    <span>Award Badge to {activeStudent ? activeStudent.name.split(' ')[0] : "Student"}</span>
                  </button>

                  {badgeSuccessMessage && (
                    <div className="success-banner animate-scale-up text-center" style={{ marginTop: "1rem", fontSize: "12px" }}>
                      {badgeSuccessMessage}
                    </div>
                  )}
                </form>
              </div>

            </div>
          )}
        </div>
      )}

      {/* ----------------------------------------------------
          TAB: PROGRESS REPORTS BUILDER & LEDGER
          ---------------------------------------------------- */}
      {activeSubTab === "Reports" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }} className="animate-scale-up">
          
          {/* Report builder */}
          <div className="panel-card">
            <div className="panel-card-header">
              <h3>Progress Report Builder</h3>
              <p>Construct official term report cards with custom corporate letterheads.</p>
            </div>

            {reportSuccess && (
              <div className="success-banner animate-scale-up" style={{ padding: "10px", background: "rgba(23, 233, 206, 0.12)", color: "var(--turquoise-accent)", borderRadius: "6px", margin: "1rem 0" }}>
                {reportSuccess}
              </div>
            )}

            <form onSubmit={handleCreateReport} className="tutor-action-form" style={{ marginTop: "1.5rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="form-group">
                  <label>Student *</label>
                  <select value={selectedStudentId} onChange={e => setSelectedStudentId(e.target.value)} style={{ width: "100%" }}>
                    {allStudents.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.grade})</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Report Type *</label>
                  <select value={reportType} onChange={e => setReportType(e.target.value)} style={{ width: "100%" }}>
                    <option value="Monthly Progress Review">Monthly Progress Review</option>
                    <option value="Mid-Term Assessment">Mid-Term Assessment</option>
                    <option value="Final Term Report Card">Final Term Report Card</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Reporting Evaluation Period *</label>
                <input 
                  type="text" 
                  value={reportPeriod} 
                  onChange={e => setReportPeriod(e.target.value)} 
                  style={{ width: "100%", background: "#0c0f33", border: "1px solid #2e3573", color: "#fff", padding: "10px", borderRadius: "6px" }}
                />
              </div>

              <div className="form-group">
                <label>Academic Performance Narrative *</label>
                <textarea 
                  rows="3" 
                  required 
                  placeholder="Summarize academic growth, diagnostic test performance, and skills mastered..." 
                  value={reportAcademicEval} 
                  onChange={e => setReportAcademicEval(e.target.value)}
                  style={{ width: "100%", background: "#0c0f33", border: "1px solid #2e3573", color: "#fff", padding: "10px", borderRadius: "6px" }}
                />
              </div>

              <div className="form-group">
                <label>Character & Leadership Integration Narrative *</label>
                <textarea 
                  rows="3" 
                  required 
                  placeholder="Detail moral growth, focus development, and the application of weekly virtues..." 
                  value={reportCharacterEval} 
                  onChange={e => setReportCharacterEval(e.target.value)}
                  style={{ width: "100%", background: "#0c0f33", border: "1px solid #2e3573", color: "#fff", padding: "10px", borderRadius: "6px" }}
                />
              </div>

              <h5 style={{ margin: "1rem 0 10px 0", color: "#fff", textTransform: "uppercase", fontSize: "11px" }}>Rate Competency Benchmarks (1 - 5)</h5>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginBottom: "1.5rem" }}>
                {Object.keys(reportScores).map(comp => (
                  <div key={comp} className="form-group">
                    <label style={{ fontSize: "10px" }}>{comp} *</label>
                    <select 
                      value={reportScores[comp]} 
                      onChange={e => handleScoreChange(comp, e.target.value)}
                      style={{ width: "100%", background: "#0c0f33", border: "1px solid #2e3573", color: "#fff", padding: "6px", borderRadius: "6px" }}
                    >
                      <option value="1">1 (Needs Work)</option>
                      <option value="2">2 (Developing)</option>
                      <option value="3">3 (Sufficient)</option>
                      <option value="4">4 (Commendable)</option>
                      <option value="5">5 (Exceptional)</option>
                    </select>
                  </div>
                ))}
              </div>

              <button type="submit" className="btn-primary-glowing" style={{ width: "100%", justifyContent: "center" }}>
                <FileText size={14} className="btn-icon" />
                <span>Generate Official Report Card</span>
              </button>
            </form>
          </div>

          {/* Reports ledger list */}
          <div className="panel-card">
            <h3>Progress Reports Ledger</h3>
            <p>Roster containing compiled evaluations. Open formal printable layouts.</p>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "1.5rem" }}>
              {generatedReports.map(rep => (
                <div key={rep.id} style={{ background: "rgba(255,255,255,0.015)", padding: "16px", border: "1px solid rgba(255,255,255,0.03)", borderRadius: "10px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                    <div>
                      <h4 style={{ margin: "0 0 2px 0", color: "#fff", fontSize: "14px" }}>{rep.type}</h4>
                      <p style={{ margin: 0, fontSize: "11px", color: "var(--text-slate)" }}>
                        Student: <strong>{rep.studentName}</strong> • Period: {rep.period}
                      </p>
                    </div>
                    <span style={{ fontSize: "11px", color: "var(--gold-faith)", fontWeight: "bold" }}>{rep.date}</span>
                  </div>

                  <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                    <button className="btn-secondary" style={{ padding: "4px 10px", fontSize: "11px" }} onClick={() => setSelectedViewReport(rep)}>
                      <Printer size={11} style={{ marginRight: "4px" }} />
                      <span>View Report Card</span>
                    </button>
                    <button className="btn-secondary" style={{ padding: "4px 10px", fontSize: "11px" }} onClick={() => handleEmailParentReport(rep)}>
                      <Mail size={11} style={{ marginRight: "4px" }} />
                      <span>Email Parent</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ----------------------------------------------------
          PROGRESS REPORT FORMAL PRINT OVERLAY MODAL
          ---------------------------------------------------- */}
      {selectedViewReport && (
        <div className="report-modal-backdrop animate-fade-in">
          <div className="report-card-print-box animate-scale-up">
            
            {/* Header banner */}
            <div className="report-header-banner">
              <div>
                <h3 style={{ margin: 0, fontFamily: "var(--serif)", fontSize: "20px", fontWeight: "bold", letterSpacing: "1px" }}>AMBIENCE TUTORSFLOW™</h3>
                <p style={{ margin: 0, fontSize: "10px", letterSpacing: "1px", color: "var(--gold-faith)" }}>SOLI DEO GLORIA • CHARACTER EDUCATION</p>
              </div>
              <button 
                onClick={() => setSelectedViewReport(null)}
                style={{ background: "transparent", border: "none", color: "#fff", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Printable Body */}
            <div className="report-printable-body">
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px", fontSize: "12px", borderBottom: "1px solid #e2e8f0", paddingBottom: "12px" }}>
                <div>
                  <p style={{ margin: "0 0 4px 0" }}>Student Name: <strong>{selectedViewReport.studentName}</strong></p>
                  <p style={{ margin: 0 }}>Report Type: <strong>{selectedViewReport.type}</strong></p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ margin: "0 0 4px 0" }}>Date Compiled: <strong>{selectedViewReport.date}</strong></p>
                  <p style={{ margin: 0 }}>Reporting Tutor: <strong>{selectedViewReport.tutor}</strong></p>
                </div>
              </div>

              <div className="report-printable-section-title">I. Academic Evaluation Narrative</div>
              <p style={{ fontSize: "13px", lineHeight: "1.6", color: "#2d3748", margin: "0 0 20px 0" }}>{selectedViewReport.academicEval}</p>

              <div className="report-printable-section-title">II. Character & Virtues Integration Narrative</div>
              <p style={{ fontSize: "13px", lineHeight: "1.6", color: "#2d3748", margin: "0 0 20px 0" }}>{selectedViewReport.characterEval}</p>

              <div className="report-printable-section-title">III. Core Competency Benchmarks (Grade 1 - 5)</div>
              <div className="report-comp-grid">
                {Object.entries(selectedViewReport.scores).map(([name, score]) => (
                  <div key={name} className="report-comp-card">
                    <h5>{name}</h5>
                    <strong>{score} / 5</strong>
                  </div>
                ))}
              </div>

              {/* Faith-inspired scripture quote */}
              <div style={{ marginTop: "30px", borderTop: "2px solid #edf2f7", paddingTop: "16px", textAlign: "center", fontStyle: "italic", fontSize: "12px", color: "#4a5568", fontFamily: "var(--serif)" }}>
                "Commit your actions to the Lord, and your plans will succeed." — Proverbs 16:3
              </div>

              {/* Footer signature */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "40px" }}>
                <div>
                  <p style={{ margin: "0 0 4px 0", fontSize: "10px", color: "#a0aec0" }}>OFFICIAL REPORT VERIFICATION</p>
                  <span style={{ fontFamily: "var(--serif)", fontSize: "14px", fontStyle: "italic", color: "#5345ff" }}>Mrs. Sarah Jenkins</span>
                  <div style={{ width: "150px", height: "1px", background: "#cbd5e0", marginTop: "4px" }}></div>
                  <p style={{ margin: "4px 0 0 0", fontSize: "11px", color: "#718096" }}>Tutor Digital Signature</p>
                </div>
                
                <div style={{ display: "flex", gap: "10px" }}>
                  <button 
                    className="btn-secondary" 
                    style={{ background: "#edf2f7", border: "1px solid #cbd5e0", color: "#2d3748", padding: "6px 12px", fontSize: "12px" }}
                    onClick={() => { alert("Initializing standard OS print spooler... Connection secure."); }}
                  >
                    <Printer size={13} style={{ marginRight: "4px" }} />
                    <span>Print Report</span>
                  </button>
                  <button 
                    className="btn-primary-glowing" 
                    style={{ padding: "6px 12px", fontSize: "12px" }}
                    onClick={() => { alert("Generating encrypted PDF. Preparing download..."); }}
                  >
                    <Download size={13} style={{ marginRight: "4px" }} />
                    <span>Download PDF</span>
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* ----------------------------------------------------
          TAB: FINANCIALS & REVENUE CONTROL
          ---------------------------------------------------- */}
      {activeSubTab === "Revenue" && (
        <div className="animate-scale-up">
          
          {/* Revenue metrics cards */}
          <div className="billing-stat-cards" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "20px" }}>
            <div className="billing-stat-card">
              <div className="billing-stat-icon-wrapper" style={{ background: "rgba(16, 185, 129, 0.12)", color: "#10b981" }}>
                <DollarSign size={20} />
              </div>
              <div className="billing-stat-card-text">
                <h5>Accumulated Net Earnings</h5>
                <h2>${revenueStats.tutorEarningsPayout.toFixed(2)}</h2>
              </div>
            </div>

            <div className="billing-stat-card">
              <div className="billing-stat-icon-wrapper" style={{ background: "rgba(245, 158, 11, 0.12)", color: "#fbbf24" }}>
                <Clock size={20} />
              </div>
              <div className="billing-stat-card-text">
                <h5>Commission Deducted (20%)</h5>
                <h2>${revenueStats.commissionCollected.toFixed(2)}</h2>
              </div>
            </div>

            <div className="billing-stat-card">
              <div className="billing-stat-icon-wrapper" style={{ background: "rgba(99, 102, 241, 0.12)", color: "#818cf8" }}>
                <TrendingUp size={20} />
              </div>
              <div className="billing-stat-card-text">
                <h5>Gross Revenue Accrued</h5>
                <h2>${revenueStats.grossRevenue.toFixed(2)}</h2>
              </div>
            </div>

            <div className="billing-stat-card">
              <div className="billing-stat-icon-wrapper" style={{ color: "var(--text-white)" }}>
                <Sliders size={20} />
              </div>
              <div className="billing-stat-card-text">
                <h5>Hourly Contract Rate</h5>
                <h2>${profileData.hourlyRate}.00 / hr</h2>
              </div>
            </div>
          </div>

          <div className="billing-flex-layout">
            
            {/* Generate Invoice */}
            <div className="panel-card">
              <div className="panel-card-header">
                <h3>Generate Standard Invoice</h3>
                <p>Creates itemized billing items reactively syncing to the parent dashboard.</p>
              </div>

              {invoiceSuccessMessage && (
                <div className="success-banner animate-scale-up" style={{ padding: "10px", background: "rgba(16, 185, 129, 0.12)", color: "#10b981", borderRadius: "6px", margin: "1rem 0" }}>
                  {invoiceSuccessMessage}
                </div>
              )}

              <form onSubmit={handleCreateInvoiceSubmit} className="tutor-action-form" style={{ marginTop: "1rem" }}>
                <div className="form-group">
                  <label>Billable Student *</label>
                  <select value={invoiceStudent} onChange={(e) => setInvoiceStudent(e.target.value)} style={{ width: "100%" }}>
                    {allStudents.map(s => (
                      <option key={s.id} value={s.name}>{s.name} ({s.grade})</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Core Service Rendered *</label>
                  <select value={invoiceService} onChange={(e) => setInvoiceService(e.target.value)} style={{ width: "100%" }}>
                    <option value="Pre-Calculus Tutoring Block (2 Sessions)">Pre-Calculus Tutoring Block (2 Sessions)</option>
                    <option value="SAT Prep Core Block (10 Sessions)">SAT Prep Core Block (10 Sessions)</option>
                    <option value="Grade 1-5 Reading Block (4 Sessions)">Grade 1-5 Reading Block (4 Sessions)</option>
                    <option value="Academic IEP Consultation Review">Academic IEP Consultation Review</option>
                  </select>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div className="form-group">
                    <label>Amount Due ($) *</label>
                    <input 
                      type="number" 
                      required 
                      value={invoiceAmount} 
                      onChange={e => setInvoiceAmount(e.target.value)} 
                      style={{ width: "100%", background: "#0c0f33", border: "1px solid #2e3573", color: "#fff", padding: "10px", borderRadius: "6px" }}
                    />
                  </div>
                  <div className="form-group">
                    <label>Due Date *</label>
                    <input 
                      type="date" 
                      required 
                      value={invoiceDueDate} 
                      onChange={e => setInvoiceDueDate(e.target.value)} 
                      style={{ width: "100%", background: "#0c0f33", border: "1px solid #2e3573", color: "#fff", padding: "10px", borderRadius: "6px" }}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Billing Period Label *</label>
                  <input 
                    type="text" 
                    required 
                    value={invoiceBillingPeriod} 
                    onChange={e => setInvoiceBillingPeriod(e.target.value)} 
                    style={{ width: "100%", background: "#0c0f33", border: "1px solid #2e3573", color: "#fff", padding: "10px", borderRadius: "6px" }}
                  />
                </div>

                <button type="submit" className="btn-primary-glowing" style={{ width: "100%", justifyContent: "center" }}>
                  <PlusCircle size={14} className="btn-icon" style={{ marginRight: "6px" }} />
                  <span>Generate & Sync Invoice</span>
                </button>
              </form>
            </div>

            {/* Invoices Ledger */}
            <div className="panel-card">
              <h3>Invoices Ledger</h3>
              <p>Roster tracing payment clears. Tutors can audit transaction statuses.</p>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "1.5rem" }}>
                {(revenueStats.invoices && revenueStats.invoices.length > 0 ? revenueStats.invoices : invoices).map(inv => (
                  <div key={inv.id} style={{ background: "rgba(255,255,255,0.015)", padding: "16px", border: "1px solid rgba(255,255,255,0.03)", borderRadius: "10px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                      <div>
                        <h4 style={{ margin: "0 0 2px 0", color: "#fff", fontSize: "14px" }}>{inv.service || inv.service_description}</h4>
                        <p style={{ margin: 0, fontSize: "11px", color: "var(--text-slate)" }}>
                          Student: <strong>{inv.studentName}</strong> • Period: {inv.billingPeriod}
                        </p>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <span style={{ fontSize: "14px", fontWeight: "bold", color: "#fff", display: "block" }}>
                          ${inv.amount.toFixed(2)}
                        </span>
                        {inv.status === "Paid" ? (
                          <span className="online-capsule" style={{ background: "rgba(16, 185, 129, 0.12)", color: "#10b981", fontSize: "10px", padding: "1px 6px" }}>✓ Settled</span>
                        ) : (
                          <span className="online-capsule" style={{ background: "rgba(239, 68, 68, 0.12)", color: "#f87171", fontSize: "10px", padding: "1px 6px" }}>Unpaid</span>
                        )}
                      </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.04)", paddingTop: "8px", marginTop: "8px", fontSize: "11px" }}>
                      <span>Due Date: <strong>{inv.dueDate}</strong></span>
                      {inv.status === "Unpaid" && (
                        <button 
                          className="btn-secondary" 
                          style={{ padding: "2px 8px", fontSize: "10px" }}
                          onClick={async () => {
                            try {
                              const response = await apiFetch("http://localhost:5000/api/invoices/pay", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ invoiceId: inv.id })
                              });
                              if (!response.ok) throw new Error("Pay API failure");
                            } catch (err) {
                              console.warn("[Invoice Pay Sync] Offline, processing locally.", err);
                            }
                            payInvoice(inv.id);
                            fetchTutorRevenue();
                            alert(`Invoice #${inv.id} marked as Paid! Revenue metrics updated.`);
                          }}
                        >
                          Mark Paid
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Cleared Payments & Disbursements */}
          <div className="panel-card" style={{ marginTop: "20px" }}>
            <div className="panel-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3>Cleared Payments & Disbursements</h3>
                <p>Real-time audit trail of client tutoring payments, commission splits, and net payouts.</p>
              </div>
              <span className="online-capsule" style={{ background: "rgba(99, 102, 241, 0.15)", color: "var(--text-white)", fontSize: "11px", padding: "4px 10px" }}>
                {revenueStats.transactions?.length || 0} Settled Payments
              </span>
            </div>

            <div style={{ overflowX: "auto", marginTop: "1.2rem" }}>
              <table className="parent-table" style={{ width: "100%", borderCollapse: "collapse", color: "#fff" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", textAlign: "left" }}>
                    <th style={{ padding: "12px", color: "var(--text-slate)", fontSize: "11px", textTransform: "uppercase" }}>Transaction ID</th>
                    <th style={{ padding: "12px", color: "var(--text-slate)", fontSize: "11px", textTransform: "uppercase" }}>Client Student</th>
                    <th style={{ padding: "12px", color: "var(--text-slate)", fontSize: "11px", textTransform: "uppercase" }}>Subject / Lesson</th>
                    <th style={{ padding: "12px", color: "var(--text-slate)", fontSize: "11px", textTransform: "uppercase" }}>Provider</th>
                    <th style={{ padding: "12px", color: "var(--text-slate)", fontSize: "11px", textTransform: "uppercase" }}>Gross Amount</th>
                    <th style={{ padding: "12px", color: "var(--text-slate)", fontSize: "11px", textTransform: "uppercase" }}>Platform Split</th>
                    <th style={{ padding: "12px", color: "var(--text-slate)", fontSize: "11px", textTransform: "uppercase" }}>Net Payout</th>
                    <th style={{ padding: "12px", color: "var(--text-slate)", fontSize: "11px", textTransform: "uppercase" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {revenueStats.transactions && revenueStats.transactions.length > 0 ? (
                    revenueStats.transactions.map((tx) => (
                      <tr key={tx.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", fontSize: "13px" }}>
                        <td style={{ padding: "12px" }}>
                          <span style={{ fontFamily: "monospace", color: "var(--text-slate)" }}>#{tx.id}</span>
                        </td>
                        <td style={{ padding: "12px" }}>{tx.studentName}</td>
                        <td style={{ padding: "12px" }}>
                          <div>
                            <span style={{ fontWeight: "500" }}>{tx.subject}</span>
                            <p style={{ margin: 0, fontSize: "10px", color: "var(--text-slate)" }}>
                              {tx.date} • {tx.timeSlot}
                            </p>
                          </div>
                        </td>
                        <td style={{ padding: "12px" }}>
                          <span style={{ 
                            background: tx.provider === "STRIPE" ? "rgba(99, 102, 241, 0.15)" : tx.provider === "PAYPAL" ? "rgba(59, 130, 246, 0.15)" : "rgba(245, 158, 11, 0.15)",
                            color: tx.provider === "STRIPE" ? "#818cf8" : tx.provider === "PAYPAL" ? "#60a5fa" : "#fbbf24",
                            fontSize: "10px", padding: "3px 8px", borderRadius: "4px", fontWeight: "bold"
                          }}>
                            {tx.provider}
                          </span>
                        </td>
                        <td style={{ padding: "12px", fontWeight: "bold" }}>${tx.amount.toFixed(2)}</td>
                        <td style={{ padding: "12px", color: "var(--gold-faith)" }}>
                          -${tx.commissionAmount?.toFixed(2)} ({tx.commissionPercent}%)
                        </td>
                        <td style={{ padding: "12px", color: "#10b981", fontWeight: "bold" }}>
                          +${tx.tutorEarnings?.toFixed(2)}
                        </td>
                        <td style={{ padding: "12px" }}>
                          <span style={{ 
                            background: tx.status === "Paid" ? "rgba(16, 185, 129, 0.12)" : "rgba(245, 158, 11, 0.12)",
                            color: tx.status === "Paid" ? "#10b981" : "#fbbf24",
                            fontSize: "11px", padding: "3px 8px", borderRadius: "4px"
                          }}>
                            {tx.status === "Paid" ? "✓ Settled" : "⏳ Pending"}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" style={{ padding: "24px", textAlign: "center", color: "var(--text-slate)", fontSize: "14px" }}>
                        No settled transaction history found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ----------------------------------------------------
          TAB: DIRECT MESSAGING CHATS (PARENT CHATS)
          ---------------------------------------------------- */}
      {activeSubTab === "Chat" && (
        <div className="panel-card chat-panel-card animate-scale-up">
          <div className="chat-layout-multithread">
            
            {/* Thread sidebar selector */}
            <div className="chat-parents-sidebar">
              <div className="chat-sidebar-search">
                Parent Contacts
              </div>
              
              {Object.entries(parentsMap).map(([id, parent]) => (
                <button 
                  key={id}
                  className={`chat-parent-thread-row ${selectedParentId === id ? "active" : ""}`}
                  onClick={() => setSelectedParentId(id)}
                >
                  <div className="chat-parent-avatar">{parent.avatar}</div>
                  <div className="chat-parent-meta">
                    <h5>{parent.name}</h5>
                    <p>Parent of {parent.student.split(' ')[0]}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Chat Thread Container */}
            <div className="chat-thread-container">
              <div className="chat-thread-header" style={{ padding: "16px 20px" }}>
                <h4>Conversing with Parent: {activeParent.name}</h4>
                <span className="online-capsule">Connected Sync</span>
              </div>

              <div className="chat-messages-scroll" style={{ padding: "20px" }}>
                {filteredMessages.length === 0 ? (
                  <p className="no-chat-p">No message history with {activeParent.name}. Start the thread below!</p>
                ) : (
                  filteredMessages.map((m) => (
                    <div key={m.id} className={`chat-message-row ${m.from === tutorName ? "sent" : "received"}`}>
                      <div className="message-bubble">
                        <p>{m.text}</p>
                        <span className="message-timestamp">{m.time}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <form className="chat-input-row" onSubmit={handleSendMessage} style={{ padding: "12px 20px" }}>
                <input
                  type="text"
                  placeholder={`Write secure message to ${activeParent.name}...`}
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  required
                />
                <button type="submit" className="btn-chat-send">
                  <Send className="chat-send-icon" />
                </button>
              </form>
            </div>

          </div>
        </div>
      )}

      {/* ----------------------------------------------------
          TAB: INVITE & WEEKLY AVAILABILITY CALENDAR
          ---------------------------------------------------- */}
      {activeSubTab === "Profile" && (
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "24px" }} className="animate-scale-up">
          
          {/* Column 1: Schedule Availability & Zoom Sync */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            
            {/* Availability Calendar */}
            <div className="panel-card" style={{ margin: 0 }}>
              <div className="panel-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h3>Configure Weekly Availability</h3>
                  <p>Define recurring open tutoring blocks. Parents book directly inside these ranges.</p>
                </div>
                <Clock className="tab-trigger-icon" style={{ color: "var(--turquoise-accent)" }} />
              </div>

              {availabilitySuccess && (
                <div className="success-banner animate-scale-up" style={{ padding: "10px", background: "rgba(16, 185, 129, 0.12)", color: "#10b981", borderRadius: "6px", margin: "1rem 0" }}>
                  {availabilitySuccess}
                </div>
              )}

              <form onSubmit={handleSaveAvailability} style={{ marginTop: "1.5rem" }}>
                <div className="form-group">
                  <label>Preferred Timezone Context</label>
                  <select 
                    value={availabilityTimezone} 
                    onChange={e => setAvailabilityTimezone(e.target.value)}
                    style={{ width: "100%", background: "#0c0f33", border: "1px solid #2e3573", color: "#fff", padding: "10px", borderRadius: "6px" }}
                  >
                    <option value="America/New_York (EST)">America/New_York (EST / Eastern Time)</option>
                    <option value="America/Chicago (CST)">America/Chicago (CST / Central Time)</option>
                    <option value="America/Denver (MST)">America/Denver (MST / Mountain Time)</option>
                    <option value="America/Los_Angeles (PST)">America/Los_Angeles (PST / Pacific Time)</option>
                  </select>
                </div>

                <div className="availability-days-grid">
                  {Object.entries(weeklyAvailability).map(([day, slots]) => (
                    <div key={day} className={`availability-day-card ${slots.length > 0 ? "active" : ""}`}>
                      <div className="availability-day-title">{day.substring(0, 3)}</div>
                      
                      {slots.map((slot, idx) => (
                        <div key={idx} className="availability-time-block">
                          <span>{slot.split(' ')[0]}</span>
                          <X 
                            size={10} 
                            className="availability-remove-btn" 
                            onClick={() => {
                              const updated = [...slots];
                              updated.splice(idx, 1);
                              setWeeklyAvailability({ ...weeklyAvailability, [day]: updated });
                            }} 
                          />
                        </div>
                      ))}

                      <button 
                        type="button" 
                        className="btn-secondary" 
                        style={{ padding: "2px 6px", fontSize: "10px", width: "100%", marginTop: "6px" }}
                        onClick={() => {
                          const newSlot = prompt("Enter slot (e.g., 3:00 PM - 4:30 PM):", "3:00 PM - 4:30 PM");
                          if (newSlot) {
                            setWeeklyAvailability({ ...weeklyAvailability, [day]: [...slots, newSlot] });
                          }
                        }}
                      >
                        + Add
                      </button>
                    </div>
                  ))}
                </div>

                <button type="submit" className="btn-primary-glowing" style={{ width: "100%", justifyContent: "center" }}>
                  <span>Save Roster Availability Settings</span>
                </button>
              </form>
            </div>

            {/* Zoom Integration Settings Panel */}
            <div className="panel-card" style={{ margin: 0 }}>
              <div className="panel-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h3>Zoom Virtual Classroom Integration</h3>
                  <p>Auto-generate secure Zoom sessions dynamically when parent tutorials or ad-hoc bookings occur.</p>
                </div>
                <span style={{ fontSize: "20px" }}>📹</span>
              </div>

              {/* Status badges */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "1rem", marginBottom: "1.5rem" }}>
                <span style={{ fontSize: "12px", color: "var(--text-slate)" }}>Status Badge:</span>
                {tutorZoomStatus === "Connected" && (
                  <span className="online-capsule" style={{ background: "rgba(16, 185, 129, 0.15)", color: "#10b981", border: "1px solid rgba(16, 185, 129, 0.3)", padding: "4px 10px", borderRadius: "20px", fontWeight: "bold", fontSize: "11px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                    ● Connected
                  </span>
                )}
                {tutorZoomStatus === "Not Connected" && (
                  <span className="online-capsule" style={{ background: "rgba(255, 255, 255, 0.05)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255, 255, 255, 0.1)", padding: "4px 10px", borderRadius: "20px", fontWeight: "bold", fontSize: "11px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                    ○ Not Connected
                  </span>
                )}
                {tutorZoomStatus === "Reconnect Required" && (
                  <span className="online-capsule animate-pulse" style={{ background: "rgba(245, 158, 11, 0.15)", color: "#f59e0b", border: "1px solid rgba(245, 158, 11, 0.3)", padding: "4px 10px", borderRadius: "20px", fontWeight: "bold", fontSize: "11px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                    ⚠ Reconnect Required
                  </span>
                )}
              </div>

              {/* Authentication Actions */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "1.5rem" }}>
                <button 
                  type="button" 
                  className="btn-primary-glowing" 
                  style={{ width: "100%", justifyContent: "center" }}
                  onClick={() => { window.location.href = "http://localhost:5000/api/zoom/connect?tutorId=tut_1"; }}
                >
                  <span>🔌 Connect Zoom Account via OAuth</span>
                </button>

                <button 
                  type="button" 
                  className="btn-secondary" 
                  style={{ width: "100%", justifyContent: "center", padding: "8px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", fontSize: "11px", color: "rgba(255,255,255,0.7)" }}
                  onClick={async () => {
                    try {
                      const response = await apiFetch("http://localhost:5000/api/zoom/simulate-connect", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ tutorId: "tut_1" })
                      });
                      if (response.ok) {
                        setTutorZoomStatus("Connected");
                        alert("Simulated Zoom OAuth connection activated successfully!");
                      } else {
                        throw new Error();
                      }
                    } catch (err) {
                      setTutorZoomStatus("Connected");
                      alert("Backend offline. Simulated Zoom connection activated locally!");
                    }
                  }}
                >
                  <span>🧪 Simulate Local OAuth Connect</span>
                </button>
              </div>

              {/* Manual Backup past link */}
              <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.06)", paddingTop: "1.5rem" }}>
                <div className="form-group" style={{ marginBottom: "1rem" }}>
                  <label style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "var(--text-slate)", display: "block", marginBottom: "6px" }}>
                    Backup Manual Zoom Room URL
                  </label>
                  <input 
                    type="url" 
                    placeholder="https://zoom.us/j/your-meeting-id" 
                    value={tutorManualZoomLink} 
                    onChange={e => setTutorManualZoomLink(e.target.value)}
                    style={{ width: "100%", background: "#0c0f33", border: "1px solid #2e3573", color: "#fff", padding: "10px", borderRadius: "6px", fontSize: "13px" }}
                  />
                  <p style={{ fontSize: "10.5px", color: "var(--text-slate)", marginTop: "6px", margin: "6px 0 0 0", lineHeight: "1.4" }}>
                    If Zoom OAuth is disconnected, students and parents will automatically be directed to this backup room link when joining classrooms.
                  </p>
                </div>

                {tutorManualZoomLink && (
                  <button 
                    type="button" 
                    className="btn-primary-glowing" 
                    style={{ width: "100%", justifyContent: "center", padding: "8px 12px", fontSize: "12px", background: "linear-gradient(135deg, #10b981, #059669)", border: "none" }}
                    onClick={() => {
                      alert("Backup manual Zoom classroom room link saved successfully!");
                    }}
                  >
                    <span>💾 Save Backup Room Link</span>
                  </button>
                )}
              </div>
            </div>

          </div>

          {/* Invite Parent/Student */}
          <div className="panel-card">
            <div className="panel-card-header">
              <h3>Invite Families</h3>
              <p>Onboard new students and guardians, dispatching register links to emails.</p>
            </div>

            {inviteSuccess && (
              <div className="success-banner animate-scale-up" style={{ padding: "10px", background: "rgba(16, 185, 129, 0.12)", color: "#10b981", borderRadius: "6px", margin: "1rem 0" }}>
                {inviteSuccess}
              </div>
            )}

            <form onSubmit={handleSendInvite} className="tutor-action-form" style={{ marginTop: "1rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "12px" }}>
                <div className="form-group">
                  <label>Learner Name *</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="E.g., Lucas Thompson" 
                    value={inviteData.studentName} 
                    onChange={e => setInviteData({...inviteData, studentName: e.target.value})}
                    style={{ width: "100%", background: "#0c0f33", border: "1px solid #2e3573", color: "#fff", padding: "10px", borderRadius: "6px" }}
                  />
                </div>
                <div className="form-group">
                  <label>Grade Level *</label>
                  <select 
                    value={inviteData.grade} 
                    onChange={e => setInviteData({...inviteData, grade: e.target.value})}
                    style={{ width: "100%", background: "#0c0f33", border: "1px solid #2e3573", color: "#fff", padding: "10px", borderRadius: "6px" }}
                  >
                    <option value="5th Grade">5th Grade</option>
                    <option value="6th Grade">6th Grade</option>
                    <option value="7th Grade">7th Grade</option>
                    <option value="8th Grade">8th Grade</option>
                    <option value="9th Grade">9th Grade</option>
                    <option value="10th Grade">10th Grade</option>
                    <option value="11th Grade">11th Grade</option>
                    <option value="12th Grade">12th Grade</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "12px" }}>
                <div className="form-group">
                  <label>Parent/Guardian Name *</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="E.g., Arthur Thompson" 
                    value={inviteData.parentName} 
                    onChange={e => setInviteData({...inviteData, parentName: e.target.value})}
                    style={{ width: "100%", background: "#0c0f33", border: "1px solid #2e3573", color: "#fff", padding: "10px", borderRadius: "6px" }}
                  />
                </div>
                <div className="form-group">
                  <label>Guardian Email *</label>
                  <input 
                    type="email" 
                    required 
                    placeholder="guardian@email.com" 
                    value={inviteData.parentEmail} 
                    onChange={e => setInviteData({...inviteData, parentEmail: e.target.value})}
                    style={{ width: "100%", background: "#0c0f33", border: "1px solid #2e3573", color: "#fff", padding: "10px", borderRadius: "6px" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "12px" }}>
                <div className="form-group">
                  <label>Core Course Package *</label>
                  <select 
                    value={inviteData.coursePackage} 
                    onChange={e => setInviteData({...inviteData, coursePackage: e.target.value})}
                    style={{ width: "100%", background: "#0c0f33", border: "1px solid #2e3573", color: "#fff", padding: "10px", borderRadius: "6px" }}
                  >
                    <option value="K-12 Reading Block (10 Sessions)">K-12 Reading Block (10 Sessions)</option>
                    <option value="College Calculus Suite (5 Sessions)">College Calculus Suite (5 Sessions)</option>
                    <option value="SAT Prep Block (10 Sessions)">SAT Prep Block (10 Sessions)</option>
                    <option value="Specialized IEP Support Package">Specialized IEP Support Package</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Bill Rate ($ / hr)</label>
                  <input 
                    type="number" 
                    value={inviteData.rate} 
                    onChange={e => setInviteData({...inviteData, rate: e.target.value})}
                    style={{ width: "100%", background: "#0c0f33", border: "1px solid #2e3573", color: "#fff", padding: "10px", borderRadius: "6px" }}
                  />
                </div>
              </div>

              <button type="submit" className="btn-primary-glowing" style={{ width: "100%", justifyContent: "center" }}>
                <UserPlus size={14} className="btn-icon" style={{ marginRight: "6px" }} />
                <span>Transmit Secure Invitation</span>
              </button>
            </form>

            {/* Pending Invites Ledger */}
            <h4 style={{ marginTop: "2rem", color: "#fff" }}>Pending Invitations Ledger</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "1rem" }}>
              {pendingInvites.map(inv => (
                <div key={inv.id} style={{ background: "rgba(255,255,255,0.015)", padding: "12px", border: "1px solid rgba(255,255,255,0.03)", borderRadius: "8px", fontSize: "12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                    <strong>{inv.studentName}</strong>
                    <span style={{ color: "var(--gold-faith)" }}>Pending Register</span>
                  </div>
                  <p style={{ margin: "0 0 6px 0", fontSize: "11px", color: "var(--text-slate)" }}>
                    Parent: {inv.parentName} ({inv.parentEmail}) • Course: {inv.coursePackage}
                  </p>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <button 
                      className="btn-secondary" 
                      style={{ padding: "2px 8px", fontSize: "10px" }}
                      onClick={() => { alert(`Direct registration link copied to clipboard: https://ambience.tutorsflow.com/register?code=${inv.id}`); }}
                    >
                      Copy Link
                    </button>
                    <button 
                      className="btn-secondary" 
                      style={{ padding: "2px 8px", fontSize: "10px", color: "#f87171", border: "none" }}
                      onClick={() => handleWithdrawInvite(inv.id)}
                    >
                      Withdraw
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ----------------------------------------------------
          RESCHEDULE BOOKING OVERLAY MODAL
          ---------------------------------------------------- */}
      {reschedulingSession && (
        <div className="report-modal-backdrop animate-fade-in" style={{ zIndex: 1100 }}>
          <div className="panel-card animate-scale-up" style={{ maxWidth: "480px", width: "100%", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(10,13,44,0.95)", backdropFilter: "blur(12px)", padding: "24px" }}>
            <div className="panel-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3 style={{ margin: 0 }}>Reschedule Tutorial Session</h3>
                <p style={{ margin: "4px 0 0 0" }}>Update date and time context in compliance with roster policies.</p>
              </div>
              <button 
                onClick={() => { setReschedulingSession(null); setRescheduleError(""); setRescheduleSuccess(""); }}
                style={{ background: "transparent", border: "none", color: "#fff", cursor: "pointer", padding: "4px" }}
              >
                <X size={20} />
              </button>
            </div>

            {rescheduleError && (
              <div className="error-banner animate-scale-up" style={{ padding: "12px", background: "rgba(239, 68, 68, 0.12)", color: "#f87171", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: "8px", margin: "1rem 0", fontSize: "13px" }}>
                <strong>Policy Violation:</strong> {rescheduleError}
              </div>
            )}

            {rescheduleSuccess && (
              <div className="success-banner animate-scale-up" style={{ padding: "12px", background: "rgba(23, 233, 206, 0.12)", color: "var(--turquoise-accent)", border: "1px solid rgba(23, 233, 206, 0.2)", borderRadius: "8px", margin: "1rem 0", fontSize: "13px" }}>
                {rescheduleSuccess}
              </div>
            )}

            <div style={{ margin: "1.5rem 0", background: "rgba(255,255,255,0.02)", padding: "12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.04)" }}>
              <p style={{ margin: "0 0 4px 0", fontSize: "12px", color: "var(--text-slate)" }}>Currently Scheduled:</p>
              <p style={{ margin: 0, fontSize: "14px", fontWeight: "bold" }}>{reschedulingSession.subject} Session with {reschedulingSession.studentName}</p>
              <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#fff" }}>{reschedulingSession.date} • {reschedulingSession.time}</p>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();
              setRescheduleError("");
              setRescheduleSuccess("");
              try {
                const response = await apiFetch("http://localhost:5000/api/bookings/reschedule", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    bookingId: reschedulingSession.id,
                    newDate: rescheduleDate,
                    newTimeSlot: rescheduleTime
                  })
                });
                const data = await response.json();
                if (response.ok) {
                  setBookings(prev => prev.map(b => b.id === reschedulingSession.id ? { ...b, date: rescheduleDate, time: rescheduleTime } : b));
                  setRescheduleSuccess(data.message || "Roster updated successfully!");
                  setTimeout(() => {
                    setReschedulingSession(null);
                    setRescheduleSuccess("");
                  }, 2000);
                } else {
                  setRescheduleError(data.message || "Unable to reschedule session due to policy rules.");
                }
              } catch (err) {
                // Fallback state if server is offline
                const bDate = new Date(`${reschedulingSession.date}T12:00:00`);
                const hrsDiff = (bDate.getTime() - Date.now()) / (3600 * 1000);
                if (hrsDiff < 12) {
                  setRescheduleError(`Under organization policy, rescheduling requires at least 12 hours advanced notice. This session begins in ${hrsDiff.toFixed(1)} hours.`);
                } else {
                  setBookings(prev => prev.map(b => b.id === reschedulingSession.id ? { ...b, date: rescheduleDate, time: rescheduleTime } : b));
                  setRescheduleSuccess("Session rescheduled locally (offline fallback mode)!");
                  setTimeout(() => {
                    setReschedulingSession(null);
                    setRescheduleSuccess("");
                  }, 2000);
                }
              }
            }}>
              <div className="form-group" style={{ marginBottom: "1rem" }}>
                <label>Select New Date *</label>
                <input 
                  type="date" 
                  required 
                  value={rescheduleDate} 
                  onChange={e => setRescheduleDate(e.target.value)} 
                  style={{ width: "100%", background: "#0c0f33", border: "1px solid #2e3573", color: "#fff", padding: "10px", borderRadius: "6px" }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: "1.5rem" }}>
                <label>Select Time Slot *</label>
                <input 
                  type="text" 
                  required 
                  value={rescheduleTime} 
                  onChange={e => setRescheduleTime(e.target.value)} 
                  placeholder="E.g., 3:00 PM - 4:30 PM"
                  style={{ width: "100%", background: "#0c0f33", border: "1px solid #2e3573", color: "#fff", padding: "10px", borderRadius: "6px" }}
                />
              </div>

              <button type="submit" className="btn-primary-glowing" style={{ width: "100%", justifyContent: "center" }}>
                <span>Re-schedule & Synchronize</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------
          CANCEL BOOKING OVERLAY MODAL
          ---------------------------------------------------- */}
      {cancellingSession && (
        <div className="report-modal-backdrop animate-fade-in" style={{ zIndex: 1100 }}>
          <div className="panel-card animate-scale-up" style={{ maxWidth: "480px", width: "100%", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(10,13,44,0.95)", backdropFilter: "blur(12px)", padding: "24px" }}>
            <div className="panel-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3 style={{ margin: 0, color: "#f87171" }}>Cancel Scheduled Session</h3>
                <p style={{ margin: "4px 0 0 0" }}>Process cancellation. Note late cancellation charges may apply.</p>
              </div>
              <button 
                onClick={() => { setCancellingSession(null); setCancelReason(""); setCancelError(""); setCancelSuccess(""); }}
                style={{ background: "transparent", border: "none", color: "#fff", cursor: "pointer", padding: "4px" }}
              >
                <X size={20} />
              </button>
            </div>

            {cancelError && (
              <div className="error-banner animate-scale-up" style={{ padding: "12px", background: "rgba(239, 68, 68, 0.12)", color: "#f87171", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: "8px", margin: "1rem 0", fontSize: "13px" }}>
                {cancelError}
              </div>
            )}

            {cancelSuccess && (
              <div className="success-banner animate-scale-up" style={{ padding: "12px", background: "rgba(23, 233, 206, 0.12)", color: "var(--turquoise-accent)", border: "1px solid rgba(23, 233, 206, 0.2)", borderRadius: "8px", margin: "1rem 0", fontSize: "13px" }}>
                {cancelSuccess}
              </div>
            )}

            <div style={{ margin: "1.5rem 0", background: "rgba(255,255,255,0.02)", padding: "12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.04)", fontSize: "13px" }}>
              <p style={{ margin: "0 0 4px 0", color: "var(--text-slate)" }}>Session to Cancel:</p>
              <p style={{ margin: 0, fontSize: "14px", fontWeight: "bold" }}>{cancellingSession.subject} with {cancellingSession.studentName}</p>
              <p style={{ margin: "4px 0 0 0", color: "#fff" }}>{cancellingSession.date} • {cancellingSession.time}</p>
              
              <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid rgba(255,255,255,0.06)", color: "var(--gold-faith)" }}>
                ℹ <strong>Cancellation Policy:</strong> Cancellations made within 24 hours of the start time incur a <strong>50% late fee penalty</strong>. Full refunds applied otherwise.
              </div>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();
              setCancelError("");
              setCancelSuccess("");
              try {
                const response = await apiFetch("http://localhost:5000/api/bookings/cancel", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    bookingId: cancellingSession.id,
                    reason: cancelReason || "Cancelled by tutor"
                  })
                });
                const data = await response.json();
                if (response.ok) {
                  setBookings(prev => prev.map(b => b.id === cancellingSession.id ? { ...b, status: "Cancelled" } : b));
                  setCancelSuccess(data.message || "Roster status updated to Cancelled.");
                  
                  if (data.message.includes("late cancellation charge") || data.message.includes("penalty")) {
                    addInvoice({
                      studentName: cancellingSession.studentName,
                      amount: 37.50,
                      dueDate: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().split('T')[0],
                      billingPeriod: "Late Cancellation Penalty",
                      service: `Late Cancellation Fee (50% Org Policy) - ${cancellingSession.subject} Session on ${cancellingSession.date}`
                    });
                  }

                  setTimeout(() => {
                    setCancellingSession(null);
                    setCancelSuccess("");
                  }, 2500);
                } else {
                  setCancelError(data.message || "Failed to cancel session.");
                }
              } catch (err) {
                const bDate = new Date(`${cancellingSession.date}T12:00:00`);
                const hrsDiff = (bDate.getTime() - Date.now()) / (3600 * 1000);
                setBookings(prev => prev.map(b => b.id === cancellingSession.id ? { ...b, status: "Cancelled" } : b));
                
                if (hrsDiff < 24) {
                  addInvoice({
                    studentName: cancellingSession.studentName,
                    amount: 37.50,
                    dueDate: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().split('T')[0],
                    billingPeriod: "Late Cancellation Penalty",
                    service: `Late Cancellation Fee (50% Org Policy) - ${cancellingSession.subject} Session on ${cancellingSession.date}`
                  });
                  setCancelSuccess("Cancelled. Roster updated and late penalty invoice generated (Offline simulated mode).");
                } else {
                  setCancelSuccess("Session cancelled with full refund credit (Offline simulated mode).");
                }

                setTimeout(() => {
                  setCancellingSession(null);
                  setCancelSuccess("");
                }, 3000);
              }
            }}>
              <div className="form-group" style={{ marginBottom: "1.5rem" }}>
                <label>Reason for Cancellation</label>
                <textarea 
                  required
                  placeholder="Specify reason for cancelling this session..."
                  value={cancelReason} 
                  onChange={e => setCancelReason(e.target.value)} 
                  style={{ width: "100%", background: "#0c0f33", border: "1px solid #2e3573", color: "#fff", padding: "10px", borderRadius: "6px", height: "80px", resize: "none" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <button 
                  type="button" 
                  className="btn-secondary" 
                  style={{ justifyContent: "center" }}
                  onClick={() => { setCancellingSession(null); setCancelReason(""); }}
                >
                  Close
                </button>
                <button 
                  type="submit" 
                  className="btn-primary-glowing" 
                  style={{ width: "100%", justifyContent: "center", background: "linear-gradient(135deg, #ef4444, #b91c1c)" }}
                >
                  <span>Confirm Cancel</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
