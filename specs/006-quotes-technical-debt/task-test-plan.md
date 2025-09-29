# Task Test Plan: 006-Quotes-Technical-Debt Sprint

**Branch**: 006-quotes-technical-debt | **Generated**: September 29, 2025  
**Purpose**: Comprehensive, bulletproof test specifications for each sprint task with exact validation criteria

## 📋 TEST PLAN ARCHITECTURE

### Evidence Directory Structure (MANDATORY)
Each task MUST generate evidence organized by test step in the exact structure below:

```
evidence/[TASK_ID]/
├── test-specification.json          # Copy of this test plan section for the task
├── [STEP_ID]/                       # Each test step gets its own folder
│   ├── mcp-raw-outputs/
│   │   ├── snapshot.json            # Raw JSON from mcp_chrome-devtoo_take_snapshot
│   │   ├── screenshot.json          # Raw JSON from mcp_chrome-devtoo_take_screenshot  
│   │   ├── evaluate.json            # Raw JSON from mcp_chrome-devtoo_evaluate_script
│   │   └── navigate.json            # Raw JSON from mcp_chrome-devtoo_navigate_page
│   ├── contract-test-execution.log  # Raw terminal output from npm test (if applicable)
│   ├── mcp-interaction-log.md       # Chronological log of MCP commands for this step
│   └── step-analysis.json           # What this step's evidence proves
├── technical-debt-identified.json   # TDD debt items found during testing
└── constitutional-compliance.json   # Validation results from post-task tools
```

**Example for T004**:
```
evidence/T004/
├── test-specification.json
├── T004.1/                          # Contract test execution step
│   ├── contract-test-execution.log
│   └── step-analysis.json
├── T004.2/                          # MCP browser validation step
│   ├── mcp-raw-outputs/
│   │   ├── snapshot.json
│   │   └── screenshot.json
│   ├── mcp-interaction-log.md
│   └── step-analysis.json
├── technical-debt-identified.json
└── constitutional-compliance.json
```

### Validation Integration Points
- **Pre-Task Validation**: `node .specify/tools/pre-task-check.js [TASK_ID]`
- **Test Specification Reference**: This file provides exact test requirements
- **Evidence Authentication**: Constitutional enforcement validates MCP outputs
- **Post-Task Validation**: `node .specify/tools/post-task-validation.js [TASK_ID]`

---

## T004: Contract Test GET /api/quotes

### Task Information
- **Task ID**: T004
- **Description**: Contract test GET /api/quotes in packages/web/tests/contract/quotes-get.test.ts
- **Evidence Directory**: `evidence/T004/`
- **Test File Location**: `packages/web/__tests__/contracts/quotes-get.test.ts`
- **API Endpoint**: `GET /api/v1/quotes`

### Required Test Steps

#### T004.1: Execute Contract Test Suite
- **Test ID**: T004.1
- **Purpose**: Execute the contract test file and capture results
- **Command**: `cd packages/web; npm test -- __tests__/contracts/quotes-get.test.ts`
- **Working Directory**: `packages/web/`
- **Expected Outcome**: Test suite executes (15 tests total)
- **Success Criteria**: 
  - Command executes without fatal errors
  - Test results are captured (pass/fail counts)
  - Raw npm output saved to evidence
- **Evidence File**: `evidence/T004/T004.1/contract-test-execution.log`
- **Evidence Content**: Complete terminal output from npm test command
- **Validation Method**: File must contain "Test Suites:" and test count information

#### T004.2: MCP Browser API Response Validation
- **Test ID**: T004.2
- **Purpose**: Validate GET /api/quotes endpoint responds correctly via browser
- **Prerequisites**: Development server running on localhost:3000
- **MCP Commands Sequence**:
  1. `mcp_chrome-devtoo_new_page("http://localhost:3000/api/v1/quotes")`
  2. `mcp_chrome-devtoo_take_snapshot()`
  3. `mcp_chrome-devtoo_take_screenshot()`
- **Expected API Response**: JSON array of quotes or empty array `[]`
- **Expected HTTP Status**: 200 OK
- **Success Criteria**:
  - Page loads successfully
  - JSON response visible in browser
  - No 404 or 500 errors
