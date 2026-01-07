# Epic 6: Schedule Recalculation

**Epic ID:** E6
**Priority:** P1 (Fast Follow)
**Functional Requirements:** FR29-FR32

---

## Epic Overview

Life happens. This epic enables users to adjust their learning timeline when they fall behind or get ahead. Weekly check-ins prompt reflection, and recalculation options help users stay on track without abandoning their goals.

### Business Value
- Reduces dropout from "falling behind" discouragement
- Key retention mechanism
- "Life Happened" mode differentiator
- Honest, flexible planning builds trust

### Dependencies
- E3: Roadmap structure
- E5: Progress data for deviation calculation

### Dependents
- None (end-of-flow feature)

---

## User Stories

### Story 6.1: Weekly Check-in Prompt

**As a** learning user
**I want to** receive a weekly check-in prompt
**So that** I can reflect on my progress and adjust if needed

**Acceptance Criteria:**
- [ ] Check-in prompt appears once per week
- [ ] Trigger: 7 days since last check-in OR first login of the week
- [ ] Non-intrusive: modal or banner, dismissible
- [ ] Question: "How did last week go?"
- [ ] Options:
  - "Completed as planned" (closes prompt)
  - "Got ahead" (optional: log extra hours)
  - "Fell behind" (triggers recalculation options)
  - "Skip this week" (dismiss for now)
- [ ] Check-in response logged for analytics
- [ ] Don't show if user completed modules on track

**Technical Notes:**
- Track last_checkin_date in user record
- Show on dashboard after login

---

### Story 6.2: "Fell Behind" Recalculation Options

**As a** user who fell behind
**I want to** choose how to get back on track
**So that** I don't feel stuck or discouraged

**Acceptance Criteria:**
- [ ] When "Fell behind" selected, show options:
  - **Option A:** "Extend my deadline"
    - System calculates new date based on remaining hours
    - Shows: "New completion date: [Date]"
  - **Option B:** "Increase weekly hours"
    - Slider to add 1-5 additional hours/week
    - Shows impact: "Back on track with X extra hrs/week"
  - **Option C:** "Keep current plan" (acknowledge only)
- [ ] Preview the impact before confirming
- [ ] Confirm button: "Update My Plan"
- [ ] Cancel returns to dashboard without changes

**Technical Notes:**
- Recalculation preview is read-only
- Only saves on confirm

---

### Story 6.3: Extend Deadline Recalculation

**As a** user choosing to extend deadline
**I want the** system to recalculate my completion date
**So that** I have a realistic, achievable timeline

**Acceptance Criteria:**
- [ ] Calculate based on:
  - Remaining hours (total - completed)
  - Current weekly hours (unchanged)
  - Today's date
- [ ] Formula: `new_date = today + (remaining_hours / weekly_hours) * 7`
- [ ] Display new projected completion date
- [ ] Show the extension: "+3 weeks" or similar
- [ ] Update roadmap record on confirm
- [ ] Track recalculation event in analytics

**Technical Notes:**
- Store recalculation history for pattern analysis

---

### Story 6.4: Increase Weekly Hours Recalculation

**As a** user choosing to study more
**I want to** increase my weekly hours commitment
**So that** I can stay on my original timeline

**Acceptance Criteria:**
- [ ] Slider or input to increase hours
- [ ] Range: current hours + 1 to 20 (max)
- [ ] Live preview: "At X hrs/week, you'll finish by [Date]"
- [ ] Show how many extra hours needed to stay on track
- [ ] Update weekly_hours in roadmap on confirm
- [ ] Warning if exceeding 20 hrs: "Consider extending instead"
- [ ] Track change event in analytics

**Technical Notes:**
- Minimum increase: 1 hour
- Update onboarding_responses.weekly_hours

---

### Story 6.5: Manual Recalculation Trigger

**As a** user
**I want to** manually trigger a roadmap recalculation
**So that** I can adjust my plan anytime, not just during check-ins

**Acceptance Criteria:**
- [ ] "Adjust Plan" or "Recalculate" button in settings
- [ ] Opens same options as weekly check-in
- [ ] Can modify:
  - Weekly hours (slider 5-20)
  - Skip additional skills (if learned elsewhere)
  - Target completion date (sets hours automatically)
- [ ] Preview impact before saving
- [ ] Confirmation: "Your plan has been updated"
- [ ] Limited to once per day (prevent gaming)

**Technical Notes:**
- Same recalculation logic as check-in
- Rate limit in backend

---

### Story 6.6: Recalculation Confirmation

**As a** user confirming recalculation
**I want to** see a summary of changes
**So that** I understand what changed in my plan

**Acceptance Criteria:**
- [ ] Confirmation modal shows:
  - Previous completion date → New completion date
  - Previous weekly hours → New weekly hours (if changed)
  - Impact summary: "You now have 3 extra weeks"
