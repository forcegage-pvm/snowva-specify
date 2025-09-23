# Component Contracts: Core Business Management System

**Date**: 2025-09-23  
**Feature**: Core Business Management System  
**Phase**: Phase 1 Design

## Constitutional Compliance

All components MUST adhere to Snowva Business Management System Constitution v1.0.0:

- **[Constitutional Principle I: Component-First Development]**: Every UI feature built as reusable, composable components with clear props interfaces, self-contained logic, and Storybook documentation
- **[Constitutional Principle IV: Design System Consistency]**: All components use Tailwind CSS design tokens, support theming through CSS custom properties, follow naming conventions (size: sm/md/lg, variant: primary/secondary/outline)
- **[Constitutional Principle V: Performance and Accessibility First]**: Components meet WCAG 2.1 AA standards with proper ARIA labels, keyboard navigation, and optimized rendering

## Component Architecture

### Design System Foundation

#### Theme Configuration

```typescript
interface SnowvaTheme {
  colors: {
    primary: string; // Snowva brand blue
    secondary: string; // Complementary accent
    success: string; // Positive actions (finalize, paid)
    warning: string; // Caution states (overdue warnings)
    error: string; // Error states and validation
    neutral: {
      50: string; // Background surfaces
      100: string; // Subtle borders
      200: string; // Disabled states
      500: string; // Secondary text
      900: string; // Primary text
    };
  };
  spacing: {
    xs: string; // 4px
    sm: string; // 8px
    md: string; // 16px
    lg: string; // 24px
    xl: string; // 32px
  };
  typography: {
    fontFamily: string;
    fontSize: Record<string, string>;
    fontWeight: Record<string, number>;
  };
}
```

#### Form Components

##### FormInput

```typescript
interface FormInputProps {
  label: string;
  name: string;
  type?: "text" | "email" | "tel" | "number";
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  className?: string;
}

// Contract: Must integrate with React Hook Form **[Constitutional Principle III: Business Data Integrity]**
// Contract: Must show validation errors with proper styling **[Constitutional Principle IV: Design System Consistency]**
// Contract: Must support South African formatting (phone, postal codes)
// Contract: Must meet WCAG 2.1 AA accessibility standards **[Constitutional Principle V: Accessibility First]**
```

##### FormSelect

```typescript
interface FormSelectProps<T> {
  label: string;
  name: string;
  options: SelectOption<T>[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  value?: T;
  onChange?: (value: T) => void;
  onBlur?: () => void;
  searchable?: boolean;
  className?: string;
}

interface SelectOption<T> {
  value: T;
  label: string;
  disabled?: boolean;
}

// Contract: Must support both single and multi-select
// Contract: Must handle large option lists (customers, products)
// Contract: Must provide search functionality for large lists
```

##### CurrencyInput

```typescript
interface CurrencyInputProps {
  label: string;
  name: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  value?: number;
  onChange?: (value: number) => void;
  onBlur?: () => void;
  min?: number;
  max?: number;
  className?: string;
}

// Contract: Must format as South African Rand (R 1,234.56)
// Contract: Must handle decimal precision correctly **[Constitutional Principle III: Business Data Integrity - Precise decimal arithmetic required]**
// Contract: Must prevent invalid characters and validate input at multiple layers
// Contract: Must support copy/paste of formatted values
// Contract: Must use immutable state updates for financial data
```

### Business Components

#### CustomerSelector

```typescript
interface CustomerSelectorProps {
  label?: string;
  customerType?: "retail" | "consumer" | "all";
  includeBranches?: boolean;
  value?: string; // Customer ID or Branch ID
  onChange: (customerId: string, branchId?: string) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

// Contract: Must show customer hierarchy for retail customers
// Contract: Must display customer type and payment terms
// Contract: Must support search by name, VAT number, or contact
// Contract: Must lazy load branches when customer selected
```

#### ProductSelector

```typescript
interface ProductSelectorProps {
  label?: string;
  multiple?: boolean;
  customerId?: string; // For customer-specific pricing
  categoryFilter?: string;
  value?: string | string[];
  onChange: (productId: string | string[], variantId?: string) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  showPricing?: boolean;
  className?: string;
}

// Contract: Must show current pricing based on customer type
// Contract: Must indicate customer-specific overrides
// Contract: Must group by category for easy browsing
// Contract: Must show product variants when applicable
// Contract: Must display stock status (future enhancement)
```

#### LineItemEditor

```typescript
interface LineItemEditorProps {
  customerId: string;
  customerType: "retail" | "consumer";
  lineItems: LineItem[];
  onChange: (lineItems: LineItem[]) => void;
  readonly?: boolean;
  showTotals?: boolean;
  allowCustomPricing?: boolean;
  className?: string;
}

interface LineItem {
  id: string;
  productId: string;
  variantId?: string;
  description: string;
  itemCode?: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

// Contract: Must calculate line totals automatically
// Contract: Must validate quantities and prices
// Contract: Must support drag-and-drop reordering
// Contract: Must show customer-specific item codes for retail
// Contract: Must prevent negative quantities
// Contract: Must handle product selection with variants
```

#### StatusBadge

```typescript
interface StatusBadgeProps {
  status: QuoteStatus | InvoiceStatus | PaymentStatus;
  size?: "sm" | "md" | "lg";
  className?: string;
}

// Contract: Must use consistent colors across all statuses
// Contract: Must be accessible with proper contrast ratios
// Contract: Must show status transitions clearly
```

