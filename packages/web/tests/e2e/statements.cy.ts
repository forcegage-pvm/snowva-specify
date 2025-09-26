/// <reference types="cypress" />
/// <reference types="@testing-library/cypress" />

import { expect } from 'chai';

describe('Consolidated Statement Generation', () => {
  beforeEach(() => {
    cy.viewportPreset('desktop');

  cy.intercept('GET', '**/api/v1/statements/history*', (req) => {
      const baseResponse = {
        summary: {
          totalStatements: 12,
          totalBalance: 4712000,
          currency: 'ZAR',
          lastGeneratedAt: '2025-01-01T07:30:00Z',
        },
        statements: [
          {
            id: 'stmt_sportsmans_2024_12',
            customerId: 'cust_sportsmans',
            customerName: 'Sportsmans Warehouse',
            period: {
              label: 'Dec 2024',
              start: '2024-12-01',
              end: '2024-12-31',
            },
            issuedOn: '2024-12-20',
            dueOn: '2025-01-20',
            status: 'open',
            balance: 4712000,
            branchBreakdown: [
              {
                branchId: 'branch_tokai',
                branchName: 'Tokai',
                amount: 1654000,
                overdue: true,
              },
              {
                branchId: 'branch_northridge',
                branchName: 'Northridge',
                amount: 1213000,
                overdue: false,
              },
            ],
            exports: {
              pdf: {
                url: 'https://cdn.snowva.com/statements/stm_sportsmans_2024_12.pdf',
                generatedAt: '2024-12-20T08:00:00Z',
              },
              emailHistory: [
                {
                  id: 'email_01',
                  sentAt: '2024-12-20T08:05:00Z',
                  recipients: ['finance@sportsmans.co.za'],
                  status: 'delivered',
                },
              ],
            },
          },
        ],
      };

      if (req.query.status === 'overdue') {
        req.reply({
          ...baseResponse,
          summary: {
            ...baseResponse.summary,
            totalStatements: 3,
            totalBalance: 1987000,
          },
          statements: [
            {
              ...baseResponse.statements[0],
              balance: 1987000,
              branchBreakdown: baseResponse.statements[0].branchBreakdown.filter((branch) => branch.overdue),
            },
          ],
        });

        return;
      }

      req.reply(baseResponse);
    }).as('fetchStatements');

  cy.intercept('POST', '**/api/v1/statements/generate', (req) => {
      expect(req.body).to.deep.equal({
        scope: 'consolidated',
        includeBranches: true,
        filters: {
          customerType: 'retail',
          period: {
            preset: 'lastMonth',
          },
        },
      });

      req.reply({
        statusCode: 200,
        body: {
          statementId: 'stmt_sportsmans_2025_01',
          issuedOn: '2025-01-21',
          dueOn: '2025-02-21',
          redirectUrl: '/finance/statements/stm_sportsmans_2025_01',
        },
      });
    }).as('generateStatement');

  cy.intercept('POST', '**/api/v1/statements/stmt_sportsmans_2025_01/export', (req) => {
      expect(req.body).to.deep.equal({
        format: 'pdf',
        includeEmail: true,
        recipients: ['finance@sportsmans.co.za'],
      });

      req.reply({
        statusCode: 200,
        body: {
          success: true,
          downloadUrl: 'https://cdn.snowva.com/statements/stm_sportsmans_2025_01.pdf',
        },
      });
    }).as('exportStatement');

    cy.visit('/finance/statements');
    cy.wait('@fetchStatements');
  });

  it('filters statements and shows consolidated balance totals', () => {
    cy.get('[data-testid="statement-summary"]').within(() => {
      cy.contains('12 statements');
      cy.contains('Total due: R4,712,000');
    });

    cy.findByRole('combobox', { name: /statement status/i }).select('Overdue');
    cy.wait('@fetchStatements');

    cy.get('[data-testid="statement-summary"]').within(() => {
      cy.contains('3 statements');
      cy.contains('Total due: R1,987,000');
    });

    cy.get('[data-testid="statement-table"]').within(() => {
      cy.contains('Sportsmans Warehouse').should('exist');
      cy.contains('Dec 2024');
      cy.contains('R1,987,000');
      cy.contains('Tokai');
    });
  });

  it('generates a consolidated statement and exports the PDF', () => {
    cy.findByRole('button', { name: /generate consolidated statement/i }).click();

    cy.get('[data-testid="generate-statement-modal"]').within(() => {
      cy.findByRole('combobox', { name: /customer type/i }).select('Retail');
      cy.findByRole('combobox', { name: /period preset/i }).select('Last month');
      cy.findByRole('checkbox', { name: /include branch breakdown/i }).check();
      cy.findByRole('button', { name: /generate statement/i }).click();
    });

    cy.wait('@generateStatement');

    cy.get('[data-testid="toast"]').should('contain.text', 'Statement generated');

    cy.findByRole('button', { name: /export pdf/i }).click();
    cy.get('[data-testid="export-statement-modal"]').within(() => {
      cy.findByRole('textbox', { name: /email recipients/i }).clear().type('finance@sportsmans.co.za');
      cy.findByRole('checkbox', { name: /email copy to customer/i }).check();
      cy.findByRole('button', { name: /export and email/i }).click();
    });

    cy.wait('@exportStatement');
    cy.get('[data-testid="toast"]').should('contain.text', 'Statement PDF ready');
  });
});
