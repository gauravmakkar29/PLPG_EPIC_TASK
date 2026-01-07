# Epic 5: Progress Tracking

**Epic ID:** E5
**Priority:** P0 (MVP)
**Functional Requirements:** FR23-FR28

---

## Epic Overview

Track user progress through their learning roadmap. Enable module completion marking, display hours completed vs planned, show progress percentage, and provide timeline status indicators ("on track" / "behind" / "ahead").

### Business Value
- Creates sense of accomplishment
- Enables timeline projections
- Data for time estimate accuracy validation
- Retention through visible progress

### Dependencies
- E1: User authentication
- E3: Roadmap structure
- E4: Dashboard integration

### Dependents
- E6: Recalculation uses progress data
- E9: Analytics tracks progress events

---

## User Stories

### Story 5.1: Mark Module Complete

**As a** learning user
**I want to** mark a module as complete when I finish it
**So that** my progress is tracked and I can move forward

**Acceptance Criteria:**
- [ ] "Mark Complete" button on module detail view
- [ ] Confirmation: "Mark as complete?" (one click, reversible)
- [ ] Visual feedback: button changes to "Completed ✓"
- [ ] Metro Map updates immediately (module shows complete)
- [ ] Completion timestamp stored in database
- [ ] Track completion event in analytics
- [ ] Next module becomes current automatically
- [ ] Phase marked complete when all modules done

**Technical Notes:**
- API: `POST /api/modules/:id/complete`
- Optimistic UI update

---

### Story 5.2: Undo Module Completion

**As a** learning user
**I want to** undo marking a module complete
**So that** I can fix accidental clicks or review content again

**Acceptance Criteria:**
- [ ] "Completed ✓" shows "Undo" on hover/tap
- [ ] Undo within 24 hours (reasonable limit)
- [ ] Confirmation: "Mark as incomplete?"
- [ ] Reverts module status to in-progress
- [ ] Updates progress calculations
- [ ] Track undo event in analytics

**Technical Notes:**
- Soft delete: mark incomplete, keep timestamp
- API: `POST /api/modules/:id/uncomplete`

---

### Story 5.3: Hours Completed vs Planned

**As a** learning user
**I want to** see how many hours I've completed vs total planned
**So that** I understand my progress in time units

**Acceptance Criteria:**
- [ ] Display format: "X of Y hours completed"
- [ ] Visible on dashboard sidebar
- [ ] Updates when modules completed
- [ ] Calculate completed hours from completed modules
- [ ] Include partially completed phase hours
- [ ] Visual progress bar below the numbers

**Technical Notes:**
- Aggregate from module completion data
- Cache calculation, update on completion

---

### Story 5.4: Progress Bar

**As a** learning user
**I want to** see a visual progress bar
**So that** I can quickly gauge my overall completion

**Acceptance Criteria:**
- [ ] Horizontal progress bar on dashboard
- [ ] Fill percentage based on hours completed
- [ ] Percentage label: "45% complete"
- [ ] Color: starts blue, transitions to green as approaches 100%
- [ ] Smooth animation on updates
- [ ] Accessible: aria-valuenow attribute

**Technical Notes:**
- Calculate: (completed_hours / total_hours) * 100
- Use CSS transitions for animations

---

### Story 5.5: Timeline Status Indicator

**As a** learning user
**I want to** know if I'm on track, behind, or ahead
**So that** I can adjust my pace accordingly

**Acceptance Criteria:**
- [ ] Status displayed on dashboard: "On Track" / "Behind" / "Ahead"
- [ ] Color coding:
  - On Track: Green
  - Behind: Amber/Orange
  - Ahead: Blue
- [ ] Logic:
  - Calculate expected completion % based on time elapsed
  - Compare to actual completion %
  - Within 10%: On Track
  - >10% behind: Behind
  - >10% ahead: Ahead
- [ ] Shows deviation: "You're 2 weeks ahead!" or "You're 1 week behind"
- [ ] Tooltip with explanation

**Technical Notes:**
```
days_elapsed = today - roadmap_start_date
expected_progress = days_elapsed / (weekly_hours * weeks_to_complete * 7)
actual_progress = completed_hours / total_hours
status = compare(actual_progress, expected_progress)
```

---

### Story 5.6: Dynamic Completion Date Update

