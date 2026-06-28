const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Whitelisted CORS origins for production vs dev
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:5000"
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests without Origin header (like servers or curls)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || allowedOrigins.includes("*") || process.env.NODE_ENV !== "production") {
      return callback(null, true);
    }
    return callback(new Error("CORS Policy Violation: Access from specified Origin is denied."), false);
  },
  credentials: true
}));

app.use(express.json());

// Express Security Hardening headers
app.use((req, res, next) => {
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Content-Security-Policy", "default-src 'self'; frame-ancestors 'none';");
  next();
});

// Auth verification middleware using live Supabase API or sandbox bypass
async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: Missing or malformed authorization token." });
  }

  const token = authHeader.split(" ")[1];

  const supabaseUrl = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;

  const isSupabaseConfigured = !!(supabaseUrl && anonKey && !supabaseUrl.includes("PLACEHOLDER") && !anonKey.includes("PLACEHOLDER"));
  const isProduction = process.env.NODE_ENV === "production";

  // Explicitly reject simulation tokens in production or if Supabase is properly configured
  const allowSimulation = !isProduction && !isSupabaseConfigured;

  if (token.startsWith("sim_token_")) {
    if (!allowSimulation) {
      console.warn(`[Security Alert] Simulation token block trigger. isProduction=${isProduction}, isSupabaseConfigured=${isSupabaseConfigured}`);
      return res.status(401).json({ error: "Unauthorized: Simulation tokens are not allowed under current environment/configuration." });
    }
  }

  if (!isSupabaseConfigured) {
    if (isProduction) {
      console.error("[Security Alert] Critical Configuration Error: Supabase connection is required in production, but keys are missing.");
      return res.status(500).json({ error: "Configuration Error: Supabase connection is required in production." });
    }

    // Support local offline sandbox simulation if Supabase is not configured
    console.log("[Security Guard] Operating in Offline Sandbox / Simulation Auth Mode.");
    if (token.startsWith("sim_token_")) {
      const parts = token.split("_");
      req.user = {
        id: parts[2] || "sim_user_id",
        email: parts[3] || "sandbox@ambience.com",
        user_metadata: { role: parts[1] || "Student", name: "Sandbox User" }
      };
    } else {
      req.user = {
        id: "tut_1",
        email: "sandbox@ambience.com",
        user_metadata: { role: "Admin", name: "Sandbox Admin" }
      };
    }
    return next();
  }

  try {
    // Authenticate token directly against live Supabase project auth engine
    const response = await axios.get(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: anonKey
      }
    });

    req.user = response.data;
    next();
  } catch (error) {
    console.error("[Security Guard] Cryptographic JWT validation failed on Supabase REST API:", error.response?.data || error.message);
    return res.status(401).json({ error: "Unauthorized: Invalid, malformed or expired JWT session." });
  }
}

// Role-based authorization middleware
function requireRole(allowedRoles) {
  return (req, res, next) => {
    const userRole = req.user?.user_metadata?.role || "Student";
    if (!allowedRoles.includes(userRole)) {
      console.warn(`[Security Alert] User ${req.user?.email || "Unknown"} with role ${userRole} attempted unauthorized access to restricted endpoints.`);
      return res.status(403).json({ error: "Forbidden: Insufficient privileges for this role-based action." });
    }
    next();
  };
}

// Simple, zero-dependency in-memory rate limiter middleware
function rateLimiter(windowMs = 60 * 1000, maxRequests = 15) {
  const ipRequests = new Map();

  // Clean up expired entries periodically to prevent memory leaks
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [ip, data] of ipRequests.entries()) {
      if (now > data.resetTime) {
        ipRequests.delete(ip);
      }
    }
  }, windowMs);

  // Unref interval so it doesn't keep the Node process running unnecessarily in tests
  if (cleanupInterval.unref) {
    cleanupInterval.unref();
  }

  return (req, res, next) => {
    const ip = req.ip || req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    const now = Date.now();

    if (!ipRequests.has(ip)) {
      ipRequests.set(ip, {
        count: 1,
        resetTime: now + windowMs
      });
      return next();
    }

    const data = ipRequests.get(ip);
    if (now > data.resetTime) {
      data.count = 1;
      data.resetTime = now + windowMs;
      return next();
    }

    data.count++;
    if (data.count > maxRequests) {
      const retryAfterSeconds = Math.ceil((data.resetTime - now) / 1000);
      res.setHeader("Retry-After", retryAfterSeconds);
      return res.status(429).json({
        error: "Too Many Requests",
        message: `Too many requests from this IP. Please try again in ${retryAfterSeconds} seconds.`
      });
    }

    next();
  };
}

// =========================================================================
// IN-MEMORY DATABASE STATE FOR SANDBOX FALLBACK
// =========================================================================
// Stores tutors' Zoom OAuth connection records
const zoomConnections = {};

// Stores Stripe payment sessions
const stripeSessions = {};

// Stores automated notification/reminder queue
const notificationsQueue = [];

// Stores weekly tutor availability (day_week -> array of time blocks)
const tutorAvailabilities = {
  "tut_1": {
    "Monday": ["4:00 PM - 5:00 PM", "5:15 PM - 6:15 PM"],
    "Wednesday": ["3:30 PM - 4:30 PM", "5:15 PM - 6:15 PM"],
    "Friday": ["4:00 PM - 5:00 PM", "6:30 PM - 7:30 PM"]
  },
  "tut_2": {
    "Tuesday": ["3:30 PM - 4:30 PM", "4:00 PM - 5:00 PM"],
    "Thursday": ["5:15 PM - 6:15 PM", "6:30 PM - 7:30 PM"]
  },
  "tut_3": {
    "Monday": ["3:30 PM - 4:30 PM"],
    "Tuesday": ["5:15 PM - 6:15 PM"],
    "Wednesday": ["6:30 PM - 7:30 PM"]
  }
};

// Organization configuration policies (Multi-tenant)
const orgPolicies = {
  "org_1": {
    name: "Ambience Academy Core",
    cancellationHours: 24, // 24-hour notice required
    rescheduleHours: 12, // 12-hour notice required
    lateCancellationFeePercent: 50, // 50% penalty if cancelled within 24 hours
    isStudentBrowsingAllowed: true
  }
};

// Stores ad-hoc bookings created during session
const bookingsDb = [];

// Stores messaging logs for Collaboration Hub fallback
const messagesDb = [
  {
    id: "msg_1",
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(), // 4 hours ago
    sender_id: "20000000-2000-2000-2000-200000000001", // Catherine
    sender_name: "Dr. Catherine Sterling",
    sender_role: "Tutor",
    recipient_id: "30000000-3000-3000-3000-300000000001", // Jonathan (Parent)
    recipient_name: "Jonathan Edwards Sterling",
    recipient_role: "Parent",
    channel_id: "parent_tutor_Catherine_Jonathan",
    content: "Hi Jonathan, Caleb did an exceptional job in our Calculus session today. His work on integrals showed great diligence!",
    is_read: true
  },
  {
    id: "msg_2",
    created_at: new Date(Date.now() - 3600000 * 3).toISOString(), // 3 hours ago
    sender_id: "30000000-3000-3000-3000-300000000001", // Jonathan (Parent)
    sender_name: "Jonathan Edwards Sterling",
    sender_role: "Parent",
    recipient_id: "20000000-2000-2000-2000-200000000001", // Catherine
    recipient_name: "Dr. Catherine Sterling",
    recipient_role: "Tutor",
    channel_id: "parent_tutor_Catherine_Jonathan",
    content: "Thank you Dr. Sterling! That's wonderful to hear. We will keep reinforcing the integrals at home using the Parent Copilot.",
    is_read: false
  }
];

// Stores shared session notes logs for Collaboration Hub fallback
const sharedNotesDb = [
  {
    id: "note_1",
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(), // yesterday
    created_by: "20000000-2000-2000-2000-200000000001", // Catherine
    student_id: "40000000-4000-4000-4000-400000000001", // Caleb
    title: "Calculus - Session 4 Summary (Integrals Focus)",
    summary: "In today's session, Caleb practiced applying the fundamental theorem of calculus to solve area problems under curved graphs. He worked diligently through four complex problems.",
    parent_update: "Caleb Sterling demonstrated outstanding perseverance today during some very difficult integral computations. Encourage him to practice finding the constant of integration!",
    action_items: [
      { text: "Complete Calculus practice sheet on indefinite integrals.", completed: false },
      { text: "Review common integration mistakes on page 112.", completed: true }
    ],
    reminders: [
      { text: "Schedule next weekly block for calculus review.", due_date: "2026-07-02" }
    ],
    visibility: ["Admin", "Tutor", "Parent", "Student"]
  }
];

// Stores user subscriptions for Phase 11 fallback
const activeSubscriptionsMap = {};

// Stores AI Homework Assistant records for Phase 11 fallback
const homeworkAssistantDb = [];

// =========================================================================
// HELPER: ZOOM CREDENTIAL REFRESH
// =========================================================================
async function refreshZoomToken(tutorId) {
  const conn = zoomConnections[tutorId];
  if (!conn || !conn.refreshToken) {
    throw new Error("No Zoom connection found for this tutor.");
  }

  const clientId = process.env.ZOOM_CLIENT_ID;
  const clientSecret = process.env.ZOOM_CLIENT_SECRET;

  if (!clientId || !clientSecret || clientId.includes("PLACEHOLDER") || clientSecret.includes("PLACEHOLDER")) {
    console.log(`[Zoom Sim] Auto-renewing simulated token for Tutor ${tutorId}`);
    conn.accessToken = "sim_access_" + Date.now();
    conn.expiresAt = Date.now() + 3600 * 1000;
    return conn.accessToken;
  }

  try {
    const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
    const response = await axios.post(
      "https://zoom.us/oauth/token",
      new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: conn.refreshToken,
      }).toString(),
      {
        headers: {
          Authorization: `Basic ${authHeader}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const { access_token, refresh_token, expires_in } = response.data;
    conn.accessToken = access_token;
    conn.refreshToken = refresh_token;
    conn.expiresAt = Date.now() + expires_in * 1000;
    conn.status = "Connected";

    console.log(`[Zoom API] Refreshed credentials for Tutor ${tutorId}`);
    return access_token;
  } catch (error) {
    console.error(`[Zoom API] Token refresh failed for Tutor ${tutorId}:`, error.response?.data || error.message);
    conn.status = "Reconnect Required";
    throw new Error("Zoom session expired. Reconnect Required.");
  }
}

// =========================================================================
// 1. ZOOM OAUTH ROUTING
// =========================================================================
app.get("/api/zoom/connect", rateLimiter(60 * 1000, 15), (req, res) => {
  const { tutorId } = req.query;
  if (!tutorId) {
    return res.status(400).json({ error: "tutorId is required to start Zoom connection" });
  }

  const clientId = process.env.ZOOM_CLIENT_ID;
  const redirectUri = process.env.ZOOM_REDIRECT_URI;

  if (!clientId || !redirectUri || clientId.includes("PLACEHOLDER")) {
    console.log(`[Zoom Sim] Environment not set. Initiating simulated connection for Tutor ${tutorId}`);
    const successUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}?zoom_status=success&tutorId=${tutorId}&simulated=true`;
    return res.redirect(successUrl);
  }

  const zoomAuthUrl = `https://zoom.us/oauth/authorize?response_type=code&client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${encodeURIComponent(tutorId)}`;
  res.redirect(zoomAuthUrl);
});

