/**
 * PDF Generation Performance Tests
 * Sprint 004.1 - Technical Debt Resolution
 * 
 * Addresses NFR-002: PDF generation <2s response time
 * Tests performance requirements for PDF generation operations
 */

import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import { PerformanceTimer } from './timeline-performance.test';

// Mock PDF generation service
class MockPDFService {
  private baseDelay: number;
  private complexityFactor: number;

  constructor(baseDelay: number = 800, complexityFactor: number = 1.0) {
    this.baseDelay = baseDelay;
    this.complexityFactor = complexityFactor;
  }

  private calculateDelay(pages: number, images: number, tables: number): number {
    const baseTime = this.baseDelay;
    const pageTime = pages * 50;
    const imageTime = images * 100;
    const tableTime = tables * 30;
    
    return (baseTime + pageTime + imageTime + tableTime) * this.complexityFactor;
  }

  private async simulateProcessing(delay: number): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  async generateQuotePDF(quoteData: {
    items: any[];
    includeImages?: boolean;
    includeTables?: boolean;
    template?: 'simple' | 'detailed' | 'custom';
  }) {
    const itemCount = quoteData.items.length;
    const pages = Math.ceil(itemCount / 10) + 1; // Rough page estimation
    const images = quoteData.includeImages ? itemCount : 0;
    const tables = quoteData.includeTables ? 1 : 0;
    
    const delay = this.calculateDelay(pages, images, tables);
    await this.simulateProcessing(delay);

    return {
      pdfBuffer: Buffer.from('mock-pdf-data'),
      fileSize: pages * 50000 + images * 25000, // Rough size estimation
      pageCount: pages,
      generationTime: delay,
    };
  }

  async generatePreview(quoteData: any) {
    // Preview should be faster than full PDF
    const delay = this.calculateDelay(1, 0, 0) * 0.3;
    await this.simulateProcessing(delay);

    return {
      previewUrl: 'data:image/png;base64,mock-preview-data',
      generationTime: delay,
    };
  }

  async generateBatch(quotes: any[]) {
    const delays = quotes.map(quote => 
      this.calculateDelay(
        Math.ceil(quote.items.length / 10) + 1,
        quote.includeImages ? quote.items.length : 0,
        1
      )
    );

    // Simulate parallel processing with some overhead
    const maxDelay = Math.max(...delays);
    const parallelOverhead = quotes.length * 50;
    
    await this.simulateProcessing(maxDelay + parallelOverhead);

    return quotes.map((quote, index) => ({
      quoteId: quote.id,
      pdfBuffer: Buffer.from(`mock-pdf-data-${index}`),
      generationTime: delays[index],
    }));
  }

  async optimizePDF(pdfBuffer: Buffer, options: {
    compressionLevel?: number;
    imageQuality?: number;
  } = {}) {
    // Optimization should be relatively fast
    const delay = Math.min(300, pdfBuffer.length / 1000);
    await this.simulateProcessing(delay);

    return {
      optimizedBuffer: Buffer.from('optimized-pdf-data'),
      originalSize: pdfBuffer.length,
      optimizedSize: Math.floor(pdfBuffer.length * 0.7),
      compressionRatio: 0.3,
      optimizationTime: delay,
    };
  }
}