- **Evidence Files**:
  - `evidence/T004/T004.2/mcp-raw-outputs/snapshot.json`
  - `evidence/T004/T004.2/mcp-raw-outputs/screenshot.json`
- **Evidence Content**: Raw MCP tool JSON responses (unmodified)
- **Validation Method**: Files must contain MCP tool response markers and JSON data

### Test Completion Criteria
- [ ] T004.1: Contract test executed and results captured
- [ ] T004.2: MCP browser validation completed
- [ ] All evidence files created with correct names
- [ ] Constitutional post-task validation passes

---

## T005: Contract Test POST /api/quotes

### Task Information
- **Task ID**: T005
- **Description**: Contract test POST /api/quotes in packages/web/tests/contract/quotes-post.test.ts
- **Evidence Directory**: `evidence/T005/`
- **Test File Location**: `packages/web/__tests__/contracts/quotes-post.test.ts`
- **API Endpoint**: `POST /api/v1/quotes`

### Required Test Steps

#### T005.1: Execute Contract Test Suite
- **Test ID**: T005.1
- **Purpose**: Execute POST contract tests and identify TDD failures
- **Command**: `cd packages/web; npm test -- __tests__/contracts/quotes-post.test.ts`
- **Working Directory**: `packages/web/`
- **Expected Outcome**: Mix of passing/failing tests (TDD red phase expected)
- **Success Criteria**:
  - Test suite executes completely
  - Failing tests indicate implementation gaps
  - Technical debt can be identified from failures
- **Evidence File**: `evidence/T005/T005.1/contract-test-execution.log`
- **Evidence Content**: Complete npm test output with pass/fail details
- **Validation Method**: Must contain test results and any failure messages

#### T005.2: MCP Browser POST Valid Data Test
- **Test ID**: T005.2
- **Purpose**: Test POST endpoint with valid quote data
- **Prerequisites**: Development server running on localhost:3000
- **Test Payload**:
```json
{
  "customerName": "Test Customer Corp",
  "items": [{
    "productId": "prod-001",
    "productName": "Test Product",
    "description": "Test service package",
    "quantity": 2,
    "unitPrice": 150.00,
    "discount": 0.1
  }],
  "notes": "Test quote via MCP"
}
```
- **MCP Commands Sequence**:
  1. `mcp_chrome-devtoo_new_page("http://localhost:3000")`
  2. `mcp_chrome-devtoo_evaluate_script()` with fetch POST request
  3. `mcp_chrome-devtoo_take_snapshot()`
- **Expected Response**: 201 Created with quote object OR business logic errors
- **Success Criteria**:
  - POST request executes
  - Response captured (regardless of success/failure)
  - Response structure documented
- **Evidence Files**:
  - `evidence/T005/T005.2/mcp-raw-outputs/evaluate.json`
  - `evidence/T005/T005.2/mcp-raw-outputs/snapshot.json`
- **Evidence Content**: Raw MCP responses with API response data
- **Validation Method**: Must contain fetch response with status code and data

#### T005.3: MCP Browser POST Invalid Data Test
- **Test ID**: T005.3
- **Purpose**: Test POST validation with invalid data
- **Test Payload**:
```json
{
  "customerName": "",
  "items": [{
    "description": "",
    "quantity": -1,
    "unitPrice": -10
  }]
}
```
- **MCP Commands Sequence**:
  1. `mcp_chrome-devtoo_evaluate_script()` with fetch POST (invalid data)
- **Expected Response**: 400 Bad Request with Zod validation errors
- **Success Criteria**:
  - Validation errors returned
  - Error structure captured
  - Field-specific error messages present
- **Evidence File**: `evidence/T005/T005.3/mcp-raw-outputs/evaluate.json`
- **Evidence Content**: Raw MCP response with validation error details
- **Validation Method**: Must contain 400 status and validation error array

### Technical Debt Identification Requirements
- **Purpose**: Document implementation gaps found during testing
- **Evidence File**: `evidence/T005/technical-debt-identified.json`
- **Required Fields**:
  - `taskId`: "T005"
  - `debtItems`: Array of issues found
  - `testFailures`: Specific test failures that indicate debt
  - `priority`: CRITICAL/HIGH/MEDIUM/LOW classification
  - `implementationRequired`: Description of what needs to be built

