/**
 * Data transformation utilities to convert real business data 
 * from data/current/ to our application data models
 */

import type { Quote } from '@/types/quotes/Quote';
import { QuoteStatus } from '@/types/quotes/QuoteStatus';

// Raw data interfaces matching the current data structure
interface RawCustomer {
  id: string;
  name: string;
  type: 'Retail' | 'Consumer';
  addresses: Array<{
    id: string;
    type: string;
    isPrimary: boolean;
    addressLine1: string;
    addressLine2: string;
    country: string;
  }>;
  vatNumber: string;
  legalEntityName: string;
  paymentTerm: string;
  customProductPricing: Array<{
    id: string;
    productId: string;
    prices: Array<{
      id: string;
      effectiveDate: string;
      retail: number;
      consumer: number;
    }>;
    customItemCode: string;
  }>;
}

interface RawProduct {
  id: string;
  itemCode: string;
  name: string;
  description: string;
  prices: Array<{
    id: string;
    effectiveDate: string;
    retail: number;
    consumer: number;
  }>;
  imageUrl: string | null;
  ecommerceLink: string | null;
}

interface RawInvoice {
  id: string;
  customerId: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  status: string;
  poNumber: string;
  type: 'Retail' | 'Consumer';
  lineItems: Array<{
    productId: string;  
    quantity: number;
    unitPrice: number;
  }>;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  shippingAmount: number;
  totalAmount: number;
  notes: string;
}

interface RawPayment {
  id: string;
  customerId: string;
  method: string;
  reference: string;
  allocations: Array<{
    amount: number;
    invoiceNumber: string;
  }>;
  date: string;
  totalAmount: number;
  paymentNumber: string;
}

/**
 * Transform raw customer data to bootstrap customer format
 */
export function transformCustomersToBootstrap(customersData: Record<string, RawCustomer>) {
  return Object.values(customersData).map(customer => ({
    id: customer.id,
    displayName: customer.name,
    customerType: customer.type === 'Retail' ? 'Business' : 'Consumer',
    creditLimit: calculateCreditLimit(customer.type),
    outstandingBalance: Math.random() * 5000, // Would come from unpaid invoices in real system
    branches: [
      {
        id: `branch-${customer.id}`,
        displayName: customer.addresses.find(addr => addr.isPrimary)?.addressLine1 || 'Main Office',
        default: true,
        vatNumber: customer.vatNumber
      }
    ],
    recentDocuments: {}
  }));
}

/**
 * Transform raw products to bootstrap catalog format
 */
export function transformProductsToCatalog(productsData: { products: Record<string, RawProduct> }) {
  return Object.values(productsData.products).map(product => {
    const latestPrice = product.prices.sort((a, b) => 
      new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime()
    )[0];
    
    return {
      id: product.id,
      title: product.name,
      sku: product.itemCode,
      retailPrice: latestPrice?.retail || 0,
      consumerPrice: latestPrice?.consumer || 0,
      vatRate: 0.15 // South Africa standard VAT rate
    };
  });
}

/**
 * Generate realistic quotes based on existing customer and product data
 */
