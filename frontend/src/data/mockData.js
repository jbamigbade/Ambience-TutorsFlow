// Academic Services data
export const SERVICES = {
  K12: {
    title: "K-12 Education",
    description: "Personalized core subject coaching to build a solid foundation.",
    items: [
      { id: "math_k12", name: "Mathematics", desc: "Elementary math, pre-algebra, and foundations." },
      { id: "reading_k12", name: "Reading", desc: "Phonics, comprehension, and vocabulary development." },
      { id: "writing_k12", name: "Writing", desc: "Grammar, creative writing, and essay structures." },
      { id: "science_k12", name: "Science", desc: "Life sciences, earth sciences, and physics basics." },
      { id: "homework_k12", name: "Homework Help", desc: "Daily assignment assistance and routine building." }
    ]
  },
  COLLEGE: {
    title: "College Mathematics",
    description: "Advanced college-level mathematics support and proof techniques.",
    items: [
      { id: "college_alg", name: "College Algebra", desc: "Equations, inequalities, and graphing functions." },
      { id: "trig", name: "Trigonometry", desc: "Trigonometric identities, polar coordinates, and triangles." },
      { id: "pre_calc", name: "Pre-Calculus", desc: "Advanced functions, sequences, limits, and preparation for Calculus." },
      { id: "calc1", name: "Calculus I", desc: "Limits, derivatives, and introduction to integration." },
      { id: "calc2", name: "Calculus II", desc: "Integration techniques, sequences, and infinite series." },
      { id: "stats", name: "Statistics", desc: "Probability, distributions, hypotheses, and linear regression." },
      { id: "diff_eq", name: "Differential Equations", desc: "First-order and linear higher-order differential equations." }
    ]
  },
  CHARACTER_ED: {
    title: "Character Education & Life Skills",
    description: "Cultivating virtues, resilience, and personal leadership traits to build noble futures.",
    items: [
      { id: "integrity", name: "Integrity", desc: "Doing what is right, honest, and honorable in all circumstances." },
      { id: "responsibility", name: "Responsibility", desc: "Taking ownership of actions, goals, chores, and academic assignments." },
      { id: "respect", name: "Respect", desc: "Value and dignity shown to parents, instructors, peers, and self." },
      { id: "kindness", name: "Kindness", desc: "Compassion and warmth in speech, service, and collaboration." },
      { id: "honesty", name: "Honesty", desc: "Absolute truthfulness, academic integrity, and transparent speech." },
      { id: "perseverance", name: "Perseverance", desc: "Resilience in solving tough math proofs and overcoming temporary plateaus." },
      { id: "gratitude", name: "Gratitude", desc: "Acknowledging blessings, supporting others, and showing appreciation." },
      { id: "self_control", name: "Self-Control", desc: "Emotional focus, discipline over screen time, and focused study blocks." },
      { id: "leadership", name: "Leadership", desc: "Empowering peers, organizing study circles, and leading with virtue." },
      { id: "empathy", name: "Empathy", desc: "Understanding classmate circumstances and offering active peer support." },
      { id: "time_mgmt", name: "Time Management", desc: "Structuring schedules, eliminating cram blocks, and prioritizing goals." },
      { id: "digital_cit", name: "Digital Citizenship", desc: "Honorable and safe conduct online, protecting privacy and communication." },
      { id: "teamwork", name: "Teamwork", desc: "Coordinating in group study, respecting roles, and aligning outcomes." },
      { id: "problem_solving", name: "Problem Solving", desc: "Logical conflict resolution, planning strategies, and root-cause analysis." },
      { id: "resilience", name: "Resilience", desc: "Bouncing back from exam anxiety with grace, trust, and continuous effort." }
    ]
  },
  EXAMS: {
    title: "Exam Preparation",
    description: "Strategic test-prep modules designed to boost test-day confidence.",
    items: [
      { id: "psat", name: "PSAT Prep", desc: "National Merit Scholarship qualification preparation." },
      { id: "sat", name: "SAT Prep", desc: "Evidence-based reading, writing, and math test-taking strategies." },
      { id: "act", name: "ACT Prep", desc: "Comprehensive English, Math, Reading, and Science prep." },
      { id: "eog", name: "EOG Prep", desc: "North Carolina End-of-Grade exams coaching." },
      { id: "eoc", name: "EOC Prep", desc: "End-of-Course exams for secondary education." },
      { id: "iowa", name: "Iowa Assessments", desc: "Standardized national achievement exam prep." }
    ]
  },
  SPECIALIZED: {
    title: "Specialized Services",
    description: "Targeted support mechanisms focusing on individual academic requirements.",
    items: [
      { id: "iep_support", name: "IEP Support", desc: "Aligning curricula with Individualized Education Program goals." },
      { id: "exec_func", name: "Executive Functioning", desc: "Time management, focus-building, and organizational strategies." },
      { id: "study_skills", name: "Study Skills", desc: "Active recall, note-taking methods, and memory reinforcement." }
    ]
  }
};

