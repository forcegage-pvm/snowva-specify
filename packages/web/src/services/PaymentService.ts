// packages/web/src/services/PaymentService.ts
import { Payment } from '@/models/Payment';

// Mock data
const payments: Payment[] = [];

export const PaymentService = {
  async recordPayment(invoiceId: string, amount: number): Promise<Payment> {
    const newPayment: Payment = {
      id: crypto.randomUUID(),
      invoiceId,
      amount,
      date: new Date(),
    };
    payments.push(newPayment);
    // In a real app, you'd update the invoice status here
    return newPayment;
  },
};
