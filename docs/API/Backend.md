# ⚙️ Backend Architecture & REST API Specification — Ambience TutorsFlow™
### Soli Deo Gloria — Glory to God the Father, God the Son, and God the Holy Spirit.

This document describes the backend architecture, runtime environments, core middleware controllers, routing layout, and integration systems powering **Ambience TutorsFlow™**.

---

## 1. Runtime & Server Framework

The backend is built as a stateless, high-concurrency, zero-dependency REST API service:
* **Runtime Environment**: Node.js (LTS v18+).
* **Framework**: Express.js (v4.19+).
* **Execution Strategy**: The server runs in stateless clusters. Node clusters are orchestrated in production using PM2 or native Docker container tasks (on AWS, Render, or Railway) to scale horizontally.
* **Dual Operation Configuration**: Configured with automatic environment checking. When backend secrets (`SUPABASE_SERVICE_ROLE_KEY` or API credentials) are absent, the server supports local sandbox-level API validation schemas to avoid server execution crash loops.

---

## 2. API Routing & Controller Maps

API endpoints are structured under `/api/` with role-based and service-specific segments:

```
[Client App]
     │
     ├── HTTPS Request (with JWT in Authorization header)
     │
     ▼
[Express Server (backend/server.js)]
     │
     ├── Security Middlewares (CORS, Helmet, Rate Limiter)
     ├── JWT Authentication & Tenant RBAC Guard
     │
     ├── Routing Table
     │     ├── /api/auth/*          ──> Identity Validation & Session Handlers
     │     ├── /api/zoom/*          ──> Zoom OAuth, Token Refresher, & Live Meetings
     │     ├── /api/payments/*      ──> Strategy payments, Stripe Checkout, PayPal hooks
     │     ├── /api/homework/*      ──> AI step-solvers, Hints, & Study Vault logs
     │     ├── /api/pedagogy/*      ──> AI Lesson Planner, IEP Assistant, & Tutor Copilot
     │     └── /health              ──> Diagnostics & Systems Telemetry
     ▼
[Supabase Client / Google Gemini API]
```

---

## 3. Custom Middleware Systems

### A. Stateless Memory Rate Limiter
To prevent brute-force abuse and API exploitation without loading heavy Redis databases for smaller deployments, a custom zero-dependency memory rate limiter is implemented using a Javascript `Map` registry.
* **Limits**: 15 requests per 1-minute sliding window.
* **Target Protected Routes**:
  - `/api/zoom/connect`
  - `/api/zoom/create-meeting`
  - `/api/payments/create-session`
  - `/api/payments/confirm`
  - `/api/payments/verify-zelle`
* **Algorithm**:
  ```javascript
  const rateLimitRegistry = new Map();
  
  function customRateLimiter(req, res, next) {
    const ip = req.ip || req.headers['x-forwarded-for'];
    const now = Date.now();
    
    if (!rateLimitRegistry.has(ip)) {
      rateLimitRegistry.set(ip, [now]);
      return next();
    }
    
    const timestamps = rateLimitRegistry.get(ip).filter(time => now - time < 60000);
    timestamps.push(now);
    rateLimitRegistry.set(ip, timestamps);
    
    if (timestamps.length > 15) {
      return res.status(429).json({
        error: "Too many requests. Please slow down and try again in 1 minute."
      });
    }
    next();
  }
  ```

### B. Security Headers & CORS Guard
Configured secure headers to prevent Clickjacking, MIME-sniffing, and Cross-Site Scripting (XSS) injections:
- **Helmet**: Auto-configures strict `Content-Security-Policy` (CSP) layers, `X-Frame-Options` (DENY), and `Strict-Transport-Security` (HSTS).
- **CORS Configuration**: Restricts origin requests strictly to Vercel/Vite endpoints listed under the environment variable `CLIENT_URL`.

---

## 4. Key Integration Engines

### A. Zoom OAuth Scheduling System
Integrates with Zoom’s Server-to-Server OAuth application type to automate meeting creation.
1. **OAuth Connection**: On request, the server fetches an active Zoom bearer access token using base64-encoded `ZOOM_CLIENT_ID` and `ZOOM_CLIENT_SECRET`.
2. **Access token Refresh**: Tokens are cached and refreshed before their 3600-second expiration.
3. **Meeting Booking**: When a tutor approves a booking, a REST POST request is dispatched to `/v2/users/me/meetings` with configurations:
   - `type: 2` (Scheduled meeting)
   - `waiting_room: true`
   - `join_before_host: false`
4. **Data Sync**: Returns the secure `start_url` (allocated strictly to the tutor) and `join_url` (shared with student and parent profile tables).

### B. Strategy-Pattern Billing Architecture
The billing system is designed around a flexible Payment Strategy class model:
* **Stripe Strategy**: Integrates Stripe Checkout. Formulates a checkout session redirecting to secure payment overlays, writing `stripe_checkout_id` to database logs.
* **PayPal Strategy**: Leverages the PayPal REST SDK, initializing invoice capture orders.
* **Zelle Manual Strategy**: Generates a physical tracking code (`TF-ZELLE-XXXXX`), allowing the administrator to confirm funds off-platform and manually toggles database subscription parameters.

---

## 5. Production Diagnostics & Health Endpoint

The public diagnostics endpoint `GET /health` acts as our server liveness and readiness probe:
```json
{
  "status": "healthy",
  "uptime_seconds": 86423.51,
  "environment": "production",
  "integrations": {
    "supabase": "connected",
    "google_gemini": "active",
    "zoom_oauth": "verified",
    "payment_gateways": {
      "stripe": "ready",
      "paypal": "ready"
    }
  }
}
```

---

Soli Deo Gloria — Glory to God the Father, God the Son, and God the Holy Spirit.
