# Quickstart Guide: Quotes Index Workspace

**Feature**: Quotes Index Workspace  
**Date**: 2025-09-26  
**Prerequisites**: Node.js 18+, Next.js 15 development environment  

## Development Setup

### 1. Environment Preparation
```bash
# Navigate to the web package
cd packages/web

# Install dependencies (if not already done)
npm install

# Ensure development server is running
npm run dev
```

### 2. Feature Branch Setup
```bash
# Ensure you're on the correct feature branch
git checkout 004-sprint-4-quotes

# Pull latest changes
git pull origin 004-sprint-4-quotes
```

### 3. Required Dependencies
The following dependencies should be available (installed during documents workspace):
- `@tanstack/react-query: ^5.66.0` - Server state management
- `@tanstack/react-virtual: ^3.11.2` - Performance virtualization
- `@headlessui/react: ^2.2.0` - Accessible UI components
- `@heroicons/react: ^2.2.0` - Icon system
- `zod: ^4.1.11` - Runtime validation

## Development Workflow

### 1. Test-First Development (TDD)
Follow constitutional requirement for test-first development:

```bash
# 1. Write failing test
npm test -- --testNamePattern="QuotesTable"

# 2. Implement minimal code to make test pass
# 3. Refactor while keeping tests green
# 4. Repeat cycle

# Run tests in watch mode during development
npm run test:watch
```

### 2. Component Development
Start with Storybook stories, then implement components:

```bash
# Start Storybook for component development
npm run storybook

# Create story first, then component
# Stories serve as component specifications and visual tests
```

### 3. Integration Testing
```bash
# Run full test suite
npm test

# Run E2E tests (when available)
npm run test:e2e

# Accessibility testing
npm run test:accessibility
```

## Key File Structure

### Core Components (to be created)
```
src/
├── app/(dashboard)/quotes/
│   └── page.tsx                    # Main quotes workspace page
├── components/quotes/
│   ├── QuotesTable.tsx             # Main quotes listing table
│   ├── QuoteFiltersBar.tsx         # Advanced filtering component
│   ├── QuoteStatusBadge.tsx        # Status display component
│   ├── QuoteActionsMenu.tsx        # Quote action dropdown
│   └── QuickPreviewCard.tsx        # Quote preview modal
├── hooks/quotes/
│   ├── useQuotes.tsx               # TanStack Query hook for quotes data
│   ├── useQuoteActions.tsx         # Quote action handlers
│   └── useQuoteFilters.tsx         # Filter state management
├── services/quotes/
│   ├── QuoteService.ts             # Business logic and API calls
│   └── QuoteValidation.ts          # Zod schemas and validation
└── types/quotes/
    └── Quote.ts                    # TypeScript interfaces
```

### API Routes (to be created)
```
src/app/api/v1/quotes/
├── route.ts                        # GET /api/v1/quotes, POST /api/v1/quotes
├── [quoteId]/
│   ├── route.ts                    # GET, PUT, DELETE /api/v1/quotes/[id]
│   ├── status/route.ts             # PATCH /api/v1/quotes/[id]/status
│   ├── duplicate/route.ts          # POST /api/v1/quotes/[id]/duplicate
│   └── convert/route.ts            # POST /api/v1/quotes/[id]/convert
├── export/route.ts                 # POST /api/v1/quotes/export
└── bulk-actions/route.ts           # PATCH /api/v1/quotes/bulk-actions
```

### Test Files (to be created)
```
src/
├── components/quotes/__tests__/
│   ├── QuotesTable.test.tsx
│   ├── QuoteFiltersBar.test.tsx
│   └── QuoteStatusBadge.test.tsx
├── hooks/quotes/__tests__/
│   └── useQuotes.test.tsx
└── services/quotes/__tests__/
    └── QuoteService.test.tsx
```

### Storybook Stories (to be created)
```
src/stories/quotes/
├── QuotesTable.stories.tsx
├── QuoteFiltersBar.stories.tsx
├── QuoteStatusBadge.stories.tsx
├── QuoteActionsMenu.stories.tsx
└── QuickPreviewCard.stories.tsx
```

## Critical Implementation Steps

### Phase 1: Foundation (TDD)
1. **Create TypeScript interfaces** (`src/types/quotes/Quote.ts`)
   - Define Quote, QuoteStatus, QuoteLineItem interfaces
   - Export all types for consistent usage

2. **Create Zod validation schemas** (`src/services/quotes/QuoteValidation.ts`)
   - Validate API request/response formats
   - Ensure data integrity at runtime