app.get("/api/zoom/callback", async (req, res) => {
  const { code, state: tutorId } = req.query;

  if (!tutorId) {
    return res.status(400).send("State/Tutor ID is missing in callback.");
  }

  if (req.query.simulated === "true" || !code) {
    zoomConnections[tutorId] = {
      accessToken: "sim_access_" + Date.now(),
      refreshToken: "sim_refresh_" + Date.now(),
      expiresAt: Date.now() + 3600 * 1000,
      status: "Connected",
      connectedAt: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
    };
    return res.redirect(`${process.env.FRONTEND_URL || "http://localhost:5173"}?zoom_status=success&tutorId=${tutorId}`);
  }

  const clientId = process.env.ZOOM_CLIENT_ID;
  const clientSecret = process.env.ZOOM_CLIENT_SECRET;
  const redirectUri = process.env.ZOOM_REDIRECT_URI;

  try {
    const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
    const response = await axios.post(
      "https://zoom.us/oauth/token",
      new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
      }).toString(),
      {
        headers: {
          Authorization: `Basic ${authHeader}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const { access_token, refresh_token, expires_in } = response.data;
    zoomConnections[tutorId] = {
      accessToken: access_token,
      refreshToken: refresh_token,
      expiresAt: Date.now() + expires_in * 1000,
      status: "Connected",
      connectedAt: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
    };

    console.log(`[Zoom API] Tutor ${tutorId} connected Zoom account successfully.`);
    res.redirect(`${process.env.FRONTEND_URL || "http://localhost:5173"}?zoom_status=success&tutorId=${tutorId}`);
  } catch (error) {
    console.error("[Zoom API] OAuth token exchange error:", error.response?.data || error.message);
    res.redirect(`${process.env.FRONTEND_URL || "http://localhost:5173"}?zoom_status=error&error=${encodeURIComponent(error.message)}`);
  }
});

// Create Zoom Meeting
app.post("/api/zoom/create-meeting", rateLimiter(60 * 1000, 15), requireAuth, requireRole(["Tutor", "Admin"]), async (req, res) => {
  const { tutorId, topic, startTime, duration } = req.body;
  const activeTutorId = tutorId || "tut_1";

  let conn = zoomConnections[activeTutorId];

  // If no Zoom connection found, register a fallback simulator instantly so booking doesn't crash
  if (!conn) {
    console.log(`[Zoom] Auto-configuring local mock Zoom token for Tutor ${activeTutorId}`);
    zoomConnections[activeTutorId] = {
      accessToken: "sim_access_" + Date.now(),
      refreshToken: "sim_refresh_" + Date.now(),
      expiresAt: Date.now() + 3600 * 1000,
      status: "Connected",
      connectedAt: new Date().toLocaleDateString()
    };
    conn = zoomConnections[activeTutorId];
  }

  // Auto-refresh access token if it will expire within 1 minute
  if (Date.now() + 60000 > conn.expiresAt) {
    try {
      await refreshZoomToken(activeTutorId);
      conn = zoomConnections[activeTutorId];
    } catch (refreshErr) {
      return res.status(401).json({
        error: "Zoom credentials expired. Reconnect required.",
        status: "Reconnect Required"
      });
    }
  }

  // Handle simulated Zoom meeting details
  if (conn.accessToken.startsWith("sim_access")) {
    const meetId = Math.floor(100000000 + Math.random() * 900000000);
    const joinUrl = `https://zoom.us/j/${meetId}?pwd=simulatedPasscode`;
    const startUrl = `https://zoom.us/s/${meetId}?role=host&tutor=${activeTutorId}`;
    return res.json({
      meetingId: meetId.toString(),
      joinUrl,
      startUrl,
      status: "Success"
    });
  }

  // Real Zoom API
  try {
    const response = await axios.post(
      "https://api.zoom.us/v2/users/me/meetings",
      {
        topic: topic || "Ambience TutorsFlow Session",
        type: 2, // Scheduled meeting
        start_time: startTime,
        duration: duration || 60,
        timezone: "America/New_York",
        settings: {
          host_video: true,
          participant_video: true,
          join_before_host: true,
          mute_upon_entry: false,
          waiting_room: false,
          approval_type: 0
        }
      },
      {
        headers: {
          Authorization: `Bearer ${conn.accessToken}`,
          "Content-Type": "application/json"
        }
      }
    );

    const { id, join_url, start_url } = response.data;
    res.json({
      meetingId: id.toString(),
      joinUrl: join_url,
      startUrl: start_url,
      status: "Success"
    });
  } catch (error) {
    console.error("[Zoom API] Meeting creation failed:", error.response?.data || error.message);
    res.status(500).json({
      error: "Failed to create Zoom meeting via API",
      details: error.response?.data || error.message
    });
  }
});

// Get/Check connection status
app.get("/api/zoom/status/:tutorId", (req, res) => {
  const { tutorId } = req.params;
  const conn = zoomConnections[tutorId];

  if (!conn) {
    return res.json({ status: "Not Connected" });
  }

  if (Date.now() > conn.expiresAt) {
    conn.status = "Reconnect Required";
  }

  res.json({
    status: conn.status || "Connected",
    connectedAt: conn.connectedAt
  });
});

app.post("/api/zoom/simulate-connect", requireAuth, requireRole(["Tutor", "Admin"]), (req, res) => {
  const { tutorId } = req.body;
  if (!tutorId) {
    return res.status(400).json({ error: "tutorId is required." });
  }

  zoomConnections[tutorId] = {
    accessToken: "sim_access_" + Date.now(),
    refreshToken: "sim_refresh_" + Date.now(),
    expiresAt: Date.now() + 3600 * 1000,
    status: "Connected",
    connectedAt: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
  };

  res.json({ status: "Connected", message: "Zoom simulated connection successful!" });
});


// =========================================================================
// 2. RECURRING TUTOR AVAILABILITY ENDPOINTS
// =========================================================================
app.get("/api/tutors/availability/:tutorId", (req, res) => {
  const { tutorId } = req.params;
  const availability = tutorAvailabilities[tutorId] || {};
  res.json({ tutorId, availability });
});

app.post("/api/tutors/availability", requireAuth, requireRole(["Tutor", "Admin"]), (req, res) => {
  const { tutorId, availability } = req.body;
  if (!tutorId || !availability) {
    return res.status(400).json({ error: "tutorId and availability object are required." });
  }
  tutorAvailabilities[tutorId] = availability;
  console.log(`[Database] Updated weekly availability for Tutor ${tutorId}`);
  res.json({ status: "Success", message: "Availability saved successfully!", availability });
});


// =========================================================================
// 3. MULTI-PROVIDER ENTERPRISE PAYMENT & COMMISSION ENGINE
// =========================================================================

// Additional payment data models
const paymentsDb = [
  {
    id: "pay_1",
    sessionId: "cs_stripe_1",
    studentId: "std_1",
    studentName: "Caleb Sterling",
    parentId: "parent_1",
    tutorId: "tut_1",
    tutorName: "Mrs. Sarah Jenkins",
    subject: "Pre-Calculus Tutoring Block",
    date: "2026-06-15",
    timeSlot: "4:00 PM - 5:00 PM",
    amount: 150.00,
    commissionPercent: 20,
    commissionAmount: 30.00,
    tutorEarnings: 120.00,
    provider: "STRIPE",
    paymentType: "One-Time",
    status: "Paid",
    transactionId: "tx_stripe_seed1",
    paidAt: "2026-06-15T16:05:00.000Z"
  },
  {
    id: "pay_2",
    sessionId: "cs_paypal_2",
    studentId: "std_1",
    studentName: "Caleb Sterling",
    parentId: "parent_1",
    tutorId: "tut_1",
    tutorName: "Mrs. Sarah Jenkins",
    subject: "Reading Remediation Block",
    date: "2026-06-20",
    timeSlot: "5:15 PM - 6:15 PM",
    amount: 75.00,
    commissionPercent: 20,
    commissionAmount: 15.00,
    tutorEarnings: 60.00,
    provider: "PAYPAL",
    paymentType: "One-Time",
    status: "Paid",
    transactionId: "tx_paypal_seed2",
    paidAt: "2026-06-20T17:30:00.000Z"
  },
  {
    id: "pay_3",
    sessionId: "cs_zelle_3",
    studentId: "std_1",
    studentName: "Caleb Sterling",
    parentId: "parent_1",
    tutorId: "tut_1",
    tutorName: "Mrs. Sarah Jenkins",
    subject: "IEP Support Session",
    date: "2026-06-25",
    timeSlot: "4:00 PM - 5:00 PM",
    amount: 150.00,
    commissionPercent: 20,
    commissionAmount: 30.00,
    tutorEarnings: 120.00,
    provider: "ZELLE",
    paymentType: "One-Time",
    status: "Pending_Verification",
    transactionId: "tx_zelle_seed3",
    zelleReferenceCode: "ZL_9281A837",
    paidAt: "2026-06-25T14:10:00.000Z"
  }
];

const subscriptionsDb = [
  {
    id: "sub_1",
    parentId: "parent_1",
    studentName: "Caleb Sterling",
    tutorId: "tut_1",
    tutorName: "Mrs. Sarah Jenkins",
    amount: 300.00,
    billingInterval: "Monthly",
    status: "Active",
    provider: "stripe",
    createdAt: "2026-06-10",
    nextBillingDate: "2026-07-10"
  }
];

const invoicesDb = [
  {
    id: "inv_1094",
    studentName: "Caleb Sterling",
    amount: 150.00,
    dueDate: "2026-06-30",
    status: "Unpaid",
    billingPeriod: "June 15 - June 24, 2026",
    service: "Pre-Calculus Tutoring (2 Sessions)"
  },
  {
    id: "inv_1095",
    studentName: "Caleb Sterling",
    amount: 75.00,
    dueDate: "2026-06-20",
    status: "Paid",
    billingPeriod: "June 1 - June 10, 2026",
    service: "Reading Remediation Block"
  },
  {
    id: "inv_1096",
    studentName: "Caleb Sterling",
    amount: 150.00,
    dueDate: "2026-06-25",
    status: "Unpaid",
    billingPeriod: "June 10 - June 20, 2026",
    service: "IEP Support Session"
  }
];
const commissionPolicies = {
  "org_1": {
    name: "Ambience Academy Core",
    commissionPercent: 20 // Default 20% system-wide commission
  }
};

// Strategy Pattern: Payment Provider Interface / Registry
class PaymentProviderRegistry {
  constructor() {
    this.providers = {};
  }
  register(name, providerInstance) {
    this.providers[name.toLowerCase()] = providerInstance;
  }
  getProvider(name) {
    const provider = this.providers[name.toLowerCase()];
    if (!provider) {
      throw new Error(`Payment provider '${name}' is not supported or registered yet.`);
    }
    return provider;
  }
}

class StripeProvider {
  createSession(sessionData) {
    const sessionId = "cs_stripe_" + Math.random().toString(36).substr(2, 9) + "_test";
    return {
      sessionId,
      url: `https://checkout.stripe.com/pay/${sessionId}`,
      status: "Requires_Payment"
    };
  }
  confirmPayment(session, details) {
    return {
      status: "Paid",
      paymentMethod: details.paymentMethod || "Visa ending in 4242",
      transactionId: "tx_stripe_" + Math.random().toString(36).substr(2, 10),
      paidAt: new Date().toISOString()
    };
  }
  refund(transactionId, amount) {
    return {
      status: "Refunded",
      refundId: "re_stripe_" + Math.random().toString(36).substr(2, 10),
      amount
    };
  }
}

class PayPalProvider {
  createSession(sessionData) {
    const sessionId = "cs_paypal_" + Math.random().toString(36).substr(2, 9) + "_test";
    return {
      sessionId,
      url: `https://paypal.com/checkout?token=${sessionId}`,
      status: "Requires_Payment"
    };
  }
  confirmPayment(session, details) {
    return {
      status: "Paid",
      paymentMethod: "PayPal Account: " + (details.payerEmail || "payer@ambience.com"),
      transactionId: "tx_paypal_" + Math.random().toString(36).substr(2, 10),
      paidAt: new Date().toISOString()
    };
  }
  refund(transactionId, amount) {
    return {
      status: "Refunded",
      refundId: "re_paypal_" + Math.random().toString(36).substr(2, 10),
      amount
    };
  }
}

class ZelleProvider {
  createSession(sessionData) {
    const sessionId = "cs_zelle_" + Math.random().toString(36).substr(2, 9) + "_test";
    return {
      sessionId,
      url: `/zelle-instructions?sessionId=${sessionId}`,
      status: "Requires_Payment"
    };
  }
  confirmPayment(session, details) {
    return {
      status: "Pending_Verification",
      paymentMethod: "Zelle Reference: " + (details.zelleReferenceCode || "ZL_PENDING"),
      transactionId: "tx_zelle_" + Math.random().toString(36).substr(2, 10),
      paidAt: new Date().toISOString()
    };
  }
  refund(transactionId, amount) {
    return {
      status: "Refunded",
      refundId: "re_zelle_" + Math.random().toString(36).substr(2, 10),
      amount
    };
  }
}

// Architectural Registry Mock Classes for future payment expansion
class VenmoProvider {
  createSession() { throw new Error("Venmo is currently in registration roadmap."); }
}
class CashAppProvider {
  createSession() { throw new Error("Cash App is currently in registration roadmap."); }
}
class AchProvider {
  createSession() { throw new Error("ACH bank transfers are currently in registration roadmap."); }
}

const paymentRegistry = new PaymentProviderRegistry();
paymentRegistry.register("stripe", new StripeProvider());
paymentRegistry.register("paypal", new PayPalProvider());
paymentRegistry.register("zelle", new ZelleProvider());

// ENDPOINTS:

// 1. Get Commission Policy
app.get("/api/payments/commission/:orgId", (req, res) => {
  const orgId = req.params.orgId || "org_1";
  const policy = commissionPolicies[orgId] || { commissionPercent: 20 };
  res.json(policy);
});

// 2. Save Commission Policy (Admin/Organization only)
app.post("/api/payments/commission", requireAuth, requireRole(["Admin"]), (req, res) => {
  const { orgId, commissionPercent, name } = req.body;
  const targetId = orgId || "org_1";
  if (!commissionPolicies[targetId]) {
    commissionPolicies[targetId] = {};
  }
  if (commissionPercent !== undefined) {
    commissionPolicies[targetId].commissionPercent = parseFloat(commissionPercent);
  }
  if (name) {
    commissionPolicies[targetId].name = name;
  }
  res.json({ status: "Success", message: "Commission policies updated.", policy: commissionPolicies[targetId] });
});

// 3. Create Checkout Session (Generic Strategy Wrapper)
app.post("/api/payments/create-session", rateLimiter(60 * 1000, 15), requireAuth, requireRole(["Parent", "Admin"]), (req, res) => {
  const { provider, studentId, tutorId, subject, date, timeSlot, tutorName, amount, paymentType, orgId } = req.body;
  
  if (!provider || !tutorId || !subject || !date || !timeSlot) {
    return res.status(400).json({ error: "Missing required booking details." });
  }

  const cleanProvider = provider.toLowerCase();
  try {
    const provInstance = paymentRegistry.getProvider(cleanProvider);
    const sessionDetails = provInstance.createSession({ amount });

    const sessionId = sessionDetails.sessionId;
    stripeSessions[sessionId] = {
      sessionId,
      provider: cleanProvider,
      studentId: studentId || "std_1",
      tutorId,
      tutorName: tutorName || "Expert Tutor",
      subject,
      date,
      timeSlot,
      amount: amount || 75.00,
      paymentType: paymentType || "One-Time",
      orgId: orgId || "org_1",
      status: "Requires_Payment"
    };

    console.log(`[Payment Engine] Session ${sessionId} created via ${provider} for ${subject}`);
    res.json({ sessionId, url: sessionDetails.url });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Compatibility wrapper for original create-checkout-session
app.post("/api/stripe/create-checkout-session", requireAuth, requireRole(["Parent", "Admin"]), (req, res) => {
  req.body.provider = "stripe";
  const { provider, studentId, tutorId, subject, date, timeSlot, tutorName, amount } = req.body;
  
  const sessionId = "cs_" + Math.random().toString(36).substr(2, 9) + "_test";
  stripeSessions[sessionId] = {
    sessionId,
    provider: "stripe",
    studentId: studentId || "std_1",
    tutorId,
    tutorName: tutorName || "Expert Tutor",
    subject,
    date,
    timeSlot,
    amount: amount || 75.00,
    paymentType: "One-Time",
    orgId: "org_1",
    status: "Requires_Payment"
  };
  res.json({ sessionId, url: `https://checkout.stripe.com/pay/${sessionId}` });
});

// 4. Confirm Payment Session
app.post("/api/payments/confirm", rateLimiter(60 * 1000, 15), requireAuth, async (req, res) => {
  const { sessionId, paymentMethod, payerEmail, zelleReferenceCode } = req.body;
  const session = stripeSessions[sessionId];

  if (!session) {
    return res.status(404).json({ error: "Payment session not found." });
  }

  const provider = session.provider || "stripe";
  const provInstance = paymentRegistry.getProvider(provider);
  const orgPolicy = commissionPolicies[session.orgId] || { commissionPercent: 20 };

  // Run Confirmation Strategy
  const details = { paymentMethod, payerEmail, zelleReferenceCode };
  const result = provInstance.confirmPayment(session, details);

  session.status = result.status;
  session.paymentMethod = result.paymentMethod;
  session.paidAt = result.paidAt;
  session.transactionId = result.transactionId;

  // Run Double Booking Check
  const isDoubleBooked = bookingsDb.some(
    (b) => b.tutorId === session.tutorId && b.date === session.date && b.time === session.timeSlot && b.status === "Confirmed"
  );

  if (isDoubleBooked) {
    console.log(`[Database EXCLUSION Constraint] Double booking prevented for Tutor ${session.tutorId} on ${session.date} at ${session.timeSlot}`);
    return res.status(409).json({ 
      error: "Double-booking exclusion breach detected", 
      details: "This exact time block is already confirmed for another student." 
    });
  }

  // Calculate commission
  const amount = session.amount;
  const commissionPercent = orgPolicy.commissionPercent;
  const commissionAmount = parseFloat((amount * (commissionPercent / 100)).toFixed(2));
  const tutorEarnings = parseFloat((amount - commissionAmount).toFixed(2));

  // If recurring subscription, register subscription records
  let subscriptionId = null;
  if (session.paymentType === "Subscription") {
    subscriptionId = "sub_" + Math.random().toString(36).substr(2, 9);
    subscriptionsDb.push({
      id: subscriptionId,
      parentId: "parent_1",
      studentName: "Caleb Sterling",
      tutorId: session.tutorId,
      tutorName: session.tutorName,
      amount: amount * 4, // recurring monthly (4 lessons suite)
      billingInterval: "Monthly",
      status: "Active",
      provider: provider,
      createdAt: new Date().toISOString().split("T")[0],
      nextBillingDate: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split("T")[0]
    });
  }

  const paymentRecord = {
    id: "pay_" + Math.random().toString(36).substr(2, 9),
    sessionId,
    studentId: session.studentId,
    studentName: "Caleb Sterling",
    parentId: "parent_1",
    tutorId: session.tutorId,
    tutorName: session.tutorName,
    subject: session.subject,
    date: session.date,
    timeSlot: session.timeSlot,
    amount,
    commissionPercent,
    commissionAmount,
    tutorEarnings,
    provider: provider.toUpperCase(),
    paymentType: session.paymentType,
    status: result.status,
    transactionId: result.transactionId,
    zelleReferenceCode: zelleReferenceCode || null,
    subscriptionId,
    paidAt: result.paidAt
  };

  paymentsDb.push(paymentRecord);

  // Generate Booking & Zoom Meeting if Paid immediately
  let newBooking = null;
  if (result.status === "Paid") {
    let zoomMeetingId = "Simulated";
    let zoomJoinUrl = "";
    let zoomStartUrl = "";

    try {
      const meetId = Math.floor(100000000 + Math.random() * 900000000);
      zoomMeetingId = meetId.toString();
      zoomJoinUrl = `https://zoom.us/j/${meetId}?pwd=simulatedPasscode`;
      zoomStartUrl = `https://zoom.us/s/${meetId}?role=host&tutor=${session.tutorId}`;
      console.log(`[Zoom API] Auto-generated virtual classroom meeting: ${zoomJoinUrl}`);
    } catch (err) {
      console.error("[Zoom Error] Failed to generate meeting.", err);
    }

    newBooking = {
      id: "bk_" + Math.random().toString(36).substr(2, 9),
      studentId: session.studentId,
      studentName: "Caleb Sterling",
      tutorId: session.tutorId,
      tutorName: session.tutorName,
      subject: session.subject,
      date: session.date,
      time: session.timeSlot,
      status: "Confirmed",
      zoomMeetingId,
      zoomJoinUrl,
      zoomStartUrl,
      isPaid: true,
      stripeSessionId: sessionId
    };
    bookingsDb.push(newBooking);

    // Auto-create Paid Invoice
    invoicesDb.push({
      id: "inv_" + Math.random().toString(36).substr(2, 9),
      studentName: "Caleb Sterling",
      amount,
      dueDate: session.date,
      status: "Paid",
      billingPeriod: "June 2026",
      service: `Confirmed Booking - ${session.subject} Session with ${session.tutorName}`
    });

    // Sync Notification Queue
    const bookingDate = new Date(`${session.date}T${session.timeSlot.split(" - ")[0]}`);
    const reminder24h = new Date(bookingDate.getTime() - 24 * 60 * 60 * 1000);
    const reminder1h = new Date(bookingDate.getTime() - 1 * 60 * 60 * 1000);

    notificationsQueue.push({
      id: "not_24h_" + Math.random().toString(36).substr(2, 5),
      bookingId: newBooking.id,
      recipientEmail: "grace@sterling.com",
      recipientPhone: "+1 (555) 321-4567",
      reminderType: "24h_before",
      channel: "Both",
      scheduledFor: reminder24h.toISOString(),
      status: "Pending"
    });

    notificationsQueue.push({
      id: "not_1h_" + Math.random().toString(36).substr(2, 5),
      bookingId: newBooking.id,
      recipientEmail: "grace@sterling.com",
      recipientPhone: "+1 (555) 321-4567",
      reminderType: "1h_before",
      channel: "Both",
      scheduledFor: reminder1h.toISOString(),
      status: "Pending"
    });
  } else {
    // For Zelle Pending verification, auto-create Unpaid Invoice
    invoicesDb.push({
      id: "inv_" + Math.random().toString(36).substr(2, 9),
      studentName: "Caleb Sterling",
      amount,
      dueDate: session.date,
      status: "Unpaid",
      billingPeriod: "June 2026",
      service: `Zelle Pending Verification Booking - ${session.subject} Session with ${session.tutorName}`
    });
  }

  res.json({
    status: "Success",
    message: result.status === "Paid" ? "Payment finalized. Tutor booked successfully!" : "Zelle reference registered. Pending Admin verification.",
    payment: paymentRecord,
    booking: newBooking
  });
});

// Compatibility confirm-payment
app.post("/api/stripe/confirm-payment", requireAuth, async (req, res) => {
  const { sessionId, paymentMethod } = req.body;
  req.body.paymentMethod = paymentMethod || "Visa ending in 4242";
  
  // Call general confirm
  const session = stripeSessions[sessionId];
  if (!session) {
    return res.status(404).json({ error: "Stripe checkout session not found." });
  }

  // Redirect internally
  const details = { paymentMethod: req.body.paymentMethod };
  const orgPolicy = commissionPolicies[session.orgId || "org_1"] || { commissionPercent: 20 };
  
  session.status = "Paid";
  session.paymentMethod = details.paymentMethod;
  session.paidAt = new Date().toISOString();
  session.transactionId = "tx_stripe_compat_" + Math.random().toString(36).substr(2, 10);

  const amount = session.amount;
  const commissionPercent = orgPolicy.commissionPercent;
  const commissionAmount = parseFloat((amount * (commissionPercent / 100)).toFixed(2));
  const tutorEarnings = parseFloat((amount - commissionAmount).toFixed(2));

  const paymentRecord = {
    id: "pay_compat_" + Math.random().toString(36).substr(2, 9),
    sessionId,
    studentId: session.studentId,
    studentName: "Caleb Sterling",
    parentId: "parent_1",
    tutorId: session.tutorId,
    tutorName: session.tutorName,
    subject: session.subject,
    date: session.date,
    timeSlot: session.timeSlot,
    amount,
    commissionPercent,
    commissionAmount,
    tutorEarnings,
    provider: "STRIPE",
    paymentType: "One-Time",
    status: "Paid",
    transactionId: session.transactionId,
    paidAt: session.paidAt
  };
  paymentsDb.push(paymentRecord);

  const newBooking = {
    id: "bk_" + Math.random().toString(36).substr(2, 9),
    studentId: session.studentId,
    studentName: "Caleb Sterling",
    tutorId: session.tutorId,
    tutorName: session.tutorName,
    subject: session.subject,
    date: session.date,
    time: session.timeSlot,
    status: "Confirmed",
    zoomMeetingId: "Simulated",
    zoomJoinUrl: "https://zoom.us/j/123456789?pwd=simulatedPasscode",
    zoomStartUrl: `https://zoom.us/s/123456789?role=host&tutor=${session.tutorId}`,
    isPaid: true,
    stripeSessionId: sessionId
  };
  bookingsDb.push(newBooking);

  invoicesDb.push({
    id: "inv_" + Math.random().toString(36).substr(2, 9),
    studentName: "Caleb Sterling",
    amount,
    dueDate: session.date,
    status: "Paid",
    billingPeriod: "June 2026",
    service: `Confirmed Booking - ${session.subject} Session with ${session.tutorName}`
  });

  res.json({
    status: "Success",
    message: "Stripe payment finalized. Tutor booked!",
    booking: newBooking,
    payment: {
      amount: session.amount,
      card: session.paymentMethod,
      transactionId: session.transactionId
    }
  });
});

// 5. Zelle Verification (Administrator-only endpoint)
app.post("/api/payments/verify-zelle", rateLimiter(60 * 1000, 15), requireAuth, requireRole(["Admin"]), (req, res) => {
  const { paymentId } = req.body;
  const payment = paymentsDb.find(p => p.id === paymentId);

  if (!payment) {
    return res.status(404).json({ error: "Zelle payment record not found." });
  }

  if (payment.status !== "Pending_Verification") {
    return res.status(400).json({ error: "Zelle payment is already verified or refunded." });
  }

  payment.status = "Paid";
  payment.paidAt = new Date().toISOString();

  // Create confirmed booking and zoom meeting
  let zoomMeetingId = "Simulated";
  let zoomJoinUrl = "";
  let zoomStartUrl = "";
  try {
    const meetId = Math.floor(100000000 + Math.random() * 900000000);
    zoomMeetingId = meetId.toString();
    zoomJoinUrl = `https://zoom.us/j/${meetId}?pwd=simulatedPasscode`;
    zoomStartUrl = `https://zoom.us/s/${meetId}?role=host&tutor=${payment.tutorId}`;
  } catch (err) {}

  const newBooking = {
    id: "bk_" + Math.random().toString(36).substr(2, 9),
    studentId: payment.studentId,
    studentName: payment.studentName,
    tutorId: payment.tutorId,
    tutorName: payment.tutorName,
    subject: payment.subject,
    date: payment.date,
    time: payment.timeSlot,
    status: "Confirmed",
    zoomMeetingId,
    zoomJoinUrl,
    zoomStartUrl,
    isPaid: true,
    stripeSessionId: payment.sessionId
  };
  bookingsDb.push(newBooking);

  // Mark pending invoice as Paid
  const targetInvoice = invoicesDb.find(inv => inv.dueDate === payment.date && inv.status === "Unpaid");
  if (targetInvoice) {
    targetInvoice.status = "Paid";
  }

  console.log(`[Admin Portal] Zelle transaction verified! Confirmed Booking ${newBooking.id}`);
  res.json({ status: "Success", message: "Zelle payment successfully verified! Booking confirmed.", payment, booking: newBooking });
});

// 6. Request Refund
app.post("/api/payments/refund", requireAuth, requireRole(["Tutor", "Admin"]), (req, res) => {
  const { paymentId, amount, reason } = req.body;
  const payment = paymentsDb.find(p => p.id === paymentId);

  if (!payment) {
    return res.status(404).json({ error: "Payment transaction record not found." });
  }

  if (payment.status === "Refunded") {
    return res.status(400).json({ error: "Transaction is already refunded." });
  }

  payment.status = "Refunded";
  payment.refundReason = reason || "Tutor request / parent cancel";
  payment.refundedAt = new Date().toISOString();

  // Cancel associated booking
  const booking = bookingsDb.find(b => b.stripeSessionId === payment.sessionId);
  if (booking) {
    booking.status = "Cancelled";
    booking.cancelReason = "Refunded: " + payment.refundReason;
  }

  // Update associated invoice status to Refunded/Cancelled
  const targetInvoice = invoicesDb.find(inv => inv.dueDate === payment.date);
  if (targetInvoice) {
    targetInvoice.status = "Unpaid"; // or voided
    targetInvoice.service_description = "[REFUNDED] " + targetInvoice.service;
  }

  // Create explicit refund invoice record
  invoicesDb.push({
    id: "inv_" + Math.random().toString(36).substr(2, 9),
    studentName: payment.studentName,
    amount: -Math.abs(amount || payment.amount),
    dueDate: new Date().toISOString().split("T")[0],
    status: "Paid",
    billingPeriod: "Refund Log",
    service: `REFUND ISSUED - ${payment.subject} Session on ${payment.date}. Reason: ${payment.refundReason}`
  });

  res.json({ status: "Success", message: "Payment successfully refunded. Calendar slots freed.", payment });
});

// 6b. Create Manual Invoice (Tutor-only)
app.post("/api/invoices", requireAuth, requireRole(["Tutor", "Admin"]), (req, res) => {
  const { studentName, amount, dueDate, billingPeriod, service } = req.body;
  if (!studentName || !amount || !dueDate || !service) {
    return res.status(400).json({ error: "Missing required invoice fields." });
  }

  const newInvoice = {
    id: "inv_" + Math.floor(1000 + Math.random() * 9000),
    studentName,
    amount: parseFloat(amount) || 0,
    dueDate,
    status: "Unpaid",
    billingPeriod: billingPeriod || "Current Period",
    service
  };

  invoicesDb.push(newInvoice);
  console.log(`[Database] Manual invoice #${newInvoice.id} created by Tutor for ${studentName}: $${newInvoice.amount}`);
  res.json({ status: "Success", invoice: newInvoice });
});

// 6c. Mark Invoice as Paid
app.post("/api/invoices/pay", requireAuth, requireRole(["Parent", "Admin"]), (req, res) => {
  const { invoiceId } = req.body;
  const targetInvoice = invoicesDb.find(inv => inv.id === invoiceId);
  if (!targetInvoice) {
    return res.status(404).json({ error: "Invoice not found." });
  }
  targetInvoice.status = "Paid";
  console.log(`[Database] Invoice #${invoiceId} marked as Paid.`);
  res.json({ status: "Success", invoice: targetInvoice });
});

// 7. Get Subscriptions for Parent
app.get("/api/subscriptions/:parentId", (req, res) => {
  const parentId = req.params.parentId;
  const list = subscriptionsDb.filter(s => s.parentId === parentId);
  res.json({ subscriptions: list });
});

// 8. Cancel Subscription
app.post("/api/subscriptions/cancel", requireAuth, requireRole(["Parent", "Admin"]), (req, res) => {
  const { subscriptionId } = req.body;
  const sub = subscriptionsDb.find(s => s.id === subscriptionId);
  if (sub) {
    sub.status = "Cancelled";
    sub.cancelledAt = new Date().toISOString();
    return res.json({ status: "Success", message: "Recurring subscription cancelled successfully.", subscription: sub });
  }
  res.status(404).json({ error: "Subscription record not found." });
});

// 9. Aggregated Financial Dashboard Statistics (Multi-Role Analytics)
app.get("/api/payments/dashboard-stats", (req, res) => {
  const { role, tutorId, parentId } = req.query;

  let totalGross = 0;
  let totalCommission = 0;
  let totalTutorEarnings = 0;
  let filteredHistory = [];

  if (role === "Admin" || role === "Organization") {
    filteredHistory = paymentsDb;
  } else if (role === "Tutor") {
    const cleanTutorId = tutorId || "tut_1";
    filteredHistory = paymentsDb.filter(p => p.tutorId === cleanTutorId);
  } else if (role === "Parent") {
    const cleanParentId = parentId || "parent_1";
    filteredHistory = paymentsDb.filter(p => p.parentId === cleanParentId);
  } else {
    filteredHistory = paymentsDb;
  }

  filteredHistory.forEach(p => {
    if (p.status === "Paid") {
      totalGross += p.amount;
      totalCommission += p.commissionAmount || 0;
      totalTutorEarnings += p.tutorEarnings || 0;
    }
  });

  res.json({
    grossRevenue: totalGross,
    commissionCollected: totalCommission,
    tutorEarningsPayout: totalTutorEarnings,
    transactions: filteredHistory,
    invoices: invoicesDb,
    subscriptions: subscriptionsDb,
    providersEnabled: ["Stripe", "PayPal", "Zelle"],
    roadmapProviders: ["Venmo", "Cash App", "ACH Bank Transfer"]
  });
});


// =========================================================================
// 4. NOTIFICATIONS & REMINDER SYSTEM
// =========================================================================
app.get("/api/notifications/queue", (req, res) => {
  res.json({ queue: notificationsQueue });
});

app.post("/api/notifications/dispatch", requireAuth, requireRole(["Admin"]), (req, res) => {
  const { id } = req.body;
  const reminder = notificationsQueue.find((n) => n.id === id);

  if (!reminder) {
    return res.status(404).json({ error: "Reminder not found in queue." });
  }

  reminder.status = "Sent";
  reminder.dispatchedAt = new Date().toISOString();
  
  console.log(`[Reminders Daemon] Dispatched ${reminder.reminderType} via ${reminder.channel} to ${reminder.recipientEmail}`);
  res.json({ status: "Success", reminder });
});


// =========================================================================
// 5. RESCHEDULE & CANCELLATION ENGINE WITH ORG POLICIES
// =========================================================================
app.post("/api/bookings/reschedule", requireAuth, requireRole(["Parent", "Tutor", "Admin"]), (req, res) => {
  const { bookingId, newDate, newTimeSlot } = req.body;

  // Find booking locally or simulate successful patch
  const booking = bookingsDb.find((b) => b.id === bookingId);
  const currentPolicy = orgPolicies["org_1"];

  if (booking) {
    const bookingDate = new Date(`${booking.date}T12:00:00`);
    const hoursDifference = (bookingDate.getTime() - Date.now()) / (3600 * 1000);

    if (hoursDifference < currentPolicy.rescheduleHours) {
      return res.status(400).json({
        error: "Policy Violation",
        message: `Under organization policy, rescheduling requires at least ${currentPolicy.rescheduleHours} hours advanced notice. This session begins in ${hoursDifference.toFixed(1)} hours.`
      });
    }

    booking.date = newDate;
    booking.time = newTimeSlot;
  }

  res.json({
    status: "Success",
    message: "Session rescheduled successfully! Calendars synced.",
    booking: booking || { id: bookingId, date: newDate, time: newTimeSlot, status: "Confirmed" }
  });
});

app.post("/api/bookings/cancel", requireAuth, (req, res) => {
  const { bookingId, reason } = req.body;
  const booking = bookingsDb.find((b) => b.id === bookingId);
  const currentPolicy = orgPolicies["org_1"];

  let penaltyApplied = false;
  let chargeAmount = 0;

  if (booking) {
    const bookingDate = new Date(`${booking.date}T12:00:00`);
    const hoursDifference = (bookingDate.getTime() - Date.now()) / (3600 * 1000);

    if (hoursDifference < currentPolicy.cancellationHours) {
      penaltyApplied = true;
      chargeAmount = 75.00 * (currentPolicy.lateCancellationFeePercent / 100);
    }
    booking.status = "Cancelled";
    booking.cancelReason = reason || "Parent requested cancellation.";
  }

  res.json({
    status: "Success",
    message: penaltyApplied 
      ? `Session cancelled. A late cancellation charge of $${chargeAmount.toFixed(2)} (${currentPolicy.lateCancellationFeePercent}%) was applied based on organization policy.` 
      : "Session cancelled with full refund credit.",
    booking: booking || { id: bookingId, status: "Cancelled" }
  });
});

// =========================================================================
// PHASE 4: AI TEST Q&A GENERATOR™ ENDPOINTS
// =========================================================================
const practiceTestsDb = [];

// GET: Retrieve all practice tests (local in-memory registry)
app.get("/api/ai/practice-tests", requireAuth, (req, res) => {
  const { studentId, tutorId } = req.query;
  let filtered = practiceTestsDb;
  
  if (studentId) {
    filtered = filtered.filter(t => t.studentId === studentId);
  }
  if (tutorId) {
    filtered = filtered.filter(t => t.tutorId === tutorId);
  }
  
  res.json({ status: "Success", practiceTests: filtered });
});

// POST: Save practice test to local memory registry (offline fallback)
app.post("/api/ai/practice-tests", requireAuth, requireRole(["Tutor", "Admin"]), (req, res) => {
  const { studentId, tutorId, title, subject, topic, gradeLevel, difficulty, config, content } = req.body;
  
  if (!title || !subject || !topic || !content) {
    return res.status(400).json({ error: "Missing required practice test fields." });
  }

  const newTest = {
    id: "test_" + Math.random().toString(36).substr(2, 9),
    studentId: studentId || null,
    tutorId: tutorId || req.user.id || "tut_1",
    title,
    subject,
    topic,
    gradeLevel,
    difficulty,
    config: config || {},
    content,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  practiceTestsDb.push(newTest);
  console.log(`[Database] Practice test "${title}" saved to offline in-memory registry.`);
  res.json({ status: "Success", practiceTest: newTest });
});

// POST: AI Test Generator Endpoint
app.post("/api/ai/generate-test", requireAuth, requireRole(["Tutor", "Admin"]), async (req, res) => {
  const { 
    studentId, 
    gradeLevel = "9th Grade", 
    subject, 
    topic, 
    difficulty = "Medium", 
    questionCount = 3, 
    questionType = "Multiple Choice", 
    includeSolutions = true, 
    includeAnswerKey = true 
  } = req.body;

  if (!subject || !topic) {
    return res.status(400).json({ error: "Subject and Topic are required fields to generate a test." });
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY;
  const isAiEnabled = apiKey && !apiKey.includes("PLACEHOLDER") && apiKey.trim().length > 10;

  if (isAiEnabled) {
    console.log(`[AI Test Engine] Calling Live Gemini AI for Subject: ${subject}, Topic: ${topic}, Difficulty: ${difficulty}`);
    
    // Prompt crafting matching Phase 4 strict constraints
    const systemInstruction = `You are Ambience Test Q&A Generator™, an elite, corporate-grade pedagogical AI engine designed to generate premium academic assessments.
Your task is to generate a comprehensive, highly accurate practice test in JSON format based on the user's parameters.
The output MUST be a single, valid JSON object matching this structure:
{
  "title": "String - Highly premium, professional title for the test matching the subject/grade",
  "questions": [
    {
      "id": 1,
      "question": "String - Clear, rigorous question content",
      "options": ["String", "String", "String", "String"], // Include ONLY if questionType is 'Multiple Choice', else null or empty
      "hint": "String - Extremely encouraging, student-friendly, and non-giving hint",
      "answer": "String - Clear final answer key (e.g. 'Option A: ...' or detailed short answer)",
      "solution": "String - Deep, step-by-step pedagogical solution and explanation",
      "common_mistakes": "String - Analytical overview of common student mistakes for this concept",
      "teacher_notes": "String - Professional teaching tips, learning objectives, or educational context"
    }
  ]
}

Subject-specific constraints:
- Mathematics (K-12 Math, Algebra, Pre-Calculus, Calculus, Statistics, SAT, ACT, EOG, IOWA): Include rigorous, detailed step-by-step numerical equations, formula applications, and algebraic proofs in 'solution'.
- Science: Include step-by-step quantitative solutions for physics/chemistry math, or comprehensive mechanical steps for biological processes.
- History / Social Studies: Incorporate timeline landmarks, cause-and-effect mappings, and document-based excerpt analysis (DBQ) in 'question' and 'solution'.
- English / Language Arts: Include reading comprehension excerpts, grammatical corrections, analytical writing prompts, and vocabulary context keys.
- Bible Study: Include scripture-based reflections, memory verse review checklists, and character application context emphasizing virtues like Integrity, Responsibility, Kindness, and Perseverance.
- Computer / Technology: Provide clean, formatted coding snippets (Python, JavaScript, HTML, CSS), digital literacy prompts, AI literacy, or cybersecurity fundamentals.
- Physical Education / Health: Feature nutrition/calorie guides, fitness science parameters, sports rules, and healthy habit journals.

Ensure the difficulty matches: ${difficulty}, grade alignment is: ${gradeLevel}, and generate exactly ${questionCount} questions in the format: ${questionType}.
Do not wrap your output in markdown backticks \`\`\`json. Return ONLY the raw JSON object.`;

    const userPrompt = `Generate a ${questionType} test on the subject of "${subject}", topic "${topic}", grade level "${gradeLevel}", difficulty "${difficulty}" with exactly ${questionCount} questions. Make it highly comprehensive.`;

    try {
      // Make a direct axios POST call to the Gemini 2.5 Flash API
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          contents: [{ parts: [{ text: userPrompt }] }],
          systemInstruction: { parts: [{ text: systemInstruction }] },
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.3
          }
        },
        { timeout: 15000 }
      );

      const responseText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (responseText) {
        const parsedJson = JSON.parse(responseText.trim());
        return res.json({ status: "Success", source: "GEMINI_API", practiceTest: parsedJson });
      } else {
        throw new Error("Empty candidate content from Gemini REST API.");
      }
    } catch (aiError) {
      console.error("[AI Test Engine] Live Gemini API invocation failed. Pivot to Offline Fallback Engine.", aiError.message);
      // Fall through to offline mock generator
    }
  }

  // ==========================================
  // OFFLINE HIGH-FIDELITY RULE-ENGINE FALLBACK
  // ==========================================
  console.log(`[AI Test Engine] Utilizing Offline Fallback Engine for Subject: ${subject}, Topic: ${topic}`);

  // Curated premium database of academic questions mapped across all 11 subject classes
  const mockDatabase = {
    "Mathematics": [
      {
        topic: "quadratic equations",
        questions: [
          {
            id: 1,
            question: "Solve the quadratic equation: x² - 5x + 6 = 0 using the factoring method.",
            options: ["x = 2 or x = 3", "x = -2 or x = -3", "x = 1 or x = 6", "x = -1 or x = -6"],
            hint: "Find two numbers that multiply to the constant term (+6) and add up to the linear coefficient (-5).",
            answer: "x = 2 or x = 3",
            solution: "Step 1: Write down the equation: x² - 5x + 6 = 0.\nStep 2: Identify two factors of +6 that sum to -5. These are -2 and -3 (since -2 * -3 = 6 and -2 + -3 = -5).\nStep 3: Factor the quadratic expression: (x - 2)(x - 3) = 0.\nStep 4: Use the zero product property: Set each binomial to zero:\nx - 2 = 0 => x = 2\nx - 3 = 0 => x = 3.\nTherefore, the solutions are x = 2 or x = 3.",
            common_mistakes: "Students often misapply the signs, factoring it as (x + 2)(x + 3) = 0, which results in wrong answers x = -2 or x = -3.",
            teacher_notes: "Focus on verifying the signs of the constant and linear coefficients before factoring. Emphasize checking answers by plugging them back into the original equation."
          },
          {
            id: 2,
            question: "Find the discriminant of the quadratic equation: 2x² - 4x + 3 = 0 and determine the nature of its roots.",
            options: ["D = -8 (Two complex conjugate roots)", "D = 8 (Two real distinct roots)", "D = 0 (One real repeated root)", "D = -24 (Two complex conjugate roots)"],
            hint: "The formula for the discriminant is D = b² - 4ac, where ax² + bx + c = 0.",
            answer: "D = -8 (Two complex conjugate roots)",
            solution: "Step 1: Identify coefficients: a = 2, b = -4, c = 3.\nStep 2: Apply discriminant formula: D = b² - 4ac.\nStep 3: Compute: D = (-4)² - 4(2)(3) = 16 - 24 = -8.\nStep 4: Since D < 0, the equation has two complex conjugate roots (non-real).",
            common_mistakes: "Forgetting that b² is positive regardless of b's sign. Students may compute (-4)² as -16, yielding D = -40.",
            teacher_notes: "Remind students that the discriminant is the term under the square root in the quadratic formula, hence negative D represents imaginary roots."
          }
        ]
      },
      {
        topic: "trigonometric identities",
        questions: [
          {
            id: 1,
            question: "Simplify the trigonometric expression: sin(x) * csc(x) - cos²(x).",
            options: ["sin²(x)", "cos²(x)", "tan²(x)", "1"],
            hint: "Recall that the cosecant function is the reciprocal of the sine function: csc(x) = 1/sin(x).",
            answer: "sin²(x)",
            solution: "Step 1: Write expression: sin(x) * csc(x) - cos²(x).\nStep 2: Substitute reciprocal identity: csc(x) = 1 / sin(x).\nStep 3: Simplify first term: sin(x) * (1 / sin(x)) = 1.\nStep 4: Rewrite expression: 1 - cos²(x).\nStep 5: Use Pythagorean identity: sin²(x) + cos²(x) = 1, which implies 1 - cos²(x) = sin²(x).\nFinal answer: sin²(x).",
            common_mistakes: "Mistaking sin(x) * csc(x) as cos(x) or failing to recognize the algebraic rearrangement of the Pythagorean identity.",
            teacher_notes: "Scaffold trig substitutions by keeping a list of reciprocal and quotient identities handy for students with IEP adjustments."
          }
        ]
      }
    ],
    "Science": [
      {
        topic: "photosynthesis",
        questions: [
          {
            id: 1,
            question: "What is the primary function of the light-dependent reactions during the process of photosynthesis?",
            options: ["Produce ATP and NADPH to power the Calvin Cycle", "Synthesize glucose molecules directly from CO₂", "Release carbon dioxide into the atmosphere", "Absorb water through root pressure"],
            hint: "These reactions take place in the thylakoid membranes of chloroplasts and require solar radiation.",
            answer: "Produce ATP and NADPH to power the Calvin Cycle",
            solution: "Step 1: Sunlight is absorbed by chlorophyll pigments in thylakoid membranes.\nStep 2: Water molecules are photolyzed (split) into hydrogen ions, electrons, and oxygen gas (released as a byproduct).\nStep 3: Light energy excites electrons, which travel down an electron transport chain.\nStep 4: This process pumps protons to generate ATP via ATP synthase and reduces NADP+ to NADPH.\nStep 5: The chemical energy carriers ATP and NADPH are then exported to the stroma to drive the light-independent reactions (Calvin Cycle).",
            common_mistakes: "Believing glucose is synthesized directly during the light-dependent phase, whereas it is actually synthesized in the Calvin Cycle.",
            teacher_notes: "Incorporate diagrams of a chloroplast stroma and thylakoid membrane to help visual learners coordinate these separate stages."
          }
        ]
      }
    ],
    "History / Social Studies": [
      {
        topic: "american revolution",
        questions: [
          {
            id: 1,
            question: "Analyze the cause-and-effect of the Stamp Act of 1765. Which of the following best maps the sequence of historical friction?",
            options: ["British debt from French & Indian War -> Stamp Act taxes -> Colonial protests & Boycotts -> Stamp Act Repealed with Declaratory Act", "Colonial tea boycotts -> Boston Tea Party -> Stamp Act Coercion -> Revolutionary War begins", "French alliances -> Stamp Act taxes -> Battle of Saratoga -> Treaty of Paris signing", "Invention of the cotton gin -> Stamp Act -> Southern agrarian boycotts -> Articles of Confederation"],
            hint: "Consider the consequences of the Seven Years' War and the financial burden placed on the British treasury.",
            answer: "British debt from French & Indian War -> Stamp Act taxes -> Colonial protests & Boycotts -> Stamp Act Repealed with Declaratory Act",
            solution: "Step 1: Timeline Landmark: Under King George III, Britain concludes French & Indian War (1763) with massive national debt.\nStep 2: Cause: Parliament passes Stamp Act (1765) asserting authority to tax all printed materials directly.\nStep 3: Reaction: Sons of Liberty protest with 'No Taxation Without Representation' and coordinate merchant boycotts.\nStep 4: Outcome: Parliament repeals the Stamp Act in 1766 due to economic pressure, but simultaneously passes the Declaratory Act, claiming absolute power over colonies.",
            common_mistakes: "Confusing the Stamp Act with the Townshend Acts or the Intolerable Acts which occurred later.",
            teacher_notes: "Use this cause-and-effect mapping as a blueprint for Document-Based Questions (DBQs). Encourage students to evaluate merchant letters from Boston in 1766."
          }
        ]
      }
    ],
    "English / Language Arts": [
      {
        topic: "reading comprehension",
        questions: [
          {
            id: 1,
            question: "Read the excerpt: 'The old oak tree stood sentinel at the crest of the hill, its gnarled roots clawing the earth like fingers grasping a treasure.' Which literary device is primary in this sentence, and what does it suggest?",
            options: ["Personification; it portrays the oak tree as a living guardian with human characteristics", "Hyperbole; it exaggerates the physical age of the woodland forest", "Alliteration; it repeats the 'o' vowels to slow the reader's rhythmic pacing", "Irony; it highlights the environmental damage caused by agrarian growth"],
            hint: "Look for terms like 'sentinel' (guard) and physical descriptors such as 'clawing like fingers'.",
            answer: "Personification; it portrays the oak tree as a living guardian with human characteristics",
            solution: "Step 1: Identify key descriptors: 'stood sentinel' and 'roots clawing like fingers'.\nStep 2: A 'sentinel' is a soldier or guard (human role), and 'clawing fingers' are human actions applied to an inanimate oak.\nStep 3: This attribution of human traits to an object is Personification.\nStep 4: It symbolically establishes the tree as an active protector of the landscape.",
            common_mistakes: "Mistaking personification for simple metaphor or failing to recognize 'sentinel' as a human agency.",
            teacher_notes: "Great for scaffolding descriptive writing. Ask students to write down five inanimate objects and assign them active, human professions."
          }
        ]
      }
    ],
    "Bible Study": [
      {
        topic: "fruits of the spirit",
        questions: [
          {
            id: 1,
            question: "According to Galatians 5:22-23, which list represents the scriptural Fruits of the Spirit, and how is 'Perseverance' represented in the modern virtue character context?",
            options: ["Love, joy, peace, patience, kindness, goodness, faithfulness, gentleness, self-control; Patience translates directly to long-suffering and perseverance under trial", "Faith, hope, charity, courage, prudence, justice, temperance, wisdom; perseverance is courage in prayer", "Prayer, fasting, giving, humility, scripture memorization, assembly; perseverance is regular tithing", "Repentance, water baptism, laying of hands, healing, prophecy, tongues; perseverance is continuous speaking"],
            hint: "Read Galatians 5:22-23. Think of how patience, goodness, and self-control support perseverance in academic and life obstacles.",
            answer: "Love, joy, peace, patience, kindness, goodness, faithfulness, gentleness, self-control; Patience translates directly to long-suffering and perseverance under trial",
            solution: "Step 1: Locate Galatians 5:22-23: 'But the fruit of the Spirit is love, joy, peace, forbearance (patience), kindness, goodness, faithfulness, gentleness and self-control.'\nStep 2: Analyze virtue translation: 'Forbearance' or patience is the ability to endure hardships calmly and faithfully without giving up.\nStep 3: In the Ambience Character Education model, this supports academic Perseverance—completing difficult topics with a joyful, resilient spirit, honoring God with our work.",
            common_mistakes: "Substituting theological concepts like 'wisdom' or general 'faith' for the specific list of fruits outlined in Galatians.",
            teacher_notes: "Integrate character application by discussing a situation where a student needed 'self-control' (restraining anger) or 'patience' (handling a tough math assignment)."
          }
        ]
      }
    ],
    "Computer / Technology": [
      {
        topic: "coding basics",
        questions: [
          {
            id: 1,
            question: "Study the Python code snippet:\n```python\ndef calculate_sum(n):\n    total = 0\n    for i in range(1, n + 1):\n        if i % 2 == 0:\n            total += i\n    return total\nprint(calculate_sum(5))\n```\nWhat is the output when this script executes?",
            options: ["6", "15", "12", "0"],
            hint: "Trace the loop for i from 1 up to 5. Check which values are even (i % 2 == 0) and sum them.",
            answer: "6",
            solution: "Step 1: Understand the parameters: n = 5.\nStep 2: Loop range(1, 6) produces sequence: 1, 2, 3, 4, 5.\nStep 3: Apply condition 'i % 2 == 0' (checks if even):\n- i = 1: 1%2 != 0 (Skip)\n- i = 2: 2%2 == 0 => total += 2 (total is now 2)\n- i = 3: 3%2 != 0 (Skip)\n- i = 4: 4%2 == 0 => total += 4 (total is now 6)\n- i = 5: 5%2 != 0 (Skip)\nStep 4: Function returns total = 6.\nPrint output: 6.",
            common_mistakes: "Assuming range(1, 5) excludes 5, or summing all integers (1+2+3+4+5=15) instead of filtering for even numbers.",
            teacher_notes: "Use print-tracing exercises to help students visualize loop executions. Highly recommended for strengthening computer science literacy."
          }
        ]
      }
    ],
    "Physical Education / Health": [
      {
        topic: "nutrition and wellness",
        questions: [
          {
            id: 1,
            question: "Which of the following describes the biological role of macronutrients and the importance of hydration for physical performance?",
            options: ["Carbohydrates supply immediate ATP energy; proteins support muscle tissue repair; fats support hormone synthesis; hydration regulates heat stress and joint lubrication", "Vitamins promote bone structure directly; carbohydrates convert to sodium; fats block blood vessels; hydration builds muscles", "Minerals are primary energy producers; proteins digest carbohydrates; fats hydrate liver tissues; water is a source of direct protein", "Calories are microscopic cells; hydration blocks perspiration; proteins carry minerals; water supplies fat storage"],
            hint: "Think about the primary fuel source for workouts (carbs), building blocks (protein), and thermo-regulation (water).",
            answer: "Carbohydrates supply immediate ATP energy; proteins support muscle tissue repair; fats support hormone synthesis; hydration regulates heat stress and joint lubrication",
            solution: "Step 1: Identify three major macronutrients: Carbohydrates, Proteins, and Lipids (Fats).\nStep 2: Map Carbohydrates to primary glycogen/glucose stores providing fuel for cells.\nStep 3: Map Proteins to amino-acid building blocks repairing muscle micro-tears from workouts.\nStep 4: Map Fats to long-term cellular energy and vital hormone synthesis.\nStep 5: Detail Hydration: Sweat loss cools the body during cardiovascular exertion. Water prevents cramps, joint grinding, and metabolic fatigue.",
            common_mistakes: "Students often categorize fats as purely harmful, forgetting that essential fatty acids are mandatory for hormone regulation and brain health.",
            teacher_notes: "Promote healthy lifestyle habits. Encourage students to keep a daily food-and-water log, tracing carbohydrate vs protein ratios."
          }
        ]
      }
    ]
  };

  // Safe categorization matching
  let normalizedSubject = subject;
  if (["K-12 Math", "Algebra", "Pre-Calculus", "Calculus", "Statistics", "SAT", "ACT", "EOG", "IOWA"].some(m => subject.includes(m)) || subject.toLowerCase().includes("math")) {
    normalizedSubject = "Mathematics";
  } else if (subject.toLowerCase().includes("science")) {
    normalizedSubject = "Science";
  } else if (subject.toLowerCase().includes("history") || subject.toLowerCase().includes("social")) {
    normalizedSubject = "History / Social Studies";
  } else if (subject.toLowerCase().includes("english") || subject.toLowerCase().includes("language") || subject.toLowerCase().includes("reading")) {
    normalizedSubject = "English / Language Arts";
  } else if (subject.toLowerCase().includes("bible") || subject.toLowerCase().includes("scripture")) {
    normalizedSubject = "Bible Study";
  } else if (subject.toLowerCase().includes("computer") || subject.toLowerCase().includes("tech") || subject.toLowerCase().includes("code")) {
    normalizedSubject = "Computer / Technology";
  } else if (subject.toLowerCase().includes("physical") || subject.toLowerCase().includes("health") || subject.toLowerCase().includes("wellness")) {
    normalizedSubject = "Physical Education / Health";
  }

  // Attempt to load questions from database
  let chosenCategory = mockDatabase[normalizedSubject] || mockDatabase["Mathematics"];
  let matchedTopic = chosenCategory.find(item => topic.toLowerCase().includes(item.topic) || item.topic.includes(topic.toLowerCase()));
  
  let questionsPool = matchedTopic ? matchedTopic.questions : null;

  // Dynamic Generator if no exact topic is matched or if more questions are requested than pool size
  if (!questionsPool) {
    console.log(`[AI Test Engine] Topic "${topic}" not found in offline DB. Triggering Dynamic Adaptation Engine...`);
    questionsPool = [];
    
    for (let i = 1; i <= questionCount; i++) {
      let q = "", ans = "", sol = "", hint = "", mistakes = "", notes = "", opts = null;

      if (normalizedSubject === "Mathematics") {
        q = `Solve the following high-tier mathematical challenge on ${topic} (${difficulty} difficulty): Find the value of 'x' when 3x + 12 = 5x - 8.`;
        opts = ["x = 10", "x = 4", "x = -10", "x = 2"];
        ans = "x = 10";
        hint = "Isolate the variable x on one side of the equation by subtracting 3x from both sides.";
        sol = `Step 1: Write down the original equation: 3x + 12 = 5x - 8.\nStep 2: Subtract 3x from both sides to gather terms: 12 = 2x - 8.\nStep 3: Add 8 to both sides to isolate the variable term: 20 = 2x.\nStep 4: Divide both sides by 2: x = 10.\nCheck: 3(10) + 12 = 42; 5(10) - 8 = 42. Verified!`;
        mistakes = "Subtracting rather than adding 8, leading to 2x = 4, or x = 2.";
        notes = "This question models fundamental linear manipulation. Emphasize verification of equations for all grade levels.";
      } else if (normalizedSubject === "Science") {
        q = `Analyze a core concept of "${topic}": Explain the conservation of mass/energy or core biological mechanics involved.`;
        opts = ["Reactants mass equals products mass", "Mass is destroyed during reactions", "Energy is entirely consumed", "Temperature drops to absolute zero"];
        ans = "Reactants mass equals products mass";
        hint = "In a closed system, matter can neither be created nor destroyed—only rearranged.";
        sol = `Step 1: Define the system parameters for ${topic}.\nStep 2: Identify chemical or physical inputs and outputs.\nStep 3: Apply the Law of Conservation of Mass/Energy. Sum of input weights must equal output weights.\nStep 4: Conclude that total mass remains invariant before and after the reaction.`;
        mistakes = "Believing that gas escape reduces total mass, forgetting to include gas mass in equations.";
        notes = "Focus on teaching students to track all inputs in chemical/physical systems. Great for general scientific inquiry.";
      } else if (normalizedSubject === "History / Social Studies") {
        q = `Identify a primary timeline milestone, cause/effect relationship, or document-based context for: "${topic}".`;
        opts = ["Catalyzed massive social, political, and institutional reform", "Had no measurable impact on global trade", "Was immediately forgotten within a year", "Was isolated to small uninhabited islands"];
        ans = "Catalyzed massive social, political, and institutional reform";
        hint = "Think about how this historical event changed the political or social map for future generations.";
        sol = `Step 1: Historical Timeline Context: Trace the root socio-political conditions leading up to ${topic}.\nStep 2: Primary Cause: Map immediate instigating incidents (e.g. protests, tax laws, economic blockades).\nStep 3: Intermediate Effect: Describe structural conflicts, revolutions, or legislative adjustments.\nStep 4: Long-Term Legacy: Analyze structural shifts in governance, liberty, or regional alliances.`;
        mistakes = "Confusing chronological ordering of events or applying modern values to historical figures out of context.";
        notes = "Perfect template for Document-Based Questions (DBQs). Ask students to cross-reference multiple direct historical sources.";
      } else if (normalizedSubject === "English / Language Arts") {
        q = `Read the sentence: "Despite the inclement weather, the team completed their rigorous training itinerary with unwavering resolve." What does "inclement" mean in this vocabulary context, and how does it affect the tone?`;
        opts = ["Harsh and severe; it highlights the team's grit", "Warm and sunny; it suggests a relaxing environment", "Unpredictable but pleasant; it suggests lighthearted fun", "Dry and barren; it implies agricultural struggles"];
        ans = "Harsh and severe; it highlights the team's grit";
        hint = "The sentence uses 'Despite' and 'unwavering resolve', indicating the weather was an obstacle.";
        sol = `Step 1: Extract context clues: 'Despite', 'rigorous training', 'unwavering resolve'.\nStep 2: Recognize that the weather must have been a negative factor, posing a hurdle.\nStep 3: 'Inclement' relates to stormy, cold, or harsh atmospheric conditions.\nStep 4: Synthesize: Harsh weather highlights and exaggerates the team's perseverance.`;
        mistakes = "Confusing 'inclement' with 'climatized' or selecting pleasant weather options due to poor contextual tracing.";
        notes = "Reinforces textual context tracing. Encourage students to replace unknown terms with general category words to infer meaning.";
      } else if (normalizedSubject === "Bible Study") {
        q = `Reflect on the biblical virtue application regarding: "${topic}". What scripture context coordinates this moral, and how does it apply to daily character?`;
        opts = ["Encourages active stewardship, integrity, and honor", "Is entirely theoretical and isolated from actions", "Suggests pursuing purely personal ambition", "Recommends avoiding all community service"];
        ans = "Encourages active stewardship, integrity, and honor";
        hint = "Consider how displaying love, responsibility, and honest behavior pleases God and serves those around us.";
        sol = `Step 1: Identify biblical anchors linked to "${topic}".\nStep 2: Read scripture-based warnings or commands on this moral virtue.\nStep 3: Analyze character application: Apply these parameters to schoolwork, parent interactions, and community roles.\nStep 4: Conclude: A faithful heart displays integrity even in small daily duties.`;
        mistakes = "Failing to connect biblical theology to practical, daily actions and decisions.";
        notes = "Focus on practical character application (Soli Deo Gloria). Perfect for cultivating young ambassadors with honest hearts.";
      } else if (normalizedSubject === "Computer / Technology") {
        q = `Which of the following describes a foundational computer science parameter or digital literacy basic for "${topic}"?`;
        opts = ["Ensures secure, efficient, and modular execution", "Requires deleting the operating system", "Is purely physical with no logical rules", "Has been replaced entirely by simple typewriter mechanics"];
        ans = "Ensures secure, efficient, and modular execution";
        hint = "Look for computer safety, code readability, or logic variables that prevent cyber risks.";
        sol = `Step 1: Understand code design or security parameters for ${topic}.\nStep 2: Trace logic variables sequentially (e.g. encryption, variable scopes, loop counters).\nStep 3: Identify structural boundaries preventing performance failures or cyber leaks.\nStep 4: Formulate a clean, modular optimization.`;
        mistakes = "Failing to validate input lengths, or ignoring variable initialization before execution loops.";
        notes = "Builds tech literacy. Explain basic programming concepts or security hygiene habits to encourage future engineers.";
      } else {
        q = `Wellness & Safety Review: Explain the optimal wellness, safety, or fitness habit parameters associated with "${topic}".`;
        opts = ["Promotes balanced nutrition, athletic safety, and positive habits", "Recommends high sugar consumption and zero sleep", "Suggests avoiding warm-ups before sprints", "Promotes dehydration during long exercises"];
        ans = "Promotes balanced nutrition, athletic safety, and positive habits";
        hint = "Optimal performance relies on muscle rest, hydration, nutrition, and safety boundaries.";
        sol = `Step 1: Isolate health or fitness goals for "${topic}".\nStep 2: Detail physical warm-ups, dietary safety, and protective sports gear.\nStep 3: Incorporate daily hydration and balanced nutritional calorie intake boundaries.\nStep 4: Encourage mental wellness through consistent sleep schedules.`;
        mistakes = "Over-exertion without prior warm-ups, or disregarding hydration guidelines during heat stress.";
        notes = "Cultivates lifetime healthy habits. Discuss fitness parameters alongside character goals (perseverance in wellness).";
      }

      questionsPool.push({
        id: i,
        question: q,
        options: questionType === "Multiple Choice" ? opts : null,
        hint,
        answer: ans,
        solution: includeSolutions ? sol : "Solution details are disabled by tutor configurations.",
        common_mistakes: mistakes,
        teacher_notes: notes
      });
    }
  }

  // Ensure count aligns exactly to questionCount parameter
  const finalQuestions = questionsPool.slice(0, questionCount);

  // Generate gorgeous test title
  let generatedTitle = `${gradeLevel} ${subject} - ${topic.charAt(0).toUpperCase() + topic.slice(1)} Practice Assessment`;
  if (subject === "SAT" || subject === "ACT" || subject === "EOG" || subject === "IOWA") {
    generatedTitle = `Official Mock ${subject} - ${topic.charAt(0).toUpperCase() + topic.slice(1)} Diagnostics (${difficulty})`;
  }

  const generatedTest = {
    title: generatedTitle,
    questions: finalQuestions
  };

  res.json({ 
    status: "Success", 
    source: "OFFLINE_DEMO_ENGINE", 
    practiceTest: generatedTest 
  });
});

// =========================================================================
// PHASE 6: AI LESSON PLANNER ENDPOINTS
// =========================================================================
const lessonPlansDb = [];

// GET: Retrieve all saved lesson plans (offline registry)
app.get("/api/ai/lesson-plans", requireAuth, (req, res) => {
  const { studentId, tutorId } = req.query;
  let filtered = lessonPlansDb;
  
  if (studentId) {
    filtered = filtered.filter(lp => lp.studentId === studentId);
  }
  if (tutorId) {
    filtered = filtered.filter(lp => lp.tutorId === tutorId);
  }
  
  res.json({ status: "Success", lessonPlans: filtered });
});

// POST: Save lesson plan to local memory (offline fallback)
app.post("/api/ai/lesson-plans", requireAuth, requireRole(["Tutor", "Admin"]), (req, res) => {
  const { studentId, tutorId, title, gradeLevel, subject, topic, duration, learningObjective, difficulty, config, content } = req.body;
  
  if (!title || !subject || !topic || !content) {
    return res.status(400).json({ error: "Missing required lesson plan fields." });
  }

  const newPlan = {
    id: "lp_" + Math.random().toString(36).substr(2, 9),
    studentId: studentId || null,
    tutorId: tutorId || req.user.id || "tut_1",
    title,
    gradeLevel,
    subject,
    topic,
    duration,
    learningObjective,
    difficulty,
    config: config || {},
    content,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  lessonPlansDb.push(newPlan);
  console.log(`[Database] Lesson plan "${title}" saved to offline in-memory registry.`);
  res.json({ status: "Success", lessonPlan: newPlan });
});

// POST: AI Lesson Planner Generator
app.post("/api/ai/generate-lesson-plan", requireAuth, requireRole(["Tutor", "Admin"]), async (req, res) => {
  const {
    studentId,
    gradeLevel = "7th Grade",
    subject,
    topic,
    duration = "60 minutes",
    learningObjective = "Master core concepts",
    difficulty = "Medium",
    includeHomework = true,
    includeAssessment = true,
    includeCharacterEducation = true
  } = req.body;

  if (!subject || !topic) {
    return res.status(400).json({ error: "Subject and Topic are required fields to generate a lesson plan." });
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY;
  const isAiEnabled = apiKey && !apiKey.includes("PLACEHOLDER") && apiKey.trim().length > 10;

  if (isAiEnabled) {
    console.log(`[AI Planner Engine] Calling Live Gemini AI for Subject: ${subject}, Topic: ${topic}`);

    const systemInstruction = `You are Ambience Lesson Planner™, an elite pedagogical AI designed to generate complete, high-fidelity lesson plans.
Your output MUST be a single, valid JSON object matching the exact structure below:
{
  "lessonTitle": "String - Premium, engaging lesson title",
  "objectives": "String - Clear, SWBAT (Students Will Be Able To) objectives",
  "warmUp": "String - Engaging 5-10 minute warm-up activity",
  "directInstruction": "String - Highly detailed core instruction steps and examples",
  "guidedPractice": "String - Collaborative or structured tutor-led problems or prompts",
  "independentPractice": "String - Independent work or reflection questions",
  "exitTicket": "String - Fast formative assessment for the end of session",
  "homework": "String - Clear, scaffolded reinforcing homework assignment description",
  "teacherGuide": "String - Step-by-step notes, time boundaries, or focal teaching cues",
  "differentiationNotes": "String - Accommodations and extensions for diverse learner styles"
}

Ensure to weave character education elements (Grit, Integrity, Dilligence, and Perseverance) if includeCharacterEducation is true.
Do not wrap your output in markdown backticks \`\`\`json. Return ONLY the raw JSON object.`;

    const userPrompt = `Generate a comprehensive, highly customized lesson plan for a ${gradeLevel} student on the subject "${subject}" and topic "${topic}".
Duration: ${duration}.
Learning Objective: "${learningObjective}".
Difficulty: "${difficulty}".
Include Homework: ${includeHomework}.
Include Assessment: ${includeAssessment}.
Include Character Education: ${includeCharacterEducation}.`;

    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          contents: [{ parts: [{ text: userPrompt }] }],
          systemInstruction: { parts: [{ text: systemInstruction }] },
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.4
          }
        },
        { timeout: 15000 }
      );

      const responseText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (responseText) {
        const parsedJson = JSON.parse(responseText.trim());
        return res.json({ status: "Success", source: "GEMINI_API", lessonPlan: parsedJson });
      }
    } catch (aiError) {
      console.error("[AI Planner Engine] Live Gemini API failed. Falling back to Offline Rule-Engine.", aiError.message);
    }
  }

  // ==========================================
  // OFFLINE HIGH-FIDELITY RULE-ENGINE FALLBACK
  // ==========================================
  console.log(`[AI Planner Engine] Utilizing Offline Fallback Engine for Subject: ${subject}, Topic: ${topic}`);

  // Compose premium tailored offline responses based on parameters
  let title = `${gradeLevel} - Structured Lesson: ${topic.charAt(0).toUpperCase() + topic.slice(1)}`;
  let obj = `Students will be able to master the fundamental mechanics of "${topic}" at a ${difficulty} difficulty tier within ${duration}.`;
  let warm = `1. Hook (5 mins): Provide an real-life analogy connected to ${topic}.\n2. Prior Knowledge Check: Ask the student to define basic prerequisites.`;
  let direct = `Core Concepts (15 mins):\n- Walk through 3 step-by-step examples of "${topic}".\n- Identify the core rules and notation variables.\n- Highlight critical focal definitions.`;
  let guided = `Coached Problems (15 mins):\n- Problem 1: Work together, explaining each transition step.\n- Problem 2: Tutor writes the problem; student dictates steps.\n- Problem 3: Student completes with hints available.`;
  let independent = `Student Solo Flight (15 mins):\n- Complete a set of 3 practice tasks covering different aspects of ${topic}.\n- Correct any minor execution slips.`;
  let exit = `Formative Check (5 mins):\n- Prompt: Explain in your own words the single most important rule for resolving "${topic}".`;
  let hw = includeHomework ? `Create a follow-up sheet of 5 scaffolded review tasks targeting "${topic}". Recommended completion time: 15 minutes.` : "Disabled by tutor configurations.";
  let guide = `Teacher Cues:\n- Keep an eye on time constraints during the warm-up.\n- Ensure the student takes notes on formulas or vocab words.\n- Praise correct steps to build academic confidence.`;
  let diff = `Differentiation:\n- Support: Offer visual guides or pre-written vocabulary cards.\n- Extension: Encourage the student to explain a complex edge-case scenario.`;

  if (includeCharacterEducation) {
    obj += ` Incorporates reflections on 'Diligence and Perseverance'.`;
    warm += ` Connect the challenge of learning "${topic}" to the virtue of Perseverance.`;
    independent += ` Discuss how overcoming complex academic problems builds Grit and Integrity.`;
  }

  const simulatedPlan = {
    lessonTitle: title,
    objectives: obj,
    warmUp: warm,
    directInstruction: direct,
    guidedPractice: guided,
    independentPractice: independent,
    exitTicket: exit,
    homework: hw,
    teacherGuide: guide,
    differentiationNotes: diff
  };

  res.json({
    status: "Success",
    source: "OFFLINE_DEMO_ENGINE",
    lessonPlan: simulatedPlan
  });
});


// =========================================================================
// PHASE 6: AI IEP ASSISTANT ENDPOINTS
// =========================================================================
const iepNotesDb = [];

// GET: Retrieve all saved IEP notes (offline registry)
app.get("/api/ai/iep-notes", requireAuth, (req, res) => {
  const { studentId, tutorId } = req.query;
  let filtered = iepNotesDb;
  
  if (studentId) {
    filtered = filtered.filter(iep => iep.studentId === studentId);
  }
  if (tutorId) {
    filtered = filtered.filter(iep => iep.tutorId === tutorId);
  }
  
  res.json({ status: "Success", iepNotes: filtered });
});

// POST: Save IEP notes to local memory (offline fallback)
app.post("/api/ai/iep-notes", requireAuth, requireRole(["Tutor", "Admin"]), (req, res) => {
  const { studentId, tutorId, strengths, challenges, accommodations, goals, progressNotes, parentSummary, tutorSteps } = req.body;
  
  if (!studentId || !strengths || !challenges || !accommodations || !goals) {
    return res.status(400).json({ error: "Missing required IEP assistant fields." });
  }

  const newIEP = {
    id: "iep_" + Math.random().toString(36).substr(2, 9),
    studentId,
    tutorId: tutorId || req.user.id || "tut_1",
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

  iepNotesDb.push(newIEP);
  console.log(`[Database] IEP notes for student "${studentId}" saved to offline in-memory registry.`);
  res.json({ status: "Success", iepNote: newIEP });
});

// POST: AI IEP Assistant Generator
app.post("/api/ai/generate-iep-notes", requireAuth, requireRole(["Tutor", "Admin"]), async (req, res) => {
  const {
    studentId,
    studentName = "Student",
    strengths = "Eager to learn",
    challenges = "Easily distracted during long tasks",
    currentGoals = "Build math fluency and focus"
  } = req.body;

  if (!studentId) {
    return res.status(400).json({ error: "Student ID is a required field." });
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY;
  const isAiEnabled = apiKey && !apiKey.includes("PLACEHOLDER") && apiKey.trim().length > 10;

  if (isAiEnabled) {
    console.log(`[AI IEP Assistant] Calling Live Gemini AI for Student: ${studentName}`);

    const systemInstruction = `You are Ambience AI IEP Assistant™, an elite special education mentor designed to support tutors with accommodations, progress monitoring, and parents communication.
Your output MUST be a single, valid JSON object matching this structure:
{
  "strengths": "String - Formally structured overview of student strengths",
  "challenges": "String - Analytical breakdown of academic or behavioral challenges",
  "accommodationSuggestions": "String - Detailed lists of customized accommodation strategies (e.g. visual aids, extra breaks, graphic organizers)",
  "goalDrafting": "String - SMART (Specific, Measurable, Attainable, Relevant, Time-bound) goals with measurable metrics",
  "progressNotes": "String - Narrative tracking how the tutor can measure progress weekly",
  "parentSummary": "String - Encouraging, parent-friendly summary of updates and partnerships",
  "tutorSteps": "String - Actionable tutor instructions for subsequent sessions"
}

Do not wrap your output in markdown backticks \`\`\`json. Return ONLY the raw JSON object.`;

    const userPrompt = `Develop a comprehensive IEP Support Plan for student "${studentName}".
Strengths: "${strengths}".
Challenges: "${challenges}".
Current Goals/Foci: "${currentGoals}".`;

    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          contents: [{ parts: [{ text: userPrompt }] }],
          systemInstruction: { parts: [{ text: systemInstruction }] },
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.3
          }
        },
        { timeout: 15000 }
      );

      const responseText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (responseText) {
        const parsedJson = JSON.parse(responseText.trim());
        return res.json({ status: "Success", source: "GEMINI_API", iepReport: parsedJson });
      }
    } catch (aiError) {
      console.error("[AI IEP Assistant] Live Gemini API failed. Falling back to Offline Rule-Engine.", aiError.message);
    }
  }

  // ==========================================
  // OFFLINE HIGH-FIDELITY RULE-ENGINE FALLBACK
  // ==========================================
  console.log(`[AI IEP Assistant] Utilizing Offline Fallback Engine for Student: ${studentName}`);

  const simulatedIEP = {
    strengths: `${studentName} exhibits excellent intrinsic motivation, a warm attitude toward learning, and notable strengths in conceptual reasoning and oral articulation.`,
    challenges: `Struggles with ${challenges.toLowerCase()}, which can manifest as computational slips or frustration when faced with complex multi-step problems.`,
    accommodationSuggestions: `1. Visual Checklists: Break multi-step instructions down into numbered checklists.\n2. Chunked Timing: Set a timer for 15 minutes of focus followed by a 1-minute visual break.\n3. Graphic Organizers: Provide formula reference sheets during sessions.`,
    goalDrafting: `Goal 1: When presented with a multi-step task, ${studentName} will utilize a visual checklist to solve problems with at least 80% independent accuracy over 4 consecutive tutoring sessions.\nGoal 2: Build computational focus by reducing off-task breaks from 3 per session to 1 or fewer.`,
    progressNotes: `Track task completion rates and the number of tutor redirects required per session. Log daily scores on computational accuracy.`,
    parentSummary: `Dear Parent, ${studentName} is doing incredibly well with oral reasoning! We are focusing on supporting mathematical focus and tracking steps using organized checklists. Your support in encouraging ${studentName} to double-check work at home is invaluable.`,
    tutorSteps: `1. Introduce the session with a 3-step checklist.\n2. Do not explain steps immediately—prompt ${studentName} to identify which checklist item comes next.\n3. Praise diligent effort and resilience rather than pure speed.`
  };

  res.json({
    status: "Success",
    source: "OFFLINE_DEMO_ENGINE",
    iepReport: simulatedIEP
  });
});


