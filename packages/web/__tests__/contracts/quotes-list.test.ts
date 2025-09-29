/**
 * Contract Test: GET /api/v1/quotes - T004
 *
 * Tests the API contract for the quotes list endpoint to ensure:
 * - Proper HTTP status codes
 * - Expected JSON structure
 * - Required fields presence
 * - Data type validation
 * - Pagination metadata
 *
 * Constitutional Requirements:
 * - LEVEL 4+ functionality with comprehensive validation
 * - Zero TypeScript compilation errors
 * - Business logic integrity testing
 * - Performance considerations
 */

import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";
import { NextRequest } from "next/server";
import { GET } from "../../src/app/api/v1/quotes/route";

describe("Contract Test: GET /api/v1/quotes - T004", () => {
  let mockRequest: NextRequest;

  beforeEach(() => {
    // Setup fresh request for each test
    mockRequest = new NextRequest("http://localhost:3000/api/v1/quotes");
  });

  afterEach(() => {
    // Cleanup after each test
    jest.clearAllMocks();
  });

  describe("Success Cases", () => {
    it("should return 200 OK with proper JSON structure", async () => {
      const response = await GET(mockRequest);

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toMatchObject({
        quotes: expect.any(Array),
        pagination: expect.any(Object),
        filters: expect.any(Object),
      });
    });

    it("should return quotes array with required fields", async () => {
      const response = await GET(mockRequest);
      const data = await response.json();

      expect(Array.isArray(data.quotes)).toBe(true);

      if (data.quotes.length > 0) {
        const quote = data.quotes[0];
        expect(quote).toHaveProperty("id");
        expect(quote).toHaveProperty("quoteNumber");
        expect(quote).toHaveProperty("customerName");
        expect(quote).toHaveProperty("totalAmount");
        expect(quote).toHaveProperty("status");
        expect(quote).toHaveProperty("createdAt");
        expect(quote).toHaveProperty("updatedAt");
      }
    });

    it("should return valid pagination metadata", async () => {
      const response = await GET(mockRequest);
      const data = await response.json();

      expect(data.pagination).toMatchObject({
        page: expect.any(Number),
        limit: expect.any(Number),
        total: expect.any(Number),
        totalPages: expect.any(Number),
      });

      expect(data.pagination.page).toBeGreaterThanOrEqual(1);
      expect(data.pagination.limit).toBeGreaterThan(0);
      expect(data.pagination.total).toBeGreaterThanOrEqual(0);
      expect(data.pagination.totalPages).toBeGreaterThanOrEqual(0);
    });

    it("should return valid filter metadata", async () => {
      const response = await GET(mockRequest);
      const data = await response.json();

      expect(data.filters).toMatchObject({
        applied: expect.any(Object),
        available: expect.any(Object),
      });
    });
  });

  describe("Query Parameter Handling", () => {
    it("should handle page parameter", async () => {
      const requestWithPage = new NextRequest(
        "http://localhost:3000/api/v1/quotes?page=2"
      );
      const response = await GET(requestWithPage);

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.pagination.page).toBe(2);
    });

    it("should handle limit parameter", async () => {
      const requestWithLimit = new NextRequest(
        "http://localhost:3000/api/v1/quotes?limit=50"
      );
      const response = await GET(requestWithLimit);

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.pagination.limit).toBe(50);
    });

    it("should handle search parameter", async () => {
      const requestWithSearch = new NextRequest(
        "http://localhost:3000/api/v1/quotes?search=test"
      );
      const response = await GET(requestWithSearch);

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.filters.applied.search).toBe("test");
    });

    it("should handle status filter", async () => {
      const requestWithStatus = new NextRequest(
        "http://localhost:3000/api/v1/quotes?status=draft"
      );
      const response = await GET(requestWithStatus);

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.filters.applied.status).toBe("draft");
    });
  });

  describe("Error Handling", () => {
    it("should handle invalid page parameter gracefully", async () => {
      const requestWithInvalidPage = new NextRequest(
        "http://localhost:3000/api/v1/quotes?page=invalid"
      );
      const response = await GET(requestWithInvalidPage);

      expect(response.status).toBe(200); // Should default to page 1

      const data = await response.json();
      expect(data.pagination.page).toBe(1);
    });

    it("should handle invalid limit parameter gracefully", async () => {
      const requestWithInvalidLimit = new NextRequest(
        "http://localhost:3000/api/v1/quotes?limit=-5"
      );
      const response = await GET(requestWithInvalidLimit);

      expect(response.status).toBe(200); // Should use default limit

      const data = await response.json();
      expect(data.pagination.limit).toBeGreaterThan(0);
    });
  });

  describe("Performance Validation", () => {
    it("should respond within acceptable time limits", async () => {
      const startTime = Date.now();
      const response = await GET(mockRequest);
      const endTime = Date.now();

      expect(response.status).toBe(200);
      expect(endTime - startTime).toBeLessThan(1000); // Should respond within 1 second
    });

    it("should handle concurrent requests efficiently", async () => {
      const requests = Array(5)
        .fill(null)
        .map(() => GET(mockRequest));
      const startTime = Date.now();

      const responses = await Promise.all(requests);
      const endTime = Date.now();

      responses.forEach((response: Response) => {
        expect(response.status).toBe(200);
      });

      expect(endTime - startTime).toBeLessThan(2000); // All 5 requests within 2 seconds
    });
  });

  describe("Data Integrity", () => {
    it("should maintain consistent data structure across requests", async () => {
      const response1 = await GET(mockRequest);
      const response2 = await GET(mockRequest);

      const data1 = await response1.json();
      const data2 = await response2.json();

      // Structure should be identical
      expect(Object.keys(data1).sort()).toEqual(Object.keys(data2).sort());
      expect(Object.keys(data1.pagination).sort()).toEqual(
        Object.keys(data2.pagination).sort()
      );
      expect(Object.keys(data1.filters).sort()).toEqual(
        Object.keys(data2.filters).sort()
      );
    });

    it("should return valid numeric types for amounts", async () => {
      const response = await GET(mockRequest);
      const data = await response.json();

      if (data.quotes.length > 0) {
        data.quotes.forEach((quote: Record<string, unknown>) => {
          if (quote.totalAmount !== null) {
            expect(typeof quote.totalAmount).toBe("number");
            expect(quote.totalAmount).toBeGreaterThanOrEqual(0);
          }
        });
      }
    });

    it("should return valid date formats", async () => {
      const response = await GET(mockRequest);
      const data = await response.json();

      if (data.quotes.length > 0) {
        data.quotes.forEach((quote: Record<string, unknown>) => {
          if (quote.createdAt) {
            expect(new Date(quote.createdAt as string).toString()).not.toBe(
              "Invalid Date"
            );
          }
          if (quote.updatedAt) {
            expect(new Date(quote.updatedAt as string).toString()).not.toBe(
              "Invalid Date"
            );
          }
        });
      }
    });
  });
});
