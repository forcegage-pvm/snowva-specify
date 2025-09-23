// packages/web/src/services/InvoiceService.ts
import { Invoice } from '@/models/Invoice';
import { Quote } from '@/models/Quote';

// Mock data
const invoices: Invoice[] = [];

export const InvoiceService = {
  async createFromQuote(quote: Quote): Promise<Invoice> {
    const newInvoice: Invoice = {
      id: crypto.randomUUID(),
      quoteId: quote.id,
      customerId: quote.customerId,
      lineItems: quote.lineItems,
      total: quote.total,
      status: 'draft',
    };
    invoices.push(newInvoice);
    return newInvoice;
  },
};