// =========================================================================
// PHASE 7: AI TUTOR COPILOT ENDPOINTS
// =========================================================================
const copilotDb = [];

// GET: Retrieve all saved copilot records (offline registry)
app.get("/api/ai/copilot-records", requireAuth, (req, res) => {
  const { studentId, tutorId } = req.query;
  let filtered = copilotDb;
  
  if (studentId) {
    filtered = filtered.filter(cr => cr.studentId === studentId);
  }
  if (tutorId) {
    filtered = filtered.filter(cr => cr.tutorId === tutorId);
  }
  
  res.json({ status: "Success", copilotRecords: filtered });
});

// POST: Save copilot record to local memory (offline fallback)
app.post("/api/ai/copilot-records", requireAuth, requireRole(["Tutor", "Admin"]), (req, res) => {
  const { studentId, tutorId, subject, topic, gradeLevel, sessionContext, studentChallenge, supportType, content } = req.body;
  
  if (!subject || !topic || !content) {
    return res.status(400).json({ error: "Missing required copilot record fields." });
  }

  const newRecord = {
    id: "cop_" + Math.random().toString(36).substr(2, 9),
    studentId: studentId || null,
    tutorId: tutorId || req.user.id || "tut_1",
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

  copilotDb.push(newRecord);
  console.log(`[Database] Copilot record for topic "${topic}" saved to offline in-memory registry.`);
  res.json({ status: "Success", copilotRecord: newRecord });
});

// POST: AI Tutor Copilot Generator
app.post("/api/ai/generate-copilot", requireAuth, requireRole(["Tutor", "Admin"]), async (req, res) => {
  const {
    studentId,
    studentName = "Student",
    subject = "Mathematics",
    topic,
    gradeLevel = "7th Grade",
    currentLesson = "",
    studentChallenge = "",
    supportType = "Analogy"
  } = req.body;

  if (!subject || !topic) {
    return res.status(400).json({ error: "Subject and Topic are required fields to run the Copilot." });
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY;
  const isAiEnabled = apiKey && !apiKey.includes("PLACEHOLDER") && apiKey.trim().length > 10;

  if (isAiEnabled) {
    console.log(`[AI Tutor Copilot Engine] Calling Live Gemini AI for Subject: ${subject}, Topic: ${topic}`);

    const systemInstruction = `You are Ambience Tutor Copilot™, an elite, real-time live tutoring support assistant.
Your output MUST be a single, valid JSON object matching the exact structure below:
{
  "simpleExplanation": "String - Simple, intuitive, child-friendly explanation using a rich, helpful analogy",
  "deeperExplanation": "String - Rigorous, deeper explanation of the underlying concepts, mechanics, and terminology",
  "teachingGuide": "String - Step-by-step notes, time boundaries, or focal teaching cues for the tutor during the live session",
  "exampleProblem": "String - A step-by-step worked example demonstrating the solution process cleanly",
  "practiceProblems": "String - 2-3 practice problems for the student to solve",
  "hints": "String - Incremental hints corresponding to the practice problems to guide the student without giving away the answer",
  "commonMistakes": "String - Common student misconceptions, mechanical errors, or slip-ups to watch out for",
  "iepAccommodations": "String - Dynamic IEP accommodation ideas tailored to the student's specific challenge",
  "characterReflection": "String - A thoughtful, contextual reflection connecting the learning topic or challenge to Christian character virtues like Grit, Integrity, Diligence, or Perseverance",
  "parentSummary": "String - Encouraging, positive, jargon-free progress update for the parent",
  "tutorNotes": "String - Quick, actionable post-session review notes for the tutor's record"
}

Do not wrap your output in markdown backticks \`\`\`json. Return ONLY the raw JSON object.`;

    const userPrompt = `Generate real-time live support assets for a tutor teaching a ${gradeLevel} student on the subject "${subject}" and topic "${topic}".
Current lesson context: "${currentLesson}".
Student's specific challenge: "${studentChallenge}".
Requested support focus type: "${supportType}".`;

    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          contents: [{ parts: [{ text: userPrompt }] }],
          systemInstruction: { parts: [{ text: systemInstruction }] },
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.3
          }
        },
        { timeout: 15000 }
      );

      const responseText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (responseText) {
        const parsedJson = JSON.parse(responseText.trim());
        return res.json({ status: "Success", source: "GEMINI_API", copilotOutput: parsedJson });
      }
    } catch (aiError) {
      console.error("[AI Tutor Copilot Engine] Live Gemini API failed. Falling back to Offline Rule-Engine.", aiError.message);
    }
  }

  // ==========================================
  // OFFLINE HIGH-FIDELITY RULE-ENGINE FALLBACK
  // ==========================================
  console.log(`[AI Tutor Copilot Engine] Utilizing Offline Fallback Engine for Subject: ${subject}, Topic: ${topic}`);

  // Base Fallback Content
  let simpleExpl = `Think of "${topic}" like a bridge. To get across safely, you have to place each brick one-by-one. If you skip a brick, the bridge gets shaky. In the same way, we tackle this topic step-by-step so our understanding stays strong and rock-solid!`;
  let deepExpl = `In ${subject}, the topic "${topic}" involves understanding key relational rules, structural components, and notation standards. This concept is fundamental to building advanced fluency in the domain and underpins subsequent curriculum benchmarks.`;
  let guide = `1. Introduction (3 mins): Direct the student's focus to the core rule.\n2. Guided Example (5 mins): Solve 1 sample problem together.\n3. Student Practice (10 mins): Let the student work independently while you watch for computational slips.`;
  let example = `Problem: Evaluate / solve a representative task for "${topic}".\nSolution:\nStep 1: Identify key variables.\nStep 2: Apply the core formula / rule.\nStep 3: Simplify and state the final result.`;
  let practice = `1. Solve a foundational level problem on "${topic}".\n2. Solve a slightly more complex problem containing a minor twist.\n3. Complete a review task applying what you've learned.`;
  let hints = `Hint for Problem 1: Look at the direct instruction example above.\nHint for Problem 2: Remember to check your signs / vocabulary terms.\nHint for Problem 3: Take your time and outline each step on your workspace first.`;
  let mistakes = `1. Rushing through steps without noting variables.\n2. Minor sign changes or grammatical flips.\n3. Forgetting to double-check the final solution.`;
  let accommodations = `1. Intersperse tasks with 1-minute visual brain breaks.\n2. Provide color-coded formula sheet or graphic organizer.\n3. Allow speech-to-text or verbal dictation of answers.`;
  let charReflect = `Learning "${topic}" can feel challenging, but this is the perfect opportunity to practice Diligence and Perseverance. In Bible Study, we learn that perseverance produces character (Romans 5:4). Every small step you take builds grit!`;
  let parentSumm = `We had a productive session today! ${studentName} worked through "${topic}" with great effort. We focused on building confidence step-by-step, and ${studentName} showed wonderful diligence. We'll continue reinforcing this in subsequent lessons.`;
  let tutorNotes = `The student is making steady progress but struggles when tasks become repetitive. For the next session, incorporate a game-like visual aid and offer frequent encouragement to keep engagement high.`;

  // Custom tailoring by subject
  const lowerSubject = subject.toLowerCase();
  if (lowerSubject.includes("math") || lowerSubject.includes("calculus") || lowerSubject.includes("algebra")) {
    simpleExpl = `Think of ${topic} like baking a cake. If you don't follow the recipe steps in order (like parenthesis, exponents, multiplication), your cake won't rise correctly! We use our mathematical recipe to get the exact answer every time.`;
    deepExpl = `The mechanics of "${topic}" rely on balancing algebraic expressions, utilizing logical transformation rules, and executing precise computations. Isolating variables or applying theorems allows us to maintain mathematical equality across equations.`;
    example = `Example: Solve for x in a sample ${topic} scenario.\n1. Isolate variable: subtract constants from both sides.\n2. Balance coefficients: divide by multiplier.\n3. Verify: substitute the result back into the original equation to prove equality.`;
  } else if (lowerSubject.includes("science") || lowerSubject.includes("physics") || lowerSubject.includes("chemistry")) {
    simpleExpl = `Think of ${topic} like a tiny biological engine or clock. Every gear (atoms, cells, forces) has a precise job to do. If one gear turns, it causes a chain reaction that makes the whole system work!`;
    deepExpl = `The scientific framework of "${topic}" describes an empirical, observable process governed by physical laws and molecular/structural models. Understanding this allows us to predict reactions, forces, or cellular actions accurately.`;
  } else if (lowerSubject.includes("english") || lowerSubject.includes("language") || lowerSubject.includes("ela")) {
    simpleExpl = `Think of ${topic} like assembling a lego castle. Words and punctuation are the bricks. If we arrange them using the correct rules, we build a solid sentence that everyone can clearly understand!`;
    deepExpl = `This ELA module targets "${topic}" to develop grammatical synthesis, reading comprehension benchmarks, or analytical writing. Mastering this allows students to construct clear, cohesive structures.`;
  } else if (lowerSubject.includes("bible")) {
    simpleExpl = `Think of ${topic} like looking at a treasure map. Every verse and historical context helps us find the deeper truth about God's love, faithfulness, and His beautiful plan for our lives!`;
    deepExpl = `A theological and historical study of "${topic}". We examine scripture passages, contextual cultural settings, and theological applications to understand the spiritual and practical lessons for daily walk in faith.`;
    charReflect = `Exploring "${topic}" connects directly to our character. Building Dilligence and Integrity allows us to live out our faith with honesty and love, showing God's grace in everything we do.`;
  } else if (lowerSubject.includes("computer") || lowerSubject.includes("tech")) {
    simpleExpl = `Think of ${topic} like writing a secret recipe for a very obedient robot. The robot will do exactly what you write, so we have to give it clear, simple, and numbered steps!`;
    deepExpl = `Computer science principles of "${topic}" focus on logical flows, syntax constructs, algorithmic efficiency, and debugging structures. Isolating mechanical bugs helps us build resilient software.`;
  }

  // Incorporate custom student challenge if provided
  if (studentChallenge) {
    accommodations = `Accommodations specifically tailored for "${studentChallenge}":\n1. Chunk complex tasks into 3 smaller milestones.\n2. Offer visual step-by-step checklists.\n3. Increase positive reinforcement for each step completed.`;
    tutorNotes += `\n* Note: Monitored challenge of "${studentChallenge}" closely during tasks. Offered supportive scaffolds.`;
  }

  const simulatedCopilot = {
    simpleExplanation: simpleExpl,
    deeperExplanation: deepExpl,
    teachingGuide: guide,
    exampleProblem: example,
    practiceProblems: practice,
    hints: hints,
    commonMistakes: mistakes,
    iepAccommodations: accommodations,
    characterReflection: charReflect,
    parentSummary: parentSumm,
    tutorNotes: tutorNotes
  };

  res.json({
    status: "Success",
    source: "OFFLINE_DEMO_ENGINE",
    copilotOutput: simulatedCopilot
  });
});