export function generateQuotesFromRealData(
  customersData: Record<string, RawCustomer>,
  productsData: { products: Record<string, RawProduct> },
  invoicesData: RawInvoice[]
): Quote[] {
  const customers = Object.values(customersData);
  const products = Object.values(productsData.products);
  const quotes: Quote[] = [];
  
  // Generate quotes for each customer
  customers.forEach((customer, customerIndex) => {
    const numQuotes = Math.floor(Math.random() * 3) + 1; // 1-3 quotes per customer
    
    for (let i = 0; i < numQuotes; i++) {
      const quoteNumber = `QUO-${new Date().getFullYear()}-${String(customerIndex + 1).padStart(3, '0')}-${String(i + 1).padStart(2, '0')}`;
      const createdDate = new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000); // Last 90 days
      
      // Get customer's custom pricing or use default
      const availableProducts = products.filter(product => {
        const customPricing = customer.customProductPricing.find(cpp => cpp.productId === product.id);
        return customPricing || product.prices.length > 0;
      });
      
      // Generate 1-5 line items per quote
      const numLineItems = Math.floor(Math.random() * 5) + 1;
      const selectedProducts = shuffleArray([...availableProducts]).slice(0, numLineItems);
      
      const lineItems = selectedProducts.map((product, lineIndex) => {
        const customPricing = customer.customProductPricing.find(cpp => cpp.productId === product.id);
        const pricing = customPricing?.prices[0] || product.prices[0];
        const quantity = Math.floor(Math.random() * 20) + 1;
        const unitPrice = customer.type === 'Retail' ? pricing.retail : pricing.consumer;
        
        return {
          id: `line-${quoteNumber}-${lineIndex + 1}`,
          description: product.name,
          productId: product.id,
          category: 'Product',
          quantity,
          unitPrice,
          discount: Math.random() > 0.8 ? Math.floor(Math.random() * 15) + 5 : 0, // 20% chance of discount
          totalPrice: quantity * unitPrice,
          taxable: true,
          sortOrder: lineIndex + 1
        };
      });
      
      // Calculate totals
      const subtotal = lineItems.reduce((sum, item) => sum + item.totalPrice, 0);
      const discountAmount = lineItems.reduce((sum, item) => sum + ((item.discount / 100) * item.quantity * item.unitPrice), 0);
      const taxAmount = (subtotal - discountAmount) * 0.15; // 15% VAT
      const total = subtotal - discountAmount + taxAmount;
      
      // Determine quote status based on age and randomness
      const daysSinceCreated = Math.floor((Date.now() - createdDate.getTime()) / (24 * 60 * 60 * 1000));
      let status: QuoteStatus;
      
      if (daysSinceCreated > 60) {
        status = Math.random() > 0.7 ? QuoteStatus.Archived : QuoteStatus.Rejected;
      } else if (daysSinceCreated > 30) {
        status = Math.random() > 0.5 ? QuoteStatus.Pending : QuoteStatus.Approved;
      } else if (daysSinceCreated > 7) {
        const rand = Math.random();
        if (rand > 0.8) status = QuoteStatus.Approved;
        else if (rand > 0.6) status = QuoteStatus.Pending;
        else status = QuoteStatus.Pending;
      } else {
        status = Math.random() > 0.3 ? QuoteStatus.Draft : QuoteStatus.Pending;
      }
      
      quotes.push({
        id: `quote-${quoteNumber}`,
        quoteNumber,
        customerId: customer.id,
        customerName: customer.name,
        subtotal,
        taxRate: 0.15,
        taxAmount,
        totalAmount: total,
        currency: 'ZAR',
        status,
        statusHistory: [],
        createdAt: createdDate,
        updatedAt: new Date(createdDate.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000),
        expiryDate: new Date(createdDate.getTime() + 30 * 24 * 60 * 60 * 1000),
        validUntil: new Date(createdDate.getTime() + 30 * 24 * 60 * 60 * 1000),
        lineItems,
        terms: customer.paymentTerm,
        notes: generateRandomNotes(customer.type),
        linkedInvoiceId: undefined,
        originalQuoteId: undefined,
        createdBy: 'system',
        lastModifiedBy: 'system',
        version: 1,
        isArchived: false
      });
    }
  });
  
  return quotes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

// Helper functions
function calculateCreditLimit(customerType: string): number {
  return customerType === 'Retail' ? Math.floor(Math.random() * 100000) + 50000 : Math.floor(Math.random() * 25000) + 10000;
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function generateRandomNotes(customerType: string): string {
  const retailNotes = [
    'Standard retail pricing applied',
    'Bulk discount available for orders over 50 units',
    'Free delivery on orders over R5000',
    'Net 30 payment terms',
    'Please confirm delivery address'
  ];
  
  const consumerNotes = [
    'Consumer pricing includes full warranty',
    'Free installation available',
    'Payment required on delivery',
    'Special promotion pricing',
    'Limited time offer'
  ];
  
  const notes = customerType === 'Retail' ? retailNotes : consumerNotes;
  return notes[Math.floor(Math.random() * notes.length)];
}

function generateRandomTags(customerType: string): string[] {
  const allTags = ['urgent', 'follow-up', 'bulk-order', 'new-customer', 'repeat-customer', 'high-value', 'negotiation'];
  const numTags = Math.floor(Math.random() * 3);
  return shuffleArray(allTags).slice(0, numTags);
}

/**
 * Load and transform all real data
 */
export async function loadTransformedData() {
  try {
    // These would normally be loaded from the data files
    // For now, we'll create the transformation functions that can be used
    // when the data is loaded in the API endpoints
    
    return {
      transformCustomersToBootstrap,
      transformProductsToCatalog,
      generateQuotesFromRealData
    };
  } catch (error) {
    console.error('Error loading real data:', error);
    throw new Error('Failed to load and transform real data');
  }
}