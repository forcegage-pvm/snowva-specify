// packages/web/src/models/Branch.ts
import { z } from 'zod';

export const BranchSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  address: z.string(),
});

export type Branch = z.infer<typeof BranchSchema>;
