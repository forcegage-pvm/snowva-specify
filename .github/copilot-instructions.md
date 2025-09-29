# snowva Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-09-23

## Active Technologies

- TypeScript 5.1+, Node.js 18+ + Next.js 15 App Router, React 18, Zod validation, TanStack Query (005-sprint-004-1)

- [e.g., Python 3.11, Swift 5.9, Rust 1.75 or NEEDS CLARIFICATION] + [e.g., FastAPI, UIKit, LLVM or NEEDS CLARIFICATION] (003-sprint-3-1-documents)
- [if applicable, e.g., PostgreSQL, CoreData, files or N/A] (003-sprint-3-1-documents)
- TypeScript 5.1+ (strict mode) + Next.js 15 App Router, React 18, Tailwind CSS 3.4, TanStack Query, TanStack Virtual, Zod (003-sprint-3-1-documents)
- Deterministic mock fixtures (transitioning to Snowva API/Firebase service layer) (003-sprint-3-1-documents)
- TypeScript 5.1+ with Next.js 15 App Router, React 18 + TanStack Query v5, TanStack Virtual v3, Tailwind CSS 3.4, Headless UI, Zod validation (004-sprint-4-quotes)
- Mock data transitioning to Firebase/API service layer (004-sprint-4-quotes)

- TypeScript 5.0+, Node.js 18+ + Next.js 14, Tailwind CSS 3.4, React 18, Firebase SDK (for future implementation) (001-core-features)

## Project Structure

```
backend/
frontend/
tests/
```

## Commands

npm test; npm run lint

## Code Style

TypeScript 5.0+, Node.js 18+: Follow constitutional principles - Component-First development with Tailwind CSS utilities, Test-First TDD approach (Test Pyramid: 70% Unit, 20% Integration, 10% E2E), Business Data Integrity for financial calculations, Design System Consistency, and Performance/Accessibility requirements. ALL hooks and validation schemas MUST have comprehensive unit tests with edge cases.

**CONSTITUTIONAL MANDATE 8: ZERO ERROR TOLERANCE** - NO ERRORS of ANY KIND are acceptable in the codebase except TDD failing tests during red phase. ALL TypeScript compilation errors, linting errors, and runtime errors MUST be resolved immediately before proceeding to next task. Run `npx tsc --noEmit --skipLibCheck` after every significant change to ensure zero errors.

**CRITICAL**: IMMEDIATELY update tasks.md with [x] after completing each task - NO EXCEPTIONS. This prevents hallucination and ensures accurate progress tracking.

**CONSTITUTIONAL v1.1**: All component status reporting MUST use standardized completion levels (LEVEL 0-5). Claims of functionality MUST be supported by demonstrable evidence. Use completion level framework: 🔴 STUB → 🟡 COSMETIC → 🟠 INTERACTIVE → 🔵 INTEGRATED → 🟢 FUNCTIONAL → ✅ PRODUCTION.

**MANDATORY**: ALL component status reports MUST pass constitutional validation using: `node .specify/tools/constitutional-checker.js [status-file.md]`. Reports failing constitutional validation MUST be remediated. See `.specify/templates/component-status-template.md` for reporting format.

**CONSTITUTIONAL ENFORCEMENT ACTIVE**: Constitutional Amendments 1-3 are ENFORCED with automated tools:

- **Amendment 1**: Mandatory validation gates prevent task completion without evidence
- **Amendment 2**: MCP browser testing required for ALL UI functionality claims
- **Amendment 3**: Automated constitutional audit blocks development when compliance < 80%

**ENFORCEMENT TOOLS**:

- Pre-task validation: `node .specify/tools/pre-task-check.js [taskId]`
- Post-task validation: `node .specify/tools/post-task-validation.js [taskId]`
- MCP evidence validation: `node .specify/tools/mcp-evidence-validator.js [evidenceDir] [taskId]`
- Constitutional audit: `node .specify/tools/constitutional-audit.js`
- Full enforcement: `node .specify/tools/constitutional-enforcement.js`

See .specify/memory/constitution.md, .specify/memory/testing-strategy.md, and .specify/memory/tool-usage-instructions.md for complete guidelines.

**CONSTITUTIONAL AMENDMENT 4 - ANTI-FRAUD ENFORCEMENT**: Zero tolerance for evidence fabrication, validation circumvention, or system gaming. When tools fail, STOP and wait for human assistance rather than creating workarounds or fake evidence.