// PHASE 8: AI PARENT COPILOT ENDPOINTS
// =========================================================================
const parentCopilotDb = [];

// GET: Retrieve all saved parent copilot records (offline registry)
app.get("/api/ai/parent-copilot-records", requireAuth, (req, res) => {
  const { studentId, parentId } = req.query;
  let filtered = parentCopilotDb;
  
  if (studentId) {
    filtered = filtered.filter(cr => cr.studentId === studentId);
  }
  if (parentId) {
    filtered = filtered.filter(cr => cr.parentId === parentId);
  }
  
  res.json({ status: "Success", parentCopilotRecords: filtered });
});

// POST: Save parent copilot record to local memory (offline fallback)
app.post("/api/ai/parent-copilot-records", requireAuth, requireRole(["Parent", "Admin"]), (req, res) => {
  const { studentId, parentId, subject, topic, currentAssignment, parentConcern, supportType, content } = req.body;
  
  if (!subject || !topic || !content) {
    return res.status(400).json({ error: "Missing required parent copilot record fields." });
  }

  const newRecord = {
    id: "pcop_" + Math.random().toString(36).substr(2, 9),
    studentId: studentId || null,
    parentId: parentId || req.user.id || "par_1",
    subject,
    topic,
    currentAssignment: currentAssignment || "",
    parentConcern: parentConcern || "",
    supportType: supportType || "",
    content,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  parentCopilotDb.push(newRecord);
  console.log(`[Database] Parent Copilot record for topic "${topic}" saved to offline in-memory registry.`);
  res.json({ status: "Success", parentCopilotRecord: newRecord });
});

// POST: AI Parent Copilot Generator
app.post("/api/ai/generate-parent-copilot", requireAuth, requireRole(["Parent", "Admin"]), async (req, res) => {
  const {
    studentId,
    studentName = "Student",
    subject = "Mathematics",
    topic,
    currentAssignment = "",
    parentConcern = "",
    supportType = "At-home coaching"
  } = req.body;

  if (!subject || !topic) {
    return res.status(400).json({ error: "Subject and Topic are required fields to run the Parent Copilot." });
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY;
  const isAiEnabled = apiKey && !apiKey.includes("PLACEHOLDER") && apiKey.trim().length > 10;

  if (isAiEnabled) {
    console.log(`[AI Parent Copilot Engine] Calling Live Gemini AI for Subject: ${subject}, Topic: ${topic}`);

    const systemInstruction = `You are Ambience Parent Copilot™, an elite at-home academic coach and parent support assistant.
Your output MUST be a single, valid JSON object matching the exact structure below:
{
  "parentExplanation": "String - Simple, clear, encouraging explanation for the parent to understand the topic easily without complex academic jargon.",
  "homeworkGuide": "String - Specific guidance on how to help the student through homework or assignments on this topic without doing the work for them.",
  "atHomePractice": "String - A set of 2-3 interactive, at-home practice activities or verbal questions to reinforce understanding.",
  "studentEncouragement": "String - A short, positive, uplifting message for the parent to read to the student to boost confidence.",
  "progressSummary": "String - A constructive summary explaining what milestones the student is achieving by learning this topic.",
  "tutorQuestions": "String - 2-3 thoughtful questions the parent can ask their child's tutor about progress or support in this area.",
  "studentQuestions": "String - 2-3 warm, non-threatening questions to ask the student during or after learning to check their understanding.",
  "characterReflection": "String - A supportive character reflection tying this topic or study process to Christian values like patience, diligence, resilience, and gratitude.",
  "bibleReflection": "String - A relevant encouraging scripture verse reference and brief thought relating study habits, courage, or learning to God's word.",
  "iepSupportTips": "String - Gentle, actionable accommodation tips or sensory guidance for the parent if the student has learning differences or feels easily frustrated."
}

Do not wrap your output in markdown backticks \`\`\`json. Return ONLY the raw JSON object.`;

    const userPrompt = `Generate parent support assets for a parent helping a student with the subject "${subject}" and topic "${topic}".
Current assignment or test context: "${currentAssignment}".
Parent's primary concern: "${parentConcern}".
Desired support type: "${supportType}".`;

    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          contents: [{ parts: [{ text: userPrompt }] }],
          systemInstruction: { parts: [{ text: systemInstruction }] },
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.3
          }
        },
        { timeout: 15000 }
      );

      const responseText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (responseText) {
        const parsedJson = JSON.parse(responseText.trim());
        return res.json({ status: "Success", source: "GEMINI_API", copilotOutput: parsedJson });
      }
    } catch (aiError) {
      console.error("[AI Parent Copilot Engine] Live Gemini API failed. Falling back to Offline Rule-Engine.", aiError.message);
    }
  }

  // ==========================================
  // OFFLINE HIGH-FIDELITY RULE-ENGINE FALLBACK
  // ==========================================
  console.log(`[AI Parent Copilot Engine] Utilizing Offline Fallback Engine for Subject: ${subject}, Topic: ${topic}`);

  // Base Fallback Content
  let parentExpl = `Think of "${topic}" as learning to ride a bicycle. At first, your child needs a lot of balance support (our scaffolding), but soon they will pedal independently. This topic is about building that initial balance!`;
  let homeworkG = `1. Ask your child to explain the problem in their own words first.\n2. Guide them to highlight the main question.\n3. Celebrate small victories, like showing their work, even if the final calculation has a minor slip.`;
  let atHomePrac = `1. Dynamic Discussion: Ask your child how they would teach this topic to a friend.\n2. Quick Scenario: Give them a simple, everyday example (like sorting groceries or division during snack time) to apply the rule.`;
  let studEncour = `You are doing a wonderful job, ${studentName}! Learning new things takes time, but every effort you make is building your brain. I am so proud of your hard work and diligence!`;
  let progSummary = `By mastering "${topic}", your child is developing critical thinking patterns, logic benchmarks, and problem-solving skills in ${subject}. This forms a vital stepping stone for upcoming learning units.`;
  let tutorQ = `1. How does my child respond when they encounter a challenge in "${topic}"?\n2. Are there specific learning aids or visual tools we should use at home to match your tutoring sessions?`;
  let studentQ = `1. What was the most interesting or surprising part about "${topic}" today?\n2. Which part felt a little tricky, and how can we tackle it together?`;
  let charReflect = `Learning "${topic}" requires a heart of Patience and Diligence. We are reminded that "the testing of your faith produces perseverance" (James 1:3). Encourage your child that struggles are just pathways to growth.`;
  let bibleReflect = `Philippians 4:13 - "I can do all things through Christ who strengthens me." Encourage your child that God has gifted them with a capable mind and that they can approach their schoolwork with peace and confidence.`;
  let iepSupport = `If your child gets frustrated:\n1. Break homework into 10-minute blocks with short sensory or stretching breaks.\n2. Reduce visual distractions on their desk.\n3. Allow them to dictate answers verbally to reduce writing fatigue.`;

  // Custom tailoring by subject
  const lowerSubject = subject.toLowerCase();
  if (lowerSubject.includes("math") || lowerSubject.includes("calculus") || lowerSubject.includes("algebra") || lowerSubject.includes("sat") || lowerSubject.includes("act")) {
    parentExpl = `In Mathematics, "${topic}" is all about patterns and structural relationships. It is like climbing a staircase—we must build a secure footing on each step so your child feels safe and steady as they climb higher.`;
    homeworkG = `Avoid telling them the answer. Instead, ask: "What is our mathematical recipe/formula for this?" or "Can you draw a diagram of what is happening?" This builds deep mathematical autonomy.`;
  } else if (lowerSubject.includes("science") || lowerSubject.includes("physics") || lowerSubject.includes("chemistry")) {
    parentExpl = `Science is all about curiosity and discovery. "${topic}" explains how a physical, biological, or chemical process works in our God-given universe. Think of it like examining the gears of a tiny, perfect watch!`;
  } else if (lowerSubject.includes("english") || lowerSubject.includes("language") || lowerSubject.includes("ela")) {
    parentExpl = `Reading and writing are the keys to clear communication. "${topic}" teaches children how to structure their thoughts, punctuation, or grammar like building a sturdy house out of blocks.`;
  } else if (lowerSubject.includes("bible")) {
    parentExpl = `This unit is a beautiful exploration of God's Word focusing on "${topic}". It is about learning the historical context, scripture truths, and practical ways to live out our faith with grace, honesty, and love.`;
    charReflect = `Focusing on "${topic}" encourages Diligence, Kindness, and Love. It is a wonderful chance to reflect on how we can show Christ's character in our daily words and studies.`;
  }

  // Tailor based on concern
  if (parentConcern) {
    homeworkG += `\n* Action for your concern ("${parentConcern}"): Practice active listening and give reassuring affirmations before starting. Provide structured pauses if anxiety or fatigue rises.`;
    iepSupport += `\n* Adaptive tip: Since you noted concern about "${parentConcern}", try using physical tokens (like coins/blocks) or visual timetables to ease cognitive load.`;
  }

  const simulatedCopilot = {
    parentExplanation: parentExpl,
    homeworkGuide: homeworkG,
    atHomePractice: atHomePrac,
    studentEncouragement: studEncour,
    progressSummary: progSummary,
    tutorQuestions: tutorQ,
    studentQuestions: studentQ,
    characterReflection: charReflect,
    bibleReflection: bibleReflect,
    iepSupportTips: iepSupport
  };

  res.json({
    status: "Success",
    source: "OFFLINE_DEMO_ENGINE",
    copilotOutput: simulatedCopilot
  });
});



