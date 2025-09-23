// packages/web/src/validation/index.ts
import { z } from 'zod';

export const CustomerCreateValidation = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

export const QuoteCreateValidation = z.object({
  customerId: z.string().uuid(),
  items: z.array(
    z.object({
      productId: z.string().uuid(),
      quantity: z.number().int().positive(),
    })
  ),
  pricelistId: z.string().uuid(),
});
