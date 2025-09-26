// packages/web/src/services/ProductService.ts
import { mockPricelists } from '@/data/mock';
import { Pricelist } from '@/models/Pricelist';

// Mock data
const pricelists: Pricelist[] = mockPricelists;

export const ProductService = {
  async getPrice(productId: string, pricelistId: string): Promise<number | null> {
    const pricelist = pricelists.find((p) => p.id === pricelistId);
    if (!pricelist) {
      return null;
    }
    return pricelist.prices[productId] || null;
  },
};
