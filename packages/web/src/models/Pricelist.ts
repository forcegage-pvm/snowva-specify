// packages/web/src/models/Pricelist.ts
import { z } from 'zod';

export const PricelistSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  prices: z.record(z.string(), z.number()), // Product ID -> Price
});

export type Pricelist = z.infer<typeof PricelistSchema>;
