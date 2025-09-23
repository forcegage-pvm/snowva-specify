// packages/web/src/models/Customer.ts
import { z } from 'zod';

export const CustomerSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export type Customer = z.infer<typeof CustomerSchema>;
