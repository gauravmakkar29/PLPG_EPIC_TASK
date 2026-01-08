import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { PathPreviewScreen } from './PathPreviewScreen';
import { Phase } from '@plpg/shared';
import type { RoadmapWithModules, RoadmapModuleWithSkill, Skill, Session } from '@plpg/shared';
import * as AuthContext from '../../contexts/AuthContext';
import * as RoadmapHook from '../../hooks/useRoadmap';

// Mock the hooks
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../../hooks/useRoadmap', () => ({
  useRoadmap: vi.fn(),
  useCurrentModule: vi.fn(),
}));

// Helper to create mock skill
const createMockSkill = (overrides: Partial<Skill> = {}): Skill => ({
  id: 'skill-1',
  name: 'Python Basics',
  slug: 'python-basics',
  description: 'Learn Python fundamentals',
  whyThisMatters: null,
  phase: Phase.FOUNDATION,
  estimatedHours: 10,
  isOptional: false,
  sequenceOrder: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

// Helper to create mock module
const createMockModule = (overrides: Partial<RoadmapModuleWithSkill> = {}): RoadmapModuleWithSkill => ({
  id: 'module-1',
  roadmapId: 'roadmap-1',
  skillId: 'skill-1',
  phase: Phase.FOUNDATION,
  sequenceOrder: 1,
  isLocked: false,
  isSkipped: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  skill: createMockSkill(),
  progress: null,
  ...overrides,
});

// Helper to create mock roadmap
const createMockRoadmap = (modules: RoadmapModuleWithSkill[] = []): RoadmapWithModules => ({
  id: 'roadmap-1',
  userId: 'user-1',
  title: 'ML Engineer Path',
  description: 'Path to becoming an ML Engineer',
  sourceRole: 'Software Developer',
  targetRole: 'ML Engineer',
  totalEstimatedHours: 200,
  completedHours: 0,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  modules,
});

// Helper to create session
const createMockSession = (overrides: Partial<Session> = {}): Session => ({
  userId: 'user-1',
  email: 'test@example.com',
  name: 'Test User',
  subscriptionStatus: 'free',
  trialEndsAt: null,
  ...overrides,
});

// Wrapper component for tests
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>{children}</MemoryRouter>
      </QueryClientProvider>
    );
  };
}

