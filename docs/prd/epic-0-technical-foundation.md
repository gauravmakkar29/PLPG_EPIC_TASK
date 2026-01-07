# Epic 0: Technical Foundation

**Epic ID:** E0
**Priority:** P0 (Prerequisite to all other epics)
**Type:** Infrastructure / Developer Enablement
**Functional Requirements:** None (enables FR1-FR46)

---

## Epic Overview

Establish the "Golden Path" - a fully configured monorepo with standardized tooling, shared packages, testing infrastructure, and CI/CD pipelines. This foundation enables multiple developers to build Epics 1-9 in parallel with zero friction.

### Business Value
- Eliminates "works on my machine" issues from day one
- Reduces onboarding time for new developers to < 1 hour
- Prevents technical debt accumulation through enforced standards
- Enables parallel development across all feature epics
- Provides consistent patterns that scale with team growth

### Dependencies
- None (foundational epic)

### Dependents
- **ALL EPICS** depend on E0 completion
- E1-E9 cannot begin feature development until E0 is complete

### Definition of Done
- [ ] Any developer can clone repo and run `pnpm install && pnpm dev` successfully
- [ ] All shared packages build and export correctly
- [ ] Test suite runs with example tests passing
- [ ] CI pipeline passes on PR creation
- [ ] Pre-commit hooks enforce linting and type checking
- [ ] Auth middleware is importable and documented

---

## Technical Stories

### Story 0.1: Monorepo Initialization

**As a** developer
**I want** a properly configured Turborepo monorepo
**So that** I can work on any package with consistent tooling

**Acceptance Criteria:**
- [ ] Turborepo initialized with pnpm workspaces
- [ ] Root `package.json` with workspace scripts
- [ ] `turbo.json` configured with build/test/lint pipelines
- [ ] `.nvmrc` or `.node-version` specifying Node.js 20 LTS
- [ ] `pnpm-workspace.yaml` defining workspace packages

**Directory Structure:**
```
plpg/
├── apps/
│   ├── web/                    # React frontend (Vite)
│   └── api/                    # Express backend
├── packages/
│   ├── shared/                 # Shared types, utils, validation
│   │   ├── src/
│   │   │   ├── types/          # TypeScript interfaces
│   │   │   ├── constants/      # Shared constants
│   │   │   ├── utils/          # Utility functions
│   │   │   └── validation/     # Zod schemas
│   │   ├── prisma/             # Database schema & migrations
│   │   └── package.json
│   ├── ui/                     # Shared UI components
│   │   ├── src/
│   │   │   ├── components/     # Shadcn-based components
│   │   │   └── hooks/          # Shared React hooks
│   │   └── package.json
│   ├── config/                 # Shared configurations
│   │   ├── eslint/             # ESLint presets
│   │   ├── typescript/         # TSConfig bases
│   │   └── tailwind/           # Tailwind presets
│   └── roadmap-engine/         # DAG logic (future E3)
├── infrastructure/
│   ├── docker/
│   │   ├── docker-compose.yml
│   │   └── docker-compose.dev.yml
│   └── scripts/
├── docs/
├── .github/
│   └── workflows/
├── turbo.json
├── pnpm-workspace.yaml
├── package.json
└── README.md
```

**Tasks:**
1. Initialize Turborepo with `npx create-turbo@latest`
2. Configure pnpm workspaces
3. Create directory structure
4. Set up root scripts: `dev`, `build`, `test`, `lint`, `typecheck`
5. Configure Turbo caching and remote caching (optional)

---

### Story 0.2: Shared Configuration Package (@plpg/config)

**As a** developer
**I want** centralized configuration for ESLint, TypeScript, and Tailwind
**So that** all packages use identical standards

**Acceptance Criteria:**
- [ ] `@plpg/config` package created with exportable configs
- [ ] ESLint config with TypeScript, React, and Prettier rules
- [ ] Base `tsconfig.json` for all packages to extend
- [ ] Tailwind preset with PLPG design tokens

