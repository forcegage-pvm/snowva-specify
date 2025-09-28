import type { Quote, QuoteLineItem } from '@/types/quotes/Quote';
import { QuoteStatus } from '@/types/quotes/QuoteStatus';
import { Decimal } from 'decimal.js';

/**
 * Configuration for financial calculations
 */
export const CALCULATION_CONFIG = {
  // Decimal precision for financial calculations
  DECIMAL_PLACES: 2,
  
  // Rounding mode (ROUND_HALF_UP is standard for financial calculations)
  ROUNDING_MODE: Decimal.ROUND_HALF_UP,
  
  // Default currency settings
  DEFAULT_CURRENCY: 'GBP',
  DEFAULT_TAX_RATE: 0.20, // 20% VAT for UK
  
  // Validation limits
  MAX_LINE_ITEMS: 100,
  MAX_QUANTITY: 99999.99,
  MAX_UNIT_PRICE: 999999.99,
  MAX_DISCOUNT_PERCENTAGE: 100,
  
  // Business rules
  QUOTE_VALIDITY_DAYS: 30,
  MIN_QUOTE_VALUE: 0.01
};

/**
 * Financial calculation utilities using Decimal.js for precision
 */
export class QuoteCalculations {
  /**
   * Configure Decimal.js with our settings
   */
  static {
    Decimal.set({
      precision: 10,
      rounding: CALCULATION_CONFIG.ROUNDING_MODE,
      toExpNeg: -7,
      toExpPos: 21
    });
  }
  
  /**
   * Calculate line item total with discount
   */
  static calculateLineItemTotal(
    quantity: number,
    unitPrice: number,
    discountPercentage: number = 0
  ): {
    subtotal: number;
    discountAmount: number;
    total: number;
  } {
    const qty = new Decimal(quantity);
    const price = new Decimal(unitPrice);
    const discount = new Decimal(discountPercentage);
    
    const subtotal = qty.mul(price);
    const discountAmount = subtotal.mul(discount.div(100));
    const total = subtotal.sub(discountAmount);
    
    return {
      subtotal: subtotal.toDecimalPlaces(CALCULATION_CONFIG.DECIMAL_PLACES).toNumber(),
      discountAmount: discountAmount.toDecimalPlaces(CALCULATION_CONFIG.DECIMAL_PLACES).toNumber(),
      total: total.toDecimalPlaces(CALCULATION_CONFIG.DECIMAL_PLACES).toNumber()
    };
  }
  
  /**
   * Calculate quote totals from line items
   */
  static calculateQuoteTotals(
    lineItems: QuoteLineItem[],
    taxRate: number = CALCULATION_CONFIG.DEFAULT_TAX_RATE
  ): {
    subtotal: number;
    taxableSubtotal: number;
    taxAmount: number;
    totalAmount: number;
    totalDiscount: number;
  } {
    let subtotal = new Decimal(0);
    let taxableSubtotal = new Decimal(0);
    let totalDiscount = new Decimal(0);
    
    lineItems.forEach(item => {
      const itemTotal = new Decimal(item.totalPrice || item.total);
      const itemDiscount = new Decimal(item.discountAmount || 0);
      
      subtotal = subtotal.add(itemTotal);
      totalDiscount = totalDiscount.add(itemDiscount);
      
      if (item.taxable) {
        taxableSubtotal = taxableSubtotal.add(itemTotal);
      }
    });
    
    const tax = new Decimal(taxRate);
    const taxAmount = taxableSubtotal.mul(tax);
    const totalAmount = subtotal.add(taxAmount);
    
    return {
      subtotal: subtotal.toDecimalPlaces(CALCULATION_CONFIG.DECIMAL_PLACES).toNumber(),
      taxableSubtotal: taxableSubtotal.toDecimalPlaces(CALCULATION_CONFIG.DECIMAL_PLACES).toNumber(),
      taxAmount: taxAmount.toDecimalPlaces(CALCULATION_CONFIG.DECIMAL_PLACES).toNumber(),
      totalAmount: totalAmount.toDecimalPlaces(CALCULATION_CONFIG.DECIMAL_PLACES).toNumber(),
      totalDiscount: totalDiscount.toDecimalPlaces(CALCULATION_CONFIG.DECIMAL_PLACES).toNumber()
    };
  }
  
