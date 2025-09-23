// packages/web/src/app/api/v1/quotes/route.ts
import { QuoteService } from '@/services/QuoteService';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const QuoteCreateSchema = z.object({
  customerId: z.string().uuid(),
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().int().positive(),
  })),
  pricelistId: z.string().uuid(),
});

export async function POST(request: Request) {
  const body = await request.json();
  const validation = QuoteCreateSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json(validation.error.issues, { status: 400 });
  }

  const { customerId, items, pricelistId } = validation.data;
  const newQuote = await QuoteService.create(customerId, items, pricelistId);

  if (!newQuote) {
    return NextResponse.json({ error: 'Could not create quote' }, { status: 500 });
  }

  return NextResponse.json(newQuote, { status: 201 });
}
