import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from '@storybook/test';

import { DocumentExportsTable } from '@/features/documents/components/DocumentExportsTable';
import {
    withDocumentsQueryProvider,
    documentsStoryArgs,
    documentExportScenarios,
    documentInteractionTests,
} from '../../../../.storybook/mocks/documents';

const meta: Meta<typeof DocumentExportsTable> = {
  title: 'Features/Documents/DocumentExportsTable',
  component: DocumentExportsTable,
  decorators: [withDocumentsQueryProvider],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
# DocumentExportsTable

A virtualized table component for displaying document export history with sorting, search highlighting, and status indicators.

## Features

- **Virtualization**: Uses TanStack Virtual for efficient rendering of large datasets (100+ rows)
- **Search highlighting**: Highlights matching text in document titles and branch names
- **Status indicators**: Color-coded status chips with clear visual hierarchy
- **Sort controls**: Interactive sort chips for different column options
- **Responsive design**: Adapts to different screen sizes with mobile-optimized layouts
- **Accessibility**: WCAG 2.1 AA compliant with proper ARIA labels and keyboard navigation

## Performance

- Virtualization threshold: 100 rows
- Target render time: <300ms for filter responses
- Overscan: 5 rows for smooth scrolling

## Accessibility Notes

- All interactive elements are keyboard accessible
- Status indicators use both color and text for clarity
- Proper heading hierarchy and table semantics
- Screen reader friendly with descriptive labels
        `,
      },
    },
  },
  argTypes: {
    items: {
      control: false,
      description: 'Array of document export items to display',
    },
    isLoading: {
      control: 'boolean',
      description: 'Shows loading state when true',
    },
    searchTerm: {
      control: 'text',
      description: 'Search term to highlight in results',
    },
    activeSort: {
      control: 'select',
      options: ['createdAt', 'title', 'status', 'lastDownloadedAt'],
      description: 'Currently active sort option',
    },
    onRowSelect: {
      action: 'rowSelected',
      description: 'Callback when a row is clicked',
    },
    onSortChange: {
      action: 'sortChanged',
      description: 'Callback when sort option is changed',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Default state with mixed export types
export const Default: Story = {
  args: {
    ...documentsStoryArgs,
  },
  play: async ({ canvasElement }) => {
    await documentInteractionTests.verifyTableRender(canvasElement);
  },
};

// Loading state
export const Loading: Story = {
  args: {
    ...documentsStoryArgs,
    isLoading: true,
    items: [],
  },
};

// Empty state
export const Empty: Story = {
  args: {
    ...documentsStoryArgs,
    items: [],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByTestId('empty-state')).toBeVisible();
  },
};

// Search highlighting
export const WithSearchHighlight: Story = {
  args: {
    ...documentsStoryArgs,
    searchTerm: 'ABC',
  },
};

// Different document statuses
export const QueuedDocuments: Story = {
  args: {
    ...documentsStoryArgs,
    items: [
      documentExportScenarios.queuedExport,
      documentExportScenarios.queuedExport,
      documentExportScenarios.queuedExport,
    ],
  },
};

export const FailedDocuments: Story = {
  args: {
    ...documentsStoryArgs,
    items: [
      documentExportScenarios.failedExport,
      documentExportScenarios.failedExport,
    ],
  },
};

export const ExpiredDocuments: Story = {
  args: {
    ...documentsStoryArgs,
    items: [
      documentExportScenarios.expiredExport,
      documentExportScenarios.expiredExport,
    ],
  },
};

// Different document types
export const DocumentTypes: Story = {
  args: {
    ...documentsStoryArgs,
    items: [
      documentExportScenarios.invoiceExport,
      documentExportScenarios.quoteExport,
      documentExportScenarios.complianceExport,
    ],
  },
};

// Archived documents
export const ArchivedDocuments: Story = {
  args: {
    ...documentsStoryArgs,
    items: [
      documentExportScenarios.archivedExport,
    ],
  },
};

// Large dataset with virtualization
export const LargeDataset: Story = {
  args: {
    ...documentsStoryArgs,
    virtualization: {
      threshold: 100,
      overscan: 5,
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates virtualization behavior with a large dataset. Virtual scrolling is enabled when 100+ rows are present.',
      },
    },
  },
};

// Sort variations
export const SortedByTitle: Story = {
  args: {
    ...documentsStoryArgs,
    activeSort: 'title',
  },
};

export const SortedByStatus: Story = {
  args: {
    ...documentsStoryArgs,
    activeSort: 'status',
  },
};

export const SortedByLastDownloaded: Story = {
  args: {
    ...documentsStoryArgs,
    activeSort: 'lastDownloadedAt',
  },
};