**Package Structure:**
```
packages/config/
├── eslint/
│   ├── base.js           # Base rules for all packages
│   ├── react.js          # React-specific rules (extends base)
│   └── node.js           # Node.js-specific rules (extends base)
├── typescript/
│   ├── base.json         # Strict TypeScript settings
│   ├── react.json        # React app settings
│   └── node.json         # Node.js app settings
├── tailwind/
│   └── preset.js         # Design tokens, colors, spacing
└── package.json
```

**ESLint Base Config:**
```javascript
// packages/config/eslint/base.js
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  plugins: ['@typescript-eslint'],
  rules: {
    '@typescript-eslint/explicit-function-return-type': 'warn',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'no-console': ['warn', { allow: ['warn', 'error'] }],
  },
};
```

**TypeScript Base Config:**
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true
  }
}
```

**Tasks:**
1. Create `packages/config` with subfolders
2. Define ESLint base, react, and node configs
3. Define TypeScript base configs
4. Define Tailwind preset with design tokens from PRD Section 3.4
5. Export all configs via package.json exports field

---

### Story 0.3: Shared Types & Utilities Package (@plpg/shared)

**As a** developer
**I want** shared TypeScript types and Zod schemas
**So that** frontend and backend use identical contracts

**Acceptance Criteria:**
- [ ] `@plpg/shared` package with all entity types
- [ ] Zod schemas for runtime validation
- [ ] Utility functions (date formatting, etc.)
- [ ] Constants (enums, magic strings)
- [ ] Package builds and exports correctly

**Package Structure:**
```
packages/shared/
├── src/
│   ├── types/
│   │   ├── user.ts
│   │   ├── onboarding.ts
│   │   ├── skill.ts
│   │   ├── resource.ts
│   │   ├── roadmap.ts
│   │   ├── progress.ts
│   │   ├── subscription.ts
│   │   ├── checkin.ts
│   │   ├── feedback.ts
│   │   └── index.ts
│   ├── validation/
│   │   ├── auth.schema.ts
│   │   ├── onboarding.schema.ts
│   │   ├── progress.schema.ts
│   │   └── index.ts
│   ├── constants/
│   │   ├── phases.ts
│   │   ├── subscription.ts
│   │   └── index.ts
│   ├── utils/
│   │   ├── date.ts
│   │   ├── format.ts
│   │   └── index.ts
│   └── index.ts
├── tsconfig.json
└── package.json
```

**Auth Validation Schemas (API Contract):**
```typescript
// packages/shared/src/validation/auth.schema.ts
import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain uppercase letter')
    .regex(/[0-9]/, 'Password must contain a number'),
  name: z.string().min(1).optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  rememberMe: z.boolean().optional().default(false),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/)
    .regex(/[0-9]/),
});

// Response types
export const authResponseSchema = z.object({
  user: z.object({
    id: z.string(),
    email: z.string(),
    name: z.string().nullable(),
    avatarUrl: z.string().nullable(),
    emailVerified: z.boolean(),
  }),
  token: z.string().optional(), // Only for non-httpOnly cookie flows
});

export const sessionSchema = z.object({
  userId: z.string(),
  email: z.string(),
  name: z.string().nullable(),
  subscriptionStatus: z.enum(['free', 'pro', 'trial']),
  trialEndsAt: z.string().datetime().nullable(),
});

