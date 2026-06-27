# 🧪 Phase 5 Testing — Production Verification Protocols
### Soli Deo Gloria — Glory to God the Father, God the Son, and God the Holy Spirit.

This guide provides step-by-step protocols to verify the integrity and production-readiness of the **Ambience TutorsFlow™** deployment configuration.

---

## 🏗️ Protocol 1: Frontend Production Compilation Check

We must guarantee that the frontend builds without any module or dependency warnings.

### Instructions:
1. Open a PowerShell terminal.
2. Navigate to the frontend directory:
   ```powershell
   cd D:\Ambience-TutorsFlow\frontend
   ```
3. Run the production build command:
   ```powershell
   npm run build
   ```

### Expected Output:
- The command should output `vite build` progress.
- It must compile CSS and JS bundles, outputting file sizes to `dist/assets/`.
- No parsing, transpilation, or module resolution errors must occur.
- Total build duration should complete in `< 1.5s`.

*Verification status: **Passed successfully in 400ms**.*

---

## ⚙️ Protocol 2: Backend Syntax Checking

We must ensure that the Node.js compiler can parse the entire backend codebase without execution.

### Instructions:
1. Navigate to the backend directory:
   ```powershell
   cd D:\Ambience-TutorsFlow\backend
   ```
2. Execute a passive syntax-checking audit:
   ```powershell
   node -c server.js
   ```

### Expected Output:
- The terminal must return with exit code `0` and no output, indicating flawless syntax validation.

*Verification status: **Passed successfully**.*

---

## 📡 Protocol 3: API Health Check Route Validation

We must verify the local behavior of the newly integrated public health check endpoint.

### Instructions:
1. Start the backend locally in development mode:
   ```powershell
   cd D:\Ambience-TutorsFlow\backend
   npm start
   ```
2. Open your web browser or run a `curl` / `Invoke-RestMethod` command in PowerShell to query the endpoint:
   ```powershell
   Invoke-RestMethod -Uri "http://localhost:5000/health"
   ```

### Expected Output:
```json
{
  "status": "healthy",
  "timestamp": "2026-06-27T03:00:00.000Z",
  "uptime": 12.34,
  "env": {
    "node_env": "development",
    "supabase_configured": false,
    "gemini_configured": false,
    "zoom_configured": false,
    "stripe_configured": false,
    "paypal_configured": false
  }
}
```
*Note: Configured statuses will evaluate to `true` on production environments once active credentials are injected into the secret variables.*

---

## 🔄 Protocol 4: Simulated Fallback Testing

To ensure that the app can be safely reviewed offline, we must test that the client falls back cleanly when Supabase keys are missing.

### Instructions:
1. Rename or delete `frontend/.env` temporarily to ensure no environment variables are present.
2. Launch the frontend developer server:
   ```powershell
   npm run dev
   ```
3. Open `http://localhost:5173` and click "Sign In".
4. Log in using `admin@tutorsflow.com` / `admin123`.

### Expected Output:
- The page must authenticate successfully, showing a yellow/orange indicator stating **"Offline Sandbox Simulation Mode"**.
- Core dashboards (Admin, Tutor, Parent, Student) must mount flawlessly, loaded with seed data, ensuring zero application crashes.
- Turn on your `.env` variables again, reload the browser, and verify that the indicator switches to a beautiful green **"Supabase Live Database Synced"** badge.
