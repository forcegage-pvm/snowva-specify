/// <reference types="cypress" />
/// <reference types="@testing-library/cypress" />

import { expect } from 'chai';

describe('Seasonal Price Update Workflow', () => {
  beforeEach(() => {
    cy.viewportPreset('desktop');

  cy.intercept('GET', '**/api/v1/products*', {
      statusCode: 200,
      body: {
        filters: {
          catalogTypes: ['Retail', 'Consumer'],
          categories: ['Snowva Appliances', 'Makabrai'],
        },
        products: [
          {
            id: 'prod_ice_maker',
            name: 'Snowva Ultimate Ice Maker',
            sku: 'SNV-ICE-ULT',
            category: 'Snowva Appliances',
            retailPrice: 31500,
            consumerPrice: 40000,
            pendingUpdate: {
              effectiveFrom: '2025-02-01',
              proposedRetailPrice: 33000,
              proposedConsumerPrice: 41800,
              reason: 'Supplier adjustment',
            },
            priceListVersion: {
              id: 'plv_2025_q1',
              label: 'Q1 2025 Seasonal',
              status: 'scheduled',
            },
          },
          {
            id: 'prod_braai_grid_large',
            name: 'Makabrai Grid (Large)',
            sku: 'MKB-GRID-L',
            category: 'Makabrai',
            retailPrice: 12500,
            consumerPrice: 14375,
            pendingUpdate: null,
            priceListVersion: {
              id: 'plv_2024_holiday',
              label: '2024 Holiday',
              status: 'active',
            },
          },
        ],
      },
    }).as('fetchProducts');

  cy.intercept('GET', '**/api/v1/price-lists/plv_2025_q1/diff', {
      statusCode: 200,
      body: {
        version: {
          id: 'plv_2025_q1',
          label: 'Q1 2025 Seasonal',
          effectiveFrom: '2025-02-01',
        },
        changes: [
          {
            productId: 'prod_ice_maker',
            from: 31500,
            to: 33000,
            percentageChange: 0.0476,
          },
          {
            productId: 'prod_braai_grid_large',
            from: 12500,
            to: 13000,
            percentageChange: 0.04,
          },
        ],
      },
    }).as('fetchVersionDiff');

    cy.visit('/products/pricing');
    cy.wait('@fetchProducts');
  });

  it('filters catalog by retail products and highlights pending updates', () => {
    cy.findByLabelText(/catalog type/i).select('Retail');
    cy.wait('@fetchProducts');

    cy.contains('[data-testid="product-card"]', 'Snowva Ultimate Ice Maker')
      .should('contain.text', 'Retail R315.00')
      .within(() => {
        cy.get('[data-testid="pending-update-badge"]').should('contain.text', 'Pending change');
        cy.get('[data-testid="pending-update-effective"]').should('contain.text', 'Effective 1 Feb 2025');
      });

    cy.contains('[data-testid="product-card"]', 'Makabrai Grid (Large)')
      .should('exist')
      .within(() => {
        cy.get('[data-testid="pending-update-badge"]').should('not.exist');
      });
  });

  it('edits seasonal retail pricing and submits for approval', () => {
  cy.intercept('PATCH', '**/api/v1/products/prod_ice_maker/pricing', (req) => {
      expect(req.body).to.deep.equal({
        retailPrice: 33000,
        consumerPrice: 41800,
        notes: 'Approved seasonal increase',
      });

      req.reply({
        statusCode: 200,
        body: {
          success: true,
          product: {
            id: 'prod_ice_maker',
            retailPrice: 33000,
            consumerPrice: 41800,
            pendingUpdate: null,
          },
        },
      });
    }).as('savePricing');

    cy.contains('[data-testid="product-card"]', 'Snowva Ultimate Ice Maker').within(() => {
      cy.get('[data-testid="price-edit-button"]').click();
      cy.get('[data-testid="retail-price-input"]').clear().type('330');
      cy.get('[data-testid="consumer-price-input"]').clear().type('418');
      cy.get('[data-testid="price-change-notes"]').type('Approved seasonal increase');
      cy.get('[data-testid="price-save-button"]').click();
    });

    cy.wait('@savePricing');
    cy.get('[data-testid="toast"]').should('contain.text', 'Pricing updated');
  });

  it('previews price list differences before confirming rollout', () => {
    cy.contains('[data-testid="product-card"]', 'Snowva Ultimate Ice Maker')
      .findByRole('button', { name: /view version diff/i })
      .click();

    cy.wait('@fetchVersionDiff');

    cy.get('[data-testid="price-list-diff-modal"]').within(() => {
      cy.contains('Q1 2025 Seasonal').should('exist');
      cy.contains('Snowva Ultimate Ice Maker');
      cy.contains('Makabrai Grid (Large)');
      cy.get('[data-testid="diff-row"]').should('have.length', 2);
      cy.findByRole('button', { name: /confirm rollout/i }).click();
    });

    cy.get('[data-testid="toast"]').should('contain.text', 'Price list rollout queued');
  });
});
