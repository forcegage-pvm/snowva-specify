/// <reference types="cypress" />
/// <reference types="@testing-library/cypress" />

import '@testing-library/cypress/add-commands';

describe('Documents Workspace – Smoke', () => {
  beforeEach(() => {
    cy.viewport(1440, 900);
    cy.visit('/documents');
  });

  it('renders initial document exports table with retention banner', () => {
    cy.findByRole('heading', { name: /document exports/i }).should('be.visible');
    cy.findByRole('table', { name: /export history/i }).within(() => {
      cy.findAllByRole('row').should('have.length.greaterThan', 1);
    });
    cy.findByText(/exports older than one year are archived/i).should('exist');
  });

  it('filters exports by search term and highlights matches', () => {
    cy.findByRole('searchbox', { name: /search exports/i }).type('invoice');
    cy.findAllByRole('row', { name: /invoice/i }).should('have.length.greaterThan', 0);
    cy.findAllByTestId('documents-search-highlight').each(($highlight) => {
      cy.wrap($highlight).should('contain.text', 'invoice');
    });
  });

  it('supports pagination controls for long export history', () => {
    cy.findByRole('button', { name: /next page/i }).click();
    cy.url().should('include', 'page=2');
    cy.findByRole('status', { name: /showing/i }).should('contain.text', '26-50');
  });

  it('applies combined document type and status filters', () => {
    cy.findByRole('button', { name: /document type/i }).click();
    cy.findByRole('option', { name: /invoice/i }).click();
    cy.findByRole('button', { name: /status/i }).click();
    cy.findByRole('option', { name: /failed/i }).click();
    cy.findByRole('button', { name: /apply filters/i }).click();

    cy.findByRole('table', { name: /export history/i })
      .findAllByRole('row')
      .each(($row) => {
        cy.wrap($row).within(() => {
          cy.findByText(/invoice/i);
          cy.findByText(/failed/i);
        });
      });
  });

  it('toggles virtualization when results exceed threshold', () => {
    cy.findByRole('button', { name: /page size/i }).click();
    cy.findByRole('option', { name: /100 rows/i }).click();
    cy.findByRole('button', { name: /apply page size/i }).click();

    cy.findByTestId('documents-virtualizer').should('exist');
    cy.findByTestId('documents-virtualizer')
      .findAllByRole('row')
      .should('have.length.greaterThan', 20);
  });

  it('shows empty state messaging when no exports match filters', () => {
    cy.findByRole('searchbox', { name: /search exports/i }).clear().type('zzzz-no-match');
    cy.findByRole('button', { name: /apply search/i }).click();

    cy.findByRole('heading', { name: /no document exports found/i }).should('be.visible');
    cy.findByRole('button', { name: /clear filters/i }).should('exist');
  });

  it('opens preview modal with metadata and audit tab', () => {
    cy.findAllByRole('row', { name: /statement/i })
      .first()
      .click();

    cy.findByRole('dialog', { name: /document preview/i }).within(() => {
      cy.findByText(/share link expires in/i).should('exist');
      cy.findByText(/generated on/i).should('exist');
      cy.findByRole('tab', { name: /audit trail/i }).click();
      cy.findByRole('tabpanel').within(() => {
        cy.findAllByRole('listitem').should('have.length.greaterThan', 0);
      });
    });
  });

  it('copies share link and surfaces confirmation toast', () => {
    cy.findAllByRole('row', { name: /statement/i })
      .first()
      .click();

    cy.findByRole('button', { name: /copy public link/i }).click();
    cy.findByRole('status', { name: /link copied/i }).should('be.visible');
    cy.findByText(/public link expires in 30 days/i).should('exist');
  });

  it('resends failed export and appends audit entry', () => {
    cy.findByRole('button', { name: /status/i }).click();
    cy.findByRole('option', { name: /failed/i }).click();
    cy.findByRole('button', { name: /apply filters/i }).click();

    cy.findAllByRole('row', { name: /failed/i })
      .first()
      .click();

    cy.findByRole('button', { name: /resend export/i }).click();
    cy.findByRole('status', { name: /resend queued/i }).should('be.visible');
    cy.findByRole('tab', { name: /audit trail/i }).click();
    cy.findByRole('tabpanel')
      .findAllByRole('listitem')
      .should('contain.text', 'resent');
  });

  it('surfaces archive banner for exports older than retention window', () => {
    cy.findByRole('button', { name: /document type/i }).click();
    cy.findByRole('option', { name: /statement/i }).click();
    cy.findByRole('button', { name: /apply filters/i }).click();

    cy.findByRole('button', { name: /show archived/i }).click();
    cy.findByRole('alert', { name: /archived documents/i }).within(() => {
      cy.findByText(/exports older than one year/i).should('exist');
      cy.findByRole('link', { name: /request archive retrieval/i }).should('have.attr', 'href');
    });
  });

  it('regenerates share link when previous token expired', () => {
    cy.findByRole('button', { name: /status/i }).click();
    cy.findByRole('option', { name: /expired/i }).click();
    cy.findByRole('button', { name: /apply filters/i }).click();

    cy.findAllByRole('row', { name: /expired/i })
      .first()
      .click();

    cy.findByText(/share link expired/i).should('be.visible');
    cy.findByRole('button', { name: /generate new link/i }).click();
    cy.findByRole('status', { name: /new share link ready/i }).should('be.visible');
  });

  it('recovers from simulated API error with retry CTA', () => {
    cy.findByRole('button', { name: /simulate error/i }).click();
    cy.findByRole('alert', { name: /could not load document exports/i }).should('be.visible');
    cy.findByRole('button', { name: /retry/i }).click();
    cy.findByRole('table', { name: /export history/i }).should('exist');
  });
});
