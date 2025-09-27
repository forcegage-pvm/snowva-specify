import type { Quote, QuoteLineItem } from '@/types/quotes/Quote';
import { QuoteStatus, QuoteStatusUtils } from '@/types/quotes/QuoteStatus';

/**
 * Mock quote line items for testing and development
 */
export const mockLineItems: QuoteLineItem[] = [
  {
    id: 'item-001',
    description: 'Professional Website Design',
    productId: 'prod-web-001',
    category: 'Web Development',
    quantity: 1,
    unitPrice: 2500.00,
    discount: 0,
    totalPrice: 2500.00,
    notes: 'Responsive design with modern UI/UX',
    taxable: true,
    sortOrder: 1
  },
  {
    id: 'item-002',
    description: 'API Development & Integration',
    productId: 'prod-api-001',
    category: 'Backend Development',
    quantity: 40,
    unitPrice: 85.00,
    discount: 0,
    totalPrice: 3400.00,
    notes: 'RESTful API with authentication',
    taxable: true,
    sortOrder: 2
  },
  {
    id: 'item-003',
    description: 'Database Design & Setup',
    productId: 'prod-db-001',
    category: 'Database',
    quantity: 20,
    unitPrice: 95.00,
    discount: 10,
    discountAmount: 190.00,
    totalPrice: 1710.00,
    notes: 'PostgreSQL with optimization',
    taxable: true,
    sortOrder: 3
  }
];

export const mockLineItemsSimple: QuoteLineItem[] = [
  {
    id: 'item-simple-001',
    description: 'Website Maintenance',
    category: 'Support',
    quantity: 1,
    unitPrice: 150.00,
    discount: 0,
    totalPrice: 150.00,
    taxable: true,
    sortOrder: 1
  }
];

export const mockLineItemsLarge: QuoteLineItem[] = [
  {
    id: 'item-large-001',
    description: 'Enterprise Software Development',
    productId: 'prod-enterprise-001',
    category: 'Custom Development',
    quantity: 500,
    unitPrice: 120.00,
    discount: 15,
    discountAmount: 9000.00,
    totalPrice: 51000.00,
    notes: 'Full-scale enterprise application',
    taxable: true,
    sortOrder: 1
  },
  {
    id: 'item-large-002',
    description: 'Infrastructure Setup',
    productId: 'prod-infra-001',
    category: 'DevOps',
    quantity: 80,
    unitPrice: 150.00,
    discount: 0,
    totalPrice: 12000.00,
    notes: 'AWS cloud infrastructure',
    taxable: true,
    sortOrder: 2
  },
  {
    id: 'item-large-003',
    description: 'Project Management',
    productId: 'prod-pm-001',
    category: 'Management',
    quantity: 200,
    unitPrice: 95.00,
    discount: 0,
    totalPrice: 19000.00,
    notes: 'Full project lifecycle management',
    taxable: true,
    sortOrder: 3
  }
];

/**
 * Mock quote data for testing and development
 */
