# Self-Contained Test Execution Schema v3.0

**Created**: September 29, 2025  
**Purpose**: Completely executable test specifications with zero ambiguity

## Core Philosophy

This schema contains **everything** needed to execute tests automatically:
- Exact commands with full paths
- Specific parameters for every tool
- Expected outputs and validation criteria
- Complete MCP tool sequences with parameters
- Real test payloads and validation data

## Schema Enhancements

### 1. Exact Command Specifications
```json
{
  "testExecution": {
    "command": "npm test -- __tests__/contracts/quotes-list.test.ts",
    "workingDirectory": "X:\\Cloud Storage\\Dropbox\\Repositories\\react\\snowva\\packages\\web",
    "expectedDuration": "< 5 seconds",
    "expectedResult": "PASS"
  }
}
```

### 2. Complete MCP Tool Sequences
```json
{
  "mcpValidation": {
    "steps": [
      {
        "stepId": "navigate_to_api",
        "action": "mcp_chrome-devtoo_navigate_page",
        "parameters": {
          "url": "http://localhost:3000/api/v1/quotes"
        },
        "expectedResult": "JSON response visible",
        "evidence": "mcp-navigate-response.json"
      }
    ]
  }
}
```

### 3. Real Test Data Payloads
```json
{
  "testPayloads": {
    "validQuote": {
      "customerId": "cust-001",
      "customerName": "Test Customer",
      "items": [
        {
          "productId": "prod-001",
          "productName": "Test Product",
          "description": "Test product description",
          "quantity": 2,
          "unitPrice": 100.0,
          "discount": 0
        }
      ]
    }
  }
}
```

### 4. Specific Validation Criteria
```json
{
  "validationCriteria": {
    "contractTests": {
      "successCases": [
        "should return 200 OK with proper JSON structure",
        "should return quotes array with required fields"
      ]
    },
    "apiResponse": {
      "statusCode": 200,
      "contentType": "application/json",
      "structure": {
        "quotes": "array",
        "pagination": {
          "page": "number",
          "limit": "number"
        }
      }
    }
  }
}
```

### 5. Complete Evidence Requirements
```json
{
  "evidenceFiles": [
    "contract-test-execution.log",
    "mcp-navigate-response.json",
    "mcp-snapshot-data.json",
    "mcp-screenshot.png",
    "step-analysis.json"
  ]
}
```

## Execution Workflow

The schema provides a complete execution workflow:

1. **Prerequisites Check**: Exact commands to verify readiness
2. **Test Execution**: Precise commands with working directories
3. **MCP Validation**: Step-by-step browser tool sequences
4. **Result Analysis**: Specific patterns to extract from outputs
5. **Evidence Generation**: Required files with exact names
6. **Technical Debt Creation**: Automated debt tracking if tests fail

## Key Improvements from v2.1

### ✅ Self-Contained Commands
- **Before**: Generic placeholders like `{command}`
- **After**: Exact commands: `cd 'X:\\Cloud Storage\\Dropbox\\Repositories\\react\\snowva\\packages\\web' && npm test -- __tests__/contracts/quotes-list.test.ts`

### ✅ Specific MCP Parameters
- **Before**: Generic MCP function references
- **After**: Exact function names and parameters: `mcp_chrome-devtoo_navigate_page` with `{"url": "http://localhost:3000/api/v1/quotes"}`

### ✅ Real Test Data
- **Before**: Abstract test data references
- **After**: Complete JSON payloads ready for POST requests

### ✅ Concrete Validation
- **Before**: Generic success criteria
- **After**: Specific test names and expected response structures

### ✅ Zero Interpretation Required
- **Before**: Required human interpretation of generic patterns
- **After**: Direct copy-paste execution with no ambiguity

## Usage

A smart execution script can now:
1. Parse the JSON schema
2. Execute each command exactly as specified
3. Call MCP tools with exact parameters
4. Validate outputs against specific criteria
5. Generate required evidence files
6. Create technical debt automatically if tests fail

**No human interpretation or guessing required.**