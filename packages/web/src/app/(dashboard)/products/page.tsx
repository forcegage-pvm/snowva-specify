// packages/web/src/app/products/page.tsx
import ProductCatalog from '@/components/catalog/ProductCatalog';

export default function ProductsPage() {
  return (
    <div>
      <h1>Product Management</h1>
      <ProductCatalog />
    </div>
  );
}