export const mockQuotes: Quote[] = [
  {
    id: 'quote-001',
    quoteNumber: 'QUO-2024-001',
    customerId: 'cust-001',
    customerName: 'Acme Corporation',
    subtotal: 7610.00,
    taxRate: 0.20,
    taxAmount: 1522.00,
    totalAmount: 9132.00,
    currency: 'GBP',
    status: QuoteStatus.Draft,
    statusHistory: [{
      id: 'status-001',
      quoteId: 'quote-001',
      fromStatus: QuoteStatus.Draft,
      toStatus: QuoteStatus.Draft,
      changedBy: 'user-001',
      changedAt: new Date('2024-01-15T10:00:00Z'),
      reason: 'Initial creation'
    }],
    createdAt: new Date('2024-01-15T10:00:00Z'),
    updatedAt: new Date('2024-01-15T10:00:00Z'),
    expiryDate: new Date('2024-02-15T23:59:59Z'),
    validUntil: new Date('2024-02-15T23:59:59Z'),
    lineItems: mockLineItems,
    terms: 'Payment due within 30 days of invoice date.',
    notes: 'This quote includes all agreed specifications.',
    createdBy: 'user-001',
    lastModifiedBy: 'user-001',
    version: 1,
    isArchived: false
  },
  {
    id: 'quote-002',
    quoteNumber: 'QUO-2024-002',
    customerId: 'cust-002',
    customerName: 'Tech Innovations Ltd',
    subtotal: 150.00,
    taxRate: 0.20,
    taxAmount: 30.00,
    totalAmount: 180.00,
    currency: 'GBP',
    status: QuoteStatus.Pending,
    statusHistory: [
      {
        id: 'status-002-1',
        quoteId: 'quote-002',
        fromStatus: QuoteStatus.Draft,
        toStatus: QuoteStatus.Draft,
        changedBy: 'user-001',
        changedAt: new Date('2024-01-14T09:30:00Z'),
        reason: 'Initial creation'
      },
      {
        id: 'status-002-2',
        quoteId: 'quote-002',
        fromStatus: QuoteStatus.Draft,
        toStatus: QuoteStatus.Pending,
        changedBy: 'user-001',
        changedAt: new Date('2024-01-14T14:15:00Z'),
        reason: 'Sent to customer for review'
      }
    ],
    createdAt: new Date('2024-01-14T09:30:00Z'),
    updatedAt: new Date('2024-01-14T14:15:00Z'),
    expiryDate: new Date('2024-02-14T23:59:59Z'),
    validUntil: new Date('2024-02-14T23:59:59Z'),
    lineItems: mockLineItemsSimple,
    terms: 'Payment due within 30 days of invoice date.',
    notes: 'Monthly maintenance package.',
    createdBy: 'user-001',
    lastModifiedBy: 'user-001',
    version: 1,
    isArchived: false
  },
  {
    id: 'quote-003',
    quoteNumber: 'QUO-2024-003',
    customerId: 'cust-003',
    customerName: 'Global Systems Inc',
    subtotal: 82000.00,
    taxRate: 0.20,
    taxAmount: 16400.00,
    totalAmount: 98400.00,
    currency: 'GBP',
    status: QuoteStatus.Approved,
    statusHistory: [
      {
        id: 'status-003-1',
        quoteId: 'quote-003',
        fromStatus: QuoteStatus.Draft,
        toStatus: QuoteStatus.Draft,
        changedBy: 'user-001',
        changedAt: new Date('2024-01-10T08:00:00Z'),
        reason: 'Initial creation'
      },
      {
        id: 'status-003-2',
        quoteId: 'quote-003',
        fromStatus: QuoteStatus.Draft,
        toStatus: QuoteStatus.Pending,
        changedBy: 'user-001',
        changedAt: new Date('2024-01-11T16:30:00Z'),
        reason: 'Sent to customer'
      },
      {
        id: 'status-003-3',
        quoteId: 'quote-003',
        fromStatus: QuoteStatus.Pending,
        toStatus: QuoteStatus.Approved,
        changedBy: 'customer-003',
        changedAt: new Date('2024-01-13T11:45:00Z'),
        reason: 'Customer approved via email'
      }
    ],
    createdAt: new Date('2024-01-10T08:00:00Z'),
    updatedAt: new Date('2024-01-13T11:45:00Z'),
    expiryDate: new Date('2024-02-10T23:59:59Z'),
    validUntil: new Date('2024-02-10T23:59:59Z'),
    lineItems: mockLineItemsLarge,
    terms: 'Payment due within 30 days of invoice date. 50% deposit required before project start.',
    notes: 'Enterprise project with dedicated team allocation.',
    linkedInvoiceId: 'inv-001',
    createdBy: 'user-001',
    lastModifiedBy: 'user-001',
    version: 2,
    isArchived: false
  },
  {
    id: 'quote-004',
    quoteNumber: 'QUO-2024-004',
    customerId: 'cust-004',
    customerName: 'Startup Ventures',
    subtotal: 5000.00,
    taxRate: 0.20,
    taxAmount: 1000.00,
    totalAmount: 6000.00,
    currency: 'GBP',
    status: QuoteStatus.Rejected,
    statusHistory: [
      {
        id: 'status-004-1',
        quoteId: 'quote-004',
        fromStatus: QuoteStatus.Draft,
        toStatus: QuoteStatus.Draft,
        changedBy: 'user-002',
        changedAt: new Date('2024-01-12T13:20:00Z'),
        reason: 'Initial creation'
      },
      {
        id: 'status-004-2',
        quoteId: 'quote-004',
        fromStatus: QuoteStatus.Draft,
        toStatus: QuoteStatus.Pending,
        changedBy: 'user-002',
        changedAt: new Date('2024-01-12T15:45:00Z'),
        reason: 'Sent for customer review'
      },
      {
        id: 'status-004-3',
        quoteId: 'quote-004',
        fromStatus: QuoteStatus.Pending,
        toStatus: QuoteStatus.Rejected,
        changedBy: 'customer-004',
        changedAt: new Date('2024-01-14T09:15:00Z'),
        reason: 'Budget constraints',
        metadata: { 'rejection_reason': 'over_budget', 'requested_discount': '25%' }
      }
    ],
    createdAt: new Date('2024-01-12T13:20:00Z'),
    updatedAt: new Date('2024-01-14T09:15:00Z'),
    expiryDate: new Date('2024-02-12T23:59:59Z'),
    validUntil: new Date('2024-02-12T23:59:59Z'),
    lineItems: [
      {
        id: 'item-004-001',
        description: 'MVP Development',
        productId: 'prod-mvp-001',
        category: 'Development',
        quantity: 1,
        unitPrice: 5000.00,
        discount: 0,
        totalPrice: 5000.00,
        notes: 'Minimum viable product for startup',
        taxable: true,
        sortOrder: 1
      }
    ],
    terms: 'Payment due within 30 days of invoice date.',
    notes: 'Flexible payment options available for qualified startups.',
    createdBy: 'user-002',
    lastModifiedBy: 'user-002',
    version: 1,
    isArchived: false
  },
  {
    id: 'quote-005',
    quoteNumber: 'QUO-2024-005',
    customerId: 'cust-001',
    customerName: 'Acme Corporation',
    subtotal: 12500.00,
    taxRate: 0.20,
    taxAmount: 2500.00,
    totalAmount: 15000.00,
    currency: 'GBP',
    status: QuoteStatus.Archived,
    statusHistory: [
      {
        id: 'status-005-1',
        quoteId: 'quote-005',
        fromStatus: QuoteStatus.Draft,
        toStatus: QuoteStatus.Draft,
        changedBy: 'user-001',
        changedAt: new Date('2023-12-15T10:00:00Z'),
        reason: 'Initial creation'
      },
      {
        id: 'status-005-2',
        quoteId: 'quote-005',
        fromStatus: QuoteStatus.Draft,
        toStatus: QuoteStatus.Pending,
        changedBy: 'user-001',
        changedAt: new Date('2023-12-16T11:30:00Z'),
        reason: 'Sent for review'
      },
      {
        id: 'status-005-3',
        quoteId: 'quote-005',
        fromStatus: QuoteStatus.Pending,
        toStatus: QuoteStatus.Archived,
        changedBy: 'system',
        changedAt: new Date('2024-01-16T00:00:00Z'),
        reason: 'Auto-expired after 30 days'
      }
    ],
    createdAt: new Date('2023-12-15T10:00:00Z'),
    updatedAt: new Date('2024-01-16T00:00:00Z'),
    expiryDate: new Date('2024-01-15T23:59:59Z'),
    validUntil: new Date('2024-01-15T23:59:59Z'),
    lineItems: [
      {
        id: 'item-005-001',
        description: 'E-commerce Platform',
        productId: 'prod-ecom-001',
        category: 'E-commerce',
        quantity: 1,
        unitPrice: 12500.00,
        discount: 0,
        totalPrice: 12500.00,
        notes: 'Full e-commerce solution with payment integration',
        taxable: true,
        sortOrder: 1
      }
    ],
    terms: 'Payment due within 30 days of invoice date.',
    notes: 'Previous quote for e-commerce project.',
    originalQuoteId: 'quote-001',
    createdBy: 'user-001',
    lastModifiedBy: 'system',
    version: 1,
    isArchived: false
  }
];

