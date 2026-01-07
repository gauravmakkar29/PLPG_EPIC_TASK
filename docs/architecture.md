# PLPG Architecture Document

**Project:** Personalized Learning Path Generator (PLPG)
**Version:** 1.0.0
**Last Updated:** 2026-01-06
**Status:** Draft

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [High Level Architecture](#2-high-level-architecture)
3. [Tech Stack](#3-tech-stack)
4. [Data Models](#4-data-models)
5. [API Specification](#5-api-specification)
6. [Components](#6-components)
7. [External APIs](#7-external-apis)
8. [Core Workflows](#8-core-workflows)
9. [Database Schema](#9-database-schema)
10. [Frontend Architecture](#10-frontend-architecture)
11. [Backend Architecture](#11-backend-architecture)
12. [Project Structure](#12-project-structure)
13. [Development Workflow](#13-development-workflow)
14. [Deployment](#14-deployment)
15. [Security & Performance](#15-security--performance)
16. [Testing Strategy](#16-testing-strategy)
17. [Coding Standards](#17-coding-standards)
18. [Error Handling](#18-error-handling)
19. [Monitoring & Observability](#19-monitoring--observability)

---

## 1. Introduction

### 1.1 Project Overview

PLPG (Personalized Learning Path Generator) is a web application that helps backend developers transition to ML engineering roles through personalized, time-aware learning roadmaps. The platform uses a DAG-based skill dependency engine to generate optimized learning paths based on user constraints.

### 1.2 Architecture Type

**Greenfield** - New project with no existing codebase or infrastructure constraints.

### 1.3 Monorepo Strategy

**Turborepo** with pnpm workspaces for managing the fullstack application:

```
plpg/
├── apps/
│   ├── web/          # React frontend (Vite)
│   └── api/          # Express backend
├── packages/
│   ├── shared/       # Shared types, utilities
│   ├── ui/           # Shared UI components
│   └── roadmap-engine/  # DAG-based roadmap generation
├── infrastructure/   # IaC, Docker configs
└── docs/             # Documentation
```

### 1.4 Key Architectural Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Monorepo | Turborepo + pnpm | Type safety across apps, shared code, atomic commits |
| Frontend | React + Vite | Fast builds, ecosystem maturity, team familiarity |
| Backend | Express.js | Simplicity, middleware ecosystem, easy Stripe/Clerk integration |
| Database | PostgreSQL (Neon) | Relational data, ACID compliance, skill DAG queries |
| ORM | Prisma | Type-safe queries, migrations, excellent DX |
| Auth | Clerk | Managed auth, social logins, webhooks |
| Payments | Stripe | Industry standard, excellent docs, Checkout + Portal |
| Hosting | Vercel + Railway | Optimal for monorepo, serverless scaling |

---

## 2. High Level Architecture

### 2.1 System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              PLPG Architecture                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────┐     ┌─────────────┐     ┌─────────────┐                  │
│   │   Browser   │     │   Mobile    │     │   Tablet    │                  │
│   │   Client    │     │   Browser   │     │   Browser   │                  │
│   └──────┬──────┘     └──────┬──────┘     └──────┬──────┘                  │
│          │                   │                   │                          │
│          └───────────────────┼───────────────────┘                          │
│                              │                                              │
│                              ▼                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐  │
│   │                         Vercel Edge Network                          │  │
│   │                    (CDN, SSL, Edge Functions)                        │  │
│   └─────────────────────────────┬───────────────────────────────────────┘  │
│                                 │                                          │
│          ┌──────────────────────┼──────────────────────┐                   │
│          │                      │                      │                   │
│          ▼                      ▼                      ▼                   │
│   ┌─────────────┐       ┌─────────────┐       ┌─────────────┐             │
│   │   Vercel    │       │   Railway   │       │   Clerk     │             │
│   │  (Frontend) │◄─────►│  (Backend)  │◄─────►│   (Auth)    │             │
│   │  React SPA  │       │  Express.js │       │  Webhooks   │             │
│   └─────────────┘       └──────┬──────┘       └─────────────┘             │
│                                │                                          │
│          ┌─────────────────────┼─────────────────────┐                    │
│          │                     │                     │                    │
│          ▼                     ▼                     ▼                    │
│   ┌─────────────┐       ┌─────────────┐       ┌─────────────┐            │
│   │    Neon     │       │   Upstash   │       │   Stripe    │            │
│   │ PostgreSQL  │       │    Redis    │       │  Payments   │            │
│   │  (Primary)  │       │   (Cache)   │       │  Webhooks   │            │
│   └─────────────┘       └─────────────┘       └─────────────┘            │
│                                                                          │
│   ┌─────────────────────────────────────────────────────────────────┐    │
│   │                    Observability Layer                           │    │
│   │  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐  │    │
│   │  │ PostHog  │    │  Sentry  │    │  Resend  │    │ Railway  │  │    │
│   │  │Analytics │    │  Errors  │    │  Email   │    │  Logs    │  │    │
│   │  └──────────┘    └──────────┘    └──────────┘    └──────────┘  │    │
│   └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Infrastructure Components

| Component | Service | Purpose | Tier |
|-----------|---------|---------|------|
| Frontend Hosting | Vercel | React SPA, CDN, SSL | Pro |
| Backend Hosting | Railway | Express API, auto-scaling | Starter |
| Database | Neon | PostgreSQL, serverless | Launch |
| Cache | Upstash | Redis, rate limiting | Free |
| Auth | Clerk | User management | Free tier |
| Payments | Stripe | Subscriptions | Pay-as-you-go |
| Analytics | PostHog | Event tracking | Free tier |
| Errors | Sentry | Error tracking | Free tier |
| Email | Resend | Transactional email | Free tier |

### 2.3 Communication Patterns

- **Frontend ↔ Backend**: REST API over HTTPS with JSON payloads
- **Backend ↔ Database**: Prisma ORM with connection pooling
- **Backend ↔ Cache**: Redis for session data, rate limiting
- **External Services**: Webhooks (Clerk, Stripe) + REST APIs

---

## 3. Tech Stack

### 3.1 Complete Technology Matrix

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| **Frontend** |
| Framework | React | 18.x | UI library |
| Build Tool | Vite | 5.x | Fast builds, HMR |
| Language | TypeScript | 5.x | Type safety |
| Styling | Tailwind CSS | 3.x | Utility-first CSS |
| Components | Shadcn/ui | latest | Accessible components |
| State (Server) | TanStack Query | 5.x | Server state management |
| State (Client) | Zustand | 4.x | Client state management |
| Routing | React Router | 6.x | Client-side routing |
| Forms | React Hook Form | 7.x | Form handling |
| Validation | Zod | 3.x | Schema validation |
| Charts | Recharts | 2.x | Progress visualization |
| **Backend** |
| Runtime | Node.js | 20 LTS | JavaScript runtime |
| Framework | Express.js | 4.x | HTTP server |
| Language | TypeScript | 5.x | Type safety |
| ORM | Prisma | 5.x | Database access |
| Validation | Zod | 3.x | Request validation |
| **Database** |
| Primary | PostgreSQL | 15 | Relational data |
| Provider | Neon | serverless | Managed PostgreSQL |
| Cache | Redis | 7.x | Caching, rate limits |
| Provider | Upstash | serverless | Managed Redis |
| **Auth & Security** |
| Auth Provider | Clerk | latest | Authentication |
| Session | Clerk JWT | - | Token validation |
| Rate Limiting | express-rate-limit | 7.x | API protection |
| **Payments** |
| Provider | Stripe | latest | Subscriptions |
| Checkout | Stripe Checkout | - | Payment UI |
| Portal | Stripe Portal | - | Subscription management |
| **DevOps** |
| Monorepo | Turborepo | 2.x | Build orchestration |
| Package Manager | pnpm | 8.x | Fast, efficient |
| CI/CD | GitHub Actions | - | Automation |
| Containers | Docker | - | Local development |
| **Observability** |
| Analytics | PostHog | cloud | Event tracking |
| Errors | Sentry | cloud | Error monitoring |
| Logging | Pino | 8.x | Structured logs |
| **Testing** |
| Unit | Vitest | 1.x | Fast unit tests |
| Component | Testing Library | 14.x | React testing |
| E2E | Playwright | 1.x | Browser testing |
| API | Supertest | 6.x | HTTP testing |

### 3.2 Package Architecture

```
packages/
├── shared/           # @plpg/shared
│   ├── types/        # TypeScript interfaces
│   ├── constants/    # Shared constants
│   ├── utils/        # Utility functions
│   └── validation/   # Zod schemas
├── ui/               # @plpg/ui
│   ├── components/   # Shared React components
│   └── hooks/        # Shared React hooks
└── roadmap-engine/   # @plpg/roadmap-engine
    ├── dag/          # DAG operations
    ├── scheduler/    # Time calculation
    └── generator/    # Roadmap generation
```

---

## 4. Data Models

### 4.1 Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           PLPG Data Model                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌──────────────┐         ┌──────────────────┐         ┌──────────────┐   │
│   │     User     │────────►│OnboardingResponse│         │    Skill     │   │
│   ├──────────────┤   1:1   ├──────────────────┤         ├──────────────┤   │
│   │ id           │         │ id               │         │ id           │   │
│   │ clerkId      │         │ userId           │    ┌───►│ name         │   │
│   │ email        │         │ currentRole      │    │    │ phase        │   │
│   │ name         │         │ targetRole       │    │    │ estimatedHrs │   │
│   │ trialStart   │         │ weeklyHours      │    │    │ isOptional   │   │
│   │ trialEnd     │         │ skillsToSkip[]   │    │    └──────┬───────┘   │
│   └──────┬───────┘         └──────────────────┘    │           │           │
│          │                                          │           │ N:M       │
│          │ 1:1                                      │    ┌──────▼───────┐   │
│          │                                          │    │ SkillPrereq  │   │
│          ▼                                          │    ├──────────────┤   │
│   ┌──────────────┐         ┌──────────────────┐    │    │ skillId      │   │
│   │ Subscription │         │    Roadmap       │────┘    │ prerequisite │   │
│   ├──────────────┤    1:1  ├──────────────────┤         └──────────────┘   │
│   │ id           │◄────────│ id               │                            │
│   │ userId       │         │ userId           │         ┌──────────────┐   │
│   │ stripeSubId  │         │ weeklyHours      │         │   Resource   │   │
│   │ status       │         │ totalHours       │    ┌───►├──────────────┤   │
│   │ plan         │         │ projectedEnd     │    │    │ id           │   │
│   │ periodEnd    │         │ lastCheckin      │    │    │ skillId      │   │
│   └──────────────┘         └────────┬─────────┘    │    │ title        │   │
│                                     │              │    │ url          │   │
│                                     │ 1:N         │    │ type         │   │
│                                     ▼              │    │ source       │   │
│                            ┌──────────────────┐    │    │ minutes      │   │
│                            │  RoadmapModule   │────┘    │ qualityScore │   │
│                            ├──────────────────┤         └──────────────┘   │
│                            │ id               │                            │
│                            │ roadmapId        │         ┌──────────────┐   │
│                            │ skillId          │         │   Feedback   │   │
│                            │ resourceId       │         ├──────────────┤   │
│                            │ phase            │         │ id           │   │
│                            │ sequenceOrder    │         │ userId       │   │
│                            │ status           │         │ moduleId     │   │
│                            └────────┬─────────┘         │ rating       │   │
│                                     │                   │ comment      │   │
│                                     │ 1:1               └──────────────┘   │
│                                     ▼                                      │
│                            ┌──────────────────┐                            │
│                            │    Progress      │                            │
│                            ├──────────────────┤                            │
│                            │ id               │                            │
│                            │ moduleId         │                            │
│                            │ completedAt      │                            │
│                            │ timeSpent        │                            │
│                            └──────────────────┘                            │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

### 4.2 TypeScript Interfaces

```typescript
// packages/shared/src/types/user.ts
export interface User {
  id: string;
  clerkId: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  trialStartDate: Date;
  trialEndDate: Date;
  stripeCustomerId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// packages/shared/src/types/onboarding.ts
export interface OnboardingResponse {
  id: string;
  userId: string;
  currentRole: string;
  targetRole: string;
  weeklyHours: number;
  skillsToSkip: string[];
  completedAt: Date | null;
  createdAt: Date;
}

// packages/shared/src/types/skill.ts
export interface Skill {
  id: string;
  name: string;
  slug: string;
  description: string;
  phase: Phase;
  estimatedHours: number;
  isOptional: boolean;
  prerequisites: string[]; // skill IDs
  resources: Resource[];
}

export type Phase = 'foundation' | 'core_ml' | 'deep_learning';

// packages/shared/src/types/resource.ts
export interface Resource {
  id: string;
  skillId: string;
  title: string;
  url: string;
  type: ResourceType;
  source: string;
  estimatedMinutes: number;
  description: string | null;
  qualityScore: number | null;
  isRecommended: boolean;
  verifiedAt: Date | null;
}

export type ResourceType = 'video' | 'documentation' | 'tutorial' | 'mini_project';

// packages/shared/src/types/roadmap.ts
export interface Roadmap {
  id: string;
  userId: string;
  weeklyHours: number;
  totalHours: number;
  completedHours: number;
  projectedCompletion: Date;
  lastCheckinDate: Date | null;
  recalculationCount: number;
  createdAt: Date;
  updatedAt: Date;
  modules: RoadmapModule[];
}

export interface RoadmapModule {
  id: string;
  roadmapId: string;
  skillId: string;
  resourceId: string | null;
  phase: Phase;
  sequenceOrder: number;
  status: ModuleStatus;
  skill: Skill;
  resource: Resource | null;
  progress: Progress | null;
}

export type ModuleStatus = 'locked' | 'available' | 'in_progress' | 'completed' | 'skipped';

// packages/shared/src/types/progress.ts
export interface Progress {
  id: string;
  moduleId: string;
  startedAt: Date | null;
  completedAt: Date | null;
  timeSpentMinutes: number;
}

// packages/shared/src/types/subscription.ts
export interface Subscription {
  id: string;
  userId: string;
  stripeSubscriptionId: string;
  status: SubscriptionStatus;
  plan: SubscriptionPlan;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing' | 'unpaid';
export type SubscriptionPlan = 'free' | 'pro';

// packages/shared/src/types/checkin.ts
export interface Checkin {
  id: string;
  roadmapId: string;
  response: CheckinResponse;
  hoursLogged: number | null;
  createdAt: Date;
}

export type CheckinResponse = 'on_track' | 'got_ahead' | 'fell_behind' | 'skipped';

// packages/shared/src/types/feedback.ts
export interface Feedback {
  id: string;
  userId: string;
  moduleId: string;
  rating: number; // 1-5
  comment: string | null;
  createdAt: Date;
}
```

---

## 5. API Specification

### 5.1 API Overview

- **Base URL**: `https://api.plpg.dev/v1` (production) | `http://localhost:3001/v1` (development)
- **Authentication**: Bearer token (Clerk JWT)
- **Content-Type**: `application/json`
- **Rate Limiting**: 100 requests/minute per user

### 5.2 Endpoint Reference

#### Authentication Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/webhook` | Clerk webhook handler | Webhook signature |
| GET | `/auth/me` | Get current user | Required |
| DELETE | `/auth/account` | Delete user account | Required |

#### Onboarding Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/onboarding/status` | Check onboarding completion | Required |
| POST | `/onboarding/step/:step` | Submit onboarding step | Required |
| GET | `/onboarding/skills` | Get skills for assessment | Required |
| POST | `/onboarding/complete` | Complete onboarding, generate roadmap | Required |

#### Roadmap Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/roadmap` | Get user's roadmap with modules | Required |
| GET | `/roadmap/module/:id` | Get single module details | Required |
| GET | `/roadmap/progress` | Get progress summary | Required |
| POST | `/roadmap/recalculate` | Recalculate timeline | Required |
| GET | `/roadmap/recalculate/preview` | Preview recalculation | Required |

#### Progress Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/progress/module/:id/start` | Mark module as started | Required |
| POST | `/progress/module/:id/complete` | Mark module as complete | Required |
| POST | `/progress/resource/:id/click` | Track resource click | Required |

#### Check-in Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/checkin/status` | Check if check-in is due | Required |
| POST | `/checkin` | Submit weekly check-in | Required |
| GET | `/checkin/history` | Get check-in history | Required |

#### Billing Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/billing/status` | Get subscription status | Required |
| POST | `/billing/checkout` | Create Stripe Checkout session | Required |
| POST | `/billing/portal` | Create Stripe Portal session | Required |
| POST | `/billing/reactivate` | Reactivate canceled subscription | Required |
| POST | `/billing/webhook` | Stripe webhook handler | Webhook signature |

#### Feedback Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/feedback` | Submit module feedback | Required |
| GET | `/feedback/pending` | Check if feedback prompt due | Required |

#### Content Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/skills` | List all skills | Public |
| GET | `/skills/:id` | Get skill with resources | Public |
| GET | `/resources/:id` | Get resource details | Public |

### 5.3 Request/Response Examples

#### Create Checkout Session

```http
POST /v1/billing/checkout
Authorization: Bearer <token>
Content-Type: application/json

{
  "successUrl": "https://app.plpg.dev/dashboard?upgraded=true",
  "cancelUrl": "https://app.plpg.dev/pricing"
}
```

```json
{
  "checkoutUrl": "https://checkout.stripe.com/c/pay/cs_live_..."
}
```

#### Get Roadmap

```http
GET /v1/roadmap
Authorization: Bearer <token>
```

```json
{
  "id": "rm_abc123",
  "weeklyHours": 10,
  "totalHours": 150,
  "completedHours": 45,
  "projectedCompletion": "2026-06-15T00:00:00Z",
  "phases": [
    {
      "phase": "foundation",
      "name": "Foundation",
      "totalModules": 5,
      "completedModules": 3,
      "status": "in_progress",
      "modules": [
        {
          "id": "mod_xyz789",
          "skillId": "skill_python",
          "name": "Python for ML",
          "status": "completed",
          "estimatedHours": 8,
          "resource": {
            "id": "res_123",
            "title": "Python ML Fundamentals",
            "type": "video",
            "source": "YouTube"
          }
        }
      ]
    }
  ]
}
```

#### Submit Check-in

```http
POST /v1/checkin
Authorization: Bearer <token>
Content-Type: application/json

{
  "response": "fell_behind",
  "recalculationOption": "extend_deadline"
}
```

```json
{
  "success": true,
  "recalculation": {
    "previousCompletion": "2026-05-15T00:00:00Z",
    "newCompletion": "2026-06-01T00:00:00Z",
    "extensionWeeks": 2
  }
}
```

### 5.4 Error Response Format

```json
{
  "error": {
    "code": "SUBSCRIPTION_REQUIRED",
    "message": "Pro subscription required to access Phase 2 content",
    "status": 403,
    "details": {
      "requiredPlan": "pro",
      "currentPlan": "free"
    }
  }
}
```

---

## 6. Components

### 6.1 Frontend Component Architecture

```
apps/web/src/
├── components/
│   ├── common/              # Shared UI components
│   │   ├── Button/
│   │   ├── Card/
│   │   ├── Modal/
│   │   ├── Badge/
│   │   ├── Progress/
│   │   ├── Skeleton/
│   │   └── Toast/
│   ├── layout/              # Layout components
│   │   ├── Header/
│   │   ├── Sidebar/
│   │   ├── Footer/
│   │   └── PageContainer/
│   ├── auth/                # Auth-related components
│   │   ├── SignInButton/
│   │   ├── SignUpButton/
│   │   ├── UserButton/
│   │   └── ProtectedRoute/
│   ├── onboarding/          # Onboarding flow
│   │   ├── OnboardingLayout/
│   │   ├── StepIndicator/
│   │   ├── RoleSelector/
│   │   ├── HoursSlider/
│   │   ├── SkillAssessment/
│   │   └── OnboardingSummary/
│   ├── dashboard/           # Dashboard components
│   │   ├── ProgressOverview/
│   │   ├── PhaseCard/
│   │   ├── CurrentModule/
│   │   ├── StreakCounter/
│   │   ├── TimeEstimate/
│   │   └── QuickActions/
│   ├── roadmap/             # Roadmap components
│   │   ├── RoadmapView/
│   │   ├── PhaseSection/
│   │   ├── ModuleCard/
│   │   ├── ModuleDetail/
│   │   ├── ResourceList/
│   │   ├── ResourceCard/
│   │   └── LockedOverlay/
│   ├── progress/            # Progress tracking
│   │   ├── ProgressBar/
│   │   ├── CompletionModal/
│   │   ├── TimeSpentTracker/
│   │   └── MilestoneAlert/
│   ├── checkin/             # Weekly check-in
│   │   ├── CheckinPrompt/
│   │   ├── CheckinOptions/
│   │   ├── RecalculationModal/
│   │   └── AheadCelebration/
│   ├── billing/             # Subscription UI
│   │   ├── PaywallModal/
│   │   ├── PricingCard/
│   │   ├── BillingStatus/
│   │   ├── TrialBanner/
│   │   └── UpgradeButton/
│   └── feedback/            # Feedback collection
│       ├── FeedbackModal/
│       ├── StarRating/
│       └── FeedbackForm/
├── pages/                   # Route pages
│   ├── Landing/
│   ├── SignIn/
│   ├── SignUp/
│   ├── Onboarding/
│   ├── Dashboard/
│   ├── Roadmap/
│   ├── Module/
│   ├── Settings/
│   ├── Billing/
│   └── NotFound/
├── hooks/                   # Custom hooks
│   ├── useAuth.ts
│   ├── useRoadmap.ts
│   ├── useProgress.ts
│   ├── useSubscription.ts
│   ├── useCheckin.ts
│   └── useAnalytics.ts
├── services/               # API service layer
│   ├── api.ts              # Axios instance
│   ├── auth.service.ts
│   ├── roadmap.service.ts
│   ├── progress.service.ts
│   ├── billing.service.ts
│   └── checkin.service.ts
├── stores/                 # Zustand stores
│   ├── uiStore.ts          # UI state (modals, toasts)
│   ├── onboardingStore.ts  # Onboarding wizard state
│   └── checkinStore.ts     # Check-in flow state
└── lib/                    # Utilities
    ├── analytics.ts        # PostHog wrapper
    ├── utils.ts            # General utilities
    └── constants.ts        # App constants
```

### 6.2 Component Hierarchy Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         App (Root)                                   │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                    ClerkProvider                               │  │
│  │  ┌─────────────────────────────────────────────────────────┐  │  │
│  │  │                 QueryClientProvider                      │  │  │
│  │  │  ┌───────────────────────────────────────────────────┐  │  │  │
│  │  │  │                   Router                           │  │  │  │
│  │  │  │                                                    │  │  │  │
│  │  │  │   ┌─────────┐  ┌─────────────┐  ┌────────────┐   │  │  │  │
│  │  │  │   │ Landing │  │ Auth Pages  │  │ Protected  │   │  │  │  │
│  │  │  │   │  Page   │  │ SignIn/Up   │  │   Routes   │   │  │  │  │
│  │  │  │   └─────────┘  └─────────────┘  └─────┬──────┘   │  │  │  │
│  │  │  │                                       │          │  │  │  │
│  │  │  │                        ┌──────────────┴──────────┤  │  │  │
│  │  │  │                        │                         │  │  │  │
│  │  │  │                        ▼                         │  │  │  │
│  │  │  │              ┌─────────────────┐                 │  │  │  │
│  │  │  │              │   MainLayout    │                 │  │  │  │
│  │  │  │              │ ┌─────────────┐ │                 │  │  │  │
│  │  │  │              │ │   Header    │ │                 │  │  │  │
│  │  │  │              │ ├─────────────┤ │                 │  │  │  │
│  │  │  │              │ │             │ │                 │  │  │  │
│  │  │  │              │ │   Content   │ │                 │  │  │  │
│  │  │  │              │ │   Outlet    │ │                 │  │  │  │
│  │  │  │              │ │             │ │                 │  │  │  │
│  │  │  │              │ └─────────────┘ │                 │  │  │  │
│  │  │  │              └─────────────────┘                 │  │  │  │
│  │  │  │                                                  │  │  │  │
│  │  │  └──────────────────────────────────────────────────┘  │  │  │
│  │  └────────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

### 6.3 Backend Service Architecture

```
apps/api/src/
├── controllers/            # HTTP request handlers
│   ├── auth.controller.ts
│   ├── onboarding.controller.ts
│   ├── roadmap.controller.ts
│   ├── progress.controller.ts
│   ├── checkin.controller.ts
│   ├── billing.controller.ts
│   ├── feedback.controller.ts
│   └── content.controller.ts
├── services/               # Business logic
│   ├── user.service.ts
│   ├── onboarding.service.ts
│   ├── roadmap.service.ts
│   ├── progress.service.ts
│   ├── checkin.service.ts
│   ├── subscription.service.ts
│   ├── feedback.service.ts
│   └── analytics.service.ts
├── repositories/           # Data access layer
│   ├── user.repository.ts
│   ├── roadmap.repository.ts
│   ├── progress.repository.ts
│   ├── subscription.repository.ts
│   └── feedback.repository.ts
├── middleware/             # Express middleware
│   ├── auth.middleware.ts      # Clerk JWT validation
│   ├── subscription.middleware.ts  # Plan checks
│   ├── rateLimiter.middleware.ts
│   ├── errorHandler.middleware.ts
│   └── logger.middleware.ts
├── routes/                 # Route definitions
│   ├── index.ts
│   ├── auth.routes.ts
│   ├── onboarding.routes.ts
│   ├── roadmap.routes.ts
│   ├── progress.routes.ts
│   ├── checkin.routes.ts
│   ├── billing.routes.ts
│   ├── feedback.routes.ts
│   └── content.routes.ts
├── webhooks/               # Webhook handlers
│   ├── clerk.webhook.ts
│   └── stripe.webhook.ts
├── lib/                    # Utilities
│   ├── prisma.ts           # Prisma client instance
│   ├── redis.ts            # Redis client
│   ├── stripe.ts           # Stripe client
│   ├── clerk.ts            # Clerk client
│   ├── posthog.ts          # PostHog client
│   ├── resend.ts           # Email client
│   └── logger.ts           # Pino logger
├── validators/             # Zod schemas
│   ├── onboarding.validator.ts
│   ├── progress.validator.ts
│   ├── checkin.validator.ts
│   └── feedback.validator.ts
└── types/                  # Local types
    ├── express.d.ts        # Express augmentation
    └── env.d.ts            # Environment types
```

---

## 7. External APIs

### 7.1 Clerk (Authentication)

**Purpose**: User authentication, session management, social logins

**Integration Points**:
- Frontend: `@clerk/clerk-react` for UI components
- Backend: `@clerk/express` for JWT verification
- Webhooks: User lifecycle events

**Configuration**:
```typescript
// Frontend
import { ClerkProvider } from '@clerk/clerk-react';

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// Backend middleware
import { clerkMiddleware, requireAuth } from '@clerk/express';

app.use(clerkMiddleware());
```

**Webhook Events**:
- `user.created` - Create user record in database
- `user.updated` - Sync user data
- `user.deleted` - Cleanup user data

### 7.2 Stripe (Payments)

**Purpose**: Subscription billing, payment processing

**Integration Points**:
- Checkout Sessions for upgrades
- Customer Portal for management
- Webhooks for payment events

**Configuration**:
```typescript
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});
```

**Products/Prices**:
- Product: "PLPG Pro Subscription"
- Price: $29/month recurring

**Webhook Events**:
- `checkout.session.completed` - Activate subscription
- `customer.subscription.updated` - Sync status
- `customer.subscription.deleted` - Handle cancellation
- `invoice.payment_succeeded` - Record payment
- `invoice.payment_failed` - Handle failure

### 7.3 PostHog (Analytics)

**Purpose**: Product analytics, event tracking, user behavior

**Integration Points**:
- Frontend: `posthog-js` for client-side events
- Backend: `posthog-node` for server-side events

**Configuration**:
```typescript
// Frontend
import posthog from 'posthog-js';

posthog.init(import.meta.env.VITE_POSTHOG_KEY, {
  api_host: 'https://app.posthog.com',
  capture_pageview: true,
  respect_dnt: true,
});
```

**Key Events**:
- `signup_completed`, `onboarding_completed`
- `module_started`, `module_completed`
- `upgrade_clicked`, `subscription_started`
- `checkin_completed`, `feedback_submitted`

### 7.4 Sentry (Error Tracking)

**Purpose**: Error monitoring, performance tracking

**Configuration**:
```typescript
// Frontend
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  tracesSampleRate: 0.1,
});
```

### 7.5 Resend (Email)

**Purpose**: Transactional emails

**Email Types**:
- Welcome email (post-signup)
- Trial expiring (3 days before)
- Payment failed notification
- Weekly progress digest (optional)

**Configuration**:
```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: 'PLPG <noreply@plpg.dev>',
  to: user.email,
  subject: 'Welcome to PLPG!',
  html: welcomeEmailTemplate(user),
});
```

### 7.6 Environment Variables

```bash
# Clerk
VITE_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
CLERK_WEBHOOK_SECRET=whsec_...

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID=price_...
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...

# PostHog
VITE_POSTHOG_KEY=phc_...
POSTHOG_API_KEY=phx_...

# Sentry
VITE_SENTRY_DSN=https://...@sentry.io/...
SENTRY_DSN=https://...@sentry.io/...

# Resend
RESEND_API_KEY=re_...

# Database
DATABASE_URL=postgresql://...

# Redis
REDIS_URL=redis://...
```

---

## 8. Core Workflows

### 8.1 User Registration Flow

```
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
│ Browser │     │  Clerk  │     │   API   │     │   DB    │     │ PostHog │
└────┬────┘     └────┬────┘     └────┬────┘     └────┬────┘     └────┬────┘
     │               │               │               │               │
     │ Sign Up Form  │               │               │               │
     │──────────────>│               │               │               │
     │               │               │               │               │
     │ Create User   │               │               │               │
     │<──────────────│               │               │               │
     │               │               │               │               │
     │               │ Webhook:      │               │               │
     │               │ user.created  │               │               │
     │               │──────────────>│               │               │
     │               │               │               │               │
     │               │               │ Create User   │               │
     │               │               │ Set Trial     │               │
     │               │               │──────────────>│               │
     │               │               │               │               │
     │               │               │ Track:        │               │
     │               │               │ signup_completed               │
     │               │               │──────────────────────────────>│
     │               │               │               │               │
     │ Redirect to   │               │               │               │
     │ Onboarding    │               │               │               │
     │<──────────────│               │               │               │
     │               │               │               │               │
```

### 8.2 Onboarding Flow

```
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
│ Browser │     │   API   │     │   DB    │     │ Engine  │
└────┬────┘     └────┬────┘     └────┬────┘     └────┬────┘
     │               │               │               │
     │ Step 1:       │               │               │
     │ Current Role  │               │               │
     │──────────────>│               │               │
     │               │ Save Response │               │
     │               │──────────────>│               │
     │               │               │               │
     │ Step 2:       │               │               │
     │ Weekly Hours  │               │               │
     │──────────────>│               │               │
     │               │ Save Response │               │
     │               │──────────────>│               │
     │               │               │               │
     │ Step 3:       │               │               │
     │ Skip Skills   │               │               │
     │──────────────>│               │               │
     │               │ Save Response │               │
     │               │──────────────>│               │
     │               │               │               │
     │ Complete      │               │               │
     │ Onboarding    │               │               │
     │──────────────>│               │               │
     │               │ Get Responses │               │
     │               │<──────────────│               │
     │               │               │               │
     │               │ Generate      │               │
     │               │ Roadmap       │               │
     │               │──────────────────────────────>│
     │               │               │               │
     │               │               │ DAG Analysis  │
     │               │               │ Time Calc     │
     │               │<──────────────────────────────│
     │               │               │               │
     │               │ Save Roadmap  │               │
     │               │──────────────>│               │
     │               │               │               │
     │ Roadmap       │               │               │
     │ Generated     │               │               │
     │<──────────────│               │               │
     │               │               │               │
```

### 8.3 Module Completion Flow

```
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
│ Browser │     │   API   │     │   DB    │     │ PostHog │     │ Feedback│
└────┬────┘     └────┬────┘     └────┬────┘     └────┬────┘     └────┬────┘
     │               │               │               │               │
     │ Click         │               │               │               │
     │ Resource      │               │               │               │
     │──────────────>│               │               │               │
     │               │ Track Click   │               │               │
     │               │──────────────────────────────>│               │
     │               │               │               │               │
     │ [User learns] │               │               │               │
     │               │               │               │               │
     │ Mark Complete │               │               │               │
     │──────────────>│               │               │               │
     │               │               │               │               │
     │               │ Update        │               │               │
     │               │ Progress      │               │               │
     │               │──────────────>│               │               │
     │               │               │               │               │
     │               │ Recalculate   │               │               │
     │               │ Projections   │               │               │
     │               │──────────────>│               │               │
     │               │               │               │               │
     │               │ Track:        │               │               │
     │               │ module_completed              │               │
     │               │──────────────────────────────>│               │
     │               │               │               │               │
     │               │ Check if      │               │               │
     │               │ feedback due  │               │               │
     │               │──────────────────────────────────────────────>│
     │               │               │               │               │
     │ Show Feedback │               │               │               │
     │ Modal (1 in 3)│               │               │               │
     │<──────────────│               │               │               │
     │               │               │               │               │
```

### 8.4 Subscription Upgrade Flow

```
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
│ Browser │     │   API   │     │  Stripe │     │   DB    │     │ Webhook │
└────┬────┘     └────┬────┘     └────┬────┘     └────┬────┘     └────┬────┘
     │               │               │               │               │
     │ Click         │               │               │               │
     │ Upgrade       │               │               │               │
     │──────────────>│               │               │               │
     │               │               │               │               │
     │               │ Create        │               │               │
     │               │ Checkout      │               │               │
     │               │ Session       │               │               │
     │               │──────────────>│               │               │
     │               │               │               │               │
     │               │ Session URL   │               │               │
     │               │<──────────────│               │               │
     │               │               │               │               │
     │ Redirect to   │               │               │               │
     │ Stripe        │               │               │               │
     │<──────────────│               │               │               │
     │               │               │               │               │
     │ [User pays]   │               │               │               │
     │──────────────────────────────>│               │               │
     │               │               │               │               │
     │               │               │ Webhook:      │               │
     │               │               │ checkout.     │               │
     │               │               │ completed     │               │
     │               │               │──────────────────────────────>│
     │               │               │               │               │
     │               │               │               │ Update        │
     │               │               │               │ Subscription  │
     │               │               │               │<──────────────│
     │               │               │               │               │
     │ Redirect      │               │               │               │
     │ Success       │               │               │               │
     │<──────────────────────────────│               │               │
     │               │               │               │               │
```

### 8.5 Weekly Check-in Flow

```
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
│ Browser │     │   API   │     │   DB    │     │ Engine  │
└────┬────┘     └────┬────┘     └────┬────┘     └────┬────┘
     │               │               │               │
     │ Page Load     │               │               │
     │──────────────>│               │               │
     │               │ Check         │               │
     │               │ Checkin Due   │               │
     │               │──────────────>│               │
     │               │               │               │
     │ Show Checkin  │               │               │
     │ Modal         │               │               │
     │<──────────────│               │               │
     │               │               │               │
     │ "Fell Behind" │               │               │
     │──────────────>│               │               │
     │               │               │               │
     │               │ Preview       │               │               │
     │               │ Recalc        │               │               │
     │               │──────────────────────────────>│
     │               │               │               │
     │ Show Options  │               │               │
     │<──────────────│               │               │
     │               │               │               │
     │ "Extend       │               │               │
     │ Deadline"     │               │               │
     │──────────────>│               │               │
     │               │               │               │
     │               │ Apply         │               │
     │               │ Recalc        │               │
     │               │──────────────────────────────>│
     │               │               │               │
     │               │ Update        │               │
     │               │ Roadmap       │               │
     │               │──────────────>│               │
     │               │               │               │
     │ Confirmation  │               │               │
     │<──────────────│               │               │
     │               │               │               │
```

### 8.6 Roadmap Generation Flow (DAG Engine)

```
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
│ Service │     │  DAG    │     │Scheduler│     │   DB    │
└────┬────┘     └────┬────┘     └────┬────┘     └────┬────┘
     │               │               │               │
     │ Get Skills    │               │               │
     │ for Target    │               │               │
     │──────────────────────────────────────────────>│
     │               │               │               │
     │ Skills List   │               │               │
     │<──────────────────────────────────────────────│
     │               │               │               │
     │ Build DAG     │               │               │
     │──────────────>│               │               │
     │               │               │               │
     │               │ Add Nodes     │               │
     │               │ Add Edges     │               │
     │               │ (prereqs)     │               │
     │               │               │               │
     │ Remove        │               │               │
     │ Skipped       │               │               │
     │──────────────>│               │               │
     │               │               │               │
     │ Topological   │               │               │
     │ Sort          │               │               │
     │──────────────>│               │               │
     │               │               │               │
     │ Ordered       │               │               │
     │ Skills        │               │               │
     │<──────────────│               │               │
     │               │               │               │
     │ Calculate     │               │               │
     │ Timeline      │               │               │
     │──────────────────────────────>│               │
     │               │               │               │
     │               │ Weekly Hours  │               │
     │               │ Total Hours   │               │
     │               │ → Weeks       │               │
     │               │               │               │
     │ Timeline      │               │               │
     │<──────────────────────────────│               │
     │               │               │               │
     │ Create        │               │               │
     │ Roadmap +     │               │               │
     │ Modules       │               │               │
     │──────────────────────────────────────────────>│
     │               │               │               │
```

---

## 9. Database Schema

### 9.1 Prisma Schema

```prisma
// packages/shared/prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================
// USER MANAGEMENT
// ============================================

model User {
  id               String    @id @default(uuid())
  clerkId          String    @unique
  email            String    @unique
  name             String?
  avatarUrl        String?
  trialStartDate   DateTime  @default(now())
  trialEndDate     DateTime
  stripeCustomerId String?   @unique

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  onboarding   OnboardingResponse?
  roadmap      Roadmap?
  subscription Subscription?
  feedback     Feedback[]

  @@index([clerkId])
  @@index([email])
  @@map("users")
}

model OnboardingResponse {
  id           String   @id @default(uuid())
  userId       String   @unique
  currentRole  String
  targetRole   String   @default("ml_engineer")
  weeklyHours  Int
  skillsToSkip String[] @default([])
  completedAt  DateTime?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("onboarding_responses")
}

// ============================================
// SKILL & CONTENT MANAGEMENT
// ============================================

enum Phase {
  foundation
  core_ml
  deep_learning
}

model Skill {
  id             String  @id @default(uuid())
  name           String
  slug           String  @unique
  description    String
  phase          Phase
  estimatedHours Decimal @db.Decimal(4, 1)
  isOptional     Boolean @default(false)
  sequenceOrder  Int     @default(0)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  resources     Resource[]
  prerequisites SkillPrerequisite[] @relation("SkillPrereqs")
  dependents    SkillPrerequisite[] @relation("SkillDependents")
  modules       RoadmapModule[]

  @@index([phase])
  @@index([slug])
  @@map("skills")
}

model SkillPrerequisite {
  id             String @id @default(uuid())
  skillId        String
  prerequisiteId String

  skill        Skill @relation("SkillPrereqs", fields: [skillId], references: [id], onDelete: Cascade)
  prerequisite Skill @relation("SkillDependents", fields: [prerequisiteId], references: [id], onDelete: Cascade)

  @@unique([skillId, prerequisiteId])
  @@map("skill_prerequisites")
}

enum ResourceType {
  video
  documentation
  tutorial
  mini_project
}

model Resource {
  id               String       @id @default(uuid())
  skillId          String
  title            String
  url              String
  type             ResourceType
  source           String
  estimatedMinutes Int
  description      String?
  qualityScore     Decimal?     @db.Decimal(2, 1)
  isRecommended    Boolean      @default(false)
  verifiedAt       DateTime?
  sequenceOrder    Int          @default(0)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  skill   Skill           @relation(fields: [skillId], references: [id], onDelete: Cascade)
  modules RoadmapModule[]

  @@index([skillId])
  @@map("resources")
}

// ============================================
// ROADMAP & PROGRESS
// ============================================

model Roadmap {
  id                  String    @id @default(uuid())
  userId              String    @unique
  weeklyHours         Int
  totalHours          Decimal   @db.Decimal(6, 1)
  completedHours      Decimal   @default(0) @db.Decimal(6, 1)
  projectedCompletion DateTime
  lastCheckinDate     DateTime?
  recalculationCount  Int       @default(0)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user           User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  modules        RoadmapModule[]
  checkins       Checkin[]
  recalculations Recalculation[]

  @@map("roadmaps")
}

enum ModuleStatus {
  locked
  available
  in_progress
  completed
  skipped
}

model RoadmapModule {
  id            String       @id @default(uuid())
  roadmapId     String
  skillId       String
  resourceId    String?
  phase         Phase
  sequenceOrder Int
  status        ModuleStatus @default(locked)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  roadmap  Roadmap   @relation(fields: [roadmapId], references: [id], onDelete: Cascade)
  skill    Skill     @relation(fields: [skillId], references: [id])
  resource Resource? @relation(fields: [resourceId], references: [id])
  progress Progress?
  feedback Feedback[]

  @@unique([roadmapId, skillId])
  @@index([roadmapId])
  @@index([status])
  @@map("roadmap_modules")
}

model Progress {
  id               String    @id @default(uuid())
  moduleId         String    @unique
  startedAt        DateTime?
  completedAt      DateTime?
  timeSpentMinutes Int       @default(0)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  module RoadmapModule @relation(fields: [moduleId], references: [id], onDelete: Cascade)

  @@map("progress")
}

// ============================================
// SUBSCRIPTION & BILLING
// ============================================

enum SubscriptionStatus {
  active
  canceled
  past_due
  trialing
  unpaid
}

model Subscription {
  id                   String             @id @default(uuid())
  userId               String             @unique
  stripeSubscriptionId String             @unique
  status               SubscriptionStatus
  plan                 String             @default("pro")
  currentPeriodStart   DateTime
  currentPeriodEnd     DateTime
  cancelAtPeriodEnd    Boolean            @default(false)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([stripeSubscriptionId])
  @@map("subscriptions")
}

// ============================================
// CHECK-INS & RECALCULATION
// ============================================

enum CheckinResponse {
  on_track
  got_ahead
  fell_behind
  skipped
}

model Checkin {
  id          String          @id @default(uuid())
  roadmapId   String
  response    CheckinResponse
  hoursLogged Int?

  createdAt DateTime @default(now())

  roadmap Roadmap @relation(fields: [roadmapId], references: [id], onDelete: Cascade)

  @@index([roadmapId])
  @@map("checkins")
}

enum RecalculationReason {
  fell_behind
  got_ahead
  manual
  hours_changed
}

model Recalculation {
  id                     String               @id @default(uuid())
  roadmapId              String
  previousWeeklyHours    Int
  newWeeklyHours         Int
  previousCompletionDate DateTime
  newCompletionDate      DateTime
  reason                 RecalculationReason

  createdAt DateTime @default(now())

  roadmap Roadmap @relation(fields: [roadmapId], references: [id], onDelete: Cascade)

  @@index([roadmapId])
  @@map("recalculations")
}

// ============================================
// FEEDBACK & ANALYTICS
// ============================================

model Feedback {
  id       String  @id @default(uuid())
  userId   String
  moduleId String
  rating   Int
  comment  String?

  createdAt DateTime @default(now())

  user   User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  module RoadmapModule @relation(fields: [moduleId], references: [id], onDelete: Cascade)

  @@index([moduleId])
  @@index([userId])
  @@map("feedback")
}
```

### 9.2 Database Indexes

Key indexes for performance optimization:

| Table | Index | Purpose |
|-------|-------|---------|
| users | clerkId | Clerk webhook lookups |
| users | email | User lookup by email |
| skills | phase | Filter by learning phase |
| skills | slug | URL-friendly lookups |
| resources | skillId | Fetch resources per skill |
| roadmap_modules | roadmapId | Fetch all modules for roadmap |
| roadmap_modules | status | Filter by completion status |
| subscriptions | stripeSubscriptionId | Stripe webhook lookups |

---

## 10. Frontend Architecture

### 10.1 State Management Strategy

**TanStack Query** for server state:
- API data caching
- Automatic refetching
- Optimistic updates
- Background sync

**Zustand** for client state:
- UI state (modals, sidebars)
- Onboarding wizard steps
- Check-in flow state

```typescript
// Example: TanStack Query hook
export function useRoadmap() {
  return useQuery({
    queryKey: ['roadmap'],
    queryFn: () => roadmapService.getRoadmap(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Example: Zustand store
interface UIStore {
  isPaywallOpen: boolean;
  openPaywall: () => void;
  closePaywall: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  isPaywallOpen: false,
  openPaywall: () => set({ isPaywallOpen: true }),
  closePaywall: () => set({ isPaywallOpen: false }),
}));
```

### 10.2 Routing Structure

```typescript
// apps/web/src/routes.tsx
const routes = [
  // Public routes
  { path: '/', element: <Landing /> },
  { path: '/sign-in', element: <SignIn /> },
  { path: '/sign-up', element: <SignUp /> },

  // Protected routes
  {
    element: <ProtectedRoute />,
    children: [
      { path: '/onboarding', element: <Onboarding /> },
      { path: '/dashboard', element: <Dashboard /> },
      { path: '/roadmap', element: <Roadmap /> },
      { path: '/roadmap/module/:id', element: <ModuleDetail /> },
      { path: '/settings', element: <Settings /> },
      { path: '/billing', element: <Billing /> },
    ],
  },

  // Fallback
  { path: '*', element: <NotFound /> },
];
```

### 10.3 API Service Layer

```typescript
// apps/web/src/services/api.ts
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  const { getToken } = useAuth();
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

---

## 11. Backend Architecture

### 11.1 Layer Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                           Request Flow                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   HTTP Request                                                      │
│        │                                                            │
│        ▼                                                            │
│   ┌─────────────────────────────────────────────────────────────┐  │
│   │                      Middleware Layer                        │  │
│   │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌───────┐ │  │
│   │  │ Logger  │→│  Auth   │→│  Rate   │→│ Validate│→│ Error │ │  │
│   │  │         │ │ (Clerk) │ │ Limiter │ │  (Zod)  │ │Handler│ │  │
│   │  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └───────┘ │  │
│   └─────────────────────────────┬───────────────────────────────┘  │
│                                 │                                   │
│                                 ▼                                   │
│   ┌─────────────────────────────────────────────────────────────┐  │
│   │                     Controller Layer                         │  │
│   │  • Parse request parameters                                  │  │
│   │  • Call service methods                                      │  │
│   │  • Format HTTP responses                                     │  │
│   └─────────────────────────────┬───────────────────────────────┘  │
│                                 │                                   │
│                                 ▼                                   │
│   ┌─────────────────────────────────────────────────────────────┐  │
│   │                      Service Layer                           │  │
│   │  • Business logic                                            │  │
│   │  • Data transformation                                       │  │
│   │  • External API calls                                        │  │
│   │  • Transaction coordination                                  │  │
│   └─────────────────────────────┬───────────────────────────────┘  │
│                                 │                                   │
│                                 ▼                                   │
│   ┌─────────────────────────────────────────────────────────────┐  │
│   │                    Repository Layer                          │  │
│   │  • Database queries (Prisma)                                 │  │
│   │  • Cache operations (Redis)                                  │  │
│   │  • Data access abstraction                                   │  │
│   └─────────────────────────────────────────────────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 11.2 Middleware Pipeline

```typescript
// apps/api/src/app.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { clerkMiddleware } from '@clerk/express';
import { rateLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/logger';
import routes from './routes';

const app = express();

// Security
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL }));

// Parsing
app.use(express.json());

// Logging
app.use(requestLogger);

// Auth
app.use(clerkMiddleware());

// Rate limiting
app.use(rateLimiter);

// Routes
app.use('/v1', routes);

// Error handling (must be last)
app.use(errorHandler);

export default app;
```

### 11.3 Example Controller → Service → Repository Flow

```typescript
// Controller
export class ProgressController {
  async completeModule(req: Request, res: Response) {
    const { id } = req.params;
    const userId = req.auth.userId;

    const result = await progressService.completeModule(userId, id);
    res.json(result);
  }
}

// Service
export class ProgressService {
  async completeModule(userId: string, moduleId: string) {
    // Business logic
    const module = await roadmapRepository.getModule(moduleId);

    if (module.roadmap.userId !== userId) {
      throw new ForbiddenError('Not your module');
    }

    // Update progress
    await progressRepository.markComplete(moduleId);

    // Recalculate roadmap
    await roadmapService.updateCompletedHours(module.roadmapId);

    // Track analytics
    await analyticsService.track('module_completed', {
      moduleId,
      skillId: module.skillId,
    });

    return { success: true };
  }
}

// Repository
export class ProgressRepository {
  async markComplete(moduleId: string) {
    return prisma.progress.upsert({
      where: { moduleId },
      create: { moduleId, completedAt: new Date() },
      update: { completedAt: new Date() },
    });
  }
}
```

---

## 12. Project Structure

### 12.1 Complete Directory Tree

```
plpg/
├── apps/
│   ├── web/                          # React Frontend
│   │   ├── public/
│   │   │   └── favicon.ico
│   │   ├── src/
│   │   │   ├── components/           # UI Components
│   │   │   │   ├── common/
│   │   │   │   ├── layout/
│   │   │   │   ├── auth/
│   │   │   │   ├── onboarding/
│   │   │   │   ├── dashboard/
│   │   │   │   ├── roadmap/
│   │   │   │   ├── progress/
│   │   │   │   ├── checkin/
│   │   │   │   ├── billing/
│   │   │   │   └── feedback/
│   │   │   ├── pages/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   ├── stores/
│   │   │   ├── lib/
│   │   │   ├── styles/
│   │   │   ├── App.tsx
│   │   │   ├── main.tsx
│   │   │   └── routes.tsx
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   ├── tailwind.config.js
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── api/                          # Express Backend
│       ├── src/
│       │   ├── controllers/
│       │   ├── services/
│       │   ├── repositories/
│       │   ├── middleware/
│       │   ├── routes/
│       │   ├── webhooks/
│       │   ├── lib/
│       │   ├── validators/
│       │   ├── types/
│       │   ├── app.ts
│       │   └── server.ts
│       ├── tsconfig.json
│       └── package.json
│
├── packages/
│   ├── shared/                       # Shared Code
│   │   ├── src/
│   │   │   ├── types/
│   │   │   ├── constants/
│   │   │   ├── utils/
│   │   │   └── validation/
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   ├── migrations/
│   │   │   └── seed.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── ui/                           # Shared UI
│   │   ├── src/
│   │   │   ├── components/
│   │   │   └── hooks/
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── roadmap-engine/               # DAG Engine
│       ├── src/
│       │   ├── dag/
│       │   │   ├── graph.ts
│       │   │   ├── topological-sort.ts
│       │   │   └── cycle-detection.ts
│       │   ├── scheduler/
│       │   │   ├── time-calculator.ts
│       │   │   └── phase-organizer.ts
│       │   ├── generator/
│       │   │   └── roadmap-generator.ts
│       │   └── index.ts
│       ├── tsconfig.json
│       └── package.json
│
├── infrastructure/
│   ├── docker/
│   │   ├── docker-compose.yml
│   │   ├── docker-compose.dev.yml
│   │   └── Dockerfile.api
│   └── scripts/
│       ├── seed-content.ts
│       └── migrate.ts
│
├── docs/
│   ├── architecture.md
│   ├── api-spec.yaml
│   └── prd/
│
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
│
├── turbo.json
├── pnpm-workspace.yaml
├── package.json
├── .env.example
├── .gitignore
└── README.md
```

---

## 13. Development Workflow

### 13.1 Local Development Setup

```bash
# Clone and install
git clone https://github.com/your-org/plpg.git
cd plpg
pnpm install

# Setup environment
cp .env.example .env.local
# Fill in required values

# Start local services (PostgreSQL, Redis)
docker-compose -f infrastructure/docker/docker-compose.dev.yml up -d

# Run database migrations
pnpm db:migrate

# Seed development data
pnpm db:seed

# Start development servers
pnpm dev
```

### 13.2 Git Workflow

```
main
  │
  └── feature/PLPG-123-add-checkin-flow
        │
        ├── commit: feat(checkin): add weekly prompt modal
        ├── commit: feat(checkin): implement recalculation options
        └── commit: test(checkin): add unit tests for checkin service
```

**Branch naming**: `feature/PLPG-{ticket}-{short-description}`

**Commit format**: `type(scope): description`
- Types: feat, fix, refactor, test, docs, chore

### 13.3 Turborepo Commands

```json
{
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "test": "turbo test",
    "lint": "turbo lint",
    "db:migrate": "turbo db:migrate --filter=@plpg/shared",
    "db:seed": "turbo db:seed --filter=@plpg/shared",
    "db:studio": "turbo db:studio --filter=@plpg/shared"
  }
}
```

---

## 14. Deployment

### 14.1 Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Production Deployment                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   GitHub Repository                                                 │
│        │                                                            │
│        │ Push to main                                               │
│        ▼                                                            │
│   ┌─────────────────┐                                              │
│   │ GitHub Actions  │                                              │
│   │    CI/CD        │                                              │
│   └────────┬────────┘                                              │
│            │                                                        │
│            ├─────────────────────┬─────────────────────┐           │
│            │                     │                     │           │
│            ▼                     ▼                     ▼           │
│   ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐ │
│   │     Vercel      │   │    Railway      │   │      Neon       │ │
│   │   (Frontend)    │   │   (Backend)     │   │   (Database)    │ │
│   │                 │   │                 │   │                 │ │
│   │ • Auto preview  │   │ • Auto deploy   │   │ • Auto migrate  │ │
│   │ • Edge CDN      │   │ • Health checks │   │ • Branching     │ │
│   │ • Analytics     │   │ • Logging       │   │ • Pooling       │ │
│   └─────────────────┘   └─────────────────┘   └─────────────────┘ │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 14.2 Environment Configuration

| Environment | Frontend URL | API URL | Database |
|------------|--------------|---------|----------|
| Development | localhost:5173 | localhost:3001 | localhost:5432 |
| Preview | *.vercel.app | *.railway.app | Neon branch |
| Production | app.plpg.dev | api.plpg.dev | Neon main |

### 14.3 CI/CD Pipeline

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm lint

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm test

  build:
    runs-on: ubuntu-latest
    needs: [lint, test]
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm build
```

---

## 15. Security & Performance

### 15.1 Security Measures

| Category | Implementation |
|----------|----------------|
| Authentication | Clerk JWT tokens, secure session handling |
| Authorization | Role-based (free/pro), subscription middleware |
| Data Protection | TLS everywhere, encrypted at rest (Neon) |
| Input Validation | Zod schemas on all endpoints |
| Rate Limiting | 100 req/min per user, stricter on auth endpoints |
| CORS | Whitelist frontend origins only |
| Headers | Helmet.js security headers |
| Secrets | Environment variables, never in code |
| Payment Data | Stripe handles all PCI compliance |

### 15.2 Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Page Load (LCP) | < 2.5s | Core Web Vitals |
| API Response | < 500ms p95 | Railway metrics |
| Time to Interactive | < 3.5s | Lighthouse |
| Database Query | < 100ms p95 | Prisma metrics |
| Cache Hit Rate | > 80% | Redis metrics |

### 15.3 Optimization Strategies

**Frontend**:
- Code splitting by route
- Image optimization (next-gen formats)
- Resource prefetching
- Service worker caching

**Backend**:
- Connection pooling (Prisma)
- Redis caching for roadmaps
- Database query optimization
- Response compression

**Database**:
- Proper indexing (see Section 9.2)
- Query analysis with EXPLAIN
- Read replicas for analytics (future)

---

## 16. Testing Strategy

### 16.1 Testing Pyramid

```
                    ┌─────────────┐
                   │     E2E      │     5%
                  │   Playwright  │
                 └───────────────┘
               ┌─────────────────────┐
              │    Integration       │    25%
             │  API + Component     │
            └───────────────────────┘
         ┌─────────────────────────────┐
        │          Unit Tests          │    70%
       │   Vitest + Testing Library   │
      └─────────────────────────────────┘
```

### 16.2 Test Categories

| Type | Tool | Location | Coverage Target |
|------|------|----------|-----------------|
| Unit (Backend) | Vitest | `apps/api/src/**/*.test.ts` | 80% |
| Unit (Frontend) | Vitest | `apps/web/src/**/*.test.tsx` | 70% |
| Integration | Supertest | `apps/api/src/**/*.integration.ts` | Key flows |
| Component | Testing Library | `apps/web/src/**/*.test.tsx` | UI components |
| E2E | Playwright | `e2e/` | Critical paths |

### 16.3 Test Examples

```typescript
// Unit test (Service)
describe('RoadmapService', () => {
  it('should generate roadmap with correct phases', async () => {
    const result = await roadmapService.generate({
      userId: 'user_123',
      weeklyHours: 10,
      skillsToSkip: ['python-basics'],
    });

    expect(result.phases).toHaveLength(3);
    expect(result.totalHours).toBeGreaterThan(0);
  });
});

// Component test
describe('ModuleCard', () => {
  it('should show locked state for pro content when not subscribed', () => {
    render(
      <ModuleCard
        module={mockModule}
        phase="core_ml"
        isSubscribed={false}
      />
    );

    expect(screen.getByText(/upgrade to unlock/i)).toBeInTheDocument();
  });
});

// E2E test
test('complete module and see progress update', async ({ page }) => {
  await page.goto('/roadmap');
  await page.click('[data-testid="module-python-basics"]');
  await page.click('[data-testid="mark-complete"]');

  await expect(page.locator('[data-testid="progress-bar"]'))
    .toHaveAttribute('aria-valuenow', '10');
});
```

---

## 17. Coding Standards

### 17.1 TypeScript Configuration

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

### 17.2 ESLint Rules

```javascript
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'prettier',
  ],
  rules: {
    '@typescript-eslint/explicit-function-return-type': 'warn',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'no-console': ['warn', { allow: ['warn', 'error'] }],
  },
};
```

### 17.3 Code Conventions

**Naming**:
- Components: PascalCase (`ModuleCard.tsx`)
- Hooks: camelCase with `use` prefix (`useRoadmap.ts`)
- Services: camelCase with `.service` suffix (`roadmap.service.ts`)
- Types: PascalCase (`RoadmapModule`)
- Constants: SCREAMING_SNAKE_CASE (`MAX_WEEKLY_HOURS`)

**File Organization**:
- One component per file
- Colocate tests with source (`Component.tsx` + `Component.test.tsx`)
- Index files for clean exports

---

## 18. Error Handling

### 18.1 Error Types

```typescript
// packages/shared/src/errors/index.ts
export class AppError extends Error {
  constructor(
    public code: string,
    public message: string,
    public status: number,
    public details?: Record<string, unknown>
  ) {
    super(message);
  }
}

export class ValidationError extends AppError {
  constructor(details: Record<string, unknown>) {
    super('VALIDATION_ERROR', 'Invalid request data', 400, details);
  }
}

export class AuthenticationError extends AppError {
  constructor() {
    super('AUTHENTICATION_ERROR', 'Authentication required', 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Access denied') {
    super('FORBIDDEN', message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super('NOT_FOUND', `${resource} not found`, 404);
  }
}

export class SubscriptionRequiredError extends AppError {
  constructor() {
    super('SUBSCRIPTION_REQUIRED', 'Pro subscription required', 403, {
      requiredPlan: 'pro',
    });
  }
}
```

### 18.2 Error Handler Middleware

```typescript
// apps/api/src/middleware/errorHandler.ts
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Log error
  logger.error({
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // Report to Sentry
  Sentry.captureException(err);

  // Send response
  if (err instanceof AppError) {
    return res.status(err.status).json({
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
    });
  }

  // Unknown error
  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    },
  });
}
```

### 18.3 Frontend Error Boundaries

```typescript
// apps/web/src/components/ErrorBoundary.tsx
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import * as Sentry from '@sentry/react';

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="error-container">
      <h2>Something went wrong</h2>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  );
}

export function ErrorBoundary({ children }) {
  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error) => Sentry.captureException(error)}
    >
      {children}
    </ReactErrorBoundary>
  );
}
```

---

## 19. Monitoring & Observability

### 19.1 Logging Strategy

```typescript
// apps/api/src/lib/logger.ts
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => ({ level: label }),
  },
  transport: process.env.NODE_ENV === 'development'
    ? { target: 'pino-pretty' }
    : undefined,
});

// Usage
logger.info({ userId, action: 'module_completed' }, 'User completed module');
logger.error({ err, context }, 'Failed to process payment');
```

### 19.2 Observability Stack

| Tool | Purpose | Key Metrics |
|------|---------|-------------|
| **PostHog** | Product Analytics | User funnels, feature usage, retention |
| **Sentry** | Error Tracking | Error rates, stack traces, breadcrumbs |
| **Railway** | Infrastructure | CPU, memory, request latency |
| **Neon** | Database | Query performance, connections |
| **Upstash** | Redis | Cache hit rate, operations/sec |

### 19.3 Key Dashboards

**Product Health**:
- Daily active users (DAU)
- Signup → Onboarding completion rate
- Phase 1 completion rate (target: >40%)
- Free → Pro conversion rate (target: >5%)

**Technical Health**:
- API error rate (target: <1%)
- P95 response time (target: <500ms)
- Database query performance
- Stripe webhook success rate

### 19.4 Alerting Rules

| Condition | Severity | Action |
|-----------|----------|--------|
| Error rate > 5% | Critical | Page on-call |
| P95 latency > 2s | High | Slack alert |
| Database connections > 80% | High | Slack alert |
| Stripe webhook failures | Medium | Email alert |
| Daily signups drop > 50% | Medium | Email alert |

---

## Appendix A: Decision Log

| Date | Decision | Context | Outcome |
|------|----------|---------|---------|
| 2026-01-06 | Turborepo for monorepo | Need shared types, atomic deploys | Approved |
| 2026-01-06 | Clerk for auth | Managed auth reduces complexity | Approved |
| 2026-01-06 | Neon for database | Serverless PostgreSQL, branching | Approved |
| 2026-01-06 | Railway for backend | Simple deploy, good Turborepo support | Approved |
| 2026-01-06 | TanStack Query + Zustand | Server/client state separation | Approved |

---

## Appendix B: Glossary

| Term | Definition |
|------|------------|
| **DAG** | Directed Acyclic Graph - skill dependency structure |
| **Phase** | Learning stage (Foundation, Core ML, Deep Learning) |
| **Module** | Single learning unit in a roadmap |
| **Roadmap** | Personalized learning path for a user |
| **Check-in** | Weekly progress reflection prompt |
| **Recalculation** | Adjusting timeline based on progress |

---

*Architecture document generated with BMAD methodology*
