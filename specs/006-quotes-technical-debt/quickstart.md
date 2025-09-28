# Quickstart Guide: Quotes Technical Debt Resolution

**Generated**: September 28, 2025  
**Feature**: 007-quotes-technical-debt  
**Target Audience**: Developers implementing the quotes system fixes

## Overview

This guide provides step-by-step instructions for implementing the quotes technical debt resolution, focusing on fixing broken functionality and implementing missing features. Follow the constitutional development principles throughout.

## Prerequisites

### Development Environment  
- ✅ Node.js 18+ and TypeScript 5.1+ installed
- ✅ Next.js 15 development environment configured
- ✅ Constitutional framework tools available (`.specify/tools/constitutional-checker.js`)
- ✅ Component status template (`.specify/templates/component-status-template.md`)

### Required Knowledge
- React 18 with hooks and state management
- TanStack Query for data fetching and caching  
- Tailwind CSS for styling
- Zod for data validation
- Test-Driven Development principles

### Codebase Familiarity
- Existing quote components in `/src/components/quotes/`
- Current API patterns and service layer structure
- Mock data location and structure
- Test setup and constitutional validation tools

## Phase 1: Critical Fixes (P0) - Restore Broken Functionality

### Step 1.1: Fix QuoteActionMenu Business Logic
**Current Issue**: All actions use `console.log` instead of business logic
**Target File**: `src/components/quotes/QuoteActionMenu.tsx`

```typescript
// BEFORE (broken):
const handleEdit = () => {
  console.log('Edit quote:', quote.id)
}

// AFTER (working):
const handleEdit = async () => {
  try {
    setLoading(true)
    await onEdit(quote.id)
    toast.success('Quote opened for editing')
  } catch (error) {
    toast.error('Failed to open quote for editing')
  } finally {
    setLoading(false)
  }
}
```

**Implementation Steps**:
1. Replace console.log calls with actual async operations
2. Add loading states for each action
3. Implement error handling with user feedback
4. Add success notifications
5. Write unit tests for each action handler
6. **Constitutional Validation**: Verify with MCP browser testing

### Step 1.2: Restore Quote Composer Navigation
**Current Issue**: Navigation to QuoteComposer is commented out
**Target Files**: `src/components/quotes/QuoteList.tsx`, routing configuration

```typescript
// BEFORE (commented out):
// router.push(`/quotes/edit/${quote.id}`)

// AFTER (working):
const handleEditQuote = (quoteId: string) => {
  router.push(`/quotes/edit/${quoteId}`)
}
```

**Implementation Steps**:
1. Uncomment and fix navigation calls
2. Ensure QuoteComposer routes are properly configured
3. Add loading states during navigation
4. Test navigation flow with mock data
5. **Constitutional Validation**: Browser test full edit flow

### Step 1.3: Implement API Integration  
**Current Issue**: Quote operations not connected to API
**Target Files**: `src/services/quoteService.ts`, hook implementations

**Implementation Steps**:
1. Create proper API service methods
2. Implement TanStack Query mutations for each operation
3. Add optimistic updates where appropriate
4. Handle API errors and timeouts
5. **Constitutional Validation**: Test with network failures

## Phase 2: Missing Features (P1) - Implement New Functionality

### Step 2.1: Build Export System
**Target**: PDF for individual quotes, Excel for bulk lists

**Component Structure**:
```typescript
src/components/quotes/export/
├── QuoteExportButton.tsx     // Trigger export
├── QuoteExportModal.tsx      // Export options
├── ExportProgress.tsx        // Progress tracking
└── useQuoteExport.ts         // Export logic hook
```

**Implementation Steps**:
1. Create export request UI components
2. Implement PDF generation service (individual quotes)
3. Implement Excel generation service (bulk data)
4. Add progress tracking with cancel option
5. **Constitutional Testing**: Test with large datasets

### Step 2.2: Implement Bulk Operations
**Target**: Progress bar with cancel option and completion notification

**Component Structure**:
```typescript
src/components/quotes/bulk/
├── BulkOperationBar.tsx      // Action bar when items selected
├── BulkProgressModal.tsx     // Progress with cancel
├── useBulkOperations.ts      // Bulk logic hook
└── BulkOperationTypes.ts     // Type definitions
```

**Implementation Steps**:
1. Create bulk operation selection UI
2. Implement progress tracking system
3. Add cancel functionality
4. Implement completion notifications
5. **Constitutional Testing**: Test cancellation scenarios

### Step 2.3: Add Date Range Filtering
**Target**: Date picker with preset ranges (Today, This Week, This Month)

**Implementation Steps**:
1. Add date range picker component
2. Implement preset date ranges
3. Integrate with existing filter system
4. Add filter state persistence
5. **Constitutional Testing**: Validate filter combinations

## Phase 3: User Experience (P2) - Polish and Accessibility

### Step 3.1: Implement Quick Preview Modal
**Target**: Quote details without navigation

**Implementation Steps**:
1. Create QuotePreviewModal component
2. Add hover/click triggers in quote list
3. Implement modal with quote details
4. Add accessibility features (focus management)
5. **Constitutional Testing**: Screen reader compatibility

### Step 3.2: Enhanced Search Implementation
**Target**: Quote number and customer name specific searches

