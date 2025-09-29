# snowva Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-09-29

## Active Technologies

- TypeScript 5.1+, Node.js 18+
- Next.js 15 App Router, React 18
- Tailwind CSS 3.4, Headless UI
- TanStack Query v5, TanStack Virtual v3
- Zod validation
- Mock data (transitioning to Firebase/API service layer)

## Project Structure

```
packages/
  web/
    src/
      app/
      components/
      services/
      types/
      validation/
    __tests__/
```

## Commands

```bash
# Development
cd packages/web && npm run dev

# Testing  
cd packages/web && npm test

# Linting
cd packages/web && npm run lint
```

## Code Style

- TypeScript strict mode enabled
- Component-First development approach
- Test-Driven Development (TDD)
- Zero compilation errors policy
- Comprehensive test coverage required

## Development Workflow

1. Write tests first (TDD approach)
2. Implement functionality to pass tests
3. Ensure zero TypeScript/linting errors
4. Commit changes with descriptive messages

## Testing Strategy

- Unit tests: 70% (business logic, utilities)
- Integration tests: 20% (component interactions)
- End-to-end tests: 10% (critical user paths)

## Performance Requirements

- API response times < 100ms
- Progressive loading for large datasets
- Accessibility compliance (WCAG 2.1 AA)

---

*Simple, focused guidelines for quality development.*