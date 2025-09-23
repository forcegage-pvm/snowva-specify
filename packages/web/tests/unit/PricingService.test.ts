// packages/web/tests/unit/PricingService.test.ts
import { ProductService } from '@/services/ProductService';

describe('Unit: PricingService', () => {
  it('should return the correct price for a product', async () => {
    // This test will require mock data to be set up
    const price = await ProductService.getPrice('101', 'pl_1');
    expect(price).toBe(100);
  });
});
