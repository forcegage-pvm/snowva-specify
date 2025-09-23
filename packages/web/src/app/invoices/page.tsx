// packages/web/src/app/invoices/page.tsx
import InvoiceViewer from '@/components/invoices/InvoiceViewer';

export default function InvoicesPage() {
  return (
    <div>
      <h1>Invoice Management</h1>
      <InvoiceViewer />
    </div>
  );
}
