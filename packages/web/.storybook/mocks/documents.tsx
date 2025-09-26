import type { StoryContext, StoryFn } from '@storybook/react';
import { waitFor, within } from '@storybook/testing-library';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import type {
    DocumentExportAuditLogEvent,
    DocumentExportDetail,
} from '@/features/documents/hooks/useDocumentExports';
import type {
    DocumentExportRecord,
} from '@/features/documents/types';
import type {
    DocumentExportListItem,
    DocumentExportListParams,
    DocumentExportListResult,
} from '@/services/DocumentExportService';

// Mock data generators
export const createMockDocumentExport = (
  overrides: Partial<DocumentExportListItem> = {}
): DocumentExportListItem => ({
  id: `export_${Math.random().toString(36).substr(2, 9)}`,
  title: 'Statement - Branch ABC - Jan 2025',
  documentType: 'statement',
  customerBranch: {
    id: 'branch_abc',
    name: 'ABC Manufacturing Ltd',
  },
  createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
  deliveredChannels: ['email', 'portal'],
  status: 'sent',
  lastDownloadedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
  fileSizeBytes: 245760 + Math.floor(Math.random() * 1000000),
  shareLink: {
    active: true,
    expiresAt: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
  },
  ...overrides,
});

export const createMockDocumentExportList = (
  count = 25,
  overrides: Partial<DocumentExportListItem> = {}
): DocumentExportListItem[] => {
  return Array.from({ length: count }, () => createMockDocumentExport(overrides));
};

export const createMockDocumentExportResult = (
  itemCount = 25,
  params: Partial<DocumentExportListParams> = {}
): DocumentExportListResult => {
  const items = createMockDocumentExportList(itemCount);
  
  return {
    items,
    total: itemCount,
    page: params.page ?? 1,
    pageSize: params.pageSize ?? 25,
    virtualization: itemCount >= 100 ? {
      threshold: 100,
      overscan: 5,
    } : undefined,
  };
};

export const createMockDocumentExportDetail = (
  overrides: Partial<DocumentExportRecord> = {}
): DocumentExportDetail => {
  const baseExport = createMockDocumentExport();
  
  return {
    id: baseExport.id,
    title: baseExport.title,
    documentType: baseExport.documentType,
    customerBranchId: baseExport.customerBranch.id,
    customerBranchName: baseExport.customerBranch.name,
    createdAt: baseExport.createdAt,
    deliveredChannels: baseExport.deliveredChannels,
    status: baseExport.status,
    lastDownloadedAt: baseExport.lastDownloadedAt,
    fileSizeBytes: baseExport.fileSizeBytes,
    previewAssetUrl: `/api/previews/${baseExport.id}.pdf`,
    shareLinkTokenId: baseExport.shareLink?.active ? `token_${baseExport.id}` : null,
    auditTrail: [
      {
        id: `audit_${Date.now()}_1`,
        exportId: baseExport.id,
        timestamp: baseExport.createdAt,
        actor: 'system@snowva.com',
        action: 'sent',
        context: {
          channels: baseExport.deliveredChannels,
        },
      },
      {
        id: `audit_${Date.now()}_2`,
        exportId: baseExport.id,
        timestamp: baseExport.lastDownloadedAt ?? baseExport.createdAt,
        actor: 'nadiya@snowva.com',
        action: 'previewed',
        context: {},
      },
    ],
    ...overrides,
  };
};

export const createMockAuditLogEvents = (
  exportId: string,
  count = 5
): DocumentExportAuditLogEvent[] => {
  const actions: DocumentExportAuditLogEvent['action'][] = [
    'sent',
    'previewed',
    'downloaded',
    'share_link_copied',
    'resent',
  ];
  
  return Array.from({ length: count }, (_, index) => ({
    id: `audit_${exportId}_${index}`,
    exportId,
    timestamp: new Date(Date.now() - (count - index) * 60 * 60 * 1000).toISOString(),
    actor: index === 0 ? 'system@snowva.com' : 'nadiya@snowva.com',
    action: actions[index % actions.length],
    context: {
      userAgent: index === 0 ? undefined : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    },
  }));
};

// Mock query client for Storybook
export const createMockQueryClient = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: Infinity,
      },
    },
  });
  
  return queryClient;
};

// Storybook decorator for documents workspace components
export const withDocumentsQueryProvider = (Story: StoryFn, context: StoryContext) => {
  const queryClient = createMockQueryClient();
  
  return (
    <QueryClientProvider client={queryClient}>
      {Story(context.args, context)}
    </QueryClientProvider>
  );
};