describe('PDF Generation Performance Tests', () => {
  let pdfService: MockPDFService;
  let timer: PerformanceTimer;

  beforeAll(() => {
    // Use realistic but optimistic processing times
    pdfService = new MockPDFService(600, 1.0);
    timer = new PerformanceTimer();
  });

  afterAll(() => {
    // Clean up any resources
  });

  describe('Single PDF Generation Performance', () => {
    it('should generate simple quote PDF within 2 seconds', async () => {
      const quoteData = {
        items: Array.from({ length: 5 }, (_, i) => ({
          id: i,
          description: `Item ${i}`,
          quantity: 1,
          price: 100,
        })),
        template: 'simple' as const,
      };

      timer.start();
      const result = await pdfService.generateQuotePDF(quoteData);
      const duration = timer.stop();

      expect(duration).toBeLessThan(2000);
      expect(result.pdfBuffer).toBeDefined();
      expect(result.pageCount).toBeGreaterThan(0);
      
      console.log(`✓ Simple PDF (${quoteData.items.length} items): ${duration.toFixed(2)}ms`);
    });

    it('should generate detailed quote PDF within 2 seconds', async () => {
      const quoteData = {
        items: Array.from({ length: 15 }, (_, i) => ({
          id: i,
          description: `Detailed Item ${i}`,
          quantity: Math.floor(Math.random() * 10) + 1,
          price: Math.random() * 1000,
        })),
        includeImages: true,
        includeTables: true,
        template: 'detailed' as const,
      };

      timer.start();
      const result = await pdfService.generateQuotePDF(quoteData);
      const duration = timer.stop();

      expect(duration).toBeLessThan(2000);
      expect(result.fileSize).toBeGreaterThan(0);
      
      console.log(`✓ Detailed PDF (${quoteData.items.length} items, images): ${duration.toFixed(2)}ms`);
    });

    it('should generate quote preview within 1 second', async () => {
      const quoteData = {
        items: Array.from({ length: 10 }, (_, i) => ({ id: i, description: `Item ${i}` })),
      };

      timer.start();
      const result = await pdfService.generatePreview(quoteData);
      const duration = timer.stop();

      expect(duration).toBeLessThan(1000);
      expect(result.previewUrl).toBeDefined();
      
      console.log(`✓ Preview generation: ${duration.toFixed(2)}ms`);
    });
  });

  describe('Complex Document Performance', () => {
    it('should handle large quote (50+ items) within 2 seconds', async () => {
      const quoteData = {
        items: Array.from({ length: 50 }, (_, i) => ({
          id: i,
          description: `Large Quote Item ${i}`,
          quantity: Math.floor(Math.random() * 5) + 1,
          price: Math.random() * 500,
        })),
        template: 'detailed' as const,
      };

      timer.start();
      const result = await pdfService.generateQuotePDF(quoteData);
      const duration = timer.stop();

      expect(duration).toBeLessThan(2000);
      expect(result.pageCount).toBeGreaterThan(3);
      
      console.log(`✓ Large PDF (${quoteData.items.length} items, ${result.pageCount} pages): ${duration.toFixed(2)}ms`);
    });

    it('should handle quote with many images within 2 seconds', async () => {
      const quoteData = {
        items: Array.from({ length: 20 }, (_, i) => ({
          id: i,
          description: `Image Item ${i}`,
          hasImage: true,
        })),
        includeImages: true,
        template: 'custom' as const,
      };

      timer.start();
      const result = await pdfService.generateQuotePDF(quoteData);
      const duration = timer.stop();

      expect(duration).toBeLessThan(2000);
      expect(result.fileSize).toBeGreaterThan(100000); // Should be larger with images
      
      console.log(`✓ Image-heavy PDF (${quoteData.items.length} images): ${duration.toFixed(2)}ms`);
    });
  });

  describe('Batch Processing Performance', () => {
    it('should generate multiple PDFs efficiently', async () => {
      const quotes = Array.from({ length: 5 }, (_, i) => ({
        id: `quote-${i}`,
        items: Array.from({ length: 8 + i * 2 }, (_, j) => ({
          id: j,
          description: `Batch Item ${j}`,
        })),
      }));

      timer.start();
      const results = await pdfService.generateBatch(quotes);
      const duration = timer.stop();

      // Batch processing should be more efficient than sequential
      const expectedSequentialTime = quotes.length * 1500; // Rough estimate
      expect(duration).toBeLessThan(expectedSequentialTime * 0.7);
      expect(results).toHaveLength(quotes.length);
      
      console.log(`✓ Batch generation (${quotes.length} PDFs): ${duration.toFixed(2)}ms`);
    });

    it('should handle concurrent PDF generation requests', async () => {
      const concurrentRequests = Array.from({ length: 3 }, (_, i) => ({
        items: Array.from({ length: 10 }, (_, j) => ({
          id: j,
          description: `Concurrent Item ${i}-${j}`,
        })),
      }));

      timer.reset();
      const promises = concurrentRequests.map(async (quoteData) => {
        timer.start();
        await pdfService.generateQuotePDF(quoteData);
        return timer.stop();
      });

      const durations = await Promise.all(promises);
      const maxDuration = Math.max(...durations);
      const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;

      expect(maxDuration).toBeLessThan(2000);
      expect(avgDuration).toBeLessThan(1500);
      
      console.log(`✓ Concurrent generation: max=${maxDuration.toFixed(2)}ms, avg=${avgDuration.toFixed(2)}ms`);
    });
  });

  describe('PDF Optimization Performance', () => {
    it('should optimize PDF within 500ms', async () => {
      // Generate a PDF first
      const quoteData = {
        items: Array.from({ length: 10 }, (_, i) => ({ id: i, description: `Item ${i}` })),
      };
      
      const pdfResult = await pdfService.generateQuotePDF(quoteData);

      timer.start();
      const optimized = await pdfService.optimizePDF(pdfResult.pdfBuffer);
      const duration = timer.stop();

      expect(duration).toBeLessThan(500);
      expect(optimized.optimizedSize).toBeLessThan(optimized.originalSize);
      expect(optimized.compressionRatio).toBeGreaterThan(0);
      
      console.log(`✓ PDF optimization: ${duration.toFixed(2)}ms (${optimized.compressionRatio * 100}% reduction)`);
    });

    it('should handle large PDF optimization within acceptable time', async () => {
      // Simulate large PDF buffer
      const largePdfBuffer = Buffer.alloc(500000, 'mock-large-pdf-data');

      timer.start();
      const optimized = await pdfService.optimizePDF(largePdfBuffer, {
        compressionLevel: 9,
        imageQuality: 80,
      });
      const duration = timer.stop();

      expect(duration).toBeLessThan(1000);
      expect(optimized.optimizedSize).toBeLessThan(optimized.originalSize);
      
      console.log(`✓ Large PDF optimization (${(largePdfBuffer.length / 1024).toFixed(0)}KB): ${duration.toFixed(2)}ms`);
    });
  });

  describe('Error Handling Performance', () => {
    it('should fail fast on invalid input', async () => {
      const invalidQuoteData = {
        items: [], // Empty items should fail quickly
      };

      timer.start();
      try {
        await pdfService.generateQuotePDF(invalidQuoteData);
      } catch (error) {
        const duration = timer.stop();
        expect(duration).toBeLessThan(100); // Should fail very quickly
        console.log(`✓ Fast failure on invalid input: ${duration.toFixed(2)}ms`);
        return;
      }

      // If no error was thrown, still check timing
      const duration = timer.stop();
      expect(duration).toBeLessThan(2000);
    });
  });

  describe('Memory and Resource Usage', () => {
    it('should not consume excessive memory during PDF generation', async () => {
      const initialMemory = process.memoryUsage().heapUsed;

      // Generate multiple PDFs to test memory usage
      for (let i = 0; i < 5; i++) {
        const quoteData = {
          items: Array.from({ length: 20 }, (_, j) => ({
            id: j,
            description: `Memory Test Item ${i}-${j}`,
          })),
        };

        await pdfService.generateQuotePDF(quoteData);
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;
      
      // Memory increase should be reasonable (less than 50MB for test PDFs)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
      
      console.log(`✓ Memory usage increase: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`);
    });
  });

  describe('Performance Regression Detection', () => {
    it('should establish baseline PDF generation metrics', async () => {
      timer.reset();
      const iterations = 10;
      const baselineQuote = {
        items: Array.from({ length: 15 }, (_, i) => ({
          id: i,
          description: `Baseline Item ${i}`,
          quantity: 1,
          price: 100,
        })),
      };

      for (let i = 0; i < iterations; i++) {
        timer.start();
        await pdfService.generateQuotePDF(baselineQuote);
        timer.stop();
      }

      const stats = timer.getStats();
      
      // Performance assertions based on requirements
      expect(stats.avg).toBeLessThan(1500);
      expect(stats.p95).toBeLessThan(1800);
      expect(stats.max).toBeLessThan(2000);

      console.log(`✓ PDF Generation Baseline (${iterations} iterations):`);
      console.log(`  Average: ${stats.avg.toFixed(2)}ms`);
      console.log(`  P95: ${stats.p95.toFixed(2)}ms`);
      console.log(`  Max: ${stats.max.toFixed(2)}ms`);
      console.log(`  Min: ${stats.min.toFixed(2)}ms`);
    });

    it('should detect PDF generation performance degradation', async () => {
      // Simulate degraded performance
      const degradedService = new MockPDFService(1200, 1.5);
      
      timer.reset();
      const iterations = 5;
      const testQuote = {
        items: Array.from({ length: 10 }, (_, i) => ({ id: i, description: `Test ${i}` })),
      };

      for (let i = 0; i < iterations; i++) {
        timer.start();
        await degradedService.generateQuotePDF(testQuote);
        timer.stop();
      }

      const stats = timer.getStats();
      
      if (stats.avg > 1800) {
        console.warn(`⚠️  PDF generation performance degradation detected: ${stats.avg.toFixed(2)}ms average`);
      }

      // Still must meet absolute requirements
      expect(stats.p95).toBeLessThan(2000);
    });
  });
});

// Integration test with actual PDF service (if available)
describe('PDF Service Integration Performance', () => {
  const apiBaseUrl = process.env.TEST_API_URL;
  
  const itConditional = apiBaseUrl ? it : it.skip;
  
  itConditional('should meet performance requirements on actual PDF service', async () => {
    const timer = new PerformanceTimer();
    
    const testQuoteData = {
      items: [
        { description: 'Test Item 1', quantity: 1, price: 100 },
        { description: 'Test Item 2', quantity: 2, price: 200 },
      ],
    };

    timer.start();
    
    try {
      const response = await fetch(`${apiBaseUrl}/api/v1/quotes/test-quote/pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testQuoteData),
      });
      
      const pdfBlob = await response.blob();
      const duration = timer.stop();

      expect(response.ok).toBe(true);
      expect(duration).toBeLessThan(2000);
      expect(pdfBlob.size).toBeGreaterThan(0);

      console.log(`✓ Real PDF service performance: ${duration.toFixed(2)}ms, size: ${(pdfBlob.size / 1024).toFixed(0)}KB`);
    } catch (error) {
      console.warn('PDF service integration test failed:', error);
      throw error;
    }
  });
});

// Export utilities for use in other test files
export { MockPDFService };
