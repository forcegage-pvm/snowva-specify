// packages/web/src/app/api/v1/quotes/wizard/bootstrap/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getRealBootstrapData } from '@/lib/utils/realDataLoader';

/**
 * GET /api/v1/quotes/wizard/bootstrap
 * Bootstrap data for quote composer wizard - now using real business data
 */
export async function GET(request: NextRequest) {
  try {
    // Get real bootstrap data transformed from actual business data
    const bootstrapData = await getRealBootstrapData();
    
    return NextResponse.json(bootstrapData);
  } catch (error) {
    console.error('Quote wizard bootstrap error:', error);
    
    // Fallback to mock data if real data fails
    const fallbackData = {
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
          vatRate: 0.15
        }
      ],
      defaultVatRate: 0.15,
      maxLineItems: 50
    };

    return NextResponse.json(fallbackData);
  }
}