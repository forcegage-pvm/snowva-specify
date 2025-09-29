# JSON Test Plan Generation Guidelines

**Version**: 1.0.0  
**Created**: September 29, 2025  
**Purpose**: Define exact format and requirements for task-test-plan.json files

## Core Principles

### 1. Zero Ambiguity Rule
- Every step must be actionable without interpretation
- No vague references like "server should be running"
- Include exact commands, file paths, and expected outcomes

### 2. Constitutional Compliance
- All evidence must be authentic MCP tool outputs
- Evidence files created immediately after each MCP command
- Raw outputs saved verbatim with no modifications

### 3. Step Granularity
- Break complex actions into individual atomic steps
- Each step has ONE action and ONE evidence file
- No compound steps that could lose data

## Required Structure

### Task Level Properties
```json
{
  "taskId": "T###",
  "description": "Specific task description with file paths",
  "evidenceDirectory": "evidence/T###/",
  "testFileLocation": "exact/path/to/test/file.ts",
  "apiEndpoint": "HTTP_METHOD /exact/api/path",
  "status": "PENDING|IN_PROGRESS|COMPLETED",
  "testSteps": { ... }
}
```

### Test Step Properties
```json
{
  "testId": "T###.#",
  "purpose": "Clear description of what this step validates",
  "command": "exact command to run" | "MCP_COMMAND_SEQUENCE",
  "workingDirectory": "exact/working/directory/",
  "prerequisites": [
    {
      "condition": "Development server running on localhost:3000",
      "checkCommand": "curl -f http://localhost:3000/api/health || echo 'Server not running'",
      "startCommand": "Start-Process powershell -ArgumentList \"-NoExit\", \"-Command\", \"cd 'X:\\path\\to\\web'; npm run dev\"",
      "waitTime": 5,
      "verifyCommand": "curl -f http://localhost:3000/api/health"
    }
  ],
  "mcpCommandsSequence": [ ... ],
  "expectedOutcome": "exact expected result",
  "successCriteria": ["specific measurable criteria"],
  "evidenceFile": "exact/path/to/evidence/file.ext",
  "evidenceContent": "description of required content",
  "validationMethod": "how to verify evidence is correct"
}
```

### MCP Command Sequence Format
```json
"mcpCommandsSequence": [
  {
    "step": 1,
    "description": "Take page snapshot",
    "command": "mcp_chrome-devtoo_take_snapshot",
    "parameters": {},
    "immediateAction": {
      "action": "save_raw_output",
      "evidenceFile": "evidence/T###/T###.#/mcp-raw-outputs/step1_snapshot.json",
      "content": "Raw unmodified MCP response"
    }
  },
  {
    "step": 2,
    "description": "Take page screenshot", 
    "command": "mcp_chrome-devtoo_take_screenshot",
    "parameters": {},
    "immediateAction": {
      "action": "save_raw_output",
      "evidenceFile": "evidence/T###/T###.#/mcp-raw-outputs/step2_screenshot.json",
      "content": "Raw unmodified MCP response"
    }
  }
]
```

### Prerequisites Specification
```json
"prerequisites": [
  {
    "name": "Development server running",
    "condition": "localhost:3000 responds to health check",
    "checkSteps": [
      {
        "step": 1,
        "action": "check_server_status",
        "command": "curl -f http://localhost:3000/api/health",
        "expectedResult": "200 OK response",
        "onFailure": "proceed_to_start_server"
      },
      {
        "step": 2,
        "action": "start_server_if_needed",
        "command": "Start-Process powershell -ArgumentList \"-NoExit\", \"-Command\", \"cd 'X:\\Cloud Storage\\Dropbox\\Repositories\\react\\snowva\\packages\\web'; npm run dev\"",
        "waitTime": 10,
        "verifyCommand": "curl -f http://localhost:3000/api/health"
      }
    ]
  }
]
```

## Evidence File Naming Convention

### Pattern
`evidence/[TASK_ID]/[TEST_STEP_ID]/mcp-raw-outputs/[step#]_[action].json`

### Examples
- `evidence/T004/T004.2/mcp-raw-outputs/step1_snapshot.json`
- `evidence/T004/T004.2/mcp-raw-outputs/step2_screenshot.json`
- `evidence/T005/T005.2/mcp-raw-outputs/step1_navigate.json`
- `evidence/T005/T005.2/mcp-raw-outputs/step2_evaluate.json`

## Common MCP Actions

### Browser Navigation
```json
{
  "step": 1,
  "command": "mcp_chrome-devtoo_navigate_page",
  "parameters": {
    "url": "http://localhost:3000/api/v1/quotes"
  },
  "immediateAction": {
    "action": "save_raw_output",
    "evidenceFile": "evidence/T###/T###.#/mcp-raw-outputs/step1_navigate.json"
  }
}
```

### API Testing via Browser
```json
{
  "step": 2,
  "command": "mcp_chrome-devtoo_evaluate_script",
  "parameters": {
    "function": "async () => {\n  const response = await fetch('/api/v1/quotes', {\n    method: 'POST',\n    headers: { 'Content-Type': 'application/json' },\n    body: JSON.stringify(EXACT_PAYLOAD_HERE)\n  });\n  return { status: response.status, data: await response.json() };\n}"
  },
  "immediateAction": {
    "action": "save_raw_output", 
    "evidenceFile": "evidence/T###/T###.#/mcp-raw-outputs/step2_evaluate.json"
  }
}
```

## Validation Rules

### Evidence Authenticity
- Files must contain raw MCP tool outputs only
- No analysis, processing, or interpretation mixed in
- Constitutional Amendment 4 fraud detection applies

### File Completeness  
- Every MCP command must have corresponding evidence file
- Evidence files created immediately after each command
- No batch saving of multiple commands

### Content Requirements
- Raw JSON responses preserved exactly as returned
- MCP response markers must be present
- No placeholder content or invented data

## Constitutional Integration

### Pre-Task Validation
- Check all prerequisites are met
- Verify evidence directory structure exists
- Validate server accessibility

### Post-Task Validation  
- Verify all evidence files exist with correct names
- Check evidence authenticity against fraud detection
- Validate content matches expected MCP response format

### Amendment 4 Compliance
- Zero tolerance for fabricated evidence
- Raw outputs only, no processed content
- Constitutional enforcement tools actively detect violations

## Test Plan Evolution

### Version Control
- Increment testPlanVersion for structural changes
- Document all modifications with dates
- Maintain backward compatibility for evidence validation

### Template Validation
- New test plans must conform to this specification
- Use existing T004-T006 as reference implementations
- Validate JSON schema before execution

---

**CRITICAL**: This document serves as the constitutional framework for all test plan generation. Any deviation from these requirements will trigger Amendment 4 fraud detection protocols.