### Test Completion Criteria
- [ ] T005.1: Contract test executed with full results
- [ ] T005.2: Valid POST data tested via MCP
- [ ] T005.3: Invalid POST data validation tested
- [ ] Technical debt documented from test failures
- [ ] All evidence files created with exact names

---

## T006: Contract Test PUT /api/quotes/{id}

### Task Information
- **Task ID**: T006
- **Description**: Contract test PUT /api/quotes/{id} in packages/web/tests/contract/quotes-put.test.ts
- **Evidence Directory**: `evidence/T006/`
- **Test File Location**: `packages/web/__tests__/contracts/quotes-put.test.ts`
- **API Endpoint**: `PUT /api/v1/quotes/{id}`

### Required Test Steps

#### T006.1: Execute Contract Test Suite
- **Test ID**: T006.1
- **Purpose**: Execute PUT contract tests and document results
- **Command**: `cd packages/web; npm test -- __tests__/contracts/quotes-put.test.ts`
- **Working Directory**: `packages/web/`
- **Expected Outcome**: 
  - Total tests: 14
  - Expected failures: 2 (route detection issues)
  - Expected passes: 12 (business logic validation)
- **Success Criteria**:
  - Test suite completes execution
  - Test results captured with pass/fail breakdown
  - Route detection failures documented
- **Evidence File**: `evidence/T006/T006.1/contract-test-execution.log`
- **Evidence Content**: Complete npm test output showing 14 test results
- **Validation Method**: Must contain "Test Suites:" and "Tests:" summary lines

#### T006.2: MCP Browser PUT Valid UUID Test
- **Test ID**: T006.2
- **Purpose**: Test PUT endpoint with valid UUID but non-existent quote
- **Test UUID**: `550e8400-e29b-41d4-a716-446655440000`
- **API URL**: `http://localhost:3000/api/v1/quotes/550e8400-e29b-41d4-a716-446655440000`
- **Test Payload**:
```json
{
  "version": 1,
  "customerName": "Updated Test Customer",
  "lineItems": [{
    "description": "Updated Test Product",
    "quantity": 2,
    "unitPrice": 150.00,
    "taxable": true,
    "discount": 10
  }],
  "notes": "Updated via PUT test"
}
```
- **MCP Commands Sequence**:
  1. `mcp_chrome-devtoo_new_page("http://localhost:3000")`
  2. `mcp_chrome-devtoo_evaluate_script()` with fetch PUT request
- **JavaScript Test Code**:
```javascript
async () => {
  const response = await fetch('/api/v1/quotes/550e8400-e29b-41d4-a716-446655440000', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      version: 1,
      customerName: "Updated Test Customer",
      lineItems: [{
        description: "Updated Test Product",
        quantity: 2,
        unitPrice: 150.00,
        taxable: true,
        discount: 10
      }],
      notes: "Updated via PUT test"
    })
  });
  return { status: response.status, data: await response.json() };
}
```
- **Expected Response**: 404 "Quote not found"
- **Success Criteria**:
  - PUT request executes successfully
  - 404 status code received
  - Error message "Quote not found" in response
- **Evidence File**: `evidence/T006/T006.2/mcp-raw-outputs/evaluate.json`
- **Evidence Content**: Raw MCP response with 404 status and error message
- **Validation Method**: Must contain `"status":404` and `"error":"Quote not found"`

#### T006.3: MCP Browser PUT Validation Error Test
- **Test ID**: T006.3
- **Purpose**: Test PUT endpoint validation with invalid data
- **Test UUID**: `550e8400-e29b-41d4-a716-446655440000`
- **Test Payload** (Invalid):
```json
{
  "version": "invalid_string",
  "customerName": "",
  "lineItems": [{
    "description": "",
    "quantity": -1,
    "unitPrice": -10.50
  }]
}
```
- **MCP Commands Sequence**:
  1. `mcp_chrome-devtoo_evaluate_script()` with fetch PUT (invalid data)
- **JavaScript Test Code**:
```javascript
async () => {
  const response = await fetch('/api/v1/quotes/550e8400-e29b-41d4-a716-446655440000', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      version: "invalid_string",
      customerName: "",
      lineItems: [{
        description: "",
        quantity: -1,
        unitPrice: -10.50
      }]
    })
  });
  return { status: response.status, data: await response.json() };
}
```
- **Expected Response**: 400 Bad Request with detailed Zod validation errors
- **Expected Error Fields**:
  - `version`: "Invalid input: expected number, received string"
  - `customerName`: "Too small: expected string to have >=1 characters"
  - `lineItems[0].description`: "Too small: expected string to have >=1 characters"
  - `lineItems[0].quantity`: "Too small: expected number to be >0"
  - `lineItems[0].unitPrice`: "Too small: expected number to be >=0"
