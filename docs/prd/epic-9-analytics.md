# Epic 9: Analytics & Tracking

**Epic ID:** E9
**Priority:** P1 (Fast Follow)
**Functional Requirements:** FR44-FR46

---

## Epic Overview

Implement comprehensive event tracking to understand user behavior, validate product hypotheses, and improve time estimation accuracy. Integrates with PostHog/Mixpanel for funnel analysis and collects optional user feedback.

### Business Value
- Data-driven product decisions
- Validate >40% Phase 1 completion target
- Improve time estimation accuracy (<20% variance)
- Track conversion funnel (free → paid)
- Identify dropout points

### Dependencies
- E1: User identity for tracking
- E5: Progress events to track

### Dependents
- None (observational layer)

---

## User Stories

### Story 9.1: Event Tracking Infrastructure

**As the** product team
**I want to** track user events consistently
**So that** we can analyze behavior patterns

**Acceptance Criteria:**
- [ ] Analytics library initialized on app load
- [ ] User identified after login (user_id linked)
- [ ] Event schema standardized:
  - event_name (string)
  - event_properties (object)
  - timestamp (automatic)
  - user_id (automatic if logged in)
  - session_id (automatic)
- [ ] Events sent to PostHog/Mixpanel
- [ ] Respect DNT (Do Not Track) header
- [ ] Cookie consent required before tracking (EU)

**Technical Notes:**
- Use PostHog JS SDK
- Server-side tracking for sensitive events
- Environment-based configuration

---

### Story 9.2: Signup Event Tracking

**As the** product team
**I want to** track signup funnel
**So that** we can optimize conversion

**Acceptance Criteria:**
- [ ] Track events:
  - `signup_started` - Registration form viewed
  - `signup_completed` - Account created
  - `signup_method` - Property: email/google
  - `email_verified` - Email verification completed
- [ ] Properties include:
  - Referral source (UTM params)
  - Device type
  - Browser
- [ ] Enable funnel analysis: visits → signups

**Technical Notes:**
- Capture UTM params on landing
- Store in user record

---

### Story 9.3: Onboarding Completion Tracking

**As the** product team
**I want to** track onboarding funnel
**So that** we can identify drop-off points

**Acceptance Criteria:**
- [ ] Track events:
  - `onboarding_started` - Step 1 viewed
  - `onboarding_step_completed` - Each step done
  - `onboarding_completed` - All steps finished
  - `onboarding_skipped` - User skipped
- [ ] Properties:
  - step_number (1, 2, 3)
  - time_on_step (seconds)
  - current_role_selected
  - target_role_selected
  - weekly_hours
  - skills_skipped_count
- [ ] Target: >60% completion rate

**Technical Notes:**
- Track time between steps
- Identify slowest steps

---

### Story 9.4: Module Completion Tracking

**As the** product team
**I want to** track learning progress
**So that** we can validate completion rates

**Acceptance Criteria:**
- [ ] Track events:
  - `module_started` - First resource clicked
  - `module_completed` - Mark complete clicked
  - `resource_clicked` - Resource link clicked
  - `phase_completed` - All modules in phase done
  - `roadmap_completed` - Full path finished
- [ ] Properties:
  - module_id, module_name
  - phase_number
  - time_spent (estimated from timestamps)
  - resources_clicked_count
- [ ] Target: >40% Phase 1 completion

**Technical Notes:**
- Calculate time_spent from start → complete
- Flag unusual patterns (too fast/slow)

---

### Story 9.5: Subscription Event Tracking

**As the** product team
**I want to** track subscription funnel
**So that** we can optimize monetization

**Acceptance Criteria:**
- [ ] Track events:
  - `upgrade_prompt_viewed` - Paywall shown
  - `upgrade_clicked` - Checkout initiated
  - `subscription_started` - Payment successful
  - `subscription_canceled` - User canceled
  - `subscription_reactivated` - User returned
- [ ] Properties:
  - trigger_location (module, settings, etc.)
  - trial_days_remaining
  - subscription_duration (months active)
  - cancel_reason (if provided)
- [ ] Target: >5% free-to-paid conversion

**Technical Notes:**
- Server-side for payment events
- Link to Stripe events

---

### Story 9.6: Module Feedback Collection

**As a** user completing a module
**I want to** rate my experience
**So that** I can help improve the content

