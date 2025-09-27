# Snowva Operations Console – Development Roadmap

_Last updated: 2025-09-27_

## 1. Product Vision & Current Status

### Vision
Deliver a un**Estimated Duration**: 3-5 days  
**Impact**: Improved stability, better developer experience, reduced future debugging

---

### 📋 Sprint 004.2 – Complete Quotes Index Workspace (PLANNED)
**Sprint Goal**: Complete the remaining unfinished tasks from Sprint 004 to deliver a fully functional quotes workspace.

#### Remaining Core Components
- [ ] **T041**: Create QuoteStatusBadge component with workflow states
- [ ] **T042**: Develop QuoteActionsMenu (edit, duplicate, convert, archive)
- [ ] **T043**: Build QuickPreviewCard for quote summary

#### Remaining API Integration
- [ ] **T045**: Add pagination and search functionality to quotes listing
- [ ] **T047**: Add bulk operations support (status updates, exports)
- [ ] **T048**: Implement quote archiving and restoration

#### UX Polish & Missing Features
- [ ] **T049**: Add empty states and loading skeletons
- [ ] **T050**: Implement quote duplicate functionality
- [ ] **T051**: Add export to PDF/Excel functionality
- [ ] **T053**: Accessibility testing and WCAG compliance

#### Testing & Validation
- [ ] **T055**: E2E testing with Cypress specs
- [ ] **T056**: Performance testing with large quote datasets

**Estimated Duration**: 1-1.5 weeks  
**Priority**: High - needed to complete quotes workspace before moving to invoices  
**Dependencies**: Should be done after Sprint 004.1 (technical debt resolution)

---

### 📋 Sprint 005 – Invoices Index Workspace (PLANNED)console for Snowva's finance, sales, and operations teams to manage customers, pricing, quotes, invoices, statements, and payments.

### Current Status ✅
- [x] **Core Foundation**: Next.js 15 App Router, TypeScript 5.1+, Tailwind CSS 3.4
- [x] **Dashboard Layout**: Navigation, KPIs, shortcuts, branch spotlight panels
- [x] **Existing Workspaces**: Customer branches, invoice lifecycle, payment allocation, seasonal pricing, quote composer, finance statements
- [x] **Documents Workspace**: Complete implementation with API layer, performance optimization, accessibility compliance
- [x] **E2E Testing Framework**: Cypress specs for major workspace behaviors

### Next Phase Goals
Convert remaining mocked experiences into production-ready applications with resilient API layers, complete UI coverage, and automated quality gates.

---

## 2. Development Workstreams

| Workstream | Purpose | Success Criteria |
| --- | --- | --- |
| **UI Completion** | Replace placeholder pages with spec-compliant React screens | All navigation links land on functional pages with test IDs |
| **API Consolidation** | Serve deterministic fixtures via `/api/v1/*` routes | Pages consume shared services; error states demonstrated |
| **Quality Automation** | Ensure lint, type-check, and Cypress run in CI | GitHub Actions fail builds on regression |
| **Design System** | Normalize layout primitives and theme tokens | Shared components documented in Storybook |
| **Data Integration** | Replace mocks with production APIs/Firebase | Feature toggles allow staged rollout |

---

## 3. Sprint Planning & Execution

### ✅ Sprint 003 – Documents Workspace (COMPLETED)
**Sprint Goal**: Implement production-ready documents workspace with advanced filtering, virtualization, and API integration.

#### Phase 1: Foundation ✅
- [x] T001: Technical architecture planning and component design
- [x] T002: TypeScript interfaces and data model definitions  
- [x] T003: Project structure setup and dependency integration
- [x] T004: Development environment configuration
- [x] T005: Performance requirements and accessibility planning

#### Phase 2: UI/API Contracts ✅
- [x] T006: DocumentExportsTable component interface design
- [x] T007: DocumentFiltersBar component specification
- [x] T008: DocumentPreviewModal component architecture
- [x] T009: API endpoint contracts and data flow design
- [x] T010: State management architecture with TanStack Query

#### Phase 3: Core Implementation ✅
- [x] T011: DocumentExportsTable with virtualization
- [x] T012: DocumentFiltersBar with advanced filtering
- [x] T013: DocumentPreviewModal with share functionality
- [x] T014: PublicLinkWarning security component
- [x] T015: API routes implementation

#### Phase 4: Integration & Wiring ✅
- [x] T016: Component integration and data flow
- [x] T017: Error handling and loading states
- [x] T018: Performance optimization and monitoring
- [x] T019: Navigation integration in dashboard
- [x] T020: End-to-end workflow testing

