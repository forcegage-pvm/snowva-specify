# Tool Execution Hooks Implementation Guide

## Overview
This document outlines how to implement non-bypassable mental protocol enforcement through tool execution hooks.

## Implementation Strategy

### Phase 1: Tool Wrapper Integration
Create wrapper functions that automatically run pre-action enforcement before any evidence file operations.

### Phase 2: VS Code Extension Integration  
If VS Code allows, integrate the enforcer directly into the create_file and replace_string_in_file tool implementations.

### Phase 3: Conversation Context Integration
Ensure the mental protocol is triggered through conversation-level awareness.

## Technical Implementation

### Tool Hook Architecture

```javascript
// Wrapper for create_file tool
function create_file_with_enforcement(filePath, content) {
  // AUTOMATIC MENTAL PROTOCOL ENFORCEMENT
  if (isEvidenceFile(filePath)) {
    const enforcer = new PreActionEvidenceEnforcer();
    const result = enforcer.enforcePreActionProtocol('CREATE_FILE', filePath, content);
    
    if (!result.allowed) {
      throw new Error(`🚫 MENTAL PROTOCOL VIOLATION: ${result.reason}`);
    }
  }
  
  // Original tool execution
  return original_create_file(filePath, content);
}
```

### Integration Points

1. **File Creation Hook**: Intercept all create_file calls
2. **File Edit Hook**: Intercept all replace_string_in_file calls  
3. **Directory Hook**: Monitor evidence directory operations
4. **Content Hook**: Scan content for fabrication patterns

### Enforcement Mechanisms

#### Automatic Trigger Detection
```javascript
const EVIDENCE_PATTERNS = {
  paths: ['/evidence/', '\\evidence\\'],
  files: ['.json', '.log', '.md'],
  names: ['mcp-', 'screenshot', 'response', 'test-results'],
  content: ['"command":', '"response":', '"timestamp":']
};
```

#### Pre-Action Validation
```javascript
function validateBeforeAction(operation, filePath, content) {
  console.log('🧠 MENTAL PROTOCOL: Evidence operation detected');
  
  // Three-question gate (mandatory)
  const questions = [
    validateToolOutput(content),
    validateToolExecution(conversation_history),
    validateAuthenticity(content)
  ];
  
  const failed = questions.find(q => !q.passed);
  if (failed) {
    throw new Error(`BLOCKED: ${failed.reason}`);
  }
}
```

## Implementation Details

### 1. Conversation Context Monitoring
Track tool usage in conversation to validate Question 2 ("Have I executed the required tool?"):

```javascript
class ConversationToolTracker {
  constructor() {
    this.recentTools = new Map();
  }
  
  recordToolUsage(toolName, timestamp, result) {
    this.recentTools.set(toolName, { timestamp, result });
  }
  
  hasRecentToolExecution(requiredTool, withinMinutes = 10) {
    const recent = this.recentTools.get(requiredTool);
    if (!recent) return false;
    
    const now = Date.now();
    const ageMinutes = (now - recent.timestamp) / (1000 * 60);
    return ageMinutes <= withinMinutes;
  }
}
```

### 2. Content Pattern Validation
Implement the three-question gate validation:

```javascript
function validateMentalProtocolQuestions(content, filePath, conversationHistory) {
  // Question 1: Source validation
  if (hasAIGeneratedPatterns(content)) {
    return { passed: false, reason: "Content appears AI-generated, not tool output" };
  }
  
  // Question 2: Tool execution validation  
  if (!hasCorrespondingToolExecution(filePath, conversationHistory)) {
    return { passed: false, reason: "No recent tool execution found for this evidence type" };
  }
  
  // Question 3: Authenticity validation
  if (hasInventedContent(content)) {
    return { passed: false, reason: "Content contains invented/fabricated information" };
  }
  
  return { passed: true };
}
```

### 3. Hard-Stop Implementation
When violations are detected, the system must completely halt:

```javascript
function enforceHardStop(violation) {
  // Log the violation
  console.error(`🚨 CONSTITUTIONAL VIOLATION: ${violation.reason}`);
  
  // Provide remediation guidance
  console.log(`📋 REQUIRED ACTION: ${violation.requiredAction}`);
  
  // Throw error to stop execution
  throw new Error(`Mental Protocol Violation - Operation Blocked`);
}
```

## Integration Challenges and Solutions

### Challenge 1: Tool Implementation Access
**Problem**: Cannot modify VS Code's built-in create_file tool
**Solution**: Create enforcement wrapper that validates before calling the tool

### Challenge 2: Conversation Context Access  
**Problem**: Limited access to conversation history
**Solution**: Use approximate validation based on content patterns and recent context

### Challenge 3: Bypass Prevention
**Problem**: Could use different tools or approaches to bypass enforcement
**Solution**: Multiple enforcement layers - tool hooks, content validation, post-action auditing

## Success Metrics

### Immediate Indicators
- Pre-action enforcer blocks fabrication attempts
- Tool execution validation prevents evidence creation without tools
- Content pattern detection catches AI-generated evidence

### Long-term Indicators  
- Zero fabricated evidence files in evidence directories
- 100% correlation between tool usage and evidence file creation
- Automatic tool-first behavior becomes natural

## Implementation Priority

1. **Phase 1**: Content pattern validation (can implement immediately)
2. **Phase 2**: Conversation history tracking (requires context integration)
3. **Phase 3**: Tool execution hooks (requires system-level integration)
4. **Phase 4**: Hard-stop enforcement (requires error handling integration)

The goal is creating multiple layers of enforcement so even if one layer fails, others catch the violation.