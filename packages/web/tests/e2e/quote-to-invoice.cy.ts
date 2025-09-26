/// <reference types="cypress" />
/// <reference types="@testing-library/cypress" />

import { expect } from 'chai';

describe('Quote Creation to Invoice Preview', () => {
  beforeEach(() => {
    cy.viewportPreset('desktop');

  cy.intercept('GET', '**/api/v1/quotes/wizard/bootstrap', {
      statusCode: 200,
      body: {
        customers: [
          {
            id: 'cust_transafrica',
            displayName: 'Trans Africa Self Drive Adventures',
            customerType: 'consumer',
            creditLimit: 3000000,
            outstandingBalance: 950000,
            branches: [
              {
                id: 'branch_main',
                displayName: 'Cape Town HQ',
                default: true,
                vatNumber: '4090207074',
              },
            ],
            recentDocuments: {
              quotes: [
                {
                  id: 'quote_2024_12_118',
                  number: 'Q-118/2024',
                  issuedOn: '2024-12-01',
                  amountIncVat: 253000,
                  status: 'sent',
                },
              ],
              invoices: [],
            },
          },
        ],
        catalog: [
          {
            id: 'prod_ice_maker',
            title: 'Snowva Ultimate Ice Maker',
            sku: 'SNV-ICE-ULT',
            retailPrice: 31500,
            consumerPrice: 40000,
            vatRate: 0.15,
          },
          {
            id: 'prod_braai_grid_large',
            title: 'Makabrai Grid (Large)',
            sku: 'MKB-GRID-L',
            retailPrice: 12500,
            consumerPrice: 14375,
            vatRate: 0.15,
          },
        ],
        defaultVatRate: 0.15,
        maxLineItems: 50,
      },
    }).as('bootstrapWizard');

  cy.intercept('POST', '**/api/v1/quotes/draft', (req) => {
      expect(req.body).to.deep.equal({
        customerId: 'cust_transafrica',
        branchId: 'branch_main',
        reference: 'TA-QUOTE-2024-12',
        lineItems: [
          {
            productId: 'prod_ice_maker',
            quantity: 5,
            unitPriceExVat: 31500,
          },
          {
            productId: 'prod_braai_grid_large',
            quantity: 10,
            unitPriceExVat: 12500,
          },
        ],
        notes: 'Site equipment refresh',
        purchaseOrderNumber: 'PO-78421',
      });

      req.reply({
        statusCode: 200,
        body: {
          draftId: 'draft_001',
          totals: {
            subtotalExVat: 565000,
            vatAmount: 84750,
            totalIncVat: 649750,
          },
        },
      });
    }).as('saveDraft');

  cy.intercept('GET', '**/api/v1/quotes/draft_001/preview', {
      statusCode: 200,
      body: {
        url: 'https://cdn.snowva.com/previews/draft_001.pdf',
        expiresAt: '2024-12-01T10:00:00Z',
      },
    }).as('fetchPreview');

  cy.intercept('POST', '**/api/v1/quotes/draft_001/convert', (req) => {
      expect(req.body).to.deep.equal({
        sendEmail: true,
        emailRecipients: ['accounts@transafrica.co.za'],
      });

      req.reply({
        statusCode: 200,
        body: {
          invoiceId: 'inv_250827101',
          invoiceNumber: '250827101',
          redirectUrl: '/invoices/250827101',
        },
      });
    }).as('convertQuote');

  cy.intercept('GET', '**/api/v1/quotes/draft_001/timeline', {
      statusCode: 200,
      body: {
        events: [
          {
            id: 'event_1',
            type: 'draft-saved',
            timestamp: '2024-12-01T08:10:00Z',
            actor: 'sabelo@snowva.com',
            summary: 'Draft saved with 2 line items',
          },
        ],
      },
    }).as('fetchTimeline');

    cy.visit('/sales/quote-composer');
    cy.wait('@bootstrapWizard');
  });

  it('walks through quote wizard and previews VAT-inclusive totals', () => {
    cy.findByRole('combobox', { name: /select customer/i }).select('Trans Africa Self Drive Adventures');
    cy.findByRole('combobox', { name: /branch/i }).select('Cape Town HQ');
  cy.findByLabelText(/purchase order number/i).type('PO-78421');
  cy.findByLabelText(/internal reference/i).clear().type('TA-QUOTE-2024-12');
    cy.findByRole('button', { name: /continue to line items/i }).click();

    cy.contains('[data-testid="catalog-product"]', 'Snowva Ultimate Ice Maker').within(() => {
      cy.get('[data-testid="line-quantity-input"]').clear().type('5');
      cy.get('[data-testid="add-line-button"]').click();
    });

    cy.contains('[data-testid="catalog-product"]', 'Makabrai Grid (Large)').within(() => {
      cy.get('[data-testid="line-quantity-input"]').clear().type('10');
      cy.get('[data-testid="add-line-button"]').click();
    });

    cy.findByRole('button', { name: /review quote/i }).click();

    cy.wait('@saveDraft');

    cy.contains('[data-testid="quote-summary"]', 'Subtotal').should('contain.text', 'R565,000');
    cy.contains('[data-testid="quote-summary"]', 'VAT (15%)').should('contain.text', 'R84,750');
    cy.contains('[data-testid="quote-summary"]', 'Total').should('contain.text', 'R649,750');

    cy.findByRole('button', { name: /preview document/i }).click();
    cy.wait('@fetchPreview');

    cy.get('[data-testid="quote-preview-modal"]').within(() => {
      cy.contains('Download preview');
      cy.findByRole('button', { name: /close preview/i }).click();
    });
  });

  it('converts a validated quote into an invoice with audit timeline', () => {
    cy.findByRole('combobox', { name: /select customer/i }).select('Trans Africa Self Drive Adventures');
    cy.findByRole('combobox', { name: /branch/i }).select('Cape Town HQ');
  cy.findByLabelText(/purchase order number/i).type('PO-78421');
  cy.findByLabelText(/internal reference/i).clear().type('TA-QUOTE-2024-12');
    cy.findByRole('button', { name: /continue to line items/i }).click();

    cy.contains('[data-testid="catalog-product"]', 'Snowva Ultimate Ice Maker').within(() => {
      cy.get('[data-testid="line-quantity-input"]').clear().type('5');
      cy.get('[data-testid="add-line-button"]').click();
    });

    cy.findByRole('button', { name: /review quote/i }).click();
    cy.wait('@saveDraft');

    cy.wait('@fetchTimeline');
    cy.get('[data-testid="quote-timeline"]').should('contain.text', 'Draft saved with 2 line items');

  cy.findByLabelText(/send PDF to/i).clear().type('accounts@transafrica.co.za');
    cy.findByRole('button', { name: /convert to invoice/i }).click();

    cy.wait('@convertQuote');
    cy.get('[data-testid="toast"]').should('contain.text', 'Invoice 250827101 created');
  });
});
