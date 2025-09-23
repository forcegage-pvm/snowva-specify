// packages/web/src/app/api/v1/customers/route.ts
import { CustomerSchema } from '@/models/Customer';
import { CustomerService } from '@/services/CustomerService';
import { NextResponse } from 'next/server';

export async function GET() {
  const customers = await CustomerService.getAll();
  return NextResponse.json(customers);
}

export async function POST(request: Request) {
  const body = await request.json();
  const validation = CustomerSchema.omit({ id: true }).safeParse(body);

  if (!validation.success) {
    return NextResponse.json(validation.error.issues, { status: 400 });
  }

  const newCustomer = await CustomerService.create(validation.data);
  return NextResponse.json(newCustomer, { status: 201 });
}
