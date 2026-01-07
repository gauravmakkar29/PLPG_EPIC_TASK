# Epic 4: Learning Dashboard & Navigation

**Epic ID:** E4
**Priority:** P0 (MVP)
**Functional Requirements:** FR17-FR22

---

## Epic Overview

The primary learning interface where users spend most of their time. Features a "Metro Map" visual sidebar for navigation, current module display with contextual "Why This Matters" explanations, and curated resource presentation.

### Business Value
- Primary engagement surface
- Reduces cognitive load (single focus)
- "Why This Matters" builds motivation
- Visual progress creates momentum

### Dependencies
- E1: User authentication
- E3: Roadmap data
- E8: Curated resources

### Dependents
- E5: Progress tracking integrates here
- E6: Check-ins launch from here
- E7: Paywall enforced here

---

## User Stories

### Story 4.1: Metro Map Visual Sidebar

**As a** learning user
**I want to** see a visual representation of my entire journey
**So that** I understand my progress and what's ahead

**Acceptance Criteria:**
- [ ] Vertical "Metro Map" sidebar on left (desktop) / collapsible (mobile)
- [ ] Shows all 3 phases as stations/stops
- [ ] Visual state indicators per phase:
  - Completed: ✓ checkmark, green
  - Active: ● filled circle, blue
  - Locked: 🔒 lock icon, gray
  - Pending: ○ empty circle, gray
- [ ] Clicking a phase expands to show modules
- [ ] Current module highlighted
- [ ] Phase progress: "3 of 8 modules complete"
- [ ] Smooth animations on state changes

**Technical Notes:**
- Use Framer Motion for animations
- Responsive: drawer on mobile
- Persist expand/collapse state

---

### Story 4.2: Path Preview Screen (Free Tier)

**As a** free tier user
**I want to** see my complete roadmap preview
**So that** I understand the value before upgrading

**Acceptance Criteria:**
- [ ] Full Metro Map visible (all phases)
- [ ] Phase 1 modules accessible (free content)
- [ ] Phases 2-3 show module names but locked
- [ ] Clear indication: "Unlock full path - $29/mo"
- [ ] Upgrade CTA button prominent
- [ ] Timeline visible: "Complete in X weeks"
- [ ] No paywall for Phase 1 content in first 2 weeks

**Technical Notes:**
- Check subscription status on load
- Free trial period tracked in user record

---

### Story 4.3: Current Module Display

**As a** learning user
**I want to** see details about my current module
**So that** I know exactly what to focus on

**Acceptance Criteria:**
- [ ] Current module prominently displayed (main content area)
- [ ] Module title and phase context
- [ ] Estimated time for module
- [ ] "Why This Matters" contextual explanation
- [ ] Resource list for the module
- [ ] "Mark Complete" button (links to E5)
- [ ] Navigation: Previous / Next module buttons

**Technical Notes:**
- "Why This Matters" stored per skill in database
- Track module view events

---

### Story 4.4: "Why This Matters" Context

**As a** learning user
**I want to** understand why I'm learning each topic
**So that** I stay motivated and see the bigger picture

**Acceptance Criteria:**
- [ ] Every module has "Why This Matters" section
- [ ] Content explains:
  - How this skill connects to the target role
  - What it enables you to do
  - Real-world application examples
- [ ] Collapsible but visible by default
- [ ] Maximum 3-4 sentences (concise)
- [ ] Links to prerequisite modules if relevant

**Technical Notes:**
- Content curated during path creation
- Store in skills table

**Example:**
```
"Why This Matters: Linear Algebra is the mathematical foundation
of machine learning. Every ML algorithm - from basic regression to
deep neural networks - relies on matrix operations. Mastering this
now means you'll understand why models work, not just how to use them."
```

---

### Story 4.5: Resource List Display

**As a** learning user
**I want to** see curated resources for each module
**So that** I know exactly what to consume

**Acceptance Criteria:**
- [ ] Resources displayed as cards within module
- [ ] Each resource shows:
  - Type badge: Video / Documentation / Tutorial / Mini-Project
  - Title (clickable, opens in new tab)
  - Source (YouTube, Coursera, Official Docs, etc.)
  - Estimated time
  - Quality score (optional: 4.5/5 rating)
- [ ] Resources ordered by recommended sequence
- [ ] "Last verified" date for external links
- [ ] Mark individual resources as complete (optional)

**Technical Notes:**
- Type badges with distinct colors
- Track resource click events

---

### Story 4.6: Resource Metadata Display

**As a** learning user
**I want to** see detailed information about each resource
**So that** I can choose the best learning material

**Acceptance Criteria:**
- [ ] Type badge prominently displayed:
  - 🎥 Video (purple)
  - 📄 Documentation (blue)
  - 💻 Tutorial (green)
  - 🛠️ Mini-Project (orange)
- [ ] Source attribution (e.g., "YouTube - 3Blue1Brown")
- [ ] Time estimate with clock icon
- [ ] Quality score (if available): stars or percentage
- [ ] External link indicator (opens new tab)
- [ ] Hover state shows brief description

**Technical Notes:**
- Store metadata in resources table
- Quality scores from curation process

---

### Story 4.7: Phase Expand/Collapse

