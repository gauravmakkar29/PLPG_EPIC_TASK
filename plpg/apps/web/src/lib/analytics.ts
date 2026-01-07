/**
 * Analytics utility for tracking user events
 * 
 * This is a simple implementation that can be extended with PostHog/Mixpanel
 * when Epic 9 (Analytics) is implemented.
 */

type EventProperties = Record<string, unknown>;

/**
 * Track an analytics event
 * 
 * @param eventName - Name of the event (e.g., 'signup_started', 'signup_completed')
 * @param properties - Optional event properties
 */
export function track(eventName: string, properties?: EventProperties): void {
  // Check if analytics consent is given (for future EU compliance)
  const consent = localStorage.getItem('analytics_consent');
  if (consent === 'false') {
    return;
  }

  // For now, log to console. This will be replaced with PostHog/Mixpanel
  // when Epic 9 is implemented
  if (import.meta.env.DEV) {
    console.log('[Analytics]', eventName, properties || {});
  }

  // TODO: Integrate with PostHog when Epic 9 is implemented
  // if (typeof window !== 'undefined' && window.posthog) {
  //   window.posthog.capture(eventName, properties);
  // }
}

/**
 * Identify a user for analytics
 * 
 * @param userId - User ID to identify
 * @param properties - Optional user properties
 */
export function identify(userId: string, properties?: EventProperties): void {
  const consent = localStorage.getItem('analytics_consent');
  if (consent === 'false') {
    return;
  }

  if (import.meta.env.DEV) {
    console.log('[Analytics] Identify', userId, properties || {});
  }

  // TODO: Integrate with PostHog when Epic 9 is implemented
  // if (typeof window !== 'undefined' && window.posthog) {
  //   window.posthog.identify(userId, properties);
  // }
}

/**
 * Reset analytics (e.g., on logout)
 */
export function reset(): void {
  if (import.meta.env.DEV) {
    console.log('[Analytics] Reset');
  }

  // TODO: Integrate with PostHog when Epic 9 is implemented
  // if (typeof window !== 'undefined' && window.posthog) {
  //   window.posthog.reset();
  // }
}

