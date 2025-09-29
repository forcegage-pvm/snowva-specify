# Task Execution Framework v2.0 - Design Documentation

**Version**: 2.0.0  
**Created**: September 29, 2025  
**Purpose**: Generic, extensible, self-contained task execution system

## Core Design Principles

### 1. **Generic Action System**
- Any type of command can be executed (terminal, MCP, file operations, process control)
- Unified action structure regardless of execution type
- Extensible action types without breaking existing tasks

### 2. **Self-Contained Execution**
- Each action knows how to execute itself
- Each action defines its own success/failure handling
- Each action specifies its own result handling and evidence generation

### 3. **Comprehensive Flow Control**
- `onSuccess` and `onFailure` chains for every action
- Nested action execution for complex workflows
- Conditional execution based on results

### 4. **Variable Substitution**
- Template-based variables: `{workspaceRoot}`, `{evidenceDirectory}`, `{timestamp}`
- Dynamic variable resolution at execution time
- Extensible variable system

### 5. **Evidence Management**
- Self-contained evidence generation per action
- Raw output preservation with fraud prevention
- Automatic directory structure creation

## Framework Structure

### Global Configuration
```json
"globalConfiguration": {
  "workspaceRoot": "X:\\path\\to\\workspace",
  "evidenceBaseDirectory": "evidence", 
  "constitutionalEnforcement": true,
  "fraudDetection": true
}
```

### Execution Engine
Defines available action types and their execution requirements:

#### Action Types
- **TERMINAL_COMMAND**: Execute shell commands
- **MCP_COMMAND**: Call MCP server functions  
- **FILE_OPERATION**: File system operations
- **PROCESS_CONTROL**: Process management (start, stop, wait)
- **VALIDATION**: Result validation and checking

#### Result Handlers
- **SAVE_TO_FILE**: Save results to evidence files
- **EXTRACT_DATA**: Extract data patterns from results
- **VALIDATE_CONTENT**: Validate result content

### Task Structure

#### Prerequisites
Self-contained checks with automatic remediation:
```json
"prerequisites": [
  {
    "name": "development_server_check",
    "actions": [
      {
        "type": "TERMINAL_COMMAND",
        "onFailure": [
          {
            "type": "PROCESS_CONTROL",
            "parameters": {"action": "start_separate_process"}
          }
        ]
      }
    ]
  }
]
```

#### Steps
Each step contains a list of actions with complete flow control:
```json
"steps": [
  {
    "stepId": "T004.1", 
    "actions": [
      {
        "actionId": "execute_tests",
        "type": "TERMINAL_COMMAND",
        "resultHandling": [...],
        "onSuccess": [...],
        "onFailure": [...]
      }
    ]
  }
]
```

#### Actions
Self-contained execution units:
```json
{
  "actionId": "unique_action_name",
  "type": "ACTION_TYPE",
  "parameters": {
    "command": "npm test",
    "workingDirectory": "{workspaceRoot}/packages/web"
  },
  "resultHandling": [
    {
      "type": "SAVE_TO_FILE",
      "parameters": {
        "outputPath": "{evidenceDirectory}/results.log",
        "content": "{result.fullOutput}"
      }
    }
  ],
  "onSuccess": [
    // Actions to execute on success
  ],
  "onFailure": [
    // Actions to execute on failure  
  ]
}
```

## Key Improvements Over v1.0

### 1. **Eliminates Redundancy**
- No duplicate information scattered across different sections
- Single source of truth for each action
- Unified structure regardless of action type

### 2. **True Extensibility** 
- Add new action types without changing existing tasks
- Extend result handlers without breaking compatibility
- Variable system allows easy customization

### 3. **Complete Flow Control**
- Every action has success/failure paths defined
- Nested action execution for complex scenarios
- Technical debt creation can be specified in `onFailure` blocks

### 4. **Self-Documenting**
- Each action describes its purpose, execution, and handling
- Clear relationship between actions and evidence generation
- Unambiguous execution path

### 5. **Constitutional Compliance Built-In**
- Fraud detection at framework level
- Raw output enforcement in result handlers
- Evidence authenticity validation

## Execution Flow

1. **Parse Task**: Load task definition with variable substitution
2. **Check Prerequisites**: Execute prerequisite actions with auto-remediation
3. **Execute Steps**: Run each step's actions in sequence
4. **Handle Results**: Apply result handlers (save files, extract data, validate)
5. **Flow Control**: Execute onSuccess/onFailure chains
6. **Validate Completion**: Check completion criteria
7. **Post-Task Actions**: Execute cleanup/summary actions

## Variable System

### Built-in Variables
- `{workspaceRoot}`: Project root directory
- `{evidenceDirectory}`: Task evidence directory
- `{timestamp}`: Current timestamp
- `{taskId}`: Current task identifier
- `{stepId}`: Current step identifier
- `{result.fullOutput}`: Full output from previous action
- `{result.exitCode}`: Exit code from previous action
- `{result.error}`: Error message from previous action

### Custom Variables
- Extracted data becomes variables: `{testSuiteStats}`
- Configuration values: `{globalConfiguration.workspaceRoot}`
- Dynamic resolution at execution time

## Technical Debt Integration

Technical debt is created through `onFailure` actions:
```json
"onFailure": [
  {
    "type": "FILE_OPERATION",
    "parameters": {
      "operation": "create",
      "filePath": "{evidenceDirectory}/technical-debt.json",
      "content": "{\"taskId\": \"{taskId}\", \"issue\": \"Test execution failed\", \"priority\": \"HIGH\"}"
    }
  }
]
```

## Evidence Generation

Each action that needs to preserve evidence uses `resultHandling`:
```json
"resultHandling": [
  {
    "type": "SAVE_TO_FILE",
    "parameters": {
      "outputPath": "{evidenceDirectory}/raw-mcp-output.json",
      "content": "{result.rawOutput}",
      "format": "raw_json"
    }
  }
]
```

## Constitutional Enforcement

Framework enforces Amendment 4 compliance:
- All MCP outputs saved as raw JSON
- File integrity validation
- Fraud detection for fabricated evidence
- Authentic evidence requirement

## Usage Example

To execute a task:
1. Load task definition from JSON
2. Substitute variables
3. Execute prerequisites 
4. Execute steps in order
5. Apply success/failure handling
6. Generate evidence files
7. Validate completion

The framework is completely self-contained - no external interpretation required.

---

This design creates a true "bible" for task execution that is:
- **Complete**: Every aspect of execution is defined
- **Generic**: Works for any type of command or operation
- **Extensible**: New action types can be added easily
- **Unambiguous**: No interpretation required
- **Self-Contained**: Each action defines its complete behavior