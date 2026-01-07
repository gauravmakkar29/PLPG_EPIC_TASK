# Epic 2: Onboarding & Skill Assessment

**Epic ID:** E2
**Priority:** P0 (MVP)
**Functional Requirements:** FR6-FR10

---

## Epic Overview

Guide new users through a 3-step onboarding flow to capture their current role, target role, weekly time budget, and existing skills. This data personalizes their learning path.

### Business Value
- Enables personalization (core value proposition)
- Reduces decision paralysis immediately
- Captures data for roadmap generation
- Target: <3 minutes to complete

### Dependencies
- E1: User must be authenticated

### Dependents
- E3: Roadmap engine uses onboarding data

---

## User Stories

### Story 2.1: Onboarding Flow Entry

**As a** newly registered user
**I want to** be guided to the onboarding flow
**So that** I can set up my personalized learning path

**Acceptance Criteria:**
- [ ] After registration/first login, redirect to onboarding
- [ ] Progress indicator shows 3 steps clearly
- [ ] Skip option available (leads to generic path)
- [ ] Can navigate back to previous steps
- [ ] Progress auto-saved between steps
- [ ] Returning users with incomplete onboarding resume where they left off

**Technical Notes:**
- Store onboarding state in database
- Track onboarding start/completion events

---

### Story 2.2: Step 1 - Current Role Selection

**As a** user in onboarding
**I want to** select my current role
**So that** the system knows my starting point

**Acceptance Criteria:**
- [ ] Dropdown/select with predefined roles:
  - Backend Developer
  - DevOps Engineer
  - Data Analyst
  - QA Engineer
  - IT Professional
  - Other (with text input)
- [ ] Single selection required
- [ ] "Next" button enabled only after selection
- [ ] Selection saved immediately (no data loss on navigation)
- [ ] Visual feedback on selection

**Technical Notes:**
- Roles stored in database config (extensible)
- "Other" responses logged for future path expansion

---

### Story 2.3: Step 2 - Target Role Selection

**As a** user in onboarding
**I want to** select my target career role
**So that** the system knows where I want to go

**Acceptance Criteria:**
- [ ] Dropdown/select with target roles (MVP: ML Engineer only)
- [ ] Brief description of role shown on selection
- [ ] "Coming soon" indicator for future paths
- [ ] ML Engineer shows: estimated learning hours, typical outcomes
- [ ] Single selection required
- [ ] "Next" button enabled only after selection

**Technical Notes:**
- MVP hardcoded to ML Engineer path
- Structure supports future path additions

---

### Story 2.4: Step 3 - Weekly Time Budget

**As a** user in onboarding
**I want to** specify how many hours per week I can dedicate
**So that** the system calculates a realistic timeline

**Acceptance Criteria:**
- [ ] Slider input for hours (range: 5-20 hours)
- [ ] Default value: 10 hours
- [ ] Step increment: 1 hour
- [ ] Dynamic display showing estimated completion:
  - "At X hours/week, you'll complete in approximately Y weeks"
- [ ] Visual indicator for recommended range (10-15 hours)
- [ ] Tooltip explaining "This affects your completion timeline"

**Technical Notes:**
- Completion estimate uses formula from E3
- Store as integer hours

---

### Story 2.5: Existing Skills Selection

**As a** user in onboarding
**I want to** indicate skills I already have
**So that** I can skip content I already know

**Acceptance Criteria:**
- [ ] Checkbox list of common prerequisite skills:
  - Python Basics
  - Linear Algebra
  - Statistics & Probability
  - SQL/Databases
  - Git Version Control
  - Data Manipulation (Pandas/NumPy)
  - Basic Calculus
- [ ] Multi-select allowed
- [ ] "Select All" / "Clear All" shortcuts
- [ ] Brief description of what each skill covers (on hover/click)
- [ ] Optional: "Not sure" option with recommendation to include
- [ ] Skills saved and passed to roadmap engine

**Technical Notes:**
- Skills mapped to skill IDs in database
- Used by E3 for skip logic

---

### Story 2.6: Onboarding Completion

**As a** user completing onboarding
**I want to** see a summary and confirm my choices
**So that** I can verify before generating my path

**Acceptance Criteria:**
- [ ] Summary screen showing all selections:
  - Current role: [selected]
  - Target role: [selected]
  - Weekly hours: [X] hours
  - Skills to skip: [list or "None"]
  - Estimated completion: [Y weeks]
- [ ] "Edit" links to return to specific steps
- [ ] "Generate My Path" primary CTA button
- [ ] Button triggers roadmap generation (E3)
- [ ] Loading state during generation (<3s target)
- [ ] Success redirects to Path Preview (E4)

**Technical Notes:**
- Track completion event in analytics
- Store final onboarding response

---

### Story 2.7: Re-Onboarding / Edit Preferences

**As an** existing user
**I want to** update my onboarding preferences
**So that** I can adjust if my situation changes

**Acceptance Criteria:**
- [ ] "Edit Preferences" accessible from Settings
- [ ] Pre-filled with current selections
- [ ] Same flow as initial onboarding
- [ ] Warning: "Changing preferences will regenerate your roadmap"
- [ ] Confirmation before overwriting
- [ ] New roadmap generated; old progress retained where applicable

**Technical Notes:**
- Version onboarding responses
- Preserve module completion for matching skills

---

## UI/UX Specifications

### Progress Indicator
```
[1] ──── [2] ──── [3]
Role     Target   Time & Skills
```

### Time Slider Visual
```
5 hrs ├────────●────────┤ 20 hrs
              10 hrs
      "Recommended: 10-15 hours/week"

Estimated completion: 24 weeks (Nov 2025)
```

---

## Non-Functional Requirements Mapping

| NFR | Requirement | Implementation |
|-----|-------------|----------------|
| NFR23 | <3 min completion | Track time; optimize flow |
| NFR24 | <2 clicks per action | Direct selection; minimal navigation |
| NFR28 | State persistence | Auto-save each step |

---

## Technical Implementation Notes

### Database Schema
```sql
CREATE TABLE onboarding_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  current_role VARCHAR(100) NOT NULL,
  target_role VARCHAR(100) NOT NULL,
  weekly_hours INTEGER NOT NULL DEFAULT 10,
  existing_skills UUID[] DEFAULT '{}',
  completed_at TIMESTAMP,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### API Endpoints
- `GET /api/onboarding` - Get current onboarding state
- `PATCH /api/onboarding/step/1` - Save step 1
- `PATCH /api/onboarding/step/2` - Save step 2
- `PATCH /api/onboarding/step/3` - Save step 3
- `POST /api/onboarding/complete` - Finalize and trigger roadmap
- `GET /api/roles/current` - List available current roles
- `GET /api/roles/target` - List available target roles
- `GET /api/skills/prerequisites` - List skippable skills

---

## Acceptance Testing Checklist

- [ ] New user directed to onboarding after registration
- [ ] All 3 steps completable in <3 minutes
- [ ] Progress saved between steps
- [ ] Can navigate back without data loss
- [ ] Skills selection affects roadmap (verified in E3)
- [ ] Time budget affects completion estimate
- [ ] Summary shows all selections correctly
- [ ] Path generation triggered on completion

---

*Epic document generated with BMAD methodology*