// Type exports
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type AuthResponse = z.infer<typeof authResponseSchema>;
export type Session = z.infer<typeof sessionSchema>;
```

**Tasks:**
1. Create `packages/shared` with TypeScript configuration
2. Define all entity types from architecture.md
3. Create Zod schemas for validation
4. Export via barrel files
5. Verify package builds with `tsc`

---

### Story 0.4: Database Package with Prisma (@plpg/shared/prisma)

**As a** developer
**I want** a centralized Prisma schema and client
**So that** database access is consistent across the backend

**Acceptance Criteria:**
- [ ] Prisma schema defined with all entities
- [ ] Generated Prisma client exportable
- [ ] Migration scripts configured
- [ ] Seed script for development data
- [ ] Database URL configurable via environment

**Prisma Configuration:**
```prisma
// packages/shared/prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// See full schema in docs/architecture.md Section 9
```

**Seed Script:**
```typescript
// packages/shared/prisma/seed.ts
import { PrismaClient, Phase, ResourceType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Seed skills for Backend Dev → ML Engineer path
  const pythonBasics = await prisma.skill.create({
    data: {
      name: 'Python for ML',
      slug: 'python-ml',
      description: 'Python fundamentals for machine learning',
      phase: Phase.foundation,
      estimatedHours: 8,
      isOptional: true,
      sequenceOrder: 1,
    },
  });

  // ... more seed data
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

**Package Scripts:**
```json
{
  "scripts": {
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate dev",
    "db:migrate:prod": "prisma migrate deploy",
    "db:push": "prisma db push",
    "db:seed": "tsx prisma/seed.ts",
    "db:studio": "prisma studio"
  }
}
```

**Tasks:**
1. Add Prisma to `packages/shared`
2. Create complete schema from architecture.md
3. Create seed script with sample data
4. Configure Prisma client generation
5. Test migration workflow

---

### Story 0.5: Frontend App Scaffold (apps/web)

**As a** frontend developer
**I want** a configured React + Vite application
**So that** I can start building UI components immediately

**Acceptance Criteria:**
- [ ] Vite + React 18 + TypeScript configured
- [ ] Tailwind CSS with @plpg/config preset
- [ ] React Router v6 with route structure
- [ ] TanStack Query configured
- [ ] Zustand store scaffolded
- [ ] Clerk provider configured (env-based)
- [ ] ESLint + Prettier working

**Directory Structure:**
```
apps/web/
├── public/
│   └── favicon.ico
├── src/
│   ├── components/
│   │   └── .gitkeep
│   ├── pages/
│   │   ├── Landing.tsx
│   │   └── NotFound.tsx
│   ├── hooks/
│   │   └── .gitkeep
│   ├── services/
│   │   └── api.ts           # Axios instance with interceptors
│   ├── stores/
│   │   └── uiStore.ts       # Example Zustand store
│   ├── lib/
│   │   ├── queryClient.ts   # TanStack Query config
│   │   └── utils.ts
│   ├── styles/
│   │   └── globals.css
│   ├── App.tsx
│   ├── main.tsx
│   └── routes.tsx
├── index.html
├── vite.config.ts
├── tailwind.config.js       # Extends @plpg/config/tailwind
├── tsconfig.json            # Extends @plpg/config/typescript/react
├── .eslintrc.cjs            # Extends @plpg/config/eslint/react
└── package.json
```

**API Service Setup:**
```typescript
// apps/web/src/services/api.ts
import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/v1',
  withCredentials: true, // For httpOnly cookies
});

// Request interceptor for auth token (if not using cookies)
api.interceptors.request.use(async (config) => {
  // Clerk token injection handled by ClerkProvider
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login
      window.location.href = '/sign-in';
    }
    return Promise.reject(error);
  }
);
```

**Tasks:**
1. Create Vite + React app with `pnpm create vite`
2. Configure Tailwind with @plpg/config preset
3. Set up React Router with placeholder pages
4. Configure TanStack Query provider
5. Create Zustand store example
6. Set up API service with interceptors
7. Verify builds pass

---

### Story 0.6: Backend App Scaffold (apps/api)

**As a** backend developer
**I want** a configured Express + TypeScript application
**So that** I can start building API endpoints immediately

**Acceptance Criteria:**
- [ ] Express.js + TypeScript configured
- [ ] Layer architecture: controllers → services → repositories
- [ ] Prisma client imported from @plpg/shared
- [ ] Middleware pipeline configured
- [ ] Error handling middleware
- [ ] Health check endpoint working
- [ ] ESLint + Prettier working

**Directory Structure:**
```
apps/api/
├── src/
│   ├── controllers/
│   │   └── health.controller.ts
│   ├── services/
│   │   └── .gitkeep
│   ├── repositories/
│   │   └── .gitkeep
│   ├── middleware/
│   │   ├── auth.middleware.ts      # Clerk JWT validation
│   │   ├── errorHandler.middleware.ts
│   │   ├── rateLimiter.middleware.ts
│   │   ├── validate.middleware.ts  # Zod validation
│   │   └── logger.middleware.ts
│   ├── routes/
│   │   ├── index.ts
│   │   └── health.routes.ts
│   ├── lib/
│   │   ├── prisma.ts               # Prisma client instance
│   │   ├── logger.ts               # Pino logger
│   │   └── env.ts                  # Environment validation
│   ├── types/
│   │   └── express.d.ts            # Express augmentation
│   ├── app.ts
│   └── server.ts
├── tsconfig.json                   # Extends @plpg/config/typescript/node
├── .eslintrc.cjs                   # Extends @plpg/config/eslint/node
└── package.json
```

**Express App Setup:**
```typescript
// apps/api/src/app.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { clerkMiddleware } from '@clerk/express';
import { errorHandler } from './middleware/errorHandler.middleware';
import { requestLogger } from './middleware/logger.middleware';
import { rateLimiter } from './middleware/rateLimiter.middleware';
import routes from './routes';

const app = express();

// Security
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

// Parsing
app.use(express.json({ limit: '10kb' }));

// Logging
app.use(requestLogger);

// Auth (Clerk)
app.use(clerkMiddleware());

// Rate limiting
app.use(rateLimiter);

// Routes
app.use('/v1', routes);

// Error handling (must be last)
app.use(errorHandler);

export default app;
```

**Tasks:**
1. Create Express app scaffold
2. Configure TypeScript with tsx for development
3. Set up middleware pipeline
4. Create health check endpoint
5. Configure Prisma client import
6. Set up Pino logging
7. Verify `pnpm dev` runs server

---

### Story 0.7: Authentication Middleware (The Gatekeeper)

**As a** developer building protected features
**I want** reusable auth middleware
**So that** I can protect routes consistently

**Acceptance Criteria:**
- [ ] `requireAuth` middleware validates Clerk JWT
- [ ] `requireSubscription` middleware checks plan status
- [ ] User object attached to request
- [ ] Middleware exported from a single location
- [ ] TypeScript types for augmented Request

**Middleware Implementation:**
```typescript
// apps/api/src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { requireAuth as clerkRequireAuth, getAuth } from '@clerk/express';
import { prisma } from '../lib/prisma';
import { ForbiddenError, UnauthorizedError } from '@plpg/shared/errors';

// Augment Express Request
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        clerkId: string;
        email: string;
        subscriptionStatus: 'free' | 'trial' | 'pro';
        trialEndsAt: Date | null;
      };
    }
  }
}

/**
 * Validates Clerk JWT and attaches user to request
 * Usage: router.get('/protected', requireAuth, handler)
 */
export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      throw new UnauthorizedError();
    }

    // Fetch user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { subscription: true },
    });

    if (!user) {
      throw new UnauthorizedError();
    }

    // Determine subscription status
    let subscriptionStatus: 'free' | 'trial' | 'pro' = 'free';
    const now = new Date();

    if (user.subscription?.status === 'active') {
      subscriptionStatus = 'pro';
    } else if (user.trialEndDate && user.trialEndDate > now) {
      subscriptionStatus = 'trial';
    }

    req.user = {
      id: user.id,
      clerkId: user.clerkId,
      email: user.email,
      subscriptionStatus,
      trialEndsAt: user.trialEndDate,
    };

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Requires Pro subscription or active trial
 * Must be used AFTER requireAuth
 * Usage: router.get('/pro-feature', requireAuth, requirePro, handler)
 */
export const requirePro = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return next(new UnauthorizedError());
  }

  const { subscriptionStatus } = req.user;

  if (subscriptionStatus === 'free') {
    return next(new ForbiddenError('Pro subscription required'));
  }

  next();
};

/**
 * Requires specific phase access based on subscription
 * Phase 1 = Free (during trial), Phase 2-3 = Pro only
 */
export const requirePhaseAccess = (phase: number) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError());
    }

    const { subscriptionStatus } = req.user;

    // Phase 1 accessible to trial users
    if (phase === 1 && subscriptionStatus !== 'free') {
      return next();
    }

    // Phase 2+ requires Pro
    if (phase > 1 && subscriptionStatus !== 'pro') {
      return next(new ForbiddenError(`Phase ${phase} requires Pro subscription`));
    }

    next();
  };
};
```

**Export Index:**
```typescript
// apps/api/src/middleware/index.ts
export { requireAuth, requirePro, requirePhaseAccess } from './auth.middleware';
export { errorHandler } from './errorHandler.middleware';
export { validate } from './validate.middleware';
export { rateLimiter } from './rateLimiter.middleware';
```

**Tasks:**
1. Implement `requireAuth` middleware with Clerk
2. Implement `requirePro` subscription check
3. Implement `requirePhaseAccess` for content gating
4. Create TypeScript augmentation for Request
5. Export all middleware from index
6. Add JSDoc documentation

---

### Story 0.8: API Contract Definition

**As a** developer (frontend or backend)
**I want** a documented API contract
**So that** teams can work in parallel against the same specification

**Acceptance Criteria:**
- [ ] Auth endpoints documented with request/response types
- [ ] OpenAPI specification file created
- [ ] Zod schemas match OpenAPI spec
- [ ] Example requests included

**Auth API Contract:**

| Method | Endpoint | Request | Response | Auth |
|--------|----------|---------|----------|------|
| POST | `/v1/auth/register` | `RegisterInput` | `AuthResponse` | None |
| POST | `/v1/auth/login` | `LoginInput` | `AuthResponse` | None |
| POST | `/v1/auth/logout` | - | `{ success: true }` | Required |
| POST | `/v1/auth/forgot-password` | `{ email }` | `{ success: true }` | None |
| POST | `/v1/auth/reset-password` | `ResetPasswordInput` | `{ success: true }` | None |
| GET | `/v1/auth/me` | - | `Session` | Required |
| POST | `/v1/auth/webhook/clerk` | Clerk payload | `{ received: true }` | Webhook sig |

**Note:** With Clerk, most auth is handled client-side. The `/register` and `/login` endpoints may be proxies or handled entirely by Clerk. The key endpoints are:
- `/auth/me` - Get current session
- `/auth/webhook/clerk` - Sync user to database

**OpenAPI Snippet:**
```yaml
# docs/api-spec.yaml (partial)
openapi: 3.0.3
info:
  title: PLPG API
  version: 1.0.0
paths:
  /v1/auth/me:
    get:
      summary: Get current session
      security:
        - clerkAuth: []
      responses:
        '200':
          description: Current user session
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Session'
        '401':
          $ref: '#/components/responses/Unauthorized'
components:
  schemas:
    Session:
      type: object
      properties:
        userId:
          type: string
        email:
          type: string
        name:
          type: string
          nullable: true
        subscriptionStatus:
          type: string
          enum: [free, trial, pro]
        trialEndsAt:
          type: string
          format: date-time
          nullable: true
  securitySchemes:
    clerkAuth:
      type: http
      scheme: bearer
```

**Tasks:**
1. Create `docs/api-spec.yaml` OpenAPI document
2. Document all auth endpoints
3. Ensure Zod schemas match OpenAPI
4. Generate types from OpenAPI (optional)

---

### Story 0.9: Testing Infrastructure Setup

**As a** developer
**I want** a complete testing setup
**So that** I can write tests from day one

**Acceptance Criteria:**
- [ ] Vitest configured for all packages
- [ ] Test patterns documented
- [ ] Database mocking strategy defined
- [ ] API mocking with MSW configured
- [ ] Test utilities created (React render wrapper, DB seeder)
- [ ] Example tests for each layer

**Test Configuration:**
```typescript
// vitest.workspace.ts (root)
import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  'apps/web/vitest.config.ts',
  'apps/api/vitest.config.ts',
  'packages/shared/vitest.config.ts',
  'packages/roadmap-engine/vitest.config.ts',
]);
```

**Frontend Test Setup:**
```typescript
// apps/web/vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/test/'],
    },
  },
});
```

**Test Setup with Providers:**
```typescript
// apps/web/src/test/setup.ts
import '@testing-library/jest-dom';
import { beforeAll, afterAll, afterEach } from 'vitest';
import { server } from './mocks/server';

// MSW server lifecycle
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

**React Test Utilities:**
```typescript
// apps/web/src/test/utils.tsx
import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { ClerkProvider } from '@clerk/clerk-react';

// Create a fresh QueryClient for each test
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

interface WrapperProps {
  children: React.ReactNode;
}

function AllProviders({ children }: WrapperProps) {
  const queryClient = createTestQueryClient();

  return (
    <ClerkProvider publishableKey="pk_test_mock">
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          {children}
        </MemoryRouter>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { wrapper: AllProviders, ...options });
}

export * from '@testing-library/react';
export { customRender as render };
```

**Backend Test Setup:**
```typescript
// apps/api/vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
});
```

**Database Test Utilities:**
```typescript
// apps/api/src/test/db.ts
import { PrismaClient } from '@prisma/client';
import { mockDeep, DeepMockProxy } from 'vitest-mock-extended';