// PHASE 9: ADMINISTRATOR INTELLIGENCE CENTER ENDPOINTS
// =========================================================================
const adminInsightsDb = [];

// GET: Retrieve all saved admin insights records
app.get("/api/ai/admin-insights-records", requireAuth, requireRole(["Admin"]), (req, res) => {
  res.json({ status: "Success", adminInsights: adminInsightsDb });
});

// POST: Save generated admin insight to local memory (offline fallback)
app.post("/api/ai/admin-insights-records", requireAuth, requireRole(["Admin"]), (req, res) => {
  const { filters, content } = req.body;
  
  if (!content) {
    return res.status(400).json({ error: "Missing required admin insights content." });
  }

  const newRecord = {
    id: "insight_" + Math.random().toString(36).substr(2, 9),
    filters: filters || {},
    content,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  adminInsightsDb.push(newRecord);
  console.log(`[Database] Admin Intelligence Center record saved to offline in-memory database.`);
  res.json({ status: "Success", adminInsight: newRecord });
});

// POST: AI Admin Insights Generator
app.post("/api/ai/generate-admin-insights", requireAuth, requireRole(["Admin"]), async (req, res) => {
  const {
    filters = {}
  } = req.body;

  const { dateRange = "Last 30 Days", tutor = "All Tutors", student = "All Students", subject = "All Subjects", gradeLevel = "All Grades", paymentStatus = "All Statuses" } = filters;

  const apiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY;
  const isAiEnabled = apiKey && !apiKey.includes("PLACEHOLDER") && apiKey.trim().length > 10;

  if (isAiEnabled) {
    console.log(`[AI Admin Intelligence] Calling Live Gemini AI for Admin Insights Generator`);

    const systemInstruction = `You are Ambience Admin Intelligence Center™, an elite platform-level analyzer and administrative advisor for the Ambience TutorsFlow™ platform.
Analyze the administrative, tutoring, and student status. Your output MUST be a single, valid JSON object matching the exact structure below:
{
  "organizationOverview": "String - High-level summary of organization state, active users, and platform activity based on the selected filters.",
  "activeTutors": "String - Analysis of active tutors, scheduling ratios, and teaching hours delivered.",
  "activeStudents": "String - Analysis of active student counts, learning progress, and platform engagement.",
  "parentEngagement": "String - Evaluation of parent involvement, encouragement note frequencies, and feedback.",
  "bookings": "String - Detailed booking, cancellation, and scheduling metrics under the specified parameters.",
  "revenue": "String - Precise financial overview of earned revenue and transactions.",
  "outstandingInvoices": "String - Summary of overdue or outstanding invoices and billing compliance.",
  "aiUsageMetrics": "String - Breakdown of AI tool usage (Test Generator, Lesson Planner, IEP Assistant, Copilots).",
  "studentProgressTrends": "String - Analysis of academic growth across grade levels and major subjects.",
  "tutorActivity": "String - Assessment of tutor session notes, reviews, ratings, and teaching milestones.",
  "atRiskStudents": "String - Identification of students requiring urgent academic support or showing engagement drops.",
  "insights": {
    "studentRiskDetection": "String - Detailed risk assessment describing specific at-risk students and contributing factors.",
    "tutorPerformance": "String - Summary of tutor ratings, class consistency, and effectiveness.",
    "parentEngagement": "String - Evaluation of parent communication and engagement with suggested improvements.",
    "revenueObservations": "String - Strategic observations regarding revenue growth, outstanding balances, and cash flow.",
    "suggestedInterventions": "String - Actionable, step-by-step administrative or tutoring interventions for at-risk students.",
    "operationalRecommendations": "String - Strategic suggestions for booking optimizations, capacity planning, and organizational growth."
  }
}

Do not wrap your output in markdown backticks \`\`\`json. Return ONLY the raw JSON object.`;

    const userPrompt = `Generate comprehensive platform-level insights, administrative overview, and AI-powered recommendations based on these filters:
- Date Range: "${dateRange}"
- Tutor Filter: "${tutor}"
- Student Filter: "${student}"
- Subject Filter: "${subject}"
- Grade Level: "${gradeLevel}"
- Payment/Invoice Status: "${paymentStatus}"`;

    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          contents: [{ parts: [{ text: userPrompt }] }],
          systemInstruction: { parts: [{ text: systemInstruction }] },
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.2
          }
        },
        { timeout: 20000 }
      );

      const responseText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (responseText) {
        const parsedJson = JSON.parse(responseText.trim());
        return res.json({ status: "Success", source: "GEMINI_API", insightsOutput: parsedJson });
      }
    } catch (aiError) {
      console.error("[AI Admin Intelligence] Live Gemini API failed. Falling back to Offline Rule-Engine.", aiError.message);
    }
  }

  // ==========================================
  // OFFLINE HIGH-FIDELITY RULE-ENGINE FALLBACK
  // ==========================================
  console.log(`[AI Admin Intelligence] Utilizing Offline Fallback Engine for Filters: ${JSON.stringify(filters)}`);

  // Dynamically extract some in-memory database figures for the fallback!
  const tutorCount = tutor === "All Tutors" ? Object.keys(tutorAvailabilities).length : 1;
  const bookingsCount = bookingsDb.length > 0 ? bookingsDb.length : 18;
  const unpaidInvoices = invoicesDb.filter(i => i.status === "Unpaid");
  const unpaidAmount = unpaidInvoices.reduce((sum, inv) => sum + inv.amount, 0);
  const paidInvoices = invoicesDb.filter(i => i.status === "Paid");
  const paidAmount = paidInvoices.reduce((sum, inv) => sum + inv.amount, 0) + paymentsDb.reduce((sum, p) => sum + p.amount, 0);

  // Default localized texts, tailored based on filters
  let overviewText = `Overall system status is healthy under the "${dateRange}" audit period. The platform supports seamless scheduling, live tutoring integration, and automated AI assistance. High retention is observed across all centers.`;
  let activeTutText = `Currently tracking ${tutorCount} active professional specialist tutors. Average tutor rating stands at 4.95/5.0 with 100% session completion rates.`;
  let activeStudText = `Currently monitoring active students with high platform engagement. Average student completion rates have improved by 12% over the last billing period.`;
  let parentEngText = `Strong parent engagement recorded. Parents have actively read and dispatched 24+ encouragement notes and parent portal check-ins.`;
  let bookingText = `A total of ${bookingsCount} sessions have been booked and managed. Live Zoom classroom links were generated for all successful sessions with zero conflict alerts.`;
  let revText = `$${paidAmount.toFixed(2)} in total payments verified and processed via Stripe, PayPal, and verified Zelle transactions.`;
  let outstandingText = `$${unpaidAmount.toFixed(2)} in outstanding balances across ${unpaidInvoices.length} unpaid invoices. Late-payment notices have been dispatched.`;
  let aiMetricsText = `AI engines are running optimally. High adoption rates observed: AI Test Generator (14 builds), AI Lesson Planner (21 drafts), AI IEP Assistant (8 profiles), and Copilots (18 sessions).`;
  let progTrendsText = `Academic progression remains outstanding. Standardized assessments show an average increase of 14% in Pre-Calculus, 18% in ELA comprehension, and 12% in Elementary Sciences.`;
  let tutActText = `Tutors are actively logging post-session summaries. Character theme reflections (Grit, Integrity, Diligence, Perseverance) have been included in 92% of session reports.`;
  let riskStudText = `No students are in high-risk failure brackets. However, 1 student requires attention due to upcoming complex SAT tests and requested special IEP accommodates.`;

  // AI recommendations
  let riskDet = `Student Caleb Sterling (11th Grade) is currently flagged as 'At Risk of Learning Plateau' in Calculus due to upcoming test anxiety and complex topic homework fatigue. Attendance remains 100%, but comprehension indexes show slight dips.`;
  let tutPerf = `Tutor Mrs. Sarah Jenkins is performing at the highest standard, receiving consistent 5.0 ratings. Session notes are thoroughly detailed, showcasing high-quality Christian Character alignments.`;
  let parEng = `Parent feedback suggests high satisfaction with the AI Parent Copilot™ tool, which has streamlined at-home homework coaching and lessened friction. Action: Encourage more parents to register for SMS updates.`;
  let revObs = `Outstanding balance of $${unpaidAmount.toFixed(2)} is within safe bounds but should be collected before upcoming lessons. Suggest activating Stripe auto-recurring subscriptions to eliminate manual billing delays.`;
  let sugInter = `1. Dispatch localized algebra/calculus diagnostic test via the AI Test Generator to Caleb Sterling to isolate specific skill gaps.\n2. Leverage the AI IEP Assistant to append custom audio-visual support checklists to Caleb's tutor dashboard.`;
  let operRecs = `1. Optimize scheduling slots by suggesting Monday and Wednesday afternoon sessions, which currently have 100% booking efficiency.\n2. Launch organization-wide reminders to all tutors to complete Zoom manual linkage.`;

  // Custom tailoring based on filters
  if (tutor !== "All Tutors") {
    overviewText = `Displaying platform performance metrics filtered for Tutor: "${tutor}". This tutor shows excellent scheduling habits and comprehensive session logging compliance.`;
    tutActText = `Tutor "${tutor}" has completed all scheduled sessions on time. Post-session notes contain detailed character theme integrations (Integrity and Diligence) in 100% of logs.`;
    operRecs = `1. Allocate additional high-demand students to ${tutor} to capitalize on their high capacity.\n2. Ensure they connect their live Zoom profile for automated start/join link distribution.`;
  }
  if (student !== "All Students") {
    overviewText = `Displaying student intelligence metrics filtered for Student: "${student}". Focus is placed on individual progression rates, homework grades, and custom IEP goals.`;
    activeStudText = `Student "${student}" is making progress. Completed sessions have risen by 4 in the past 15 days. Current focus area is ${subject !== "All Subjects" ? subject : "Mathematics"}.`;
    sugInter = `1. Schedule a 15-minute alignment check-in with ${student}'s parent to share the at-home practice plan generated by the AI Parent Copilot.\n2. Provide specific rewards or badges to reinforce their recent Streak milestones.`;
  }
  if (subject !== "All Subjects") {
    progTrendsText = `Focused progression audit on Subject: "${subject}". Curriculum mastery shows strong numbers, with Algebra and Pre-Calculus exhibiting the fastest progression speed.`;
    operRecs = `1. Source or train more tutors in "${subject}" to support upcoming seasonal peak enrollments.\n2. Use the AI Test Generator to compile a comprehensive final mock exam for all students in this subject.`;
  }
  if (gradeLevel !== "All Grades") {
    activeStudText += ` Filtered for Grade: ${gradeLevel}. Students in this bracket show steady engagement, but require targeted preparation for standardized testing milestones.`;
  }
  if (paymentStatus !== "All Statuses") {
    outstandingText = `Outstanding and paid invoices audit under payment status filter: "${paymentStatus}".`;
    revObs = `Audit for status "${paymentStatus}" shows stable platform liquidity. Automated Stripe reconciliations are running smoothly.`;
  }

  const simulatedOutput = {
    organizationOverview: overviewText,
    activeTutors: activeTutText,
    activeStudents: activeStudText,
    parentEngagement: parentEngText,
    bookings: bookingText,
    revenue: revText,
    outstandingInvoices: outstandingText,
    aiUsageMetrics: aiMetricsText,
    studentProgressTrends: progTrendsText,
    tutorActivity: tutActText,
    atRiskStudents: riskStudText,
    insights: {
      studentRiskDetection: riskDet,
      tutorPerformance: tutPerf,
      parentEngagement: parEng,
      revenueObservations: revObs,
      suggestedInterventions: sugInter,
      operationalRecommendations: operRecs
    }
  };

  res.json({
    status: "Success",
    source: "OFFLINE_DEMO_ENGINE",
    insightsOutput: simulatedOutput
  });
});


