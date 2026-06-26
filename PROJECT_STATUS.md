# 📊 Ambience TutorsFlow™ Project Status

This file is the authoritative source of truth for the development, status, and production readiness of **Ambience TutorsFlow™**. Always read and update this file when starting a new task or shifting milestones.

---

## 🚀 Project Overview
**Ambience TutorsFlow™** is a premium, production-ready, multi-tenant SaaS platform built for tutors, parents, students, learning centers, and school organizations. 

* **Core Features**: Recurring weekly availability, dynamic calendar scheduling, secure client/parent payment portals, automated lesson booking, live Zoom meeting integration, Character Education tracking, IEP (Individualized Education Program) monitoring, and detailed tutor revenue analytics.
* **Dual Operation Mode**: Fully supports offline sandbox/simulation mode for quick visual evaluations, and live multi-tenant production mode backed by Supabase.

---

## 🛠️ System Architecture & Stack

### 1. Frontend
* **Core Framework**: React 19 (SPA) with Vite 8.
* **Styling**: Premium, responsive CSS with glassmorphic aesthetics, fluid transitions, and cohesive brand palettes (no generic colors).
* **State & Authentication**: Context API (`AppContext.jsx`) managing live Supabase Auth sessions, token refresh cycles, and synchronization of multi-tenant tables.

### 2. Backend
* **Runtime**: Node.js & Express.
* **Integrations**: 
  * **Zoom**: Full Zoom OAuth and REST API client for automatic tutor-host meeting creation on successful bookings.
  * **Payments**: Strategy-pattern payment engine supporting Stripe Checkout, PayPal integration, and admin-verified Zelle payments.
* **Security & Defensive Measures**: Custom Map-based memory rate limiter, production sandbox lockouts, and robust secure headers.

### 3. Database
* **Engine**: Supabase PostgreSQL.
* **Schema Design**: Role-based tables (`profiles`, `tutors`, `students`, `bookings`, `payments`, `iep_goals`, etc.) utilizing PostgreSQL row-level security (RLS) and custom constraints to prevent double-bookings.

---

## 📈 Milestone Progress

### Done (Milestone 1 to 4)
* **Dual-Mode Marketing Website**: Created Home, About, Services, Pricing, and Contact sections without disturbing private layouts.
* **Role-Based Portals**: Implemented distinct Dashboards for Admins, Organizations, Tutors, Parents, and Students.
* **Live Scheduling Engine**: Built recurring weekly availability mapping, conflict checking, and automatic double-booking prevention.
* **Multi-Provider Billing**: Created Strategy-pattern payment processors (Stripe, PayPal, Zelle) with automated invoice and PDF receipt generation.
* **Live Zoom Orchestration**: Developed automatic Zoom OAuth token refreshers and host-start/student-join URL distribution.
* **Security Hardening & Cryptographic Audit**:
  * Closed simulation bypass vulnerabilities (`sim_token_` blockades in production).
  * Built custom zero-dependency `rateLimiter` (15 req/min cap) protecting sensitive endpoints: `/api/zoom/connect`, `/api/zoom/create-meeting`, `/api/payments/create-session`, `/api/payments/confirm`, and `/api/payments/verify-zelle`.
  * Ran successful frontend production builds (`npm run build`) and backend syntax audits (`node -c server.js`) with zero compile or dependency errors.

---

## 📍 Current Phase & Next Tasks

### Active Task: Maintenance & Continuous Progress Integration
* **Status**: Authentication, security hardening, and database integrity are audited and fully verified.
* **Next Action**: Awaiting specific user instructions regarding subsequent feature expansion, deployment configuration, or integration enhancements.

### Upcoming Milestones
1. **Vercel & Railway Deployment**: Confirm environment variables (`ZOOM_CLIENT_ID`, `ZOOM_CLIENT_SECRET`, `SUPABASE_URL`, `STRIPE_SECRET_KEY`) and live production release.
2. **AI Lesson Planner & IEP Assistant**: Integrate Large Language Models (LLMs) to automatically generate localized lesson plans and character-building tracking notes based on students' performance.
3. **In-App Messaging & Real-Time Chat**: Establish WebSockets or Supabase Realtime-based tutor-parent-student chat system.

---

*Last Updated: June 26, 2026*
