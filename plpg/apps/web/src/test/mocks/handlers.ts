import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('*/v1/auth/me', () => {
    return HttpResponse.json({
      success: true,
      data: {
        userId: 'test_user_123',
        email: 'test@example.com',
        name: 'Test User',
        subscriptionStatus: 'trial',
        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      },
    });
  }),

  http.get('*/v1/health', () => {
    return HttpResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: 3600,
      database: 'connected',
    });
  }),
];