// Mock Prisma Client
export type MockPrismaClient = DeepMockProxy<PrismaClient>;

export const createMockPrisma = (): MockPrismaClient => {
  return mockDeep<PrismaClient>();
};

// For integration tests - use test database
export const createTestPrisma = () => {
  const testUrl = process.env.TEST_DATABASE_URL;
  if (!testUrl) {
    throw new Error('TEST_DATABASE_URL not set');
  }
  return new PrismaClient({
    datasources: { db: { url: testUrl } },
  });
};

// Database seeder for integration tests
export async function seedTestData(prisma: PrismaClient) {
  // Clean existing data
  await prisma.feedback.deleteMany();
  await prisma.progress.deleteMany();
  await prisma.roadmapModule.deleteMany();
  await prisma.roadmap.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.onboardingResponse.deleteMany();
  await prisma.user.deleteMany();

  // Create test user
  const user = await prisma.user.create({
    data: {
      clerkId: 'test_clerk_123',
      email: 'test@example.com',
      name: 'Test User',
      trialStartDate: new Date(),
      trialEndDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
  });

  return { user };
}
```

**MSW API Mocking:**
```typescript
// apps/web/src/test/mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/v1/auth/me', () => {
    return HttpResponse.json({
      userId: 'test_user_123',
      email: 'test@example.com',
      name: 'Test User',
      subscriptionStatus: 'trial',
      trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    });
  }),

  http.get('/v1/roadmap', () => {
    return HttpResponse.json({
      id: 'roadmap_123',
      phases: [],
      totalHours: 150,
      completedHours: 0,
    });
  }),
];