- [ ] "Confirm" saves changes
- [ ] "Go Back" returns to options
- [ ] Success message: "Plan updated!"
- [ ] Dashboard reflects new projections immediately

**Technical Notes:**
- Optimistic UI update
- Send update to backend

---

### Story 6.7: "Got Ahead" Acknowledgment

**As a** user who completed more than planned
**I want the** system to acknowledge my progress
**So that** I feel motivated and see updated projections

**Acceptance Criteria:**
- [ ] "Got ahead" option in check-in
- [ ] Optional: log extra hours completed
- [ ] System recalculates projections based on actual progress
- [ ] Show positive message: "Great job! You're ahead of schedule!"
- [ ] Update projected completion date (earlier)
- [ ] No forced action required

**Technical Notes:**
- Auto-detection: if completion % > expected %, show "ahead" status

---

## UI/UX Specifications

### Weekly Check-in Modal
```
┌─────────────────────────────────────┐
│ Weekly Check-in                  ✕  │
├─────────────────────────────────────┤
│                                     │
│  "How did last week go?"            │
│                                     │
│  [😊 Completed as planned]          │
│                                     │
│  [🚀 Got ahead]                     │
│                                     │
│  [😅 Fell behind]                   │
│                                     │
│  [Skip this week]                   │
│                                     │
└─────────────────────────────────────┘
```

### Recalculation Options (Fell Behind)
```
┌─────────────────────────────────────────┐
│ Let's Get Back on Track              ✕  │
├─────────────────────────────────────────┤
│                                         │
│  No worries! Here are your options:     │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ 📅 Extend my deadline           │    │
│  │    New finish: Dec 15 (+3 wks)  │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ ⏰ Add more time per week       │    │
│  │    12 hrs/wk keeps Nov 15       │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ 🤷 Keep current plan            │    │
│  │    I'll catch up on my own      │    │
│  └─────────────────────────────────┘    │
│                                         │
│             [Update My Plan]            │
└─────────────────────────────────────────┘
```

---

## Non-Functional Requirements Mapping

| NFR | Requirement | Implementation |
|-----|-------------|----------------|
| NFR27 | User-friendly errors | Clear, encouraging language |
| NFR2 | <3s recalculation | Efficient time calculation |
| NFR28 | State persistence | Save preferences immediately |

---

## Technical Implementation Notes

### Database Updates
```sql
-- Add to roadmaps table
ALTER TABLE roadmaps ADD COLUMN last_checkin_date DATE;
ALTER TABLE roadmaps ADD COLUMN recalculation_count INTEGER DEFAULT 0;

-- Recalculation history
CREATE TABLE recalculations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  roadmap_id UUID REFERENCES roadmaps(id),
  previous_weekly_hours INTEGER,
  new_weekly_hours INTEGER,
  previous_completion_date DATE,
  new_completion_date DATE,
  reason VARCHAR(100), -- 'fell_behind', 'manual', 'got_ahead'
  created_at TIMESTAMP DEFAULT NOW()
);
```

### API Endpoints
- `GET /api/roadmap/checkin/status` - Check if check-in needed
- `POST /api/roadmap/checkin` - Submit check-in response
- `POST /api/roadmap/recalculate` - Recalculate timeline
- `GET /api/roadmap/recalculate/preview` - Preview recalculation

### Recalculation Logic
```typescript
interface RecalculationOptions {
  extendDeadline?: boolean;
  newWeeklyHours?: number;
  targetDate?: Date;
}

function recalculateRoadmap(
  roadmap: Roadmap,
  progress: ProgressSummary,
  options: RecalculationOptions
): RoadmapUpdate {
  const remainingHours = roadmap.totalHours - progress.completedHours;

  if (options.extendDeadline) {
    const weeksRemaining = remainingHours / roadmap.weeklyHours;
    return {
      projectedCompletion: addWeeks(new Date(), weeksRemaining),
      weeklyHours: roadmap.weeklyHours
    };
  }

  if (options.newWeeklyHours) {
    const weeksRemaining = remainingHours / options.newWeeklyHours;
    return {
      projectedCompletion: addWeeks(new Date(), weeksRemaining),
      weeklyHours: options.newWeeklyHours
    };
  }

  // Keep current plan
  return { projectedCompletion: roadmap.projectedCompletion };
}
```

---

## Acceptance Testing Checklist

- [ ] Weekly check-in appears after 7 days
- [ ] "Completed as planned" dismisses check-in
- [ ] "Fell behind" shows recalculation options
- [ ] Extend deadline calculates correctly
- [ ] Increase hours updates weekly commitment
- [ ] Manual recalculation available in settings
- [ ] Confirmation shows before/after comparison
- [ ] Dashboard updates after recalculation
- [ ] "Got ahead" shows encouraging message
- [ ] Rate limiting prevents excessive recalculations

---

*Epic document generated with BMAD methodology*
