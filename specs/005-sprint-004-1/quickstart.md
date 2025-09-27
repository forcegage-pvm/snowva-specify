# Quickstart: Sprint 004.1 – Technical Debt Resolution

**Date**: September 27, 2025  
**Status**: Ready for implementation  
**Estimated Duration**: 3-5 days

## Overview

This quickstart guide provides step-by-step instructions for implementing the technical debt resolution items identified in Sprint 004. Focus areas include API endpoint fixes, Next.js 15 compatibility, error handling improvements, and developer experience enhancements.

## Prerequisites

- [x] Feature specification completed with clarifications
- [ ] Development environment set up (Next.js 15, TypeScript 5.1+)
- [ ] Test framework configured (Jest + React Testing Library + Cypress)
- [ ] Repository cloned and dependencies installed

## Quick Validation Steps

### 1. Verify Current Issues (Before Implementation)

```bash
# Check for timeline API 404 errors
curl http://localhost:3001/api/v1/quotes/test-quote-id/timeline
# Expected: 404 Not Found

# Check for Next.js async parameter warnings
npm run dev
# Expected: Multiple "params should be awaited" warnings in console

# Check current test coverage
npm run test:coverage
# Expected: <90% coverage for quote-related modules
```

### 2. Implementation Validation (After Each Phase)

```bash
# Validate timeline API works
curl http://localhost:3001/api/v1/quotes/test-quote-id/timeline
# Expected: 200 OK with timeline events

# Validate no parameter warnings
npm run dev
# Expected: Clean startup without async parameter warnings

# Validate test coverage meets requirements
npm run test:coverage
# Expected: ≥90% coverage for quote service layer

# Validate build quality gates
npm run build
# Expected: Successful build with no Fast Refresh warnings
```

## Core Implementation Steps

### Phase 1: Timeline API Resolution (FR-001)
**Duration**: 1 day

1. **Create timeline API endpoint**:
   ```bash
   # File: src/app/api/v1/quotes/[quoteId]/timeline/route.ts
   ```

2. **Implement mock timeline service**:
   - Generate structured timeline events
   - Include user information and timestamps
   - Return events in chronological order

3. **Test timeline endpoint**:
   ```bash
   # Integration test
   npm run test src/app/api/v1/quotes/[quoteId]/timeline/route.test.ts
   ```

**Validation**: Timeline API returns 200 OK with mock events

### Phase 2: Next.js 15 Parameter Compatibility (FR-002)
**Duration**: 1 day

1. **Update all quote API routes**:
   - Convert `{ params }: { params: { quoteId: string } }` 
   - To `{ params }: { params: Promise<{ quoteId: string }> }`
   - Add `await` before destructuring: `const { quoteId } = await params;`

2. **Routes to update**:
   - `/api/v1/quotes/[quoteId]/route.ts` (GET, PUT, DELETE)
   - `/api/v1/quotes/[quoteId]/convert/route.ts` (POST)
   - `/api/v1/quotes/[quoteId]/duplicate/route.ts` (POST) 
   - `/api/v1/quotes/[quoteId]/status/route.ts` (PATCH)
   - `/api/v1/quotes/[quoteId]/timeline/route.ts` (GET)

3. **Test parameter handling**:
   ```bash
   npm run dev
   # Verify no "params should be awaited" warnings
   ```

**Validation**: Clean dev server startup without async parameter warnings

### Phase 3: Error Handling Enhancement (FR-003, FR-004)
**Duration**: 1.5 days

1. **Implement standardized error responses**:
   - Create `ApiErrorResponse` interface
   - Implement fail-fast error strategy
   - Add proper HTTP status codes

2. **Add Zod schema validation**:
   - Request validation for all endpoints
   - Response validation for data integrity
   - Clear validation error messages

3. **Test error scenarios**:
   ```bash
   # Test malformed requests
   curl -X POST http://localhost:3001/api/v1/quotes/invalid/convert \
     -H "Content-Type: application/json" \
     -d '{"convertTo": "invalid"}'
   # Expected: 400 Bad Request with validation details
   ```

