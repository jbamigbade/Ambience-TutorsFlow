# Ambience TutorsFlow™ SaaS Model Architecture
### Soli Deo Gloria — Glory to God the Father, God the Son, and God the Holy Spirit.

This document details the software architectural concepts, database multi-tenancy safeguards, and role-based access control (RBAC) restrictions backing our subscription-based AI learning ecosystem.

---

## 1. Architectural Strategy
Ambience TutorsFlow™ operates under a multi-tenant hybrid-cloud subscription SaaS model. Under this paradigm:
1. **Core Database Multi-Tenancy**: Tenant databases use PostgreSQL schemas with row-level security (RLS) filters.
2. **REST API State Syncing**: Real-time checking validates whether a requesting user holds an active subscription and has sufficient quota.
3. **Graceful Degradation (Offline Fallback)**: If connection keys are missing, the system redirects to local state sandbox engines without interrupting app functionality.

---

## 2. Row-Level Security (RLS) Controls
PostgreSQL enforcement secures all data assets using `auth.uid()` checks and role auditing:

* **public.subscriptions**:
  - `SELECT`: Restricted to `auth.uid() = profile_id` or Admins.
  - `INSERT` & `UPDATE`: Restricted to matching user or Admin profiles.
  
* **public.homework_assistant_records**:
  - `SELECT`: Permitted for the owning Student, parents of the student, tutors assigned to the student, and Admins.
  - `INSERT`: Permitted for students inserting their own records.

---

## 3. Subscription Role Privilege Enforcement (RBAC)
Features are dynamically gated in the React frontend and Node backend based on the client's subscription tier:

* **Lesson Planner, IEP Assistant, Tutor Copilot**:
  - Requires subscription plan `Tutor Starter`, `Tutor Flex`, `Tutor Professional`, `Tutor Elite`, `Business`, or `School`.
  - Non-subscribed Tutors are redirected to upgrade screens.
  
* **Step-by-Step Solvers & Practice Generators**:
  - Gated to `Student AI Plus` or higher.
  - Lower tiers can view conceptual explanations but receive upgrade alerts.

* **Administrator Intelligence Center**:
  - Gated to `Business` or `School` subscription plans.

---

## 4. Phase 13 UI & Navigation Refinement (My Plan & Scrollable Tabs)
In Phase 13, we added premium visual features to improve the discoverability of the SaaS subscription flow:
1. **Semantic Separation**:
   - Guest & Public users see the public "Pricing" link in the main navigation.
   - Logged-in Students, Parents, and Tutors find their active configurations under the intuitive "My Plan" dashboard workspace.
   - System Administrators manage entire sets of subscriptions in the "Subscriptions" tab.
2. **Horizontal Tab Navigation Layout**:
   - Refined the CSS design system for `.dashboard-tabs-header-row` using horizontal scrolling (`overflow-x: auto`), maintaining a premium flat visual alignment instead of wrapping tabs vertically and wasting workspace vertical height.
3. **Immersive Quota Meters**:
   - Implemented real-time dynamic usage quotas for each user role (such as Student homework upload limits, Parent AI queries, Tutor lesson plan generations, and Admin enterprise audit volumes).
4. **Interactive Sandbox Ledger**:
   - Upgraded the card updater block and added browser-printable receipts to provide full SaaS mockup verification capabilities.

---

## 5. Phase 15 Enterprise Polishing & Global Utilities
In Phase 15, we added global search and notification utilities to further enrich the SaaS application experience:
1. **Federated Multi-Tenant Search**:
   - Implemented a unified clientside search modal scanning 9 core tables (such as Students, Tutors, Parents, Assignments, Homework, Plans, Invoices, Messages, and Reports).
   - This ensures instant records navigation across different tenant views without taxing Supabase database connection quotas.
2. **Dynamic Notification Orchestration**:
   - Added a header-mounted dropdown bell containing real-time notifications state-bound to `AppContext`.
   - Supports 8 critical system events (homework, session alerts, message receipts, payments) with distinct color coding per event category.
3. **Accessibility-First Design Compliance**:
   - Engineered keyboard navigation pathways, focus outline overrides (`*:focus-visible`), and escape keyboard event-listeners on the window context to maximize screen reader compatibility and ADA conformance.

---

Soli Deo Gloria — Glory to God the Father, God the Son, and God the Holy Spirit.
