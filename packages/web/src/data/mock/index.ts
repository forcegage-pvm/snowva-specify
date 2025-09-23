// packages/web/src/data/mock/index.ts
import { Customer } from '@/models/Customer';
import { Pricelist } from '@/models/Pricelist';
import { Product } from '@/models/Product';

export const mockCustomers: Customer[] = [
  { id: '1', name: 'Customer A', email: 'customer.a@example.com' },
  { id: '2', name: 'Customer B', email: 'customer.b@example.com' },
];

export const mockProducts: Product[] = [
  { id: '101', name: 'Product 1', price: 100 },
  { id: '102', name: 'Product 2', price: 200 },
];

export const mockPricelists: Pricelist[] = [
  {
    id: 'pl_1',
    name: 'Standard Pricelist',
    prices: {
      '101': 100,
      '102': 200,
    },
  },
];
