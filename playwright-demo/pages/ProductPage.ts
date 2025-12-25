import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Product Page Object Model
 */
export class ProductPage extends BasePage {
  // Product details
  readonly productTitle: Locator;
  readonly productPrice: Locator;
  readonly productDescription: Locator;
  readonly productImage: Locator;
  readonly productRating: Locator;
  readonly reviewCount: Locator;
  
  // Actions
  readonly quantityInput: Locator;
  readonly increaseQuantityButton: Locator;
  readonly decreaseQuantityButton: Locator;
  readonly addToCartButton: Locator;
  readonly addToWishlistButton: Locator;
  
  // Variants
  readonly colorOptions: Locator;
  readonly sizeOptions: Locator;
  
  // Reviews
  readonly reviewsSection: Locator;
  readonly reviewsList: Locator;
  readonly writeReviewButton: Locator;

  constructor(page: Page) {
    super(page);
    
    // Details
    this.productTitle = page.locator('[data-testid="product-title"]');
    this.productPrice = page.locator('[data-testid="product-price"]');
    this.productDescription = page.locator('[data-testid="product-description"]');
    this.productImage = page.locator('[data-testid="product-image"]');
    this.productRating = page.locator('[data-testid="product-rating"]');
    this.reviewCount = page.locator('[data-testid="review-count"]');
    
    // Actions
    this.quantityInput = page.getByLabel(/quantity/i);
    this.increaseQuantityButton = page.locator('[data-testid="increase-quantity"]');
    this.decreaseQuantityButton = page.locator('[data-testid="decrease-quantity"]');
    this.addToCartButton = page.getByRole('button', { name: /add to cart/i });
    this.addToWishlistButton = page.getByRole('button', { name: /wishlist|favorite/i });
    
    // Variants
    this.colorOptions = page.locator('[data-testid="color-option"]');
    this.sizeOptions = page.locator('[data-testid="size-option"]');
    
    // Reviews
    this.reviewsSection = page.locator('[data-testid="reviews-section"]');
    this.reviewsList = page.locator('[data-testid="review-item"]');
    this.writeReviewButton = page.getByRole('button', { name: /write.*review/i });
  }

  /**
   * Navigate to product page
   */
  async goto(productId: string) {
    await this.navigate(`/products/${productId}`);
    await this.waitForPageLoad();
  }

  /**
   * Get product title
   */
  async getTitle(): Promise<string | null> {
    return await this.productTitle.textContent();
  }

  /**
   * Get product price
   */
  async getPrice(): Promise<number> {
    const priceText = await this.productPrice.textContent();
    return parseFloat(priceText?.replace(/[^0-9.]/g, '') || '0');
  }

  /**
   * Set quantity
   */
  async setQuantity(quantity: number) {
    await this.quantityInput.fill(quantity.toString());
  }

  /**
   * Increase quantity
   */
  async increaseQuantity() {
    await this.increaseQuantityButton.click();
  }

  /**
   * Decrease quantity
   */
  async decreaseQuantity() {
    await this.decreaseQuantityButton.click();
  }

  /**
   * Add product to cart
   */
  async addToCart() {
    await this.addToCartButton.click();
    await this.waitForPageLoad();
  }

  /**
   * Add to cart with quantity
   */
  async addToCartWithQuantity(quantity: number) {
    await this.setQuantity(quantity);
    await this.addToCart();
  }

  /**
   * Select color variant
   */
  async selectColor(color: string) {
    const colorOption = this.colorOptions.filter({ hasText: color });
    await colorOption.click();
  }

  /**
   * Select size variant
   */
  async selectSize(size: string) {
    const sizeOption = this.sizeOptions.filter({ hasText: size });
    await sizeOption.click();
  }

  /**
   * Add to wishlist
   */
  async addToWishlist() {
    await this.addToWishlistButton.click();
  }

  /**
   * Get review count
   */
  async getReviewCount(): Promise<number> {
    const countText = await this.reviewCount.textContent();
    const match = countText?.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }

  /**
   * Get rating value
   */
  async getRating(): Promise<number> {
    const ratingText = await this.productRating.textContent();
    return parseFloat(ratingText || '0');
  }

  /**
   * Check if product is in stock
   */
  async isInStock(): Promise<boolean> {
    const addButton = await this.addToCartButton.isEnabled();
    const outOfStock = this.page.getByText(/out of stock/i);
    return addButton && !(await outOfStock.isVisible());
  }
}
