import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useSubscription, calculateCompletionWeeks } from './useSubscription';
import { Phase } from '@plpg/shared';
import * as AuthContext from '../contexts/AuthContext';

// Mock the AuthContext
vi.mock('../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

describe('useSubscription', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('tier detection', () => {
    it('returns free tier when subscriptionStatus is free', () => {
      vi.mocked(AuthContext.useAuth).mockReturnValue({
        user: { id: 'user-1', email: 'test@example.com', name: 'Test User' },
        session: {
          userId: 'user-1',
          email: 'test@example.com',
          name: 'Test User',
          subscriptionStatus: 'free',
          trialEndsAt: null,
        },
        isLoading: false,
        isAuthenticated: true,
        login: vi.fn(),
        signup: vi.fn(),
        logout: vi.fn(),
      });

      const { result } = renderHook(() => useSubscription());

      expect(result.current.tier).toBe('free');
      expect(result.current.isFree).toBe(true);
      expect(result.current.isPro).toBe(false);
      expect(result.current.isInTrial).toBe(false);
    });

    it('returns pro tier when subscriptionStatus is pro', () => {
      vi.mocked(AuthContext.useAuth).mockReturnValue({
        user: { id: 'user-1', email: 'test@example.com', name: 'Test User' },
        session: {
          userId: 'user-1',
          email: 'test@example.com',
          name: 'Test User',
          subscriptionStatus: 'pro',
          trialEndsAt: null,
        },
        isLoading: false,
        isAuthenticated: true,
        login: vi.fn(),
        signup: vi.fn(),
        logout: vi.fn(),
      });

      const { result } = renderHook(() => useSubscription());

      expect(result.current.tier).toBe('pro');
      expect(result.current.isPro).toBe(true);
      expect(result.current.isFree).toBe(false);
      expect(result.current.isInTrial).toBe(false);
    });

    it('returns trial tier when in active trial period', () => {
      const trialEndsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days from now

      vi.mocked(AuthContext.useAuth).mockReturnValue({
        user: { id: 'user-1', email: 'test@example.com', name: 'Test User' },
        session: {
          userId: 'user-1',
          email: 'test@example.com',
          name: 'Test User',
          subscriptionStatus: 'trial',
          trialEndsAt,
        },
        isLoading: false,
        isAuthenticated: true,
        login: vi.fn(),
        signup: vi.fn(),
        logout: vi.fn(),
      });

      const { result } = renderHook(() => useSubscription());

      expect(result.current.tier).toBe('trial');
      expect(result.current.isInTrial).toBe(true);
      expect(result.current.isPro).toBe(false);
      expect(result.current.isFree).toBe(false);
    });

    it('returns free tier when trial has expired', () => {
      const trialEndsAt = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(); // 1 day ago

      vi.mocked(AuthContext.useAuth).mockReturnValue({
        user: { id: 'user-1', email: 'test@example.com', name: 'Test User' },
        session: {
          userId: 'user-1',
          email: 'test@example.com',
          name: 'Test User',
          subscriptionStatus: 'trial',
          trialEndsAt,
        },
        isLoading: false,
        isAuthenticated: true,
        login: vi.fn(),
        signup: vi.fn(),
        logout: vi.fn(),
      });

      const { result } = renderHook(() => useSubscription());

      expect(result.current.tier).toBe('free');
      expect(result.current.isInTrial).toBe(false);
      expect(result.current.isFree).toBe(true);
    });
  });

  describe('trial period tracking', () => {
    it('calculates trial days remaining correctly', () => {
      const daysUntilExpiry = 5;
      const trialEndsAt = new Date(Date.now() + daysUntilExpiry * 24 * 60 * 60 * 1000).toISOString();

      vi.mocked(AuthContext.useAuth).mockReturnValue({
        user: { id: 'user-1', email: 'test@example.com', name: 'Test User' },
        session: {
          userId: 'user-1',
          email: 'test@example.com',
          name: 'Test User',
          subscriptionStatus: 'trial',
          trialEndsAt,
        },
        isLoading: false,
        isAuthenticated: true,
        login: vi.fn(),
        signup: vi.fn(),
        logout: vi.fn(),
      });

      const { result } = renderHook(() => useSubscription());

      expect(result.current.trialDaysRemaining).toBe(daysUntilExpiry);
    });

    it('returns null for trial days when not in trial', () => {
      vi.mocked(AuthContext.useAuth).mockReturnValue({
        user: { id: 'user-1', email: 'test@example.com', name: 'Test User' },
        session: {
          userId: 'user-1',
          email: 'test@example.com',
          name: 'Test User',
          subscriptionStatus: 'free',
          trialEndsAt: null,
        },
        isLoading: false,
        isAuthenticated: true,
        login: vi.fn(),
        signup: vi.fn(),
        logout: vi.fn(),
      });

      const { result } = renderHook(() => useSubscription());

      expect(result.current.trialDaysRemaining).toBeNull();
    });

    it('parses trial end date correctly', () => {
      const trialDate = new Date('2026-01-20T12:00:00Z');
      const trialEndsAt = trialDate.toISOString();

      vi.mocked(AuthContext.useAuth).mockReturnValue({
        user: { id: 'user-1', email: 'test@example.com', name: 'Test User' },
        session: {
          userId: 'user-1',
          email: 'test@example.com',
          name: 'Test User',
          subscriptionStatus: 'trial',
          trialEndsAt,
        },
        isLoading: false,
        isAuthenticated: true,
        login: vi.fn(),
        signup: vi.fn(),
        logout: vi.fn(),
      });

      const { result } = renderHook(() => useSubscription());

      expect(result.current.trialEndsAt).toEqual(trialDate);
    });
  });

  describe('phase access control', () => {
    it('allows Foundation access during trial', () => {
      const trialEndsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

      vi.mocked(AuthContext.useAuth).mockReturnValue({
        user: { id: 'user-1', email: 'test@example.com', name: 'Test User' },
        session: {
          userId: 'user-1',
          email: 'test@example.com',
          name: 'Test User',
          subscriptionStatus: 'trial',
          trialEndsAt,
        },
        isLoading: false,
        isAuthenticated: true,
        login: vi.fn(),
        signup: vi.fn(),
        logout: vi.fn(),
      });

      const { result } = renderHook(() => useSubscription());

      expect(result.current.hasPhaseAccess(Phase.FOUNDATION)).toBe(true);
    });

    it('denies Core ML access during trial', () => {
      const trialEndsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

      vi.mocked(AuthContext.useAuth).mockReturnValue({
        user: { id: 'user-1', email: 'test@example.com', name: 'Test User' },
        session: {
          userId: 'user-1',
          email: 'test@example.com',
          name: 'Test User',
          subscriptionStatus: 'trial',
          trialEndsAt,
        },
        isLoading: false,
        isAuthenticated: true,
        login: vi.fn(),
        signup: vi.fn(),
        logout: vi.fn(),
      });

      const { result } = renderHook(() => useSubscription());

      expect(result.current.hasPhaseAccess(Phase.CORE_ML)).toBe(false);
    });

    it('denies Deep Learning access during trial', () => {
      const trialEndsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

      vi.mocked(AuthContext.useAuth).mockReturnValue({
        user: { id: 'user-1', email: 'test@example.com', name: 'Test User' },
        session: {
          userId: 'user-1',
          email: 'test@example.com',
          name: 'Test User',
          subscriptionStatus: 'trial',
          trialEndsAt,
        },
        isLoading: false,
        isAuthenticated: true,
        login: vi.fn(),
        signup: vi.fn(),
        logout: vi.fn(),
      });

      const { result } = renderHook(() => useSubscription());

      expect(result.current.hasPhaseAccess(Phase.DEEP_LEARNING)).toBe(false);
    });

    it('allows all phases for pro users', () => {
      vi.mocked(AuthContext.useAuth).mockReturnValue({
        user: { id: 'user-1', email: 'test@example.com', name: 'Test User' },
        session: {
          userId: 'user-1',
          email: 'test@example.com',
          name: 'Test User',
          subscriptionStatus: 'pro',
          trialEndsAt: null,
        },
        isLoading: false,
        isAuthenticated: true,
        login: vi.fn(),
        signup: vi.fn(),
        logout: vi.fn(),
      });

      const { result } = renderHook(() => useSubscription());

      expect(result.current.hasPhaseAccess(Phase.FOUNDATION)).toBe(true);
      expect(result.current.hasPhaseAccess(Phase.CORE_ML)).toBe(true);
      expect(result.current.hasPhaseAccess(Phase.DEEP_LEARNING)).toBe(true);
    });

    it('denies all phases for free users (no trial)', () => {
      vi.mocked(AuthContext.useAuth).mockReturnValue({
        user: { id: 'user-1', email: 'test@example.com', name: 'Test User' },
        session: {
          userId: 'user-1',
          email: 'test@example.com',
          name: 'Test User',
          subscriptionStatus: 'free',
          trialEndsAt: null,
        },
        isLoading: false,
        isAuthenticated: true,
        login: vi.fn(),
        signup: vi.fn(),
        logout: vi.fn(),
      });

      const { result } = renderHook(() => useSubscription());

      // Free users without trial have no access to any phase
      expect(result.current.hasPhaseAccess(Phase.FOUNDATION)).toBe(false);
      expect(result.current.hasPhaseAccess(Phase.CORE_ML)).toBe(false);
      expect(result.current.hasPhaseAccess(Phase.DEEP_LEARNING)).toBe(false);
    });
  });

  describe('pricing', () => {
    it('returns correct pro monthly price', () => {
      vi.mocked(AuthContext.useAuth).mockReturnValue({
        user: { id: 'user-1', email: 'test@example.com', name: 'Test User' },
        session: {
          userId: 'user-1',
          email: 'test@example.com',
          name: 'Test User',
          subscriptionStatus: 'free',
          trialEndsAt: null,
        },
        isLoading: false,
        isAuthenticated: true,
        login: vi.fn(),
        signup: vi.fn(),
        logout: vi.fn(),
      });

      const { result } = renderHook(() => useSubscription());

      expect(result.current.proMonthlyPrice).toBe(29);
    });
  });

  describe('loading state', () => {
    it('returns loading state from auth context', () => {
      vi.mocked(AuthContext.useAuth).mockReturnValue({
        user: null,
        session: null,
        isLoading: true,
        isAuthenticated: false,
        login: vi.fn(),
        signup: vi.fn(),
        logout: vi.fn(),
      });

      const { result } = renderHook(() => useSubscription());

      expect(result.current.isLoading).toBe(true);
    });
  });

  describe('no session', () => {
    it('handles null session gracefully', () => {
      vi.mocked(AuthContext.useAuth).mockReturnValue({
        user: null,
        session: null,
        isLoading: false,
        isAuthenticated: false,
        login: vi.fn(),
        signup: vi.fn(),
        logout: vi.fn(),
      });

      const { result } = renderHook(() => useSubscription());

      expect(result.current.tier).toBe('free');
      expect(result.current.isFree).toBe(true);
      expect(result.current.isPro).toBe(false);
      expect(result.current.isInTrial).toBe(false);
      expect(result.current.trialDaysRemaining).toBeNull();
    });
  });
});

describe('calculateCompletionWeeks', () => {
  it('calculates weeks correctly for standard case', () => {
    expect(calculateCompletionWeeks(100, 10)).toBe(10);
  });

  it('rounds up partial weeks', () => {
    expect(calculateCompletionWeeks(105, 10)).toBe(11);
  });

  it('handles zero weekly hours', () => {
    expect(calculateCompletionWeeks(100, 0)).toBe(0);
  });

  it('handles negative weekly hours', () => {
    expect(calculateCompletionWeeks(100, -10)).toBe(0);
  });

  it('handles zero total hours', () => {
    expect(calculateCompletionWeeks(0, 10)).toBe(0);
  });

  it('uses default weekly hours of 10', () => {
    expect(calculateCompletionWeeks(100)).toBe(10);
  });
});
