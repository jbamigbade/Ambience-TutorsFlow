# 🌐 Frontend Architecture & Client Specification — Ambience TutorsFlow™
### Soli Deo Gloria — Glory to God the Father, God the Son, and God the Holy Spirit.

This document outlines the client-side architecture, state orchestration workflows, design systems, and build pipelines powering the user experience of **Ambience TutorsFlow™**.

---

## 1. Frontend Stack & Build Pipelines

The client application is built as a lightning-fast Single Page Application (SPA):
* **Core Framework**: React 19.
* **Build System**: Vite 8.
* **State Management**: React Context API (`AppContext.jsx`) managing live Supabase Auth and cached local states.
* **Routing**: Fully client-side react-based component router managing layout switching.
* **Build Optimization**: Heavy modules (such as complex interactive charts, mathematical solvers, and PDF rendering layers) are dynamically loaded to compile the core bundle in `< 500ms`.

---

## 2. Global State & AppContext Orchestration

The `AppContext.jsx` is the operational brain of the client application, unifying multi-tenant tables and local memory stores:

```
                  ┌─────────────────────────────────┐
                  │          AppContext.jsx         │
                  └────────────────┬────────────────┘
                                   │
         ┌─────────────────────────┼─────────────────────────┐
         ▼                         ▼                         ▼
 ┌───────────────┐         ┌───────────────┐         ┌───────────────┐
 │   Auth State  │         │ Database Sync │         │ Utility State │
 └───────────────┘         └───────────────┘         └───────────────┘
  - User session            - Profiles/Tutors         - Alerts List
  - Role-based keys         - Bookings/Payments       - Notifications Map
  - Tenant ID mapping       - Homework/Plans          - Search Modal toggles
```

* **Live-Mode Syncer**: Listens to Supabase Auth state changes (`onAuthStateChange`). On user authentication, fetches rows across 9 main tables matching the logged-in profile ID.
* **Simulation-Mode Fallback**: If `VITE_SUPABASE_URL` is undefined or offline, loads a comprehensive local dataset (`mockData.js`), allowing full interactive evaluation of all portal interfaces with zero configurations.
* **Global Notifications State**: Exposes arrays and mutation hooks (`markNotificationRead`, `markAllNotificationsRead`, `addNotification`) to let elements dynamically update and highlight active badges globally.

---

## 3. UI Design System (Vanilla CSS Glassmorphism)

The styling architecture is built purely in Vanilla CSS (`App.css`, `index.css`) to enforce rich, premium styling metrics:
* **Theming Variables**: Restricts design tokens to dark-mode tailored variables:
  ```css
  :root {
    --bg-primary: #0a0e1a;
    --bg-surface: rgba(16, 22, 35, 0.65);
    --border-color: rgba(255, 255, 255, 0.08);
    --text-primary: #f1f5f9;
    --text-secondary: #94a3b8;
    --accent-glow: rgba(99, 102, 241, 0.15);
    --font-sans: 'Outfit', 'Inter', sans-serif;
  }
  ```
* **Glassmorphic Attributes**: Achieved via modern CSS filter models:
  ```css
  .glass-card {
    background: var(--bg-surface);
    backdrop-filter: blur(12px) saturate(180%);
    border: 1px solid var(--border-color);
    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
  }
  ```
* **Transitions**: Micro-animations are applied to all interactive targets using cubic-bezier curves:
  ```css
  .interactive-item {
    transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), background 0.25s ease;
  }
  .interactive-item:hover {
    transform: translateY(-2px);
  }
  ```

---

## 4. Universal Utilities Architecture

### A. Universal Database Search Modal
* **Data Scrape Indexing**: A flat search map aggregates data across 9 main models inside `AppContext`.
* **Search Execution**: Queries are filtered with case-insensitive sub-string checks:
  ```javascript
  const handleSearch = (query) => {
    if (!query) return [];
    return allProjectEntities.filter(item => 
      item.title.toLowerCase().includes(query.toLowerCase()) || 
      item.subtitle.toLowerCase().includes(query.toLowerCase())
    );
  };
  ```
* **Closing Actions**: Closed immediately via mouse clicks outside the modal layout or when tapping the `Escape` key.

### B. Interactive Notification Center
* **Notification Badge Bell**: Renders a glowing orange dot badge if the computed unread alert count is $> 0$.
* **Classification Colors**: Categories utilize specific custom glow indicators (e.g., `#ef4444` for Homework deadlines, `#10b981` for Tutoring payments, and `#3b82f6` for messages).

---

## 5. Accessibility-First Engineering (ADA Compliance)

- **Semantic HTML Tags**: Employs landmark elements (`<header>`, `<main>`, `<nav>`, `<aside>`, `<footer>`) to construct structured layouts.
- **Focus States Overlay**: Overrides browser styles with premium focus halo indicators restricted strictly to physical tabbing sequences:
  ```css
  *:focus-visible {
    outline: 2px solid #6366f1;
    outline-offset: 4px;
  }
  *:focus:not(:focus-visible) {
    outline: none;
  }
  ```
- **Contrast Ratios**: Ensures text-to-backdrop contrast holds a minimum of `4.5:1` across all layout views, preserving dark theme accessibility for low-vision individuals.

---

Soli Deo Gloria — Glory to God the Father, God the Son, and God the Holy Spirit.
