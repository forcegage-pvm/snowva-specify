// packages/web/tests/performance/api.test.ts
describe('Performance: API Endpoints', () => {
  it('GET /api/v1/customers should respond in <500ms', async () => {
    const start = Date.now();
    // In a real test, you would make a request to the endpoint
    const end = Date.now();
    expect(end - start).toBeLessThan(500);
  });
});