// Initial Tutors list
export const INITIAL_TUTORS = [
  {
    id: "tut_1",
    name: "Dr. Elijah Vance",
    role: "Senior Tutor, Mathematics Specialist",
    rating: 4.9,
    reviews: 142,
    subjects: ["Calculus I", "Calculus II", "Differential Equations", "SAT Prep"],
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200",
    bio: "Ph.D. in Applied Mathematics. Committed to helping students master calculus and build analytical confidence."
  },
  {
    id: "tut_2",
    name: "Mrs. Sarah Jenkins",
    role: "K-12 Reading & IEP Consultant",
    rating: 5.0,
    reviews: 98,
    subjects: ["Reading", "Writing", "IEP Support", "Study Skills", "Character Education & Life Skills"],
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200",
    bio: "M.Ed. in Special Education. Passionate about empowering neurodivergent children and formulating custom learning strategies."
  },
  {
    id: "tut_3",
    name: "Benjamin Mercer",
    role: "College Prep Coordinator & Science Expert",
    rating: 4.8,
    reviews: 74,
    subjects: ["ACT Prep", "SAT Prep", "Science", "Statistics"],
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200",
    bio: "B.S. in Physics & Chemistry. Specializes in turning dry formulas into highly engaging, practical learning experiences."
  }
];

// Initial Students data
export const INITIAL_STUDENTS = [
  {
    id: "std_1",
    name: "Caleb Sterling",
    grade: "11th Grade",
    parentName: "Grace Sterling",
    parentEmail: "grace@sterling.com",
    level: "Builder", // Explorer, Builder, Scholar, Achiever, Ambassador
    points: 340,
    streak: 6,
    completedSessions: 18,
    overallProgress: 84,
    subjects: [
      { name: "Pre-Calculus", progress: 88, grade: "A-" },
      { name: "SAT Prep", progress: 81, grade: "B+" },
      { name: "Science", progress: 83, grade: "B" }
    ],
    exams: [
      { id: "ex_1", name: "SAT Practice Test", date: "June 28, 2026", status: "Upcoming" },
      { id: "ex_2", name: "Pre-Calculus Unit 5 Test", date: "July 2, 2026", status: "Upcoming" }
    ],
    // Character Journey elements
    weeklyCharacterTheme: "Responsibility & Integrity",
    leadershipGoals: "Lead the Calculus proof study circle and complete exam preps without procrastinating.",
    characterMetrics: {
      integrity: 4,
      responsibility: 5,
      kindness: 4,
      perseverance: 5,
      leadership: 4
    },
    unlockedBadges: ["Rising Star", "Perseverance Champion"],
    growthReflections: [
      {
        id: "refl_1",
        date: "June 21, 2026",
        theme: "Perseverance",
        text: "I was stuck on Calculus Unit 4 proofs, but I remembered that perseverance means pushing through frustration. I worked on three proof schemas and finally solved them!"
      }
    ],
    parentEncouragements: [
      {
        id: "enc_1",
        date: "June 22, 2026",
        author: "Grace Sterling",
        text: "Super proud of how responsible you have been with your SAT study sessions this week, Caleb! Keep shining!"
      }
    ],
    // IEP Student Support elements
    iepGoals: [
      { id: "iep_g1", text: "Improve math anxiety and diagnostic scores through scaffolded step-by-step problem sets.", progress: 75 },
      { id: "iep_g2", text: "Demonstrate independent execution of double-angle formulas on Pre-Calculus worksheets.", progress: 60 },
      { id: "iep_g3", text: "Improve task initiation and time management via interactive checklists.", progress: 80 }
    ],
    iepAccommodations: [
      "Extended time (1.5x) for examinations and practice quizzes",
      "Visual scaffolds and structured math proof templates",
      "Frequent brief focus breaks (5-minute break after 25 minutes of work)",
      "Daily executive functioning and checklist review with tutor"
    ],
    iepInterventionPlan: "Scaffold algebra formulas, use structured checklists for self-monitoring, reward positive steps with points and badges, and maintain a warm, faith-inspired atmosphere to lower performance anxiety.",
    iepTutorObservations: [
      {
        id: "obs_1",
        date: "June 22, 2026",
        tutor: "Mrs. Sarah Jenkins",
        text: "Caleb responded exceptionally well to the structured proof templates today. Breaking down the reciprocal conversions into a micro-checklist kept his anxiety low and engagement extremely high."
      },
      {
        id: "obs_2",
        date: "June 18, 2026",
        tutor: "Dr. Elijah Vance",
        text: "During our SAT prep math block, Caleb was initially overwhelmed by polynomial equations. After introducing a visual steps guide and taking a 3-minute breather, he completed 5 practice items successfully."
      }
    ]
  }
];

