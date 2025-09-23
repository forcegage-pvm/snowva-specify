// packages/web/src/app/api/v1/payments/route.ts
import { PaymentService } from '@/services/PaymentService';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const PaymentCreateSchema = z.object({
  invoiceId: z.string().uuid(),
  amount: z.number().positive(),
});

export async function POST(request: Request) {
  const body = await request.json();
  const validation = PaymentCreateSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json(validation.error.issues, { status: 400 });
  }

  const { invoiceId, amount } = validation.data;
  const newPayment = await PaymentService.recordPayment(invoiceId, amount);

  return NextResponse.json(newPayment, { status: 201 });
}
