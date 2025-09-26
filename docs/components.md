# Component Documentation

This document provides an overview of the React components used in the Snowva application.

## Documents Workspace Components

### DocumentExportsTable

**Description**: A virtualized table component for displaying document export history with advanced filtering and sorting capabilities.

**Location**: `packages/web/src/features/documents/components/DocumentExportsTable.tsx`

**Props**:
- `items: DocumentExportListItem[]` - Array of document exports to display
- `virtualization?: VirtualizationConfig` - Optional virtualization settings for large datasets
- `searchTerm?: string` - Current search term for highlighting matches
- `onRowSelect: (exportId: string) => void` - Callback when user selects a row
- `activeSort: SortConfig` - Current sort configuration
- `onSortChange: (sort: SortConfig) => void` - Callback for sort changes
- `isLoading?: boolean` - Loading state indicator

**Key Features**:
- TanStack Virtual for performance with large datasets (>100 items)
- Real-time search highlighting across all text fields
- Interactive sort controls for all columns
- Status badges with color-coded indicators
- File size formatting with appropriate units
- Archive status indicators with retrieval information
- Responsive design with horizontal scrolling on mobile
- WCAG 2.1 AA accessibility compliance

**Usage Example**:
```tsx
<DocumentExportsTable
  items={documentExports}
  virtualization={virtualizationConfig}
  searchTerm="invoice"
  onRowSelect={handleRowSelect}
  activeSort={{ field: 'createdAt', direction: 'desc' }}
  onSortChange={handleSortChange}
  isLoading={false}
/>
```

**Operator Workflows**:
1. **Document Review**: Operators can quickly scan recent exports, identify status issues, and drill into specific documents
2. **Search Operations**: Use search to find specific documents by title, ID, or customer branch name
3. **Status Monitoring**: Visual indicators help operators identify failed or queued exports needing attention
4. **Archive Management**: Clear indicators show when documents are archived and need retrieval requests

### DocumentFiltersBar

**Description**: A comprehensive filtering interface providing search, multi-select filters, and persistent filter state management.

**Location**: `packages/web/src/features/documents/components/DocumentFiltersBar.tsx`

**Props**:
- `filters: DocumentFiltersValue` - Current filter values
- `onFiltersChange: DocumentFiltersBarChangeHandler` - Callback for filter changes
- `isDisabled?: boolean` - Whether filters are disabled (e.g., during loading)
- `storageKey?: string` - LocalStorage key for persisting filter state
- `className?: string` - Additional CSS classes

**Key Features**:
- Debounced search input (300ms delay) for performance
- Multi-select dropdowns for document types, statuses, and channels
- Automatic filter state persistence in localStorage
- Clear individual filters or reset all functionality
- Real-time filter application with immediate feedback
- Responsive collapse behavior on mobile devices
- Accessibility with full keyboard navigation support

**Usage Example**:
```tsx
<DocumentFiltersBar
  filters={currentFilters}
  onFiltersChange={handleFiltersChange}
  isDisabled={isLoading}
  storageKey="documents/workspace/filters"
/>
```

**Operator Workflows**:
1. **Targeted Search**: Operators can quickly find documents using search combined with filters
2. **Status Filtering**: Filter by export status to focus on failed, queued, or sent documents
3. **Channel Analysis**: Filter by delivery channel to analyze email vs portal distribution
4. **Type-Based Operations**: Filter by document type for bulk operations or specific workflows
5. **Filter Persistence**: Filters are automatically saved and restored between sessions

### DocumentPreviewModal

**Description**: A comprehensive modal for viewing document details, PDF preview, sharing controls, and audit trail information.

**Location**: `packages/web/src/features/documents/components/DocumentPreviewModal.tsx`

**Props**:
- `exportId: string` - ID of the document export to display
- `isOpen: boolean` - Whether the modal is visible
- `onClose: () => void` - Callback to close the modal

**Key Features**:
- Tabbed interface with Overview, Preview, and Audit Trail sections
- PDF preview with loading states and error handling
- Share link generation with security warnings
- Document resend functionality with confirmation
- Comprehensive audit trail with action history
- Archive status display with retrieval information
- Responsive design with mobile-optimized layout
- Focus trap and keyboard navigation for accessibility

