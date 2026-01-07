# Epic 3: Roadmap Generation Engine

**Epic ID:** E3
**Priority:** P0 (MVP)
**Functional Requirements:** FR11-FR16

---

## Epic Overview

The core intelligence of PLPG: a DAG-based engine that analyzes skill gaps, sequences learning modules based on prerequisites, calculates time estimates, and generates personalized roadmaps.

### Business Value
- Primary differentiator ("GPS for career transitions")
- Answers: What, When, How Long, Where
- Enables skip-ahead for existing skills
- Time-aware scheduling (unique feature)

### Dependencies
- E2: Requires onboarding data (role, hours, skills)
- E8: Requires curated content/resources

### Dependents
- E4: Dashboard displays roadmap
- E5: Progress tracked against roadmap

---

## User Stories

### Story 3.1: Gap Analysis

**As the** system
**I want to** analyze the gap between user's current skills and target role
**So that** I generate only the modules they need

**Acceptance Criteria:**
- [ ] Load target role skill requirements from database
- [ ] Compare against user's existing skills (from onboarding)
- [ ] Identify missing skills (gap)
- [ ] Order skills by prerequisite dependencies (DAG traversal)
- [ ] Exclude skills user already has
- [ ] Handle transitive dependencies (if A→B→C, skip A+B if user has C)

**Technical Notes:**
- Skills stored as adjacency list (skill_id, prerequisite_skill_id)
- Use topological sort for ordering
- Performance target: <500ms for gap analysis

---

### Story 3.2: Prerequisite Sequencing (DAG)

**As the** system
**I want to** sequence modules in correct learning order
**So that** users learn prerequisites before advanced topics

**Acceptance Criteria:**
- [ ] Build dependency graph from skill prerequisites
- [ ] Perform topological sort to determine order
- [ ] Handle multiple valid orderings (use priority score)
- [ ] Detect and handle circular dependencies (error logging)
- [ ] Group sequential skills into phases
- [ ] Respect phase boundaries (Foundation → Core ML → Deep Learning)

**Technical Notes:**
```
Example DAG:
Python Basics → NumPy → Pandas → Data Preprocessing
                    ↘       ↗
              Linear Algebra → ML Fundamentals → Supervised Learning
                              ↗
                    Statistics
```

---

### Story 3.3: Time Estimation Calculation

**As the** system
**I want to** calculate total learning time for the roadmap
**So that** users know their time commitment

**Acceptance Criteria:**
- [ ] Each module has estimated hours (from content curation)
- [ ] Apply formula: `Time_total = Σ (ResourceTime_i + PracticeTime_i)`
- [ ] Include buffer time (10% overhead)
- [ ] Account for skipped modules (subtract from total)
- [ ] Store total hours in roadmap record

**Technical Notes:**
- Resource times pre-defined during curation
- Practice time = 50% of resource time (configurable)
- Round to nearest hour for display

---

### Story 3.4: Completion Date Projection

**As a** user
**I want to** see when I'll complete my learning path
**So that** I can plan my career transition

**Acceptance Criteria:**
- [ ] Calculate weeks: `Total_hours / Weekly_hours`
- [ ] Project date: `Today + (weeks * 7 days)`
- [ ] Display format: "Estimated completion: Month Day, Year"
- [ ] Account for current progress (if any)
- [ ] Recalculate when:
  - Weekly hours change
  - Progress updates
  - Modules skipped/added

**Technical Notes:**
- Store projected_completion_date in roadmap
- Update on any relevant change

---

### Story 3.5: Phase Organization

**As a** user
**I want to** see my roadmap organized into logical phases
**So that** I understand the journey structure

**Acceptance Criteria:**
- [ ] Roadmap divided into 3 phases (MVP: Backend Dev → ML Engineer):
  - Phase 1: Foundation (Python, Math, Data)
  - Phase 2: Core ML (Algorithms, Scikit-learn, Projects)
  - Phase 3: Deep Learning (Neural Networks, TensorFlow/PyTorch)
- [ ] Each phase has clear name and description
- [ ] Phases show: estimated hours, number of modules
- [ ] Current phase highlighted
- [ ] Completed phases show checkmark
- [ ] Future phases may show locked state (until prerequisites done)

**Technical Notes:**
- Phases defined in path template
- Modules assigned to phases during curation

---

