# Epic 1: User Authentication & Profile

**Epic ID:** E1
**Priority:** P0 (MVP)
**Functional Requirements:** FR1-FR5

---

## Epic Overview

Implement user authentication flows using Clerk, handle user lifecycle via webhooks, and provide profile management capabilities. This epic builds on E0's foundation (auth middleware, database schema, API structure) to deliver the user-facing authentication experience.

### Business Value
- Required for personalized learning paths
- Enables user retention tracking
- Foundation for subscription management
- First user touchpoint - critical for conversion

### Dependencies
- **E0: Technical Foundation** (REQUIRED)
  - Auth middleware (`requireAuth`, `requirePro`) from `apps/api/src/middleware/`
  - User schema from `packages/shared/prisma/schema.prisma`
  - Zod validation schemas from `packages/shared/src/validation/auth.schema.ts`
  - API service layer from `apps/web/src/services/api.ts`
  - Test utilities from E0's testing infrastructure

### Dependents
- E2: Onboarding requires authenticated user
- E7: Billing requires user identity (can develop in parallel)

---

## User Stories

### Story 1.1: Clerk Provider Integration

**As a** user visiting the application
**I want** authentication UI to be available
**So that** I can sign up or log in

**Acceptance Criteria:**
- [ ] ClerkProvider wraps the application in `apps/web/src/App.tsx`
- [ ] Environment variables configured: `VITE_CLERK_PUBLISHABLE_KEY`
- [ ] Sign-in and sign-up routes configured
- [ ] Redirect URLs set for post-auth navigation
- [ ] Loading state shown while Clerk initializes

**Technical Notes:**
```typescript
// apps/web/src/App.tsx
import { ClerkProvider } from '@clerk/clerk-react';

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

function App() {
  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </ClerkProvider>
  );
}
```

**Imports from E0:**
- QueryClient configuration from `apps/web/src/lib/queryClient.ts`

---

### Story 1.2: Sign Up Page (Email & Google)

**As a** new user
**I want to** create an account using email/password or Google
**So that** I can save my learning progress

**Acceptance Criteria:**
- [ ] `/sign-up` route renders Clerk SignUp component
- [ ] Email/password registration available
- [ ] "Continue with Google" OAuth button
- [ ] Password requirements enforced (8+ chars, 1 uppercase, 1 number)
- [ ] Email format validation
- [ ] Duplicate email shows clear error
- [ ] Success redirects to `/onboarding` (or `/dashboard` if onboarding complete)
- [ ] Analytics event: `signup_started`, `signup_completed`

**Technical Notes:**
```typescript
// apps/web/src/pages/SignUp.tsx
import { SignUp } from '@clerk/clerk-react';

export function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignUp
        path="/sign-up"
        routing="path"
        signInUrl="/sign-in"
        afterSignUpUrl="/onboarding"
        appearance={{
          elements: {
            rootBox: 'mx-auto',
            card: 'shadow-lg',
          },
        }}
      />
    </div>
  );
}
```

**Validation (from E0):**
- Use `registerSchema` from `@plpg/shared/validation`

---

### Story 1.3: Sign In Page

**As a** registered user
**I want to** log in with my credentials
**So that** I can access my personalized learning path

**Acceptance Criteria:**
- [ ] `/sign-in` route renders Clerk SignIn component
- [ ] Email/password login
- [ ] "Continue with Google" for OAuth users
- [ ] Invalid credentials show generic error (security)
- [ ] "Forgot password?" link available
- [ ] Success redirects to `/dashboard` (or `/onboarding` if incomplete)
- [ ] "Remember me" handled by Clerk session persistence
- [ ] Failed attempts: Clerk handles lockout (5 failures = 15 min)
- [ ] Analytics event: `login_completed`

**Technical Notes:**
```typescript
// apps/web/src/pages/SignIn.tsx
import { SignIn } from '@clerk/clerk-react';

export function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignIn
        path="/sign-in"
        routing="path"
        signUpUrl="/sign-up"
        afterSignInUrl="/dashboard"
      />
    </div>
  );
}
```

---

### Story 1.4: Clerk Webhook Handler

**As the** system
**I want to** sync Clerk user events to our database
**So that** user records exist for roadmaps, progress, and subscriptions

**Acceptance Criteria:**
- [ ] `POST /v1/auth/webhook/clerk` endpoint created
- [ ] Webhook signature verified using `CLERK_WEBHOOK_SECRET`
- [ ] Handle `user.created` event:
  - Create user record in database
  - Set `trialStartDate` to now
  - Set `trialEndDate` to now + 14 days
  - Track `signup_completed` event
- [ ] Handle `user.updated` event:
  - Sync name, email, avatar changes
- [ ] Handle `user.deleted` event:
  - Soft delete or cascade delete user data
