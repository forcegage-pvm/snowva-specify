// packages/web/src/services/PDFService.ts
import { Invoice } from '@/models/Invoice';
import { Quote } from '@/models/Quote';
import PDFDocument from 'pdfkit';

export const PDFService = {
  generateQuotePDF(quote: Quote): Promise<Buffer> {
    return new Promise((resolve) => {
      const doc = new PDFDocument();
      const buffers: any[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      doc.fontSize(25).text(`Quote #${quote.id}`, { align: 'center' });
      // Add more details here
      doc.end();
    });
  },

  generateInvoicePDF(invoice: Invoice): Promise<Buffer> {
    return new Promise((resolve) => {
      const doc = new PDFDocument();
      const buffers: any[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      doc.fontSize(25).text(`Invoice #${invoice.id}`, { align: 'center' });
      // Add more details here
      doc.end();
    });
  },
};
