// packages/web/src/app/api/v1/customers/[id]/pricing-overrides/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  // Mock implementation
  return NextResponse.json([]);
}
