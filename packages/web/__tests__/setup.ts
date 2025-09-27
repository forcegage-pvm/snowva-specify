import '@testing-library/jest-dom';

// Mock console.error to catch validation errors in tests
const originalError = console.error;
beforeEach(() => {
  console.error = jest.fn();
});

afterEach(() => {
  // Check for unexpected console errors
  const mockError = console.error as jest.MockedFunction<typeof console.error>;
  if (mockError.mock.calls.length > 0) {
    const errorCalls = mockError.mock.calls.map(call => call.join(' ')).join('\n');
    console.log('Console errors during test:', errorCalls);
  }
  console.error = originalError;
});

// Global test utilities
global.waitForDebounce = (ms = 350) => new Promise(resolve => setTimeout(resolve, ms));

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));