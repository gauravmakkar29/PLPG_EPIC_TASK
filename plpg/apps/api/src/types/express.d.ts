import 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        subscriptionStatus: 'free' | 'trial' | 'pro';
        trialEndsAt: Date | null;
      };
    }
  }
}

export {};
