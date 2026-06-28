# Ambience TutorsFlow™ — Phase 13 Technical Notes
### Soli Deo Gloria — Glory to God the Father, God the Son, and God the Holy Spirit.

## 1. Code Rebranding and Tab Routing Integrity
To keep the dashboard code stable and prevent breaking client-side React panels, we separated **internal routing keys** from **user-facing labels**:

*   **State Key Retention**: All conditional dashboard blocks use their existing keys (e.g. `activeTab === "Subscription"`, `activeSubTab === "Subscription"`, or `activeSubTab === "Subscriptions"`).
*   **User-Facing Rebranding**: Only the rendered button text labels were renamed to `"My Plan"` in Student, Parent, and Tutor dashboards:
    *   **StudentDashboard.jsx** (line 307): Rebranded sidebar label to `My Plan`.
    *   **ParentDashboard.jsx** (line 435): Rebranded tab label to `My Plan`.
    *   **TutorDashboard.jsx** (line 1901): Rebranded tab label to `My Plan`.
    *   **AdminDashboard.jsx** (line 356): Retained `Subscriptions` as requested.

---

## 2. Horizontal Scroll Layout Specifications (`App.css`)
To solve tab navigation overflow (especially in the Parent Dashboard, which contains 10 active tabs), we implemented horizontal scrolling instead of vertical wrapping or text clipping:

```css
.dashboard-tabs-header-row {
  display: flex;
  flex-wrap: nowrap; /* Forces tabs onto a single horizontal line */
  overflow-x: auto;  /* Allows horizontal touch or swipe scrolling */
  overflow-y: hidden;
  gap: 10px;
  background: rgba(255,255,255,0.02);
  padding: 6px 12px;
  border-radius: 12px;
  border: 1px solid var(--border-light);
  margin-bottom: 24px;
  max-width: 100%;
  scrollbar-width: thin; /* Slim scrollbar for Firefox */
  scrollbar-color: var(--indigo-primary) transparent;
  -webkit-overflow-scrolling: touch; /* Momentum scrolling on mobile */
}

/* Chrome, Safari, Edge Scrollbar custom styles */
.dashboard-tabs-header-row::-webkit-scrollbar {
  height: 6px;
}
.dashboard-tabs-header-row::-webkit-scrollbar-track {
  background: transparent;
}
.dashboard-tabs-header-row::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 99px;
}
.dashboard-tabs-header-row::-webkit-scrollbar-thumb:hover {
  background: var(--indigo-primary);
}

.dashboard-tab-trigger {
  ...
  flex-shrink: 0;      /* Prevents button items from collapsing to unreadable sizes */
  white-space: nowrap; /* Prevents internal text wrapping */
}
```

---

## 3. Redesigned "My Plan & Billing Center" (`SubscriptionManager.jsx`)
The upgraded `SubscriptionManager.jsx` handles plan presentation, usage tracking, payment card updating, and historical receipt generation:

### Dynamic Quotas (Role-based Metrics)
*   **Student Quotas**:
    *   Free: `1 / 1` homework uploads.
    *   Basic: `4 / 10` homework uploads.
    *   Plus/Premium: `12 / Unlimited` homework uploads.
*   **Tutor Quotas**:
    *   Tracks custom lesson plans, IEP checklists, and care notes logs.
*   **Parent Quotas**:
    *   Aligns Parent Copilot queries to match their child's active student tier.
*   **Admin Quotas**:
    *   Displays auditing logs and managed workspace accounts.

### Credit Card Updater
*   Saves mock credit card properties (`cardholder name`, `masked number`, `expiry date`, `cvv`) in a state-driven form. Updating triggers a simulated secure SSL sandbox saving spinner before displaying a success toast.

### Interactive Receipts Ledger
*   Simulated invoices list past paid payments based on the selected Monthly/Yearly plan (and the 20% discount applied to Yearly).
*   **PDF/Print Action**: Opens a clean browser window containing styled inline HTML representing an invoice, then invokes `window.print()`.
*   **TXT Download Action**: Generates a standard formatted textual invoice file dynamically, attaches it to a temporary DOM download element, and clicks it to execute a direct client-side file download.

---

## 4. Upgrade Redirections
The "Upgrade Now" buttons inside `AiHomeworkAssistant.jsx` execute `setActiveTab("Subscription")`. This links directly into the unified "My Plan" dashboard workspace, establishing a cohesive marketing-to-privilege journey.

---

Soli Deo Gloria — Glory to God the Father, God the Son, and God the Holy Spirit.
