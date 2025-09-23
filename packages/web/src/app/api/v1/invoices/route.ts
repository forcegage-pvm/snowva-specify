// packages/web/src/app/api/v1/invoices/route.ts
import { InvoiceService } from '@/services/InvoiceService';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const InvoiceCreateSchema = z.object({
  quoteId: z.string().uuid(),
});

export async function POST(request: Request) {
  const body = await request.json();
  const validation = InvoiceCreateSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json(validation.error.issues, { status: 400 });
  }

  // In a real app, you'd fetch the quote from the database
  // For now, we'll assume a function in QuoteService can do this
  // This part of the code is illustrative and will need a real implementation
  const mockQuote = {
    id: validation.data.quoteId,
    customerId: 'mock-customer-id',
    lineItems: [],
    total: 0,
    status: 'accepted' as const,
  };

  const newInvoice = await InvoiceService.createFromQuote(mockQuote);

  return NextResponse.json(newInvoice, { status: 201 });
}
