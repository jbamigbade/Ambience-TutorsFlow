# Phase 14 Testing Protocol — Commercial Experience & Smart Subscription Platform
### Soli Deo Gloria — Glory to God the Father, God the Son, and God the Holy Spirit.

This testing protocol defines the Quality Assurance (QA) checklists, manual test scripts, and compilation tests required to validate Phase 14 features.

---

## 1. Automated Build and Code Compilation Check

Ensure that the React frontend builds successfully without syntax warnings and the Node backend compiles cleanly.

```bash
# Execute in terminal context to verify clean build
cd D:\Ambience-TutorsFlow\frontend
npm run build
```

```bash
# Execute in backend directory to check syntax and script parsing
cd D:\Ambience-TutorsFlow\backend
node -c server.js
```

---

## 2. Public Pricing Page Validation Script

* **Purpose**: Verify that pricing tiers are correctly cataloged and the monthly/yearly pricing toggles update rates dynamically.
* **Test Procedure**:
  1. Open a browser and navigate to the public `/pricing` route (or click "Pricing" in the main navbar).
  2. Verify that plans are segregated into three sections: **Student AI Plans**, **Professional Tutor Plans**, and **Institutional Plans**.
  3. Locate the "Monthly Billing" and "Yearly Billing" toggle buttons. Click "Yearly Billing".
  4. **Expected Result**: Prices should reduce by **20%** dynamically across all student and tutor plans (e.g., Student AI Plus displays $39/mo instead of $49/mo).
  5. Check that the four redesigned professional tutor plans are present:
     - **Tutor Starter** ($29/mo)
     - **Tutor Flex** ($299/mo)
     - **Tutor Professional ⭐** ($499/mo)
     - **Tutor Elite** ($799/mo)
  6. Click "Speak with Experts" or "Contact Sales" on Institutional plans to confirm it routes to the Contact page.

---

## 3. "My Plan" Dashboard Page Validation Script

* **Purpose**: Verify that logged-in users can check active limits, change tiers, update billing cards, and use coupons.
* **Test Procedure**:
  1. Sign in as a **Student** or switch profiles using the Developer Banner at the top.
  2. Navigate to the **My Plan** page from the sidebar menu.
  3. Verify that the current active plan card matches the logged-in user profile's active plan.
  4. Verify that the three circular/bar quota gauges reflect worksheets uploaded, AI request tokens, and tutor hours correctly.
  5. Locate the promo code entry block. Type `SOLIDEOGLORIA` and click "Apply".
  6. **Expected Result**: Success alert displays "Coupon applied successfully" and all plan option upgrade buttons calculate an additional 50% checkout discount.
  7. Locate the invoice summary table. Click "Print Receipt" on an invoice item.
  8. **Expected Result**: A browser-printable receipt modal should launch. Click "Download text record" to verify download of `.txt` receipts.
  9. Click "Update Card" to toggle card edit fields. Enter card parameters and save to confirm successful simulation alerts.

---

## 4. Multi-Format AI Homework & Study Vault Validation Script

* **Purpose**: Verify that students can submit various worksheet formats, interact with the Socratic solver, and search their study vault.
* **Test Procedure**:
  1. Switch profile to **Student**. Navigate to the **AI Homework Assistant** workspace.
  2. Choose a file or drag-and-drop a mock file (such as a handwritten notes photo or math worksheet PDF).
  3. Click "Analyze Assignment".
  4. **Expected Result**: The Socratic response renders all 9 sections (Concept Overview, Hints, Guided Walkthrough, Quiz, etc.) cleanly.
  5. Switch profile to **Free Student** (with exhausted worksheet uploads) or test limit gating.
  6. **Expected Result**: A beautiful Glassmorphic "🔒 Premium Feature" lock overlay covers the workspace, blocking submissions and offering a link to upgrade to **Student AI Plus**.
  7. Navigate to the **AI Study Vault** tab.
  8. Verify that the past worksheet submission has been indexed under its appropriate subject category (e.g., Math, Science, Computer Science).
  9. Type a text search query in the search bar.
  10. **Expected Result**: Cards filter immediately.
  11. Select a card and click "Open Explanation".
  12. **Expected Result**: A details slider/drawer slides in from the right, displaying the original 9 Socratic steps from the historical run.

---

## 5. Administrative Telemetry Cockpit Script

* **Purpose**: Verify that admins can review company financial states and operational metrics.
* **Test Procedure**:
  1. Switch profile to **Admin**. Navigate to the **Subscriptions** or **Telemetry** subtab.
  2. Verify that **Monthly Recurring Revenue (MRR)** displays **$14,850.00** and **Annual Recurring Revenue (ARR)** displays **$178,200.00**.
  3. Verify that the churn rate shows **1.8%** and the subscriber renewal rate shows **98.2%**.
  4. Ensure that plan distribution metrics are rendered and match student, tutor, and district user registration metrics.

---

Soli Deo Gloria — Glory to God the Father, God the Son, and God the Holy Spirit.
