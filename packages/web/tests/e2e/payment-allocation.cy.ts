/// <reference types="cypress" />
/// <reference types="@testing-library/cypress" />

import { expect } from 'chai';

describe('Payment Allocation Lifecycle', () => {
  beforeEach(() => {
    cy.viewportPreset('desktop');

  cy.intercept('GET', '**/api/v1/payments/pay_2025_01_020/allocation-view', {
      statusCode: 200,
      body: {
        payment: {
          id: 'pay_2025_01_020',
          reference: 'HOLDSPORT-R20000',
          receivedOn: '2025-01-08',
          amount: 2000000,
          currency: 'ZAR',
          source: 'eft',
          memo: 'January settlement for Sportsmans branches',
        },
        customer: {
          id: 'cust_holdsport',
          displayName: 'Holdsport Group',
          branchCount: 38,
          creditLimit: 7500000,
          outstandingBalance: 4712000,
        },
        invoices: [
          {
            id: 'inv_tokai_101',
            number: 'TOKAI-101',
            branch: 'Tokai',
            issuedOn: '2024-12-12',
            dueOn: '2025-01-11',
            status: 'overdue',
            amountDue: 892000,
            recommendedAllocation: 892000,
            priority: 1,
          },
          {
            id: 'inv_nelspruit_044',
            number: 'NEL-044',
            branch: 'Nelspruit',
            issuedOn: '2024-12-14',
            dueOn: '2025-01-13',
            status: 'open',
            amountDue: 648000,
            recommendedAllocation: 648000,
            priority: 2,
          },
        ],
        recommendation: {
          strategy: 'fifo',
          totalAllocated: 1540000,
          remainingBalance: 460000,
          notes: 'Remainder should be applied to outstanding invoice TOKAI-102 once finalized.',
        },
        manualOverrideOptions: {
          allowPartial: true,
          allowBranchTransfer: true,
          requireReason: true,
          reasonPresets: ['Dispute pending', 'Customer instruction', 'Awaiting credit note'],
        },
      },
    }).as('fetchPaymentAllocation');

  cy.intercept('GET', '**/api/v1/payments/pay_2025_01_020/audit-log', {
      statusCode: 200,
      body: {
        events: [
          {
            id: 'audit_alloc_01',
            timestamp: '2025-01-08T09:30:00Z',
            actor: 'lerato@snowva.com',
            action: 'recommended',
            details: {
              strategy: 'fifo',
              invoices: ['inv_tokai_101', 'inv_nelspruit_044'],
            },
          },
        ],
      },
    }).as('fetchPaymentAudit');

  cy.intercept('POST', '**/api/v1/payments/pay_2025_01_020/apply-allocation', (req) => {
      expect(req.body).to.deep.equal({
        allocations: [
          {
            invoiceId: 'inv_tokai_101',
            amount: 892000,
            overrideReason: null,
          },
          {
            invoiceId: 'inv_nelspruit_044',
            amount: 648000,
            overrideReason: null,
          },
        ],
        remainingBalanceAction: {
          type: 'retain',
          notes: 'Awaiting finalization of TOKAI-102',
        },
      });

      req.reply({
        statusCode: 200,
        body: {
          success: true,
          remainingBalance: 460000,
          warnings: [
            {
              code: 'CREDIT_LIMIT_WARNING',
              message: 'Applying this payment still leaves customer over the credit limit.',
            },
          ],
        },
      });
    }).as('applyAllocation');

  cy.intercept('POST', '**/api/v1/payments/pay_2025_01_020/manual-override', (req) => {
      expect(req.body).to.deep.equal({
        invoiceId: 'inv_tokai_101',
        amount: 800000,
        strategy: 'manual',
        reason: 'Customer instruction',
      });

      req.reply({
        statusCode: 200,
        body: {
          success: true,
          remainingBalance: 1200000,
        },
      });
    }).as('manualOverride');

    cy.visit('/finance/payments/pay_2025_01_020');
    cy.wait('@fetchPaymentAllocation');
    cy.wait('@fetchPaymentAudit');
  });

  it('surfaces FIFO recommendation and allows applying allocations with warnings', () => {
    cy.contains('[data-testid="payment-header"]', 'HOLDSPORT-R20000').should('exist');
    cy.get('[data-testid="payment-summary"]').within(() => {
      cy.contains('Payment received on 8 Jan 2025');
      cy.contains('R2,000,000');
      cy.contains('Remaining balance: R460,000');
    });

    cy.get('[data-testid="allocation-table"]').within(() => {
      cy.contains('TOKAI-101').should('exist');
      cy.contains('NEL-044').should('exist');
      cy.contains('FIFO recommendation').should('exist');
    });

    cy.findByRole('button', { name: /apply allocation/i }).click();
    cy.wait('@applyAllocation');

    cy.get('[data-testid="allocation-alerts"]').should('contain.text', 'Applying this payment still leaves customer over the credit limit.');
    cy.get('[data-testid="toast"]').should('contain.text', 'Payment allocation saved');
  });

  it('supports manual override with audit trail visibility', () => {
    cy.get('[data-testid="allocation-table"] tr')
      .contains('TOKAI-101')
      .parents('tr')
      .within(() => {
        cy.get('[data-testid="manual-allocation-input"]').clear().type('800000');
        cy.findByRole('button', { name: /manual override/i }).click();
      });

    cy.get('[data-testid="manual-override-modal"]').within(() => {
      cy.findByRole('combobox', { name: /override reason/i }).select('Customer instruction');
      cy.findByRole('textbox', { name: /notes/i }).type('Customer requested partial settlement.');
      cy.findByRole('button', { name: /confirm override/i }).click();
    });

    cy.wait('@manualOverride');

    cy.get('[data-testid="payment-audit-timeline"]').within(() => {
      cy.contains('lerato@snowva.com').should('exist');
      cy.contains('FIFO').should('exist');
    });

    cy.get('[data-testid="remaining-balance"]').should('contain.text', 'R1,200,000');
  });
});
