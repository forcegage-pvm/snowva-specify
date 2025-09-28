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

**CRITICAL**: IMMEDIATELY update tasks.md with [x] after completing each task - NO EXCEPTIONS. This prevents hallucination and ensures accurate progress tracking.

**CONSTITUTIONAL v1.1**: All component status reporting MUST use standardized completion levels (LEVEL 0-5). Claims of functionality MUST be supported by demonstrable evidence. Use completion level framework: 🔴 STUB → 🟡 COSMETIC → 🟠 INTERACTIVE → 🔵 INTEGRATED → 🟢 FUNCTIONAL → ✅ PRODUCTION.

**MANDATORY**: ALL component status reports MUST pass constitutional validation using: `node .specify/tools/constitutional-checker.js [status-file.md]`. Reports failing constitutional validation MUST be remediated. See `.specify/templates/component-status-template.md` for reporting format.

See .specify/memory/constitution.md and .specify/memory/testing-strategy.md for complete guidelines.

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

<!-- MANUAL ADDITIONS END -->