// =========================================================================
// PHASE 10: COLLABORATION & COMMUNICATION HUB
// =========================================================================

// Send a secure message
app.post("/api/collaboration/messages", requireAuth, async (req, res) => {
  const { sender_id, sender_name, sender_role, recipient_id, recipient_name, recipient_role, channel_id, content } = req.body;
  if (!content) {
    return res.status(400).json({ error: "Message content is required." });
  }

  const newMessage = {
    id: "msg_" + Date.now(),
    created_at: new Date().toISOString(),
    sender_id: sender_id || req.user.id,
    sender_name: sender_name || req.user.user_metadata?.name || "User",
    sender_role: sender_role || req.user.user_metadata?.role || "Student",
    recipient_id,
    recipient_name,
    recipient_role,
    channel_id,
    content,
    is_read: false
  };

  messagesDb.push(newMessage);
  res.status(201).json({ status: "Success", source: "OFFLINE_SANDBOX_DEMO", message: newMessage });
});

// Fetch secure messages for a specific channel
app.get("/api/collaboration/messages/:channelId", requireAuth, async (req, res) => {
  const { channelId } = req.params;
  const userRole = req.user.user_metadata?.role || "Student";
  const userId = req.user.id;

  let filtered = messagesDb.filter(m => m.channel_id === channelId);

  // Role-based visibility gates
  if (userRole === "Parent") {
    if (!channelId.includes(userId) && !channelId.toLowerCase().includes("parent")) {
      return res.status(403).json({ error: "Forbidden: Parents can only access their family communication channels." });
    }
  } else if (userRole === "Student") {
    filtered = filtered.filter(m => m.sender_id === userId || m.recipient_id === userId);
  }

  res.json({ status: "Success", source: "OFFLINE_SANDBOX_DEMO", messages: filtered });
});

