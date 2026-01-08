import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { UpgradeCTA } from './UpgradeCTA';

// Mock window.location
const originalLocation = window.location;

beforeEach(() => {
  vi.clearAllMocks();
  // Reset window.location mock
  Object.defineProperty(window, 'location', {
    value: { href: '' },
    writable: true,
  });
});

afterAll(() => {
  Object.defineProperty(window, 'location', {
    value: originalLocation,
    writable: true,
  });
});

describe('UpgradeCTA', () => {
  describe('Banner Variant', () => {
    it('renders upgrade banner with correct price', () => {
      render(<UpgradeCTA monthlyPrice={29} variant="banner" />);

      expect(screen.getByText(/Unlock full path - \$29\/mo/i)).toBeInTheDocument();
    });

    it('displays upgrade button', () => {
      render(<UpgradeCTA monthlyPrice={29} variant="banner" />);

      expect(screen.getByRole('button', { name: /upgrade now/i })).toBeInTheDocument();
    });

    it('shows trial days remaining when provided', () => {
      render(<UpgradeCTA monthlyPrice={29} trialDaysRemaining={5} variant="banner" />);

      expect(screen.getByText(/5 days left in your free trial/i)).toBeInTheDocument();
    });

    it('handles singular day correctly', () => {
      render(<UpgradeCTA monthlyPrice={29} trialDaysRemaining={1} variant="banner" />);

      expect(screen.getByText(/1 day left in your free trial/i)).toBeInTheDocument();
    });

    it('does not show trial message when no days remaining', () => {
      render(<UpgradeCTA monthlyPrice={29} trialDaysRemaining={null} variant="banner" />);

      expect(screen.queryByText(/left in your free trial/i)).not.toBeInTheDocument();
    });
  });

  describe('Card Variant', () => {
    it('renders upgrade card with correct price', () => {
      render(<UpgradeCTA monthlyPrice={29} variant="card" />);

      expect(screen.getByText(/Upgrade to Pro - \$29\/mo/i)).toBeInTheDocument();
    });

    it('displays feature list', () => {
      render(<UpgradeCTA monthlyPrice={29} variant="card" />);

      expect(screen.getAllByText(/All phases unlocked/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Personalized roadmap/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Weekly coaching/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Priority support/i).length).toBeGreaterThan(0);
    });

    it('shows trial days remaining badge when provided', () => {
      render(<UpgradeCTA monthlyPrice={29} trialDaysRemaining={7} variant="card" />);

      expect(screen.getByText(/7 days left/i)).toBeInTheDocument();
    });

    it('shows title and description', () => {
      render(<UpgradeCTA monthlyPrice={29} variant="card" />);

      expect(screen.getByText(/Unlock Your Full Learning Path/i)).toBeInTheDocument();
      expect(screen.getByText(/Get access to all phases/i)).toBeInTheDocument();
    });
  });

  describe('Inline Variant', () => {
    it('renders inline upgrade link with correct price', () => {
      render(<UpgradeCTA monthlyPrice={29} variant="inline" />);

      expect(screen.getByText(/Unlock full path - \$29\/mo/i)).toBeInTheDocument();
    });

    it('renders as a button', () => {
      render(<UpgradeCTA monthlyPrice={29} variant="inline" />);

      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  describe('Default Variant', () => {
    it('defaults to card variant', () => {
      render(<UpgradeCTA monthlyPrice={29} />);

      // Card variant has feature list
      expect(screen.getByText(/All phases unlocked/i)).toBeInTheDocument();
    });
  });

  describe('Click Handling', () => {
    it('calls onUpgradeClick when provided', () => {
      const onUpgradeClick = vi.fn();
      render(<UpgradeCTA monthlyPrice={29} onUpgradeClick={onUpgradeClick} variant="banner" />);

      fireEvent.click(screen.getByRole('button', { name: /upgrade now/i }));

      expect(onUpgradeClick).toHaveBeenCalled();
    });

    it('navigates to pricing page when no handler provided', () => {
      render(<UpgradeCTA monthlyPrice={29} variant="banner" />);

      fireEvent.click(screen.getByRole('button', { name: /upgrade now/i }));

      expect(window.location.href).toBe('/pricing');
    });

    it('calls onUpgradeClick for card variant', () => {
      const onUpgradeClick = vi.fn();
      render(<UpgradeCTA monthlyPrice={29} onUpgradeClick={onUpgradeClick} variant="card" />);

      fireEvent.click(screen.getByRole('button', { name: /upgrade to pro/i }));

      expect(onUpgradeClick).toHaveBeenCalled();
    });

    it('calls onUpgradeClick for inline variant', () => {
      const onUpgradeClick = vi.fn();
      render(<UpgradeCTA monthlyPrice={29} onUpgradeClick={onUpgradeClick} variant="inline" />);

      fireEvent.click(screen.getByRole('button'));

      expect(onUpgradeClick).toHaveBeenCalled();
    });
  });

  describe('Styling', () => {
    it('applies custom className to banner', () => {
      const { container } = render(<UpgradeCTA monthlyPrice={29} variant="banner" className="custom-class" />);

      const banner = container.querySelector('.custom-class');
      expect(banner).toBeInTheDocument();
    });

    it('applies custom className to card', () => {
      const { container } = render(<UpgradeCTA monthlyPrice={29} variant="card" className="custom-class" />);

      const card = container.querySelector('.custom-class');
      expect(card).toBeInTheDocument();
    });

    it('applies custom className to inline', () => {
      render(<UpgradeCTA monthlyPrice={29} variant="inline" className="custom-class" />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });
  });

  describe('Edge Cases', () => {
    it('handles zero price', () => {
      render(<UpgradeCTA monthlyPrice={0} variant="banner" />);

      expect(screen.getByText(/Unlock full path - \$0\/mo/i)).toBeInTheDocument();
    });

    it('handles zero trial days', () => {
      render(<UpgradeCTA monthlyPrice={29} trialDaysRemaining={0} variant="banner" />);

      // Zero days should not show trial message
      expect(screen.queryByText(/left in your free trial/i)).not.toBeInTheDocument();
    });

    it('handles undefined trial days', () => {
      render(<UpgradeCTA monthlyPrice={29} trialDaysRemaining={undefined} variant="banner" />);

      expect(screen.queryByText(/left in your free trial/i)).not.toBeInTheDocument();
    });
  });
});
