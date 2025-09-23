// packages/web/src/services/StatementService.ts
import { Invoice } from '@/models/Invoice';
import { Payment } from '@/models/Payment';
import { Statement } from '@/models/Statement';

// Mock data
const statements: Statement[] = [];

export const StatementService = {
  async generateStatement(customerId: string, invoices: Invoice[], payments: Payment[]): Promise<Statement> {
    const balance = invoices.reduce((acc, inv) => acc + inv.total, 0) - payments.reduce((acc, p) => acc + p.amount, 0);

    const newStatement: Statement = {
      id: crypto.randomUUID(),
      customerId,
      invoices,
      payments,
      balance,
    };
    statements.push(newStatement);
    return newStatement;
  },
};
