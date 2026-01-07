# Epic 8: Content & Resources

**Epic ID:** E8
**Priority:** P0 (MVP)
**Functional Requirements:** FR40-FR43

---

## Epic Overview

Manage the curated learning resources that power the "Backend Developer → ML Engineer" path. This epic covers storing, serving, and displaying pre-curated content including videos, documentation, tutorials, and mini-projects.

### Business Value
- Content quality is core differentiator
- Curated resources reduce decision paralysis
- Multi-source approach (not proprietary lock-in)
- "Best of the web" curation

### Dependencies
- None (foundational content layer)

### Dependents
- E3: Roadmap engine assigns resources to modules
- E4: Dashboard displays resources

---

## User Stories

### Story 8.1: Resource Storage

**As the** system
**I want to** store curated learning resources
**So that** they can be served to users in their roadmaps

**Acceptance Criteria:**
- [ ] Resource data model includes:
  - Title (display name)
  - URL (external link)
  - Type (video, documentation, tutorial, mini-project)
  - Source (YouTube, Coursera, Official Docs, etc.)
  - Estimated time (minutes)
  - Description (brief summary)
  - Quality score (optional, 1-5 scale)
  - Skill associations (which skills it teaches)
  - Last verified date
- [ ] Resources linked to skills in DAG
- [ ] Support multiple resources per skill
- [ ] CRUD operations for admin management

**Technical Notes:**
- Seed database with curated content
- Admin interface for content management (Phase 2)

---

### Story 8.2: Resource Type Categorization

**As a** learning user
**I want to** see resources categorized by type
**So that** I can choose my preferred learning format

**Acceptance Criteria:**
- [ ] Four resource types supported:
  - **Video:** Video tutorials (YouTube, Coursera videos)
  - **Documentation:** Official docs, references
  - **Tutorial:** Written tutorials, guides
  - **Mini-Project:** Hands-on exercises
- [ ] Each type has distinct visual badge
- [ ] Type filtering available (optional for MVP)
- [ ] Type distribution balanced per module

**Technical Notes:**
- Store type as enum in database
- Badge colors defined in design system

---

### Story 8.3: Resource Display

**As a** learning user
**I want to** see resource details clearly
**So that** I can decide what to consume

**Acceptance Criteria:**
- [ ] Resource card displays:
  - Type badge (colored icon)
  - Title (clickable)
  - Source attribution
  - Time estimate
  - Quality score (if available)
  - Brief description (on hover/expand)
- [ ] Click opens external link in new tab
- [ ] Track click event for analytics
- [ ] Loading state while fetching resources

**Technical Notes:**
- Link tracking for click analytics
- Open in new tab: `target="_blank" rel="noopener"`

---

### Story 8.4: External Link Handling

**As a** learning user
**I want** external links to open in new tabs
**So that** I don't lose my place in the dashboard

**Acceptance Criteria:**
- [ ] All resource links open in new browser tab
- [ ] External link indicator icon
- [ ] Security: `rel="noopener noreferrer"`
- [ ] Return to dashboard maintains state
- [ ] Optional: mark resource as "viewed" after click

**Technical Notes:**
- Implement via anchor tag attributes
- Click tracking before navigation

---

### Story 8.5: Resource Verification Status

**As a** learning user
**I want to** see when resources were last verified
**So that** I know the links are likely still valid

**Acceptance Criteria:**
- [ ] Display "Last verified: [Date]" for each resource
- [ ] Date format: "Jan 15, 2025" or "2 weeks ago"
- [ ] Visual indicator for stale resources (>90 days)
- [ ] Stale warning: "This link may be outdated"
- [ ] Report broken link option (Phase 2)

**Technical Notes:**
- Store verified_at timestamp
- Manual verification process for MVP
- Automated link checking in Phase 2

---

### Story 8.6: Backend to ML Engineer Content Set

**As a** user on the Backend Dev → ML Engineer path
**I want to** access the complete curated content library
**So that** I can learn everything I need

**Acceptance Criteria:**
- [ ] Phase 1 - Foundation (~40 hours):
  - Python for ML (review/skip option)
  - Linear Algebra essentials
  - Statistics & Probability
  - NumPy fundamentals
  - Pandas for data manipulation
- [ ] Phase 2 - Core ML (~60 hours):
  - ML fundamentals concepts
  - Supervised learning algorithms
  - Unsupervised learning basics
  - Scikit-learn practical usage
  - Mini-projects: real datasets
- [ ] Phase 3 - Deep Learning (~50 hours):
  - Neural network fundamentals
  - TensorFlow or PyTorch intro
  - CNNs / RNNs overview
  - Capstone mini-project
- [ ] Each skill has 2-4 curated resources
- [ ] Total: ~150 hours of content

**Technical Notes:**
- Seed data created during development
- Quality resources from: 3Blue1Brown, Andrew Ng, fast.ai, official docs

---

### Story 8.7: Resource Quality Scoring