#### Phase 5: Polish & Validation ✅
- [x] T021: Accessibility compliance (WCAG 2.1 AA)
- [x] T022: Comprehensive Storybook stories (38 stories)
- [x] T023: Performance testing and optimization
- [x] T024: Code review and quality assurance
- [x] T025: Documentation and deployment preparation

**Sprint Results**: Complete documents workspace with TanStack Virtual performance, REST API, accessibility compliance, and comprehensive testing.

---

### 🟡 Sprint 004 – Quotes Index Workspace (PARTIALLY COMPLETED)
**Sprint Goal**: Implement quotes listing page with filtering, status management, and integration with existing quote composer.

#### Phase 1: Foundation & Planning ✅
- [x] **T034**: Analyze existing quote composer integration points
- [x] **T035**: Design QuotesTable component architecture with virtualization
- [x] **T036**: Define quote status workflow and filtering requirements
- [x] **T037**: Plan API endpoints for quotes listing and management
- [x] **T038**: TypeScript interfaces for quote data models

#### Phase 2: Core Components 🟡
- [x] **T039**: Implement QuotesTable with sorting and selection
- [x] **T040**: Build QuoteFiltersBar (status, date range, customer, amount)
- [ ] **T041**: Create QuoteStatusBadge component with workflow states
- [ ] **T042**: Develop QuoteActionsMenu (edit, duplicate, convert, archive)
- [ ] **T043**: Build QuickPreviewCard for quote summary

#### Phase 3: API Integration 🟡
- [x] **T044**: Implement `/api/v1/quotes` REST endpoints (partial - bootstrap & draft only)
- [ ] **T045**: Add pagination and search functionality
- [x] **T046**: Integrate with existing quote composer navigation
- [ ] **T047**: Add bulk operations support (status updates, exports)
- [ ] **T048**: Implement quote archiving and restoration

#### Phase 4: UX Polish & Testing ❌
- [ ] **T049**: Add empty states and loading skeletons
- [ ] **T050**: Implement quote duplicate functionality
- [ ] **T051**: Add export to PDF/Excel functionality
- [x] **T052**: Create Storybook stories for all quote components
- [ ] **T053**: Accessibility testing and WCAG compliance

#### Phase 5: Integration & Validation 🟡
- [x] **T054**: Navigation integration in dashboard layout
- [ ] **T055**: E2E testing with Cypress specs
- [ ] **T056**: Performance testing with large quote datasets
- [x] **T057**: Integration testing with quote composer
- [x] **T058**: Documentation and code review

**Sprint Results**: **Partial completion** - Fixed 5 critical functionality issues (quick filters, search clearing, clear filters button, refresh button, New Quote navigation) and created basic quote composer integration. **Many planned features remain unimplemented** including table virtualization, status badges, actions menu, bulk operations, export functionality, and comprehensive testing.

#### Technical Debt Identified 🔧
- **Quote Timeline API**: Timeline endpoint returns 404 - needs implementation for quote history tracking
- **Quote Conversion API**: Convert endpoint has async parameter issue - needs `await params` fix for Next.js 15 compatibility
- **Error Handling**: Some API endpoints need more robust error handling and validation
- **Type Safety**: DraftQuoteResponse type needed updates during development - indicates need for stronger API contract validation
- **Performance**: Quote composer triggers Fast Refresh full reloads - investigate React state optimization
- **Testing Coverage**: E2E tests for quote composer workflow need expansion

#### Sprint 004 Lessons Learned 📚
- **Scope Creep**: Initially focused on fixing 5 critical bugs, but sprint plan was overly ambitious with 25 tasks
- **Time Management**: Spent majority of time on bug fixes and basic integration, leaving advanced features unimplemented
- **Planning Gap**: Need better distinction between "fix existing functionality" vs "build new features" in sprint goals
- **API Development**: Creating robust API endpoints takes longer than estimated, especially with proper error handling
- **Testing Overhead**: Comprehensive testing (Storybook, E2E, accessibility) requires dedicated time allocation
- **Component Complexity**: Table virtualization, status badges, and action menus are significant undertakings requiring focused sprints

---

### � Sprint 004.1 – Technical Debt Resolution (RECOMMENDED)
**Sprint Goal**: Address technical debt identified during Sprint 004 to ensure stable foundation for future development.

#### High Priority Issues
- [ ] **TD001**: Fix quote timeline API endpoint (`/api/v1/quotes/[quoteId]/timeline`)
- [ ] **TD002**: Fix quote conversion API async parameter handling (`await params`)
- [ ] **TD003**: Enhance error handling across all quote API endpoints
- [ ] **TD004**: Implement comprehensive API contract validation with Zod schemas

