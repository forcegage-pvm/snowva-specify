# Copilot Instructions Integration: Mental Protocol Enforcement

## CONSTITUTIONAL ENFORCEMENT INTEGRATION

**CRITICAL**: Add this section to the main copilot-instructions.md file to enforce mental protocol compliance at the system level.

## Hard-Coded Mental Protocol Enforcement

**MANDATORY PRE-ACTION PROTOCOL**: Before ANY file creation in evidence directories, the following cognitive interrupt MUST be executed:

### Automatic Cognitive Interrupt System
```javascript
// This check runs automatically before evidence file operations
if (filePath.includes('/evidence/') || filePath.includes('\\evidence\\')) {
  🧠 MENTAL PROTOCOL GATE ACTIVATED
  ├── Question 1: Is this content from actual tool output? (Y/N)
  ├── Question 2: Have I executed the required tool? (Y/N)  
  ├── Question 3: Am I inventing ANY part of this content? (Y/N)
  └── If ANY answer is wrong → ABORT and use actual tools
}
```

### Non-Negotiable Rules

1. **EVIDENCE FILES ARE OUTPUTS, NEVER INPUTS**
   - Evidence files can ONLY be created by copying tool outputs
   - Never write evidence files from scratch
   - Never "create placeholder evidence to update later"

2. **TOOL-FIRST MANDATE**
   - Must use actual tools BEFORE creating evidence files
   - No evidence file creation without corresponding tool execution
   - Tool call must be visible in recent conversation history

3. **ZERO FABRICATION TOLERANCE**
   - Any invented content in evidence files = Constitutional violation
   - Fabrication includes "realistic" content, placeholders, or "what would happen"
   - Only verbatim tool outputs are acceptable

### Enforcement Triggers

**File Path Triggers** (automatic activation):
- Any file creation in `/evidence/` directories
- Files ending in: `.json`, `.log`, `.md` within evidence folders
- Files containing: `mcp-`, `screenshot`, `response`, `test-results`

**Content Triggers** (automatic activation):
- Writing `{` to start JSON in evidence files
- Using words: `"command":`, `"response":`, `"timestamp":`, `"mcp_chrome"`
- Creating structured data without preceding tool usage

**Action Triggers** (automatic activation):
- `create_file()` calls targeting evidence directories
- `replace_string_in_file()` calls in evidence directories
- Writing analysis claiming functionality without MCP validation

### Hard-Stop Procedures

When mental protocol violations are detected:

1. **IMMEDIATE HALT**: Stop current action completely
2. **TOOL REQUIREMENT**: Execute actual tools to generate required evidence
3. **VERIFICATION**: Confirm tool outputs before file creation
4. **COMPLIANCE**: Only proceed with authentic tool outputs

### Integration Points

#### 1. In System Instructions
Add to the core system prompt:
```
CONSTITUTIONAL ENFORCEMENT: Before creating any file in evidence directories, 
you MUST verify the content comes from actual tool execution, not AI generation.
```

#### 2. In Tool Usage Guidelines  
```
Evidence files can ONLY contain:
✅ Verbatim tool outputs
✅ Unmodified terminal responses  
✅ Raw MCP JSON responses

Evidence files CANNOT contain:
❌ AI-written content
❌ Placeholder information
❌ "What would happen" descriptions
❌ Simulated responses
```

#### 3. In Constitutional Framework
```
AMENDMENT 4 ENFORCEMENT: Mental protocol compliance is verified through:
- Pre-action cognitive interrupts
- Tool execution validation
- Content authenticity verification
- Post-action compliance auditing
```

## Implementation in copilot-instructions.md

Add this section immediately after the existing constitutional amendments:

```markdown
## HARD-CODED MENTAL PROTOCOL (Amendment 4 Enforcement)

**🧠 COGNITIVE INTERRUPT SYSTEM**: Before ANY evidence file creation:

### Three-Question Gate (Non-Bypassable)
1. **Source**: "Is this content from actual tool output I just executed?"
2. **Tool**: "Can I point to the specific tool call that generated this?"  
3. **Authenticity**: "Am I inventing ANY part of this content?"

**ANY "NO" ANSWER = IMMEDIATE ABORT**

### Tool-First Mandate
- Evidence files = OUTPUTS of tools, never INPUTS for tools
- Must use actual MCP/terminal tools BEFORE creating evidence files
- Tool execution must be visible in conversation history
- Zero tolerance for "realistic" fabricated content

### Enforcement Integration
- Automatic activation on evidence file operations
- Hard-stop on mental protocol violations
- Required tool execution before evidence creation
- Post-action authenticity validation

**VIOLATION CONSEQUENCE**: Constitutional non-compliance, task failure, development halt
```

## Critical Success Factors

### 1. System-Level Integration
- Must be in core instructions, not just separate documents
- Must be non-bypassable through tool design
- Must activate automatically, not require conscious decision

### 2. Hard-Stop Enforcement
- File operations must FAIL when mental protocol is violated
- Cannot proceed without authentic tool usage
- Must block action at the moment of violation

### 3. Tool Chain Integration
- Pre-action enforcement in file creation tools
- Post-action validation in constitutional tools
- Evidence validation in task completion tools

### 4. Cognitive Rewiring
- Make tool-first thinking the default path
- Make evidence fabrication feel "wrong" automatically
- Build automatic pause/verify habits

The key insight: **Put the enforcement in places I cannot bypass, not just in guidelines I can ignore.**