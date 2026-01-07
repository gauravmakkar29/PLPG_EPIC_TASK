# PLPG Product Requirements Document (PRD)

**Version:** 1.0
**Date:** January 2025
**Status:** Draft - In Progress
**Project Brief:** [docs/brief.md](brief.md)

---

## 1. Goals and Background Context

### 1.1 Goals

**User Goals:**
- Enable career pivoters to get a personalized, time-bound learning roadmap in under 5 minutes
- Reduce "decision paralysis" by answering What, When, How Long, and Where to learn
- Skip content users already know through intelligent prerequisite mapping
- Provide realistic completion timelines based on weekly availability
- Increase learning path completion rates to 2-3x industry average (>15% vs <15%)

**Business Goals:**
- Validate product-market fit with >40% Phase 1 completion rate
- Achieve $50K MRR by Month 12 with >5% free-to-paid conversion
- Establish first-mover advantage in time-aware personalized learning paths
- Build defensible moat through user completion data (10,000+ data points)
- Prove time estimation accuracy (<20% variance)

**Technical Goals:**
- Deliver responsive web MVP within 3-month timeline
- Implement DAG-based skill sequencing engine
- Integrate authentication (Auth0/Clerk), payments (Stripe), and analytics (PostHog)
- Achieve <2s page load, <3s roadmap generation, 99.5% uptime

### 1.2 Background Context

The gap between current workforce competencies and required skills is widening rapidly, with 44% of essential skills disrupted by automation/AI and 87% of executives expecting significant skill gaps. Traditional learning solutions cause "decision paralysis"—learners face thousands of courses with no clear guidance on where to start, resulting in industry-wide completion rates below 15%.

PLPG (Personalized Learning Path Generator) addresses this by functioning as a "GPS for career transitions"—an orchestration layer that sits above content platforms to intelligently curate, sequence, and schedule existing resources into personalized, time-bound roadmaps. Unlike content-first platforms (Coursera, LinkedIn Learning) or enterprise LMS tools (Cornerstone, Degreed), PLPG is roadmap-first, answering the four critical questions learners need: **What** to learn, **When** (sequence), **How Long** (duration), and **Where** (best resources).

The MVP focuses on a single career path ("Backend Developer → ML Engineer") to validate the core value proposition before expanding. Target users are career pivoters—mid-career professionals (28-42 years old) with 10-15 hours/week for learning, willing to pay $29/month for a solution that eliminates ambiguity and provides accountability.

### 1.3 Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| Jan 2025 | 1.0 | Initial PRD draft from Project Brief | John (PM) |

---

## 2. Requirements

### 2.1 Functional Requirements

#### Authentication & User Management
- **FR1:** The system shall allow users to register using email/password or Google OAuth social login
- **FR2:** The system shall send email verification upon registration before granting full access
- **FR3:** The system shall provide password reset functionality via email link
- **FR4:** The system shall maintain user session state across browser sessions (remember me)
- **FR5:** The system shall support user profile management (name, email, avatar)

#### Onboarding & Skill Assessment
- **FR6:** The system shall present a 3-step onboarding flow: Current Role → Target Role → Time Budget
- **FR7:** The system shall provide a dropdown of predefined current roles (Backend Developer, DevOps Engineer, Data Analyst, QA Engineer, IT Professional)
- **FR8:** The system shall allow selection of target role from predefined options (MVP: ML Engineer only)
- **FR9:** The system shall capture weekly time availability via slider input (range: 5-20 hours/week)
- **FR10:** The system shall allow users to indicate existing skills they want to skip (checkboxes for common skills)

#### Roadmap Generation Engine
- **FR11:** The system shall perform gap analysis between current skills and target role requirements
- **FR12:** The system shall generate a personalized learning path using DAG-based prerequisite sequencing
- **FR13:** The system shall automatically skip modules for skills the user already possesses
- **FR14:** The system shall calculate total estimated completion time using formula: `Time_total = Σ (ResourceTime_i + PracticeTime_i)`
- **FR15:** The system shall compute projected completion date based on weekly time budget
- **FR16:** The system shall organize the roadmap into logical phases (Foundation → Core ML → Deep Learning)