// apps/web/src/test/mocks/server.ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

**Test Directory Pattern:**
```
apps/web/src/
├── components/
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.test.tsx      # Co-located test
│   │   └── index.ts
├── test/
│   ├── mocks/
│   │   ├── handlers.ts
│   │   └── server.ts
│   ├── setup.ts
│   └── utils.tsx                # Custom render

apps/api/src/
├── services/
│   ├── user.service.ts
│   └── user.service.test.ts     # Co-located test
├── test/
│   ├── db.ts                    # Database utilities
│   ├── setup.ts
│   └── fixtures/                # Test data fixtures
```

**Tasks:**
1. Configure Vitest workspace at root
2. Set up frontend test environment with jsdom
3. Create React test utilities with providers
4. Set up backend test environment
5. Create Prisma mock utilities
6. Configure MSW for API mocking
7. Write example tests for each layer
8. Document test patterns in README

---

### Story 0.10: CI/CD Pipeline

**As a** developer
**I want** automated CI checks on every PR
**So that** code quality is enforced consistently

**Acceptance Criteria:**
- [ ] GitHub Actions workflow for CI
- [ ] Lint, typecheck, test jobs
- [ ] Build verification
- [ ] PR previews (Vercel)
- [ ] Branch protection rules documented

**CI Workflow:**
```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  lint:
    name: Lint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint

  typecheck:
    name: Type Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm typecheck

  test:
    name: Test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm test
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        if: always()

  build:
    name: Build
    runs-on: ubuntu-latest
    needs: [lint, typecheck, test]
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
```

