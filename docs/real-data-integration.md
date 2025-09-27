# Real Data Integration

This document explains how we've integrated real business data from `data/current/` into our application.

## Data Files Available

- **`customers.json`** - Customer records with addresses, VAT numbers, payment terms, and custom pricing  
- **`products.json`** - Product catalog with pricing (retail/consumer), item codes, and descriptions
- **`invoices.json`** - Historical invoice data with line items, totals, and customer references
- **`payments.json`** - Payment records with allocations to invoices

## Data Transformation

### Customer Data → Bootstrap API
Real customer data is transformed for the quote composer:

```typescript
// Raw format
{
  "4_seasons_winkel": {
    "id": "4_seasons_winkel",
    "name": "4 Seasons Winkel",
    "type": "Retail",
    "vatNumber": "4520267123",
    "paymentTerm": "30 Days",
    "customProductPricing": [...]
  }
}

// Transformed format
{
  "id": "4_seasons_winkel",
  "displayName": "4 Seasons Winkel",
  "customerType": "Business", // "Retail" → "Business"
  "creditLimit": 75000, // Calculated based on type
  "branches": [{
    "id": "branch-4_seasons_winkel",
    "displayName": "3 Sarel Cilliers Street", // From address
    "vatNumber": "4520267123"
  }]
}
```

### Product Data → Catalog API
Product pricing is transformed with latest effective prices:

```typescript
// Raw format
{
  "prod_snowva": {
    "id": "prod_snowva",
    "name": "Snowva",
    "prices": [{
      "effectiveDate": "2024-01-01T02:00:00Z",
      "retail": 216.0,
      "consumer": 270.0
    }]
  }
}

// Transformed format
{
  "id": "prod_snowva",
  "title": "Snowva",
  "sku": "123456", // itemCode
  "retailPrice": 216.0,
  "consumerPrice": 270.0,
  "vatRate": 0.15 // South Africa standard rate
}
```

### Generated Quotes
Since no quote data exists, quotes are intelligently generated based on:

1. **Customer relationships** - Each customer gets 1-3 realistic quotes
2. **Product availability** - Uses products with custom pricing where available
3. **Business logic** - Realistic quantities, discounts, and status progression
4. **Temporal logic** - Status changes based on quote age (Draft → Pending → Approved/Rejected)

## API Endpoints Updated

### `/api/v1/quotes/wizard/bootstrap`
- Now loads real customer and product data
- Transforms to expected UI format
- Falls back to mock data if files unavailable

### `/api/v1/quotes` 
- Returns generated quotes based on real customer data
- Supports filtering, sorting, and pagination
- Uses realistic South African business data

## Key Benefits

1. **Realistic Testing** - UI now displays actual customer names and products
2. **Business Context** - Pricing reflects real retail vs consumer differences  
3. **Data Relationships** - Quotes reference actual customers and products
4. **Regional Accuracy** - Uses South African VAT rates and business practices

## Configuration

The data loader includes:
- **5-minute caching** to avoid repeated file I/O
- **Graceful fallbacks** if real data can't be loaded
- **Error handling** with detailed logging
- **Memory management** for large datasets

## Usage

```typescript
import { getRealBootstrapData, getRealQuotesData } from '@/lib/utils/realDataLoader';

// Get bootstrap data for quote composer
const bootstrap = await getRealBootstrapData();

// Get generated quotes
const quotes = await getRealQuotesData();
```

The transformation maintains all existing API contracts while providing realistic data for development and testing.