#### Roadmap Display & Navigation
- **FR17:** The system shall display a "Metro Map" visual sidebar showing all phases with completion status
- **FR18:** The system shall show the current active module with "Why This Matters" contextual explanation
- **FR19:** The system shall display curated resources for each module (video, documentation, mini-project)
- **FR20:** The system shall show resource metadata: type badge, source, estimated time, quality score
- **FR21:** The system shall allow users to expand/collapse phase details
- **FR22:** The system shall indicate locked phases that require prerequisite completion

#### Progress Tracking
- **FR23:** The system shall allow users to mark individual modules as complete
- **FR24:** The system shall track and display hours completed vs. hours planned
- **FR25:** The system shall show a progress bar with percentage completion
- **FR26:** The system shall display "on track" / "behind" / "ahead" status relative to timeline
- **FR27:** The system shall update projected completion date dynamically based on actual progress
- **FR28:** The system shall store completion timestamps for analytics

#### Schedule Recalculation
- **FR29:** The system shall prompt users weekly with check-in: "How did last week go?"
- **FR30:** The system shall offer recalculation options when behind: extend deadline OR increase weekly hours
- **FR31:** The system shall recalculate and update the roadmap timeline after user confirms changes
- **FR32:** The system shall allow users to manually trigger roadmap recalculation at any time

#### Subscription & Billing
- **FR33:** The system shall provide a Free tier with 2-week path preview (first phase content only)
- **FR34:** The system shall provide a Pro tier ($29/month) with full roadmap access
- **FR35:** The system shall integrate with Stripe for subscription payment processing
- **FR36:** The system shall handle subscription lifecycle: create, update, cancel, reactivate
- **FR37:** The system shall enforce paywall after free tier period expires
- **FR38:** The system shall display current subscription status and renewal date in user profile
- **FR39:** The system shall send email notifications for billing events (payment success, failure, expiring)

#### Content & Resources
- **FR40:** The system shall store and serve pre-curated learning resources for "Backend Dev → ML Engineer" path
- **FR41:** The system shall categorize resources by type: Video, Documentation, Tutorial, Mini-Project
- **FR42:** The system shall display external resource links that open in new tabs
- **FR43:** The system shall show "Last verified" date for external resource links

#### Analytics & Tracking
- **FR44:** The system shall track user events: signup, onboarding completion, module completion, subscription
- **FR45:** The system shall integrate with analytics platform (PostHog/Mixpanel) for funnel analysis
- **FR46:** The system shall collect optional user feedback ratings (1-5 stars) for completed modules

### 2.2 Non-Functional Requirements

#### Performance
- **NFR1:** Page load time shall be < 2 seconds on 4G mobile connection
- **NFR2:** Roadmap generation (DAG calculation + resource fetching) shall complete in < 3 seconds
- **NFR3:** API response time for standard CRUD operations shall be < 500ms (p95)
- **NFR4:** Dashboard shall render smoothly with 60 FPS during scroll and animations
- **NFR5:** Application shall support 1,000 concurrent users without performance degradation

#### Availability & Reliability
- **NFR6:** System uptime shall be ≥ 99.5% (measured monthly, excluding planned maintenance)
- **NFR7:** Planned maintenance windows shall be scheduled during low-traffic hours with 48hr notice
- **NFR8:** System shall implement graceful degradation when third-party services are unavailable
- **NFR9:** Database backups shall be performed daily with 30-day retention
- **NFR10:** RPO shall be ≤ 24 hours; RTO shall be ≤ 4 hours

#### Security
- **NFR11:** All data in transit shall be encrypted using TLS 1.3
- **NFR12:** All sensitive data at rest shall be encrypted using AES-256
- **NFR13:** Passwords shall be hashed using bcrypt with minimum cost factor of 12
- **NFR14:** Authentication tokens shall expire after 24 hours of inactivity
- **NFR15:** Rate limiting: 100 requests/minute per IP anonymous; 500/minute authenticated
- **NFR16:** All user inputs shall be validated to prevent SQL injection and XSS attacks
- **NFR17:** Payment data delegated to Stripe; no local storage (PCI compliance)
- **NFR18:** System shall log all authentication events for audit trail

