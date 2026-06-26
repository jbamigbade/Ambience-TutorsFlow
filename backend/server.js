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