// Create/Update shared session notes & action items
app.post("/api/collaboration/shared-notes", requireAuth, async (req, res) => {
  const { student_id, title, summary, parent_update, action_items, reminders, visibility } = req.body;
  if (!student_id || !title || !summary) {
    return res.status(400).json({ error: "Student ID, Title, and Summary are required." });
  }

  const newNote = {
    id: "note_" + Date.now(),
    created_at: new Date().toISOString(),
    created_by: req.user.id,
    student_id,
    title,
    summary,
    parent_update,
    action_items: action_items || [],
    reminders: reminders || [],
    visibility: visibility || ["Admin", "Tutor", "Parent"]
  };

  sharedNotesDb.push(newNote);
  res.status(201).json({ status: "Success", source: "OFFLINE_SANDBOX_DEMO", note: newNote });
});

// Fetch shared notes for a student
app.get("/api/collaboration/shared-notes/:studentId", requireAuth, async (req, res) => {
  const { studentId } = req.params;
  const userRole = req.user.user_metadata?.role || "Student";
  const userId = req.user.id;

  let filtered = sharedNotesDb.filter(n => n.student_id === studentId);

  if (userRole === "Parent") {
    filtered = filtered.filter(n => n.visibility.includes("Parent"));
  } else if (userRole === "Student") {
    filtered = filtered.filter(n => n.visibility.includes("Student") && n.student_id === userId);
  } else if (userRole === "Tutor") {
    filtered = filtered.filter(n => n.visibility.includes("Tutor"));
  }

  res.json({ status: "Success", source: "OFFLINE_SANDBOX_DEMO", notes: filtered });
});

// AI Generation of professional session summaries and parent reminders
app.post("/api/ai/generate-collaboration-notes", requireAuth, async (req, res) => {
  const { sessionTopic, rawTutorNotes, studentName, characterTheme } = req.body;
  if (!sessionTopic || !rawTutorNotes) {
    return res.status(400).json({ error: "Session Topic and Raw Tutor Notes are required." });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const isGeminiConfigured = !!(apiKey && !apiKey.includes("PLACEHOLDER"));

  if (isGeminiConfigured) {
    const systemInstruction = `You are the Ambience AI Collaboration Assistant, designed for the Ambience TutorsFlow platform.
You take raw tutor observations and a lesson topic, then format them into a highly polished, professional educational record.
Format your output as a single, valid JSON object with the following exact keys:
- summary: A detailed, professional educational summary of the lesson suitable for administrators.
- parentUpdate: A warm, encouraging, parent-friendly update detailing the student's efforts, achievements, and reinforcing a specific Christian character virtue (like Perseverance, Integrity, Diligence, or Kindness).
- actionItems: An array of strings representing actionable follow-up homework or review items.
- reminders: An array of strings representing follow-up administrative or review calendar deadlines.`;

    const userPrompt = `Student Name: "${studentName || "Caleb Sterling"}"
Session Topic: "${sessionTopic}"
Character Focus: "${characterTheme || "Perseverance & Diligence"}"
Raw Tutor Notes: "${rawTutorNotes}"`;

    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          contents: [{ parts: [{ text: userPrompt }] }],
          systemInstruction: { parts: [{ text: systemInstruction }] },
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.2
          }
        },
        { timeout: 20000 }
      );

      const responseText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (responseText) {
        const parsedJson = JSON.parse(responseText.trim());
        return res.json({ status: "Success", source: "GEMINI_API", collaborationOutput: parsedJson });
      }
    } catch (aiError) {
      console.error("[AI Collaboration] Live Gemini API failed. Falling back to Offline Rule-Engine.", aiError.message);
    }
  }

  // ==========================================
  // OFFLINE HIGH-FIDELITY RULE-ENGINE FALLBACK
  // ==========================================
  const name = studentName || "Caleb Sterling";
  const theme = characterTheme || "Perseverance & Diligence";
  
  const fallbackOutput = {
    summary: `During today's session on "${sessionTopic}", the student demonstrated focused attention. We reviewed fundamental rules, solved multiple practice exercises step-by-step, and resolved misconceptions around key formulas.`,
    parentUpdate: `Dear Parent, ${name} did a wonderful job today studying "${sessionTopic}". I am particularly proud of how they demonstrated ${theme} when working through the most difficult calculations. They didn't give up and successfully completed the exercises!`,
    actionItems: [
      `Complete the 5 remaining homework exercises on "${sessionTopic}".`,
      `Review key glossary terms and formula rules before our next block.`
    ],
    reminders: [
      `Bring questions on homework to the warm-up segment of our next session.`,
      `Log into the Student Portal to claim the milestone badge for completing this lesson.`
    ]
  };

  res.json({
    status: "Success",
    source: "OFFLINE_DEMO_ENGINE",
    collaborationOutput: fallbackOutput
  });
});


// =========================================================================
// PHASE 11: SUBSCRIPTION PLANS & AI HOMEWORK ASSISTANT ENDPOINTS
// =========================================================================

const SUBSCRIPTION_PLANS = [
  { id: "free", name: "Free", price: 0, description: "Basic learning dashboard and scheduling.", features: ["Core booking", "Standard scheduling", "Manual calendar notes"] },
  { id: "student_basic", name: "Student AI Basic", price: 19, description: "AI concept explanations and homework guidance.", features: ["All Free features", "AI concept breakdown", "10 homework uploads/mo", "Encouraging hints"] },
  { id: "student_plus", name: "Student AI Plus", price: 49, description: "Advanced homework solving and step-by-step guidance.", features: ["All Basic features", "Unlimited homework uploads", "Step-by-step solutions", "Similar practice generators", "Track mastery analytics"] },
  { id: "student_premium", name: "Student AI Premium", price: 99, description: "VIP level learning tools with custom practice.", features: ["All Plus features", "Custom practice exam builder", "Specialized IEP assistance", "Advanced diagnostic SAT/ACT analytics", "Priority support"] },
  
  // Professional Tutor Plans
  { id: "tutor_starter", name: "Tutor Starter", price: 29, description: "Perfect for independent tutors.", features: ["0 included tutoring hours", "AI Lesson Planner", "AI Tutor Copilot", "AI Homework Assistant", "Student Progress Analytics", "Parent Reports", "Character Education", "Session Notes", "Priority Support"] },
  { id: "tutor_flex", name: "Tutor Flex", price: 299, description: "Includes 4 tutoring hours/month.", features: ["4 included tutoring hours", "AI Lesson Planner", "AI Tutor Copilot", "AI Homework Assistant", "Student Progress Analytics", "Parent Reports", "Character Education", "Session Notes", "Priority Support"] },
  { id: "tutor_professional", name: "Tutor Professional", price: 499, description: "Includes 8 tutoring hours/month.", features: ["8 included tutoring hours", "AI Lesson Planner", "AI Tutor Copilot", "AI Homework Assistant", "Student Progress Analytics", "Parent Reports", "Character Education", "Session Notes", "Priority Support"] },
  { id: "tutor_elite", name: "Tutor Elite", price: 799, description: "Includes 16 tutoring hours/month.", features: ["16 included tutoring hours", "AI Lesson Planner", "AI Tutor Copilot", "AI Homework Assistant", "Student Progress Analytics", "Parent Reports", "Character Education", "Session Notes", "Priority Support"] },
  
  // Institutional Plans
  { id: "business", name: "Business", price: 199, description: "Full center control panel with executive analytics.", features: ["Administrator Intelligence Center", "Multi-tenant audits", "Custom center branding", "Unlimited tutors and students", "Staff analytical tracking"] },
  { id: "school", name: "School", price: 499, description: "District and school integration dashboard.", features: ["District-wide LMS integration", "School-board diagnostics auditing", "Custom school subdomains", "Dedicated service accounts", "LTI Blackboard/Canvas connectors"] },
  { id: "enterprise", name: "Enterprise", price: 999, description: "Fully custom scale deployment for large learning networks.", features: ["District-wide Custom SLA", "White-glove 24/7 dedicated support", "Custom AI Fine-Tuning", "Complete multi-tenant system controls", "Custom LMS Connectors & integrations"] }
];

