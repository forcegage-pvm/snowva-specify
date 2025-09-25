import { NextResponse } from 'next/server';

const DASHBOARD_SHORTCUTS_PAYLOAD = {
  generatedAt: '2024-12-20T08:10:00Z',
  shortcuts: [
    {
      id: 'view-overdue',
      label: 'Overdue invoices',
      description: '12 invoices waiting for follow-up',
      href: '/invoices?status=overdue',
      tone: 'critical',
    },
    {
      id: 'allocate-payments',
      label: 'Allocate incoming payments',
      description: 'Match 6 unapplied payments',
      href: '/payments?tab=allocation',
      tone: 'warning',
    },
    {
      id: 'renew-quotes',
      label: 'Quotes expiring soon',
      description: '9 quotes expiring in 7 days',
      href: '/quotes?filter=expiring',
    },
    {
      id: 'branch-statements',
      label: 'Branch statements',
      description: 'Generate consolidated PDFs',
      href: '/statements',
    },
  ],
};

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(DASHBOARD_SHORTCUTS_PAYLOAD);
}
