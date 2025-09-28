import { mockQuotes } from '@/data/quotes';

export async function getRealQuotesData() {
  return mockQuotes;
}

export async function getRealBootstrapData() {
  return {
    customers: [],
    products: [],
    templates: []
  };
}
