/// <reference types="cypress" />
/// <reference types="@testing-library/cypress" />

import { expect } from 'chai';

describe('Customer & Branch Management', () => {
  beforeEach(() => {
    cy.viewportPreset('desktop');

    cy.intercept('GET', '/api/customers*', {
      statusCode: 200,
      body: {
        total: 152,
        page: 1,
        pageSize: 25,
        items: [
          {
            id: 'cust_sportsmans',
            displayName: 'Sportsmans Warehouse',
            customerType: 'retail',
            vatNumber: '4090207074',
            creditTerms: 'Net 30',
            outstandingBalance: 4712000,
            overdueCount: 3,
            branchCount: 42,
          },
          {
            id: 'cust_outdoorwarehouse',
            displayName: 'Outdoor Warehouse',
            customerType: 'retail',
            vatNumber: '4270128765',
            creditTerms: 'Net 30',
            outstandingBalance: 2894000,
            overdueCount: 1,
            branchCount: 39,
          },
        ],
      },
    }).as('fetchCustomers');

    cy.intercept('GET', '/api/customers/cust_sportsmans/workspace', {
      statusCode: 200,
      body: {
        customer: {
          id: 'cust_sportsmans',
          displayName: 'Sportsmans Warehouse',
          creditTerms: 'Net 30',
          customerType: 'retail',
          vatNumber: '4090207074',
          billingAddress: {
            line1: '16 Dawn Road',
            city: 'Cape Town',
            postalCode: '7405',
            country: 'ZA',
          },
        },
        branches: [
          {
            id: 'branch_tokai',
            displayName: 'Tokai',
            status: 'active',
            outstandingBalance: 1654000,
            nextStatementDue: '2025-01-05',
            contacts: [
              {
                id: 'contact_kim',
                name: 'Kim Peterson',
                role: 'Operations Manager',
              },
            ],
            documents: {
              recentInvoices: [
                {
                  id: 'inv_250827101',
                  number: '250827101',
                  issuedOn: '2024-12-18',
                  status: 'finalized',
                  amount: 892000,
                  dueOn: '2025-01-17',
                },
              ],
              recentStatements: [
                {
                  id: 'stmt_2024_12',
                  period: 'Dec 2024',
                  balance: 2120000,
                  sentOn: '2024-12-20',
                },
              ],
            },
          },
        ],
      },
    }).as('fetchWorkspace');

    cy.intercept('GET', '/api/branches/branch_tokai/audit', {
      statusCode: 200,
      body: {
        events: [
          {
            id: 'audit_01',
            timestamp: '2024-12-02T08:14:00Z',
            actor: 'nadiya@snowva.com',
            action: 'Updated payment terms',
            details: {
              field: 'creditTerms',
              previous: 'Net 21',
              next: 'Net 30',
            },
          },
          {
            id: 'audit_02',
            timestamp: '2024-12-18T09:44:00Z',
            actor: 'sabelo@snowva.com',
            action: 'Captured site visit notes',
            details: {
              summary: 'Branch confirmed readiness for seasonal promotion.',
            },
          },
        ],
      },
    }).as('fetchAuditLog');

    cy.visit('/customers');
    cy.wait('@fetchCustomers');
  });

  it('filters customers and shows branch hierarchy for the selected account', () => {
    cy.get('[data-testid="customer-directory-search-input"]').type('Sportsmans');
    cy.wait('@fetchCustomers');

    cy.contains('[data-testid="customer-directory-row"]', 'Sportsmans Warehouse')
      .should('exist')
      .within(() => {
        cy.get('[data-testid="customer-directory-branch-count"]').should('contain.text', '42 branches');
        cy.get('[data-testid="customer-directory-overdue-count"]').should('contain.text', '3 overdue');
        cy.findByRole('button', { name: /view workspace/i }).click();
      });

    cy.wait('@fetchWorkspace');

    cy.contains('[data-testid="branch-node"]', 'Tokai')
      .should('have.attr', 'data-status', 'active')
      .within(() => {
        cy.get('[data-testid="branch-outstanding-balance"]').should('contain.text', 'R1,654,000');
        cy.get('[data-testid="branch-next-statement"]').should('contain.text', 'Due 5 Jan 2025');
      });
  });

  it('allows inline editing of branch contact details with confirmation', () => {
    cy.intercept('PATCH', '/api/branches/branch_tokai', (req) => {
      expect(req.body).to.deep.equal({
        billingAddress: {
          line1: '18 Forest Avenue',
        },
        contact: {
          email: 'kim.peterson@sportsmans.co.za',
        },
      });

      req.reply({
        statusCode: 200,
        body: {
          success: true,
          branch: {
            id: 'branch_tokai',
            billingAddress: {
              line1: '18 Forest Avenue',
            },
            contacts: [
              {
                id: 'contact_kim',
                email: 'kim.peterson@sportsmans.co.za',
              },
            ],
          },
        },
      });
    }).as('saveBranch');

    cy.contains('[data-testid="customer-directory-row"]', 'Sportsmans Warehouse')
      .findByRole('button', { name: /view workspace/i })
      .click();

    cy.wait('@fetchWorkspace');

    cy.contains('[data-testid="branch-node"]', 'Tokai').within(() => {
      cy.get('[data-testid="branch-edit-button"]').click();
      cy.get('[data-testid="branch-address-line1-input"]').clear().type('18 Forest Avenue');
      cy.get('[data-testid="branch-contact-email-input"]').clear().type('kim.peterson@sportsmans.co.za');
      cy.get('[data-testid="inline-save-button"]').click();
    });

    cy.wait('@saveBranch');

    cy.get('[data-testid="toast"]').should('contain.text', 'Branch details updated');
  });

  it('displays audit log entries for the active branch', () => {
    cy.contains('[data-testid="customer-directory-row"]', 'Sportsmans Warehouse')
      .findByRole('button', { name: /view workspace/i })
      .click();

    cy.wait('@fetchWorkspace');
    cy.wait('@fetchAuditLog');

    cy.get('[data-testid="branch-audit-log"]').within(() => {
      cy.contains('Updated payment terms').should('exist');
      cy.contains('Captured site visit notes').should('exist');
      cy.contains('Net 21 → Net 30');
    });
  });
});
