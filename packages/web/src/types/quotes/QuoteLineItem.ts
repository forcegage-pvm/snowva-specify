/**
 * Individual line item within a quote
 */
export interface QuoteLineItem {
  // Identity
  id: string;                   // Unique identifier within the quote
  
  // Product/Service Information
  description: string;          // Product or service description
  productId?: string;          // Optional reference to product catalog
  category?: string;           // Product category for grouping
  
  // Pricing Information
  quantity: number;            // Quantity of items
  unitPrice: number;           // Price per unit (stored as cents)
  discount?: number;           // Discount percentage (0-100)
  discountAmount?: number;     // Calculated discount amount (stored as cents)
  totalPrice: number;          // Line total after discount (stored as cents)
  
  // Metadata
  notes?: string;              // Additional notes for this line item
  taxable: boolean;            // Whether this item is subject to tax
  sortOrder: number;           // Display order within the quote
}

/**
 * Line item creation request (without calculated fields)
 */
export interface CreateLineItemRequest {
  description: string;
  productId?: string;
  category?: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  notes?: string;
  taxable?: boolean;
}

/**
 * Line item update request
 */
export interface UpdateLineItemRequest extends Partial<CreateLineItemRequest> {
  id: string;
}

/**
 * Line item summary for calculations
 */
export interface LineItemSummary {
  subtotal: number;            // Sum of all line totals before tax
  totalDiscount: number;       // Total discount amount applied
  taxableAmount: number;       // Amount subject to tax
  itemCount: number;           // Total number of line items
}

/**
 * Utility functions for line item calculations
 */
export class QuoteLineItemUtils {
  /**
   * Calculate line item total price including discount
   */
  static calculateLineTotal(quantity: number, unitPrice: number, discount: number = 0): number {
    const subtotal = quantity * unitPrice;
    const discountAmount = (subtotal * discount) / 100;
    return subtotal - discountAmount;
  }

  /**
   * Calculate discount amount
   */
  static calculateDiscountAmount(quantity: number, unitPrice: number, discount: number): number {
    const subtotal = quantity * unitPrice;
    return (subtotal * discount) / 100;
  }

  /**
   * Calculate summary for all line items
   */
  static calculateSummary(lineItems: QuoteLineItem[]): LineItemSummary {
    let subtotal = 0;
    let totalDiscount = 0;
    let taxableAmount = 0;

    lineItems.forEach(item => {
      subtotal += item.totalPrice;
      totalDiscount += item.discountAmount || 0;
      
      if (item.taxable) {
        taxableAmount += item.totalPrice;
      }
    });

    return {
      subtotal,
      totalDiscount,
      taxableAmount,
      itemCount: lineItems.length
    };
  }

  /**
   * Validate line item data
   */
  static validateLineItem(item: CreateLineItemRequest): string[] {
    const errors: string[] = [];

    if (!item.description?.trim()) {
      errors.push('Description is required');
    }

    if (item.quantity <= 0) {
      errors.push('Quantity must be greater than 0');
    }

    if (item.unitPrice < 0) {
      errors.push('Unit price cannot be negative');
    }

    if (item.discount && (item.discount < 0 || item.discount > 100)) {
      errors.push('Discount must be between 0 and 100 percent');
    }

    return errors;
  }

  /**
   * Sort line items by sort order
   */
  static sortLineItems(lineItems: QuoteLineItem[]): QuoteLineItem[] {
    return [...lineItems].sort((a, b) => a.sortOrder - b.sortOrder);
  }

  /**
   * Format price for display (convert from cents)
   */
  static formatPrice(priceInCents: number, currency: string = 'GBP'): string {
    const price = priceInCents / 100;
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency
    }).format(price);
  }
}