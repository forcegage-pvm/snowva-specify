// packages/web/src/app/customers/page.tsx
import CustomerForm from '@/components/forms/CustomerForm';
import CustomerList from '@/components/lists/CustomerList';

export default function CustomerPage() {
  return (
    <div>
      <h1>Customer Management</h1>
      <CustomerForm />
      <CustomerList />
    </div>
  );
}
