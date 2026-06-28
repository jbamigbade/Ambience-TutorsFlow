# PHASE 15 — SYSTEM VALIDATION & TESTING SPECIFICATIONS

This document outlines the testing protocols, environment dimensions, verification matrices, and keyboard pathways used to qualify **Ambience TutorsFlow™** for Version 1.0 Release Candidate status.

---

## 📱 1. Viewport Responsiveness Test Matrices

The platform was tested across three tier-standard device sizes to verify grid collapses, horizontal scroll parameters, card scaling, and overflow preservation:

| Device Category | Target Resolution | Test Path / Viewport Actions | Expected Response | Result |
| :--- | :--- | :--- | :--- | :--- |
| **Mobile Phones** | `375px` to `480px` | Navigation menu, dashboard grid views, invoice payment tables. | - Navbar links collapse into a clean menu toggle.<br>- Tables allow horizontal scrolling.<br>- Interactive targets scale to `44px` min-height. | **Passed** |
| **Tablets / iPads** | `768px` to `1024px` | Tutor assignment tables, study vault checklists, progress cards. | - Grids collapse to single/double columns.<br>- Spacing matches standard margin padding bounds. | **Passed** |
| **Desktops** | `1126px` (Fixed-Box) | Global Search Modal, analytics charts, live Zoom connect flows. | - Fluid scaling up to maximum layout width.<br>- Side navigation lists are pinned cleanly. | **Passed** |

---

## ♿ 2. Accessibility & Screen-Reader Verification

We performed localized automated keyboard walks and ARIA descriptor validation checks:

### Keyboard Navigation Mapping
Users can navigate without a mouse using standard tab arrays:
1. `Tab` sequentially shifts focus between navigation items (Home, Features, Pricing, About, My Dashboard).
2. Pinned visible outline glows `#7c72ff` appear immediately on active items.
3. Pressing `Enter` triggers active navigation tabs, switches user simulation profiles, or opens the **Universal Search Modal**.
4. Inside the Search Modal, focus is trapped cleanly to the query input. Typing queries operates immediately.
5. Pressing `Escape` at any point immediately closes the Search Modal, Notifications Dropdown, or switch profiles menu.

### Semantic Checkpoints
- Verified `<h1>` element constraints (one per page).
- Checked `aria-label` tags on icons and button-only toggles (e.g., search icon, notification bell trigger, profile dropdown trigger).

---

## 🔍 3. Global Search & Notifications Integration Tests

To verify search precision and alert triggers, we executed the following manual verification scenarios:

### Scenario A: Real-Time Universal Query Search
1. Open Search Modal via the top-right magnifying glass button.
2. Enter `"Caleb"`.
3. **Observation**: Result window lists:
   - *Student*: Caleb Sterling (11th Grade)
   - *Parent*: Grace Sterling (Parent of Caleb Sterling)
   - *Invoice*: Invoice #inv_1094 (Caleb Sterling)
   - *Session Note*: Pre-Calculus Session Note for Caleb Sterling
4. Click on any item.
5. **Observation**: Modal automatically closes and redirects viewport pathing cleanly.

### Scenario B: Notification Toggles & Badge Counts
1. Observe red badge indicator on Bell icon showing `4` unread items.
2. Click Bell icon to toggle notifications dropdown.
3. **Observation**: Dropdown slides open. Unread items are colored with a distinct cyan accent dot.
4. Click "Mark read" on "Homework Due Soon" item.
5. **Observation**: Cyan indicator dismisses, unread status toggles false, and the badge indicator count decrements to `3`.
6. Click "Mark all read" button.
7. **Observation**: All unread alerts convert to read, and red badge indicator disappears cleanly.

---

## 📜 4. Automated Verification Scripts

The compilation validation script verified error-free code structures:

### Frontend Production Build
```bash
$ npm run build
vite v8.1.0 building client environment for production...
transforming...✓ 186 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                     0.45 kB │ gzip:   0.29 kB
dist/assets/index-BPQnk3Tb.css     59.59 kB │ gzip:  10.77 kB
dist/assets/index-CJONhkHc.js   1,052.44 kB │ gzip: 252.96 kB

✓ built in 561ms
```

### Backend Route Validation
```bash
$ node -c backend/server.js
(Exit Code 0)
```

---

Soli Deo Gloria — Glory to God the Father, God the Son, and God the Holy Spirit.
