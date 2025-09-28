/**
 * Contract Tests Setup
 * Mock API routes for contract testing
 * NOTE: This file is not currently used - contract tests use validation approach instead
 */

// @ts-nocheck - Legacy setup file with complex Jest typing issues
import { jest } from "@jest/globals";

// Mock all API route modules before they're imported
jest.mock("@/app/api/v1/quotes/route", () => ({
  GET: jest.fn().mockResolvedValue({
    status: 200,
    json: () =>
      Promise.resolve({
        quotes: [
          {
            id: "1",
            quoteNumber: "QUO-001",
            customerName: "Test Corp",
            totalAmount: 1000,
            status: "draft",
            createdAt: "2024-09-27T00:00:00Z",
            updatedAt: "2024-09-27T00:00:00Z",
          },
        ],
        pagination: {
          page: 1,
          limit: 20,
          totalCount: 1,
          totalPages: 1,
        },
        summary: {
          totalAmount: 1000,
          count: 1,
        },
      }),
  }),
  POST: jest.fn().mockResolvedValue({
    status: 201,
    json: () =>
      Promise.resolve({
        id: "2",
        quoteNumber: "QUO-002",
        message: "Quote created successfully",
      }),
  }),
}));

jest.mock("@/app/api/v1/quotes/[quoteId]/route", () => ({
  GET: jest.fn().mockResolvedValue({
    status: 200,
    json: () =>
      Promise.resolve({
        id: "1",
        quoteNumber: "QUO-001",
        customerName: "Test Corp",
        totalAmount: 1000,
        status: "draft",
      }),
  }),
  PUT: jest.fn().mockResolvedValue({
    status: 200,
    json: () =>
      Promise.resolve({
        message: "Quote updated successfully",
      }),
  }),
  DELETE: jest.fn().mockResolvedValue({
    status: 200,
    json: () =>
      Promise.resolve({
        message: "Quote deleted successfully",
      }),
  }),
}));

jest.mock("@/app/api/v1/quotes/[quoteId]/status/route", () => ({
  PATCH: jest.fn().mockResolvedValue({
    status: 200,
    json: () =>
      Promise.resolve({
        message: "Quote status updated successfully",
      }),
  }),
}));

jest.mock("@/app/api/v1/quotes/[quoteId]/duplicate/route", () => ({
  POST: jest.fn().mockResolvedValue({
    status: 201,
    json: () =>
      Promise.resolve({
        id: "3",
        quoteNumber: "QUO-003",
        message: "Quote duplicated successfully",
      }),
  }),
}));

jest.mock("@/app/api/v1/quotes/[quoteId]/convert/route", () => ({
  POST: jest.fn().mockResolvedValue({
    status: 200,
    json: () =>
      Promise.resolve({
        invoiceId: "INV-001",
        message: "Quote converted to invoice successfully",
      }),
  }),
}));

jest.mock("@/app/api/v1/quotes/bulk-actions/route", () => ({
  POST: jest.fn().mockResolvedValue({
    status: 200,
    json: () =>
      Promise.resolve({
        processed: 2,
        message: "Bulk action completed successfully",
      }),
  }),
}));

jest.mock("@/app/api/v1/quotes/export/route", () => ({
  POST: jest.fn().mockResolvedValue({
    status: 200,
    json: () =>
      Promise.resolve({
        downloadUrl: "http://localhost:3000/downloads/quotes-export.xlsx",
        message: "Export generated successfully",
      }),
  }),
}));

// Mock NextRequest and NextResponse for contract tests
// @ts-ignore - Global test setup
global.NextRequest = jest
  .fn()
  .mockImplementation((url: string, options?: any) => ({
    url: url,
    method: options?.method || "GET",
    headers: new Map(),
    body: options?.body,
    json: () => Promise.resolve(options?.body ? JSON.parse(options.body) : {}),
    text: () => Promise.resolve(options?.body || ""),
    searchParams: new URLSearchParams(url.split("?")[1] || ""),
    nextUrl: {
      searchParams: new URLSearchParams(url.split("?")[1] || ""),
      pathname: url.split("?")[0],
    },
  }));

// @ts-ignore - Global test setup
global.NextResponse = {
  json: (data: any, init?: any) => ({
    status: init?.status || 200,
    headers: new Map(),
    json: () => Promise.resolve(data),
  }),
};
