/// <reference types="cypress" />

import '@testing-library/cypress/add-commands';

import type {
    ViewportPreset,
    ViewportPresetName,
} from '../../../cypress.config';

const VIEWPORT_PRESETS: Record<ViewportPresetName, ViewportPreset> =
  Cypress.env('viewports') ?? {
    desktop: { width: 1440, height: 900 },
    tablet: { width: 1024, height: 768 },
    mobile: { width: 390, height: 844 },
  };

// Declare all command types first
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      viewportPreset(preset: ViewportPresetName): Chainable;
      
      // Document Export Commands
      visitDocumentsWorkspace(): Chainable;
      searchDocuments(searchTerm: string): Chainable;
      filterDocuments(filterType: 'documentTypes' | 'statuses' | 'channels', values: string[]): Chainable;
      sortDocuments(sortBy: 'createdAt' | 'title' | 'status' | 'lastDownloadedAt'): Chainable;
      selectDocumentExport(exportId: string): Chainable;
      resendDocumentExport(exportId: string): Chainable;
      generateShareLink(exportId: string): Chainable;
      copyShareLink(exportId: string): Chainable;
      
      // Verification Commands
      verifyDocumentExportTable(expectedCount?: number): Chainable;
      verifyShareLinkWarning(): Chainable;
      verifyShareLinkExpiry(expectedDays: number): Chainable;
      verifyAuditTrail(exportId: string, expectedActions: string[]): Chainable;
      verifyVirtualization(minRowCount?: number): Chainable;
      verifyFilterPersistence(): Chainable;
    }
  }
}

// Implement commands
Cypress.Commands.add('viewportPreset', (preset: ViewportPresetName) => {
  const config = VIEWPORT_PRESETS[preset];

  if (!config) {
    throw new Error(`Unknown viewport preset: ${preset}`);
  }

  cy.viewport(config.width, config.height);
});

// Document Export Test Helpers
Cypress.Commands.add('visitDocumentsWorkspace', () => {
  cy.visit('/documents');
  cy.get('[data-testid="documents-workspace"]').should('be.visible');
});

Cypress.Commands.add('searchDocuments', (searchTerm: string) => {
  cy.get('[data-testid="document-search-input"]').clear();
  if (searchTerm) {
    cy.get('[data-testid="document-search-input"]').type(searchTerm);
  }
  // Wait for debounced search to trigger
  cy.wait(500);
});

Cypress.Commands.add('filterDocuments', (filterType: 'documentTypes' | 'statuses' | 'channels', values: string[]) => {
  cy.get(`[data-testid="filter-${filterType}"]`).click();
  
  values.forEach(value => {
    cy.get(`[data-testid="filter-option-${value}"]`).click();
  });
  
  // Click outside to close the dropdown
  cy.get('body').click(0, 0);
});

Cypress.Commands.add('sortDocuments', (sortBy: 'createdAt' | 'title' | 'status' | 'lastDownloadedAt') => {
  cy.get(`[data-testid="sort-chip-${sortBy}"]`).click();
});

Cypress.Commands.add('selectDocumentExport', (exportId: string) => {
  cy.get(`[data-testid="export-row-${exportId}"]`).click();
  cy.get('[data-testid="document-preview-modal"]').should('be.visible');
});

Cypress.Commands.add('resendDocumentExport', (exportId: string) => {
  cy.selectDocumentExport(exportId);
  cy.get('[data-testid="resend-button"]').click();
  cy.get('[data-testid="resend-confirm-button"]').click();
  
  // Wait for resend to complete
  cy.get('[data-testid="resend-success-message"]').should('be.visible');
});

Cypress.Commands.add('generateShareLink', (exportId: string) => {
  cy.selectDocumentExport(exportId);
  cy.get('[data-testid="share-tab"]').click();
  cy.get('[data-testid="generate-share-link-button"]').click();
  
  // Wait for share link to be generated
  cy.get('[data-testid="share-link-url"]').should('be.visible');
});

Cypress.Commands.add('copyShareLink', (exportId: string) => {
  cy.generateShareLink(exportId);
  cy.get('[data-testid="copy-share-link-button"]').click();
  
  // Verify copy success feedback
  cy.get('[data-testid="copy-success-message"]').should('be.visible');
});

Cypress.Commands.add('verifyDocumentExportTable', (expectedCount?: number) => {
  cy.get('[data-testid="document-exports-table"]').should('be.visible');
  
  if (expectedCount !== undefined) {
    if (expectedCount === 0) {
      cy.get('[data-testid="empty-state"]').should('be.visible');
    } else {
      cy.get('[data-testid="export-row"]').should('have.length', expectedCount);
    }
  }
});

Cypress.Commands.add('verifyShareLinkWarning', () => {
  cy.get('[data-testid="public-link-warning"]').should('be.visible');
  cy.get('[data-testid="public-link-warning"]').should('contain', 'Public Share Link Created');
  cy.get('[data-testid="public-link-warning"]').should('contain', 'Anyone with this link can view');
});

Cypress.Commands.add('verifyShareLinkExpiry', (expectedDays: number) => {
  cy.get('[data-testid="share-link-expiry"]').should('be.visible');
  cy.get('[data-testid="share-link-expiry"]').should('contain', `${expectedDays} days`);
});

Cypress.Commands.add('verifyAuditTrail', (exportId: string, expectedActions: string[]) => {
  cy.selectDocumentExport(exportId);
  cy.get('[data-testid="audit-tab"]').click();
  
  expectedActions.forEach(action => {
    cy.get('[data-testid="audit-trail"]').should('contain', action);
  });
});

Cypress.Commands.add('verifyVirtualization', (minRowCount?: number) => {
  const threshold = minRowCount ?? 100;
  
  // Check if virtualization is enabled for large datasets
  cy.get('[data-testid="document-exports-table"]').then(() => {
    cy.get('[data-testid="export-row"]').then($rows => {
      if ($rows.length >= threshold) {
        // Verify virtual scrolling indicators
        cy.get('[data-testid="virtual-scroll-container"]').should('exist');
      }
    });
  });
});

Cypress.Commands.add('verifyFilterPersistence', () => {
  // Apply filters
  cy.searchDocuments('test');
  cy.filterDocuments('statuses', ['sent']);
  
  // Refresh page
  cy.reload();
  
  // Verify filters are restored
  cy.get('[data-testid="document-search-input"]').should('have.value', 'test');
  cy.get('[data-testid="filter-option-sent"]').should('have.attr', 'aria-selected', 'true');
});

export { VIEWPORT_PRESETS };