#### Scalability
- **NFR19:** Architecture shall support horizontal scaling to handle 10x user growth
- **NFR20:** Database schema shall efficiently query 100K+ users and 1M+ progress records
- **NFR21:** Static assets shall be served via CDN for global performance
- **NFR22:** System shall use connection pooling for database connections

#### Usability
- **NFR23:** Onboarding flow shall be completable in ≤ 3 minutes
- **NFR24:** Primary user actions shall require ≤ 2 clicks
- **NFR25:** Responsive across desktop (1024px+), tablet (768px+), and mobile (320px+)
- **NFR26:** All interactive elements shall have clear visual feedback states
- **NFR27:** Error messages shall be user-friendly and actionable
- **NFR28:** System shall maintain state across page refreshes and browser sessions

#### Accessibility
- **NFR29:** UI shall meet WCAG 2.1 Level AA compliance for color contrast
- **NFR30:** All interactive elements shall be keyboard navigable
- **NFR31:** Images and icons shall have appropriate alt text or aria-labels
- **NFR32:** Focus indicators shall be clearly visible

#### Browser Compatibility
- **NFR33:** Support latest 2 versions of Chrome, Firefox, Safari, and Edge
- **NFR34:** Graceful degradation on unsupported browsers with clear messaging
- **NFR35:** JavaScript required; no-JS fallback not required for MVP

#### Monitoring & Observability
- **NFR36:** Error tracking (Sentry) with automatic alerting for critical errors
- **NFR37:** Health check endpoint for uptime monitoring
- **NFR38:** Key business metrics tracked in analytics
- **NFR39:** API endpoints shall log request/response times

#### Data & Privacy
- **NFR40:** Data export functionality (user can download their data)
- **NFR41:** Account deletion with complete data removal within 30 days
- **NFR42:** Privacy policy and terms accessible from all pages
- **NFR43:** Cookie consent for analytics tracking (EU compliance prep)

#### Maintainability
- **NFR44:** Consistent coding standards enforced by ESLint/Prettier
- **NFR45:** Test coverage ≥ 70% for critical paths
- **NFR46:** API documented with OpenAPI/Swagger specification
- **NFR47:** Environment configuration externalized (no hardcoded secrets)

---

## 3. User Interface Design Goals

### 3.1 Overall UX Vision

| Principle | Description |
|-----------|-------------|
| **Clarity** | Every screen answers "What should I do next?" within 3 seconds |
| **Confidence** | Users always know where they are in their journey and why |
| **Momentum** | Micro-progress indicators and celebrations maintain engagement |

### 3.2 Key Interaction Paradigms

| Paradigm | Implementation |
|----------|----------------|
| **Progressive Disclosure** | Show only what's needed at each step; reveal complexity gradually |
| **Single Focus** | One primary action per screen; minimize cognitive load |
| **Visual Hierarchy** | Clear distinction between phases, modules, and resources |
| **Contextual Help** | "Why This Matters" explanations at every decision point |
| **Forgiving Design** | Easy to go back, redo onboarding, or recalculate timeline |

### 3.3 Core Screens

| Screen | Primary Purpose | Key Elements |
|--------|-----------------|--------------|
| **Landing Page** | Convert visitors → signups | Value prop, social proof, single CTA |
| **Onboarding Flow** | Capture inputs for personalization | 3-step wizard: Role → Target → Time |
| **Path Preview** | Show personalized roadmap summary | Phase overview, timeline, paywall CTA |
| **Learning Dashboard** | Daily learning hub | Metro Map sidebar, active module, resources |
| **Module Detail** | Deep dive into current topic | "Why This Matters", resource list, completion button |
| **Weekly Check-in** | Maintain timeline accuracy | Progress reflection, recalculation options |
| **Settings** | Account management | Profile, preferences, notifications |
| **Billing** | Subscription management | Plan details, upgrade/cancel, payment history |