**Acceptance Criteria:**
- [ ] After marking module complete, show feedback prompt
- [ ] Simple 1-5 star rating
- [ ] Optional text feedback field
- [ ] "Skip" option (don't force feedback)
- [ ] Feedback stored with module/user association
- [ ] Show 1 in 3 completions (not every time)
- [ ] Track feedback_submitted event

**Technical Notes:**
- Store in feedback table
- Throttle prompts to avoid fatigue

---

### Story 9.7: Analytics Dashboard Access

**As an** admin user
**I want to** view analytics dashboards
**So that** I can monitor product health

**Acceptance Criteria:**
- [ ] PostHog/Mixpanel dashboard configured
- [ ] Key dashboards created:
  - Signup funnel
  - Onboarding funnel
  - Module completion funnel
  - Subscription funnel
  - Retention cohorts
- [ ] Key metrics tracked:
  - DAU/WAU/MAU
  - Completion rates by phase
  - Time estimates vs actuals
  - Conversion rates
- [ ] Alerts for anomalies (optional)

**Technical Notes:**
- PostHog dashboards in project
- Share access with team

---

### Story 9.8: Time Estimation Validation

**As the** product team
**I want to** compare estimated vs actual completion times
**So that** we can improve estimation accuracy

**Acceptance Criteria:**
- [ ] Track for each module:
  - Estimated time (from curation)
  - Actual time (from completion timestamps)
- [ ] Calculate variance: `(actual - estimated) / estimated`
- [ ] Report: average variance by module
- [ ] Target: <20% variance
- [ ] Flag modules with >30% variance for review
- [ ] Feed data back to improve estimates

**Technical Notes:**
- Aggregate in analytics
- Quarterly review cadence

---

## Event Schema Reference

### Standard Event Properties
```typescript
interface EventProperties {
  // Auto-captured
  timestamp: string;
  user_id?: string;
  session_id: string;
  device_type: 'desktop' | 'tablet' | 'mobile';
  browser: string;
  os: string;

  // Page context
  page_path: string;
  referrer?: string;

  // UTM tracking
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
}
```

### Event Catalog

| Event Name | Trigger | Key Properties |
|------------|---------|----------------|
| `page_view` | Page load | page_path |
| `signup_started` | Registration form | method |
| `signup_completed` | Account created | method, referrer |
| `email_verified` | Link clicked | - |
| `onboarding_started` | Step 1 view | - |
| `onboarding_step_completed` | Step done | step_number, time_on_step |
| `onboarding_completed` | All steps done | total_time, skills_skipped |
| `roadmap_generated` | Path created | total_hours, phases_count |
| `module_started` | Resource clicked | module_id, phase |
| `module_completed` | Marked done | module_id, time_spent |
| `resource_clicked` | Link opened | resource_id, type, source |
| `phase_completed` | Phase done | phase_number |
| `upgrade_prompt_viewed` | Paywall shown | trigger_location |
| `upgrade_clicked` | Checkout started | - |
| `subscription_started` | Payment success | plan |
| `subscription_canceled` | Cancellation | months_active, reason |
| `checkin_completed` | Weekly check-in | status, hours_completed |
| `feedback_submitted` | Rating given | module_id, rating, has_comment |

---

## Non-Functional Requirements Mapping

| NFR | Requirement | Implementation |
|-----|-------------|----------------|
| NFR38 | Key metrics tracked | PostHog dashboards |
| NFR43 | Cookie consent | Consent banner before tracking |
| NFR45 | Test coverage | Unit tests for tracking calls |

---

## Technical Implementation Notes

### PostHog Integration
```typescript
// lib/analytics.ts
import posthog from 'posthog-js';

export function initAnalytics() {
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      api_host: 'https://app.posthog.com',
      capture_pageview: true,
      capture_pageleave: true,
      persistence: 'localStorage+cookie',
      respect_dnt: true,
    });
  }
}

export function identify(userId: string, properties?: object) {
  posthog.identify(userId, properties);
}

export function track(event: string, properties?: object) {
  posthog.capture(event, properties);
}

export function reset() {
  posthog.reset();
}
```

### Cookie Consent
```typescript
// components/CookieConsent.tsx
function CookieConsent() {
  const [consent, setConsent] = useState<boolean | null>(null);

  const handleAccept = () => {
    setConsent(true);
    localStorage.setItem('analytics_consent', 'true');
    initAnalytics();
  };

  const handleDecline = () => {
    setConsent(false);
    localStorage.setItem('analytics_consent', 'false');
  };

  if (consent !== null) return null;

  return (
    <Banner>
      We use analytics to improve your experience.
      <Button onClick={handleAccept}>Accept</Button>
      <Button onClick={handleDecline}>Decline</Button>
    </Banner>
  );
}
```

### Database Schema
```sql
CREATE TABLE feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  module_id UUID REFERENCES roadmap_modules(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_feedback_module ON feedback(module_id);
```

### API Endpoints
- `POST /api/feedback` - Submit module feedback
- `GET /api/analytics/completion-rates` - Get completion stats (admin)
- `GET /api/analytics/time-variance` - Get time estimation accuracy (admin)

---

## Acceptance Testing Checklist

- [ ] Analytics initialized on app load
- [ ] User identified after login
- [ ] Signup events fire correctly
- [ ] Onboarding events track each step
- [ ] Module completion events include properties
- [ ] Subscription events integrate with Stripe
- [ ] Feedback modal appears after completion
- [ ] Feedback stored correctly
- [ ] PostHog dashboards show data
- [ ] Cookie consent works (EU compliance)
- [ ] DNT header respected

---

*Epic document generated with BMAD methodology*
