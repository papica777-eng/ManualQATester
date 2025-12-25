import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Cart Page Object Model
 */
export class CartPage extends BasePage {
  // Locators
  readonly cartIcon: Locator;
  readonly cartCount: Locator;
  readonly cartItems: Locator;
  readonly emptyCartMessage: Locator;
  readonly subtotal: Locator;
  readonly checkoutButton: Locator;
  readonly continueShoppingButton: Locator;

  constructor(page: Page) {
    super(page);
    
    this.cartIcon = page.locator('[data-testid="cart-icon"]');
    this.cartCount = page.locator('[data-testid="cart-count"]');
    this.cartItems = page.locator('[data-testid="cart-item"]');
    this.emptyCartMessage = page.getByText(/empty|no items/i);
    this.subtotal = page.locator('[data-testid="cart-subtotal"]');
    this.checkoutButton = page.getByRole('button', { name: /checkout|proceed/i });
    this.continueShoppingButton = page.getByRole('button', { name: /continue shopping/i });
  }

  /**
   * Navigate to cart page
   */
  async goto() {
    await this.navigate('/cart');
    await this.waitForPageLoad();
  }

  /**
   * Open cart from header icon
   */
  async openCart() {
    await this.cartIcon.click();
    await this.waitForPageLoad();
  }

  /**
   * Get cart item count
   */
  async getItemCount(): Promise<number> {
    const countText = await this.cartCount.textContent();
    return parseInt(countText || '0');
  }

  /**
   * Get number of items in cart
   */
  async getCartItemsCount(): Promise<number> {
    return await this.cartItems.count();
  }

  /**
   * Remove item from cart by index
   */
  async removeItem(index: number = 0) {
    const removeButton = this.cartItems.nth(index).locator('[data-testid="remove-item"]');
    await removeButton.click();
    await this.waitForPageLoad();
  }

  /**
   * Update item quantity
   */
  async updateQuantity(index: number, quantity: number) {
    const quantityInput = this.cartItems.nth(index).locator('[data-testid="quantity-input"]');
    await quantityInput.fill(quantity.toString());
    await quantityInput.blur();
    await this.waitForPageLoad();
  }

  /**
   * Increase item quantity
   */
  async increaseQuantity(index: number = 0) {
    const increaseButton = this.cartItems.nth(index).locator('[data-testid="increase-quantity"]');
    await increaseButton.click();
    await this.waitForPageLoad();
  }

  /**
   * Decrease item quantity
   */
  async decreaseQuantity(index: number = 0) {
    const decreaseButton = this.cartItems.nth(index).locator('[data-testid="decrease-quantity"]');
    await decreaseButton.click();
    await this.waitForPageLoad();
  }

  /**
   * Get subtotal value
   */
  async getSubtotal(): Promise<number> {
    const subtotalText = await this.subtotal.textContent();
    return parseFloat(subtotalText?.replace(/[^0-9.]/g, '') || '0');
  }

  /**
   * Proceed to checkout
   */
  async proceedToCheckout() {
    await this.checkoutButton.click();
    await this.waitForPageLoad();
  }

  /**
   * Check if cart is empty
   */
  async isEmpty(): Promise<boolean> {
    return await this.emptyCartMessage.isVisible();
  }

  /**
   * Clear all items from cart
   */
  async clearCart() {
    while (await this.cartItems.count() > 0) {
      await this.removeItem(0);
    }
  }
}