  /**
   * Recalculate entire quote with updated line items
   */
  static recalculateQuote(
    quote: Quote,
    lineItems?: QuoteLineItem[],
    taxRate?: number
  ): Partial<Quote> {
    const items = lineItems || quote.lineItems;
    const rate = taxRate !== undefined ? taxRate : quote.taxRate;
    
    // Recalculate each line item
    const calculatedLineItems = items.map(item => {
      const calc = this.calculateLineItemTotal(
        item.quantity,
        item.unitPrice,
        item.discount
      );
      
      return {
        ...item,
        discountAmount: calc.discountAmount,
        totalPrice: calc.total
      };
    });
    
    // Calculate quote totals
    const totals = this.calculateQuoteTotals(calculatedLineItems, rate);
    
    return {
      lineItems: calculatedLineItems,
      subtotal: totals.subtotal,
      taxRate: rate,
      taxAmount: totals.taxAmount,
      totalAmount: totals.totalAmount
    };
  }
  
  /**
   * Validate financial calculations
   */
  static validateCalculations(quote: Quote): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    
    try {
      // Recalculate totals
      const recalculated = this.recalculateQuote(quote);
      
      // Check subtotal
      const expectedSubtotal = recalculated.subtotal!;
      const actualSubtotal = quote.subtotal;
      
      if (Math.abs(expectedSubtotal - actualSubtotal) > 0.01) {
        errors.push(`Subtotal mismatch: expected ${expectedSubtotal}, got ${actualSubtotal}`);
      }
      
      // Check tax amount
      const expectedTax = recalculated.taxAmount!;
      const actualTax = quote.taxAmount;
      
      if (Math.abs(expectedTax - actualTax) > 0.01) {
        errors.push(`Tax amount mismatch: expected ${expectedTax}, got ${actualTax}`);
      }
      
      // Check total amount
      const expectedTotal = recalculated.totalAmount!;
      const actualTotal = quote.totalAmount;
      
      if (Math.abs(expectedTotal - actualTotal) > 0.01) {
        errors.push(`Total amount mismatch: expected ${expectedTotal}, got ${actualTotal}`);
      }
      
      // Validate line items
      quote.lineItems.forEach((item, index) => {
        const calc = this.calculateLineItemTotal(
          item.quantity,
          item.unitPrice,
          item.discount
        );
        
        if (Math.abs(calc.total - (item.totalPrice || item.total)) > 0.01) {
          errors.push(`Line item ${index + 1} total mismatch: expected ${calc.total}, got ${item.totalPrice || item.total}`);
        }
        
        if (item.discountAmount && Math.abs(calc.discountAmount - item.discountAmount) > 0.01) {
          errors.push(`Line item ${index + 1} discount mismatch: expected ${calc.discountAmount}, got ${item.discountAmount}`);
        }
      });
      
    } catch (error) {
      errors.push(`Calculation validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  /**
   * Calculate discount percentage from amounts
   */
  static calculateDiscountPercentage(
    originalAmount: number,
    discountAmount: number
  ): number {
    if (originalAmount === 0) return 0;
    
    const original = new Decimal(originalAmount);
    const discount = new Decimal(discountAmount);
    
    return discount.div(original).mul(100)
      .toDecimalPlaces(CALCULATION_CONFIG.DECIMAL_PLACES)
      .toNumber();
  }
  
  /**
   * Apply global discount to quote
   */
  static applyGlobalDiscount(
    quote: Quote,
    discountPercentage: number,
    applyToTaxableOnly: boolean = false
  ): Partial<Quote> {
    if (discountPercentage <= 0 || discountPercentage > 100) {
      throw new Error('Discount percentage must be between 0 and 100');
    }
    
    const discount = new Decimal(discountPercentage);
    
    const updatedLineItems = quote.lineItems.map(item => {
      if (applyToTaxableOnly && !item.taxable) {
        return item; // Skip non-taxable items
      }
      
      const currentDiscount = new Decimal(item.discount || 0);
      const additionalDiscount = discount;
      
      // Apply compound discount: new_price = original * (1 - d1/100) * (1 - d2/100)
      const combinedDiscountFactor = new Decimal(1)
        .sub(currentDiscount.div(100))
        .mul(new Decimal(1).sub(additionalDiscount.div(100)));
      
      const newPrice = new Decimal(item.unitPrice)
        .mul(new Decimal(item.quantity))
        .mul(combinedDiscountFactor);
      
      const totalDiscount = new Decimal(item.unitPrice)
        .mul(new Decimal(item.quantity))
        .sub(newPrice);
      
      const newDiscountPercentage = this.calculateDiscountPercentage(
        item.unitPrice * item.quantity,
        totalDiscount.toNumber()
      );
      
      return {
        ...item,
        discount: newDiscountPercentage,
        discountAmount: totalDiscount.toDecimalPlaces(CALCULATION_CONFIG.DECIMAL_PLACES).toNumber(),
        totalPrice: newPrice.toDecimalPlaces(CALCULATION_CONFIG.DECIMAL_PLACES).toNumber()
      };
    });
    
    return this.recalculateQuote(quote, updatedLineItems);
  }
  
  /**
   * Calculate profit margin (if cost prices are available)
   */
  static calculateProfitMargin(
    sellingPrice: number,
    costPrice: number
  ): {
    profit: number;
    marginPercentage: number;
    markupPercentage: number;
  } {
    const selling = new Decimal(sellingPrice);
    const cost = new Decimal(costPrice);
    
    const profit = selling.sub(cost);
    const marginPercentage = cost.isZero() ? new Decimal(100) : profit.div(selling).mul(100);
    const markupPercentage = cost.isZero() ? new Decimal(0) : profit.div(cost).mul(100);
    
    return {
      profit: profit.toDecimalPlaces(CALCULATION_CONFIG.DECIMAL_PLACES).toNumber(),
      marginPercentage: marginPercentage.toDecimalPlaces(CALCULATION_CONFIG.DECIMAL_PLACES).toNumber(),
      markupPercentage: markupPercentage.toDecimalPlaces(CALCULATION_CONFIG.DECIMAL_PLACES).toNumber()
    };
  }
}

/**
 * Quote analytics and statistics
 */
export class QuoteAnalytics {
  /**
   * Calculate conversion rate from quotes to invoices
   */
  static calculateConversionRate(quotes: Quote[]): number {
    const totalQuotes = quotes.length;
    const convertedQuotes = quotes.filter(q => q.status === QuoteStatus.Converted || q.linkedInvoiceId).length;
    
    if (totalQuotes === 0) return 0;
    
    return new Decimal(convertedQuotes)
      .div(totalQuotes)
      .mul(100)
      .toDecimalPlaces(CALCULATION_CONFIG.DECIMAL_PLACES)
      .toNumber();
  }
  
  /**
   * Calculate average quote value
   */
  static calculateAverageQuoteValue(quotes: Quote[]): number {
    if (quotes.length === 0) return 0;
    
    const total = quotes.reduce((sum, quote) => {
      return sum.add(new Decimal(quote.totalAmount));
    }, new Decimal(0));
    
    return total.div(quotes.length)
      .toDecimalPlaces(CALCULATION_CONFIG.DECIMAL_PLACES)
      .toNumber();
  }
  
  /**
   * Group quotes by status with totals
   */
  static groupByStatus(quotes: Quote[]): Record<QuoteStatus, {
    count: number;
    totalValue: number;
    percentage: number;
  }> {
    const total = quotes.length;
    const groups = quotes.reduce((acc, quote) => {
      const status = quote.status as string;
      if (!acc[status]) {
        acc[status] = { count: 0, totalValue: new Decimal(0) };
      }
      
      acc[status].count++;
      acc[status].totalValue = acc[status].totalValue.add(new Decimal(quote.totalAmount));
      
      return acc;
    }, {} as Record<string, { count: number; totalValue: Decimal }>);
    
    // Convert to final format with percentages
    const result = {} as Record<QuoteStatus, { count: number; totalValue: number; percentage: number }>;
    
    Object.entries(groups).forEach(([status, data]) => {
      result[status as QuoteStatus] = {
        count: data.count,
        totalValue: data.totalValue.toDecimalPlaces(CALCULATION_CONFIG.DECIMAL_PLACES).toNumber(),
        percentage: total > 0 ? new Decimal(data.count).div(total).mul(100).toDecimalPlaces(1).toNumber() : 0
      };
    });
    
    return result;
  }
  
  /**
   * Calculate time-based metrics
   */
  static calculateTimeMetrics(quotes: Quote[]): {
    averageDaysToApproval: number;
    averageDaysToExpiry: number;
    expiringSoon: Quote[]; // Expiring in next 7 days
  } {
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    // Approved quotes with approval time
    const approvedQuotes = quotes.filter(q => q.status === QuoteStatus.Approved || q.status === QuoteStatus.Converted);
    const approvalTimes = approvedQuotes
      .map(q => {
        const approvalChange = q.statusHistory
          .find(h => h.toStatus === QuoteStatus.Approved || h.toStatus === QuoteStatus.Converted);
        
        if (approvalChange) {
          const timeDiff = approvalChange.changedAt.getTime() - q.createdAt.getTime();
          return timeDiff / (1000 * 60 * 60 * 24); // Convert to days
        }
        return null;
      })
      .filter(time => time !== null) as number[];
    
    const averageDaysToApproval = approvalTimes.length > 0
      ? approvalTimes.reduce((sum, days) => sum + days, 0) / approvalTimes.length
      : 0;
    
    // Expiry calculations
    const activeQuotes = quotes.filter(q => 
      q.status !== QuoteStatus.Expired &&
      q.status !== QuoteStatus.Archived &&
      q.status !== QuoteStatus.Rejected
    );
    
    const expiryTimes = activeQuotes.map(q => {
      const timeDiff = q.expiryDate.getTime() - q.createdAt.getTime();
      return timeDiff / (1000 * 60 * 60 * 24); // Convert to days
    });
    
    const averageDaysToExpiry = expiryTimes.length > 0
      ? expiryTimes.reduce((sum, days) => sum + days, 0) / expiryTimes.length
      : 0;
    
    const expiringSoon = activeQuotes.filter(q => 
      q.expiryDate <= sevenDaysFromNow && q.expiryDate > now
    );
    
    return {
      averageDaysToApproval: Math.round(averageDaysToApproval * 100) / 100,
      averageDaysToExpiry: Math.round(averageDaysToExpiry * 100) / 100,
      expiringSoon
    };
  }
}

/**
 * Currency and formatting utilities
 */
export class QuoteFormatting {
  /**
   * Format currency amount
   */
  static formatCurrency(
    amount: number,
    currency: string = CALCULATION_CONFIG.DEFAULT_CURRENCY,
    locale: string = 'en-GB'
  ): string {
    try {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        minimumFractionDigits: CALCULATION_CONFIG.DECIMAL_PLACES,
        maximumFractionDigits: CALCULATION_CONFIG.DECIMAL_PLACES
      }).format(amount);
    } catch (error) {
      // Fallback for unsupported currencies/locales
      return `${currency} ${amount.toFixed(CALCULATION_CONFIG.DECIMAL_PLACES)}`;
    }
  }
  
  /**
   * Format percentage
   */
  static formatPercentage(value: number, decimalPlaces: number = 1): string {
    return `${value.toFixed(decimalPlaces)}%`;
  }
  
  /**
   * Format quantity (remove unnecessary decimals)
   */
  static formatQuantity(quantity: number): string {
    // Remove trailing zeros after decimal point
    return quantity % 1 === 0 ? quantity.toString() : quantity.toFixed(2).replace(/\.?0+$/, '');
  }
  
  /**
   * Parse currency string to number
   */
  static parseCurrency(currencyString: string): number {
    // Remove currency symbols, spaces, and commas
    const cleaned = currencyString.replace(/[^\d.-]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }
}

// Export default
export default QuoteCalculations;