**Tasks:**
1. Create `.github/workflows/ci.yml`
2. Configure lint job
3. Configure typecheck job
4. Configure test job with coverage
5. Configure build verification
6. Document branch protection rules

---

### Story 0.11: Pre-commit Hooks (Husky + lint-staged)

**As a** developer
**I want** pre-commit hooks to catch issues early
**So that** CI doesn't fail on trivial errors

**Acceptance Criteria:**
- [ ] Husky installed and configured
- [ ] lint-staged runs on staged files only
- [ ] Pre-commit: lint + typecheck staged files
- [ ] Pre-push: run tests (optional, can be slow)
- [ ] Commit message linting (Conventional Commits)

**Configuration:**
```json
// package.json (root)
{
  "scripts": {
    "prepare": "husky install"
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md,yaml,yml}": [
      "prettier --write"
    ]
  }
}
```

```bash
# .husky/pre-commit
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

pnpm lint-staged
```

```bash
# .husky/commit-msg
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

pnpm commitlint --edit $1
```

**Commitlint Config:**
```javascript
// commitlint.config.js
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'docs', 'style', 'refactor', 'test', 'chore', 'perf'],
    ],
    'scope-enum': [
      2,
      'always',
      ['web', 'api', 'shared', 'config', 'ui', 'engine', 'infra', 'deps'],
    ],
  },
};
```

