/// <reference types="cypress" />
/// <reference types="@testing-library/cypress" />

import { expect } from 'chai';

describe('Invoice Status Tracking', () => {
  beforeEach(() => {
    cy.viewportPreset('desktop');

  cy.intercept('GET', '**/api/v1/invoices/250827101/workspace', {
      statusCode: 200,
      body: {
        invoice: {
          id: 'inv_250827101',
          number: '250827101',
          status: 'finalized',
          issuedOn: '2024-12-18',
          dueOn: '2025-01-17',
          currency: 'ZAR',
          totals: {
            subtotalExVat: 220000,
            vatAmount: 33000,
            totalIncVat: 253000,
            amountPaid: 150000,
            balanceDue: 103000,
          },
          guardrails: {
            finalize: {
              allowed: false,
              reason: 'Invoice already finalized — further edits require credit note.',
            },
            email: {
              allowed: true,
            },
          },
        },
        paymentProgress: {
          allocations: [
            {
              id: 'alloc_01',
              amount: 150000,
              appliedOn: '2025-01-05T11:02:00Z',
              reference: 'PAY-2025-01-005',
            },
          ],
        },
      },
    }).as('fetchInvoiceWorkspace');

  cy.intercept('GET', '**/api/v1/invoices/250827101/timeline', {
      statusCode: 200,
      body: {
        events: [
          {
            id: 'timeline_01',
            timestamp: '2024-12-15T09:22:00Z',
            actor: 'sabelo@snowva.com',
            type: 'draft-created',
            summary: 'Draft invoice created from quote Q-118/2024',
          },
          {
            id: 'timeline_02',
            timestamp: '2024-12-18T07:10:00Z',
            actor: 'sabelo@snowva.com',
            type: 'finalized',
            summary: 'Invoice finalized and emailed to customer',
          },
          {
            id: 'timeline_03',
            timestamp: '2025-01-05T11:02:00Z',
            actor: 'payment-service',
            type: 'payment-applied',
            summary: 'R150,000 payment allocated',
          },
        ],
      },
    }).as('fetchInvoiceTimeline');

  cy.intercept('POST', '**/api/v1/invoices/250827101/email', (req) => {
      expect(req.body).to.deep.equal({
        recipients: ['accounts@transafrica.co.za'],
        includeAttachments: true,
        message: 'Please see the finalized invoice attached.',
      });

      req.reply({
        statusCode: 200,
        body: {
          success: true,
          dispatchedAt: '2025-01-06T08:30:00Z',
        },
      });
    }).as('sendInvoiceEmail');

    cy.visit('/invoices/250827101');
    cy.wait('@fetchInvoiceWorkspace');
    cy.wait('@fetchInvoiceTimeline');
  });

  it('renders timeline events and payment progress for the invoice', () => {
    cy.contains('[data-testid="invoice-header"]', 'Invoice #250827101').should('exist');
    cy.get('[data-testid="invoice-status-chip"]').should('contain.text', 'Finalized');
    cy.get('[data-testid="invoice-balance"]').should('contain.text', 'R103,000');

    cy.get('[data-testid="invoice-timeline"]').within(() => {
      cy.contains('Draft invoice created from quote Q-118/2024').should('exist');
      cy.contains('Invoice finalized and emailed to customer').should('exist');
      cy.contains('R150,000 payment allocated').should('exist');
    });

    cy.get('[data-testid="invoice-payment-progress"]').within(() => {
      cy.contains('PAY-2025-01-005').should('exist');
      cy.contains('R150,000').should('exist');
    });
  });

  it('disables finalize action when invoice is locked', () => {
    cy.findByRole('button', { name: /finalize invoice/i }).should('have.attr', 'aria-disabled', 'true');
    cy.get('[data-testid="finalization-lock-reason"]').should(
      'contain.text',
      'Invoice already finalized — further edits require credit note.',
    );
  });

  it('allows emailing the invoice with confirmation toast', () => {
    cy.findByRole('button', { name: /email invoice/i }).click();

    cy.get('[data-testid="email-invoice-modal"]').within(() => {
      cy.get('[data-testid="email-recipient-input"]').clear().type('accounts@transafrica.co.za');
      cy.get('[data-testid="email-message-input"]').clear().type('Please see the finalized invoice attached.');
      cy.get('[data-testid="email-attachments-toggle"]').check();
      cy.findByRole('button', { name: /send email/i }).click();
    });

    cy.wait('@sendInvoiceEmail');
    cy.get('[data-testid="toast"]').should('contain.text', 'Invoice email sent');
  });
});