#### Medium Priority Issues  
- [ ] **TD005**: Optimize React state management to prevent Fast Refresh full reloads
- [ ] **TD006**: Expand E2E test coverage for complete quote composer workflows
- [ ] **TD007**: Add proper loading states and error boundaries
- [ ] **TD008**: Implement quote preview and PDF generation endpoints

#### Code Quality Improvements
- [ ] **TD009**: Standardize API response types across all quote endpoints  
- [ ] **TD010**: Add comprehensive unit tests for quote service layer
- [ ] **TD011**: Implement proper TypeScript strict mode compliance
- [ ] **TD012**: Add API documentation with OpenAPI specs

**Estimated Duration**: 3-5 days  
**Impact**: Improved stability, better developer experience, reduced future debugging

---

### �📋 Sprint 005 – Invoices Index Workspace (PLANNED)
**Sprint Goal**: Build invoices listing with timeline view, bulk operations, and integration with existing invoice detail pages.

#### Phase 1: Foundation
- [ ] **T059**: Analyze existing invoice detail page integration
- [ ] **T060**: Design InvoicesTable with timeline and list views
- [ ] **T061**: Plan invoice status workflow and bulk operations
- [ ] **T062**: Define filtering and search requirements
- [ ] **T063**: TypeScript interfaces for invoice data models

#### Phase 2: Core Components
- [ ] **T064**: Implement InvoicesTable with dual view modes
- [ ] **T065**: Build InvoiceFiltersBar (status, date, customer, amount)
- [ ] **T066**: Create InvoiceTimelineView component
- [ ] **T067**: Develop InvoiceBulkActions (status updates, exports)
- [ ] **T068**: Build InvoiceStatusBadge with workflow states

#### Phase 3: Advanced Features
- [ ] **T069**: Implement payment status integration
- [ ] **T070**: Add aging analysis and overdue highlighting  
- [ ] **T071**: Build invoice batch processing
- [ ] **T072**: Create invoice reminders functionality
- [ ] **T073**: Add invoice-to-statement linking

#### Phase 4: API & Integration
- [ ] **T074**: Implement `/api/v1/invoices` REST endpoints
- [ ] **T075**: Integrate with existing payment allocation
- [ ] **T076**: Add invoice generation from quotes
- [ ] **T077**: Implement invoice PDF generation and email
- [ ] **T078**: Navigation and routing integration

#### Phase 5: Testing & Polish
- [ ] **T079**: Comprehensive Storybook stories
- [ ] **T080**: E2E testing and Cypress specs
- [ ] **T081**: Performance optimization for large datasets
- [ ] **T082**: Accessibility compliance validation
- [ ] **T083**: Documentation and deployment

---

### 📋 Sprint 006 – Payments Index Workspace (PLANNED)  
**Sprint Goal**: Create payments overview with allocation tracking and integration with existing payment detail views.

#### Phase 1: Foundation
- [ ] **T084**: Analyze payment allocation integration points
- [ ] **T085**: Design PaymentsTable with allocation status
- [ ] **T086**: Plan payment matching and allocation workflow
- [ ] **T087**: Define filtering by allocation status and methods
- [ ] **T088**: TypeScript interfaces for payment data models

#### Phase 2: Core Components
- [ ] **T089**: Implement PaymentsTable with allocation indicators
- [ ] **T090**: Build PaymentFiltersBar (method, status, date, amount)
- [ ] **T091**: Create PaymentAllocationBadge component
- [ ] **T092**: Develop UnallocatedPaymentsAlert component
- [ ] **T093**: Build PaymentMatchingSuggestions

#### Phase 3: Allocation Features
- [ ] **T094**: Implement payment matching algorithms
- [ ] **T095**: Add bulk allocation functionality
- [ ] **T096**: Create allocation history tracking
- [ ] **T097**: Build payment reconciliation tools
- [ ] **T098**: Add payment method analysis

#### Phase 4: API & Integration
- [ ] **T099**: Implement `/api/v1/payments` REST endpoints
- [ ] **T100**: Integrate with existing allocation detail views
- [ ] **T101**: Add payment import/export functionality
- [ ] **T102**: Implement bank reconciliation features
- [ ] **T103**: Navigation and routing integration

#### Phase 5: Testing & Polish
- [ ] **T104**: Comprehensive Storybook stories
- [ ] **T105**: E2E testing and Cypress specs
- [ ] **T106**: Performance optimization and virtualization
- [ ] **T107**: Accessibility compliance validation
- [ ] **T108**: Documentation and deployment