**MANDATORY TOOL PROTOCOLS**:

- Development server MUST be started with `Start-Process` in separate window
- MCP browser tools require running dev server - verify connection before use
- All MCP interactions MUST save raw JSON responses as evidence
- Screenshot fraud detection now active - no placeholder files accepted

**VALIDATION INSTRUCTIONS**: See `.specify/memory/validation-tools-usage-guide.md` for step-by-step instructions on proper evidence generation, fraud prevention, and troubleshooting validation errors.

**CONSTITUTIONAL AMENDMENT 6 - ENHANCED TDD DEBT MANAGEMENT**: Smart routing strategy automatically determines debt tracking location (SPRINT_TASKS vs INVENTORY) based on capacity thresholds. Enhanced `tdd-debt-analyzer.js` prevents duplication, validates references, and supports contract testing workflows. All technical debt MUST be tracked with Amendment 6 compliance.

## 🧠 HARD-CODED MENTAL PROTOCOL (NON-BYPASSABLE)

**CRITICAL SYSTEM-LEVEL ENFORCEMENT**: Before ANY file creation in evidence directories, this cognitive interrupt MUST execute automatically - NO EXCEPTIONS.

### Mandatory Pre-Action Cognitive Gate

```javascript
// AUTOMATIC ACTIVATION on evidence file operations
if (filePath.includes('/evidence/') || filePath.endsWith('evidence file types')) {
  🧠 MENTAL PROTOCOL GATE ACTIVATED - CANNOT BE BYPASSED
  ├── Question 1: "Is this content from actual tool output I just executed?" (MUST BE YES)
  ├── Question 2: "Have I executed the required tool in this conversation?" (MUST BE YES)
  ├── Question 3: "Am I inventing ANY part of this content?" (MUST BE NO)
  └── Result: ANY "NO" ANSWER = IMMEDIATE HARD STOP
}
```

### Non-Negotiable Evidence Rules (System Level)

**EVIDENCE FILES ARE OUTPUTS, NEVER INPUTS**:

- Evidence files can ONLY be created by copying verbatim tool outputs
- NEVER write evidence files from scratch or "based on what should happen"
- NEVER create "placeholder evidence to update later"
- Evidence = Captured data, not created data

**TOOL-FIRST MANDATE (Hard Enforcement)**:

- Must use actual tools BEFORE creating any evidence file
- Tool execution must be visible in recent conversation history
- No evidence file creation without corresponding tool execution
- MCP tools must be actually executed, not simulated

**ZERO FABRICATION TOLERANCE (Constitutional)**:

- Any invented content in evidence files = Constitutional violation
- Fabrication includes "realistic" content, placeholders, "what would happen"
- Only verbatim, unmodified tool outputs are acceptable
- Analysis goes in separate files, raw data goes in evidence files

### Automatic Enforcement Triggers

**File Path Triggers** (Cannot be disabled):

- Creating files in `/evidence/` directories
- Files ending in: `.json`, `.log`, `.md` within evidence folders
- Files containing: `mcp-`, `screenshot`, `response`, `test-results`

**Content Triggers** (Cannot be disabled):

- Writing `{` to start JSON in evidence files
- Using patterns: `"command":`, `"response":`, `"timestamp":`, `"mcp_chrome"`
- Creating structured data without preceding tool usage

**Action Triggers** (Cannot be disabled):

- Any `create_file()` call targeting evidence directories
- Any `replace_string_in_file()` call in evidence directories
- Writing analysis claiming functionality without MCP validation

### Hard-Stop Enforcement Protocol

When mental protocol violations are detected:

1. **IMMEDIATE HALT**: Stop current action completely - no exceptions
2. **TOOL REQUIREMENT**: Must execute actual tools to generate required evidence
3. **VERIFICATION**: Must confirm tool outputs are authentic before file creation
4. **COMPLIANCE**: Only proceed with 100% authentic tool outputs

**VIOLATION CONSEQUENCE**: Constitutional non-compliance, task failure, development halt until fixed.

### System Integration Points

This mental protocol is enforced through:

- **Pre-action evidence enforcer**: Blocks file operations before they happen
- **Constitutional validation**: Validates evidence authenticity post-creation
- **Tool execution hooks**: Requires actual tool usage before evidence creation
- **Conversation context**: Mental protocol rules always present and active

**THIS PROTOCOL CANNOT BE BYPASSED, OVERRIDDEN, OR IGNORED**

## Recent Changes

