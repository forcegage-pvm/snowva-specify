// packages/web/tests/unit/PaymentService.test.ts
import { PaymentService } from '@/services/PaymentService';

describe('Unit: PaymentService', () => {
  it('should record a payment', async () => {
    const payment = await PaymentService.recordPayment('inv_123', 100);
    expect(payment).toBeDefined();
    expect(payment.amount).toBe(100);
  });
});
