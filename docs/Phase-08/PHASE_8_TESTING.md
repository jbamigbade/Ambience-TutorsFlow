# 🧪 Phase 8 Testing Guide
### Soli Deo Gloria — Engineering quality with integrity and care.

This testing guide provides step-by-step instructions to verify the **AI Parent Copilot™** module in both live and offline modes.

---

## 🔌 1. Backend Endpoint Auditing

To verify the endpoints, start the backend server (`npm run dev` or `node server.js` in `backend/`) and make calls to the following:

### A. AI Generator Endpoint
- **Request Type**: `POST`
- **URL**: `http://localhost:5000/api/ai/generate-parent-copilot`
- **Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer <valid_jwt_or_auth_cookie>`
- **Payload**:
```json
{
  "studentId": "std_1",
  "studentName": "Caleb Sterling",
  "subject": "Mathematics",
  "topic": "Division of Fractions",
  "currentAssignment": "Worksheet 5",
  "parentConcern": "Easily gets frustrated when getting a step wrong",
  "supportType": "At-home coaching"
}
```
- **Expected Response (Success - 200)**:
  - Return must have status `"Success"`.
  - JSON body must contain `source` and a structured `copilotOutput` containing all ten requested fields (e.g. `parentExplanation`, `homeworkGuide`, `atHomePractice`, etc.).

### B. Database Saving Endpoint
- **Request Type**: `POST`
- **URL**: `http://localhost:5000/api/ai/parent-copilot-records`
- **Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer <valid_jwt_or_auth_cookie>`
- **Payload**:
```json
{
  "studentId": "std_1",
  "subject": "Mathematics",
  "topic": "Division of Fractions",
  "currentAssignment": "Worksheet 5",
  "parentConcern": "Easily gets frustrated when getting a step wrong",
  "supportType": "At-home coaching",
  "content": {
    "parentExplanation": "Think of fraction division like splitting a set of pizzas...",
    "homeworkGuide": "1. Ask them to flip the second fraction...",
    "atHomePractice": "1. Verbal quiz on reciprocal actions..."
  }
}
```
- **Expected Response (Success - 200)**:
  - Return must have status `"Success"` and a `parentCopilotRecord` object containing a generated ID and timestamps.

---

## 🖥️ 2. Frontend User Interface Auditing

To verify the user experience within the React application:

1. **Dashboard Entry**:
   - Run `npm run dev` in the `frontend/` directory.
   - Navigate to the **Parent Dashboard** portal.
   - Confirm that the **AI Parent Copilot™** tab appears on the navigation header next to *Payments Ledger*.
2. **Configuration Form**:
   - Select a student (optional) from the dropdown (e.g., Caleb Sterling).
   - Enter a target topic: `Comma Splices`.
   - Select Subject: `English / Language Arts`.
   - Enter Current Assignment: `Vite Practice English 101`.
   - Enter parent concern: `Shuts down when getting a question wrong`.
   - Click the **Consult Parent Copilot™** button.
3. **Load Verification**:
   - Confirm that the linear animated loading bar appears with progressive step texts.
   - Ensure the UI disables the submit button during generation to prevent double-submitting.
4. **Result Verification**:
   - On completion, verify that the loaded assets render inside a glassmorphic results container.
   - Click through each tab: **Explanations**, **Practice Plan**, **Communication**, and **Reflections & Tips** to ensure correct data segregation.
   - Confirm that the parent-friendly summary and encouragements render in highlighted blocks.
5. **Database Sync Integration**:
   - Click the **Save Assets** button.
   - Confirm that a green alert checkmark pops up: *"Parent assistance assets successfully synchronized to your academic database!"*.
   - Click the **View Copilot Log** button on the top right to verify that the run has been added to the saved list.
   - Click the **Load** button on any historic run to verify that it loads perfectly back into the workspace.

---

## 🔒 3. Regression-Testing Guidelines

To ensure pre-existing features remain untouched:
- Run `npm run build` inside `frontend/` to confirm that standard private router layouts, calendars, payment engines, and lesson planners compile cleanly.
- Verify that standard scheduler components do not suffer from routing anomalies.