- [ ] Return 200 for successful processing
- [ ] Return 400 for invalid signature

**Technical Notes:**
```typescript
// apps/api/src/webhooks/clerk.webhook.ts
import { Webhook } from 'svix';
import { WebhookEvent } from '@clerk/clerk-sdk-node';
import { prisma } from '../lib/prisma';

export async function handleClerkWebhook(req: Request, res: Response) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  // Verify signature
  const wh = new Webhook(WEBHOOK_SECRET);
  const payload = req.body;
  const headers = {
    'svix-id': req.headers['svix-id'] as string,
    'svix-timestamp': req.headers['svix-timestamp'] as string,
    'svix-signature': req.headers['svix-signature'] as string,
  };

  let evt: WebhookEvent;
  try {
    evt = wh.verify(JSON.stringify(payload), headers) as WebhookEvent;
  } catch (err) {
    return res.status(400).json({ error: 'Invalid signature' });
  }

  // Handle events
  switch (evt.type) {
    case 'user.created':
      await prisma.user.create({
        data: {
          clerkId: evt.data.id,
          email: evt.data.email_addresses[0].email_address,
          name: `${evt.data.first_name || ''} ${evt.data.last_name || ''}`.trim() || null,
          avatarUrl: evt.data.image_url,
          trialStartDate: new Date(),
          trialEndDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        },
      });
      break;

    case 'user.updated':
      await prisma.user.update({
        where: { clerkId: evt.data.id },
        data: {
          email: evt.data.email_addresses[0].email_address,
          name: `${evt.data.first_name || ''} ${evt.data.last_name || ''}`.trim() || null,
          avatarUrl: evt.data.image_url,
        },
      });
      break;

    case 'user.deleted':
      await prisma.user.delete({
        where: { clerkId: evt.data.id },
      });
      break;
  }

  return res.json({ received: true });
}
```

**Imports from E0:**
- Prisma client from `apps/api/src/lib/prisma.ts`

---

### Story 1.5: Protected Route Wrapper

**As a** developer
**I want** a frontend route guard component
**So that** unauthenticated users are redirected to sign-in

**Acceptance Criteria:**
- [ ] `ProtectedRoute` component created
- [ ] Checks Clerk authentication state
- [ ] Redirects to `/sign-in` if not authenticated
- [ ] Shows loading spinner while checking auth
- [ ] Passes through to children if authenticated
- [ ] Optional: Check onboarding completion, redirect to `/onboarding`

**Technical Notes:**
```typescript
// apps/web/src/components/auth/ProtectedRoute.tsx
import { useAuth, useUser } from '@clerk/clerk-react';
import { Navigate, Outlet } from 'react-router-dom';
import { useOnboardingStatus } from '../../hooks/useOnboardingStatus';
import { Spinner } from '@plpg/ui';

export function ProtectedRoute() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const { data: onboardingStatus, isLoading } = useOnboardingStatus();

  if (!isLoaded || isLoading) {
    return <Spinner />;
  }

  if (!isSignedIn) {
    return <Navigate to="/sign-in" replace />;
  }

  // Redirect to onboarding if not complete
  if (onboardingStatus && !onboardingStatus.completedAt) {
    return <Navigate to="/onboarding" replace />;
  }

  return <Outlet />;
}
```

**Imports from E0:**
- Spinner component from `@plpg/ui`

---

### Story 1.6: Get Current Session Endpoint

**As a** frontend application
**I want** an API endpoint to get the current user session
**So that** I can display user info and subscription status

**Acceptance Criteria:**
- [ ] `GET /v1/auth/me` endpoint created
- [ ] Requires authentication (uses `requireAuth` from E0)
- [ ] Returns user data with subscription status
- [ ] Returns 401 if not authenticated
- [ ] Response matches `Session` schema from E0

**Technical Notes:**
```typescript
// apps/api/src/controllers/auth.controller.ts
import { Request, Response } from 'express';
import { Session } from '@plpg/shared/types';

export async function getMe(req: Request, res: Response) {
  // req.user populated by requireAuth middleware from E0
  const { id, email, name, subscriptionStatus, trialEndsAt } = req.user!;

  const session: Session = {
    userId: id,
    email,
    name,
    subscriptionStatus,
    trialEndsAt: trialEndsAt?.toISOString() ?? null,
  };

  res.json(session);
}

// apps/api/src/routes/auth.routes.ts
import { Router } from 'express';
import { requireAuth } from '../middleware';
import { getMe } from '../controllers/auth.controller';

const router = Router();

router.get('/me', requireAuth, getMe);

export default router;
```

**Imports from E0:**
- `requireAuth` middleware from `apps/api/src/middleware/`
- `Session` type from `@plpg/shared/types`

---

### Story 1.7: User Profile Page

