'use client';

import type { FC } from 'react';

export type ProductOverride = {
  customerId: string;
  price: number;
  expiresAt?: string;
};

export type ProductVersion = {
  versionId: string;
  status: 'Draft' | 'Scheduled' | 'Active' | 'Archived';
  effectiveDate: string;
};

export type ProductCatalogEntry = {
  productId: string;
  name: string;
  category: string;
  sku: string;
  retailPrice: number;
  consumerPrice: number;
  versionHistory: ProductVersion[];
  currentPricelistVersion: string;
  customOverrides?: ProductOverride[];
};

type ProductCatalogEntryCardProps = {
  product: ProductCatalogEntry;
  activeCustomerId?: string;
  onOverrideSelect?: (override: ProductOverride) => void;
};

export const ProductCatalogEntryCard: FC<ProductCatalogEntryCardProps> = () => {
  return null;
};
