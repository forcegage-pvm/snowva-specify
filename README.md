# Snowva™ Business Management System

A comprehensive web-based business management system for Snowva™ Trading Pty Ltd, designed to manage the complete sales lifecycle for 150+ retail customers and individual consumers across South Africa.

## 🎯 Overview

Snowva™ Business Management System handles complex multi-branch customer relationships, dual pricing structures (retail vs consumer), quote-to-invoice workflow, payment processing with FIFO allocation, and consolidated statement generation. Built with modern web technologies following constitutional development principles.

## 📋 Features

### Customer Management

- Support for retail companies and individual consumers
- Multi-branch customer hierarchies (e.g., Sportsmans Warehouse with 30+ branches)
- Parent company relationships with separate branch billing
- VAT number management and payment terms tracking

### Product & Pricing

- 11 core product catalog (Snowva Ultimate Ice Maker, Makabrai, BraaiTas, etc.)
- Dual pricing structure: retail vs consumer (20-30% markup difference)
- Versioned pricelists with historical accuracy
- Customer-specific pricing overrides for retail customers

### Quote-to-Invoice Workflow

- Professional quote generation with current pricing
- Quote conversion to invoices preserving original pricing
- Sequential invoice numbering (YYMMDDXXX format)
- VAT calculations at 15% with proper breakdown

### Payment Processing

- FIFO (First In, First Out) payment allocation
- Partial payment handling across multiple invoices
- Real-time customer balance tracking
- Payment method recording and audit trails

### Statement Generation

- Consolidated statements for multi-branch customers
- 30-day payment terms with due date calculations
- Professional PDF generation with company branding
- Complete transaction history by branch

## 🏗️ Architecture

### Technology Stack

- **Frontend**: Next.js 14 with App Router, React 18, TypeScript 5.0+
- **Styling**: Tailwind CSS 3.4 with custom design system
- **Backend**: Next.js API routes with TypeScript
- **Database**: Mock data initially, Firebase Firestore (future)
- **Testing**: Jest, React Testing Library, Cypress
- **Documentation**: Storybook for components

### Project Structure

```
snowva/
├── backend/
│   ├── src/
│   │   ├── models/          # Data models with validation
│   │   ├── services/        # Business logic layer
│   │   ├── app/api/         # Next.js API routes
│   │   ├── middleware/      # Authentication, logging, etc.
│   │   ├── validation/      # Zod schemas
│   │   └── data/mock/       # Mock data for development
│   └── tests/
│       ├── contract/        # API contract tests
│       ├── integration/     # End-to-end workflow tests
│       └── unit/           # Unit tests
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── app/           # Next.js pages (App Router)
│   │   ├── services/      # API client services
│   │   └── stories/       # Storybook documentation
│   └── tests/
│       ├── components/    # Component tests
│       ├── accessibility/ # WCAG 2.1 AA compliance tests
│       └── performance/   # Performance benchmarks
├── docs/                  # Project documentation
└── specs/                 # Feature specifications
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- Git installed
- VS Code (recommended) with TypeScript extension
- Chrome/Firefox for testing

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd snowva
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start development server**

   ```bash
   npm run dev
   ```

5. **Open browser**
   ```
   http://localhost:3000
   ```

### Development Commands

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server

# Testing
npm test                # Run unit tests
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Generate coverage report
npm run test:e2e        # Run Cypress E2E tests

# Code Quality
npm run lint            # Run ESLint
npm run lint:fix        # Fix ESLint errors
npm run type-check      # TypeScript type checking

# Documentation
npm run storybook       # Start Storybook
npm run build-storybook # Build Storybook for deployment
```

## 📚 Documentation

- **[Feature Specification](./specs/001-core-features/spec.md)** - Complete business requirements
- **[Implementation Plan](./specs/001-core-features/plan.md)** - Technical architecture and decisions
- **[Tasks](./specs/001-core-features/tasks.md)** - Implementation task breakdown
- **[API Documentation](./docs/api.md)** - REST API endpoints and schemas
- **[Component Documentation](./docs/components.md)** - UI component library
- **[Quickstart Guide](./specs/001-core-features/quickstart.md)** - Development workflow

## 🧪 Testing Strategy

### Test-First Development (TDD)

All features follow strict TDD approach:

1. Write failing tests
2. Implement minimal code to pass
3. Refactor and optimize

### Testing Layers

- **Contract Tests**: Validate API endpoint contracts
- **Component Tests**: UI component behavior and props
- **Integration Tests**: Complete user workflows
- **Unit Tests**: Business logic and calculations
- **E2E Tests**: Critical business scenarios
- **Performance Tests**: <500ms response times
- **Accessibility Tests**: WCAG 2.1 AA compliance

## 🎨 Design System

### Constitutional Principles

1. **Component-First Development** - Reusable, composable components
2. **Test-First Development** - TDD mandatory, ≥90% coverage
3. **Business Data Integrity** - Multi-layer validation, audit trails
4. **Design System Consistency** - Tailwind CSS design tokens
5. **Performance & Accessibility** - <3s load, WCAG 2.1 AA

### Component Library

- Form components with validation
- Data tables with sorting/filtering
- Modal and overlay patterns
- Status badges and indicators
- Currency and amount displays
- Professional document layouts

## 💼 Business Context

### Real Data Integration

System specifications based on real business documents:

- 150+ customer records from actual invoices
- 11 product catalog with real pricing
- Multi-branch structures (40+ Outdoor Warehouse branches)
- Historical transaction patterns and workflows

### South African Compliance

- VAT calculations at 15%
- ZAR currency formatting
- Local business registration requirements
- Banking details integration (FNB)

## 🤝 Contributing

### Development Workflow

1. Create feature branch from `main`
2. Write tests first (TDD approach)
3. Implement features following constitutional principles
4. Ensure ≥90% test coverage
5. Run accessibility and performance audits
6. Submit pull request with test evidence

### Code Standards

- TypeScript strict mode, no `any` types
- ESLint + Prettier configuration
- Conventional Commits for clear history
- Constitutional compliance validation

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🏢 Company Information

**Snowva™ Trading Pty Ltd**  
Registration: 2010/007043/07  
VAT Number: 4100263500  
Address: 67 Wildevy Street, Lynnwood Manor, Pretoria

**Banking Details**  
First National Bank  
Branch Code: 250 655  
Account: 62264885082

---

Built with ❤️ for South African business excellence
