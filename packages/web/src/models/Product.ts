// packages/web/src/models/Product.ts
import { z } from 'zod';

export const ProductSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().optional(),
  price: z.number().positive(),
});

export type Product = z.infer<typeof ProductSchema>;