/**
 * Generate additional mock quotes for testing large datasets
 */
export function generateMockQuotes(count: number = 100): Quote[] {
  const statuses: QuoteStatus[] = [
    QuoteStatus.Draft,
    QuoteStatus.Pending, 
    QuoteStatus.Approved,
    QuoteStatus.Rejected,
    QuoteStatus.Archived
  ];
  const companies = [
    'Tech Solutions Ltd', 'Digital Innovations', 'Creative Agency Co', 'Software Systems Inc',
    'Web Design Pro', 'Data Analytics Corp', 'Mobile App Studios', 'Cloud Computing Ltd'
  ];
  
  const products = [
    { name: 'Web Development', price: 85.00, category: 'Development' },
    { name: 'Mobile App Development', price: 120.00, category: 'Mobile' },
    { name: 'UI/UX Design', price: 95.00, category: 'Design' },
    { name: 'Database Setup', price: 75.00, category: 'Database' },
    { name: 'API Integration', price: 100.00, category: 'Integration' },
    { name: 'Testing & QA', price: 65.00, category: 'Quality Assurance' }
  ];

  const quotes: Quote[] = [];
  
  for (let i = 6; i <= count + 5; i++) {
    const createdDate = new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000); // Last 90 days
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const company = companies[Math.floor(Math.random() * companies.length)];
    
    // Generate 1-4 line items
    const itemCount = Math.floor(Math.random() * 4) + 1;
    const lineItems: QuoteLineItem[] = [];
    let subtotal = 0;
    
    for (let j = 0; j < itemCount; j++) {
      const product = products[Math.floor(Math.random() * products.length)];
      const quantity = Math.floor(Math.random() * 50) + 1;
      const unitPrice = product.price + (Math.random() - 0.5) * 20; // ±10 variance
      const discount = Math.random() > 0.7 ? Math.floor(Math.random() * 15) : 0; // 30% chance of discount
      const discountAmount = (unitPrice * quantity * discount) / 100;
      const totalPrice = (unitPrice * quantity) - discountAmount;
      
      lineItems.push({
        id: `item-${i.toString().padStart(3, '0')}-${(j + 1).toString().padStart(3, '0')}`,
        description: product.name,
        productId: `prod-${product.category.toLowerCase().replace(/\s+/g, '-')}-001`,
        category: product.category,
        quantity,
        unitPrice: Math.round(unitPrice * 100) / 100,
        discount: discount || undefined,
        discountAmount: discountAmount > 0 ? Math.round(discountAmount * 100) / 100 : undefined,
        totalPrice: Math.round(totalPrice * 100) / 100,
        notes: Math.random() > 0.7 ? 'Additional requirements discussed' : undefined,
        taxable: true,
        sortOrder: j + 1
      });
      
      subtotal += totalPrice;
    }
    
    subtotal = Math.round(subtotal * 100) / 100;
    const taxAmount = Math.round(subtotal * 0.20 * 100) / 100;
    const totalAmount = subtotal + taxAmount;
    
    const expiryDate = new Date(createdDate.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    quotes.push({
      id: `quote-${i.toString().padStart(3, '0')}`,
      quoteNumber: `QUO-2024-${i.toString().padStart(3, '0')}`,
      customerId: `cust-${Math.floor(Math.random() * 20) + 1}`,
      customerName: company,
      subtotal,
      taxRate: 0.20,
      taxAmount,
      totalAmount,
      currency: 'GBP',
      status,
      statusHistory: [{
        id: `status-${i}-1`,
        quoteId: `quote-${i.toString().padStart(3, '0')}`,
        fromStatus: status,
        toStatus: status,
        changedBy: `user-${Math.floor(Math.random() * 3) + 1}`,
        changedAt: createdDate,
        reason: 'Initial creation'
      }],
      createdAt: createdDate,
      updatedAt: new Date(createdDate.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000),
      expiryDate,
      validUntil: expiryDate,
      lineItems,
      terms: 'Payment due within 30 days of invoice date.',
      notes: Math.random() > 0.8 ? 'Special customer requirements noted.' : '',
      linkedInvoiceId: status === QuoteStatus.Approved && Math.random() > 0.5 ? `inv-${i}` : undefined,
      createdBy: `user-${Math.floor(Math.random() * 3) + 1}`,
      lastModifiedBy: `user-${Math.floor(Math.random() * 3) + 1}`,
      version: 1,
      isArchived: Math.random() > 0.95 // 5% chance of being archived
    });
  }
  
  return quotes;
}