### Story 3.6: Roadmap Generation Trigger

**As a** user completing onboarding
**I want to** have my roadmap automatically generated
**So that** I can start learning immediately

**Acceptance Criteria:**
- [ ] Triggered after onboarding completion (Story 2.6)
- [ ] Generation completes in <3 seconds
- [ ] Loading indicator during generation
- [ ] Success creates roadmap record linked to user
- [ ] Roadmap stored with:
  - Total hours
  - Projected completion date
  - Phases with modules
  - Status: active
- [ ] Failure shows error with retry option
- [ ] Redirect to Path Preview on success

**Technical Notes:**
- API endpoint: `POST /api/roadmap/generate`
- Async processing with status polling if needed
- Idempotent: don't create duplicate if already exists

---

### Story 3.7: Roadmap Retrieval

**As a** logged-in user
**I want to** retrieve my existing roadmap
**So that** I can continue my learning journey

**Acceptance Criteria:**
- [ ] API returns user's active roadmap
- [ ] Include all phases, modules, resources
- [ ] Include current progress data
- [ ] Include timeline projections
- [ ] Handle no roadmap: redirect to onboarding
- [ ] Support multiple roadmaps per user (future)

**Technical Notes:**
- API endpoint: `GET /api/roadmap`
- Eager load phases, modules for performance

---

## Algorithm Specification

### DAG Topological Sort
```python
def generate_roadmap(user_skills, target_role):
    # 1. Get all required skills for target
    required = get_required_skills(target_role)

    # 2. Subtract user's existing skills
    gap = required - user_skills

    # 3. Build dependency graph for gap skills
    graph = build_dependency_graph(gap)

    # 4. Topological sort
    ordered = topological_sort(graph)

    # 5. Group into phases
    phases = assign_phases(ordered)

    # 6. Calculate times
    for phase in phases:
        phase.total_hours = sum(m.hours for m in phase.modules)

    return Roadmap(phases=phases, total_hours=sum_all)
```

### Time Calculation
```
Module Time = Resource Time + Practice Time
Practice Time = Resource Time * 0.5
Buffer = Total * 0.1
Final = (Module Times + Buffer) rounded to hours
```

---

## Non-Functional Requirements Mapping

| NFR | Requirement | Implementation |
|-----|-------------|----------------|
| NFR2 | <3s generation | Optimize queries; cache skill graph |
| NFR3 | <500ms API | Efficient DAG traversal |
| NFR20 | Scale to 1M records | Indexed queries; denormalize if needed |

---

## Technical Implementation Notes

### Database Schema
```sql
CREATE TABLE skills (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  phase INTEGER, -- 1, 2, or 3
  estimated_hours DECIMAL(5,2),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE skill_prerequisites (
  skill_id UUID REFERENCES skills(id),
  prerequisite_id UUID REFERENCES skills(id),
  PRIMARY KEY (skill_id, prerequisite_id)
);

CREATE TABLE roadmaps (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  target_role VARCHAR(100) NOT NULL,
  total_hours DECIMAL(8,2) NOT NULL,
  weekly_hours INTEGER NOT NULL,
  projected_completion DATE,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE roadmap_modules (
  id UUID PRIMARY KEY,
  roadmap_id UUID REFERENCES roadmaps(id),
  skill_id UUID REFERENCES skills(id),
  phase INTEGER NOT NULL,
  sequence INTEGER NOT NULL, -- order within phase
  status VARCHAR(50) DEFAULT 'pending',
  completed_at TIMESTAMP
);
```

### API Endpoints
- `POST /api/roadmap/generate` - Create roadmap from onboarding
- `GET /api/roadmap` - Get current roadmap
- `GET /api/roadmap/:id` - Get specific roadmap
- `GET /api/skills` - List all skills (admin)
- `GET /api/skills/:id/prerequisites` - Get skill dependencies

---

## Acceptance Testing Checklist

- [ ] Gap analysis excludes user's existing skills
- [ ] Modules ordered correctly (prerequisites first)
- [ ] Total hours calculation matches formula
- [ ] Completion date projection is accurate
- [ ] Phases organized correctly (3 phases)
- [ ] Generation completes in <3 seconds
- [ ] Skipping skills reduces total time
- [ ] Roadmap persists and retrieves correctly

---

*Epic document generated with BMAD methodology*