**Implementation Steps**:
1. Add search type selector (All/Quote Number/Customer)
2. Implement search debouncing
3. Add search result highlighting
4. Optimize search performance
5. **Constitutional Testing**: Search performance with 1,000+ quotes

## Implementation Guidelines

### Constitutional Development Approach

#### Evidence-First Progress Reporting
```bash
# After each component completion:
node .specify/tools/constitutional-checker.js docs/component-status/quotes-status.md

# Expected output:
✅ LEVEL 4: QuoteActionMenu - Business logic implemented, tested, MCP validated
✅ LEVEL 4: QuoteComposer - Navigation restored, error handling added, tested
```

#### Test-First Development
```typescript
// Write tests BEFORE implementation:
describe('QuoteActionMenu', () => {
  it('should call onEdit when edit button clicked', async () => {
    const onEdit = jest.fn()
    render(<QuoteActionMenu quote={mockQuote} onEdit={onEdit} />)
    
    fireEvent.click(screen.getByText('Edit'))
    
    expect(onEdit).toHaveBeenCalledWith(mockQuote.id)
  })
})
```

#### Component-First Architecture
```typescript
// Each feature as reusable component:
export const QuoteActionMenu: React.FC<QuoteActionMenuProps> = ({
  quote,
  onEdit,
  onDuplicate,
  onConvert,
  onArchive,
  permissions = DEFAULT_PERMISSIONS
}) => {
  // Implementation with Tailwind CSS patterns
}
```

### Performance Requirements

#### Progressive Loading Implementation
```typescript
// Use skeleton states during loading:
{isLoading ? (
  <QuoteListSkeleton count={pageSize} />
) : (
  <QuoteList quotes={quotes} />
)}
```

#### 100ms Response Time Maintenance
```typescript
// Optimize interactions with immediate feedback:
const handleStatusChange = async (newStatus: QuoteStatus) => {
  // Optimistic update
  setOptimisticStatus(newStatus)
  
  try {
    await updateQuoteStatus(quote.id, newStatus)
  } catch (error) {
    // Rollback on error
    setOptimisticStatus(quote.status)
    showError('Status update failed')
  }
}
```

### Error Handling Patterns

#### User-Friendly Error Messages
```typescript
const ERROR_MESSAGES = {
  QUOTE_NOT_FOUND: 'Quote not found. It may have been deleted.',
  NETWORK_ERROR: 'Connection failed. Please check your internet and try again.',
  PERMISSION_DENIED: 'You don\'t have permission to perform this action.',
  VALIDATION_ERROR: 'Please check the highlighted fields and try again.'
}
```

#### Retry Options
```typescript
const RetryableError: React.FC<{error: string, onRetry: () => void}> = ({error, onRetry}) => (
  <div className="error-container">
    <p>{error}</p>
    <button onClick={onRetry} className="retry-button">Try Again</button>
  </div>
)
```

## Testing Strategy

### Unit Testing (70%)
- All business logic functions
- Component behavior and state changes
- Hook functionality and edge cases
- Validation and error handling

### Integration Testing (20%)  
- API service integration
- Component interaction flows
- State management across components
- Error recovery scenarios

### End-to-End Testing (10%)
- Complete user workflows
- Cross-browser compatibility
- Accessibility compliance
- Performance under load

## Validation Checklist

### Before Declaring Component Complete

#### Functional Validation
- [ ] All business logic executes (no console.log placeholders)
- [ ] Error handling provides user feedback
- [ ] Loading states show during async operations
- [ ] Success/failure notifications appear

#### Constitutional Validation
- [ ] Component achieves LEVEL 4+ constitutional status
- [ ] MCP browser testing validates functionality  
- [ ] Test coverage ≥90% with passing tests
- [ ] No false claims in progress documentation

#### Performance Validation
- [ ] 100ms response time maintained
- [ ] Progressive loading implemented where needed
- [ ] Accessibility compliance verified
- [ ] Mobile responsiveness tested

### Constitutional Reporting Template
```markdown
## Component: QuoteActionMenu
**Status**: LEVEL 4 - INTEGRATED ✅
**Evidence**: 
- ✅ MCP validation: All actions execute business logic
- ✅ Test results: 15/15 unit tests pass, 8/8 integration tests pass
- ✅ Performance: Average response time 45ms
- ✅ Accessibility: Screen reader compatible, keyboard navigation

**Blockers**: None
**Next Steps**: Ready for production deployment
```

## Deployment Considerations

### Bundle Size Impact
- Monitor bundle size increases from new components
- Use dynamic imports for export functionality
- Optimize images and assets

### Performance Monitoring
- Track quote list load times with varying data sizes
- Monitor API response times for bulk operations
- Validate export generation performance

### Rollback Strategy
- Maintain feature flags for new functionality
- Keep broken placeholder code as fallback during transition
- Document rollback procedures for each component

## Success Metrics

### Functional Success
- Zero console.log placeholders in production code
- All 22 functional requirements implemented and tested
- Export system generates valid PDF and Excel files
- Bulk operations complete with proper user feedback

### Performance Success
- Quote list loads under 3 seconds with 1,000+ quotes
- All user interactions respond within 100ms
- Progressive loading prevents perceived delays
- Export generation completes within expected timeframes

### Constitutional Success
- All components achieve LEVEL 4+ constitutional status
- Test coverage maintains ≥90% across all quote functionality
- MCP validation confirms actual functionality vs. claims
- Progress documentation passes constitutional checker validation