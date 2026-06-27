# 🛠️ Phase 5 Technical Notes — System Setup
### Soli Deo Gloria — Glory to God the Father, God the Son, and God the Holy Spirit.

---

## 🛰️ 1. Express Health Check Endpoint Architecture

The public `/health` endpoint is engineered directly into `backend/server.js` before the port listener. It delivers deep, non-blocking evaluation of environment connectivity states without executing raw, heavy database queries or exposing confidential API credentials to the browser.

```javascript
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
```

### Response Signature:
- **HTTP Status**: `200 OK`
- **Uptime Format**: Float in seconds
- **Safeguards**: Evaluates variable existence strictly as booleans (`!!`) preventing raw strings leakage.

---

## 🔒 2. Custom Map-Based Rate Limiting

To prevent API abuse, DDoS, or payment transaction spamming, a zero-dependency custom Express memory rate limiter is bound to critical paths:

- `/api/zoom/connect` (OAuth link)
- `/api/zoom/create-meeting`
- `/api/payments/create-session`
- `/api/payments/confirm`
- `/api/payments/verify-zelle`

### Limiter Specification:
- **Window**: 1 Minute
- **Cap**: 15 requests per IP address
- **Implementation**: Utilizes an in-memory `Map` tracking request frequencies. In production environments, this Map resets dynamically, avoiding memory leaks.

---

## 🚀 3. Multi-Tenant Row Level Security (RLS) Schema

In live mode, the PostgreSQL engine is protected by core Postgres RLS rules. 

### Identity Injection and Organization Isolations:
When a request is initiated from the client, the Supabase client passes the active authenticated user JWT. PostgreSQL automatically validates this JWT and extracts the user's UUID.
Using SQL Policy rules:
- Users can never query records outside their bound `organization_id`.
- Tutors can only view their own `availability` rows, preventing competitors from stealing session times.
- Parents can query and edit booking rows only for students under their designated `profiles.id` parent links.

---

## 📦 4. Vercel SPA Routing Override

To resolve the Single Page Application routing dilemma, the file `vercel.json` provides an explicit rewrite pattern:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

This tells Vercel's edge network that any client-side routes (e.g., `/dashboard/tutor` or `/marketplace`) should be rewritten to and loaded by `/index.html` on the server level. React Router then parses the original window pathname and mounts the appropriate view dynamically.
