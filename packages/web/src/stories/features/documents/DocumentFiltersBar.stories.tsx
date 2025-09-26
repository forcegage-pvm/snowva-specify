import type { Meta, StoryObj } from '@storybook/react';

import { 
    DocumentFiltersBar,
    type DocumentFiltersValue,
    type DocumentFiltersChangeMeta 
} from '@/features/documents/components/DocumentFiltersBar';
import {
    withDocumentsQueryProvider,
    documentsStoryArgs,
} from '../../../../.storybook/mocks/documents';

const meta: Meta<typeof DocumentFiltersBar> = {
  title: 'Features/Documents/DocumentFiltersBar',
  component: DocumentFiltersBar,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
          The DocumentFiltersBar component provides comprehensive filtering and search capabilities for the documents workspace.
          
          **Accessibility Features:**
          - Full keyboard navigation support with tab order
          - ARIA labels for all interactive elements
          - Screen reader announcements for filter state changes
          - High contrast support for visual elements
          - Focus management and visible focus indicators
          
          **Key Features:**
          - Real-time search with debounced input
          - Date range filtering with calendar picker
          - Document type filtering with dropdown
          - Sort controls with visual indicators
          - Filter clearing and reset functionality
          - Responsive design for mobile devices
          
          **Performance:**
          - Optimized re-renders with React.memo
          - Debounced search input (300ms)
          - Efficient filter state management
          - SLA target: <300ms response time
        `,
      },
    },
  },
  decorators: [withDocumentsQueryProvider],
  argTypes: {
    filters: {
      description: 'Current filter values including search, date range, document type, and sort',
      table: { type: { summary: 'DocumentFiltersValue' } },
    },
    onFiltersChange: {
      description: 'Callback fired when any filter value changes',
      action: 'onFiltersChange',
      table: { type: { summary: '(filters: DocumentFiltersValue, meta: DocumentFiltersChangeMeta) => void' } },
    },
    isDisabled: {
      description: 'Whether all filter controls should be disabled',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    storageKey: {
      description: 'Key for localStorage to persist filter state',
      control: 'text',
      table: { defaultValue: { summary: 'snowva/documents/filters' } },
    },
    className: {
      description: 'Additional CSS classes for the container',
      control: 'text',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Default state with no active filters
export const Default: Story = {
  args: {
    filters: documentsStoryArgs.filters,
    onFiltersChange: (filters: DocumentFiltersValue, meta: DocumentFiltersChangeMeta) => {
      console.log('Filters changed:', filters, 'Meta:', meta);
    },
  },
};

// With search term active
export const WithSearch: Story = {
  args: {
    filters: {
      ...documentsStoryArgs.filters,
      search: 'invoice',
    },
    onFiltersChange: (filters: DocumentFiltersValue, meta: DocumentFiltersChangeMeta) => {
      console.log('Search filters changed:', filters, 'Meta:', meta);
    },
  },
};

// With all filters active
export const AllFiltersActive: Story = {
  args: {
    filters: {
      search: 'financial report',
      documentTypes: ['invoice', 'statement'],
      statuses: ['sent', 'queued'],
      channels: ['email', 'portal'],
    },
    onFiltersChange: (filters: DocumentFiltersValue, meta: DocumentFiltersChangeMeta) => {
      console.log('All filters changed:', filters, 'Meta:', meta);
    },
  },
};

// Loading state (disabled while loading)
export const LoadingState: Story = {
  args: {
    filters: documentsStoryArgs.filters,
    isDisabled: true,
    onFiltersChange: (filters: DocumentFiltersValue, meta: DocumentFiltersChangeMeta) => {
      console.log('Loading filters changed:', filters, 'Meta:', meta);
    },
  },
};

// Disabled state
export const Disabled: Story = {
  args: {
    filters: documentsStoryArgs.filters,
    isDisabled: true,
    onFiltersChange: (filters: DocumentFiltersValue, meta: DocumentFiltersChangeMeta) => {
      console.log('Disabled filters changed:', filters, 'Meta:', meta);
    },
  },
};

// Document type filtering
export const WithDocumentTypes: Story = {
  args: {
    filters: {
      ...documentsStoryArgs.filters,
      documentTypes: ['invoice', 'quote'],
    },
    onFiltersChange: (filters: DocumentFiltersValue, meta: DocumentFiltersChangeMeta) => {
      console.log('Document types filters changed:', filters, 'Meta:', meta);
    },
  },
};

// Status filtering
export const WithStatuses: Story = {
  args: {
    filters: {
      ...documentsStoryArgs.filters,
      statuses: ['sent', 'failed'],
    },
    onFiltersChange: (filters: DocumentFiltersValue, meta: DocumentFiltersChangeMeta) => {
      console.log('Status filters changed:', filters, 'Meta:', meta);
    },
  },
};

// Channel filtering
export const WithChannels: Story = {
  args: {
    filters: {
      ...documentsStoryArgs.filters,
      channels: ['email', 'portal'],
    },
    onFiltersChange: (filters: DocumentFiltersValue, meta: DocumentFiltersChangeMeta) => {
      console.log('Channel filters changed:', filters, 'Meta:', meta);
    },
  },
};

// Accessibility demonstration
export const AccessibilityDemo: Story = {
  args: {
    filters: {
      search: 'tax document',
      documentTypes: ['compliance'],
      statuses: ['sent'],
      channels: ['email'],
    },
    onFiltersChange: (filters: DocumentFiltersValue, meta: DocumentFiltersChangeMeta) => {
      console.log('Accessibility demo filters changed:', filters, 'Meta:', meta);
    },
  },
  parameters: {
    docs: {
      description: {
        story: `
          This story demonstrates all accessibility features:
          - Use Tab/Shift+Tab to navigate between filter controls
          - Use Enter/Space to activate dropdowns and buttons
          - Use Arrow keys to navigate within dropdowns
          - Use Escape to close dropdowns
          - Screen readers will announce filter state changes
          - All controls have proper ARIA labels and descriptions
        `,
      },
    },
  },
};