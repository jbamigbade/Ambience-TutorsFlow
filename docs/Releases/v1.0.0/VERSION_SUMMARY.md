# 📋 Version Summary — Ambience TutorsFlow™ v1.0.0-RC1
### Soli Deo Gloria — Glory to God the Father, God the Son, and God the Holy Spirit.

This document aggregates structural build properties, dependencies, environment properties, and target system metrics for **Ambience TutorsFlow™ v1.0.0-RC1**.

---

## 1. Release Meta Information

* **Version Tag**: `v1.0.0-RC1` (Release Candidate 1).
* **Release Stage**: Production Hardening & Launch.
* **Target Build Date**: June 28, 2026.
* **Dual-Mode Portability**: Fully verified (local mock fallback runs automatically if keys are absent).

---

## 2. Core Dependencies & Mappings

The system utilizes optimized node modules to maintain fast build speeds and slim bundle outputs:

```
[Vite Bundler (v8.1.0)]
   ├── react (v19.0.0) ──> Client SPA Component Render
   └── react-dom (v19.0.0)
[Express Server (v4.19.0)]
   ├── @supabase/supabase-js ──> Live multi-tenant database sync
   ├── @google/generative-ai ──> Gemini 2.5 Flash API calls
   ├── stripe (v14.0.0) ──> Strategy payment sessions
   ├── paypal-rest-sdk ──> Checkout flow management
   └── helmet & cors ──> Security middleware integrations
```

---

## 3. Environment Variables Template

Secure variables must be bound to production servers (Vercel and Render/Railway) to unlock live cloud connections:

### Frontend Environment Variables (`.env.production`)
* `VITE_SUPABASE_URL`: Cloud URL endpoint for Supabase PostgreSQL.
* `VITE_SUPABASE_ANON_KEY`: Public client-side query authorization key.
* `VITE_API_URL`: Root URL routing to the Express logical backend.

### Backend Environment Variables (`.env`)
* `PORT`: Set to `5000` (Local) or dynamically bound.
* `CLIENT_URL`: Client deployment URL used to enforce CORS restrictions.
* `SUPABASE_SERVICE_ROLE_KEY`: Service role credential bypassed from RLS rules for administrative operations.
* `GEMINI_API_KEY`: API access token for Google Gemini AI.
* `ZOOM_CLIENT_ID` & `ZOOM_CLIENT_SECRET`: Zoom Server-to-Server OAuth credentials.
* `STRIPE_SECRET_KEY` & `STRIPE_WEBHOOK_SECRET`: Secure transaction capture keys.
* `PAYPAL_CLIENT_ID` & `PAYPAL_CLIENT_SECRET`: Merchant gateway credentials.

---

## 4. Diagnostics Sign-Off Targets

All deployment systems must verify liveness metrics through the public health endpoint before launch:
* **Uptime Standard**: Ensure continuous Express service execution.
* **Database Connection Check**: Response payload must report `"supabase": "connected"`.
* **Build Time Budget**: Frontend static builds must compile in `< 500ms`.

---

Soli Deo Gloria — Glory to God the Father, God the Son, and God the Holy Spirit.