**As a** logged-in user
**I want to** view and edit my profile
**So that** I can keep my information accurate

**Acceptance Criteria:**
- [ ] `/settings/profile` route created
- [ ] Display: name, email, avatar, account created date
- [ ] Edit name using Clerk UserProfile component or custom form
- [ ] Avatar managed by Clerk
- [ ] Show subscription status badge (Free/Trial/Pro)
- [ ] Show trial expiration date if applicable
- [ ] Link to billing settings

**Technical Notes:**
```typescript
// apps/web/src/pages/Settings/Profile.tsx
import { useUser } from '@clerk/clerk-react';
import { useSession } from '../../hooks/useSession';
import { Card, Badge, Avatar } from '@plpg/ui';

export function ProfilePage() {
  const { user } = useUser();
  const { data: session } = useSession();

  return (
    <Card>
      <div className="flex items-center gap-4">
        <Avatar src={user?.imageUrl} alt={user?.fullName || 'User'} />
        <div>
          <h2>{user?.fullName}</h2>
          <p className="text-muted">{user?.primaryEmailAddress?.emailAddress}</p>
          <Badge variant={session?.subscriptionStatus}>
            {session?.subscriptionStatus === 'pro' ? 'Pro' :
             session?.subscriptionStatus === 'trial' ? 'Trial' : 'Free'}
          </Badge>
        </div>
      </div>

      {session?.subscriptionStatus === 'trial' && session.trialEndsAt && (
        <p className="mt-4 text-sm text-amber-600">
          Trial ends: {new Date(session.trialEndsAt).toLocaleDateString()}
        </p>
      )}
    </Card>
  );
}
```

**Imports from E0:**
- UI components from `@plpg/ui`

---

### Story 1.8: Sign Out Flow

**As a** logged-in user
**I want to** sign out of my account
**So that** I can secure my session on shared devices

**Acceptance Criteria:**
- [ ] Sign out button in header/settings
- [ ] Calls Clerk `signOut()` method
- [ ] Clears local state (TanStack Query cache, Zustand stores)
- [ ] Redirects to landing page or sign-in
- [ ] Analytics event: `logout_completed`

**Technical Notes:**
```typescript
// apps/web/src/components/auth/SignOutButton.tsx
import { useClerk } from '@clerk/clerk-react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Button } from '@plpg/ui';

export function SignOutButton() {
  const { signOut } = useClerk();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    queryClient.clear(); // Clear all cached data
    navigate('/');
  };

  return (
    <Button variant="ghost" onClick={handleSignOut}>
      Sign Out
    </Button>
  );
}
```

---

### Story 1.9: Password Reset Flow

**As a** user who forgot my password
**I want to** reset my password via email
**So that** I can regain access to my account

**Acceptance Criteria:**
- [ ] "Forgot password?" link on sign-in page
- [ ] Clerk handles entire reset flow
- [ ] Email sent with reset link
- [ ] New password must meet requirements
- [ ] Success redirects to sign-in with success message
- [ ] Rate limiting handled by Clerk

**Technical Notes:**
- Clerk's `<SignIn />` component includes forgot password flow
- No custom implementation needed
- Ensure Clerk dashboard has email templates configured

---

### Story 1.10: Email Verification Handling

**As a** user who registered with email
**I want to** verify my email address
**So that** I can access full features

**Acceptance Criteria:**
- [ ] Clerk sends verification email automatically
- [ ] Unverified users see banner prompting verification
- [ ] Resend verification email button available
- [ ] After verification, banner disappears
- [ ] Unverified users can browse but see limited content

**Technical Notes:**
```typescript
// apps/web/src/components/auth/EmailVerificationBanner.tsx
import { useUser } from '@clerk/clerk-react';
import { Alert, Button } from '@plpg/ui';

export function EmailVerificationBanner() {
  const { user } = useUser();
  const primaryEmail = user?.primaryEmailAddress;

  if (!primaryEmail || primaryEmail.verification.status === 'verified') {
    return null;
  }

  const handleResend = async () => {
    await primaryEmail.prepareVerification({ strategy: 'email_link' });
  };

  return (
    <Alert variant="warning">
      Please verify your email address.
      <Button size="sm" onClick={handleResend}>
        Resend verification email
      </Button>
    </Alert>
  );
}
```

---

### Story 1.11: Session Hook for Frontend

**As a** frontend developer
**I want** a React hook to access session data
**So that** I can conditionally render based on auth/subscription state

**Acceptance Criteria:**
- [ ] `useSession` hook created
- [ ] Uses TanStack Query to fetch `/v1/auth/me`
- [ ] Caches session data appropriately
- [ ] Refetches on window focus
- [ ] Returns loading, error, and data states

