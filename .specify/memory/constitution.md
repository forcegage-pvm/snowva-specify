<!--
Sync Impact Report - Constitution v1.0.0
- Version change: Template → 1.0.0 (initial ratification)
- Modified principles: All principles defined from template
- Added sections: Core Principles (5), Development Standards, Quality Gates, Governance
- Removed sections: None (all template sections populated)
- Templates requiring updates:
  ✅ plan-template.md updated (constitution check gates defined)
  ✅ spec-template.md compatible (no changes needed)
  ✅ tasks-template.md compatible (already supports TDD)
  ✅ .github/copilot-instructions.md updated (constitutional reference added)
- Follow-up TODOs: None - all placeholders filled
-->

# Snowva Business Management System Constitution

## Core Principles

### I. Component-First Development

Every UI feature MUST be built as reusable, composable components following Tailwind CSS design patterns. Components MUST be self-contained with clear props interfaces, independent of business logic, and documented with Storybook examples. No direct styling outside of Tailwind utility classes. Component variants MUST use consistent naming conventions (size: sm/md/lg, variant: primary/secondary/outline) and support theming through CSS custom properties.

### II. Test-First Development (NON-NEGOTIABLE)

TDD mandatory for all business logic: Unit tests written → Tests fail → Implementation → Tests pass. MUST follow Test Pyramid Strategy: 70% Unit Tests (hooks, validation, state management), 20% Integration Tests (API mocking, component integration), 10% E2E Tests (critical user journeys). No PR merges without test coverage ≥90% for new code. All state management hooks MUST have unit tests covering edge cases, debouncing, and error scenarios. Validation schemas MUST be tested with property-based testing using invalid inputs. Mock data MUST reflect real business scenarios from extracted PDF documents.

### III. Business Data Integrity

Financial calculations (VAT, totals, balances) MUST be validated at multiple layers: client-side validation, API validation, and database constraints. All monetary values MUST use precise decimal arithmetic (never floating point). Audit trails REQUIRED for all financial operations (invoice finalization, payment allocation). State mutations MUST be immutable with clear before/after states logged.

### IV. Design System Consistency

All UI MUST follow the established Tailwind CSS design tokens for colors, spacing, typography, and shadows. Custom components MUST extend base utility classes, never override them. Theme support REQUIRED through CSS custom properties with light/dark mode compatibility. Responsive design MANDATORY with mobile-first approach using Tailwind breakpoints (sm/md/lg/xl). Design patterns MUST be documented and consistent across features.

### V. Performance and Accessibility First

Page load times MUST be <3s, navigation <500ms. Implement Next.js optimization features: Image optimization, dynamic imports, and static generation where applicable. All interactive elements MUST meet WCAG 2.1 AA standards with proper ARIA labels, keyboard navigation, and screen reader support. Bundle size monitoring REQUIRED with alerts for significant increases. Lighthouse score ≥90 for Performance, Accessibility, and Best Practices.

## Development Standards

### Technology Stack Requirements

- Next.js 14+ with App Router for file-based routing and API routes
- TypeScript 5.0+ with strict mode enabled, no `any` types in production code
- Tailwind CSS 3.4+ with custom design tokens for Snowva branding
- React 18+ with concurrent features, strict mode, and React DevTools
- Firebase SDK for authentication, Firestore database, and hosting (when implemented)
- Testing stack: Jest + React Testing Library + Cypress for comprehensive coverage

### Code Quality Standards

- ESLint + Prettier configuration enforced in CI/CD pipeline
- Husky pre-commit hooks for linting, type checking, and test execution
- Conventional Commits for clear change history and automated versioning
- No console.log statements in production builds (use proper logging)
- TypeScript strict mode with no implicit any, unused variables, or unreachable code

### Security Requirements

- Input validation using Zod schemas on both client and server
- XSS prevention through proper data sanitization and CSP headers
- Authentication state management with secure token storage
- API rate limiting and request validation for all endpoints
- Audit logging for all financial operations with user attribution

## Quality Gates

### Pre-Development Gates

- Feature specification MUST be complete with clear acceptance criteria
- UI/UX mockups MUST be approved following design system guidelines
- API contracts MUST be defined with request/response schemas
- Test scenarios MUST be documented with expected outcomes

### Development Gates

- Unit tests MUST pass with ≥90% coverage for new code, including all state management hooks and validation logic
- Integration tests MUST validate complete user workflows with proper API mocking and service layer verification
- Property-based testing REQUIRED for validation schemas with comprehensive edge case coverage
- Console error monitoring in tests - no unexpected console.error calls allowed
- TypeScript compilation MUST succeed with zero errors
- ESLint MUST pass with zero warnings in production builds
- Component documentation MUST be updated in Storybook

### Release Gates

- E2E tests MUST pass against production-like environment
- Performance budgets MUST be met (Lighthouse scores ≥90)
- Accessibility audits MUST pass WCAG 2.1 AA compliance
- Security scanning MUST show no high/critical vulnerabilities
- Manual testing MUST be completed for business-critical flows

## Governance

Constitution supersedes all other development practices and coding standards. All code reviews MUST verify constitutional compliance, particularly for component design, testing coverage, and business data handling. Complexity deviations MUST be documented with explicit justification and simpler alternatives considered.

Amendment procedure: Changes require team consensus, impact analysis on existing code, and migration plan for breaking changes. Emergency amendments allowed for security or data integrity issues with retroactive documentation required.

Compliance review occurs at each feature milestone with constitutional adherence scored and tracked. Use `.github/copilot-instructions.md` for runtime development guidance and current project context.

**Version**: 1.0.0 | **Ratified**: 2025-09-23 | **Last Amended**: 2025-09-23
