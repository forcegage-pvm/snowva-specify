// packages/web/src/models/Invoice.ts
import { z } from 'zod';
import { QuoteLineItemSchema } from './Quote';

export const InvoiceSchema = z.object({
  id: z.string().uuid(),
  quoteId: z.string().uuid(),
  customerId: z.string().uuid(),
  lineItems: z.array(QuoteLineItemSchema),
  total: z.number().positive(),
  status: z.enum(['draft', 'sent', 'paid', 'overdue']),
});

export type Invoice = z.infer<typeof InvoiceSchema>;
