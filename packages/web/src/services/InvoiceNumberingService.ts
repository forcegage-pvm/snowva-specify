// packages/web/src/services/InvoiceNumberingService.ts
import { z } from 'zod';

export const InvoiceNumberSchema = z.string().regex(/^\d{6}\d{3}$/);

export const InvoiceNumberingService = {
  async getNextInvoiceNumber(): Promise<string> {
    // In a real app, this would come from a database sequence or a dedicated service
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const sequence = '001'; // This should be dynamic
    return `${year}${month}${day}${sequence}`;
  },
};