### 3.4 Visual Design System

| Element | Specification |
|---------|---------------|
| **Theme** | Dark mode primary (professional, focused); light mode optional |
| **Typography** | Inter (headings), system fonts (body) for performance |
| **Color Tokens** | Primary: Deep Blue (#1E3A8A), Accent: Emerald (#10B981), Warning: Amber (#F59E0B) |
| **Spacing** | 8px base grid; consistent padding (16px, 24px, 32px) |
| **Components** | Shadcn UI component library for consistency |

### 3.5 Accessibility Requirements

| Requirement | Standard |
|-------------|----------|
| **Color Contrast** | WCAG 2.1 AA (4.5:1 minimum) |
| **Keyboard Navigation** | Full tab navigation support |
| **Screen Readers** | Semantic HTML, ARIA labels |
| **Focus Indicators** | Visible focus states on all interactive elements |
| **Text Sizing** | Support browser zoom to 200% |

### 3.6 Target Platforms

| Platform | Support Level |
|----------|---------------|
| **Desktop** | Primary (1024px+); optimized experience |
| **Tablet** | Full support (768px+); responsive layout |
| **Mobile** | Full support (320px+); simplified navigation |

---

## 4. Technical Assumptions

### 4.1 Repository Structure

**Strategy:** Monorepo using Turborepo

```
plpg/
├── apps/
│   ├── web/                 # React frontend (Vite)
│   └── api/                 # Backend API (Node.js or FastAPI)
├── packages/
│   ├── ui/                  # Shared UI components (Shadcn)
│   ├── database/            # Prisma schema & migrations
│   ├── roadmap-engine/      # DAG logic, time calculation
│   └── shared/              # Common types, utilities
├── infrastructure/          # IaC (Terraform/Pulumi)
└── docs/                    # Documentation
```

**Rationale:** Monorepo enables code sharing between frontend and backend, unified CI/CD pipelines, and atomic changes across packages.

### 4.2 Service Architecture

| Layer | Technology | Hosting |
|-------|------------|---------|
| **Client** | React SPA (TypeScript + Vite) | Vercel |
| **API** | Node.js/Express or Python/FastAPI | Railway/Render |
| **Database** | PostgreSQL | Neon or Supabase |
| **Cache** | Redis | Upstash |
| **CDN** | Edge caching for static assets | Vercel Edge |

**API Structure:**
```
/api
├── /auth          # Authentication endpoints
├── /users         # User profile management
├── /onboarding    # Onboarding flow data
├── /roadmap       # Roadmap generation & retrieval
├── /progress      # Progress tracking & updates
├── /billing       # Stripe subscription management
└── /analytics     # Event tracking endpoints
```

### 4.3 Technology Stack

| Component | Choice | Rationale |
|-----------|--------|-----------|
| **Frontend Framework** | React 18 + TypeScript | Industry standard; strong ecosystem |
| **Styling** | Tailwind CSS + Shadcn UI | Rapid development; consistent design |
| **State Management** | TanStack Query + Zustand | Server state + minimal client state |
| **Build Tool** | Vite | Fast HMR; modern bundling |
| **Backend Runtime** | Node.js 20 LTS | JS ecosystem alignment |
| **API Framework** | Express.js or Fastify | Lightweight; well-documented |
| **ORM** | Prisma | Type-safe queries; migration management |
| **Authentication** | Auth0 or Clerk | Managed auth; reduces complexity |
| **Payments** | Stripe | Industry standard; webhooks |
| **Analytics** | PostHog | Self-hostable; privacy-focused |
| **Error Tracking** | Sentry | Real-time error monitoring |

### 4.4 Testing Requirements

| Test Type | Coverage Target | Tools |
|-----------|-----------------|-------|
| **Unit Tests** | ≥70% critical paths | Vitest (frontend), Jest (backend) |
| **Integration Tests** | API endpoints | Supertest |
| **E2E Tests** | Core user flows | Playwright |
| **Visual Regression** | Component library | Chromatic (optional) |

**Critical Paths Requiring Tests:**
- User registration and authentication flow
- Onboarding completion and roadmap generation
- Module completion and progress calculation
- Subscription purchase and paywall enforcement
- Timeline recalculation logic

### 4.5 Database Schema Assumptions

**Core Entities:**
| Entity | Description |
|--------|-------------|
| `users` | User accounts with profile data |
| `onboarding_responses` | Current role, target role, time budget |
| `skills` | Skill definitions with prerequisites (DAG) |
| `roadmaps` | Generated personalized roadmaps |
| `modules` | Learning modules within roadmaps |
| `resources` | Curated learning resources |
| `progress` | User progress on modules/resources |
| `subscriptions` | Stripe subscription data |
| `events` | Analytics event log |

**DAG Implementation:** Skills stored as adjacency list with `skill_id` and `prerequisite_skill_id` columns for prerequisite relationships.

### 4.6 Third-Party Service Assumptions

| Service | Purpose | Fallback Strategy |
|---------|---------|-------------------|
| **Auth0/Clerk** | Authentication | Graceful error pages; no fallback auth |
| **Stripe** | Payments | Graceful degradation; manual billing option |
| **PostHog** | Analytics | Non-blocking; silent failure acceptable |
| **Sentry** | Error tracking | Non-blocking; logs to console |
| **SendGrid/Resend** | Email | Queue for retry; admin notification |

### 4.7 Environment Configuration

| Environment | Purpose | Database |
|-------------|---------|----------|
| **Development** | Local development | Local PostgreSQL or Docker |
| **Staging** | Pre-production testing | Separate Neon/Supabase instance |
| **Production** | Live users | Production Neon/Supabase instance |

**Configuration Management:** Environment variables via `.env` files locally, platform secrets (Vercel/Railway) in production. No hardcoded secrets in codebase.

### 4.8 Performance Assumptions

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Initial Page Load** | <2s (LCP) | Lighthouse |
| **Roadmap Generation** | <3s | API latency monitoring |
| **API Response (p95)** | <500ms | Datadog/PostHog |
| **Database Queries** | <100ms average | Query analysis |
| **Concurrent Users** | 1,000 without degradation | Load testing |

### 4.9 Deployment Assumptions

| Aspect | Approach |
|--------|----------|
| **CI/CD** | GitHub Actions |
| **Deployment Strategy** | Preview deploys on PRs; auto-deploy main to production |
| **Rollback** | Instant rollback via Vercel/Railway |
| **Feature Flags** | PostHog feature flags for gradual rollout |
| **Database Migrations** | Prisma migrate; run before deployment |

---

## 5. Epic List

### Epic Overview

| Epic | Name | Description | Priority | Functional Requirements |
|------|------|-------------|----------|------------------------|
| E0 | Technical Foundation | Monorepo setup, shared packages, testing infrastructure, CI/CD, auth middleware | P0 | Enables FR1-FR46 |
| E1 | User Authentication & Profile | User registration, login, password management, profile | P0 | FR1-FR5 |
| E2 | Onboarding & Skill Assessment | 3-step wizard capturing role, target, time budget, existing skills | P0 | FR6-FR10 |
| E3 | Roadmap Generation Engine | DAG-based gap analysis, path sequencing, time calculation | P0 | FR11-FR16 |
| E4 | Learning Dashboard & Navigation | Metro Map UI, module display, resource presentation | P0 | FR17-FR22 |
| E5 | Progress Tracking | Module completion, hours tracking, status indicators | P0 | FR23-FR28 |
| E6 | Schedule Recalculation | Weekly check-ins, timeline adjustment, recalculation | P1 | FR29-FR32 |
| E7 | Subscription & Billing | Stripe integration, Free/Pro tiers, paywall enforcement | P0 | FR33-FR39 |
| E8 | Content & Resources | Curated resource management, categorization, verification | P0 | FR40-FR43 |
| E9 | Analytics & Tracking | Event tracking, PostHog integration, feedback collection | P1 | FR44-FR46 |

### Epic Dependencies

```
                    E0 (Technical Foundation)
                              │
          ┌───────────────────┼───────────────────┐
          │                   │                   │
          ▼                   ▼                   ▼
     E1 (Auth)          E8 (Content)         E7 (Billing)
          │                   │                   │
          ▼                   │                   │
     E2 (Onboarding)          │                   │
          │                   │                   │
          └─────────┬─────────┘                   │
                    ▼                             │
            E3 (Roadmap Engine)                   │
                    │                             │
                    ▼                             │
            E4 (Dashboard) ◄──────────────────────┘
                    │         (Paywall enforcement)
                    ▼
            E5 (Progress)
                    │
                    ▼
            E6 (Recalculation)

E9 (Analytics) ────────► All Epics (cross-cutting)
```

**Note:** E0 must be completed before any other epic can begin. Once E0 is complete, E1, E7, and E8 can be developed in parallel.

### Priority Definitions

| Priority | Definition | Target |
|----------|------------|--------|
| **P0** | Must have for MVP launch | Sprint 1-4 |
| **P1** | Important for retention; can ship shortly after MVP | Sprint 5-6 |
| **P2** | Nice to have; post-MVP enhancement | Phase 2 |

### MVP Release Scope

**In Scope (P0):** E0, E1, E2, E3, E4, E5, E7, E8
**Fast Follow (P1):** E6, E9
**Out of Scope for MVP:** Study Buddies, Mobile Apps, Additional Career Paths

---

## 6. Epic Details

Epic details are maintained in separate sharded files for better maintainability:

| Epic | File | Status |
|------|------|--------|
| E0: Technical Foundation | [epic-0-technical-foundation.md](prd/epic-0-technical-foundation.md) | Draft |
| E1: User Authentication & Profile | [epic-1-authentication.md](prd/epic-1-authentication.md) | Draft |
| E2: Onboarding & Skill Assessment | [epic-2-onboarding.md](prd/epic-2-onboarding.md) | Draft |
| E3: Roadmap Generation Engine | [epic-3-roadmap-engine.md](prd/epic-3-roadmap-engine.md) | Draft |
| E4: Learning Dashboard & Navigation | [epic-4-dashboard.md](prd/epic-4-dashboard.md) | Draft |
| E5: Progress Tracking | [epic-5-progress.md](prd/epic-5-progress.md) | Draft |
| E6: Schedule Recalculation | [epic-6-recalculation.md](prd/epic-6-recalculation.md) | Draft |
| E7: Subscription & Billing | [epic-7-billing.md](prd/epic-7-billing.md) | Draft |
| E8: Content & Resources | [epic-8-content.md](prd/epic-8-content.md) | Draft |
| E9: Analytics & Tracking | [epic-9-analytics.md](prd/epic-9-analytics.md) | Draft |

---

## 7. Checklist Results Report

### PRD Completeness Checklist

| Section | Status | Notes |
|---------|--------|-------|
| Goals and Background | Complete | User, Business, Technical goals defined |
| Functional Requirements | Complete | 46 FRs covering all user flows |
| Non-Functional Requirements | Complete | 47 NFRs covering performance, security, accessibility |
| UI Design Goals | Complete | Vision, screens, design system defined |
| Technical Assumptions | Complete | Architecture, stack, testing, deployment |
| Epic List | Complete | 10 epics with dependencies and priorities |
| Epic Details | Complete | All 10 epics sharded with stories |

### Requirements Traceability

| Epic | Functional Requirements | Story Count |
|------|------------------------|-------------|
| E0: Technical Foundation | Enables FR1-FR46 | 12 stories |
| E1: Authentication | FR1-FR5 | 7 stories |
| E2: Onboarding | FR6-FR10 | 7 stories |
| E3: Roadmap Engine | FR11-FR16 | 7 stories |
| E4: Dashboard | FR17-FR22 | 8 stories |
| E5: Progress | FR23-FR28 | 8 stories |
| E6: Recalculation | FR29-FR32 | 7 stories |
| E7: Billing | FR33-FR39 | 9 stories |
| E8: Content | FR40-FR43 | 8 stories |
| E9: Analytics | FR44-FR46 | 8 stories |
| **Total** | **46 FRs** | **81 stories** |

### MVP Scope Summary

**In Scope:**
- Technical foundation (monorepo, CI/CD, testing)
- User authentication (email + Google OAuth)
- 3-step onboarding wizard
- DAG-based roadmap generation
- Metro Map dashboard with "Why This Matters"
- Progress tracking with timeline status
- Stripe subscription integration
- Backend Dev → ML Engineer curated content
- PostHog analytics integration

**Out of Scope for MVP:**
- Additional career paths
- Study buddy matching
- Native mobile apps
- ML-powered time estimation
- Content provider API integrations

### Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Time estimation accuracy | Medium | High | Start with conservative estimates; crowdsource corrections |
| External link breakage | Medium | Medium | Monthly verification; "last verified" badges |
| Low free-to-paid conversion | Medium | High | Optimize paywall placement; A/B test messaging |
| Competitor feature copy | Medium | Medium | Move fast; build community moat |
| Stripe integration complexity | Low | Medium | Use Stripe Checkout; proven patterns |

---

## 8. Next Steps

### Immediate Actions

1. **Architecture Review**
   - UX Expert to create detailed wireframes/mockups
   - Architect to finalize tech stack decisions
   - Create architecture document with data models

2. **Sprint Planning**
   - Break epics into sprint-sized stories
   - Estimate story points
   - Define Sprint 0 scope (E0 Technical Foundation - prerequisite to all)

3. **Content Curation**
   - Begin curating Backend Dev → ML Engineer resources
   - Create seed data for skills and prerequisites
   - Verify resource links and estimate times

### Phase 1 Implementation Order

| Sprint | Epics | Goal |
|--------|-------|------|
| Sprint 0 | E0 | Technical Foundation - monorepo, packages, testing, CI/CD |
| Sprint 1 | E1, E7, E8 (parallel) | Auth features, billing setup, content seeded |
| Sprint 2 | E2 | Onboarding flow |
| Sprint 3 | E3 | Roadmap engine with content integration |
| Sprint 4 | E4, E5 | Dashboard, progress tracking |
| Sprint 5 | E6, E9 | Recalculation, analytics |

**Note:** After Sprint 0, E1/E7/E8 can be developed in parallel by different developers since they share no dependencies beyond the foundation.

### Handoff Prompts

**For UX Expert:**
> Using this PRD as reference, create detailed wireframes for the following screens:
> 1. Landing page with value proposition
> 2. 3-step onboarding wizard
> 3. Path preview (free tier view)
> 4. Learning dashboard with Metro Map
> 5. Module detail with resources
> 6. Weekly check-in modal
> 7. Billing/subscription page
>
> Focus on the mobile-first responsive design and ensure WCAG 2.1 AA compliance.
> Reference Section 3 (UI Design Goals) for design system specifications.

**For Architect:**
> Using this PRD as reference, create the technical architecture document covering:
> 1. Finalize monorepo structure with Turborepo
> 2. Database schema with all entities from epic files
> 3. API specification (OpenAPI/Swagger)
> 4. Authentication flow with Auth0/Clerk
> 5. Stripe integration patterns
> 6. CI/CD pipeline design
> 7. Monitoring and observability setup
>
> Reference Section 4 (Technical Assumptions) for stack decisions.
> Ensure the DAG-based roadmap engine is properly designed for performance.

### Success Criteria Reminder

| Metric | Target | Measurement |
|--------|--------|-------------|
| Onboarding completion | >60% | Analytics |
| Phase 1 completion | >40% | Progress tracking |
| Time estimate accuracy | <20% variance | Actual vs estimated |
| Free-to-paid conversion | >5% | Billing data |
| Page load time | <2s | Lighthouse |
| Roadmap generation | <3s | API latency |

---

*Document generated with BMAD methodology*