**Technical Notes:**
```typescript
// apps/web/src/hooks/useSession.ts
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-react';
import { api } from '../services/api';
import { Session } from '@plpg/shared/types';

export function useSession() {
  const { isSignedIn, getToken } = useAuth();

  return useQuery<Session>({
    queryKey: ['session'],
    queryFn: async () => {
      const token = await getToken();
      const response = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    enabled: isSignedIn,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true,
  });
}
```

**Imports from E0:**
- API service from `apps/web/src/services/api.ts`
- `Session` type from `@plpg/shared/types`

---

## API Endpoints Summary

| Method | Endpoint | Description | Auth | Handler |
|--------|----------|-------------|------|---------|
| GET | `/v1/auth/me` | Get current session | Required | `auth.controller.getMe` |
| POST | `/v1/auth/logout` | End session (optional) | Required | Clerk handles |
| POST | `/v1/auth/webhook/clerk` | Clerk webhook handler | Webhook sig | `clerk.webhook.handler` |

**Note:** Most auth endpoints (register, login, password reset) are handled entirely by Clerk's frontend components and don't require custom API routes.

---

## Non-Functional Requirements Mapping

| NFR | Requirement | Implementation |
|-----|-------------|----------------|
| NFR11 | TLS 1.3 encryption | Clerk handles; Vercel/Railway enforce HTTPS |
| NFR13 | bcrypt hashing | Clerk default |
| NFR14 | 24hr token expiry | Clerk session configuration |
| NFR15 | Rate limiting | Clerk handles auth endpoints; E0 middleware for API |
| NFR18 | Auth event logging | PostHog tracking + Clerk audit log |

---

## Testing Requirements

### Unit Tests
```typescript
// apps/api/src/controllers/auth.controller.test.ts
import { describe, it, expect, vi } from 'vitest';
import { getMe } from './auth.controller';
import { createMockRequest, createMockResponse } from '../test/utils';

describe('AuthController', () => {
  describe('getMe', () => {
    it('returns session data for authenticated user', async () => {
      const req = createMockRequest({
        user: {
          id: 'user_123',
          email: 'test@example.com',
          name: 'Test User',
          subscriptionStatus: 'trial',
          trialEndsAt: new Date('2025-02-01'),
        },
      });
      const res = createMockResponse();

      await getMe(req, res);

      expect(res.json).toHaveBeenCalledWith({
        userId: 'user_123',
        email: 'test@example.com',
        name: 'Test User',
        subscriptionStatus: 'trial',
        trialEndsAt: '2025-02-01T00:00:00.000Z',
      });
    });
  });
});
```

### Integration Tests
```typescript
// apps/api/src/routes/auth.routes.integration.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../app';
import { seedTestData, createTestPrisma } from '../test/db';

describe('Auth Routes', () => {
  const prisma = createTestPrisma();

  beforeAll(async () => {
    await seedTestData(prisma);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('GET /v1/auth/me', () => {
    it('returns 401 without auth token', async () => {
      const response = await request(app).get('/v1/auth/me');
      expect(response.status).toBe(401);
    });

    // Integration test with mock Clerk token would go here
  });
});
```

### Component Tests
```typescript
// apps/web/src/components/auth/ProtectedRoute.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../../test/utils';
import { ProtectedRoute } from './ProtectedRoute';

vi.mock('@clerk/clerk-react', () => ({
  useAuth: () => ({ isLoaded: true, isSignedIn: false }),
  useUser: () => ({ user: null }),
}));

describe('ProtectedRoute', () => {
  it('redirects to sign-in when not authenticated', () => {
    render(<ProtectedRoute />);
    // Assert redirect behavior
  });
});
```

---

## Acceptance Testing Checklist

- [ ] New user can register with email/password via Clerk
- [ ] New user can register with Google OAuth via Clerk
- [ ] Clerk webhook creates user in database with trial dates
- [ ] Existing user can log in
- [ ] Password reset flow works via Clerk
- [ ] Profile page displays user info and subscription status
- [ ] Sign out clears session and redirects
- [ ] Protected routes redirect unauthenticated users
- [ ] `useSession` hook returns correct data
- [ ] Email verification banner shows for unverified users
- [ ] Rate limiting prevents brute force (Clerk handles)

---

## Definition of Done

- [ ] All 11 stories implemented and passing tests
- [ ] Clerk provider integrated in frontend
- [ ] Webhook handler syncing users to database
- [ ] `requireAuth` middleware (from E0) working on protected endpoints
- [ ] `useSession` hook available for frontend components
- [ ] Unit tests: >80% coverage on auth controller
- [ ] Integration tests: webhook handler tested
- [ ] Component tests: ProtectedRoute tested
- [ ] Analytics events firing for auth actions
- [ ] No console errors in browser
- [ ] Accessible (keyboard navigation, screen reader friendly)

---

*Epic document generated with BMAD methodology*