**Usage Example**:
```tsx
<DocumentPreviewModal
  exportId={selectedExportId}
  isOpen={isModalOpen}
  onClose={handleModalClose}
/>
```

**Operator Workflows**:
1. **Document Verification**: Operators can preview PDFs to verify content before customer communication
2. **Share Link Management**: Generate secure share links for customer access with appropriate warnings
3. **Issue Resolution**: Use audit trail to investigate document delivery issues and track actions
4. **Customer Support**: Access complete document metadata for customer service interactions
5. **Resend Operations**: Retry failed deliveries directly from the interface
6. **Archive Coordination**: Handle archived document requests with clear status tracking

### PublicLinkWarning

**Description**: A security-focused warning component displayed when generating or using public share links.

**Location**: `packages/web/src/features/documents/components/PublicLinkWarning.tsx`

**Props**:
- `shareLink: string` - The generated share link URL
- `expiresAt: string` - ISO timestamp when the link expires
- `onAcknowledge?: () => void` - Optional callback when user acknowledges warning
- `compact?: boolean` - Whether to display in compact mode
- `className?: string` - Additional CSS classes

**Key Features**:
- Prominent security warnings with clear messaging
- Expiration countdown with visual indicators for urgency
- Compact mode for inline usage in other components
- Accessible color scheme with high contrast
- Responsive text wrapping for long URLs
- Clear security implications messaging

**Usage Example**:
```tsx
<PublicLinkWarning
  shareLink="https://app.snowva.com/share/abc123"
  expiresAt="2024-12-31T23:59:59.000Z"
  onAcknowledge={handleAcknowledge}
  compact={false}
/>
```

**Operator Workflows**:
1. **Security Awareness**: Operators understand the security implications of share links
2. **Customer Communication**: Clear warnings help operators communicate risks to customers
3. **Link Management**: Visual expiration indicators help manage link lifecycle
4. **Compliance**: Proper warnings support regulatory compliance for data sharing

## Documents Workspace Page

**Description**: The main documents workspace page that orchestrates all document-related components and workflows.

**Location**: `packages/web/src/app/(dashboard)/documents/page.tsx`

**Key Features**:
- Integrated document export listing with real-time updates
- Advanced filtering and search capabilities
- Archive status notifications with retrieval workflows
- Performance monitoring with SLA tracking
- Responsive design across all device sizes
- Error boundary with graceful fallback states

**Operator Workflows**:

### Daily Document Operations
1. **Morning Review**: Check overnight exports for failures or issues
2. **Status Monitoring**: Use filters to identify documents needing attention
3. **Customer Support**: Quickly locate and preview documents for customer inquiries
4. **Archive Management**: Process archived document retrieval requests
5. **Performance Monitoring**: Monitor export timing and system performance

### Troubleshooting Workflows
1. **Failed Export Investigation**:
   - Filter by "failed" status
   - Use audit trail to identify failure points
   - Coordinate with technical team for resolution
   - Resend documents once issues are resolved

2. **Archive Retrieval Process**:
   - Identify archived documents in search results
   - Note archive reference information
   - Submit retrieval request through proper channels
   - Track retrieval status and customer communication

3. **Share Link Management**:
   - Generate secure links for customer access
   - Monitor link expiration and usage
   - Handle security concerns and compliance requirements
   - Track link access through audit trails

### Compliance and Audit Support
1. **Audit Trail Review**: Use detailed audit logs for compliance reporting
2. **Data Access Tracking**: Monitor who accessed what documents when
3. **Security Incident Response**: Track and respond to security-related events
4. **Regulatory Reporting**: Extract data for regulatory compliance reports

## Integration Points

### Performance Monitoring
All document components integrate with the performance metrics system to track:
- Document export interaction response times (target: <1000ms)
- Filter response times (target: <300ms)  
- PDF preview loading times
- Share link generation performance

### Archive System Integration
Components automatically detect and handle archived documents:
- Visual indicators for archived status
- Retrieval request workflows
- Status tracking and communication
- Estimated retrieval timeframes

### Audit Trail Integration
Comprehensive logging of all document-related actions:
- Document access and preview events
- Share link generation and usage
- Export resend operations
- Filter and search activities
- Archive retrieval requests

## CustomerForm

- **Description**: A form for creating and editing customer information.
- **Props**: ...

... and so on for all other components.