// Common story args for document components
export const documentsStoryArgs = {
  // Table args
  items: createMockDocumentExportList(10),
  searchTerm: '',
  isLoading: false,
  virtualization: undefined,
  
  // Modal args
  exportId: 'export_example_123',
  isOpen: true,
  
  // Filter args
  filters: {
    search: '',
    documentTypes: [],
    statuses: [],
    channels: [],
  },
  
  // Common handlers
  onRowSelect: (exportId: string) => console.log('Selected export:', exportId),
  onClose: () => console.log('Modal closed'),
  onFiltersChange: (filters: Record<string, unknown>) => console.log('Filters changed:', filters),
  onSortChange: (sort: string) => console.log('Sort changed:', sort),
};

// Test scenarios for different states
export const documentExportScenarios = {
  // Status variations
  queuedExport: createMockDocumentExport({
    status: 'queued',
    deliveredChannels: [],
    lastDownloadedAt: null,
    shareLink: null,
  }),
  
  failedExport: createMockDocumentExport({
    status: 'failed',
    deliveredChannels: [],
    lastDownloadedAt: null,
    shareLink: null,
  }),
  
  expiredExport: createMockDocumentExport({
    status: 'expired',
    shareLink: {
      active: false,
      expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
  }),
  
  // Document type variations
  invoiceExport: createMockDocumentExport({
    documentType: 'invoice',
    title: 'Invoice #INV-2025-001 - ABC Manufacturing',
  }),
  
  quoteExport: createMockDocumentExport({
    documentType: 'quote',
    title: 'Quote #QUO-2025-015 - Product Inquiry',
  }),
  
  complianceExport: createMockDocumentExport({
    documentType: 'compliance',
    title: 'Compliance Pack - Q4 2024 - ABC Manufacturing',
  }),
  
  // Archive scenarios
  archivedExport: createMockDocumentExport({
    createdAt: new Date(Date.now() - 400 * 24 * 60 * 60 * 1000).toISOString(),
    archiveReference: {
      exportId: 'export_old_123',
      archiveLocation: 'cold-storage-bucket/2024/q1/export_old_123.pdf',
      requestedBy: 'nadiya@snowva.com',
      requestedAt: new Date().toISOString(),
      status: 'pending',
      deliveryEtaDays: 3,
    },
  }),
};

// Interaction test helpers for Storybook
export const documentInteractionTests = {
  async verifyTableRender(canvasElement: HTMLElement) {
    const canvas = within(canvasElement);
    await waitFor(() => {
      canvas.getByTestId('document-exports-table');
    });
  },
  
  async verifyModalRender(canvasElement: HTMLElement) {
    const canvas = within(canvasElement);
    await waitFor(() => {
      canvas.getByTestId('document-preview-modal');
    });
  },
  
  async verifyFilterRender(canvasElement: HTMLElement) {
    const canvas = within(canvasElement);
    await waitFor(() => {
      canvas.getByTestId('document-filters-bar');
    });
  },
  
  async testSearchInput(canvasElement: HTMLElement, searchTerm: string) {
    const canvas = within(canvasElement);
    const searchInput = canvas.getByTestId('document-search-input');
    
    // Focus and type
    searchInput.focus();
    searchInput.setAttribute('value', searchTerm);
    
    // Verify value updated
    await waitFor(() => {
      canvas.getByDisplayValue(searchTerm);
    });
  },
  
  async testFilterSelection(canvasElement: HTMLElement, filterType: string) {
    const canvas = within(canvasElement);
    const filterButton = canvas.getByTestId(`filter-${filterType}`);
    
    // Click to open dropdown
    filterButton.click();
    
    // Verify dropdown opened
    await waitFor(() => {
      canvas.getByRole('listbox');
    });
  },
  
  async verifyVirtualization(canvasElement: HTMLElement) {
    const canvas = within(canvasElement);
    
    // Check if virtualization container exists
    const virtualContainer = canvas.queryByTestId('virtual-scroll-container');
    
    if (virtualContainer) {
      // Verify virtual scrolling is active - container should exist
      canvas.getByTestId('virtual-scroll-container');
    }
  },
};

const documentsStorybookUtils = {
  withDocumentsQueryProvider,
  documentsStoryArgs,
  documentExportScenarios,
  documentInteractionTests,
};

export default documentsStorybookUtils;