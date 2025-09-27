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

See .specify/memory/constitution.md and .specify/memory/testing-strategy.md for complete guidelines.

## Recent Changes

- 005-sprint-004-1: Added TypeScript 5.1+, Node.js 18+ + Next.js 15 App Router, React 18, Zod validation, TanStack Query

- 004-sprint-4-quotes: Added TypeScript 5.1+ with Next.js 15 App Router, React 18 + TanStack Query v5, TanStack Virtual v3, Tailwind CSS 3.4, Headless UI, Zod validation
- 003-sprint-3-1-documents: Added TypeScript 5.1+ (strict mode) + Next.js 15 App Router, React 18, Tailwind CSS 3.4, TanStack Query, TanStack Virtual, Zod

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