- **Success Criteria**:
  - 400 status code received
  - Zod validation errors returned
  - All expected field errors present
- **Evidence File**: `evidence/T006/T006.3/mcp-raw-outputs/evaluate.json`
- **Evidence Content**: Raw MCP response with 400 status and detailed validation errors
- **Validation Method**: Must contain `"status":400` and `"details"` array with field errors

#### T006.4: MCP Browser UUID Validation Test
- **Test ID**: T006.4
- **Purpose**: Test PUT endpoint UUID format validation
- **Test UUID**: `invalid-uuid-format` (intentionally malformed)
- **API URL**: `http://localhost:3000/api/v1/quotes/invalid-uuid-format`
- **Test Payload**: Any valid quote data
- **MCP Commands Sequence**:
  1. `mcp_chrome-devtoo_evaluate_script()` with fetch PUT (malformed UUID)
- **JavaScript Test Code**:
```javascript
async () => {
  const response = await fetch('/api/v1/quotes/invalid-uuid-format', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      version: 1,
      customerName: "Test Customer"
    })
  });
  return { status: response.status, data: await response.json() };
}
```
- **Expected Response**: 400 "Invalid quote ID format"
- **Success Criteria**:
  - 400 status code received
  - UUID validation error message returned
- **Evidence File**: `evidence/T006/T006.4/mcp-raw-outputs/evaluate.json`
- **Evidence Content**: Raw MCP response with UUID validation error
- **Validation Method**: Must contain `"status":400` and UUID format error message

### Technical Debt Documentation
- **Expected Issue**: Contract test import mechanism failure
- **Evidence File**: `evidence/T006/technical-debt-identified.json`
- **Required Content**:
```json
{
  "taskId": "T006",
  "debtItems": [{
    "id": "T006-TD001",
    "priority": "MEDIUM",
    "category": "TEST_INFRASTRUCTURE",
    "title": "Contract test fails to detect implemented PUT route handler",
    "description": "Test at line 90 cannot import PUT method despite implementation existing",
    "actualImplementation": "PUT method exists in packages/web/src/app/api/v1/quotes/[quoteId]/route.ts",
    "testIssue": "Import mechanism in contract test needs fixing",
    "impact": "FALSE_NEGATIVE_TEST_RESULTS"
  }]
}
```

### Test Completion Criteria
- [ ] T006.1: Contract test executed (14 tests, 2 failures, 12 passes)
- [ ] T006.2: PUT with valid UUID tested (404 response)
- [ ] T006.3: PUT validation error tested (400 with Zod errors)
- [ ] T006.4: UUID validation tested (400 format error)
- [ ] Technical debt documented (test infrastructure issue)
- [ ] All evidence files created with exact specified names

---

## T007: Contract Test POST /api/quotes/{id}/duplicate
**Status**: ⏳ PENDING  
**File**: `packages/web/__tests__/contracts/quotes-duplicate.test.ts`

### Required Tests
- [ ] **T007.1**: Execute contract test suite
  - **Command**: `cd packages/web; npm test -- __tests__/contracts/quotes-duplicate.test.ts`
  - **Expected**: Failing tests (TDD red phase - endpoint not implemented)
  - **Evidence**: `evidence/T007/T007.1/contract-test-execution.log` with raw npm output

- [ ] **T007.2**: MCP browser duplicate endpoint validation
  - **Action**: POST to `/api/v1/quotes/550e8400-e29b-41d4-a716-446655440000/duplicate`
  - **MCP Commands**: `mcp_chrome-devtoo_evaluate_script` with fetch POST
  - **Expected**: 404 Not Found (endpoint not implemented yet)
  - **Evidence**: `evidence/T007/T007.2/mcp-raw-outputs/evaluate.json`

---

## T008: Contract Test POST /api/quotes/{id}/convert
**Status**: ⏳ PENDING  
**File**: `packages/web/__tests__/contracts/quotes-convert.test.ts`

