// packages/web/tests/unit/CustomerService.test.ts
import { CustomerService } from '@/services/CustomerService';

describe('Unit: CustomerService', () => {
  it('should create a customer', async () => {
    const customerData = { name: 'Test Customer', email: 'test@example.com' };
    const customer = await CustomerService.create(customerData);
    expect(customer).toBeDefined();
    expect(customer.name).toBe(customerData.name);
  });
});
