# Snowva Documentation Index

This directory contains all project documentation organized by purpose and audience.

## 📁 Directory Structure

### `/component-status/` - Component Status Reports
Individual constitutional status reports for all components using LEVEL 0-5 framework:
- `README.md` - Status level definitions and current component overview
- `QuoteActionsMenu-status.md` - LEVEL 2 (Interactive, needs business logic)  
- `QuoteTable-status.md` - LEVEL 3 (Integrated, some functionality working)
- `QuoteStatusBadge-status.md` - LEVEL 5 (Production ready)

### `/feature-analysis/` - Feature-Specific Analysis
Comprehensive analysis of features against specifications:
- `quotes/gap-analysis.md` - FR mapping and user journey analysis  
- `quotes/implementation-roadmap.md` - 12 specific implementation tasks

### `/technical-debt/` - Technical Debt Management
- `register.md` - Active technical debt register with resolution plans
- `quotes-analysis.md` - Comprehensive quotes feature technical debt analysis

### `/testing/` - Testing Documentation
- `manual-testing-results.md` - Manual test execution results

### `/visual-regression/` - Visual Testing
- `baseline-checklist.md` - Visual regression testing baselines

### `/api/` - API Documentation  
- `README.md` - API documentation overview
- `openapi.yaml` - OpenAPI specification

### `/system-current/` - Current System Documentation
- Various `.txt` files with current system data samples
- `ui-performance/` - Performance analysis results

## 📋 Core Documentation Files

### Project Overview
- `development-roadmap.md` - High-level project roadmap with constitutional framework
- `development-constitution.md` - Development governance and evidence requirements
- `development-process.md` - Development workflow and processes

### Technical Documentation  
- `api.md` - API documentation summary
- `components.md` - Component architecture documentation
- `real-data-integration.md` - Real data integration guidelines

### Quality Assurance
- `visual-regression-testing.md` - Visual regression testing strategy
- `T032-validation-results.md` - Validation test results

## 🎯 Documentation Standards

### Constitutional Requirements
All documentation MUST:
1. **Evidence-Based**: Claims supported by demonstrable proof
2. **Status Accurate**: Use LEVEL 0-5 completion framework accurately  
3. **Validation Required**: Pass constitutional-checker validation where applicable
4. **Regular Updates**: Keep current with actual implementation state

### Organization Principles  
1. **Audience-Focused**: Organize by who needs the information
2. **Purpose-Driven**: Group by documentation purpose (status, analysis, reference)
3. **Discoverable**: Clear naming and comprehensive indexing
4. **Maintainable**: Avoid duplication, single source of truth

## 🚀 Getting Started

### For Developers
1. Review `development-constitution.md` for governance framework
2. Check component status in `/component-status/` for current state
3. Use feature analysis in `/feature-analysis/` for implementation guidance

### For Project Managers
1. Start with `development-roadmap.md` for high-level overview
2. Review technical debt in `/technical-debt/` for risk assessment  
3. Check testing results in `/testing/` for quality metrics

### For QA Engineers
1. Review `/testing/` for testing strategies and results
2. Use `/visual-regression/` for visual testing guidelines
3. Reference `/component-status/` for testable functionality

---

**Last Updated**: September 28, 2025  
**Maintained By**: Development Team  
**Review Frequency**: End of each sprint