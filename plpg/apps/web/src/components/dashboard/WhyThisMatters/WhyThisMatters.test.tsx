import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { WhyThisMatters } from './index';
import type { PrerequisiteSkill } from '@plpg/shared';

// Helper to create mock prerequisites
const createMockPrerequisite = (overrides: Partial<PrerequisiteSkill> = {}): PrerequisiteSkill => ({
  id: 'prereq-1',
  name: 'Python Basics',
  slug: 'python-basics',
  ...overrides,
});

describe('WhyThisMatters', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe('WhyThisMatters Component Tests', () => {
    it('renders "Why This Matters" heading', () => {
      render(<WhyThisMatters content="Test content" />);

      expect(screen.getByText('Why This Matters')).toBeInTheDocument();
    });

    it('displays context content', () => {
      const content = 'Linear Algebra is the mathematical foundation of machine learning.';
      render(<WhyThisMatters content={content} />);

      expect(screen.getByText(content)).toBeInTheDocument();
    });

    it('is expanded by default', () => {
      render(<WhyThisMatters content="Test content" />);

      const toggleButton = screen.getByRole('button');
      expect(toggleButton).toHaveAttribute('aria-expanded', 'true');
    });

    it('collapses on toggle click', () => {
      render(<WhyThisMatters content="Test content" />);

      const toggleButton = screen.getByRole('button');
      expect(toggleButton).toHaveAttribute('aria-expanded', 'true');

      fireEvent.click(toggleButton);

      expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
    });

    it('expands on toggle click when collapsed', () => {
      render(<WhyThisMatters content="Test content" defaultExpanded={false} />);

      const toggleButton = screen.getByRole('button');
      expect(toggleButton).toHaveAttribute('aria-expanded', 'false');

      fireEvent.click(toggleButton);

      expect(toggleButton).toHaveAttribute('aria-expanded', 'true');
    });

    it('renders prerequisite links when available', () => {
      const prerequisites = [
        createMockPrerequisite({ id: 'p1', name: 'Python Basics' }),
        createMockPrerequisite({ id: 'p2', name: 'Linear Algebra' }),
      ];

      render(
        <WhyThisMatters
          content="Test content"
          prerequisites={prerequisites}
        />
      );

      expect(screen.getByText('Python Basics')).toBeInTheDocument();
      expect(screen.getByText('Linear Algebra')).toBeInTheDocument();
      expect(screen.getByText('Builds on:')).toBeInTheDocument();
    });
  });

  describe('Content Validation Tests', () => {
    it('truncates content exceeding max length', () => {
      const longContent = 'A'.repeat(600); // 600 characters, exceeds 500 max
      render(<WhyThisMatters content={longContent} />);

      const contentElement = screen.getByTestId('why-this-matters-content');
      expect(contentElement.textContent?.length).toBeLessThan(600);
      expect(contentElement.textContent).toContain('...');
    });

    it('handles empty content gracefully', () => {
      const { container } = render(<WhyThisMatters content={null} />);

      expect(container.querySelector('[data-testid="why-this-matters"]')).not.toBeInTheDocument();
    });

    it('sanitizes HTML in content', () => {
      const contentWithHtml = 'Test <script>alert("xss")</script> content';
      render(<WhyThisMatters content={contentWithHtml} />);

      const contentElement = screen.getByTestId('why-this-matters-content');
      expect(contentElement.textContent).not.toContain('<script>');
      expect(contentElement.textContent).toContain('Test');
      expect(contentElement.textContent).toContain('content');
    });
  });

  describe('Prerequisite Links Tests', () => {
    it('renders links to prerequisite modules', () => {
      const prerequisites = [createMockPrerequisite()];

      render(
        <WhyThisMatters
          content="Test content"
          prerequisites={prerequisites}
        />
      );

      expect(screen.getByTestId('prerequisite-link-prereq-1')).toBeInTheDocument();
    });

    it('navigates to prerequisite on click', () => {
      const onPrerequisiteClick = vi.fn();
      const prerequisites = [createMockPrerequisite({ id: 'skill-123' })];

      render(
        <WhyThisMatters
          content="Test content"
          prerequisites={prerequisites}
          onPrerequisiteClick={onPrerequisiteClick}
        />
      );

      const prereqLink = screen.getByTestId('prerequisite-link-skill-123');
      fireEvent.click(prereqLink);

      expect(onPrerequisiteClick).toHaveBeenCalledWith('skill-123');
      expect(onPrerequisiteClick).toHaveBeenCalledTimes(1);
    });

    it('shows no links when no prerequisites', () => {
      render(<WhyThisMatters content="Test content" prerequisites={[]} />);

      expect(screen.queryByText('Builds on:')).not.toBeInTheDocument();
    });

    it('shows no links when prerequisites is undefined', () => {
      render(<WhyThisMatters content="Test content" />);

      expect(screen.queryByText('Builds on:')).not.toBeInTheDocument();
    });

    it('renders multiple prerequisite links', () => {
      const prerequisites = [
        createMockPrerequisite({ id: 'p1', name: 'Skill 1' }),
        createMockPrerequisite({ id: 'p2', name: 'Skill 2' }),
        createMockPrerequisite({ id: 'p3', name: 'Skill 3' }),
      ];

      render(
        <WhyThisMatters
          content="Test content"
          prerequisites={prerequisites}
        />
      );

      expect(screen.getByText('Skill 1')).toBeInTheDocument();
      expect(screen.getByText('Skill 2')).toBeInTheDocument();
      expect(screen.getByText('Skill 3')).toBeInTheDocument();
    });
  });

  describe('Accessibility Tests', () => {
    it('has proper aria-expanded attribute', () => {
      render(<WhyThisMatters content="Test content" />);

      const toggleButton = screen.getByRole('button');
      expect(toggleButton).toHaveAttribute('aria-expanded', 'true');

      fireEvent.click(toggleButton);
      expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
    });

    it('is keyboard accessible - Enter key', () => {
      render(<WhyThisMatters content="Test content" />);

      const toggleButton = screen.getByRole('button');
      expect(toggleButton).toHaveAttribute('aria-expanded', 'true');

      fireEvent.keyDown(toggleButton, { key: 'Enter' });

      expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
    });

    it('is keyboard accessible - Space key', () => {
      render(<WhyThisMatters content="Test content" />);

      const toggleButton = screen.getByRole('button');
      expect(toggleButton).toHaveAttribute('aria-expanded', 'true');

      fireEvent.keyDown(toggleButton, { key: ' ' });

      expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
    });

    it('has proper heading hierarchy', () => {
      render(<WhyThisMatters content="Test content" />);

      const heading = screen.getByText('Why This Matters');
      expect(heading.tagName).toBe('H3');
    });

    it('has aria-controls attribute pointing to content', () => {
      render(<WhyThisMatters content="Test content" />);

      const toggleButton = screen.getByRole('button');
      expect(toggleButton).toHaveAttribute('aria-controls', 'why-this-matters-content');
    });
  });

  describe('Collapsed State Tests', () => {
    it('starts collapsed when defaultExpanded is false', () => {
      render(<WhyThisMatters content="Test content" defaultExpanded={false} />);

      const toggleButton = screen.getByRole('button');
      expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
    });

    it('preserves toggle state across multiple clicks', () => {
      render(<WhyThisMatters content="Test content" />);

      const toggleButton = screen.getByRole('button');

      // Initial state: expanded
      expect(toggleButton).toHaveAttribute('aria-expanded', 'true');

      // Click 1: collapsed
      fireEvent.click(toggleButton);
      expect(toggleButton).toHaveAttribute('aria-expanded', 'false');

      // Click 2: expanded
      fireEvent.click(toggleButton);
      expect(toggleButton).toHaveAttribute('aria-expanded', 'true');

      // Click 3: collapsed
      fireEvent.click(toggleButton);
      expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
    });
  });

  describe('Component Rendering', () => {
    it('renders with correct test id', () => {
      render(<WhyThisMatters content="Test content" />);

      expect(screen.getByTestId('why-this-matters')).toBeInTheDocument();
    });

    it('renders content test id', () => {
      render(<WhyThisMatters content="Test content" />);

      expect(screen.getByTestId('why-this-matters-content')).toBeInTheDocument();
    });

    it('does not render when content is empty string', () => {
      const { container } = render(<WhyThisMatters content="" />);

      // Empty string should be falsy and return null
      expect(container.querySelector('[data-testid="why-this-matters"]')).not.toBeInTheDocument();
    });
  });
});