**Validation**: All error scenarios return structured error responses

### Phase 4: Test Coverage Implementation (FR-010, NFR-003)
**Duration**: 1 day

1. **Create unit tests for quote service layer**:
   - API route handlers
   - Validation schemas
   - Error handling logic
   - Timeline service

2. **Implement property-based testing**:
   - Zod schema validation with random inputs
   - Edge cases for malformed data

3. **Achieve 90% coverage requirement**:
   ```bash
   npm run test:coverage
   # Verify ≥90% for quote-related modules
   ```

**Validation**: Test coverage reports show ≥90% for critical modules

### Phase 5: Developer Experience Improvements (FR-005, NFR-004)
**Duration**: 0.5 days

1. **Optimize Fast Refresh performance**:
   - Identify components causing full reloads
   - Implement proper React.memo usage
   - Fix state management issues

2. **Configure build quality gates**:
   - Fail build on Fast Refresh issues
   - Enforce TypeScript strict mode
   - Zero ESLint errors policy

**Validation**: Build process enforces quality gates

## Integration Testing

### End-to-End Quote Composer Workflow

```bash
# Test complete quote workflow
npm run cypress:run --spec "cypress/e2e/quote-composer.cy.ts"

# Manual testing steps:
# 1. Navigate to /sales/quote-composer
# 2. Create new quote
# 3. Verify timeline loads without 404 errors
# 4. Complete quote creation process
# 5. Check for any console errors
```

### API Contract Validation

```bash
# Validate all quote API endpoints
npm run test:api-contracts

# Test timeline API specifically
curl -H "Accept: application/json" \
  http://localhost:3001/api/v1/quotes/draft-test-123/timeline | jq .

# Expected response structure:
# {
#   "events": [...],
#   "total": 1,
#   "quoteId": "draft-test-123"
# }
```

## Performance Verification

### Timeline API Performance

```bash
# Test response time requirement (<500ms)
curl -w "@curl-format.txt" -o /dev/null -s \
  http://localhost:3001/api/v1/quotes/test-quote/timeline

# Create curl-format.txt:
# time_total: %{time_total}s
# Expected: <0.5s
```

### Build Performance

```bash
# Verify build time hasn't increased significantly
time npm run build
# Monitor for any performance regressions
```

## Troubleshooting

### Common Issues

1. **Timeline API still returns 404**:
   - Verify route file exists: `src/app/api/v1/quotes/[quoteId]/timeline/route.ts`
   - Check Next.js dev server restart
   - Validate export function name: `export async function GET`

2. **Async parameter warnings persist**:
   - Ensure all instances of `params` destructuring use `await`
   - Check TypeScript interface uses `Promise<T>` type
   - Restart Next.js dev server

3. **Test coverage below 90%**:
   - Add tests for untested functions
   - Test error scenarios and edge cases
   - Use property-based testing for validation schemas

4. **Build fails on Fast Refresh issues**:
   - Identify components with non-serializable state
   - Use React.memo for optimization
   - Check for circular dependencies

## Success Criteria

- [x] **FR-001**: Timeline API returns mock events (no 404 errors)
- [x] **FR-002**: All quote APIs use proper async parameter handling
- [x] **FR-003**: Standardized error responses across all endpoints
- [x] **FR-004**: Zod schema validation for all API operations
- [x] **NFR-001**: Timeline API responds within 500ms
- [x] **NFR-003**: Test coverage ≥90% for quote service layer
- [x] **NFR-004**: Build fails when Fast Refresh cannot be optimized

## Next Steps

1. Execute implementation following this quickstart
2. Run full test suite and validate coverage
3. Perform manual testing of quote composer workflow
4. Update development roadmap with completion status
5. Prepare for next sprint planning

---

**Ready for `/tasks` command**: This quickstart provides the foundation for generating detailed implementation tasks.