---

## 4. Design System & Shared Components

### Sprint 007 – Component Library Hardening (PLANNED)
- [ ] **T109**: Extract shared table components (`DataTable`, `FilterBar`)
- [ ] **T110**: Create unified modal system (`Modal`, `Dialog`, `Drawer`)
- [ ] **T111**: Build status badge system with consistent styling
- [ ] **T112**: Implement loading skeleton components
- [ ] **T113**: Create error boundary and error state components
- [ ] **T114**: Build toast notification system
- [ ] **T115**: Design consistent form components
- [ ] **T116**: Create accessibility testing utilities
- [ ] **T117**: Build Storybook design token documentation
- [ ] **T118**: Implement responsive layout utilities

---

## 5. Quality & Testing Infrastructure

### Automated Testing Checklist
- [ ] **Jest Unit Tests**: Component logic and utility functions
- [ ] **React Testing Library**: Component integration tests
- [ ] **Storybook Stories**: Visual component documentation
- [ ] **Cypress E2E**: Complete user workflows
- [ ] **Accessibility Testing**: axe-core validation
- [ ] **Performance Testing**: Large dataset handling
- [ ] **API Contract Testing**: Mock/real API alignment

### CI/CD Pipeline Checklist
- [ ] **GitHub Actions Setup**: Automated testing on PR
- [ ] **Lint & Type Check**: ESLint and TypeScript validation
- [ ] **Test Coverage**: Maintain >80% coverage
- [ ] **Visual Regression**: Chromatic integration
- [ ] **Performance Monitoring**: Bundle size and runtime metrics
- [ ] **Accessibility Gates**: Automated axe-core checks
- [ ] **Deploy Preview**: Vercel/Netlify integration

---

## 6. Implementation Guidelines

### Development Standards
- **TypeScript**: Strict mode, comprehensive error handling
- **Performance**: TanStack Virtual for 1000+ records, React.memo optimization
- **Accessibility**: WCAG 2.1 AA compliance, keyboard navigation
- **Testing**: Component stories, integration tests, E2E workflows
- **API Design**: REST endpoints, pagination, filtering, error states
- **Documentation**: Component props, usage examples, API contracts

### Sprint Success Criteria
1. **All tasks completed** and marked with ✅
2. **Navigation integration** in dashboard layout
3. **Storybook stories** for all components (minimum 10 per sprint)
4. **API endpoints** with comprehensive CRUD operations
5. **Accessibility compliance** with axe-core validation
6. **Performance benchmarks** met (TanStack Virtual for large datasets)
7. **Documentation** complete for operators and developers

---

## 7. Delivery Timeline

| Sprint | Duration | Deliverable | Status |
|--------|----------|-------------|--------|
| **003** | 2 weeks | Documents Workspace | ✅ Complete |
| **004** | 2 weeks | Quotes Index | 🟡 Partial |
| **004.1** | 3-5 days | Technical Debt Resolution | 🔧 Recommended |
| **004.2** | 1-1.5 weeks | Complete Quotes Index | 📋 Planned |
| **005** | 2 weeks | Invoices Index | 📋 Planned |
| **006** | 2 weeks | Payments Index | 📋 Planned |
| **007** | 1.5 weeks | Design System | 📋 Planned |
| **008** | 1 week | CI/CD & Testing | 📋 Planned |

**Target Completion**: 10 weeks from Sprint 004.1 start

---

## 8. Risk Management

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| **API Contract Changes** | High | Medium | Shared TypeScript types, contract tests |
| **Performance Issues** | High | Low | Early virtualization, performance testing |
| **Accessibility Gaps** | Medium | Medium | Automated axe-core testing, keyboard navigation |
| **Design Inconsistency** | Medium | Medium | Shared component library, design tokens |
| **Testing Flakiness** | Medium | High | Deterministic fixtures, stable selectors |

---

## 9. References & Resources

- **System Documentation**: [`docs/system-current/`](./system-current/)
- **E2E Test Specs**: `packages/web/tests/e2e/`
- **Component Catalog**: Storybook at `http://localhost:6006`
- **Sprint Implementation**: `.github/copilot-instructions.md`
- **API Documentation**: Generated from OpenAPI specs
- **Accessibility Guidelines**: [WCAG 2.1 AA Standards](https://www.w3.org/WAI/WCAG21/quickref/)

---

*This roadmap is updated at the end of each sprint. Use checkboxes to track progress and maintain sprint momentum.*