describe('PathPreviewScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders full Metro Map for free users', () => {
      const modules = [
        createMockModule({ phase: Phase.FOUNDATION }),
        createMockModule({
          id: 'module-2',
          phase: Phase.CORE_ML,
          skill: createMockSkill({ id: 'skill-2', name: 'ML Basics', phase: Phase.CORE_ML }),
        }),
        createMockModule({
          id: 'module-3',
          phase: Phase.DEEP_LEARNING,
          skill: createMockSkill({ id: 'skill-3', name: 'Neural Networks', phase: Phase.DEEP_LEARNING }),
        }),
      ];

      vi.mocked(AuthContext.useAuth).mockReturnValue({
        user: { id: 'user-1', email: 'test@example.com', name: 'Test User' },
        session: createMockSession({ subscriptionStatus: 'free' }),
        isLoading: false,
        isAuthenticated: true,
        login: vi.fn(),
        signup: vi.fn(),
        logout: vi.fn(),
      });

      vi.mocked(RoadmapHook.useRoadmap).mockReturnValue({
        data: createMockRoadmap(modules),
        isLoading: false,
        error: null,
        isError: false,
        isPending: false,
        isSuccess: true,
        status: 'success',
        refetch: vi.fn(),
      } as any);

      vi.mocked(RoadmapHook.useCurrentModule).mockReturnValue(modules[0]);

      render(<PathPreviewScreen />, { wrapper: createWrapper() });

      // All phases should be visible
      expect(screen.getByText('Foundation')).toBeInTheDocument();
      expect(screen.getByText('Core ML')).toBeInTheDocument();
      expect(screen.getByText('Deep Learning')).toBeInTheDocument();
    });

    it('shows Phase 1 modules as accessible', () => {
      const modules = [
        createMockModule({ phase: Phase.FOUNDATION }),
      ];

      vi.mocked(AuthContext.useAuth).mockReturnValue({
        user: { id: 'user-1', email: 'test@example.com', name: 'Test User' },
        session: createMockSession({ subscriptionStatus: 'trial', trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() }),
        isLoading: false,
        isAuthenticated: true,
        login: vi.fn(),
        signup: vi.fn(),
        logout: vi.fn(),
      });

      vi.mocked(RoadmapHook.useRoadmap).mockReturnValue({
        data: createMockRoadmap(modules),
        isLoading: false,
        error: null,
        isError: false,
        isPending: false,
        isSuccess: true,
        status: 'success',
        refetch: vi.fn(),
      } as any);

      vi.mocked(RoadmapHook.useCurrentModule).mockReturnValue(modules[0]);

      render(<PathPreviewScreen />, { wrapper: createWrapper() });

      // Foundation phase should not show "Pro" badge since it's accessible during trial
      const foundationPhase = screen.getByText('Foundation').closest('div');
      expect(foundationPhase).not.toHaveTextContent('Pro');
    });

    it('shows Phases 2-3 modules as locked for free users', () => {
      const modules = [
        createMockModule({ phase: Phase.FOUNDATION }),
        createMockModule({
          id: 'module-2',
          phase: Phase.CORE_ML,
          skill: createMockSkill({ id: 'skill-2', name: 'ML Basics', phase: Phase.CORE_ML }),
        }),
      ];

      vi.mocked(AuthContext.useAuth).mockReturnValue({
        user: { id: 'user-1', email: 'test@example.com', name: 'Test User' },
        session: createMockSession({ subscriptionStatus: 'free' }),
        isLoading: false,
        isAuthenticated: true,
        login: vi.fn(),
        signup: vi.fn(),
        logout: vi.fn(),
      });

      vi.mocked(RoadmapHook.useRoadmap).mockReturnValue({
        data: createMockRoadmap(modules),
        isLoading: false,
        error: null,
        isError: false,
        isPending: false,
        isSuccess: true,
        status: 'success',
        refetch: vi.fn(),
      } as any);

      vi.mocked(RoadmapHook.useCurrentModule).mockReturnValue(modules[0]);

      render(<PathPreviewScreen />, { wrapper: createWrapper() });

      // Core ML should show "Pro" badge since it's locked for free users
      expect(screen.getAllByText('Pro').length).toBeGreaterThan(0);
    });

    it('displays upgrade CTA with correct price', () => {
      vi.mocked(AuthContext.useAuth).mockReturnValue({
        user: { id: 'user-1', email: 'test@example.com', name: 'Test User' },
        session: createMockSession({ subscriptionStatus: 'free' }),
        isLoading: false,
        isAuthenticated: true,
        login: vi.fn(),
        signup: vi.fn(),
        logout: vi.fn(),
      });

      vi.mocked(RoadmapHook.useRoadmap).mockReturnValue({
        data: createMockRoadmap([createMockModule()]),
        isLoading: false,
        error: null,
        isError: false,
        isPending: false,
        isSuccess: true,
        status: 'success',
        refetch: vi.fn(),
      } as any);

      vi.mocked(RoadmapHook.useCurrentModule).mockReturnValue(null);

      render(<PathPreviewScreen />, { wrapper: createWrapper() });

      // Check for $29/mo price
      expect(screen.getAllByText(/\$29\/mo/i).length).toBeGreaterThan(0);
    });

    it('shows timeline completion estimate', () => {
      const modules = [
        createMockModule({ skill: createMockSkill({ estimatedHours: 50 }) }),
        createMockModule({
          id: 'module-2',
          skill: createMockSkill({ id: 'skill-2', estimatedHours: 50 }),
        }),
      ];

      vi.mocked(AuthContext.useAuth).mockReturnValue({
        user: { id: 'user-1', email: 'test@example.com', name: 'Test User' },
        session: createMockSession({ subscriptionStatus: 'trial', trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() }),
        isLoading: false,
        isAuthenticated: true,
        login: vi.fn(),
        signup: vi.fn(),
        logout: vi.fn(),
      });

      vi.mocked(RoadmapHook.useRoadmap).mockReturnValue({
        data: createMockRoadmap(modules),
        isLoading: false,
        error: null,
        isError: false,
        isPending: false,
        isSuccess: true,
        status: 'success',
        refetch: vi.fn(),
      } as any);

      vi.mocked(RoadmapHook.useCurrentModule).mockReturnValue(modules[0]);

      render(<PathPreviewScreen weeklyHours={10} />, { wrapper: createWrapper() });

      // 100 hours / 10 hours per week = 10 weeks
      expect(screen.getByText(/Complete in 10 weeks/i)).toBeInTheDocument();
    });
  });

  describe('Subscription Check', () => {
    it('fetches subscription status on mount', () => {
      const useAuthMock = vi.mocked(AuthContext.useAuth);
      useAuthMock.mockReturnValue({
        user: { id: 'user-1', email: 'test@example.com', name: 'Test User' },
        session: createMockSession({ subscriptionStatus: 'free' }),
        isLoading: false,
        isAuthenticated: true,
        login: vi.fn(),
        signup: vi.fn(),
        logout: vi.fn(),
      });

      vi.mocked(RoadmapHook.useRoadmap).mockReturnValue({
        data: createMockRoadmap([createMockModule()]),
        isLoading: false,
        error: null,
        isError: false,
        isPending: false,
        isSuccess: true,
        status: 'success',
        refetch: vi.fn(),
      } as any);

      vi.mocked(RoadmapHook.useCurrentModule).mockReturnValue(null);

      render(<PathPreviewScreen />, { wrapper: createWrapper() });

      expect(useAuthMock).toHaveBeenCalled();
    });

    it('handles free tier subscription correctly', () => {
      vi.mocked(AuthContext.useAuth).mockReturnValue({
        user: { id: 'user-1', email: 'test@example.com', name: 'Test User' },
        session: createMockSession({ subscriptionStatus: 'free' }),
        isLoading: false,
        isAuthenticated: true,
        login: vi.fn(),
        signup: vi.fn(),
        logout: vi.fn(),
      });

      vi.mocked(RoadmapHook.useRoadmap).mockReturnValue({
        data: createMockRoadmap([createMockModule()]),
        isLoading: false,
        error: null,
        isError: false,
        isPending: false,
        isSuccess: true,
        status: 'success',
        refetch: vi.fn(),
      } as any);

      vi.mocked(RoadmapHook.useCurrentModule).mockReturnValue(null);

      render(<PathPreviewScreen />, { wrapper: createWrapper() });

      // Should show upgrade CTA for free users
      expect(screen.getAllByText(/Upgrade/i).length).toBeGreaterThan(0);
    });

    it('handles pro tier subscription correctly', () => {
      vi.mocked(AuthContext.useAuth).mockReturnValue({
        user: { id: 'user-1', email: 'test@example.com', name: 'Test User' },
        session: createMockSession({ subscriptionStatus: 'pro' }),
        isLoading: false,
        isAuthenticated: true,
        login: vi.fn(),
        signup: vi.fn(),
        logout: vi.fn(),
      });

      vi.mocked(RoadmapHook.useRoadmap).mockReturnValue({
        data: createMockRoadmap([createMockModule()]),
        isLoading: false,
        error: null,
        isError: false,
        isPending: false,
        isSuccess: true,
        status: 'success',
        refetch: vi.fn(),
      } as any);

      vi.mocked(RoadmapHook.useCurrentModule).mockReturnValue(null);

      render(<PathPreviewScreen />, { wrapper: createWrapper() });

      // Should NOT show upgrade CTA for pro users
      expect(screen.queryByText(/Unlock full path/i)).not.toBeInTheDocument();
    });

    it('calculates trial period remaining correctly', () => {
      const trialEndsAt = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(); // 5 days from now

      vi.mocked(AuthContext.useAuth).mockReturnValue({
        user: { id: 'user-1', email: 'test@example.com', name: 'Test User' },
        session: createMockSession({ subscriptionStatus: 'trial', trialEndsAt }),
        isLoading: false,
        isAuthenticated: true,
        login: vi.fn(),
        signup: vi.fn(),
        logout: vi.fn(),
      });

      vi.mocked(RoadmapHook.useRoadmap).mockReturnValue({
        data: createMockRoadmap([createMockModule()]),
        isLoading: false,
        error: null,
        isError: false,
        isPending: false,
        isSuccess: true,
        status: 'success',
        refetch: vi.fn(),
      } as any);

      vi.mocked(RoadmapHook.useCurrentModule).mockReturnValue(null);

      render(<PathPreviewScreen />, { wrapper: createWrapper() });

      // Should show trial days remaining
      expect(screen.getAllByText(/5 days left/i).length).toBeGreaterThan(0);
    });
  });

  describe('Trial Period', () => {
    it('allows Phase 1 access during trial', () => {
      const trialEndsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      const modules = [
        createMockModule({ phase: Phase.FOUNDATION }),
      ];

      vi.mocked(AuthContext.useAuth).mockReturnValue({
        user: { id: 'user-1', email: 'test@example.com', name: 'Test User' },
        session: createMockSession({ subscriptionStatus: 'trial', trialEndsAt }),
        isLoading: false,
        isAuthenticated: true,
        login: vi.fn(),
        signup: vi.fn(),
        logout: vi.fn(),
      });

      vi.mocked(RoadmapHook.useRoadmap).mockReturnValue({
        data: createMockRoadmap(modules),
        isLoading: false,
        error: null,
        isError: false,
        isPending: false,
        isSuccess: true,
        status: 'success',
        refetch: vi.fn(),
      } as any);

      vi.mocked(RoadmapHook.useCurrentModule).mockReturnValue(modules[0]);

      render(<PathPreviewScreen />, { wrapper: createWrapper() });

      // Foundation should be accessible (no "Pro" badge on phase header)
      const foundationSection = screen.getByText('Foundation').closest('div[role="button"]');
      expect(foundationSection).not.toHaveTextContent('Pro');
    });

    it('shows paywall after trial expires', () => {
      // Trial ended yesterday
      const trialEndsAt = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString();

      vi.mocked(AuthContext.useAuth).mockReturnValue({
        user: { id: 'user-1', email: 'test@example.com', name: 'Test User' },
        session: createMockSession({ subscriptionStatus: 'trial', trialEndsAt }),
        isLoading: false,
        isAuthenticated: true,
        login: vi.fn(),
        signup: vi.fn(),
        logout: vi.fn(),
      });

      vi.mocked(RoadmapHook.useRoadmap).mockReturnValue({
        data: createMockRoadmap([createMockModule()]),
        isLoading: false,
        error: null,
        isError: false,
        isPending: false,
        isSuccess: true,
        status: 'success',
        refetch: vi.fn(),
      } as any);

      vi.mocked(RoadmapHook.useCurrentModule).mockReturnValue(null);

      render(<PathPreviewScreen />, { wrapper: createWrapper() });

      // Should show upgrade CTA after trial expires
      expect(screen.getAllByText(/Upgrade/i).length).toBeGreaterThan(0);
    });

    it('tracks trial start date correctly', () => {
      const trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(); // 14 days from now

      vi.mocked(AuthContext.useAuth).mockReturnValue({
        user: { id: 'user-1', email: 'test@example.com', name: 'Test User' },
        session: createMockSession({ subscriptionStatus: 'trial', trialEndsAt }),
        isLoading: false,
        isAuthenticated: true,
        login: vi.fn(),
        signup: vi.fn(),
        logout: vi.fn(),
      });

      vi.mocked(RoadmapHook.useRoadmap).mockReturnValue({
        data: createMockRoadmap([createMockModule()]),
        isLoading: false,
        error: null,
        isError: false,
        isPending: false,
        isSuccess: true,
        status: 'success',
        refetch: vi.fn(),
      } as any);

      vi.mocked(RoadmapHook.useCurrentModule).mockReturnValue(null);

      render(<PathPreviewScreen />, { wrapper: createWrapper() });

      // Should show 14 days left
      expect(screen.getAllByText(/14 days left/i).length).toBeGreaterThan(0);
    });
  });

  describe('Upgrade CTA', () => {
    it('renders upgrade button prominently', () => {
      vi.mocked(AuthContext.useAuth).mockReturnValue({
        user: { id: 'user-1', email: 'test@example.com', name: 'Test User' },
        session: createMockSession({ subscriptionStatus: 'free' }),
        isLoading: false,
        isAuthenticated: true,
        login: vi.fn(),
        signup: vi.fn(),
        logout: vi.fn(),
      });

      vi.mocked(RoadmapHook.useRoadmap).mockReturnValue({
        data: createMockRoadmap([createMockModule()]),
        isLoading: false,
        error: null,
        isError: false,
        isPending: false,
        isSuccess: true,
        status: 'success',
        refetch: vi.fn(),
      } as any);

      vi.mocked(RoadmapHook.useCurrentModule).mockReturnValue(null);

      render(<PathPreviewScreen />, { wrapper: createWrapper() });

      // Multiple upgrade buttons should be visible
      const upgradeButtons = screen.getAllByRole('button', { name: /upgrade/i });
      expect(upgradeButtons.length).toBeGreaterThan(0);
    });

    it('navigates to payment page on click', () => {
      const onUpgradeClick = vi.fn();

      vi.mocked(AuthContext.useAuth).mockReturnValue({
        user: { id: 'user-1', email: 'test@example.com', name: 'Test User' },
        session: createMockSession({ subscriptionStatus: 'free' }),
        isLoading: false,
        isAuthenticated: true,
        login: vi.fn(),
        signup: vi.fn(),
        logout: vi.fn(),
      });

      vi.mocked(RoadmapHook.useRoadmap).mockReturnValue({
        data: createMockRoadmap([createMockModule()]),
        isLoading: false,
        error: null,
        isError: false,
        isPending: false,
        isSuccess: true,
        status: 'success',
        refetch: vi.fn(),
      } as any);

      vi.mocked(RoadmapHook.useCurrentModule).mockReturnValue(null);

      render(<PathPreviewScreen onUpgradeClick={onUpgradeClick} />, { wrapper: createWrapper() });

      const upgradeButton = screen.getAllByRole('button', { name: /upgrade/i })[0];
      fireEvent.click(upgradeButton);

      expect(onUpgradeClick).toHaveBeenCalled();
    });
  });

  describe('Loading State', () => {
    it('shows skeleton while loading', () => {
      vi.mocked(AuthContext.useAuth).mockReturnValue({
        user: null,
        session: null,
        isLoading: true,
        isAuthenticated: false,
        login: vi.fn(),
        signup: vi.fn(),
        logout: vi.fn(),
      });

      vi.mocked(RoadmapHook.useRoadmap).mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
        isError: false,
        isPending: true,
        isSuccess: false,
        status: 'pending',
        refetch: vi.fn(),
      } as any);

      vi.mocked(RoadmapHook.useCurrentModule).mockReturnValue(null);

      render(<PathPreviewScreen />, { wrapper: createWrapper() });

      // Should show loading skeleton
      expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('shows empty state when no roadmap', () => {
      vi.mocked(AuthContext.useAuth).mockReturnValue({
        user: { id: 'user-1', email: 'test@example.com', name: 'Test User' },
        session: createMockSession({ subscriptionStatus: 'free' }),
        isLoading: false,
        isAuthenticated: true,
        login: vi.fn(),
        signup: vi.fn(),
        logout: vi.fn(),
      });

      vi.mocked(RoadmapHook.useRoadmap).mockReturnValue({
        data: null,
        isLoading: false,
        error: null,
        isError: false,
        isPending: false,
        isSuccess: true,
        status: 'success',
        refetch: vi.fn(),
      } as any);

      vi.mocked(RoadmapHook.useCurrentModule).mockReturnValue(null);

      render(<PathPreviewScreen />, { wrapper: createWrapper() });

      expect(screen.getByText(/No Learning Path Yet/i)).toBeInTheDocument();
    });
  });
});
