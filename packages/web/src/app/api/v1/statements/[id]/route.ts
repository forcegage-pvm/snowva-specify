// packages/web/src/app/api/v1/statements/[id]/route.ts
import { StatementService } from '@/services/StatementService';
import { NextResponse } from 'next/server';

import { Invoice } from '@/models/Invoice';
import { Payment } from '@/models/Payment';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  // In a real app, you'd fetch invoices and payments for the customer
  const { id: customerId } = await params;
  const mockInvoices: Invoice[] = [];
  const mockPayments: Payment[] = [];

  const statement = await StatementService.generateStatement(customerId, mockInvoices, mockPayments);

  return NextResponse.json(statement);
}