// Initial Assignments
export const INITIAL_ASSIGNMENTS = [
  {
    id: "asg_1",
    studentId: "std_1",
    title: "Pre-Calculus: Trigonometric Proofs",
    subject: "Pre-Calculus",
    dueDate: "June 25, 2026",
    status: "Pending", // Pending, Completed
    points: 50,
    desc: "Complete exercises 1-15 on Pages 204-205 regarding double angle formulas."
  },
  {
    id: "asg_2",
    studentId: "std_1",
    title: "SAT Reading: Inference Strategies",
    subject: "SAT Prep",
    dueDate: "June 29, 2026",
    status: "Pending",
    points: 40,
    desc: "Read the three assigned passages on scientific discoveries and complete the inference questionnaire."
  },
  {
    id: "asg_3",
    studentId: "std_1",
    title: "Physics: Kinematics Calculations",
    subject: "Science",
    dueDate: "June 23, 2026",
    status: "Completed",
    points: 30,
    desc: "Solve the trajectory word problems involving gravitational acceleration."
  }
];

// Growth Journey Level specifications
export const GROWTH_JOURNEY_LEVELS = [
  {
    name: "Explorer",
    minPoints: 0,
    maxPoints: 149,
    badge: "🌱",
    color: "#10b981",
    gradient: "linear-gradient(135deg, #34d399, #10b981)",
    perks: "Unlocked starter rewards, base study resource modules, and avatar customization."
  },
  {
    name: "Rising Star",
    minPoints: 150,
    maxPoints: 299,
    badge: "⭐",
    color: "#f59e0b",
    gradient: "linear-gradient(135deg, #fbbf24, #f59e0b)",
    perks: "Unlocked character badges tracker, peer motivation group channels, and custom study planners."
  },
  {
    name: "Builder",
    minPoints: 300,
    maxPoints: 599,
    badge: "🥈",
    color: "#0d9488",
    gradient: "linear-gradient(135deg, #0d9488, #0f766e)",
    perks: "Unlocked personalized formula cheat-sheets, weekly streak bonus multiplier, and customizable study music tracks."
  },
  {
    name: "Scholar",
    minPoints: 600,
    maxPoints: 999,
    badge: "🥇",
    color: "#4f46e5",
    gradient: "linear-gradient(135deg, #6366f1, #4f46e5)",
    perks: "Unlocked advanced practice question vaults, 1-on-1 career path advisory sessions, and VIP tutor feedback sessions."
  },
  {
    name: "Achiever",
    minPoints: 1000,
    maxPoints: 1499,
    badge: "🏆",
    color: "#d97706",
    gradient: "linear-gradient(135deg, #f59e0b, #d97706)",
    perks: "Unlocked official diagnostic examinations, priority scheduling options, and customized masterclass webinars."
  },
  {
    name: "Ambassador",
    minPoints: 1500,
    maxPoints: 99999,
    badge: "👑",
    color: "#be185d",
    gradient: "linear-gradient(135deg, #ec4899, #be185d)",
    perks: "Unlocked peer mentoring capabilities, digital honor plaques, Ambience TutorFlow merchandise vouchers, and direct scholarship applications."
  }
];