**Tasks:**
1. Install husky and lint-staged
2. Configure pre-commit hook
3. Install and configure commitlint
4. Configure commit-msg hook
5. Document commit message format

---

### Story 0.12: Development Environment (Docker)

**As a** developer
**I want** a containerized local environment
**So that** I can run the full stack with `docker-compose up`

**Acceptance Criteria:**
- [ ] docker-compose.dev.yml for local development
- [ ] PostgreSQL container with volume
- [ ] Redis container
- [ ] Database auto-migration on startup
- [ ] Hot reload working for both apps

**Docker Compose:**
```yaml
# infrastructure/docker/docker-compose.dev.yml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: plpg
      POSTGRES_PASSWORD: plpg_dev_password
      POSTGRES_DB: plpg_dev
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U plpg']
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - '6379:6379'
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

**Environment Template:**
```bash
# .env.example
# Database
DATABASE_URL="postgresql://plpg:plpg_dev_password@localhost:5432/plpg_dev"
TEST_DATABASE_URL="postgresql://plpg:plpg_dev_password@localhost:5432/plpg_test"

# Redis
REDIS_URL="redis://localhost:6379"

# Clerk (get from dashboard.clerk.com)
CLERK_SECRET_KEY="sk_test_..."
VITE_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_WEBHOOK_SECRET="whsec_..."

