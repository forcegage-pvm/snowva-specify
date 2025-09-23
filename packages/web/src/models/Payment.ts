// packages/web/src/models/Payment.ts
import { z } from 'zod';

export const PaymentSchema = z.object({
  id: z.string().uuid(),
  invoiceId: z.string().uuid(),
  amount: z.number().positive(),
  date: z.date(),
});

export type Payment = z.infer<typeof PaymentSchema>;
