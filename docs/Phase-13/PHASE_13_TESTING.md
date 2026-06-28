# Ambience TutorsFlow™ — Phase 13 Testing Guide
### Soli Deo Gloria — Glory to God the Father, God the Son, and God the Holy Spirit.

This testing guide details the validation scripts used to audit Phase 13 subscription discoverability polishing, dashboard tab horizontal scrolling, and simulated billing sandbox operations.

---

## Test Scenario 1: Tab Label and Visual Verification
1.  **Student Dashboard Auditing**:
    *   Log in as a **Student** (or click the Student View switcher badge at the top).
    *   Verify the left sidebar contains a tab labelled **"My Plan"** with an amber bolt icon instead of "Subscriptions".
    *   Click "My Plan" and verify the unified **My Plan & Billing Center** workspace loads successfully.
2.  **Parent Dashboard Auditing**:
    *   Log in as a **Parent** (or click the Parent View switcher badge at the top).
    *   Verify the header tabs include a trigger named **"My Plan"** with an amber bolt icon.
    *   Verify the "AI Parent Copilot" and "My Plan" tabs remain fully inside the container and do not overflow vertically.
3.  **Tutor Dashboard Auditing**:
    *   Log in as a **Tutor** (or click the Tutor View switcher badge at the top).
    *   Verify the tabs header contains a trigger named **"My Plan"** with an amber bolt icon.
4.  **Admin Dashboard Auditing**:
    *   Log in as an **Admin** (or click the Admin View switcher badge at the top).
    *   Verify the tabs header retains the original administrative label **"Subscriptions"**.

---

## Test Scenario 2: Horizontal Tab Scroll Auditing
1.  Resize your browser window (or open Chrome Developer Tools and switch to mobile viewport emulator, e.g. iPhone 12 Pro).
2.  Go to the **Parent Dashboard** (which contains 10 active tabs).
3.  Verify that instead of wrapping into multiple messy rows or overflowing outside the layout box, the tabs stay aligned in a single horizontal row.
4.  Swipe/drag horizontally or use the touchpad to scroll the tab header.
5.  Verify that all tabs can be reached and clicked cleanly.
6.  Ensure the scrollbar is a slim, elegant custom bar.

---

## Test Scenario 3: Immersive Quota Meters Testing
1.  Open the **"My Plan"** tab in any dashboard.
2.  Locate the section titled **"Live Plan Resource Usage & Quotas"**.
3.  Audit the displayed limits depending on your role:
    *   If **Student (Free Plan)**: Check that the Homework Helper progress bar shows `1 / 1 uploads` (red warning) and states that the limit is reached.
    *   If **Student (Plus/Premium)**: Verify that the meter shows `12 / Unlimited` (green) and states that unlimited access is active.
    *   If **Tutor**: Verify that the meters display unlimited metrics for Lesson Planners and IEP Accommodations.
    *   If **Parent**: Verify that the AI Parent Copilot queries match your student's linked plan.

---

## Test Scenario 4: Secure Stripe & Billing Sandbox Testing
1.  Go to **"My Plan"** on any paid plan.
2.  Locate the **"Secure Payment Method"** card display.
3.  Click **"Update Payment Card"**.
4.  Fill in the form:
    *   *Cardholder Name*: Grace Sterling
    *   *Card Number*: 4111 2222 3333 4242
    *   *Expiry*: 12/29
    *   *CVV*: 987
5.  Click **"Save Changes"**.
6.  Verify that a spinner appears briefly ("Syncing Card..."), then a green success notification is displayed:
    *   `💳 Payment method updated successfully! Secure token generated and synced with billing sandbox.`
7.  Check that the credit card graphic instantly updates to reflect the new holder name, expiry date, and last four digits.

---

## Test Scenario 5: Invoice Generation & Printable Downloads
1.  Under **"Billing Receipts & Ledger"**, verify past invoices are listed.
2.  Click the **Print** icon next to any invoice.
3.  Verify that a new blank browser tab opens containing a professionally-designed invoice and automatically prompts your browser's Print dialog.
4.  Verify that the invoice has the correct details, totals, and the faith-inspired dedication footer.
5.  Click the **Download** icon next to any invoice.
6.  Verify that a `.txt` receipt is immediately downloaded to your browser.
7.  Open the downloaded text file and ensure the layout, invoice ID, and dedication text match the schema.

---

## Test Scenario 6: Homework Assistant Direct Routing Gater
1.  Switch to **Student (Free)** or **Student (Basic)**.
2.  Go to the **AI Homework Workspace** tab.
3.  Look at the bottom of the worksheet upload form where it prompts you to upgrade.
4.  Click **"Upgrade Now"** or **"Upgrade Plan"**.
5.  Verify that the dashboard instantly switches focus to the **"My Plan"** tab, allowing you to select a plan immediately.

---

Soli Deo Gloria — Glory to God the Father, God the Son, and God the Holy Spirit.