- 006-quotes-technical-debt: Added comprehensive quotes system restoration with constitutional compliance requirements, evidence-first development, and anti-hallucination protocols (September 28, 2025)
- 005-sprint-004-1: Added TypeScript 5.1+, Node.js 18+ + Next.js 15 App Router, React 18, Zod validation, TanStack Query

- 004-sprint-4-quotes: Added TypeScript 5.1+ with Next.js 15 App Router, React 18 + TanStack Query v5, TanStack Virtual v3, Tailwind CSS 3.4, Headless UI, Zod validation
- 003-sprint-3-1-documents: Added TypeScript 5.1+ (strict mode) + Next.js 15 App Router, React 18, Tailwind CSS 3.4, TanStack Query, TanStack Virtual, Zod

<!-- MANUAL ADDITIONS START -->

## Quotes Technical Debt - Constitutional Requirements

**CRITICAL**: All quote system work MUST follow constitutional development principles:

### Anti-Hallucination Protocol

```typescript
// ❌ FORBIDDEN - Console.log placeholders:
const handleEdit = () => console.log("Edit:", id);

// ✅ REQUIRED - Actual business logic:
const handleEdit = async () => {
  try {
    setLoading(true);
    await onEdit(quote.id);
    toast.success("Quote opened for editing");
  } catch (error) {
    toast.error("Failed to open quote");
  } finally {
    setLoading(false);
  }
};
```

### Evidence-First Development

- All components MUST achieve LEVEL 4+ constitutional status
- Progress claims MUST be validated with `node .specify/tools/constitutional-checker.js`
- UI functionality MUST be verified with MCP browser testing
- Test coverage MUST be ≥90% with passing tests

### Quote System Patterns

- **Progressive Loading**: Skeleton states for 1,000+ quotes
- **Export System**: PDF individual, Excel bulk (not both formats for both)
- **Bulk Operations**: Simple progress bar with cancel option
- **Performance**: 100ms response times maintained
- **Accessibility**: WCAG 2.1 AA compliance required

See `specs/006-quotes-technical-debt/quickstart.md` for detailed implementation patterns.

### Mandatory Task Progress Tracking

**CONSTITUTIONAL MANDATE 7**: During development sprints, task progress MUST be updated immediately after each task completion:

- Update `specs/006-quotes-technical-debt/tasks.md` with [x] marking
- Document completion timestamp and validation evidence
- Record any constitutional compliance issues encountered
- Include links to actual artifacts (files, tests, commits) created
- NEVER proceed to next task without updating current task status

This prevents development hallucination and ensures accurate sprint progress tracking.

### Constitutional Enforcement Integration

**CRITICAL**: All development work is now protected by Constitutional Amendments 1-3:

1. **Pre-Task Gate**: `node .specify/tools/pre-task-check.js [taskId]` - Validates prerequisites
2. **Implementation Work**: Normal development with constitutional principles
3. **Post-Task Gate**: `node .specify/tools/post-task-validation.js [taskId]` - 3-gate validation
4. **MCP Evidence**: Browser testing evidence required in `evidence/[taskId]/`
5. **Constitutional Audit**: Regular compliance audits prevent violations

**Development HALTS** when constitutional compliance falls below 80%. This prevents the hallucination crisis that led to 33 tasks being falsely marked complete without any real validation.

**Evidence Requirements**:

- Screenshots of working UI functionality
- MCP browser interaction logs
- Functional test results with user workflows
- Error handling validation
- Performance impact documentation

**NO UI FUNCTIONALITY CLAIMS** are accepted without corresponding MCP browser testing evidence.\n\n### Enhanced Constitutional Tools (September 29, 2025)\n\n**TDD Debt Analyzer Enhancements**:\n- Smart routing strategy: `determineDebtTrackingStrategy()` \n- Capacity thresholds: SPRINT_TASKS (≤6 items, ≤4 critical+high) vs INVENTORY\n- Duplication prevention: Advanced tracking ensures single-location debt\n- Contract testing support: Specialized handling for business logic identification tasks\n\n**Evidence Validation Improvements**:\n- Reference validation: `validateDebtReferences()` validates sprint task and inventory correlation\n- Amendment 6 compliance: Technical debt tracking with constitutional enforcement\n- Contract testing protocol: Successful issue identification = PASS functional tests\n- Two-file evidence system: Agent analysis + raw MCP responses for anti-fraud

<!-- MANUAL ADDITIONS END -->
