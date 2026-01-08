import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PhaseItem, type PhaseStatus } from './PhaseItem';
import { Phase } from '@plpg/shared';

describe('PhaseItem', () => {
  const defaultProps = {
    phase: Phase.FOUNDATION,
    status: 'active' as PhaseStatus,
    completedModules: 0,
    totalModules: 5,
    isExpanded: false,
    onToggle: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders phase title correctly', () => {
      render(<PhaseItem {...defaultProps} />);
      expect(screen.getByText('Foundation')).toBeInTheDocument();
    });

    it('renders phase description', () => {
      render(<PhaseItem {...defaultProps} />);
      expect(
        screen.getByText('Build foundational skills: Python, Math, and Data fundamentals')
      ).toBeInTheDocument();
    });

    it('displays progress count', () => {
      render(<PhaseItem {...defaultProps} completedModules={3} totalModules={8} />);
      expect(screen.getByText('3 of 8 modules complete')).toBeInTheDocument();
    });
  });

  describe('Status Styles', () => {
    it('applies correct CSS class for completed status', () => {
      render(<PhaseItem {...defaultProps} status="completed" />);
      const phaseItem = screen.getByRole('button');
      expect(phaseItem).toHaveClass('text-success-600');
    });

    it('applies correct CSS class for active status', () => {
      render(<PhaseItem {...defaultProps} status="active" />);
      const phaseItem = screen.getByRole('button');
      expect(phaseItem).toHaveClass('text-primary-600');
    });

    it('applies correct CSS class for locked status', () => {
      render(<PhaseItem {...defaultProps} status="locked" />);
      const phaseItem = screen.getByRole('button');
      expect(phaseItem).toHaveClass('text-secondary-400');
    });

    it('applies correct CSS class for pending status', () => {
      render(<PhaseItem {...defaultProps} status="pending" />);
      const phaseItem = screen.getByRole('button');
      expect(phaseItem).toHaveClass('text-secondary-400');
    });
  });

  describe('Interactions', () => {
    it('triggers expand callback on click', () => {
      const onToggle = vi.fn();
      render(<PhaseItem {...defaultProps} onToggle={onToggle} />);

      const phaseItem = screen.getByRole('button');
      fireEvent.click(phaseItem);

      expect(onToggle).toHaveBeenCalledTimes(1);
    });

    it('does not trigger callback when locked', () => {
      const onToggle = vi.fn();
      render(<PhaseItem {...defaultProps} status="locked" onToggle={onToggle} />);

      const phaseItem = screen.getByRole('button');
      fireEvent.click(phaseItem);

      expect(onToggle).not.toHaveBeenCalled();
    });

    it('is keyboard accessible (Enter)', () => {
      const onToggle = vi.fn();
      render(<PhaseItem {...defaultProps} onToggle={onToggle} />);

      const phaseItem = screen.getByRole('button');
      fireEvent.keyDown(phaseItem, { key: 'Enter' });

      expect(onToggle).toHaveBeenCalledTimes(1);
    });

    it('is keyboard accessible (Space)', () => {
      const onToggle = vi.fn();
      render(<PhaseItem {...defaultProps} onToggle={onToggle} />);

      const phaseItem = screen.getByRole('button');
      fireEvent.keyDown(phaseItem, { key: ' ' });

      expect(onToggle).toHaveBeenCalledTimes(1);
    });

    it('does not respond to keyboard when locked', () => {
      const onToggle = vi.fn();
      render(<PhaseItem {...defaultProps} status="locked" onToggle={onToggle} />);

      const phaseItem = screen.getByRole('button');
      fireEvent.keyDown(phaseItem, { key: 'Enter' });

      expect(onToggle).not.toHaveBeenCalled();
    });
  });

  describe('Expand/Collapse Indicator', () => {
    it('shows chevron in collapsed state', () => {
      render(<PhaseItem {...defaultProps} isExpanded={false} />);

      const chevron = screen.getByRole('button').querySelector('svg');
      expect(chevron).not.toHaveClass('rotate-180');
    });

    it('rotates chevron in expanded state', () => {
      render(<PhaseItem {...defaultProps} isExpanded={true} />);

      const chevron = screen.getByRole('button').querySelector('svg:last-of-type');
      expect(chevron).toHaveClass('rotate-180');
    });

    it('does not show chevron for locked phases', () => {
      render(<PhaseItem {...defaultProps} status="locked" />);

      // Locked phases should not show chevron (locked phases are not expandable)
      const button = screen.getByRole('button');
      const svgs = button.querySelectorAll('svg');
      // Should have lock icon but no chevron (1 SVG total)
      expect(svgs.length).toBe(1);
    });
  });

  describe('Accessibility', () => {
    it('has correct aria-expanded attribute', () => {
      const { rerender } = render(<PhaseItem {...defaultProps} isExpanded={false} />);

      expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'false');

      rerender(<PhaseItem {...defaultProps} isExpanded={true} />);

      expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true');
    });

    it('has correct aria-disabled for locked phases', () => {
      render(<PhaseItem {...defaultProps} status="locked" />);

      expect(screen.getByRole('button')).toHaveAttribute('aria-disabled', 'true');
    });

    it('is focusable for non-locked phases', () => {
      render(<PhaseItem {...defaultProps} />);

      expect(screen.getByRole('button')).toHaveAttribute('tabIndex', '0');
    });

    it('is not focusable for locked phases', () => {
      render(<PhaseItem {...defaultProps} status="locked" />);

      expect(screen.getByRole('button')).toHaveAttribute('tabIndex', '-1');
    });
  });

  describe('Children', () => {
    it('renders children content', () => {
      render(
        <PhaseItem {...defaultProps}>
          <div data-testid="child-content">Module List</div>
        </PhaseItem>
      );

      expect(screen.getByTestId('child-content')).toBeInTheDocument();
    });
  });
});
