# Ambience TutorsFlow™ Phase 12 Testing Suite
### Soli Deo Gloria — Glory to God the Father, God the Son, and God the Holy Spirit.

This document describes the testing guidelines, scenarios, and verification steps performed to prove the stability and discoverability of the Phase 12 SaaS subscription system.

---

## 1. Automated Syntax Auditing

To verify the Node.js backend services and React frontend configurations compile successfully, the following scripts were executed:

1. **Backend Syntax Audit**: Runs syntax-checking on the Express application.
   ```powershell
   node -c server.js
   ```
   *Expected Outcome*: Terminates instantly with no console errors or syntax faults.

2. **Frontend Production Compiling**: Builds static HTML/JS/CSS assets.
   ```powershell
   npm run build
   ```
   *Expected Outcome*: Transpiles JSX into static assets inside `frontend/dist/` without type errors or bundler failures.

---

## 2. Interactive Testing Scenarios & Walkthroughs

### Scenario A: Dashboard Tab Discoverability
1. **Student Dashboard Check**:
   - Access the Student Dashboard.
   - Verify the "My Subscription" navigation panel is visible.
   - Click it and verify the `SubscriptionManager` grid mounts correctly.
2. **Parent Dashboard Check**:
   - Access the Parent Dashboard.
   - Verify the "Subscriptions" navigation tab is visible in the tab header row.
   - Click it and verify `SubscriptionManager` loads.
3. **Tutor Dashboard Check**:
   - Access the Tutor Dashboard.
   - Verify the "Subscriptions" navigation tab is visible.
   - Click it and verify `SubscriptionManager` loads.
4. **Admin Dashboard Check**:
   - Access the Admin Dashboard.
   - Verify the new "Subscriptions" tab is visible in the admin header row.
   - Click it and verify `SubscriptionManager` renders.

### Scenario B: Redesigned Public Pricing Page
1. Navigate to the public website and click **Pricing** on the navigation bar.
2. Verify all **7 plans** are visible by clicking each of the three category switcher tabs:
   - **Student AI Plans**: Free, Student AI Basic, Student AI Plus, Student AI Premium.
   - **Tutor Pro Plans**: Tutor Pro.
   - **Institutional Plans**: Business, School.
3. Toggle the **Yearly Billing Selector**:
   - Verify prices change in real-time (reflecting a 20% discount).
   - Verify the saving badge is clearly visible.
4. Verify Call-To-Action (CTA) triggers:
   - Click **Start Free** or **Choose Plan** under Student plans. If logged in, verify you land on the dashboard; if logged out, verify it opens the login screen.
   - Click **Contact Sales** under Institutional plans. Verify it opens the Contact form.

### Scenario C: AI Homework Assistant Gating & Upgrade Flows
1. Set user subscription plan to **Free** or **Student AI Basic**.
2. Open the **AI Homework Assistant** workspace tab.
3. Observe the uploader card:
   - Verify that the promo banner suggests upgrading to **Student AI Plus** to unlock unlimited uploads and step solutions.
   - Click **Upgrade Now** and verify the dashboard instantly navigates you to the **My Subscription** tab.
4. Analyze a mock worksheet, then select it from your history sidebar:
5. Observe the **Complete Step Solution** box:
   - Verify it is masked behind a lock card stating "Unlock Step Solutions".
   - Verify the presence of a friendly "Upgrade Plan" button.
   - Click **Upgrade Plan** and verify the dashboard transitions you directly to the subscription manager.
6. Trigger an upgrade to **Student AI Plus** inside the subscription manager.
7. Return to the AI Homework Assistant tab and select the worksheet again:
   - Verify that the **Complete Step Solution** is now fully readable and no longer gated.

Soli Deo Gloria — Glory to God the Father, God the Son, and God the Holy Spirit.