// 1. Fetch available subscription plans
app.get("/api/subscriptions/plans", (req, res) => {
  res.json({ status: "Success", plans: SUBSCRIPTION_PLANS });
});

// 2. Fetch active subscription for current user
app.get("/api/subscriptions/active", requireAuth, async (req, res) => {
  const userId = req.user.id;
  const supabaseUrl = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  const isSupabaseConfigured = !!(supabaseUrl && anonKey && !supabaseUrl.includes("PLACEHOLDER") && !anonKey.includes("PLACEHOLDER"));

  if (isSupabaseConfigured) {
    try {
      // Query subscriptions table in PostgreSQL
      const response = await axios.get(`${supabaseUrl}/rest/v1/subscriptions?profile_id=eq.${userId}`, {
        headers: { Authorization: `Bearer ${req.headers.authorization.split(" ")[1]}`, apikey: anonKey }
      });
      if (response.data && response.data.length > 0) {
        return res.json({ status: "Success", source: "SUPABASE_POSTGRES", subscription: response.data[0] });
      } else {
        // Automatically provision a default Free plan
        const defaultSub = {
          profile_id: userId,
          plan_name: "Free",
          status: "Active",
          billing_interval: "Monthly",
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 24 * 3600000).toISOString()
        };
        await axios.post(`${supabaseUrl}/rest/v1/subscriptions`, defaultSub, {
          headers: { Authorization: `Bearer ${req.headers.authorization.split(" ")[1]}`, apikey: anonKey, Prefer: "return=representation" }
        });
        return res.json({ status: "Success", source: "SUPABASE_POSTGRES_PROVISIONED", subscription: defaultSub });
      }
    } catch (dbError) {
      console.error("[Subscriptions] Supabase select/insert failed. Falling back to local state.", dbError.message);
    }
  }

  // Fallback to offline sandbox
  if (!activeSubscriptionsMap[userId]) {
    activeSubscriptionsMap[userId] = {
      id: "sub_" + Date.now(),
      profile_id: userId,
      plan_name: "Free",
      status: "Active",
      billing_interval: "Monthly",
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + 30 * 24 * 3600000).toISOString()
    };
  }

  res.json({ status: "Success", source: "OFFLINE_SANDBOX_DEMO", subscription: activeSubscriptionsMap[userId] });
});

// 3. Upgrade / Modify subscription
app.post("/api/subscriptions/upgrade", requireAuth, async (req, res) => {
  const userId = req.user.id;
  const { planName, billingInterval } = req.body;
  if (!planName) {
    return res.status(400).json({ error: "Subscription Plan Name is required." });
  }

  const selectedPlan = SUBSCRIPTION_PLANS.find(p => p.name.toLowerCase() === planName.toLowerCase() || p.id.toLowerCase() === planName.toLowerCase());
  if (!selectedPlan) {
    return res.status(400).json({ error: `Invalid plan name specified: ${planName}` });
  }

  const plan_name = selectedPlan.name;
  const interval = billingInterval || "Monthly";
  const start = new Date().toISOString();
  const end = new Date(Date.now() + 30 * 24 * 3600000).toISOString();

  const supabaseUrl = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  const isSupabaseConfigured = !!(supabaseUrl && anonKey && !supabaseUrl.includes("PLACEHOLDER") && !anonKey.includes("PLACEHOLDER"));

  if (isSupabaseConfigured) {
    try {
      // Upsert into subscriptions table in PostgreSQL
      const upObject = {
        profile_id: userId,
        plan_name,
        status: "Active",
        billing_interval: interval,
        current_period_start: start,
        current_period_end: end
      };
      const response = await axios.post(`${supabaseUrl}/rest/v1/subscriptions`, upObject, {
        headers: { 
          Authorization: `Bearer ${req.headers.authorization.split(" ")[1]}`, 
          apikey: anonKey, 
          Prefer: "resolution=merge-duplicates,return=representation" 
        }
      });
      return res.json({ status: "Success", source: "SUPABASE_POSTGRES", subscription: upObject });
    } catch (dbError) {
      console.error("[Subscriptions] Upsert failed. Falling back to local state update.", dbError.message);
    }
  }

  // Fallback update in offline sandbox memory
  activeSubscriptionsMap[userId] = {
    id: "sub_" + Date.now(),
    profile_id: userId,
    plan_name,
    status: "Active",
    billing_interval: interval,
    current_period_start: start,
    current_period_end: end
  };

  return res.json({ status: "Success", source: "OFFLINE_SANDBOX_DEMO", subscription: activeSubscriptionsMap[userId] });
});

// 4. AI Homework Assistant: Analyze Worksheet
app.post("/api/ai/homework-assistant", requireAuth, async (req, res) => {
  const student_id = req.user.id;
  const student_name = req.user.name || "Student Caleb Sterling";
  const { subject, file_name, file_type, file_size, student_prompt, file_base64 } = req.body;

  if (!file_name) {
    return res.status(400).json({ error: "Worksheet file name is required." });
  }

  const apiKey = process.env.GEMINI_API_KEY || "PLACEHOLDER";
  const isGeminiConfigured = !!(apiKey && apiKey !== "PLACEHOLDER");

  let aiOutput = null;

  if (isGeminiConfigured) {
    const systemInstruction = `You are the Ambience AI Homework Assistant, a premium scaffolded tutor on the Ambience TutorsFlow platform.
Your purpose is to help students learn and solve homework. Do NOT just give away the answers immediately.
Follow this educational protocol:
Generate exactly the following 9 blocks in a valid JSON:
1. conceptOverview: A detailed, premium paragraph introducing and explaining the core concepts.
2. hint1: Concept clue/prompt that doesn't reveal the answer but stimulates critical thinking.
3. hint2: Practical methodology guide or strategic hint on how to start calculating or drafting.
4. guidedWalkthrough: Step-by-step reasoning or walkthrough on how to map out the entire solution without showing final answers.
5. stepByStepSolution: Complete, step-by-step rigorous logical/mathematical calculations or analysis showing the actual solution.
6. commonMistakes: Bullet-pointed list of common student errors, misconceptions, or algebraic slips relating to this topic.
7. practiceQuestions: A set of 2-3 similar custom practice questions matching the exact standard of this assignment.
8. miniQuiz: A small interactive 3-question quiz with multiple choice or open prompts AND brief answers.
9. reflection: A deep conceptual metacognition question prompting the student to think about how they derived their answers.

Format your output strictly as a single, valid JSON object with the following exact keys:
- conceptOverview: string
- hint1: string
- hint2: string
- guidedWalkthrough: string
- stepByStepSolution: string
- commonMistakes: string
- practiceQuestions: string
- miniQuiz: string
- reflection: string
- masteryScore: integer (0-100)`;

    const userPrompt = `Subject: "${subject}"
File Name: "${file_name}"
File Type: "${file_type || "Unknown"}"
Student Prompt/Question: "${student_prompt || "I need help understanding this worksheet."}"
File Content (Simulated upload base64 length): ${file_base64 ? file_base64.length : 0}`;

    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          contents: [{ parts: [{ text: userPrompt }] }],
          systemInstruction: { parts: [{ text: systemInstruction }] },
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.3
          }
        },
        { timeout: 20000 }
      );

      const responseText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (responseText) {
        aiOutput = JSON.parse(responseText.trim());
      }
    } catch (aiError) {
      console.error("[AI Homework Assistant] Gemini API call failed. Executing offline fallback.", aiError.message);
    }
  }

  // ==========================================
  // OFFLINE HIGH-FIDELITY RULE-ENGINE FALLBACK
  // ==========================================
  if (!aiOutput) {
    const defaultProblems = {
      "Mathematics": {
        conceptOverview: "This assignment focuses on quadratic equations. A quadratic equation is of the form ax² + bx + c = 0. To solve it, we can factorize, complete the square, or apply the Quadratic Formula. The discriminant (b² - 4ac) tells us how many real solutions exist.",
        hint1: "Identify your a, b, and c coefficients directly from the quadratic equation structure.",
        hint2: "Calculate the discriminant (b² - 4ac) first. If it is positive, there are two real roots. If negative, roots are complex numbers.",
        guidedWalkthrough: "Step 1: Write down coefficients a, b, and c.\nStep 2: Plug into discriminant formula (b² - 4ac).\nStep 3: Insert values into the general quadratic solution x = [-b ± √discriminant] / 2a.\nStep 4: Solve for both the positive (+) and negative (-) cases.",
        stepByStepSolution: "Let's solve x² - 5x + 6 = 0:\n1. Coeffs: a = 1, b = -5, c = 6.\n2. Discriminant: (-5)² - 4(1)(6) = 25 - 24 = 1.\n3. x = [5 ± √1] / 2 = (5 ± 1) / 2.\n4. Roots: x = (5+1)/2 = 3, and x = (5-1)/2 = 2.\nSolutions are x = 2 or x = 3.",
        commonMistakes: "- Forgetting that negative coefficient squares become positive, e.g., (-5)² = +25, not -25.\n- Forgetting to divide the entire numerator by 2a.\n- Sign errors when subtracting 4ac if 'c' is negative.",
        practiceQuestions: "1. Solve x² - 7x + 12 = 0\n2. Solve 2x² - 5x + 2 = 0",
        miniQuiz: "Q1. What is the value of the discriminant in 2x² + 5x + 3 = 0?\nAns: b² - 4ac = 25 - 24 = 1.\nQ2. What type of roots exist if the discriminant is zero?\nAns: One single real root.\nQ3. Is x = -3 a solution of x² - 9 = 0?\nAns: Yes, (-3)² - 9 = 9 - 9 = 0.",
        reflection: "If a quadratic equation has a negative discriminant, how would you sketch its graph on a Cartesian coordinate system?",
        masteryScore: 75
      },
      "Science": {
        conceptOverview: "Stoichiometry is the quantitative relation between reactants and products in a chemical reaction. It is governed by the Law of Conservation of Mass. Coefficients in balanced chemical equations act as mole ratios to convert between masses or moles.",
        hint1: "Balance atoms appearing in singular chemical reactants first.",
        hint2: "Remember to compute the molar mass of your compounds using periodic table atomic masses.",
        guidedWalkthrough: "Step 1: Write the unbalanced equation.\nStep 2: Balance carbon, hydrogen, then oxygen atoms.\nStep 3: Convert given masses to moles using (grams ÷ molar mass).\nStep 4: Scale using coefficients of the balanced equation.",
        stepByStepSolution: "Combustion of Propane: C₃H₈ + 5O₂ → 3CO₂ + 4H₂O\n1. Left: 3 C, 8 H, 2 O. Right: 1 C, 2 H, 3 O.\n2. C coefficients balance: multiply CO₂ by 3.\n3. H coefficients balance: multiply H₂O by 4.\n4. O balance: products have 3(2) + 4 = 10 O atoms. Reactant O₂ is multiplied by 5.\n5. MASS: 1 mole propane reacting with 5 moles oxygen yields 3 moles carbon dioxide and 4 moles water vapor.",
        commonMistakes: "- Trying to balance equations by changing chemical formula subscripts (e.g. changing CO₂ to CO₃) instead of using coefficients.\n- Forgetting that diatomic gases like O₂ have a molar mass of 32g/mol instead of 16g/mol.",
        practiceQuestions: "1. Balance the respiration equation: C₆H₁₂O₆ + O₂ → CO₂ + H₂O\n2. If 10g of Hydrogen reacts with excess Oxygen, how many grams of Water are produced?",
        miniQuiz: "Q1. What mass of water is in 1 mole?\nAns: ~18 grams.\nQ2. Does balancing a chemical equation alter molecular structures?\nAns: No, only quantities.\nQ3. What does STP stand for in stoichiometry?\nAns: Standard Temperature and Pressure.",
        reflection: "Why is mass conserved in a chemical reaction but the number of total gas moles can change?",
        masteryScore: 82
      }
    };

    aiOutput = defaultProblems[subject] || {
      conceptOverview: `This file contains key syllabus questions in the area of ${subject}. Mastery of fundamental principles, precise definition mapping, and logical layouts will ensure highly reliable results.`,
      hint1: "Go over the main core formulas or terms in your curriculum units relating to this question.",
      hint2: "Avoid guessing. Write out all given parameters, isolate what is unknown, and identify which formula relates them.",
      guidedWalkthrough: "Step 1: Carefully read and extract facts.\nStep 2: Establish base conditions and write equations.\nStep 3: Execute math or outline step by step.\nStep 4: Check if your answer makes physical and conceptual sense.",
      stepByStepSolution: `For ${file_name}, isolate parameters, execute standard rules of ${subject}, and verify against curriculum outline keys.`,
      commonMistakes: "- Incorrect sign application or arithmetic slips.\n- Rushing through steps without writing intermediate terms.\n- Mixing up independent and dependent variables.",
      practiceQuestions: `1. Explore a similar problem relating to ${subject}.\n2. Formulate a hypothesis and test it under guidelines.`,
      miniQuiz: "Q1. What is the fundamental unit or baseline term of this topic?\nAns: Refer to syllabus definitions.\nQ2. Can we solve this problem in multiple ways?\nAns: Yes, through algebraic and graphical solutions.\nQ3. What are the key variables involved?\nAns: State variables and constants.",
      reflection: "How can you apply this specific concept to real-world situations or daily decision-making?",
      masteryScore: 70
    };
  }

  const resultRecord = {
    id: "hw_" + Date.now(),
    created_at: new Date().toISOString(),
    student_id,
    student_name,
    subject,
    file_name,
    file_type: file_type || "Unknown",
    file_size: file_size || 0,
    student_prompt,
    concept_explanation: aiOutput.conceptOverview,
    hints: [aiOutput.hint1, aiOutput.hint2],
    step_by_step: aiOutput.stepByStepSolution,
    practice_problems: { problem: aiOutput.practiceQuestions, solution: aiOutput.stepByStepSolution },
    mastery_score: aiOutput.masteryScore,
    guided_walkthrough: aiOutput.guidedWalkthrough,
    common_mistakes: aiOutput.commonMistakes,
    mini_quiz: aiOutput.miniQuiz,
    reflection: aiOutput.reflection
  };

  const supabaseUrl = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  const isSupabaseConfigured = !!(supabaseUrl && anonKey && !supabaseUrl.includes("PLACEHOLDER") && !anonKey.includes("PLACEHOLDER"));

  if (isSupabaseConfigured) {
    try {
      await axios.post(`${supabaseUrl}/rest/v1/homework_assistant_records`, resultRecord, {
        headers: { 
          Authorization: `Bearer ${req.headers.authorization.split(" ")[1]}`, 
          apikey: anonKey,
          Prefer: "return=representation"
        }
      });
      return res.json({ status: "Success", source: "SUPABASE_POSTGRES", record: resultRecord });
    } catch (dbError) {
      console.error("[Homework Assistant] Insert record failed. Falling back to local array.", dbError.message);
    }
  }

  homeworkAssistantDb.push(resultRecord);
  res.json({ status: "Success", source: "OFFLINE_DEMO_ENGINE", record: resultRecord });
});

// 5. Get homework assistant history records
app.get("/api/ai/homework-assistant/records", requireAuth, async (req, res) => {
  const student_id = req.user.id;
  const supabaseUrl = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  const isSupabaseConfigured = !!(supabaseUrl && anonKey && !supabaseUrl.includes("PLACEHOLDER") && !anonKey.includes("PLACEHOLDER"));

  if (isSupabaseConfigured) {
    try {
      const response = await axios.get(`${supabaseUrl}/rest/v1/homework_assistant_records?student_id=eq.${student_id}&order=created_at.desc`, {
        headers: { Authorization: `Bearer ${req.headers.authorization.split(" ")[1]}`, apikey: anonKey }
      });
      return res.json({ status: "Success", source: "SUPABASE_POSTGRES", records: response.data || [] });
    } catch (dbError) {
      console.error("[Homework Assistant] Fetch records failed. Falling back to memory storage.", dbError.message);
    }
  }

  // Filter local memory records by student_id
  const studentRecords = homeworkAssistantDb
    .filter(r => r.student_id === student_id)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  res.json({ status: "Success", source: "OFFLINE_DEMO_ENGINE", records: studentRecords });
});



// =========================================================================

// HEALTH CHECK ENDPOINT
// =========================================================================
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    env: {
      node_env: process.env.NODE_ENV || "development",
      supabase_configured: !!process.env.SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      gemini_configured: !!process.env.GEMINI_API_KEY,
      zoom_configured: !!process.env.ZOOM_CLIENT_ID && !!process.env.ZOOM_CLIENT_SECRET,
      stripe_configured: !!process.env.STRIPE_SECRET_KEY,
      paypal_configured: !!process.env.PAYPAL_CLIENT_ID
    }
  });
});

// =========================================================================
// START THE MULTI-TENANT ENTERPRISE PORT
// =========================================================================
app.listen(PORT, () => {
  console.log(`================================================`);
  console.log(`🕊️ Ambience TutorsFlow Scheduling Engine Running`);
  console.log(`🔗 Port: http://localhost:${PORT}`);
  console.log(`💳 Stripe Sandbox Connectors Enabled`);
  console.log(`📆 Multi-calendar Engine & Reminders Ready`);
  console.log(`================================================`);
});
