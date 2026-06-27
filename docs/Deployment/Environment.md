# 🔑 Production Environment & Secrets Reference
### Soli Deo Gloria — Glory to God the Father, God the Son, and God the Holy Spirit.

This document serves as the single source of truth for the environment configuration variables required to run both the frontend and backend in a live, secure production environment.

---

## 🎨 1. Frontend Environment Variables (`frontend/.env`)

These variables are injected during the client-side Vite compilation. They must be prefixed with `VITE_` to be exposed to the browser bundle.

```ini
# Live Express backend URL endpoint
VITE_API_URL=https://api.ambience-tutorsflow.onrender.com

# Supabase database connectivity keys (for Auth & direct RLS queries)
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## ⚙️ 2. Backend Environment Variables (`backend/.env`)

These variables are read strictly server-side. **Do not expose these keys to the client repository.**

### 📡 Server & Encryption
```ini
# Production state indicator (locks offline simulations)
NODE_ENV=production
PORT=10000

# JSON Web Token Secret key used for signing session-tokens & password resets
JWT_SECRET=super-secure-production-jwt-hash-key-32-chars-minimum
```

### 🗄️ Supabase Direct Administration
```ini
# Database REST connection endpoints
SUPABASE_URL=https://your-project-id.supabase.co

# MUST use the service_role key to bypass Row-Level Security for system audit logs
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 🎥 Zoom OAuth Integration
```ini
# Credentials from your Zoom App Marketplace account (Server-to-Server OAuth)
ZOOM_CLIENT_ID=your_zoom_client_id_here
ZOOM_CLIENT_SECRET=your_zoom_client_secret_here
ZOOM_REDIRECT_URI=https://api.ambience-tutorsflow.onrender.com/api/zoom/callback
```

### 💳 Stripe Payments Architecture
```ini
# Stripe live keys for card-processing checkout sessions
STRIPE_SECRET_KEY=sk_live_51P...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 💵 PayPal Gateway Integration
```ini
# REST SDK parameters for fast PayPal transaction validation
PAYPAL_CLIENT_ID=your_paypal_client_id_here
PAYPAL_CLIENT_SECRET=your_paypal_client_secret_here
```

### 🧠 Gemini AI Test Generator (Vertex AI Integration)
```ini
# Secure developer key to process LLM prompts and generate tests with answer keys
GEMINI_API_KEY=AIzaSy...
```

---

## 🔒 Security & Secret Management

When deploying to **Vercel** and **Render** or **Railway**:

1. **Do Not Commit `.env` Files**: Ensure `.env` is listed inside both root and folder `.gitignore` rules.
2. **Use Secret Managers**: Enter secrets using the cloud dashboard providers rather than raw file configurations.
3. **Audit Token Refreshes**: Keep cron jobs or automated tokens refresh logic aligned with Zoom OAuth lifespans.
4. **Zelle Auditing Workflow**: Admin-initiated validation of Zelle transaction hashes (`/api/payments/verify-zelle`) uses direct Supabase RLS locks. Keep database access rules restricted strictly to Admin roles in the `profiles` table.
