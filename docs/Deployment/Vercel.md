# 🌐 Vercel Production Deployment Guide
### Soli Deo Gloria — Glory to God the Father, God the Son, and God the Holy Spirit.

This guide provides instructions for deploying the **Ambience TutorsFlow™** React 19 client SPA to Vercel.

---

## 🛠️ Deployment Configuration (`vercel.json`)

Vercel by default expects Single Page Applications (SPAs) to rewrite all URL routes back to `index.html` so that client-side routing (React Router) can handle navigation without receiving `404 Not Found` responses.

The verified `vercel.json` file is located at `D:\Ambience-TutorsFlow\frontend\vercel.json` with the following configuration:

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

---

## 📋 Vercel Dashboard Settings

When importing the repository to Vercel, set the following project parameters:

- **Framework Preset**: `Vite` (automatically detected)
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

---

## 🔑 Required Environment Variables

You must add the following variables in the **Vercel Project Settings > Environment Variables** tab:

| Variable Name | Type | Value / Purpose |
| :--- | :--- | :--- |
| `VITE_SUPABASE_URL` | Plaintext | The URL endpoint of your live Supabase project |
| `VITE_SUPABASE_ANON_KEY` | Plaintext | The public anonymous key for Supabase Auth and client queries |
| `VITE_API_URL` | Plaintext | The live URL of your deployed Express backend (e.g. `https://api.ambience-tutorsflow.onrender.com`) |

> [!IMPORTANT]
> If `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are left blank, the frontend will automatically load in **Local Simulation Mode**, utilizing local state syncing. To connect to the live PostgreSQL project, you must set these variables and redeploy.

---

## 🚀 CLI Step-by-Step Deployment

To deploy using Vercel CLI from your workstation, run these PowerShell commands:

1. **Install Vercel CLI globally (if missing)**:
   ```powershell
   npm install -g vercel
   ```

2. **Navigate to the frontend folder**:
   ```powershell
   cd D:\Ambience-TutorsFlow\frontend
   ```

3. **Login and initialize Vercel**:
   ```powershell
   vercel login
   vercel link
   ```

4. **Deploy production environment**:
   ```powershell
   vercel --prod
   ```

---

## 🛡️ Production Verification

Once the build finishes, open the live Vercel URL and check:
1. **Public Marketing Website**: Verify navigation works correctly for Home, About, Services, Pricing, and Contact.
2. **Sign-In Redirection**: Navigate to `/login` or click "Sign In" to see the responsive layout.
3. **Database Indicator**: Verify the network requests trigger connection to your backend and Supabase instance.
