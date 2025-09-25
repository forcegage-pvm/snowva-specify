import { NextResponse } from 'next/server';

const DASHBOARD_METRICS_PAYLOAD = {
  generatedAt: '2024-12-20T08:05:00Z',
  tiles: [
    {
      id: 'outstanding-balance',
      title: 'Outstanding Balance',
      metricValue: 4_712_000,
      format: 'currency',
      currency: 'ZAR',
      deltaPct: 6.4,
      trendDirection: 'up',
      target: 4_000_000,
      criticalThreshold: 6_000_000,
    },
    {
      id: 'pending-quotes',
      title: 'Pending Quotes',
      metricValue: 48,
      format: 'number',
      deltaPct: -3.1,
      trendDirection: 'down',
      target: 40,
      criticalThreshold: 60,
    },
    {
      id: 'overdue-invoices',
      title: 'Overdue Invoices',
      metricValue: 62,
      format: 'number',
      deltaPct: 2.4,
      trendDirection: 'up',
      target: 40,
      criticalThreshold: 70,
    },
    {
      id: 'collections-rate',
      title: 'Collections Rate',
      metricValue: 91.2,
      format: 'percentage',
      deltaPct: -1.3,
      trendDirection: 'down',
      target: 93,
      criticalThreshold: 88,
    },
  ],
};

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(DASHBOARD_METRICS_PAYLOAD);
}