// Initial Messages
export const INITIAL_MESSAGES = [
  {
    id: "msg_1",
    from: "Mrs. Sarah Jenkins",
    to: "Grace Sterling",
    roleFrom: "Tutor",
    roleTo: "Parent",
    time: "Yesterday, 4:15 PM",
    text: "Hi Grace, Caleb did an exceptional job today working through trigonometric functions! His focus was top tier. Keep encouraging him to do the practice proofs.",
    unread: true
  },
  {
    id: "msg_2",
    from: "Grace Sterling",
    to: "Mrs. Sarah Jenkins",
    roleFrom: "Parent",
    roleTo: "Tutor",
    time: "Yesterday, 5:02 PM",
    text: "Thank you, Sarah! That is fantastic news. We'll make sure he spends at least 20 minutes a day on those homework sheets.",
    unread: false
  },
  {
    id: "msg_3",
    from: "Dr. Elijah Vance",
    to: "Caleb Sterling",
    roleFrom: "Tutor",
    roleTo: "Student",
    time: "Monday, 10:30 AM",
    text: "Caleb, make sure to check the Pre-Calculus cheat-sheet I uploaded. It will make your proofs assignment a lot simpler!",
    unread: true
  }
];

// Invoices
export const INITIAL_INVOICES = [
  {
    id: "inv_1094",
    studentName: "Caleb Sterling",
    amount: 150.00,
    dueDate: "June 30, 2026",
    status: "Unpaid", // Paid, Unpaid
    billingPeriod: "June 15 - June 24, 2026",
    service: "Pre-Calculus Tutoring (2 Sessions)"
  },
  {
    id: "inv_1093",
    studentName: "Caleb Sterling",
    amount: 240.00,
    dueDate: "June 15, 2026",
    status: "Paid",
    billingPeriod: "June 1 - June 14, 2026",
    service: "SAT Prep Core Sessions (4 Sessions)"
  }
];

// Session notes
export const INITIAL_SESSION_NOTES = [
  {
    id: "note_1",
    studentId: "std_1",
    studentName: "Caleb Sterling",
    tutorName: "Mrs. Sarah Jenkins",
    date: "June 22, 2026",
    subject: "Pre-Calculus",
    summary: "Focused heavily on double-angle formulas and proving identities. Caleb initially struggled with reciprocal conversions, but after practicing three structured proof tables, he completed the final exercises independently with 90% accuracy.",
    nextSteps: "Complete Pre-Calculus Trigonometric Proofs homework sheet. Begin reading Unit 5 formulas."
  }
];

// Default bookings
export const INITIAL_BOOKINGS = [
  {
    id: "bk_1",
    studentName: "Caleb Sterling",
    tutorName: "Mrs. Sarah Jenkins",
    subject: "Pre-Calculus",
    date: "2026-06-26",
    time: "4:00 PM - 5:00 PM",
    status: "Confirmed"
  },
  {
    id: "bk_2",
    studentName: "Caleb Sterling",
    tutorName: "Dr. Elijah Vance",
    subject: "SAT Prep",
    date: "2026-06-30",
    time: "3:30 PM - 4:30 PM",
    status: "Confirmed"
  }
];

// Character Badges specifications
export const CHARACTER_BADGES = [
  { name: "Rising Star", emoji: "⭐", desc: "Demonstrating initial growth, leadership goals, and core virtues." },
  { name: "Perseverance Champion", emoji: "🛡️", desc: "Sticking to academic goals even when facing intense challenges." },
  { name: "Team Player", emoji: "🤝", desc: "Collaborating beautifully with peers, tutors, and family members." },
  { name: "Problem Solver", emoji: "🧩", desc: "Resolving complex math or personal bottlenecks with integrity." },
  { name: "Compassion Leader", emoji: "💖", desc: "Showing empathy, active listening, and sincere kindness." },
  { name: "Character Ambassador", emoji: "🌟", desc: "Modeling elite integrity, honesty, and honor across the platform." }
];

// Initial Character notes
export const INITIAL_CHARACTER_NOTES = [
  {
    id: "c_note_1",
    studentId: "std_1",
    tutorName: "Mrs. Sarah Jenkins",
    date: "June 22, 2026",
    theme: "Responsibility",
    studentResponse: "Extremely receptive. Caleb acknowledged that organizing his study sheets is his personal responsibility.",
    strengthObserved: "Integrity",
    areaForGrowth: "Time Management during active reading sessions.",
    recommendation: "Spend 5 minutes planning homework goals before starting the math session."
  }
];
