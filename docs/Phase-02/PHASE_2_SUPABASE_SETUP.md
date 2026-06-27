# 🛡️ Ambience TutorsFlow™ — Phase 2: Live Supabase Database Connection & Setup Guide

This guide details the step-by-step setup required to connect **Ambience TutorsFlow™** to a live, production-ready Supabase PostgreSQL instance and replace the offline fallback mockup states with real, multi-tenant synchronized data.

---

## 🕊️ Dedication
*Soli Deo Gloria — Glory to God the Father, God the Son, and God the Holy Spirit. Built for noble academic excellence, robust security, and the glory of God's kingdom.*

---

## 📋 Prerequisites
* A free account on [Supabase](https://supabase.com).
* Node.js installed locally.
* All environment variables for frontend and backend pre-identified.

---

## 🗺️ Execution Steps

### Step 1: Create a Supabase Project
1. Navigate to the [Supabase Dashboard](https://database.new) and sign in.
2. Click **New Project** and select your organization.
3. Configure the project:
   * **Name**: `Ambience-TutorsFlow`
   * **Database Password**: Set a strong, secure password.
   * **Region**: Choose a region closest to your main traffic (e.g., East US).
4. Click **Create New Project** and wait for the database server instance to provision (usually takes 1-2 minutes).

---

### Step 2: Establish the PostgreSQL Database Schema
To configure the base system tables, custom enums, trigger functions, and RLS (Row Level Security) schemas:

1. In the Supabase sidebar, select the **SQL Editor** (icon with `SQL` or `>` symbol).
2. Click **New Query**.
3. Open [`database/schema.sql`](file:///D:/Ambience-TutorsFlow/database/schema.sql) in your text editor.
4. Copy the entire file content, paste it into the SQL Editor, and click **Run**.
5. *Verify Success*: Verify that tables such as `profiles`, `tutors`, `students`, `iep_goals`, etc. are created successfully with their corresponding RLS policies.

---

### Step 3: Run Phase 2 Schema Migrations
This step adds advanced scheduling exclusions (double-booking constraints), multi-organization tenant structures, and automated reminders:

1. Click **New Query** again in the SQL Editor.
2. Open [`database/migration_phase2.sql`](file:///D:/Ambience-TutorsFlow/database/migration_phase2.sql).
3. Copy the entire script, paste it into the editor, and click **Run**.
4. *Verify Success*: This establishes the `organizations` table, updates the `bookings` table with a transactional `tutor_double_booking_exclusion` GIST constraint, and registers the `transactional_book_slot` function.

---

### Step 4: Seed Testing and Mock Data
Populate your database with complete high-fidelity test profiles, recurring schedules, and character education reflections:

1. Click **New Query** in the SQL Editor.
2. Open [`database/seed.sql`](file:///D:/Ambience-TutorsFlow/database/seed.sql).
3. Copy the entire seeding script, paste it into the SQL Editor, and click **Run**.
4. This seeds the following testing database footprint:
   * **1 Platform Admin**: `admin@ambience.com` (pw: `password123`)
   * **1 Organization**: `Ambience Academy Core`
   * **2 Tutors**: `Dr. Catherine Sterling` (`tutor.catherine@ambience.com`), `Marcus Aurelius Vance` (`tutor.marcus@ambience.com`)
   * **2 Parents**: `Jonathan Edwards Sterling` (`parent.jonathan@ambience.com`), `Elizabeth Edwards Vance` (`parent.elizabeth@ambience.com`)
   * **4 Students**: Caleb, Abigail, Samuel, and Sophia (with linked parents, progress milestones, grades, and initial levels).
   * **Recurring Weekly Availability** slots mapped to each Tutor.
   * **3 Active/Historical Bookings** with pre-configured Zoom mock links and Stripe payments.
   * **Active Homework Assignments**, Parent Encouragements, Character reflections, IEP accommodates, and Billings.

---

### Step 5: Retrieve API Connection Credentials
1. In the Supabase Dashboard, click the **Settings** cog (bottom-left sidebar).
2. Select **API** under the project settings.
3. Copy the following keys:
   * **Project URL**: Found in the *Project URL* card (e.g., `https://xxxxxx.supabase.co`).
   * **Anon Public Key**: Found in the *Project API keys* section as `anon` `public` (starts with `eyJhbGci...`).

---

### Step 6: Configure Project Environment Files

#### A. Frontend Configuration
Create or update the environment variables file in [`frontend/.env`](file:///D:/Ambience-TutorsFlow/frontend/.env):
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### B. Backend Configuration
Create or update the environment variables file in [`backend/.env`](file:///D:/Ambience-TutorsFlow/backend/.env):
```env
PORT=5000
FRONTEND_URL=http://localhost:5173
NODE_ENV=production
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
ZOOM_CLIENT_ID=PLACEHOLDER_ZOOM_CLIENT_ID
ZOOM_CLIENT_SECRET=PLACEHOLDER_ZOOM_CLIENT_SECRET
ZOOM_REDIRECT_URI=http://localhost:5000/api/zoom/callback
```

---

### Step 7: Testing Live Integration and Role Dashboards

1. Start both components locally:
   * **Backend**: Navigate to `backend` and run `npm run dev`.
   * **Frontend**: Navigate to `frontend` and run `npm run dev`.
2. Open `http://localhost:5173` and click **Login** in the top navigation.
3. Test authentication using any of the seeded credentials:
   * **Admin Director**: `admin@ambience.com` (password: `password123`)
   * **STEM Tutor Catherine**: `tutor.catherine@ambience.com` (password: `password123`)
   * **Parent Jonathan**: `parent.jonathan@ambience.com` (password: `password123`)
   * **Student Caleb**: `student.caleb@ambience.com` (password: `password123`)
4. Upon sign-in, the application context detector (`isSupabaseConfigured()`) automatically switches from Local Sandbox Mode to Live Database Mode, initiating real-time database queries to populate dashboards and securely process bookings.

---

### 🛡️ Offline Sandbox Fallback
If the `.env` configuration keys are missing or invalid, Ambience TutorsFlow automatically enters the **Offline Sandbox Mode**. You can explore all role-based dashboards, payments, Zoom creations, and schedule availability mockups on client-side state maps without needing any live database!

---

*Last Document Revision: June 26, 2026*
