# Google Apps Script Enhancement — Diagnostic Submission Handler

## Overview
The enhanced submission handler now captures comprehensive diagnostic data including secondary archetype patterns and normalized scoring across all four archetypes. This enables deeper analysis of adoption stall patterns.

---

## What's New

### 1. **Secondary Archetype Capture**
- Automatically logs the secondary archetype if present (when diagnostic shows overlapping challenges)
- Stored in dedicated spreadsheet column for trend analysis
- Documents that most organizations have multiple stalls (not just one)

### 2. **Complete Score Tracking**
All four normalized scores are now captured as percentages:
- **Seam:** Governance/table problem
- **UP:** Unmarked Passage / identity shift
- **OM:** Operating Model Lag / workflow mismatch
- **Sensing:** Environmental radar / detection-response loop

**Example:**
```
Seam: 65.5% | UP: 72.1% | OM: 94.2% | Sensing: 58.3%
```
This tells you the organization's relative position across all four dimensions.

### 3. **Enhanced Submission Documents**
Each diagnostic submission now creates a Google Docs with:
- **Diagnosis** section: Primary + Secondary + Signal
- **Score Analysis** section: Normalized percentages for each archetype
- **Contact Information**: Name, email, company, department
- **Session Data**: Session ID, user agent, referrer (for analytics)
- **Full Response History**: All 12 questions and answers

**Example Document Structure:**
```
AI Adoption Stall Diagnostic — Submission
2026-05-27 at 14:32 PT

Diagnosis
  Primary Archetype: The Operating Model Lag
  Signal: Your challenge is not adoption. It is operating model redesign.
  Secondary Pattern: The Seam Organization

Score Analysis
  Seam: 65.5%
  UP: 72.1%
  OM: 94.2%
  Sensing: 58.3%

Contact Information
  Name: Sarah Chen
  Email: sarah.chen@company.com
  ...
```

### 4. **Richer Analytics Sheet**
Spreadsheet now tracks:
| Field | Purpose |
|-------|---------|
| Timestamp | Submission time |
| Session ID | Link responses across multiple visits |
| Name, Email, Company, Dept | Contact info |
| Primary Archetype | Main diagnosis |
| **Secondary Archetype** | NEW: Overlapping challenges |
| **Seam/UP/OM/Sensing Scores** | NEW: Normalized percentages |
| User Agent | Device/browser info |
| Referrer | How user found diagnostic |
| Submission Doc URL | Link to full document |

---

## Backend Installation

### Step 1: Copy the Enhanced Script
Replace your Google Apps Script with the contents of `google-apps-script-diagnostic-handler.gs`:

1. Open your Apps Script project (associated with the Sheets you're using)
2. Delete existing script
3. Paste the enhanced script
4. Deploy as web app (same as before)
5. Copy the new deployment URL

### Step 2: Update Frontend Configuration
In `preliminary-diagnostic.html`, update the `SUBMIT_URL`:

```javascript
const SUBMIT_URL = 'https://script.google.com/macros/s/[YOUR_NEW_DEPLOYMENT_ID]/exec';
```

Get the deployment ID from your Apps Script project's "Deploy" → "New deployment" → Web app.

---

## Data Flow

```
User Takes Diagnostic
    ↓
Normalized Scores Calculated (Seam, UP, OM, Sensing)
    ↓
Primary Archetype Identified (highest normalized score)
    ↓
Secondary Archetype Identified (2nd highest normalized score)
    ↓
Auto-Submit Triggered (before contact form)
    └─→ Payload includes: primary, secondary, all scores, answers
    ↓
Contact Form (Optional)
    └─→ User submits name/email (optional)
    └─→ Includes all diagnostic data + contact info
    ↓
Google Apps Script Processes Both Submissions
    ├─ Creates richly formatted Google Doc
    ├─ Appends row to Submissions sheet
    └─ Returns success
```

---

## What You Can Now Analyze

### Diagnostic Distribution
```
Primary Archetypes (Last 100 submissions):
  Operating Model Lag: 34%
  The Seam Organization: 28%
  The Unmarked Passage: 22%
  The Sensing Deficit: 16%
```

### Secondary Pattern Frequency
```
Organizations with strong secondary patterns:
  OM + Seam: 45% (workflow gaps caused by governance)
  UP + Sensing: 28% (identity unclear + weak radar)
  Seam + UP: 18% (governance + belief gaps)
  OM + Sensing: 9% (other combinations)
```

### Score Distribution Analysis
```
Average normalized scores across all submissions:
  Seam: 58% (±15)
  UP: 62% (±18)
  OM: 71% (±12)  ← Most common high score
  Sensing: 54% (±16)
```

### Geographic/Company Patterns
Filter by company or department to see if certain org types favor certain diagnoses.

### Referrer Analysis
Which marketing channels drive users who complete the diagnostic?

---

## Backward Compatibility
✅ Script remains compatible with existing submissions
✅ Optional fields don't break on old payloads
✅ Submission sheets auto-create if missing
✅ No changes required to existing frontend code (if still using old deployment)

---

## Future Enhancements
The script includes placeholder for `updateAnalytics()` function, ready for:
- Daily/weekly aggregation dashboards
- Trend analysis (are more orgs hitting OM lately?)
- Pivot tables by company, department, time period
- Secondary pattern heatmaps
- Admin reporting interface

---

## Testing the Backend

### Manual Test
```bash
curl -X POST https://script.google.com/macros/s/[YOUR_ID]/exec \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test_123",
    "name": "Test User",
    "email": "test@example.com",
    "company": "Test Corp",
    "archetype": "The Operating Model Lag",
    "secondaryArchetype": "The Seam Organization",
    "signal": "Your challenge is not adoption. It is operating model redesign.",
    "scores": {"Seam": 0.655, "UP": 0.721, "OM": 0.942, "Sensing": 0.583},
    "answers": []
  }'
```

Expected response:
```json
{"ok": true}
```

---

## File Reference
- **Frontend:** `preliminary-diagnostic.html` (updated submission payloads)
- **Backend:** `google-apps-script-diagnostic-handler.gs` (new)
- **Documentation:** This file

---

## Questions?
See the inline comments in `google-apps-script-diagnostic-handler.gs` for function-level documentation.
