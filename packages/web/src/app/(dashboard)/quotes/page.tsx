// packages/web/src/app/quotes/page.tsx
import QuoteBuilder from '@/components/quotes/QuoteBuilder';

export default function QuotesPage() {
  return (
    <div>
      <h1>Quote Management</h1>
      <QuoteBuilder />
    </div>
  );
}
