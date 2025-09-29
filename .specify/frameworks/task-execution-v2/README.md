# Task Execution Framework v2.1

**Location**: `.specify/frameworks/task-execution-v2/`  
**Purpose**: Generic, extensible task execution framework with advanced technical debt management for TDD workflows  
**Status**: Production Ready  
**Version**: 2.1.0 (Enhanced with Technical Debt Management)

## Overview

This directory contains the complete Task Execution Framework v2.0 - a generic, extensible system for defining and executing complex automated tasks with constitutional compliance, evidence generation, and comprehensive error handling.

The framework was developed as part of the snowva project but is designed to be completely generic and reusable across any project or workflow that requires:
- Automated task execution with comprehensive logging
- Evidence-based validation and audit trails  
- Constitutional compliance and fraud detection
- Extensible action types and result handlers
- Self-contained task definitions requiring no external interpretation

## Directory Structure

### Core Framework Files
- **`task-execution-framework-v2.1-enhanced.schema.json`** - v2.1 JSON schema with technical debt management
- **`task-execution-framework-v2-enhanced.schema.json`** - v2.0 JSON schema (stable)
- **`task-execution-framework-v2.schema.json`** - Original JSON schema (legacy)
- **`task-execution-framework-v2.json`** - Basic framework example
- **`tdd-debt-example.json`** - Complete TDD test failure → technical debt workflow example

### Documentation
- **`technical-debt-management.md`** - Complete guide to TDD debt workflows and classification
- **`enhanced-schema-documentation.md`** - Comprehensive documentation for the enhanced schema
- **`framework-v2-documentation.md`** - Original framework design documentation  
- **`test-plan-generation-guidelines.md`** - Guidelines for creating new task execution plans
- **`README.md`** - This file

## Key Features

### 🎯 **Success/Failure/Error Distinction**
- **`onSuccess`**: Action executed successfully (exit code 0, no exceptions)
- **`onFailure`**: Action executed but failed (business logic failure, test failure)  
- **`onError`**: Execution error (network timeout, system unavailable)

### 🔧 **Extensible Action System**
- **TERMINAL_COMMAND**: Execute shell commands with full output capture
- **MCP_COMMAND**: Call Model Context Protocol server functions
- **FILE_OPERATION**: File system operations (create, read, write, delete)
- **PROCESS_CONTROL**: Process management (start, stop, monitor)
- **VALIDATION**: Validate conditions, files, system state

### 📋 **Self-Contained Tasks**
- Complete task definitions with prerequisites, steps, and validation
- No external interpretation required - everything explicitly defined
- Variable substitution for dynamic values
- Evidence generation with constitutional compliance

### 🛡️ **Constitutional Compliance**
- Amendment 4 fraud detection and evidence authenticity
- Raw output enforcement prevents fabricated evidence
- File integrity validation and audit trails
- Built-in fraud prevention mechanisms

## Usage

### 1. **Create Task Definition**
Use the enhanced JSON schema to create a task definition file:
```json
{
  "testPlanVersion": "2.0.0",
  "createdDate": "2025-09-29",
  "description": "Your task description",
  "globalConfiguration": { ... },
  "executionEngine": { ... },
  "tasks": { ... },
  "executionRules": { ... }
}
```

### 2. **Validate Against Schema**
```bash
# Validate your task definition
ajv validate -s task-execution-framework-v2-enhanced.schema.json -d your-task.json
```

### 3. **Execute Tasks**
The framework can be executed by any system that implements the action types and result handlers defined in the `executionEngine` registry.

## Framework Benefits

### **For Developers**
- **Type Safety**: Strong JSON schema validation prevents runtime errors
- **Clear Contracts**: Every field has explicit purpose and usage documentation
- **Extensibility**: Easy to add new action types and result handlers
- **Self-Documenting**: Schema serves as authoritative specification

### **For Execution**
- **Reliability**: Comprehensive error handling prevents cascading failures
- **Traceability**: Complete evidence chain for debugging and audit
- **Compliance**: Built-in constitutional enforcement and fraud detection
- **Maintainability**: Self-contained task definitions

### **For Audit**
- **Evidence Integrity**: Fraud detection prevents evidence tampering
- **Complete Traceability**: Full execution logs and evidence files
- **Constitutional Compliance**: Amendment enforcement and authenticity validation
- **Accountability**: Clear success/failure attribution with timestamps

## Development Guidelines

### **Adding New Action Types**
1. Define the action type in `executionEngine.actionTypes`
2. Specify required and optional parameters
3. Implement the executor in your framework implementation
4. Update documentation with usage examples

### **Creating Task Definitions**
1. Follow the enhanced schema structure
2. Use meaningful task and step IDs (T001, T001.1, etc.)
3. Provide comprehensive descriptions for all elements
4. Define all three response paths: onSuccess, onFailure, onError
5. Include evidence generation in result handlers
6. Add completion criteria for validation

### **Constitutional Compliance**
- All evidence files must contain authentic tool outputs
- No manually created or fabricated evidence allowed
- Evidence files must be created immediately after tool execution
- Directory structure must follow task organization patterns

## Migration from v1.0

### **Breaking Changes**
- `onSuccess`, `onFailure`, `onError` now required on all actions
- Evidence structure changed to step-based organization  
- Action types must be registered in execution engine
- Validation criteria moved to structured format

### **Migration Steps**
1. Add missing response paths to all actions
2. Update evidence file paths to new structure
3. Register custom action types in execution engine
4. Validate against enhanced schema
5. Test execution with new framework

## Version History

- **v2.1.0** (2025-09-29): Enhanced with comprehensive technical debt management, TDD test failure workflows, and Constitutional Amendment 6 compliance
- **v2.0.0** (2025-09-29): Complete redesign with enhanced schema, success/failure/error distinction, and constitutional compliance
- **v1.0.0** (2025-09-28): Initial framework design (deprecated)

## Support

For questions, issues, or contributions related to the Task Execution Framework:
1. Review the comprehensive documentation in this directory
2. Validate your task definitions against the enhanced schema
3. Check the example task definition for reference patterns
4. Ensure constitutional compliance requirements are met

---

**This framework serves as the "bible" for automated task execution across all snowva projects and beyond.**