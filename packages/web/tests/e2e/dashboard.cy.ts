/// <reference types="cypress" />

import './support/commands';

describe('Dashboard Quick Insights', () => {
  beforeEach(() => {
    cy.viewportPreset('desktop');

    cy.intercept('GET', '**/api/v1/statements/history*', {
      statusCode: 200,
      body: {
        summary: {
          totalStatements: 12,
          totalBalance: 4712000,
          currency: 'ZAR',
          lastGeneratedAt: '2025-01-01T07:30:00Z',
        },
        statements: [
          {
            id: 'stmt_dec_tokai',
            statementId: 'stmt_dec_tokai',
            customerId: 'cust_sportsmans',
            customerName: 'Sportsmans Warehouse',
            customerType: 'retail',
            period: {
              label: 'Dec 2024',
              start: '2024-12-01',
              end: '2024-12-31',
            },
            issuedOn: '2024-12-20',
            dueOn: '2025-01-20',
            status: 'open',
            balance: 2100000,
            currency: 'ZAR',
            branchBreakdown: [
              {
                branchId: 'branch_tokai',
                branchName: 'Tokai',
                amount: 1200000,
                overdue: true,
              },
              {
                branchId: 'branch_claremont',
                branchName: 'Claremont',
                amount: 900000,
                overdue: false,
              },
            ],
          },
          {
            id: 'stmt_dec_sandton',
            statementId: 'stmt_dec_sandton',
            customerId: 'cust_holdsport',
            customerName: 'Holdsport Group',
            customerType: 'retail',
            period: {
              label: 'Dec 2024',
              start: '2024-12-01',
              end: '2024-12-31',
            },
            issuedOn: '2024-12-18',
            dueOn: '2025-01-18',
            status: 'open',
            balance: 650000,
            currency: 'ZAR',
            branchBreakdown: [
              {
                branchId: 'branch_sandton',
                branchName: 'Sandton',
                amount: 650000,
                overdue: true,
              },
            ],
          },
        ],
      },
    }).as('fetchStatementHistory');

    cy.intercept('GET', '**/api/metrics/kpis', {
      statusCode: 200,
      body: {
        tiles: [
          {
            id: 'outstanding-balance',
            title: 'Outstanding Balance',
            metricValue: 125000,
            deltaPct: 6.4,
            trendDirection: 'up',
            target: 100000,
            criticalThreshold: 150000,
          },
          {
            id: 'pending-quotes',
            title: 'Pending Quotes',
            metricValue: 48,
            deltaPct: -3.1,
            trendDirection: 'down',
            target: 40,
            criticalThreshold: 60,
          },
        ],
      },
    }).as('fetchDashboardTiles');

    cy.visit('/dashboard');
    cy.wait('@fetchDashboardTiles');
    cy.wait('@fetchStatementHistory');
  });

  it('renders KPI tiles with trend indicators and warning states', () => {
    cy.get('[data-testid="dashboard-tile"]')
      .should('have.length.at.least', 2)
      .first()
      .within(() => {
        cy.contains('Outstanding Balance');
        cy.get('[data-testid="dashboard-tile-value"]').should('contain.text', '125,000');
        cy.get('[data-testid="dashboard-tile-trend"]').should('contain.text', '6.4%');
      });

    cy.contains('[data-testid="dashboard-tile"]', 'Pending Quotes').should(
      'have.attr',
      'data-state',
      'warning',
    );

    cy.get('[data-testid="branch-spotlight"]').within(() => {
      cy.get('[data-testid="branch-spotlight-item"][data-branch-id="branch_tokai"]').should(
        'contain.text',
        'Tokai',
      );
      cy.get('[data-testid="branch-spotlight-item"][data-branch-id="branch_tokai"]').should(
        'contain.text',
        'overdue',
      );
      cy.get('[data-testid="branch-spotlight-item"][data-branch-id="branch_claremont"]').should(
        'contain.text',
        'On track',
      );
    });
  });

  it('shows loading skeletons while metrics fetch is in flight', () => {
    cy.intercept('GET', '**/api/metrics/kpis', (req) => {
      req.on('response', (res) => {
        (res as { setDelay?: (ms: number) => void }).setDelay?.(1500);
      });
    }).as('fetchSlowTiles');

    cy.viewportPreset('tablet');
    cy.visit('/dashboard');
    cy.get('[data-testid="dashboard-tile-skeleton"]').should('have.length.at.least', 1);
    cy.wait('@fetchSlowTiles');
    cy.wait('@fetchStatementHistory');
  });

  it('navigates via quick insight shortcuts when CTA chips are selected', () => {
    cy.intercept('GET', '**/api/dashboard/shortcuts', {
      statusCode: 200,
      body: {
        shortcuts: [
          { id: 'view-overdue', label: 'Overdue Invoices', href: '/customers/invoices?filter=overdue' },
          { id: 'allocate-payments', label: 'Allocate Payments', href: '/finance/payments' },
        ],
      },
    }).as('fetchShortcuts');

    cy.viewportPreset('mobile');
    cy.visit('/dashboard');
    cy.wait('@fetchShortcuts');
    cy.wait('@fetchStatementHistory');

    cy.contains('[data-testid="dashboard-shortcut"]', 'Overdue Invoices').click();
    cy.url().should('include', '/customers/invoices');
  });
});
