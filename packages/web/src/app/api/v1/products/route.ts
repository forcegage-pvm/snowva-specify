// packages/web/src/app/api/v1/products/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  // In a real app, you'd fetch all products
  return NextResponse.json([]);
}