**As a** learning user
**I want to** see quality ratings for resources
**So that** I can prioritize the best content

**Acceptance Criteria:**
- [ ] Quality score displayed as stars (4.5/5)
- [ ] Score based on:
  - Curator assessment (primary for MVP)
  - User ratings (Phase 2)
- [ ] Resources sorted by quality within module
- [ ] Score visible on resource card
- [ ] Tooltip: "Curated quality rating"

**Technical Notes:**
- Store as decimal (1.0 - 5.0)
- Display as filled/empty stars
- Average user ratings in Phase 2

---

### Story 8.8: Resource Recommendations

**As a** learning user
**I want to** see which resource is recommended
**So that** I know where to start

**Acceptance Criteria:**
- [ ] First resource in list is "Recommended"
- [ ] "Recommended" badge on primary resource
- [ ] Recommendation logic:
  - Highest quality score
  - Most comprehensive for the skill
  - Beginner-friendly
- [ ] Other resources labeled "Alternative"
- [ ] User can override and pick any resource

**Technical Notes:**
- Store is_recommended boolean
- One recommended resource per skill

---

## Content Examples

### Sample Resource Data
```json
{
  "title": "Linear Algebra - 3Blue1Brown",
  "url": "https://www.youtube.com/playlist?list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab",
  "type": "video",
  "source": "YouTube",
  "estimated_minutes": 180,
  "quality_score": 4.9,
  "description": "Visual, intuitive explanation of linear algebra fundamentals. Covers vectors, matrices, transformations, and eigenvalues with stunning animations.",
  "is_recommended": true,
  "verified_at": "2025-01-01",
  "skill_id": "linear-algebra-basics"
}
```

### Content Structure
```
Phase 1: Foundation
├── Python Basics (skip if known)
│   ├── [Video] Python for ML - Corey Schafer
│   ├── [Docs] Python Official Tutorial
│   └── [Project] Python Data Structures Exercise
├── Linear Algebra
│   ├── [Video] 3Blue1Brown Essence of LA ⭐ Recommended
│   ├── [Docs] Khan Academy Reference
│   └── [Tutorial] ML Linear Algebra Cheatsheet
├── Statistics & Probability
│   └── ...

Phase 2: Core ML
├── ML Fundamentals
│   ├── [Video] Andrew Ng ML Course Intro ⭐ Recommended
│   └── ...
├── Supervised Learning
│   └── ...

Phase 3: Deep Learning
├── Neural Networks
│   ├── [Video] 3Blue1Brown Neural Networks ⭐ Recommended
│   └── ...
```

---

## Non-Functional Requirements Mapping

| NFR | Requirement | Implementation |
|-----|-------------|----------------|
| NFR1 | <2s page load | Lazy load resource details |
| NFR3 | <500ms API | Indexed queries on skill_id |

---

## Technical Implementation Notes

### Database Schema
```sql
CREATE TYPE resource_type AS ENUM ('video', 'documentation', 'tutorial', 'mini_project');

CREATE TABLE resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  type resource_type NOT NULL,
  source VARCHAR(100), -- YouTube, Coursera, Official Docs, etc.
  estimated_minutes INTEGER NOT NULL,
  description TEXT,
  quality_score DECIMAL(2,1), -- 1.0 to 5.0
  is_recommended BOOLEAN DEFAULT FALSE,
  verified_at DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE skill_resources (
  skill_id UUID REFERENCES skills(id),
  resource_id UUID REFERENCES resources(id),
  sequence INTEGER DEFAULT 0, -- order within skill
  PRIMARY KEY (skill_id, resource_id)
);

CREATE INDEX idx_skill_resources_skill ON skill_resources(skill_id);
```

### API Endpoints
- `GET /api/skills/:id/resources` - Get resources for a skill
- `GET /api/resources/:id` - Get single resource details
- `POST /api/resources/:id/click` - Track resource click
- `GET /api/content/stats` - Content statistics (admin)

### Seed Data Script
```typescript
// scripts/seed-content.ts
const resources = [
  {
    title: "Essence of Linear Algebra",
    url: "https://youtube.com/playlist?list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab",
    type: "video",
    source: "YouTube - 3Blue1Brown",
    estimated_minutes: 180,
    quality_score: 4.9,
    is_recommended: true,
    skills: ["linear-algebra-basics"]
  },
  // ... more resources
];

async function seedContent() {
  for (const resource of resources) {
    await db.resources.create(resource);
  }
}
```

---

## Acceptance Testing Checklist

- [ ] Resources stored with all required fields
- [ ] Resource types display correct badges
- [ ] Resource cards show all metadata
- [ ] External links open in new tabs
- [ ] Last verified date displays correctly
- [ ] Backend → ML Engineer path has complete content
- [ ] Quality scores display as stars
- [ ] Recommended resources highlighted
- [ ] Resources load within performance targets
- [ ] Click tracking captures events

---

*Epic document generated with BMAD methodology*
