// packages/web/src/models/Quote.ts
import { z } from 'zod';
import { ProductSchema } from './Product';

export const QuoteLineItemSchema = z.object({
  product: ProductSchema,
  quantity: z.number().int().positive(),
  price: z.number().positive(),
});

export const QuoteSchema = z.object({
  id: z.string().uuid(),
  customerId: z.string().uuid(),
  lineItems: z.array(QuoteLineItemSchema),
  total: z.number().positive(),
  status: z.enum(['draft', 'sent', 'accepted', 'rejected']),
});

export type Quote = z.infer<typeof QuoteSchema>;
export type QuoteLineItem = z.infer<typeof QuoteLineItemSchema>;
