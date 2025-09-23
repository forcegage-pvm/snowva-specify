// packages/web/src/services/QuoteService.ts
import { Quote, QuoteLineItem } from '@/models/Quote';
import { ProductService } from './ProductService';

// Mock data
const quotes: Quote[] = [];

export const QuoteService = {
  async create(customerId: string, items: { productId: string; quantity: number }[], pricelistId: string): Promise<Quote | null> {
    const lineItems: QuoteLineItem[] = [];
    let total = 0;

    for (const item of items) {
      const price = await ProductService.getPrice(item.productId, pricelistId);
      if (price === null) {
        return null; // or throw an error
      }
      const product = { id: item.productId, name: 'mock', price }; // get full product later
      lineItems.push({ product, quantity: item.quantity, price });
      total += price * item.quantity;
    }

    const newQuote: Quote = {
      id: crypto.randomUUID(),
      customerId,
      lineItems,
      total,
      status: 'draft',
    };

    quotes.push(newQuote);
    return newQuote;
  },
};
