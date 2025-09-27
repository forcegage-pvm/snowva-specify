/**
 * Real data loader for transforming actual business data
 * into our application format
 */

import { promises as fs } from 'fs';
import path from 'path';
import { 
  transformCustomersToBootstrap, 
  transformProductsToCatalog, 
  generateQuotesFromRealData 
} from './dataTransformation';

// Cache for loaded data to avoid repeated file I/O
let dataCache: {
  customers?: any;
  products?: any;
  invoices?: any;
  payments?: any;
  lastLoaded?: number;
} = {};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Load real data from JSON files with caching
 */
async function loadRealData() {
  const now = Date.now();
  
  // Return cached data if still fresh
  if (dataCache.lastLoaded && (now - dataCache.lastLoaded) < CACHE_DURATION) {
    return dataCache;
  }

  try {
    const dataDir = path.join(process.cwd(), '../../data/current');
    
    const [customersData, productsData, invoicesData, paymentsData] = await Promise.all([
      fs.readFile(path.join(dataDir, 'customers.json'), 'utf-8').then(JSON.parse),
      fs.readFile(path.join(dataDir, 'products.json'), 'utf-8').then(JSON.parse),
      fs.readFile(path.join(dataDir, 'invoices.json'), 'utf-8').then(JSON.parse),
      fs.readFile(path.join(dataDir, 'payments.json'), 'utf-8').then(JSON.parse)
    ]);

    // Update cache
    dataCache = {
      customers: customersData,
      products: productsData,
      invoices: invoicesData,
      payments: paymentsData,
      lastLoaded: now
    };

    return dataCache;
  } catch (error) {
    console.error('Failed to load real data files:', error);
    
    // Return mock data if files can't be loaded
    return getMockData();
  }
}

/**
 * Fallback mock data if real data can't be loaded
 */
function getMockData() {
  return {
    customers: {
      "mock_customer_1": {
        id: "mock_customer_1",
        name: "Mock Customer Ltd",
        type: "Retail" as const,
        addresses: [{
          id: "addr_mock_1",
          type: "billing",
          isPrimary: true,
          addressLine1: "123 Main Street",
          addressLine2: "City, 12345",
          country: "South Africa"
        }],
        vatNumber: "VAT123456789",
        legalEntityName: "Mock Customer Ltd",
        paymentTerm: "30 Days",
        customProductPricing: []
      }
    },
    products: {
      products: {
        "mock_product_1": {
          id: "mock_product_1",
          itemCode: "MOCK001",
          name: "Mock Product",
          description: "A mock product for testing",
          prices: [{
            id: "price_mock_1",
            effectiveDate: "2025-01-01T02:00:00Z",
            retail: 100,
            consumer: 150
          }],
          imageUrl: null,
          ecommerceLink: null
        }
      }
    },
    invoices: [],
    payments: []
  };
}

/**
 * Get transformed bootstrap data for quote composer
 */
export async function getRealBootstrapData() {
  try {
    const data = await loadRealData();
    
    if (!data.customers || !data.products) {
      throw new Error('Required data not available');
    }

    return {
      customers: transformCustomersToBootstrap(data.customers),
      catalog: transformProductsToCatalog(data.products),
      defaultVatRate: 0.15, // South Africa VAT rate
      maxLineItems: 50
    };
  } catch (error) {
    console.error('Error getting real bootstrap data:', error);
    
    // Fallback to mock data
    const mockData = getMockData();
    return {
      customers: transformCustomersToBootstrap(mockData.customers),
      catalog: transformProductsToCatalog(mockData.products),
      defaultVatRate: 0.15,
      maxLineItems: 50
    };
  }
}

/**
 * Get generated quotes based on real customer and product data
 */
export async function getRealQuotesData() {
  try {
    const data = await loadRealData();
    
    if (!data.customers || !data.products || !data.invoices) {
      throw new Error('Required data not available');
    }

    return generateQuotesFromRealData(data.customers, data.products, data.invoices);
  } catch (error) {
    console.error('Error generating real quotes data:', error);
    
    // Fallback to generating quotes from mock data
    const mockData = getMockData();
    return generateQuotesFromRealData(mockData.customers, mockData.products, mockData.invoices);
  }
}

/**
 * Get all real data (useful for other endpoints)
 */
export async function getAllRealData() {
  return loadRealData();
}

/**
 * Clear the data cache (useful for development/testing)
 */
export function clearDataCache() {
  dataCache = {};
}