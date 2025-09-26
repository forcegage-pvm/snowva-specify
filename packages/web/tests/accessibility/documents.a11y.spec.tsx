/* eslint-disable @typescript-eslint/no-require-imports */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

import DocumentsPage from '@/app/(dashboard)/documents/page';

const { axe, toHaveNoViolations } = require('jest-axe');

expect.extend(toHaveNoViolations);

describe('Accessibility: Documents workspace', () => {
  it('maintains keyboard focus order with labelled controls', () => {
    const { container } = render(<DocumentsPage />);
    const focusables = Array.from(
      container.querySelectorAll('[data-focus-sequence]')
    ) as HTMLElement[];

    expect(focusables.length).toBeGreaterThanOrEqual(4);
    expect(focusables.map((node) => node.dataset.focusSequence)).toEqual([
      'search',
      'filters',
      'table',
      'preview',
    ]);
    focusables.forEach((node) => {
      expect(node).toHaveAttribute('aria-label');
    });
  });

  it('annotates export table and preview modal with ARIA landmarks', () => {
    render(<DocumentsPage />);

    const table = screen.getByRole('table', { name: /export history/i });
    expect(table).toHaveAttribute('aria-describedby');

    const openPreview = screen.getByRole('button', { name: /view preview/i });
    openPreview.click();

    const dialog = screen.getByRole('dialog', { name: /document preview/i });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby');
  });

  it('applies contrast-aware tokens to table rows and modal surfaces', () => {
    render(<DocumentsPage />);

    const tableSurface = screen.getByTestId('documents-table');
    expect(tableSurface).toHaveClass('bg-surface-strong', 'text-foreground');

    const modalSurface = screen.getByTestId('documents-preview-modal');
    expect(modalSurface).toHaveClass('bg-surface-overlay', 'text-contrast-strong');
  });

  it('passes automated axe accessibility checks once rendered', async () => {
    const { container } = render(<DocumentsPage />);
    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });
});