3. **Write failing tests** for core functionality
   - Quote listing, filtering, status management
   - Follow exact acceptance scenarios from spec

### Phase 2: API Layer
1. **Implement API routes** following OpenAPI contract
   - Start with GET /api/v1/quotes (basic listing)
   - Add filtering, pagination, sorting
   - Implement status management and bulk operations

2. **Create mock data service** (`src/data/quotes.ts`)
   - Realistic test data matching PDF examples
   - Deterministic data for consistent testing

3. **TanStack Query integration** (`src/hooks/quotes/useQuotes.tsx`)
   - Server state management with caching
   - Error handling and retry logic

### Phase 3: UI Components
1. **QuotesTable with TanStack Virtual**
   - Handle <1,000 quotes efficiently
   - Column sorting, row selection
   - Performance monitoring for <1s load time

2. **QuoteFiltersBar**
   - Status, date range, customer filtering
   - Debounced search (300ms delay)
   - Filter state persistence

3. **Quote actions and status management**
   - Status badges with consistent styling
   - Action menus with permission validation
   - Integration with quote composer

### Phase 4: Integration
1. **Dashboard navigation integration**
   - Add quotes entry to dashboard layout
   - Consistent routing and breadcrumbs

2. **Quote composer integration**
   - Navigation to `/quotes/compose` with parameters
   - Graceful handling of composer unavailability
   - View-only mode fallback

3. **Error handling and loading states**
   - Network error recovery
   - Loading skeletons and empty states
   - User-friendly error messages

## Testing Strategy

### Unit Tests (Jest + React Testing Library)
- Component behavior and user interactions
- Hook logic and state management
- Service layer business logic
- Minimum 90% code coverage

### Integration Tests
- Complete user workflows (filter → select → action)
- API contract compliance
- Quote status workflow validation
- Error scenario handling

### Accessibility Tests (axe-core)
- WCAG 2.1 AA compliance validation
- Keyboard navigation testing
- Screen reader compatibility
- Color contrast verification

### Performance Tests
- Page load time (<1 second requirement)
- Large dataset handling (1,000 quotes)
- Memory usage monitoring
- Interaction responsiveness

## Quality Gates

### Before Committing
- [ ] All tests pass (`npm test`)
- [ ] TypeScript compilation succeeds (`npm run build`)
- [ ] Linting passes (`npm run lint`)
- [ ] Storybook stories updated
- [ ] Performance requirements met

### Before PR Review
- [ ] Integration tests validate user scenarios
- [ ] Accessibility audit passes
- [ ] API contracts implemented correctly
- [ ] Component documentation complete
- [ ] Error handling comprehensive

### Before Deployment
- [ ] E2E tests pass in production-like environment
- [ ] Performance benchmarks met
- [ ] Security validation complete
- [ ] Business acceptance criteria validated

## Troubleshooting

### Common Development Issues

1. **TanStack Query Cache Issues**
   ```bash
   # Clear React Query cache in browser DevTools
   # Or restart development server
   npm run dev
   ```

2. **TypeScript Compilation Errors**
   ```bash
   # Check for type mismatches in Quote interfaces
   npm run type-check
   ```

3. **Test Failures**
   ```bash
   # Run tests in verbose mode for detailed output
   npm test -- --verbose
   ```

4. **Performance Issues**
   ```bash
   # Enable React Profiler in development
   # Check TanStack Virtual configuration
   # Monitor bundle size
   npm run analyze
   ```

### Integration Points

1. **Quote Composer Integration**
   - Check `/quotes/compose` route availability
   - Verify query parameter handling
   - Test fallback to view-only mode

2. **Customer Data Integration**
   - Ensure customer service is available
   - Validate customer ID references
   - Handle missing customer scenarios

3. **Dashboard Integration**
   - Verify navigation entry in layout
   - Test route transitions
   - Confirm breadcrumb behavior

## Success Validation

### Functional Validation
Run through each acceptance scenario from the feature specification:
1. Load quotes listing page → verify <1s load time
2. Apply status filters → verify correct filtering
3. Search by customer → verify search functionality
4. Navigate to quote composer → verify integration
5. Bulk operations → verify multi-select actions

### Performance Validation
- [ ] Initial page load: <1 second
- [ ] Filter response: <500ms
- [ ] Smooth scrolling with 1,000 quotes
- [ ] Memory usage <100MB for full dataset

### Accessibility Validation
- [ ] Keyboard navigation works completely
- [ ] Screen reader announces all content
- [ ] Color contrast meets WCAG 2.1 AA
- [ ] Focus indicators are clearly visible

**Status**: ✅ Quickstart guide complete, ready for implementation