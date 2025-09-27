import { expect, test } from '@playwright/test';

test.describe('Quotes Search and Filter E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/quotes');
    await expect(page.getByText('Quotes')).toBeVisible();
  });

  test('should search quotes and display results', async ({ page }) => {
    // Enter search query
    const searchInput = page.getByPlaceholder(/search quotes/i);
    await searchInput.fill('2024-03');
    
    // Verify API call is made (check network or loading states)
    await expect(page.getByTestId('quote-table')).toBeVisible();
    
    // Verify search results contain the search term
    await expect(page.locator('[data-testid="quote-row"]').first()).toContainText('2024-03');
  });

  test('should handle search with no results gracefully', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search quotes/i);
    await searchInput.fill('nonexistent-search-term-xyz');
    
    // Should show "no results" message
    await expect(page.getByText(/no quotes found/i)).toBeVisible();
  });

  test('should clear search results', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search quotes/i);
    await searchInput.fill('test');
    
    // Wait for results
    await page.waitForTimeout(500);
    
    // Clear search
    await page.getByRole('button', { name: /clear search/i }).click();
    
    // Should show all quotes again
    await expect(searchInput).toHaveValue('');
    await expect(page.locator('[data-testid="quote-row"]')).toHaveCount(10); // assuming 10 per page
  });

  test('should combine search with filters', async ({ page }) => {
    // Apply status filter
    await page.getByRole('button', { name: /quick filters/i }).click();
    await page.getByText('Pending').click();
    
    // Add search
    const searchInput = page.getByPlaceholder(/search quotes/i);
    await searchInput.fill('ACME');
    
    // Should show only pending quotes from ACME
    const quotes = page.locator('[data-testid="quote-row"]');
    await expect(quotes).toHaveCount(3); // example expectation
    
    for (const quote of await quotes.all()) {
      await expect(quote).toContainText('Pending');
      await expect(quote).toContainText('ACME');
    }
  });
});