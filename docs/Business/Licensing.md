# 💳 Multi-Tier SaaS Licensing Model — Ambience TutorsFlow™
### Soli Deo Gloria — Glory to God the Father, God the Son, and God the Holy Spirit.

This document describes the commercial licensing architecture, feature entitlement gating, subscription plans, usage quotas, and billing compliance mechanisms of **Ambience TutorsFlow™**.

---

## 1. Subscription Plans Matrix

The commercial platform splits accounts into three major functional domains, covering 10 distinct licensing tiers to capture value across students, tutors, and learning institutions:

| Plan Domain | Tier Name | Price (Monthly) | Price (Annual - 20% Off) | Core Usage Quota Limits | Gated Included Privileges |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Student AI Plans** | **Free** | $0 | $0 | 1 worksheet / lifetime | Core booking calendar, manual lesson slots, and standard dashboard |
| | **Student AI Basic** | $19 | $15 ($180/yr) | 10 worksheets / month | Detailed conceptual explanations and baseline AI chatbot support |
| | **Student AI Plus** ⭐ | $49 | $39 ($468/yr) | Unlimited worksheets | Step-by-step math solver, similar practice drill generators, and study vault archiving |
| | **Student AI Premium** | $99 | $79 ($948/yr) | Unlimited worksheets | Custom mock diagnostic builders, IEP adaptations tracking, and priority scheduling |
| **Professional Tutors** | **Tutor Starter** | $29 | $23 ($276/yr) | Unlimited AI queries | Standard AI Lesson Planner, AI IEP Assistant, AI Tutor Copilot, and Progress Reports (0 tutor-host hours included) |
| | **Tutor Flex** | $299 | $239 ($2,868/yr) | Unlimited AI queries | Standard AI features + 4 included tutoring host hours per month |
| | **Tutor Professional** ⭐ | $499 | $399 ($4,788/yr) | Unlimited AI queries | Standard AI features + 8 included tutoring host hours per month |
| | **Tutor Elite** | $799 | $639 ($7,668/yr) | Unlimited AI queries | Standard AI features + 16 included tutoring host hours per month |
| **Institutional Tutors** | **Business** | $199 | $159 ($1,908/yr) | Custom Unlimited | Admin Intelligence telemetry, multi-tenant audits, and white-label center branding |
| | **School** | $499 | $399 ($4,788/yr) | Custom Unlimited | District diagnostic tools, LTI 1.3 Canvas connectors, and custom subdomain servers |

---

## 2. Technical Entitlement Enforcement & Quota Gates

Entitlements are enforced through a unified role-based authorization check (RBAC) executing within our client views and API controllers:

```
[User Action: e.g., AI Lesson Plan Generation]
       │
       ▼
[Check User Role & Plan Tier]
       │
       ├── Tier < Tutor Starter? ──────> [Block: Redirect to Upgrade Drawer]
       │
       ▼ (Tier Valid)
[Fetch Quota Balance from public.subscriptions]
       │
       ├── Quota Limit Exceeded? ──────> [Block: Glow Warning Block]
       │
       ▼ (Quota Available)
[Proceed with Operation] ──> Increment Quota Row (PostgreSQL or Sandboxed State)
```

### React Gating Helper Model
```javascript
export function checkPlanPrivilege(profile, subscription, requiredPrivilege) {
  if (profile.role === 'admin' || profile.role === 'org_admin') {
    return { granted: true };
  }

  const tier = subscription?.tier || 'Free';

  switch (requiredPrivilege) {
    case 'AI_LESSON_PLANNER':
    case 'AI_IEP_ASSISTANT':
    case 'AI_TUTOR_COPILOT':
      const isTutorTier = ['Tutor Starter', 'Tutor Flex', 'Tutor Professional', 'Tutor Elite', 'Business', 'School'].includes(tier);
      return { granted: isTutorTier, fallbackText: "Upgrade to a Tutor subscription to unlock elite pedagogical AI planning assistants." };

    case 'STEP_BY_STEP_SOLVER':
    case 'STUDY_VAULT_ARCHIVE':
      const isPlusStudent = ['Student AI Plus', 'Student AI Premium', 'School'].includes(tier);
      return { granted: isPlusStudent, fallbackText: "Upgrade to Student AI Plus or higher to unlock mathematical solvers and progress archiving." };

    case 'ADMIN_TELEMETRY':
      const isAdminTier = ['Business', 'School'].includes(tier);
      return { granted: isAdminTier, fallbackText: "Requires Business Center or School Board licensing to access platform telemetry." };

    default:
      return { granted: true };
  }
}
```

---

## 3. Financial Renewal & Grace Workflows

- **Annual Billing Math**: Subscribing to yearly billing calculates a 20% savings. The equation used across all database transaction captures is:
  $$\text{discounted\_monthly} = \lfloor \text{monthly\_base} \times 0.8 \rfloor$$
- **Automatic Renewal**: Subscriptions automatically renew at the end of each billing period. Stripe webhooks dispatch secure payloads to update the `current_period_end` date.
- **Quota Reset Actions**: Quota limits are completely reset to `0` at midnight on the user's specific billing renewal date.
- **Subscription Grace-Period**: If a transaction fails (e.g., card card expired), the system applies a **7-day trial grace status**. The system triggers warm inline alerts prompting payment method updates without locking portals.

---

Soli Deo Gloria — Glory to God the Father, God the Son, and God the Holy Spirit.
