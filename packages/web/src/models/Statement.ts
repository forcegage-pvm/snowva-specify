// packages/web/src/models/Statement.ts
import { z } from 'zod';
import { InvoiceSchema } from './Invoice';
import { PaymentSchema } from './Payment';

export const StatementSchema = z.object({
  id: z.string().uuid(),
  customerId: z.string().uuid(),
  invoices: z.array(InvoiceSchema),
  payments: z.array(PaymentSchema),
  balance: z.number(),
});

export type Statement = z.infer<typeof StatementSchema>;
