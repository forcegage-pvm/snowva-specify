// packages/web/src/app/api/v1/quotes/wizard/bootstrap/route.ts
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/v1/quotes/wizard/bootstrap
 * Bootstrap data for quote composer wizard
 */
export async function GET(request: NextRequest) {
  try {
    // Mock bootstrap data for quote composer - matching expected TypeScript interface
    const bootstrapData = {
      customers: [
        {
          id: '1',
          displayName: 'Mobile App Studios',
          customerType: 'Business',
          creditLimit: 50000,
          outstandingBalance: 2500.50,
          branches: [
            {
              id: 'branch-1',
              displayName: 'Main Office',
              default: true,
              vatNumber: 'VAT123456789'
            },
            {
              id: 'branch-2',
              displayName: 'Secondary Location',
              default: false
            }
          ],
          recentDocuments: {}
        },
        {
          id: '2',
          displayName: 'Cloud Computing Ltd',
          customerType: 'Enterprise',
          creditLimit: 100000,
          outstandingBalance: 1250.75,
          branches: [
            {
              id: 'branch-3',
              displayName: 'Headquarters',
              default: true,
              vatNumber: 'VAT987654321'
            }
          ],
          recentDocuments: {}
        },
        {
          id: '3',
          displayName: 'Tech Solutions Ltd',
          customerType: 'SME',
          creditLimit: 25000,
          outstandingBalance: 750.00,
          branches: [
            {
              id: 'branch-4',
              displayName: 'Main Branch',
              default: true,
              vatNumber: 'VAT456789123'
            }
          ],
          recentDocuments: {}
        },
        {
          id: '4',
          displayName: 'Creative Agency Co',
          customerType: 'Startup',
          creditLimit: 15000,
          outstandingBalance: 320.25,
          branches: [
            {
              id: 'branch-5',
              displayName: 'Studio',
              default: true
            }
          ],
          recentDocuments: {}
        },
        {
          id: '5',
          displayName: 'Data Analytics Corp',
          customerType: 'Business',
          creditLimit: 75000,
          outstandingBalance: 4200.00,
          branches: [
            {
              id: 'branch-6',
              displayName: 'Analytics Center',
              default: true,
              vatNumber: 'VAT789123456'
            }
          ],
          recentDocuments: {}
        }
      ],
      catalog: [
        {
          id: '1',
          title: 'Premium Software License',
          sku: 'PSL-001',
          retailPrice: 299.99,
          consumerPrice: 399.99,
          vatRate: 0.20
        },
        {
          id: '2',
          title: 'Cloud Storage Plan - 1TB',
          sku: 'CSP-1TB',
          retailPrice: 49.99,
          consumerPrice: 69.99,
          vatRate: 0.20
        },
        {
          id: '3',
          title: 'Consulting Services (Hourly)',
          sku: 'CONS-HR',
          retailPrice: 150.00,
          consumerPrice: 200.00,
          vatRate: 0.20
        },
        {
          id: '4',
          title: 'Custom Development Package',
          sku: 'DEV-PKG',
          retailPrice: 2500.00,
          consumerPrice: 3200.00,
          vatRate: 0.20
        },
        {
          id: '5',
          title: 'System Integration',
          sku: 'SYS-INT',
          retailPrice: 1200.00,
          consumerPrice: 1500.00,
          vatRate: 0.20
        },
        {
          id: '6',
          title: 'Technical Support Package',
          sku: 'TECH-SUP',
          retailPrice: 800.00,
          consumerPrice: 1000.00,
          vatRate: 0.20
        }
      ],
      defaultVatRate: 0.20,
      maxLineItems: 50
    };

    return NextResponse.json(bootstrapData);
  } catch (error) {
    console.error('Quote wizard bootstrap error:', error);
    return NextResponse.json({
      error: 'Failed to load bootstrap data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}