import { QuoteStatusBadge } from '@/components/quotes/QuoteStatusBadge';
import { QuoteStatus } from '@/types/quotes/QuoteStatus';
import { describe, expect, it } from '@jest/globals';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

describe('QuoteStatusBadge', () => {
  describe('Basic Rendering', () => {
    it('should render with status label', () => {
      render(<QuoteStatusBadge status={QuoteStatus.Pending} />);
      
      expect(screen.getByText('Pending')).toBeInTheDocument();
      expect(screen.getByLabelText('Quote status: Pending')).toBeInTheDocument();
    });

    it('should render with status icon by default', () => {
      render(<QuoteStatusBadge status={QuoteStatus.Approved} />);
      
      expect(screen.getByTestId('status-icon')).toBeInTheDocument();
      expect(screen.getByTestId('status-label')).toHaveTextContent('Approved');
    });

    it('should render without icon when showIcon is false', () => {
      render(<QuoteStatusBadge status={QuoteStatus.Draft} showIcon={false} />);
      
      expect(screen.queryByTestId('status-icon')).not.toBeInTheDocument();
      expect(screen.getByTestId('status-label')).toHaveTextContent('Draft');
    });
  });

  describe('All Status Types', () => {
    const statusTestCases = [
      { status: QuoteStatus.Draft, label: 'Draft' },
      { status: QuoteStatus.Pending, label: 'Pending' },
      { status: QuoteStatus.Approved, label: 'Approved' },
      { status: QuoteStatus.Rejected, label: 'Rejected' },
      { status: QuoteStatus.Converted, label: 'Converted' },
      { status: QuoteStatus.Archived, label: 'Archived' }
    ];

    statusTestCases.forEach(({ status, label }) => {
      it(`should render ${status} status correctly`, () => {
        render(<QuoteStatusBadge status={status} />);
        
        expect(screen.getByText(label)).toBeInTheDocument();
        expect(screen.getByLabelText(`Quote status: ${label}`)).toBeInTheDocument();
        expect(screen.getByTestId(`quote-status-badge-${status.toLowerCase()}`)).toBeInTheDocument();
      });
    });
  });

  describe('Size Variants', () => {
    it('should apply small size classes', () => {
      render(<QuoteStatusBadge status={QuoteStatus.Pending} size="sm" />);
      
      const badge = screen.getByRole('status');
      expect(badge).toHaveClass('px-2', 'py-0.5', 'text-xs');
    });

    it('should apply medium size classes (default)', () => {
      render(<QuoteStatusBadge status={QuoteStatus.Pending} size="md" />);
      
      const badge = screen.getByRole('status');
      expect(badge).toHaveClass('px-2.5', 'py-1', 'text-sm');
    });

    it('should apply large size classes', () => {
      render(<QuoteStatusBadge status={QuoteStatus.Pending} size="lg" />);
      
      const badge = screen.getByRole('status');
      expect(badge).toHaveClass('px-3', 'py-1.5', 'text-base');
    });

    it('should default to medium size when no size prop provided', () => {
      render(<QuoteStatusBadge status={QuoteStatus.Pending} />);
      
      const badge = screen.getByRole('status');
      expect(badge).toHaveClass('px-2.5', 'py-1', 'text-sm');
    });
  });

  describe('Style Variants', () => {
    it('should apply default variant styling', () => {
      render(<QuoteStatusBadge status={QuoteStatus.Approved} variant="default" />);
      
      const badge = screen.getByRole('status');
      expect(badge).toHaveClass('bg-green-100', 'text-green-800');
    });

    it('should apply outline variant styling', () => {
      render(<QuoteStatusBadge status={QuoteStatus.Approved} variant="outline" />);
      
      const badge = screen.getByRole('status');
      expect(badge).toHaveClass('border', 'border-green-300', 'text-green-700', 'bg-green-50');
    });

    it('should apply solid variant styling', () => {
      render(<QuoteStatusBadge status={QuoteStatus.Approved} variant="solid" />);
      
      const badge = screen.getByRole('status');
      expect(badge).toHaveClass('bg-green-600', 'text-white');
    });
  });

  describe('Custom Styling', () => {
    it('should accept custom className', () => {
      render(
        <QuoteStatusBadge 
          status={QuoteStatus.Draft} 
          className="custom-class" 
        />
      );
      
      const badge = screen.getByRole('status');
      expect(badge).toHaveClass('custom-class');
    });

    it('should combine custom className with default classes', () => {
      render(
        <QuoteStatusBadge 
          status={QuoteStatus.Pending} 
          className="ml-2 font-bold" 
        />
      );
      
      const badge = screen.getByRole('status');
      expect(badge).toHaveClass('ml-2', 'font-bold', 'inline-flex', 'items-center');
    });
  });

  describe('Color Classes for Each Status', () => {
    const colorTestCases = [
      { 
        status: QuoteStatus.Draft, 
        expectedClasses: ['bg-gray-100', 'text-gray-800'] 
      },
      { 
        status: QuoteStatus.Pending, 
        expectedClasses: ['bg-yellow-100', 'text-yellow-800'] 
      },
      { 
        status: QuoteStatus.Approved, 
        expectedClasses: ['bg-green-100', 'text-green-800'] 
      },
      { 
        status: QuoteStatus.Rejected, 
        expectedClasses: ['bg-red-100', 'text-red-800'] 
      },
      { 
        status: QuoteStatus.Converted, 
        expectedClasses: ['bg-blue-100', 'text-blue-800'] 
      },
      { 
        status: QuoteStatus.Archived, 
        expectedClasses: ['bg-gray-100', 'text-gray-800'] 
      }
    ];

    colorTestCases.forEach(({ status, expectedClasses }) => {
      it(`should apply correct colors for ${status} status`, () => {
        render(<QuoteStatusBadge status={status} />);
        
        const badge = screen.getByRole('status');
        expectedClasses.forEach(className => {
          expect(badge).toHaveClass(className);
        });
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<QuoteStatusBadge status={QuoteStatus.Pending} />);
      
      const badge = screen.getByRole('status');
      expect(badge).toHaveAttribute('role', 'status');
      expect(badge).toHaveAttribute('aria-label', 'Quote status: Pending');
    });

    it('should have proper data-testid attributes', () => {
      render(<QuoteStatusBadge status={QuoteStatus.Approved} />);
      
      expect(screen.getByTestId('quote-status-badge-approved')).toBeInTheDocument();
      expect(screen.getByTestId('status-label')).toBeInTheDocument();
      expect(screen.getByTestId('status-icon')).toBeInTheDocument();
    });

    it('should mark icon as aria-hidden', () => {
      render(<QuoteStatusBadge status={QuoteStatus.Draft} />);
      
      const icon = screen.getByTestId('status-icon');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });

    it('should not have aria-hidden icon when showIcon is false', () => {
      render(<QuoteStatusBadge status={QuoteStatus.Draft} showIcon={false} />);
      
      expect(screen.queryByTestId('status-icon')).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle all possible status values', () => {
      // Test that we can render every enum value without errors
      Object.values(QuoteStatus).forEach(status => {
        const { unmount } = render(<QuoteStatusBadge status={status} />);
        expect(screen.getByRole('status')).toBeInTheDocument();
        unmount();
      });
    });

    it('should maintain consistent structure across all variants', () => {
      const variants = ['default', 'outline', 'solid'] as const;
      
      variants.forEach(variant => {
        const { unmount } = render(
          <QuoteStatusBadge 
            status={QuoteStatus.Pending} 
            variant={variant}
            data-testid={`badge-${variant}`}
          />
        );
        
        const badge = screen.getByRole('status');
        expect(badge).toHaveClass('inline-flex', 'items-center', 'rounded-full', 'font-medium');
        unmount();
      });
    });
  });
});