/**
 * Get all mock quotes including generated ones
 */
export function getAllMockQuotes(includeGenerated: boolean = true, generatedCount: number = 100): Quote[] {
  if (includeGenerated) {
    return [...mockQuotes, ...generateMockQuotes(generatedCount)];
  }
  return mockQuotes;
}

/**
 * Mock quote service with in-memory data store
 */
export class MockQuoteService {
  private quotes: Quote[] = getAllMockQuotes();
  
  /**
   * Get all quotes with filtering and pagination
   */
  async getQuotes(filters: {
    page?: number;
    pageSize?: number;
    status?: QuoteStatus[];
    search?: string;
    customerId?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    includeArchived?: boolean;
  } = {}) {
    let filteredQuotes = [...this.quotes];
    
    // Apply filters
    if (!filters.includeArchived) {
      filteredQuotes = filteredQuotes.filter(q => !q.isArchived);
    }
    
    if (filters.status && filters.status.length > 0) {
      filteredQuotes = filteredQuotes.filter(q => filters.status!.includes(q.status));
    }
    
    if (filters.customerId) {
      filteredQuotes = filteredQuotes.filter(q => q.customerId === filters.customerId);
    }
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredQuotes = filteredQuotes.filter(q => 
        q.quoteNumber.toLowerCase().includes(searchLower) ||
        q.customerName.toLowerCase().includes(searchLower) ||
        q.notes.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply sorting
    const sortBy = filters.sortBy || 'createdAt';
    const sortOrder = filters.sortOrder || 'desc';
    
    filteredQuotes.sort((a, b) => {
      let aVal: any = (a as any)[sortBy];
      let bVal: any = (b as any)[sortBy];
      
      if (aVal instanceof Date) aVal = aVal.getTime();
      if (bVal instanceof Date) bVal = bVal.getTime();
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
    
    // Apply pagination
    const page = filters.page || 1;
    const pageSize = filters.pageSize || 25;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    
    return {
      quotes: filteredQuotes.slice(startIndex, endIndex),
      totalCount: filteredQuotes.length,
      page,
      pageSize,
      totalPages: Math.ceil(filteredQuotes.length / pageSize)
    };
  }
  
  /**
   * Get quote by ID
   */
  async getQuoteById(id: string): Promise<Quote | null> {
    return this.quotes.find(q => q.id === id) || null;
  }
  
  /**
   * Create new quote
   */
  async createQuote(quoteData: Partial<Quote>): Promise<Quote> {
    const id = `quote-${Date.now()}`;
    const quoteNumber = `QUO-2024-${String(this.quotes.length + 1).padStart(3, '0')}`;
    
    const newQuote: Quote = {
      id,
      quoteNumber,
      customerId: quoteData.customerId || '',
      customerName: quoteData.customerName || '',
      subtotal: quoteData.subtotal || 0,
      taxRate: quoteData.taxRate || 0.20,
      taxAmount: quoteData.taxAmount || 0,
      totalAmount: quoteData.totalAmount || 0,
      currency: quoteData.currency || 'GBP',
      status: QuoteStatus.Draft,
      statusHistory: [{
        id: `status-${id}-1`,
        quoteId: id,
        fromStatus: QuoteStatus.Draft,
        toStatus: QuoteStatus.Draft,
        changedBy: quoteData.createdBy || 'user-001',
        changedAt: new Date(),
        reason: 'Initial creation'
      }],
      createdAt: new Date(),
      updatedAt: new Date(),
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      lineItems: quoteData.lineItems || [],
      terms: quoteData.terms || 'Payment due within 30 days of invoice date.',
      notes: quoteData.notes || '',
      createdBy: quoteData.createdBy || 'user-001',
      lastModifiedBy: quoteData.createdBy || 'user-001',
      version: 1,
      isArchived: false,
      ...quoteData
    };
    
    this.quotes.push(newQuote);
    return newQuote;
  }
  
  /**
   * Update existing quote
   */
  async updateQuote(id: string, updates: Partial<Quote>): Promise<Quote | null> {
    const index = this.quotes.findIndex(q => q.id === id);
    if (index === -1) return null;
    
    const updatedQuote = {
      ...this.quotes[index],
      ...updates,
      updatedAt: new Date(),
      version: this.quotes[index].version + 1
    };
    
    this.quotes[index] = updatedQuote;
    return updatedQuote;
  }
  
  /**
   * Delete quote
   */
  async deleteQuote(id: string): Promise<boolean> {
    const index = this.quotes.findIndex(q => q.id === id);
    if (index === -1) return false;
    
    this.quotes.splice(index, 1);
    return true;
  }
  
  /**
   * Update quote status
   */
  async updateQuoteStatus(id: string, newStatus: QuoteStatus, reason?: string, changedBy: string = 'user-001'): Promise<Quote | null> {
    const quote = await this.getQuoteById(id);
    if (!quote) return null;
    
    // Validate status transition
    if (!QuoteStatusUtils.canTransition(quote.status, newStatus)) {
      throw new Error(`Invalid status transition from ${quote.status} to ${newStatus}`);
    }
    
    const statusChange = {
      id: `status-${id}-${Date.now()}`,
      quoteId: id,
      fromStatus: quote.status,
      toStatus: newStatus,
      changedBy,
      changedAt: new Date(),
      reason
    };
    
    return this.updateQuote(id, {
      status: newStatus,
      statusHistory: [...quote.statusHistory, statusChange]
    });
  }
}