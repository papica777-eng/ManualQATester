import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Search Page Object Model
 */
export class SearchPage extends BasePage {
  // Locators
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly searchResults: Locator;
  readonly productCards: Locator;
  readonly resultCount: Locator;
  readonly noResultsMessage: Locator;
  readonly sortDropdown: Locator;
  readonly filterSidebar: Locator;
  readonly priceMinInput: Locator;
  readonly priceMaxInput: Locator;
  readonly applyFiltersButton: Locator;
  readonly clearFiltersButton: Locator;
  readonly suggestions: Locator;

  constructor(page: Page) {
    super(page);
    
    // Search elements
    this.searchInput = page.getByRole('searchbox');
    this.searchButton = page.getByRole('button', { name: /search/i });
    this.suggestions = page.locator('[data-testid="search-suggestions"]');
    
    // Results elements
    this.searchResults = page.locator('[data-testid="search-results"]');
    this.productCards = page.locator('[data-testid="product-card"]');
    this.resultCount = page.locator('[data-testid="result-count"]');
    this.noResultsMessage = page.getByText(/no results|nothing found/i);
    
    // Filter elements
    this.sortDropdown = page.getByRole('combobox', { name: /sort/i });
    this.filterSidebar = page.locator('[data-testid="filter-sidebar"]');
    this.priceMinInput = page.getByLabel(/min price/i);
    this.priceMaxInput = page.getByLabel(/max price/i);
    this.applyFiltersButton = page.getByRole('button', { name: /apply/i });
    this.clearFiltersButton = page.getByRole('button', { name: /clear/i });
  }

  /**
   * Navigate to search with query
   */
  async searchFor(query: string) {
    await this.searchInput.fill(query);
    await this.searchInput.press('Enter');
    await this.waitForPageLoad();
  }

  /**
   * Get search results count
   */
  async getResultCount(): Promise<number> {
    const countText = await this.resultCount.textContent();
    const match = countText?.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }

  /**
   * Apply price filter
   */
  async filterByPrice(min: number, max: number) {
    await this.priceMinInput.fill(min.toString());
    await this.priceMaxInput.fill(max.toString());
    await this.applyFiltersButton.click();
    await this.waitForPageLoad();
  }

  /**
   * Sort results
   */
  async sortBy(option: string) {
    await this.sortDropdown.selectOption(option);
    await this.waitForPageLoad();
  }

  /**
   * Clear all filters
   */
  async clearFilters() {
    if (await this.clearFiltersButton.isVisible()) {
      await this.clearFiltersButton.click();
      await this.waitForPageLoad();
    }
  }

  /**
   * Get all product prices from results
   */
  async getProductPrices(): Promise<number[]> {
    const priceElements = this.page.locator('[data-testid="product-price"]');
    const priceTexts = await priceElements.allTextContents();
    return priceTexts.map(p => parseFloat(p.replace(/[^0-9.]/g, '')));
  }

  /**
   * Check if results are empty
   */
  async hasNoResults(): Promise<boolean> {
    return await this.noResultsMessage.isVisible();
  }

  /**
   * Get search suggestions
   */
  async getSuggestions(): Promise<string[]> {
    if (await this.suggestions.isVisible()) {
      const items = this.suggestions.locator('li, [data-testid="suggestion-item"]');
      return await items.allTextContents();
    }
    return [];
  }
}