# Stripe (get from dashboard.stripe.com)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
VITE_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# App
VITE_API_URL="http://localhost:3001/v1"
FRONTEND_URL="http://localhost:5173"
NODE_ENV="development"
```

**Tasks:**
1. Create docker-compose.dev.yml
2. Create .env.example with all variables
3. Document setup steps in README
4. Test full stack startup

---

## Implementation Sequence

### Phase 1: Repository Bootstrap (Stories 0.1-0.2)
**Goal:** Developers can clone and see the structure

| Order | Story | Output | Duration |
|-------|-------|--------|----------|
| 1 | 0.1 Monorepo Init | Working Turborepo | 2 hours |
| 2 | 0.2 Config Package | @plpg/config | 2 hours |

### Phase 2: Shared Packages (Stories 0.3-0.4)
**Goal:** Types and database ready for use

| Order | Story | Output | Duration |
|-------|-------|--------|----------|
| 3 | 0.3 Shared Package | @plpg/shared with types | 3 hours |
| 4 | 0.4 Database Package | Prisma schema + client | 3 hours |

### Phase 3: Application Scaffolds (Stories 0.5-0.6)
**Goal:** Both apps run and import shared packages

| Order | Story | Output | Duration |
|-------|-------|--------|----------|
| 5 | 0.5 Frontend Scaffold | apps/web running | 3 hours |
| 6 | 0.6 Backend Scaffold | apps/api running | 3 hours |

### Phase 4: Auth & Testing (Stories 0.7-0.9)
**Goal:** Auth middleware and testing infrastructure ready

| Order | Story | Output | Duration |
|-------|-------|--------|----------|
| 7 | 0.7 Auth Middleware | Gatekeeper functions | 3 hours |
| 8 | 0.8 API Contract | OpenAPI spec | 2 hours |
| 9 | 0.9 Testing Setup | Test infrastructure | 4 hours |

### Phase 5: DevOps (Stories 0.10-0.12)
**Goal:** CI/CD and local dev environment complete

| Order | Story | Output | Duration |
|-------|-------|--------|----------|
| 10 | 0.10 CI Pipeline | GitHub Actions | 2 hours |
| 11 | 0.11 Pre-commit Hooks | Husky + lint-staged | 1 hour |
| 12 | 0.12 Docker Setup | docker-compose.dev | 1 hour |

**Total Estimated Effort:** ~29 hours (4-5 dev days)

---

## Acceptance Testing Checklist

### Golden Path Verification

- [ ] Clone repo fresh: `git clone ... && cd plpg`
- [ ] Install: `pnpm install` completes without errors
- [ ] Start DB: `docker-compose -f infrastructure/docker/docker-compose.dev.yml up -d`
- [ ] Migrate: `pnpm db:migrate` creates tables
- [ ] Seed: `pnpm db:seed` populates test data
- [ ] Dev: `pnpm dev` starts both apps
- [ ] Frontend accessible at `http://localhost:5173`
- [ ] Backend health check: `curl http://localhost:3001/v1/health`
- [ ] Lint: `pnpm lint` passes
- [ ] Typecheck: `pnpm typecheck` passes
- [ ] Test: `pnpm test` runs with example tests passing
- [ ] Build: `pnpm build` succeeds
- [ ] Pre-commit hook blocks bad commit

### Developer Onboarding Test

- [ ] New developer can complete setup in < 1 hour
- [ ] README provides clear step-by-step instructions
- [ ] All environment variables documented
- [ ] No undocumented manual steps required

---

## Appendix: File Outputs Summary

| File | Purpose |
|------|---------|
| `turbo.json` | Turborepo pipeline config |
| `pnpm-workspace.yaml` | Workspace packages |
| `packages/config/*` | Shared configs |
| `packages/shared/*` | Types, validation, Prisma |
| `apps/web/*` | Frontend scaffold |
| `apps/api/*` | Backend scaffold |
| `apps/api/src/middleware/auth.middleware.ts` | The Gatekeeper |
| `.github/workflows/ci.yml` | CI pipeline |
| `.husky/*` | Pre-commit hooks |
| `infrastructure/docker/docker-compose.dev.yml` | Local dev environment |
| `docs/api-spec.yaml` | OpenAPI specification |

---

*Epic document generated with BMAD methodology*
