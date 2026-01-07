# Epic 7: Subscription & Billing

**Epic ID:** E7
**Priority:** P0 (MVP)
**Functional Requirements:** FR33-FR39

---

## Epic Overview

Implement the freemium business model with Stripe integration. Free tier provides 2-week access to Phase 1 content; Pro tier ($29/month) unlocks the complete roadmap. Handle subscription lifecycle including upgrades, cancellations, and payment failures.

### Business Value
- Primary revenue stream
- Target: >5% free-to-paid conversion
- Monthly recurring revenue model
- $50K MRR goal by Month 12

### Dependencies
- E1: User authentication required
- E4: Dashboard displays subscription status

### Dependents
- All content access gated by subscription status

---

## User Stories

### Story 7.1: Free Tier Access

**As a** new user
**I want to** access Phase 1 content for free
**So that** I can evaluate the platform before paying

**Acceptance Criteria:**
- [ ] Free tier automatically granted on registration
- [ ] Free tier includes:
  - Full path preview (all phases visible)
  - Phase 1 content fully accessible
  - 2-week trial period from registration
- [ ] After 2 weeks: paywall on Phase 1 content
- [ ] Clear indicator: "Free trial: X days remaining"
- [ ] No credit card required for free tier
- [ ] Phases 2-3 locked with "Upgrade to unlock"

**Technical Notes:**
- Store trial_start_date in users table
- Check trial status on each page load

---

### Story 7.2: Pro Tier Features

**As a** Pro subscriber
**I want to** access all platform features
**So that** I can complete my full learning path

**Acceptance Criteria:**
- [ ] Pro tier ($29/month) includes:
  - All 3 phases unlocked
  - Full resource access
  - Progress tracking
  - Weekly check-ins
  - Schedule recalculation
- [ ] No content restrictions
- [ ] Pro badge on profile (optional)
- [ ] Priority support (Phase 2)

**Technical Notes:**
- subscription_status: 'pro' in database
- Check status on protected routes

---

### Story 7.3: Stripe Checkout Integration

**As a** user upgrading to Pro
**I want to** pay securely via Stripe
**So that** my payment is processed safely

**Acceptance Criteria:**
- [ ] "Upgrade to Pro" button on dashboard/paywall
- [ ] Click redirects to Stripe Checkout
- [ ] Stripe Checkout shows:
  - Product: "PLPG Pro Subscription"
  - Price: $29/month
  - Billing cycle: Monthly recurring
- [ ] Success redirects to dashboard with "Welcome to Pro!"
- [ ] Cancel redirects back to dashboard
- [ ] Store Stripe customer_id and subscription_id

**Technical Notes:**
- Use Stripe Checkout Sessions API
- Webhook handles success confirmation
- API: `POST /api/billing/checkout`

---

### Story 7.4: Subscription Lifecycle Management

**As a** Pro subscriber
**I want to** manage my subscription
**So that** I can update or cancel as needed

**Acceptance Criteria:**
- [ ] Billing page accessible from Settings
- [ ] Shows:
  - Current plan: "Pro - $29/month"
  - Status: Active / Canceled / Past Due
  - Next billing date: [Date]
  - Payment method: •••• 4242
- [ ] "Manage Subscription" opens Stripe Customer Portal
- [ ] Portal allows:
  - Update payment method
  - View billing history
  - Cancel subscription
- [ ] Return from portal updates local status

**Technical Notes:**
- Use Stripe Customer Portal
- Webhook syncs status changes

---

### Story 7.5: Subscription Cancellation

**As a** Pro subscriber who wants to cancel
**I want to** cancel my subscription
**So that** I'm not charged further

**Acceptance Criteria:**
- [ ] Cancel via Stripe Customer Portal
- [ ] Cancellation takes effect at period end
- [ ] Access retained until billing period ends
- [ ] Status shows: "Canceled - Access until [Date]"
- [ ] Re-subscribe option available
- [ ] Confirmation email sent
- [ ] Track cancellation reason (optional survey)

**Technical Notes:**
- Stripe handles proration
- Webhook: `customer.subscription.deleted`

---

### Story 7.6: Subscription Reactivation

**As a** former Pro subscriber
**I want to** reactivate my subscription
**So that** I can continue my learning path

**Acceptance Criteria:**
- [ ] "Reactivate" button for canceled subscriptions
- [ ] Reactivation before period end: no new charge
- [ ] Reactivation after period end: new checkout
- [ ] Previous progress fully restored
- [ ] Welcome back message
- [ ] New billing cycle starts

**Technical Notes:**
- API: `POST /api/billing/reactivate`
- Stripe: update subscription status

---

### Story 7.7: Paywall Enforcement

**As the** system
**I want to** enforce paywall on Pro content
**So that** only paying users access full features

**Acceptance Criteria:**
- [ ] Check subscription status on:
  - Phase 2-3 module access
  - Phase 1 access after trial expiry
  - Resource links in locked phases
- [ ] Blocked access shows paywall modal:
  - "Unlock your full learning path"
  - Benefits list
  - "Upgrade to Pro - $29/month" CTA
- [ ] Cannot bypass by direct URL access
- [ ] API returns 403 for unauthorized content

**Technical Notes:**
- Middleware checks subscription status
- Frontend and backend validation

---

