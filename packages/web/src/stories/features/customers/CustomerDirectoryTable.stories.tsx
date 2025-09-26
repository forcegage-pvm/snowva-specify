'use client';

import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { useState } from 'react';

import { CustomerDirectoryTable } from '@/features/customers/components/CustomerDirectoryTable';
import {
    BreakpointContainer,
    type BreakpointArgs,
} from '../../utils/BreakpointWrapper';

const MOCK_CUSTOMERS: React.ComponentProps<typeof CustomerDirectoryTable>['customers'] = [
  {
    customerId: 'cust_sportsmans',
    displayName: 'Sportsmans Warehouse',
    parentCompany: 'Holdsport Group',
    branchCount: 11,
    outstandingBalance: 1_540_000,
    paymentTerms: 'Net 30',
    vatNumber: '4080304928',
  },
  {
    customerId: 'cust_total_sports',
    displayName: 'Totalsports',
    parentCompany: 'TFG Retail',
    branchCount: 18,
    outstandingBalance: 980_000,
    paymentTerms: 'Net 30',
    vatNumber: '4440290012',
  },
  {
    customerId: 'cust_outdoor',
    displayName: 'Outdoor Warehouse',
    parentCompany: 'Outdoor Warehouse Group',
    branchCount: 9,
    outstandingBalance: 620_400,
    paymentTerms: 'Net 45',
    vatNumber: '4360102290',
  },
  {
    customerId: 'cust_adventure_inc',
    displayName: 'Adventure Inc.',
    parentCompany: 'Adventure Holdings',
    branchCount: 7,
    outstandingBalance: 410_700,
    paymentTerms: 'Net 60',
    vatNumber: '4050101223',
  },
  {
    customerId: 'cust_run_co',
    displayName: 'RunCo SA',
    parentCompany: 'Run Collective',
    branchCount: 6,
    outstandingBalance: 285_950,
    paymentTerms: 'Net 45',
    vatNumber: '4780092219',
  },
  {
    customerId: 'cust_bike_industries',
    displayName: 'Bike Industries',
    parentCompany: 'Velocity Distribution',
    branchCount: 5,
    outstandingBalance: 174_200,
    paymentTerms: 'Prepaid',
    vatNumber: '4660129980',
  },
];

type CustomerDirectoryStoryProps = React.ComponentProps<typeof CustomerDirectoryTable> & BreakpointArgs;

const CustomerDirectoryStory = (props: CustomerDirectoryStoryProps) => {
  const { breakpoint, onFiltersChange, searchValue, ...rest } = props;
  const [localSearch, setLocalSearch] = useState(searchValue ?? '');

  return (
    <BreakpointContainer breakpoint={breakpoint}>
      <CustomerDirectoryTable
        {...rest}
        searchValue={localSearch}
        onFiltersChange={(filters) => {
          setLocalSearch(filters.search ?? '');
          onFiltersChange?.(filters);
        }}
      />
    </BreakpointContainer>
  );
};

const meta = {
  title: 'Features/Customers/CustomerDirectoryTable',
  component: CustomerDirectoryTable,
  args: {
    breakpoint: 'desktop',
    customers: MOCK_CUSTOMERS,
    isLoading: false,
    onRowSelect: fn(),
    onFiltersChange: fn(),
  },
  argTypes: {
    breakpoint: {
      options: ['mobile', 'tablet', 'desktop'],
      control: { type: 'radio' },
    },
  },
  render: (args) => <CustomerDirectoryStory {...args} />,
} satisfies Meta<CustomerDirectoryStoryProps>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Directory: Story = {};

export const LoadingState: Story = {
  args: {
    isLoading: true,
  },
};
