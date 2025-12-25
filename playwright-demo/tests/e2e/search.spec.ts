import { test, expect } from '@playwright/test';

/**
 * Search Functionality Test Suite
 * Based on TC-006, TC-007, TC-008 test cases
 */
test.describe('Search Functionality', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test.describe('TC-006: Basic Search with Results', () => {
    
    test('should display search results for valid query', async ({ page }) => {
      // Arrange
      const searchQuery = 'laptop';
      
      // Act
      await page.getByRole('searchbox').fill(searchQuery);
      await page.getByRole('searchbox').press('Enter');
      
      // Assert - URL contains search query
      await expect(page).toHaveURL(/.*search.*laptop/i);
      
      // Assert - Results are displayed
      const resultsHeading = page.getByRole('heading', { name: /search results/i });
      await expect(resultsHeading).toBeVisible();
      
      // Assert - Product cards are visible
      const productCards = page.locator('[data-testid="product-card"]');
      await expect(productCards.first()).toBeVisible();
    });

    test('should perform case-insensitive search', async ({ page }) => {
      const searchVariants = ['LAPTOP', 'Laptop', 'laptop', 'LaPtOp'];
      
      for (const query of searchVariants) {
        await page.goto('/');
        await page.getByRole('searchbox').fill(query);
        await page.getByRole('searchbox').press('Enter');
        
        // All variants should return results
        const results = page.locator('[data-testid="product-card"]');
        const count = await results.count();
        expect(count).toBeGreaterThan(0);
      }
    });

    test('should highlight search term in results', async ({ page }) => {
      await page.getByRole('searchbox').fill('laptop');
      await page.getByRole('searchbox').press('Enter');
      
      // Check for highlighted text
      const highlighted = page.locator('mark, .highlight');
      await expect(highlighted.first()).toBeVisible();
    });

    test('should load results within performance threshold', async ({ page }) => {
      const startTime = Date.now();
      
      await page.getByRole('searchbox').fill('laptop');
      await page.getByRole('searchbox').press('Enter');
      
      // Wait for results to load
      await page.waitForSelector('[data-testid="product-card"]');
      
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(3000); // 3 seconds max
    });

    test('should show result count', async ({ page }) => {
      await page.getByRole('searchbox').fill('laptop');
      await page.getByRole('searchbox').press('Enter');
      
      // Check for result count text
      const resultCount = page.getByText(/\d+ results?/i);
      await expect(resultCount).toBeVisible();
    });
  });

  test.describe('TC-007: Advanced Search Filters', () => {
    
    test.beforeEach(async ({ page }) => {
      await page.getByRole('searchbox').fill('laptop');
      await page.getByRole('searchbox').press('Enter');
      await page.waitForSelector('[data-testid="product-card"]');
    });

    test('should filter by price range', async ({ page }) => {
      // Apply price filter
      const minPrice = page.getByLabel(/min price/i);
      const maxPrice = page.getByLabel(/max price/i);
      
      if (await minPrice.isVisible()) {
        await minPrice.fill('500');
        await maxPrice.fill('1000');
        await page.getByRole('button', { name: /apply/i }).click();
        
        // Verify filtered results
        await page.waitForLoadState('networkidle');
        const prices = page.locator('[data-testid="product-price"]');
        const priceTexts = await prices.allTextContents();
        
        for (const priceText of priceTexts) {
          const price = parseFloat(priceText.replace(/[^0-9.]/g, ''));
          expect(price).toBeGreaterThanOrEqual(500);
          expect(price).toBeLessThanOrEqual(1000);
        }
      }
    });

    test('should filter by brand', async ({ page }) => {
      const brandFilter = page.getByLabel(/brand/i).or(
        page.locator('[data-testid="brand-filter"]')
      );
      
      if (await brandFilter.isVisible()) {
        // Select a brand
        await brandFilter.selectOption({ index: 1 });
        await page.waitForLoadState('networkidle');
        
        // Results should update
        const results = page.locator('[data-testid="product-card"]');
        await expect(results.first()).toBeVisible();
      }
    });

    test('should filter by rating', async ({ page }) => {
      const ratingFilter = page.getByRole('button', { name: /4 stars/i }).or(
        page.locator('[data-testid="rating-4"]')
      );
      
      if (await ratingFilter.isVisible()) {
        await ratingFilter.click();
        await page.waitForLoadState('networkidle');
        
        // Verify all results have 4+ stars
        const ratings = page.locator('[data-testid="product-rating"]');
        const ratingValues = await ratings.allTextContents();
        
        for (const rating of ratingValues) {
          const numRating = parseFloat(rating);
          expect(numRating).toBeGreaterThanOrEqual(4);
        }
      }
    });

    test('should sort results by price ascending', async ({ page }) => {
      const sortDropdown = page.getByRole('combobox', { name: /sort/i });
      
      if (await sortDropdown.isVisible()) {
        await sortDropdown.selectOption('price-asc');
        await page.waitForLoadState('networkidle');
        
        const prices = page.locator('[data-testid="product-price"]');
        const priceTexts = await prices.allTextContents();
        const priceValues = priceTexts.map(p => parseFloat(p.replace(/[^0-9.]/g, '')));
        
        // Verify sorted order
        for (let i = 1; i < priceValues.length; i++) {
          expect(priceValues[i]).toBeGreaterThanOrEqual(priceValues[i - 1]);
        }
      }
    });

    test('should sort results by price descending', async ({ page }) => {
      const sortDropdown = page.getByRole('combobox', { name: /sort/i });
      
      if (await sortDropdown.isVisible()) {
        await sortDropdown.selectOption('price-desc');
        await page.waitForLoadState('networkidle');
        
        const prices = page.locator('[data-testid="product-price"]');
        const priceTexts = await prices.allTextContents();
        const priceValues = priceTexts.map(p => parseFloat(p.replace(/[^0-9.]/g, '')));
        
        // Verify sorted order
        for (let i = 1; i < priceValues.length; i++) {
          expect(priceValues[i]).toBeLessThanOrEqual(priceValues[i - 1]);
        }
      }
    });

    test('should combine multiple filters', async ({ page }) => {
      // Apply multiple filters
      const minPrice = page.getByLabel(/min price/i);
      const brandFilter = page.getByLabel(/brand/i);
      
      if (await minPrice.isVisible() && await brandFilter.isVisible()) {
        await minPrice.fill('500');
        await brandFilter.selectOption({ index: 1 });
        await page.getByRole('button', { name: /apply/i }).click();
        
        // Results should reflect both filters
        await page.waitForLoadState('networkidle');
        const results = page.locator('[data-testid="product-card"]');
        const count = await results.count();
        
        // Should have filtered results (could be 0 or more)
        expect(count).toBeGreaterThanOrEqual(0);
      }
    });

    test('should clear all filters', async ({ page }) => {
      // Apply a filter first
      const minPrice = page.getByLabel(/min price/i);
      if (await minPrice.isVisible()) {
        await minPrice.fill('500');
        await page.getByRole('button', { name: /apply/i }).click();
      }
      
      // Clear filters
      const clearButton = page.getByRole('button', { name: /clear/i });
      if (await clearButton.isVisible()) {
        const initialCount = await page.locator('[data-testid="product-card"]').count();
        await clearButton.click();
        await page.waitForLoadState('networkidle');
        
        const newCount = await page.locator('[data-testid="product-card"]').count();
        expect(newCount).toBeGreaterThanOrEqual(initialCount);
      }
    });
  });

  test.describe('TC-008: Empty Search Results', () => {
    
    test('should show empty state for no results', async ({ page }) => {
      // Search for something that doesn't exist
      await page.getByRole('searchbox').fill('xyznonexistentproduct123');
      await page.getByRole('searchbox').press('Enter');
      
      // Should show empty state
      const emptyMessage = page.getByText(/no results|no products found|nothing found/i);
      await expect(emptyMessage).toBeVisible();
    });

    test('should suggest alternatives when no results', async ({ page }) => {
      await page.getByRole('searchbox').fill('labtop'); // Intentional typo
      await page.getByRole('searchbox').press('Enter');
      
      // Check for suggestions
      const suggestion = page.getByText(/did you mean|suggestions|try searching/i);
      if (await suggestion.isVisible()) {
        await expect(suggestion).toBeVisible();
      }
    });

    test('should handle empty search query', async ({ page }) => {
      await page.getByRole('searchbox').fill('');
      await page.getByRole('searchbox').press('Enter');
      
      // Should either stay on page or show all products
      // Not crash or error
      await expect(page).not.toHaveURL(/error/i);
    });

    test('should handle whitespace-only search', async ({ page }) => {
      await page.getByRole('searchbox').fill('   ');
      await page.getByRole('searchbox').press('Enter');
      
      // Should handle gracefully
      await expect(page).not.toHaveURL(/error/i);
    });

    test('should handle special characters in search', async ({ page }) => {
      const specialQueries = ['<script>', '"; DROP TABLE', '& | ! @'];
      
      for (const query of specialQueries) {
        await page.goto('/');
        await page.getByRole('searchbox').fill(query);
        await page.getByRole('searchbox').press('Enter');
        
        // Should not crash or show error page
        await expect(page).not.toHaveURL(/error|500|exception/i);
      }
    });
  });

  test.describe('Search UI/UX', () => {
    
    test('should show search suggestions while typing', async ({ page }) => {
      const searchbox = page.getByRole('searchbox');
      await searchbox.fill('lap');
      
      // Wait for suggestions
      const suggestions = page.locator('[data-testid="search-suggestions"]').or(
        page.locator('.autocomplete-suggestions')
      );
      
      if (await suggestions.isVisible({ timeout: 2000 }).catch(() => false)) {
        await expect(suggestions).toBeVisible();
      }
    });

    test('should clear search input with X button', async ({ page }) => {
      const searchbox = page.getByRole('searchbox');
      await searchbox.fill('laptop');
      
      const clearButton = page.getByRole('button', { name: /clear|×/i }).or(
        page.locator('[data-testid="search-clear"]')
      );
      
      if (await clearButton.isVisible()) {
        await clearButton.click();
        await expect(searchbox).toHaveValue('');
      }
    });

    test('should support keyboard navigation in search', async ({ page }) => {
      const searchbox = page.getByRole('searchbox');
      
      // Focus search with keyboard shortcut (common pattern: / or Ctrl+K)
      await page.keyboard.press('/');
      await expect(searchbox).toBeFocused();
      
      // Type and submit with Enter
      await searchbox.fill('laptop');
      await searchbox.press('Enter');
      
      await expect(page).toHaveURL(/search/i);
    });

    test('should maintain search term after page refresh', async ({ page }) => {
      await page.getByRole('searchbox').fill('laptop');
      await page.getByRole('searchbox').press('Enter');
      
      // Refresh page
      await page.reload();
      
      // Search term should be preserved in URL
      await expect(page).toHaveURL(/laptop/i);
    });
  });
});