#### AmountDisplay

```typescript
interface AmountDisplayProps {
  amount: number;
  currency?: string; // Default: 'ZAR'
  showSign?: boolean;
  precision?: number; // Default: 2
  size?: "sm" | "md" | "lg";
  variant?: "default" | "success" | "warning" | "error";
  className?: string;
}

// Contract: Must format consistently across application
// Contract: Must handle negative amounts appropriately
// Contract: Must support different currencies (future)
// Contract: Must be properly aligned in tables
```

### Page Components

#### CustomerList

```typescript
interface CustomerListProps {
  customerType?: "retail" | "consumer" | "all";
  searchQuery?: string;
  onCustomerSelect: (customer: Customer) => void;
  onCreateCustomer: () => void;
  className?: string;
}

// Contract: Must support pagination for large customer lists
// Contract: Must show customer hierarchy for multi-branch customers
// Contract: Must display key information (type, balance, contact)
// Contract: Must support filtering and sorting
// Contract: Must be responsive on mobile devices
```

#### InvoiceEditor

```typescript
interface InvoiceEditorProps {
  invoiceId?: string; // Undefined for new invoice
  quoteId?: string; // When converting from quote
  onSave: (invoice: Invoice) => void;
  onCancel: () => void;
  onFinalize?: (invoice: Invoice) => void;
  readonly?: boolean;
  className?: string;
}

// Contract: Must prevent editing of finalized invoices
// Contract: Must calculate VAT automatically
// Contract: Must validate all required fields
// Contract: Must support conversion from quotes
// Contract: Must show customer payment terms and due date
// Contract: Must generate sequential invoice numbers
```

#### PaymentRecorder

```typescript
interface PaymentRecorderProps {
  customerId: string;
  suggestedAmount?: number;
  onPaymentRecorded: (payment: Payment) => void;
  onCancel: () => void;
  className?: string;
}

// Contract: Must show customer outstanding balance
// Contract: Must support FIFO allocation by default
// Contract: Must allow manual allocation to specific invoices
// Contract: Must validate payment amount against outstanding balance
// Contract: Must show allocation preview before confirmation
```

#### StatementViewer

```typescript
interface StatementViewerProps {
  statementId: string;
  onPrint: () => void;
  onEmail?: (email: string) => void;
  onDownload: () => void;
  className?: string;
}

// Contract: Must show statement in printable format
// Contract: Must calculate running balances correctly
// Contract: Must group transactions by date
// Contract: Must highlight overdue amounts
// Contract: Must match physical statement format exactly
```

### Layout Components

#### DashboardLayout

```typescript
interface DashboardLayoutProps {
  children: React.ReactNode;
  currentUser?: User;
  navigationItems: NavigationItem[];
  className?: string;
}

interface NavigationItem {
  label: string;
  href: string;
  icon?: React.ComponentType;
  badge?: string | number;
  active?: boolean;
}

// Contract: Must be responsive across all device sizes
// Contract: Must show current user and logout option
// Contract: Must highlight active navigation item
// Contract: Must support keyboard navigation
// Contract: Must collapse on mobile with hamburger menu
```

#### PageHeader

```typescript
interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: Breadcrumb[];
  actions?: React.ReactNode;
  className?: string;
}

interface Breadcrumb {
  label: string;
  href?: string;
}

// Contract: Must be consistent across all pages
// Contract: Must support action buttons (Create, Export, etc.)
// Contract: Must show hierarchical navigation context
```

### Data Table Components

#### DataTable

```typescript
interface DataTableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  pagination?: PaginationConfig;
  sorting?: SortingConfig<T>;
  selection?: SelectionConfig<T>;
  loading?: boolean;
  error?: string;
  emptyMessage?: string;
  className?: string;
}

interface TableColumn<T> {
  key: keyof T;
  header: string;
  render?: (value: any, row: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
  align?: "left" | "center" | "right";
}

// Contract: Must support large datasets with virtual scrolling
// Contract: Must maintain state during data updates
// Contract: Must be accessible with screen readers
// Contract: Must support responsive column hiding
// Contract: Must handle loading and error states gracefully
```

### Modal and Overlay Components

#### ConfirmationModal

```typescript
interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "danger";
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

// Contract: Must prevent accidental confirmations
// Contract: Must show loading state during async operations
// Contract: Must be keyboard accessible (Enter/Escape)
// Contract: Must focus trap within modal
```

#### SlideOver

```typescript
interface SlideOverProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  size?: "sm" | "md" | "lg" | "xl";
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

// Contract: Must slide in from right side
// Contract: Must overlay content without shifting layout
// Contract: Must support nested slide-overs
// Contract: Must handle overflow content with scrolling
```

## Component Testing Contracts

### Unit Testing Requirements

Each component must include:

- Rendering tests with required props
- Event handling tests (onClick, onChange, etc.)
- Validation error display tests
- Accessibility tests (ARIA labels, keyboard navigation)
- Edge case handling (empty data, loading states, errors)

### Integration Testing Requirements

Business components must include:

- Data loading and error handling
- Form submission and validation
- Customer/product selection workflows
- Calculation accuracy tests (VAT, totals, balances)
- Document generation tests

### Performance Requirements

- Components must render in <100ms with typical data
- Large lists must implement virtualization for >100 items
- Form interactions must feel immediate (<50ms)
- Modal animations must be smooth (60fps)

---

**Status**: ✅ Component Contracts Complete  
**Next**: Generate quickstart guide and test scenarios
