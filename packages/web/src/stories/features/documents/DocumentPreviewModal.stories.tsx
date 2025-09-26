import type { Meta, StoryObj } from '@storybook/react';

import { DocumentPreviewModal } from '@/features/documents/components/DocumentPreviewModal';
import {
    withDocumentsQueryProvider,
    documentExportScenarios,
} from '../../../../.storybook/mocks/documents';

const meta: Meta<typeof DocumentPreviewModal> = {
  title: 'Features/Documents/DocumentPreviewModal',
  component: DocumentPreviewModal,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
          The DocumentPreviewModal component displays detailed information about a document export with preview capabilities.
          
          **Accessibility Features:**
          - Full keyboard navigation with tab order
          - ARIA modal roles and focus management
          - Screen reader announcements for status changes
          - High contrast support for text and buttons
          - Escape key to close modal
          - Focus trap within modal content
          
          **Key Features:**
          - Document metadata display with export details
          - PDF preview iframe with loading states
          - Share link generation and management
          - Resend document action with confirmation
          - Audit trail tab with action history
          - Share link warning banner integration
          - Archive status notifications
          
          **Performance:**
          - Lazy loading of PDF preview content
          - Optimized re-renders with React.memo
          - Efficient audit trail pagination
          - SLA target: <1000ms for interactions
        `,
      },
    },
  },
  decorators: [withDocumentsQueryProvider],
  argTypes: {
    exportId: {
      description: 'ID of the document export to display',
      control: 'text',
    },
    isOpen: {
      description: 'Whether the modal is open and visible',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    onClose: {
      description: 'Callback fired when modal should be closed',
      action: 'onClose',
      table: { type: { summary: '() => void' } },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Default modal state with standard document export
export const Default: Story = {
  args: {
    exportId: 'export_example_123',
    isOpen: true,
    onClose: () => console.log('Modal closed'),
  },
};

// Modal closed state
export const Closed: Story = {
  args: {
    exportId: 'export_example_123',
    isOpen: false,
    onClose: () => console.log('Modal closed'),
  },
};

// Queued export status
export const QueuedExport: Story = {
  args: {
    exportId: documentExportScenarios.queuedExport.id,
    isOpen: true,
    onClose: () => console.log('Modal closed - queued export'),
  },
};

// Failed export status
export const FailedExport: Story = {
  args: {
    exportId: documentExportScenarios.failedExport.id,
    isOpen: true,
    onClose: () => console.log('Modal closed - failed export'),
  },
};

// Expired export with inactive share link
export const ExpiredExport: Story = {
  args: {
    exportId: documentExportScenarios.expiredExport.id,
    isOpen: true,
    onClose: () => console.log('Modal closed - expired export'),
  },
};

// Invoice document type
export const InvoiceDocument: Story = {
  args: {
    exportId: documentExportScenarios.invoiceExport.id,
    isOpen: true,
    onClose: () => console.log('Modal closed - invoice document'),
  },
};

// Quote document type
export const QuoteDocument: Story = {
  args: {
    exportId: documentExportScenarios.quoteExport.id,
    isOpen: true,
    onClose: () => console.log('Modal closed - quote document'),
  },
};

// Compliance document type
export const ComplianceDocument: Story = {
  args: {
    exportId: documentExportScenarios.complianceExport.id,
    isOpen: true,
    onClose: () => console.log('Modal closed - compliance document'),
  },
};

// Archived document
export const ArchivedDocument: Story = {
  args: {
    exportId: documentExportScenarios.archivedExport.id,
    isOpen: true,
    onClose: () => console.log('Modal closed - archived document'),
  },
};

// Loading state simulation
export const LoadingState: Story = {
  args: {
    exportId: 'loading_simulation_id',
    isOpen: true,
    onClose: () => console.log('Modal closed - loading state'),
  },
};

// Accessibility and keyboard navigation demonstration
export const AccessibilityDemo: Story = {
  args: {
    exportId: 'export_example_123',
    isOpen: true,
    onClose: () => console.log('Modal closed - accessibility demo'),
  },
  parameters: {
    docs: {
      description: {
        story: `
          This story demonstrates all accessibility features:
          - Press Tab to navigate through interactive elements
          - Press Escape to close the modal
          - Use Enter/Space to activate buttons
          - Arrow keys navigate within tabs
          - Screen readers announce modal state changes
          - Focus is trapped within the modal
          - Initial focus goes to close button
          - Focus returns to trigger element on close
        `,
      },
    },
  },
};

// Error state handling
export const ErrorState: Story = {
  args: {
    exportId: 'non_existent_export_id',
    isOpen: true,
    onClose: () => console.log('Modal closed - error state'),
  },
};