# Ambience TutorsFlow™ Phase 12 Technical Notes
### Soli Deo Gloria — Glory to God the Father, God the Son, and God the Holy Spirit.

This document details the code-level adjustments, component integrations, state routing mechanisms, and gating conditions implemented during Phase 12.

---

## 1. Unified Dashboard Tab Implementations

### Admin Dashboard Tab Binding
To expose `SubscriptionManager` inside `AdminDashboard.jsx`, the component was imported and wired as follows:

```javascript
// frontend/src/components/dashboards/AdminDashboard.jsx
import SubscriptionManager from "./SubscriptionManager";

// Inside AdminDashboard function
const [activeSubTab, setActiveSubTab] = useState("Telemetry");

// Inside Navigation trigger row
<button className={`dashboard-tab-trigger ${activeSubTab === "Subscriptions" ? "active" : ""}`} onClick={() => setActiveSubTab("Subscriptions")}>
  <CreditCard className="tab-trigger-icon" />
  <span>Subscriptions</span>
</button>

// Inside Panel switcher block
{activeSubTab === "Subscriptions" && (
  <SubscriptionManager />
)}
```

---

## 2. Redesigned Public Pricing Component (`Pricing.jsx`)

The public pricing page was completely refactored to support all **7 product tiers** in a clean, high-conversion responsive tabbed view.

* **Cycle Switcher State**: `billingInterval` manages "Monthly" or "Yearly" options. Yearly option applies a 20% discount: `basePrice * 0.8`.
* **Category Switcher State**: `activeCategory` manages "Student", "Tutor", or "Institutional" segments, displaying relevant cards in a highly scannable grid.
* **Smart Actions**:
  - For Free and Student plans: Clicking *Start Free* or *Choose Plan* detects if `isLoggedIn` is true. If so, it redirects to the Dashboard page; otherwise, it sends them to the Login screen.
  - For Institutional/Enterprise plans (Business/School): Clicking *Contact Sales* redirects to the Contact screen.

---

## 3. Context-Aware AI Homework Assistant Gating

### Prop Injection for Tab Traversal
In order to allow `AiHomeworkAssistant.jsx` to navigate to the Subscriptions tab inside the Student Dashboard, we passed the dashboard's tab modifier as a prop:

```javascript
// frontend/src/components/dashboards/StudentDashboard.jsx
{activeTab === "AI_Homework" && (
  <div className="animate-scale-up">
    <AiHomeworkAssistant setActiveTab={setActiveTab} />
  </div>
)}
```

### Prompt & Locked Solution Redirections
Inside `AiHomeworkAssistant.jsx`, we leveraged the `setActiveTab` prop to build frictionless upgrade pathways:

1. **Upload Limit Notice**:
   ```javascript
   {(planName === "Free" || planName === "Student AI Basic") && (
     <div className="mt-3 p-3 bg-purple-950/40 border border-purple-500/20 rounded-xl text-center">
       <p className="text-xs text-slate-300 leading-normal">
         Upgrade to <strong>Student AI Plus</strong> to unlock unlimited homework uploads, step-by-step solutions, and practice drills!
       </p>
       {setActiveTab && (
         <button
           type="button"
           onClick={() => setActiveTab("Subscription")}
           className="mt-2 w-full py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold transition-all"
         >
           Upgrade Now
         </button>
       )}
     </div>
   )}
   ```

2. **Step Solution Upgrade Card**:
   If the active user is not on `Student AI Plus` or higher (`!isPremiumPlan`), the Step-by-Step Complete Solution is masked behind an upgrade banner with an active redirection action:
   ```javascript
   {!isPremiumPlan ? (
     <div className="text-center p-6 bg-slate-950/40 rounded-xl border border-slate-800 flex flex-col items-center gap-3">
       <Lock className="h-8 w-8 text-amber-400" />
       <div>
         <h5 className="font-bold text-white">Unlock Step Solutions</h5>
         <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 mb-3">
           Upgrade your account to Student AI Plus or higher to unlock unlimited detailed step derivations.
         </p>
         {setActiveTab && (
           <button
             type="button"
             onClick={() => setActiveTab("Subscription")}
             className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-purple-500/10"
           >
             Upgrade Plan
           </button>
         )}
       </div>
     </div>
   ) : ( ... )}
   ```

---

## 4. Multi-Tier Gating Validation Matrix

The platform gates features uniformly based on the active license profile name, adhering to the following strict specifications:

* **Free**: Gated to 1 worksheet limit. Gated from Step-by-Step Derivations and Practice Drills.
* **Student AI Basic**: Gated to 10 worksheets/mo. Gated from Step-by-Step Derivations and Practice Drills.
* **Student AI Plus**: Unlimited uploads. Full Step-by-Step Derivations and Similar Practice Drills unlocked.
* **Student AI Premium**: Unlimited uploads. All Plus features unlocked, plus Custom practice exams and IEP Accommodations mapping.
* **Tutor Pro**: AI Lesson Planner, AI IEP Assistant, and AI Tutor Copilot unlocked.
* **Business / School**: Full Administrator Intelligence Center, multi-tenant auditing, and center-wide management unlocked.

Soli Deo Gloria — Glory to God the Father, God the Son, and God the Holy Spirit.
