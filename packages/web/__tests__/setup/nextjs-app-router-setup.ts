/**
 * Next.js App Router Test Setup
 * Comprehensive mock configuration for Next.js 15 App Router testing
 *
 * This setup file ensures all Next.js App Router components can be tested
 * by providing proper mocks for navigation hooks and related functionality.
 */

/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
// @ts-nocheck - Suppress all TypeScript errors in this legacy test setup file
// Mock server-side globals for API route testing
// Mock Next.js server components for API route testing
jest.mock("next/server", () => ({
  NextRequest: jest.fn().mockImplementation((url, options) => ({
    url: url,
    method: options?.method || "GET",
    headers: new Map(),
    body: options?.body,
    json: () => Promise.resolve(options?.body ? JSON.parse(options.body) : {}),
    text: () => Promise.resolve(options?.body || ""),
    formData: () => Promise.resolve(new FormData()),
    searchParams: new URLSearchParams(url.split("?")[1] || ""),
    nextUrl: {
      searchParams: new URLSearchParams(url.split("?")[1] || ""),
      pathname: url.split("?")[0],
    },
  })),
  NextResponse: {
    json: (data: any, init?: any) => ({
      status: init?.status || 200,
      headers: new Map(),
      json: () => Promise.resolve(data),
      body: JSON.stringify(data),
    }),
    next: () => ({
      status: 200,
      headers: new Map(),
    }),
  },
}));

// Mock Next.js navigation before any imports
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/quotes",
  useParams: () => ({}),
  notFound: jest.fn(),
  redirect: jest.fn(),
}));

// Mock quote operations hooks
jest.mock("../../src/hooks/quotes/useQuoteOperations", () => ({
  useQuotes: jest.fn(() => ({
    data: {
      quotes: [
        {
          id: "1",
          quoteNumber: "QUO-001",
          customerName: "Test Corp",
          totalAmount: 1000,
          status: "Draft",
          createdAt: "2024-09-27T00:00:00Z",
        },
      ],
      totalCount: 1,
      totalPages: 1,
      currentPage: 1,
    },
    isLoading: false,
    error: null,
    refetch: jest.fn(),
  })),
}));

// Mock quote state hooks
jest.mock("../../src/hooks/quotes/useQuoteState", () => ({
  useQuoteSelection: jest.fn(() => ({
    selectedQuotes: new Set<string>(),
    deselectAll: jest.fn(),
    getSelectedCount: jest.fn(() => 0),
    selectQuote: jest.fn(),
    deselectQuote: jest.fn(),
    isSelected: jest.fn(() => false),
  })),
  useQuoteFiltersState: jest.fn(() => ({
    activeFilters: {},
    searchQuery: "", // Add missing searchQuery property
    showQuickFilters: false,
    favoriteFilters: [],
    setFilters: jest.fn(),
    clearFilters: jest.fn(),
    updateFilter: jest.fn(),
    removeFilter: jest.fn(),
    setSearchQuery: jest.fn(),
    toggleQuickFilters: jest.fn(),
  })),
  useQuoteView: jest.fn(() => ({
    viewMode: "grid",
    setViewMode: jest.fn(),
    sortBy: "createdAt",
    setSortBy: jest.fn(),
    sortOrder: "desc",
    setSortOrder: jest.fn(),
  })),
}));

// Mock window.matchMedia for responsive design tests
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver for components that use it
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock ResizeObserver for components that use it
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Setup console.error to fail tests on React warnings in development
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: unknown[]) => {
    if (typeof args[0] === "string" && args[0].includes("Warning:")) {
      throw new Error("React warning detected: " + args[0]);
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
