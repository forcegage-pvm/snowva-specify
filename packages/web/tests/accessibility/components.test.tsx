// packages/web/tests/accessibility/components.test.tsx
import CustomerForm from '@/components/forms/CustomerForm';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('Accessibility: Components', () => {
  it('CustomerForm should have no accessibility violations', async () => {
    const { container } = render(<CustomerForm />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
