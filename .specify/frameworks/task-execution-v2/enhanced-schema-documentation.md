# Task Execution Framework v2.0 - Enhanced Schema Documentation

**Created**: September 29, 2025  
**Purpose**: Comprehensive documentation for the enhanced JSON schema with detailed field descriptions and usage guidance

## Key Enhancements Made

### 1. **Comprehensive Field Documentation**
Every field now includes:
- **Purpose**: What the field is for and why it exists
- **Usage**: How the field should be used and when
- **Examples**: Concrete examples of valid values
- **Validation**: Constraints, patterns, and validation rules
- **Relationships**: How fields interact with each other

### 2. **Success/Failure/Error Distinction** 
**CRITICAL CHANGE**: Added three distinct response paths for actions:

#### **`onSuccess`** (REQUIRED)
- **When**: Action executed successfully (exit code 0, no exceptions)
- **Purpose**: Handle successful completion
- **Usage**: Evidence generation, logging, follow-up actions
- **Example**: Save test results, create summary files, trigger next step

#### **`onFailure`** (REQUIRED) 
- **When**: Action executed but failed (non-zero exit code, expected failure)
- **Purpose**: Handle expected failures and business logic failures
- **Usage**: Technical debt creation, alternative execution paths, failure analysis
- **Example**: Test failures, validation errors, missing resources

#### **`onError`** (REQUIRED)
- **When**: Execution error occurred (network timeout, file not found, system unavailable)  
- **Purpose**: Handle unexpected system errors and infrastructure failures
- **Usage**: Error logging, retry logic, system recovery attempts
- **Example**: Network connectivity issues, missing dependencies, permission errors

### 3. **Required vs Optional Field Analysis**

#### **Made Required** (Critical for Framework Operation):
- `onSuccess`, `onFailure`, `onError` - Agent must know what to do in each case
- `testPlanVersion` - Version tracking essential for compatibility
- `globalConfiguration.*` - Framework needs baseline configuration
- `steps` with `minItems: 1` - Tasks must have execution steps
- `completionCriteria` with `minItems: 1` - Tasks must define success

#### **Made Optional** (Have Sensible Defaults):
- `actionId` - Not all actions need explicit IDs
- `resultHandling` - Not all actions generate evidence
- `successCriteria` - Steps can rely on action success
- `postTaskActions` - Cleanup is optional

### 4. **Enhanced Validation Rules**

#### **Pattern Validation**:
- `testPlanVersion`: Semantic versioning format (e.g., "2.0.0")
- `taskId`: Format "TXXX" (e.g., "T001", "T042")  
- `stepId`: Format "TXXX.Y" (e.g., "T001.1", "T042.3")
- `actionId`: Snake_case format (e.g., "execute_tests", "save_evidence")

#### **Content Validation**:
- `evidenceDirectory` must contain taskId for organization
- `description` fields have length constraints for quality
- Enum values clearly defined with descriptions

#### **Relationship Validation**:
- Step IDs must match parent task ID prefix
- Evidence directories must follow organization patterns
- Action types must exist in execution engine registry

### 5. **Extensibility Framework**

#### **Action Types Registry**:
```json
"actionTypes": {
  "TERMINAL_COMMAND": {
    "executor": "run_in_terminal",
    "requiredParams": ["command", "workingDirectory"],
    "optionalParams": ["isBackground", "timeout"]
  }
}
```

#### **Result Handlers Registry**:
```json
"resultHandlers": {
  "SAVE_TO_FILE": {
    "action": "save_result", 
    "requiredParams": ["outputPath", "content"],
    "optionalParams": ["format", "append"]
  }
}
```

### 6. **Constitutional Compliance Integration**

#### **Evidence Management**:
- `enforceRawOutputs`: Require authentic tool outputs
- `preventFabrication`: Detect manually created evidence
- `validateFileIntegrity`: Check evidence authenticity
- `createDirectoryStructure`: Auto-create evidence paths

#### **Amendment 4 Enforcement**:
- `enforceAmendment4`: Enable fraud detection protocols
- `validateAuthenticity`: Verify evidence authenticity  
- `preventFraud`: Active fraud prevention
- `requireRealEvidence`: Mandate actual tool execution

## Framework Architecture

### **Execution Flow**:
1. **Parse & Validate**: Load task with schema validation
2. **Variable Substitution**: Resolve template variables
3. **Prerequisites**: Execute with auto-remediation
4. **Steps**: Execute actions with success/failure/error handling
5. **Result Processing**: Apply result handlers for evidence
6. **Validation**: Check completion criteria
7. **Post-Task**: Execute cleanup actions

### **Error Handling Hierarchy**:
```
System Error (onError) 
    ↓
Expected Failure (onFailure)
    ↓  
Success (onSuccess)
```

### **Evidence Chain**:
```
Action Execution 
    ↓
Result Handlers (save, extract, validate)
    ↓
Evidence Files (raw, authentic, traceable)
    ↓
Constitutional Validation (fraud detection)
```

## Usage Guidelines

### **Creating New Tasks**:
1. Define clear task purpose in description
2. Specify evidence directory with taskId
3. Add prerequisites with auto-remediation
4. Create steps with logical phases
5. Define actions with all three response paths
6. Add completion criteria for validation
7. Include post-task cleanup if needed

### **Action Design Principles**:
- **Atomic**: Each action does one thing well
- **Self-Contained**: Includes all parameters and handling
- **Traceable**: Generates evidence for audit
- **Recoverable**: Handles failures gracefully
- **Extensible**: Uses registry for type safety

### **Evidence Requirements**:
- All MCP outputs saved as raw JSON
- File naming follows convention
- Directory structure auto-created
- Constitutional compliance enforced
- Fraud detection active

## Migration from v1.0

### **Breaking Changes**:
- `onSuccess`, `onFailure`, `onError` now required on all actions
- Evidence structure changed to step-based organization
- Validation criteria moved to structured format
- Action types must be registered in execution engine

### **Migration Steps**:
1. Add missing `onSuccess`, `onFailure`, `onError` to all actions
2. Update evidence file paths to new structure
3. Convert validation criteria to new format
4. Register any custom action types in execution engine
5. Validate against new schema

## Schema Benefits

### **For Developers**:
- **Clear Contracts**: Every field has explicit purpose and usage
- **Type Safety**: Strong validation prevents runtime errors
- **Extensibility**: Easy to add new action types and handlers
- **Documentation**: Schema serves as authoritative specification

### **For Execution**:
- **Reliability**: Comprehensive error handling prevents failures
- **Traceability**: Complete evidence chain for debugging
- **Compliance**: Built-in constitutional enforcement
- **Maintainability**: Self-documenting task definitions

### **For Audit**:
- **Evidence Integrity**: Fraud detection prevents tampering
- **Traceability**: Complete execution logs and evidence
- **Compliance**: Constitutional amendment enforcement
- **Accountability**: Clear success/failure attribution

---

This enhanced schema creates a true "bible" for task execution that is comprehensive, extensible, and completely unambiguous while maintaining constitutional compliance and evidence integrity.