**As a** learning user
**I want to** see my projected completion date update in real-time
**So that** I know when I'll actually finish based on my pace

**Acceptance Criteria:**
- [ ] Projected date displayed: "Finish by: Nov 15, 2025"
- [ ] Recalculates when:
  - Module completed
  - Weekly hours changed
  - Roadmap recalculated (E6)
- [ ] Shows change: "↑ Moved up 3 days" or "↓ Pushed back 1 week"
- [ ] Accounts for current pace, not just plan
- [ ] Format: Month Day, Year

**Technical Notes:**
```
remaining_hours = total_hours - completed_hours
weeks_remaining = remaining_hours / weekly_hours
projected_date = today + (weeks_remaining * 7 days)
```

---

### Story 5.7: Completion Timestamp Storage

**As the** system
**I want to** store completion timestamps for all modules
**So that** we can analyze learning patterns and improve estimates

**Acceptance Criteria:**
- [ ] Store timestamp when module marked complete
- [ ] Store timestamp when resource clicked (optional)
- [ ] Enable analytics queries:
  - Average time per module
  - Time between module starts
  - Dropout points
- [ ] Data retained for accuracy improvements

**Technical Notes:**
- Store in progress table
- Use for ML-based time estimation (Phase 2)

---

### Story 5.8: Phase Progress Summary

**As a** learning user
**I want to** see progress within each phase
**So that** I understand how far I am in each section

**Acceptance Criteria:**
- [ ] Each phase shows: "X of Y modules complete"
- [ ] Mini progress bar within phase card
- [ ] Phase completion triggers celebration
- [ ] Phase stats visible when expanded in Metro Map
- [ ] Overall phase status: Not Started / In Progress / Complete

**Technical Notes:**
- Calculate per phase from module data
- Celebration: confetti animation (simple)

---

## UI/UX Specifications

### Progress Summary Panel
```
┌─────────────────────────────────┐
│ Your Progress                   │
│                                 │
│ [████████░░░░░░░░░] 45%         │
│                                 │
│ 45 of 100 hours completed       │
│                                 │
│ Status: ● On Track              │
│                                 │
│ Finish by: Nov 15, 2025         │
│ (↑ 3 days ahead of schedule)    │
└─────────────────────────────────┘
```

### Module Completion Flow
```
[Mark Complete]
      │
      ▼
┌───────────────┐
│ Great work!   │
│ Module done.  │
│               │
│ [Undo] [Next] │
└───────────────┘
```

---

## Non-Functional Requirements Mapping

| NFR | Requirement | Implementation |
|-----|-------------|----------------|
| NFR3 | <500ms API | Efficient progress queries |
| NFR28 | State persistence | Save progress immediately |
| NFR26 | Visual feedback | Animations on completion |

---

## Technical Implementation Notes

### Database Schema
```sql
CREATE TABLE progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  roadmap_id UUID REFERENCES roadmaps(id),
  module_id UUID REFERENCES roadmap_modules(id),
  status VARCHAR(50) DEFAULT 'pending', -- pending, in_progress, completed
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  time_spent_minutes INTEGER, -- optional: actual time tracking
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, module_id)
);

CREATE INDEX idx_progress_user_roadmap ON progress(user_id, roadmap_id);
```

### API Endpoints
- `POST /api/modules/:id/complete` - Mark module complete
- `POST /api/modules/:id/uncomplete` - Undo completion
- `GET /api/roadmap/progress` - Get progress summary
- `GET /api/roadmap/progress/detailed` - Get detailed progress data

### Progress Calculation Service
```typescript
interface ProgressSummary {
  completedHours: number;
  totalHours: number;
  percentComplete: number;
  status: 'on_track' | 'behind' | 'ahead';
  projectedCompletion: Date;
  deviationDays: number;
}

function calculateProgress(roadmap: Roadmap, completions: Progress[]): ProgressSummary;
```

---

## Acceptance Testing Checklist

- [ ] Module completion marks module as done
- [ ] Undo completion works within 24 hours
- [ ] Hours display updates on completion
- [ ] Progress bar reflects accurate percentage
- [ ] Timeline status shows correct state
- [ ] Projected date recalculates on progress
- [ ] Completion timestamps stored correctly
- [ ] Phase progress shows within each phase
- [ ] All data persists across sessions

---

*Epic document generated with BMAD methodology*