**As a** learning user
**I want to** expand phases to see module details
**So that** I can explore what's coming

**Acceptance Criteria:**
- [ ] Click on phase name expands module list
- [ ] Expanded view shows all modules in phase
- [ ] Module status visible (complete/current/pending)
- [ ] Click module to navigate to it (if unlocked)
- [ ] Click again to collapse
- [ ] Keyboard accessible (Enter/Space)
- [ ] Animate expand/collapse smoothly

**Technical Notes:**
- Use accordion component
- Store expand state in local storage

---

### Story 4.8: Locked Phase Indication

**As a** free tier user
**I want to** clearly see which content is locked
**So that** I understand what I get with Pro

**Acceptance Criteria:**
- [ ] Locked phases show lock icon overlay
- [ ] Locked content grayed out but visible (titles only)
- [ ] Click on locked content shows upgrade prompt
- [ ] Modal: "Unlock this content with Pro - $29/mo"
- [ ] CTA: "Upgrade Now" / "Continue Free"
- [ ] No tease of detailed content (respect paywall)

**Technical Notes:**
- Check subscription status
- Track upgrade prompt impressions

---

## UI/UX Specifications

### Desktop Layout (1024px+)
```
┌─────────────────────────────────────────────────────────────────┐
│  Logo    Dashboard    Settings                       [User ▼]   │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────────────────────────────────────────┐ │
│  │ Phase 1  │  │ Current Module: Supervised Learning         │ │
│  │ ✓ Done   │  │                                              │ │
│  ├──────────┤  │ Phase 2 • Module 4 of 8                      │ │
│  │ Phase 2  │  │                                              │ │
│  │ ● Active │  │ ┌────────────────────────────────────────┐   │ │
│  │  ├ Mod 1 │  │ │ "Why This Matters"                     │   │ │
│  │  ├ Mod 2 │  │ │ Foundation for all ML models...        │   │ │
│  │  └ Mod 3▸│  │ └────────────────────────────────────────┘   │ │
│  ├──────────┤  │                                              │ │
│  │ Phase 3  │  │ Resources:                                   │ │
│  │ 🔒 Locked │  │ ┌──────────────────────────────────────────┐ │ │
│  └──────────┘  │ │ 🎥 Andrew Ng: Supervised Learning        │ │ │
│                │ │    YouTube • 18 min • ★ 4.8              │ │ │
│  ───────────   │ ├──────────────────────────────────────────┤ │ │
│  Progress:     │ │ 📄 Scikit-Learn Docs: User Guide         │ │ │
│  45/200 hrs    │ │    scikit-learn.org • 45 min             │ │ │
│  On track for  │ ├──────────────────────────────────────────┤ │ │
│  Nov 15        │ │ 🛠️ Mini-Project: Predict Housing Prices  │ │ │
│                │ │    Hands-on • 2 hrs                       │ │ │
│                │ └──────────────────────────────────────────┘ │ │
│                │                                              │ │
│                │ [◄ Previous]            [Mark Complete ✓]    │ │
│                └──────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Mobile Layout (320px+)
```
┌────────────────────────────┐
│ ☰   PLPG       [User ▼]    │
├────────────────────────────┤
│ Phase 2 • Mod 4/8    [▼]   │
├────────────────────────────┤
│ Supervised Learning        │
│ ─────────────────────────  │
│ "Why This Matters"         │
│ Foundation for all ML...   │
│                            │
│ Resources:                 │
│ ┌────────────────────────┐ │
│ │ 🎥 Andrew Ng: Super... │ │
│ └────────────────────────┘ │
│ ┌────────────────────────┐ │
│ │ 📄 Scikit-Learn Docs   │ │
│ └────────────────────────┘ │
│                            │
│ [Mark Complete ✓]          │
└────────────────────────────┘
```

---

## Non-Functional Requirements Mapping

| NFR | Requirement | Implementation |
|-----|-------------|----------------|
| NFR1 | <2s page load | Lazy load resources |
| NFR4 | 60 FPS animations | Optimize CSS transitions |
| NFR25 | Responsive design | Mobile-first CSS |
| NFR26 | Visual feedback | Loading states, hover effects |

---

## Technical Implementation Notes

### API Endpoints
- `GET /api/roadmap/current` - Get current module data
- `GET /api/modules/:id` - Get module details
- `GET /api/modules/:id/resources` - Get module resources
- `GET /api/phases` - Get all phases with modules

### Component Structure
```
Dashboard/
├── MetroMapSidebar/
│   ├── PhaseItem.tsx
│   └── ModuleList.tsx
├── ModuleDetail/
│   ├── WhyThisMatters.tsx
│   └── ResourceList.tsx
├── ResourceCard.tsx
└── ProgressSummary.tsx
```

---

## Acceptance Testing Checklist

- [ ] Metro Map displays all phases correctly
- [ ] Phase states (complete/active/locked) render correctly
- [ ] Current module displayed with all details
- [ ] "Why This Matters" shows for each module
- [ ] Resources render with correct type badges
- [ ] External links open in new tabs
- [ ] Phase expand/collapse works smoothly
- [ ] Locked content shows upgrade prompt
- [ ] Responsive layout on mobile
- [ ] Navigation between modules works

---

*Epic document generated with BMAD methodology*