### Required Tests
- [ ] **T008.1**: Execute contract test suite
  - **Command**: `cd packages/web; npm test -- __tests__/contracts/quotes-convert.test.ts`
  - **Expected**: Failing tests (TDD red phase - endpoint not implemented)
  - **Evidence**: `evidence/T008/T008.1/contract-test-execution.log` with raw npm output

- [ ] **T008.2**: MCP browser convert endpoint validation
  - **Action**: POST to `/api/v1/quotes/550e8400-e29b-41d4-a716-446655440000/convert`
  - **MCP Commands**: `mcp_chrome-devtoo_evaluate_script` with fetch POST
  - **Expected**: 404 Not Found (endpoint not implemented yet)
  - **Evidence**: `evidence/T008/T008.2/mcp-raw-outputs/evaluate.json`

---

## T009: Contract Test POST /api/quotes/bulk
**Status**: ⏳ PENDING  
**File**: `packages/web/__tests__/contracts/quotes-bulk.test.ts`

### Required Tests
- [ ] **T009.1**: Execute contract test suite
  - **Command**: `cd packages/web; npm test -- __tests__/contracts/quotes-bulk.test.ts`
  - **Expected**: Failing tests (TDD red phase - endpoint not implemented)
  - **Evidence**: `evidence/T009/T009.1/contract-test-execution.log` with raw npm output

- [ ] **T009.2**: MCP browser bulk endpoint validation
  - **Action**: POST to `/api/v1/quotes/bulk` with bulk operations payload
  - **MCP Commands**: `mcp_chrome-devtoo_evaluate_script` with fetch POST
  - **Expected**: 404 Not Found (endpoint not implemented yet)
  - **Evidence**: `evidence/T009/T009.2/mcp-raw-outputs/evaluate.json`

---

## T010: Contract Test GET /api/quotes/{id}/export
**Status**: ⏳ PENDING  
**File**: `packages/web/__tests__/contracts/quotes-export.test.ts`

### Required Tests
- [ ] **T010.1**: Execute contract test suite
  - **Command**: `cd packages/web; npm test -- __tests__/contracts/quotes-export.test.ts`
  - **Expected**: Failing tests (TDD red phase - endpoint not implemented)
  - **Evidence**: `evidence/T010/T010.1/contract-test-execution.log` with raw npm output

- [ ] **T010.2**: MCP browser export endpoint validation
  - **Action**: GET `/api/v1/quotes/550e8400-e29b-41d4-a716-446655440000/export`
  - **MCP Commands**: `mcp_chrome-devtoo_navigate_page`
  - **Expected**: 404 Not Found (endpoint not implemented yet)
  - **Evidence**: `evidence/T010/T010.2/mcp-raw-outputs/navigate.json`

---

## Validation Rules

### Evidence Authentication
1. **MCP Commands**: Must use actual MCP browser tools
2. **Raw Outputs**: Save unmodified JSON responses from MCP
3. **Chronological Log**: Document exact sequence of commands
4. **No Fabrication**: Constitutional Amendment 4 enforcement active

### Success Criteria Per Task
- **Contract Tests**: Must execute and capture results (pass/fail irrelevant)
- **MCP Browser Tests**: Must capture authentic API responses
- **Evidence Files**: Must contain raw, unmodified tool outputs
- **Technical Debt**: Must identify and document issues found

### Anti-Fraud Measures
- **Pre-Defined Scope**: No interpretation allowed during execution
- **Fixed Expectations**: Exact commands and expected responses specified
- **Evidence Validation**: Constitutional tools verify authenticity
- **Audit Trail**: Complete command log for verification

---

## Usage Instructions

### For Task Execution:
1. Copy relevant section to `evidence/[TaskID]/test-specification.json`
2. Create step directories: `evidence/[TaskID]/[StepID]/`
3. Execute tests exactly as specified for each step
4. Capture evidence in step-specific folders with exact filenames
5. Run post-task validation
6. Mark specific test items complete: `T006.1 ✅ COMPLETED`

### For Validation:
1. Check evidence files against specification
2. Verify MCP commands match required commands
3. Confirm expected responses received
4. Validate no fabrication in evidence files

**This specification eliminates interpretation and enables bulletproof validation of testing results.**