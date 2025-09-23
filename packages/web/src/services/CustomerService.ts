// packages/web/src/services/CustomerService.ts
import { mockCustomers } from '@/data/mock';
import { Customer } from '@/models/Customer';

// This is a mock database for now
const customers: Customer[] = mockCustomers;

export const CustomerService = {
  async getAll(): Promise<Customer[]> {
    return customers;
  },

  async getById(id: string): Promise<Customer | null> {
    return customers.find((c) => c.id === id) || null;
  },

  async create(data: Omit<Customer, 'id'>): Promise<Customer> {
    const newCustomer: Customer = {
      id: crypto.randomUUID(),
      ...data,
    };
    customers.push(newCustomer);
    return newCustomer;
  },

  async update(id: string, data: Partial<Customer>): Promise<Customer | null> {
    const index = customers.findIndex((c) => c.id === id);
    if (index === -1) {
      return null;
    }
    customers[index] = { ...customers[index], ...data };
    return customers[index];
  },

  async delete(id: string): Promise<void> {
    const index = customers.findIndex((c) => c.id === id);
    if (index !== -1) {
      customers.splice(index, 1);
    }
  },
};