### Story 7.8: Billing Notifications

**As a** subscriber
**I want to** receive billing notifications
**So that** I'm aware of payment events

**Acceptance Criteria:**
- [ ] Email notifications for:
  - Payment successful (monthly receipt)
  - Payment failed (action required)
  - Subscription canceled (confirmation)
  - Trial expiring (3 days before)
  - Subscription expiring (if canceled)
- [ ] Emails include:
  - Amount charged
  - Next billing date
  - Link to manage subscription
- [ ] Unsubscribe from marketing, not transactional

**Technical Notes:**
- Use Stripe's built-in receipts
- Custom emails via SendGrid for trial/cancellation

---

### Story 7.9: Failed Payment Handling

**As a** subscriber with failed payment
**I want to** be notified and given time to fix it
**So that** I don't lose access immediately

**Acceptance Criteria:**
- [ ] Stripe retry logic: 3 attempts over 14 days
- [ ] Email on each failure with:
  - Reason (if available)
  - Link to update payment method
  - Warning of access impact
- [ ] Dashboard banner: "Payment failed - Update payment method"
- [ ] Grace period: 7 days of continued access
- [ ] After grace period: downgrade to Free tier
- [ ] Track failed payments for analysis

**Technical Notes:**
- Webhook: `invoice.payment_failed`
- Store payment_status in users

---

## UI/UX Specifications

### Paywall Modal
```
┌─────────────────────────────────────────┐
│ Unlock Your Full Learning Path       ✕  │
├─────────────────────────────────────────┤
│                                         │
│  🚀 PLPG Pro - $29/month                │
│                                         │
│  ✓ Access all 3 learning phases         │
│  ✓ Complete ML Engineer roadmap         │
│  ✓ Weekly progress check-ins            │
│  ✓ Schedule adjustment tools            │
│  ✓ Projected completion tracking        │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │      [Upgrade to Pro →]         │    │
│  └─────────────────────────────────┘    │
│                                         │
│  Cancel anytime. Secure payment.        │
│                                         │
└─────────────────────────────────────────┘
```

### Billing Page
```
┌─────────────────────────────────────────┐
│ Billing & Subscription                  │
├─────────────────────────────────────────┤
│                                         │
│  Current Plan: Pro                      │
│  Status: ● Active                       │
│  Price: $29/month                       │
│                                         │
│  Next billing: Feb 1, 2025              │
│  Payment method: Visa •••• 4242         │
│                                         │
│  [Manage Subscription]                  │
│                                         │
│  ─────────────────────────────────────  │
│                                         │
│  Billing History                        │
│  Jan 1, 2025    $29.00    ✓ Paid        │
│  Dec 1, 2024    $29.00    ✓ Paid        │
│                                         │
└─────────────────────────────────────────┘
```

---

## Non-Functional Requirements Mapping

| NFR | Requirement | Implementation |
|-----|-------------|----------------|
| NFR17 | PCI compliance | Stripe handles all payment data |
| NFR11 | TLS encryption | Stripe Checkout is HTTPS |
| NFR8 | Graceful degradation | Show paywall if Stripe unavailable |

---

## Technical Implementation Notes

### Database Schema
```sql
-- Add to users table
ALTER TABLE users ADD COLUMN stripe_customer_id VARCHAR(255);
ALTER TABLE users ADD COLUMN trial_start_date DATE;
ALTER TABLE users ADD COLUMN trial_end_date DATE;

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) UNIQUE,
  stripe_subscription_id VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL, -- active, canceled, past_due, trialing
  plan VARCHAR(50) DEFAULT 'pro',
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe ON subscriptions(stripe_subscription_id);
```

### API Endpoints
- `POST /api/billing/checkout` - Create Stripe Checkout session
- `GET /api/billing/status` - Get current subscription status
- `POST /api/billing/portal` - Create Stripe Portal session
- `POST /api/billing/reactivate` - Reactivate canceled subscription
- `POST /api/webhooks/stripe` - Stripe webhook handler

### Webhook Events to Handle
```typescript
const STRIPE_EVENTS = [
  'checkout.session.completed',    // New subscription
  'customer.subscription.updated', // Status changes
  'customer.subscription.deleted', // Cancellation
  'invoice.payment_succeeded',     // Successful payment
  'invoice.payment_failed',        // Failed payment
];
```

### Subscription Check Middleware
```typescript
async function requirePro(req, res, next) {
  const user = req.user;
  const subscription = await getSubscription(user.id);

  const hasAccess =
    subscription?.status === 'active' ||
    (user.trial_end_date && new Date() < user.trial_end_date);

  if (!hasAccess) {
    return res.status(403).json({ error: 'Pro subscription required' });
  }

  next();
}
```

---

## Acceptance Testing Checklist

- [ ] New user gets free trial automatically
- [ ] Phase 1 accessible during free trial
- [ ] Phases 2-3 show paywall for free users
- [ ] Upgrade flow completes via Stripe Checkout
- [ ] Pro users access all content
- [ ] Subscription status displays correctly
- [ ] Cancel subscription works via portal
- [ ] Access retained until period end after cancel
- [ ] Reactivation works correctly
- [ ] Failed payment triggers notifications
- [ ] Paywall enforced after trial expires

---

*Epic document generated with BMAD methodology*
