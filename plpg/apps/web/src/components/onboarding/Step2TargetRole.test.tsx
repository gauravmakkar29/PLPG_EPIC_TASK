import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Step2TargetRole from './Step2TargetRole';
import { TARGET_ROLES } from '@plpg/shared';

describe('Step2TargetRole', () => {
  const mockOnNext = vi.fn();
  const mockOnBack = vi.fn();

  const defaultProps = {
    initialValue: null,
    onNext: mockOnNext,
    onBack: mockOnBack,
    isLoading: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders the target role selection heading', () => {
      render(<Step2TargetRole {...defaultProps} />);
      expect(screen.getByText('What role do you want?')).toBeInTheDocument();
      expect(
        screen.getByText("We'll create a personalized path to get you there")
      ).toBeInTheDocument();
    });

    it('renders ML Engineer as available option', () => {
      render(<Step2TargetRole {...defaultProps} />);
      expect(screen.getByText('ML Engineer')).toBeInTheDocument();
    });

    it('displays "Coming soon" badge for unavailable roles', () => {
      render(<Step2TargetRole {...defaultProps} />);
      const comingSoonBadges = screen.getAllByText('Coming soon');
      // All roles except ML Engineer should have "Coming soon" badge
      const unavailableRolesCount = TARGET_ROLES.filter((r) => !r.isAvailable).length;
      expect(comingSoonBadges.length).toBe(unavailableRolesCount);
    });

    it('renders all target roles', () => {
      render(<Step2TargetRole {...defaultProps} />);
      TARGET_ROLES.forEach((role) => {
        expect(screen.getByText(role.label)).toBeInTheDocument();
      });
    });
  });

  describe('Role Selection', () => {
    it('allows selecting ML Engineer (available role)', () => {
      render(<Step2TargetRole {...defaultProps} />);
      const mlEngineerButton = screen.getByText('ML Engineer').closest('button');
      expect(mlEngineerButton).not.toBeDisabled();
      fireEvent.click(mlEngineerButton!);
      // After selection, the button should have the selected styling
      expect(mlEngineerButton).toHaveClass('border-primary-500');
    });

    it('disables unavailable roles', () => {
      render(<Step2TargetRole {...defaultProps} />);
      const frontendButton = screen.getByText('Frontend Developer').closest('button');
      expect(frontendButton).toBeDisabled();
    });

    it('does not allow selecting unavailable roles', () => {
      render(<Step2TargetRole {...defaultProps} />);
      const frontendButton = screen.getByText('Frontend Developer').closest('button');
      fireEvent.click(frontendButton!);
      // Should not have selected styling
      expect(frontendButton).not.toHaveClass('border-primary-500');
    });

    it('enforces single selection', () => {
      render(<Step2TargetRole {...defaultProps} />);
      const mlEngineerButton = screen.getByText('ML Engineer').closest('button');
      fireEvent.click(mlEngineerButton!);
      expect(mlEngineerButton).toHaveClass('border-primary-500');
      // Since only ML Engineer is available in MVP, we can only select it
      // This test verifies that clicking the same button maintains selection
      fireEvent.click(mlEngineerButton!);
      expect(mlEngineerButton).toHaveClass('border-primary-500');
    });

    it('preserves initial selection value', () => {
      render(<Step2TargetRole {...defaultProps} initialValue="ml_engineer" />);
      const mlEngineerButton = screen.getByText('ML Engineer').closest('button');
      expect(mlEngineerButton).toHaveClass('border-primary-500');
    });
  });

  describe('Role Details Panel', () => {
    it('shows role description when ML Engineer is selected', () => {
      render(<Step2TargetRole {...defaultProps} />);
      const mlEngineerButton = screen.getByText('ML Engineer').closest('button');
      fireEvent.click(mlEngineerButton!);
      expect(screen.getByText('ML Engineer Learning Path')).toBeInTheDocument();
    });

    it('displays estimated learning hours for ML Engineer', () => {
      render(<Step2TargetRole {...defaultProps} />);
      const mlEngineerButton = screen.getByText('ML Engineer').closest('button');
      fireEvent.click(mlEngineerButton!);
      expect(screen.getByText(/Estimated time:/)).toBeInTheDocument();
      expect(screen.getByText(/~200 hours/)).toBeInTheDocument();
    });

    it('shows typical outcomes for ML Engineer', () => {
      render(<Step2TargetRole {...defaultProps} />);
      const mlEngineerButton = screen.getByText('ML Engineer').closest('button');
      fireEvent.click(mlEngineerButton!);
      expect(screen.getByText("What you'll learn:")).toBeInTheDocument();
      expect(screen.getByText('Build and deploy ML models')).toBeInTheDocument();
      expect(screen.getByText('Design data pipelines for ML')).toBeInTheDocument();
      expect(screen.getByText('Implement MLOps best practices')).toBeInTheDocument();
      expect(screen.getByText('Work with popular ML frameworks')).toBeInTheDocument();
    });

    it('does not show details panel when no role is selected', () => {
      render(<Step2TargetRole {...defaultProps} />);
      expect(screen.queryByText('ML Engineer Learning Path')).not.toBeInTheDocument();
    });
  });

  describe('Navigation Buttons', () => {
    it('disables Next button when no selection is made', () => {
      render(<Step2TargetRole {...defaultProps} />);
      const continueButton = screen.getByRole('button', { name: /continue/i });
      expect(continueButton).toBeDisabled();
    });

    it('enables Next button after valid selection', () => {
      render(<Step2TargetRole {...defaultProps} />);
      const mlEngineerButton = screen.getByText('ML Engineer').closest('button');
      fireEvent.click(mlEngineerButton!);
      const continueButton = screen.getByRole('button', { name: /continue/i });
      expect(continueButton).not.toBeDisabled();
    });

    it('calls onNext with selected role when Continue is clicked', () => {
      render(<Step2TargetRole {...defaultProps} />);
      const mlEngineerButton = screen.getByText('ML Engineer').closest('button');
      fireEvent.click(mlEngineerButton!);
      const continueButton = screen.getByRole('button', { name: /continue/i });
      fireEvent.click(continueButton);
      expect(mockOnNext).toHaveBeenCalledWith({ targetRole: 'ml_engineer' });
    });

    it('calls onBack when Back button is clicked', () => {
      render(<Step2TargetRole {...defaultProps} />);
      const backButton = screen.getByRole('button', { name: /back/i });
      fireEvent.click(backButton);
      expect(mockOnBack).toHaveBeenCalled();
    });

    it('disables buttons when isLoading is true', () => {
      render(<Step2TargetRole {...defaultProps} isLoading={true} initialValue="ml_engineer" />);
      const continueButton = screen.getByRole('button', { name: /saving/i });
      const backButton = screen.getByRole('button', { name: /back/i });
      expect(continueButton).toBeDisabled();
      expect(backButton).toBeDisabled();
    });

    it('shows "Saving..." text when loading', () => {
      render(<Step2TargetRole {...defaultProps} isLoading={true} initialValue="ml_engineer" />);
      expect(screen.getByText('Saving...')).toBeInTheDocument();
    });
  });

  describe('Selection Persistence', () => {
    it('shows previous selection when returning to step', () => {
      render(<Step2TargetRole {...defaultProps} initialValue="ml_engineer" />);
      const mlEngineerButton = screen.getByText('ML Engineer').closest('button');
      expect(mlEngineerButton).toHaveClass('border-primary-500');
      // Details panel should also be shown
      expect(screen.getByText('ML Engineer Learning Path')).toBeInTheDocument();
    });
  });
});
