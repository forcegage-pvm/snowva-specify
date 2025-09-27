// packages/web/__tests__/integration/quotes-filters-functionality.test.tsx
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { QuoteFilters } from '../../src/components/quotes/QuoteFilters';

// Mock the hooks
jest.mock('../../src/hooks/quotes/useQuoteState', () => ({
  useQuoteFiltersState: () => ({
    activeFilters: {
      page: 1,
      pageSize: 25,
      sort: 'createdAt',
      sortOrder: 'desc',
      includeArchived: false
    },
    searchQuery: '',
    searchDebouncedQuery: '',
    showQuickFilters: false,
    favoriteFilters: [],
    currentPage: 1,
    pageSize: 25,
    totalItems: 0,
    setFilters: jest.fn(),
    updateFilter: jest.fn(),
    clearFilters: jest.fn(),
    setSearchQuery: jest.fn(),
    setSearchDebouncedQuery: jest.fn(),
    toggleQuickFilters: jest.fn(),
    addFavoriteFilter: jest.fn(),
    removeFavoriteFilter: jest.fn(),
    setCurrentPage: jest.fn(),
    setPageSize: jest.fn(),
    setTotalItems: jest.fn(),
    resetPagination: jest.fn()
  })
}));

describe('QuoteFilters Functionality Integration Tests', () => {
  let queryClient: QueryClient;
  const mockOnFiltersChange = jest.fn();

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    });
    jest.clearAllMocks();
  });

  const renderWithProvider = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {component}
      </QueryClientProvider>
    );
  };

  it('renders all filter controls', async () => {
    renderWithProvider(<QuoteFilters onFiltersChange={mockOnFiltersChange} />);
    
    // Check main filter elements exist
    expect(screen.getByPlaceholderText('Search quotes...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /quick filters/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /advanced/i })).toBeInTheDocument();
  });

  it('shows clear button when filters are active', async () => {
    // Mock active filters
    const mockUseQuoteFiltersState = jest.requireMock('../../src/hooks/quotes/useQuoteState').useQuoteFiltersState;
    mockUseQuoteFiltersState.mockReturnValue({
      activeFilters: {
        page: 1,
        pageSize: 25,
        sort: 'createdAt',
        sortOrder: 'desc',
        includeArchived: false,
        search: 'test search' // Active search filter
      },
      searchQuery: 'test search',
      searchDebouncedQuery: 'test search',
      showQuickFilters: false,
      favoriteFilters: [],
      currentPage: 1,
      pageSize: 25,
      totalItems: 0,
      setFilters: jest.fn(),
      updateFilter: jest.fn(),
      clearFilters: jest.fn(),
      setSearchQuery: jest.fn(),
      setSearchDebouncedQuery: jest.fn(),
      toggleQuickFilters: jest.fn(),
      addFavoriteFilter: jest.fn(),
      removeFavoriteFilter: jest.fn(),
      setCurrentPage: jest.fn(),
      setPageSize: jest.fn(),
      setTotalItems: jest.fn(),
      resetPagination: jest.fn()
    });

    renderWithProvider(<QuoteFilters onFiltersChange={mockOnFiltersChange} />);
    
    // Should show clear button when there are active filters
    expect(screen.getByRole('button', { name: /clear/i })).toBeInTheDocument();
  });

  it('toggles quick filters when button clicked', async () => {
    const mockToggleQuickFilters = jest.fn();
    const mockUseQuoteFiltersState = jest.requireMock('../../src/hooks/quotes/useQuoteState').useQuoteFiltersState;
    mockUseQuoteFiltersState.mockReturnValue({
      activeFilters: {
        page: 1,
        pageSize: 25,
        sort: 'createdAt',
        sortOrder: 'desc',
        includeArchived: false
      },
      searchQuery: '',
      searchDebouncedQuery: '',
      showQuickFilters: false,
      favoriteFilters: [],
      currentPage: 1,
      pageSize: 25,
      totalItems: 0,
      setFilters: jest.fn(),
      updateFilter: jest.fn(),
      clearFilters: jest.fn(),
      setSearchQuery: jest.fn(),
      setSearchDebouncedQuery: jest.fn(),
      toggleQuickFilters: mockToggleQuickFilters,
      addFavoriteFilter: jest.fn(),
      removeFavoriteFilter: jest.fn(),
      setCurrentPage: jest.fn(),
      setPageSize: jest.fn(),
      setTotalItems: jest.fn(),
      resetPagination: jest.fn()
    });

    renderWithProvider(<QuoteFilters onFiltersChange={mockOnFiltersChange} />);
    
    const quickFiltersButton = screen.getByRole('button', { name: /quick filters/i });
    fireEvent.click(quickFiltersButton);
    
    expect(mockToggleQuickFilters).toHaveBeenCalledTimes(1);
  });

  it('shows quick filters when toggled on', async () => {
    const mockUseQuoteFiltersState = jest.requireMock('../../src/hooks/quotes/useQuoteState').useQuoteFiltersState;
    mockUseQuoteFiltersState.mockReturnValue({
      activeFilters: {
        page: 1,
        pageSize: 25,
        sort: 'createdAt',
        sortOrder: 'desc',
        includeArchived: false
      },
      searchQuery: '',
      searchDebouncedQuery: '',
      showQuickFilters: true, // Quick filters are shown
      favoriteFilters: [],
      currentPage: 1,
      pageSize: 25,
      totalItems: 0,
      setFilters: jest.fn(),
      updateFilter: jest.fn(),
      clearFilters: jest.fn(),
      setSearchQuery: jest.fn(),
      setSearchDebouncedQuery: jest.fn(),
      toggleQuickFilters: jest.fn(),
      addFavoriteFilter: jest.fn(),
      removeFavoriteFilter: jest.fn(),
      setCurrentPage: jest.fn(),
      setPageSize: jest.fn(),
      setTotalItems: jest.fn(),
      resetPagination: jest.fn()
    });

    renderWithProvider(<QuoteFilters onFiltersChange={mockOnFiltersChange} />);
    
    // Should show quick filters section
    expect(screen.getByText('Quick Filters:')).toBeInTheDocument();
    
    // Should show quick filter buttons
    expect(screen.getByRole('button', { name: /active quotes/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /needs attention/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /recent/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /this month/i })).toBeInTheDocument();
  });
});