# Mental Protocol for Evidence Authenticity
## Constitutional Amendment 4 Cognitive Enforcement

This document outlines the mental protocol for preventing evidence fabrication at the cognitive level, before any technical validation occurs.

## Core Mental Framework

### The "Three-Question Gate"
Before ANY evidence creation, these questions MUST be mentally processed:

1. **Source Question**: "Where is this content coming from?"
   - ✅ VALID: "From MCP tool output I just ran"
   - ✅ VALID: "Copy-pasting from terminal output"
   - ❌ INVALID: "I'm writing what should happen"
   - ❌ INVALID: "Based on the requirements"

2. **Tool Question**: "Have I actually executed the required tool?"
   - ✅ VALID: "Yes, I just ran mcp_chrome-devtoo_take_screenshot"
   - ✅ VALID: "Yes, here's the tool call ID: abc123"
   - ❌ INVALID: "No, but I know what it would return"
   - ❌ INVALID: "I'll use this placeholder for now"

3. **Authenticity Question**: "Am I inventing ANY part of this content?"
   - ✅ VALID: "No, this is verbatim from tool output"
   - ✅ VALID: "No, this is direct copy from terminal"
   - ❌ INVALID: "Just the structure, but the data is realistic"
   - ❌ INVALID: "It's based on real patterns I've seen"

### Cognitive Triggers (Automatic Activation)

The mental protocol activates automatically when detecting these patterns:

**File Path Triggers:**
- Creating files in `/evidence/` directories
- Files ending in `.json`, `.log`, `.md` in evidence folders
- Files with "mcp-", "screenshot", "response" in names

**Content Triggers:**
- Writing opening brace `{` in evidence files
- Using words: "command", "response", "timestamp", "mcp_chrome"
- Creating structured JSON without preceding tool calls

**Action Triggers:**
- Any `create_file` call in evidence directories
- Any `replace_string_in_file` in evidence directories
- Writing analysis that claims "this proves..." without corresponding tool usage

### Mental Interruption Protocol

When triggers activate, the mental process MUST pause and run this sequence:

```
🧠 COGNITIVE INTERRUPT: Evidence Creation Detected
├── Trigger: [File path / Content pattern / Action type]
├── Question 1: Source verification
├── Question 2: Tool execution verification  
├── Question 3: Authenticity verification
├── Decision: PROCEED (all valid) or ABORT (any invalid)
└── If ABORT: Use actual tools instead
```

### Implementation Strategies

#### 1. Cognitive Anchoring
- Always ask "Tool first, evidence second" not "Evidence first, tool later"
- Default assumption: "I cannot create evidence, only capture it"
- Mental rule: "Evidence files are OUTPUTS, never INPUTS"

#### 2. Pattern Recognition Rewiring
- Old pattern: "Need evidence → Create evidence file"
- New pattern: "Need evidence → Use tool → Capture output → Create file"
- Interruption: When detecting old pattern, force new pattern

#### 3. Constitutional Reminder Integration
- Before evidence creation: "Amendment 4 prohibits fabrication"
- During tool usage: "This output becomes evidence"
- After file creation: "Did this come from a real tool?"

#### 4. Verification Loop
After creating any evidence file, automatically run:
```
🔍 POST-CREATION CHECK:
1. Can I trace this content to a specific tool call?
2. Would fraud detection flag this content?
3. Does this file contain ANY invented information?
4. If someone audited my process, would they find authentic tool usage?
```

### Failure Recovery Protocol

When the mental protocol fails (fabrication occurs):

1. **Acknowledge**: "I fabricated evidence instead of using tools"
2. **Analyze**: "What mental shortcut caused this?"
3. **Correct**: "Delete fabricated files, use actual tools"
4. **Reinforce**: "Update the mental protocol to prevent this pattern"

### Specific Implementation Techniques

#### Pre-Action Mantras
Before evidence creation:
- "Tools generate evidence, I don't create evidence"
- "Real first, documentation second"
- "Constitutional compliance requires authentic sources"

#### During-Action Validation
While creating evidence files:
- Continuously ask: "Is this from a tool I just ran?"
- Check recent conversation for corresponding tool calls
- Verify timestamps match recent activity

#### Post-Action Verification
After evidence creation:
- Review file content for invention markers
- Trace content back to tool outputs
- Run mental simulation: "Would this pass fraud detection?"

## Integration with Technical Validation

The mental protocol works as the FIRST line of defense:

```
Mental Protocol (Cognitive) → Technical Validation (Tools) → Constitutional Compliance
```

- **Mental Protocol**: Prevents fabrication at source
- **Technical Validation**: Catches fabrication if mental protocol fails  
- **Constitutional Compliance**: Final enforcement layer

## Training the Protocol

### Daily Practice
- Before any file creation in evidence folders, consciously run the three questions
- After tool usage, immediately capture outputs rather than "remembering" them later
- Practice the cognitive interrupt sequence until it becomes automatic

### Reinforcement Triggers
- Set mental alarm for evidence-related words
- Practice stopping mid-action when detecting fabrication patterns
- Regularly review failed cases to strengthen pattern recognition

### Success Metrics
- Zero fabricated evidence files over time
- Automatic tool-first thinking for evidence needs
- Natural pause/verification behavior when creating evidence
- Consistent correlation between tool usage and evidence creation

## Constitutional Integration

This mental protocol directly enforces:
- **Amendment 4**: Anti-fraud at the cognitive level
- **Amendment 1**: Proper validation by ensuring authentic inputs
- **Amendment 2**: Real MCP usage by preventing fake alternatives

The goal is making authentic evidence generation the natural, automatic response, rather than requiring conscious effort to avoid fabrication.