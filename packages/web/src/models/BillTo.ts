// packages/web/src/models/BillTo.ts
import { z } from 'zod';

export const BillToSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  address: z.string(),
});

export type BillTo = z.infer<typeof BillToSchema>;
