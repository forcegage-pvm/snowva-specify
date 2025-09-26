# Visual Regression Testing Process

## Overview
This document outlines the visual regression testing process for the documents workspace components using manual snapshot validation.

## Components Covered

### DocumentExportsTable
- **Stories:** 9 comprehensive variations including virtualization, search highlights, loading states
- **Key Visual Elements:** Table layout, status badges, sort indicators, virtualization scrolling
- **Critical Breakpoints:** Desktop (1920x1080), Tablet (768x1024), Mobile (390x844)

### DocumentFiltersBar  
- **Stories:** 9 filter state variations including search, multi-select filters, disabled states
- **Key Visual Elements:** Filter dropdowns, search input, clear buttons, responsive layout
- **Critical Breakpoints:** Desktop (1920x1080), Tablet (768x1024), Mobile (390x844)

### DocumentPreviewModal
- **Stories:** 12 modal state variations including different export types, loading states, error handling
- **Key Visual Elements:** Modal overlay, PDF preview area, metadata display, action buttons, tabs
- **Critical Breakpoints:** Desktop (1920x1080), Tablet (768x1024), Mobile (390x844)

### PublicLinkWarning
- **Stories:** 8 warning variations including compact mode, different expiration states
- **Key Visual Elements:** Warning icons, expiration countdown, action buttons, responsive text wrapping
- **Critical Breakpoints:** Desktop (1920x1080), Tablet (768x1024), Mobile (390x844)

## Manual Snapshot Process

### Prerequisites
1. Ensure Storybook is running: `npm run storybook`
2. Use consistent browser: Chrome 120+ with extensions disabled
3. Set viewport to standard breakpoints
4. Clear browser cache before testing

### Snapshot Procedure

#### 1. Baseline Creation (First Run)
```bash
# Navigate to each story at each breakpoint
# Take manual screenshots and store in docs/visual-regression/baselines/

mkdir -p docs/visual-regression/baselines/document-exports-table
mkdir -p docs/visual-regression/baselines/document-filters-bar  
mkdir -p docs/visual-regression/baselines/document-preview-modal
mkdir -p docs/visual-regression/baselines/public-link-warning
```

#### 2. Screenshot Naming Convention
```
{component-name}/{story-name}/{breakpoint}.png

Examples:
- document-exports-table/default/desktop-1920x1080.png
- document-exports-table/with-search-highlight/tablet-768x1024.png
- document-filters-bar/all-filters-active/mobile-390x844.png
- document-preview-modal/failed-export/desktop-1920x1080.png
- public-link-warning/compact-mode/mobile-390x844.png
```

#### 3. Critical Visual Elements Checklist

**DocumentExportsTable:**
- [ ] Table headers properly aligned
- [ ] Status badges display correctly with proper colors
- [ ] Sort indicators visible and properly positioned  
- [ ] Search highlighting works across all text
- [ ] Virtualization maintains proper row heights
- [ ] Loading states show spinners in correct positions
- [ ] Empty state illustration and text properly centered
- [ ] Responsive behavior on mobile (horizontal scroll, stack layout)

**DocumentFiltersBar:**
- [ ] Search input placeholder text visible
- [ ] Filter dropdowns open/close properly  
- [ ] Multi-select chips display correctly
- [ ] Clear buttons positioned and accessible
- [ ] Disabled state shows proper visual feedback
- [ ] Responsive collapse behavior on mobile
- [ ] Filter count badges accurate
- [ ] Accessibility focus indicators visible

**DocumentPreviewModal:**
- [ ] Modal centers properly on all screen sizes
- [ ] Close button accessible and positioned correctly
- [ ] PDF preview area shows proper loading states
- [ ] Metadata displays in organized layout
- [ ] Tab navigation works visually
- [ ] Action buttons properly spaced and accessible
- [ ] Share link banner integrates seamlessly
- [ ] Audit trail tab content readable
- [ ] Mobile responsive behavior (full screen, bottom sheet style)

**PublicLinkWarning:**
- [ ] Warning icon displays with proper color
- [ ] Expiration countdown formatting consistent
- [ ] Action button positioning and styling
- [ ] Compact mode reduces height appropriately  
- [ ] Link text wraps properly on narrow screens
- [ ] Warning border and background colors accessible
- [ ] Text contrast meets WCAG AA standards
- [ ] Responsive text sizing

### Review Process

#### 1. Story-by-Story Validation
For each component story:
1. Load story in Storybook
2. Test at all three breakpoints
3. Interact with all interactive elements
4. Capture screenshots of key states
5. Document any visual issues or inconsistencies

#### 2. Cross-Browser Testing (Optional)
- Primary: Chrome 120+
- Secondary: Firefox 121+, Safari 17+, Edge 120+
- Note: Focus on Chrome for baseline, document browser-specific issues

#### 3. Accessibility Visual Validation
- [ ] High contrast mode support
- [ ] Focus indicators clearly visible
- [ ] Color-blind friendly color schemes
- [ ] Text scaling up to 200% maintains layout
- [ ] Dark mode compatibility (if implemented)

## Issue Documentation

### Visual Bug Report Template
```markdown
## Visual Issue Report

**Component:** [Component Name]
**Story:** [Story Name]  
**Breakpoint:** [Desktop/Tablet/Mobile]
**Browser:** [Chrome Version]

**Expected Behavior:**
[Description of expected visual appearance]

**Actual Behavior:**  
[Description of actual visual appearance]

**Screenshot:** [Link to screenshot]

**Severity:** [Critical/High/Medium/Low]
- Critical: Completely broken layout, unusable
- High: Significant visual issues affecting usability  
- Medium: Minor layout issues, cosmetic problems
- Low: Very minor cosmetic inconsistencies

**Reproduction Steps:**
1. [Step 1]
2. [Step 2]
3. [Step 3]
```

### Approval Process
1. Developer takes baseline screenshots
2. Product owner reviews visual consistency
3. QA validates accessibility and responsiveness  
4. Baselines approved and stored in repository
5. Process repeated for future changes (regression testing)

## Integration with CI/CD

### Future Enhancement: Automated Visual Testing
When budget allows, consider integrating:
- **Chromatic:** Automated visual regression testing for Storybook
- **Percy:** Visual testing platform with PR integration
- **Playwright:** Automated screenshot comparison in CI pipeline

### Manual Process Integration
1. PR checklist includes visual regression validation
2. Screenshots attached to PR for review
3. Breaking visual changes require explicit approval
4. Baseline updates documented in changelog

## Maintenance

### Baseline Updates
- Update baselines when intentional design changes occur
- Document all baseline changes in release notes
- Archive old baselines with version tags
- Regular review of baseline accuracy (quarterly)

### Tool Evolution
- Migrate to automated tools as project matures
- Maintain manual process as fallback
- Document tool configuration and setup
- Train team on new tooling adoption

## Success Metrics

### Coverage Goals
- [ ] 100% of Storybook stories have baseline screenshots
- [ ] All three breakpoints covered for each story
- [ ] Critical user flows documented with visual progression
- [ ] Accessibility edge cases captured

### Quality Metrics  
- Visual bugs caught before production: Target >90%
- Time to identify visual regressions: Target <24 hours
- False positive rate: Target <5%
- Coverage of critical UI states: Target 100%