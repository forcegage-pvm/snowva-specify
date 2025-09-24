// @ts-nocheck

describe('Dashboard Quick Insights', () => {
  beforeEach(() => {
    cy.intercept('GET', '/api/metrics/kpis', {
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
  });

  it('shows loading skeletons while metrics fetch is in flight', () => {
    cy.intercept('GET', '/api/metrics/kpis', (req) => {
      req.on('response', (res) => {
        res.setDelay(1500);
      });
    }).as('fetchSlowTiles');

    cy.visit('/dashboard');
    cy.get('[data-testid="dashboard-tile-skeleton"]').should('have.length.at.least', 1);
    cy.wait('@fetchSlowTiles');
  });

  it('navigates via quick insight shortcuts when CTA chips are selected', () => {
    cy.intercept('GET', '/api/dashboard/shortcuts', {
      statusCode: 200,
      body: {
        shortcuts: [
          { id: 'view-overdue', label: 'Overdue Invoices', href: '/customers/invoices?filter=overdue' },
          { id: 'allocate-payments', label: 'Allocate Payments', href: '/finance/payments' },
        ],
      },
    }).as('fetchShortcuts');

    cy.visit('/dashboard');
    cy.wait('@fetchShortcuts');

    cy.contains('[data-testid="dashboard-shortcut"]', 'Overdue Invoices').click();
    cy.url().should('include', '/customers/invoices');
  });
});
