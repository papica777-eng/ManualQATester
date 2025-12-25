import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Checkout Page Object Model
 */
export class CheckoutPage extends BasePage {
  // Step indicators
  readonly stepsIndicator: Locator;
  readonly currentStep: Locator;
  
  // Shipping form
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly addressInput: Locator;
  readonly cityInput: Locator;
  readonly stateInput: Locator;
  readonly zipCodeInput: Locator;
  readonly phoneInput: Locator;
  
  // Payment form
  readonly cardNumberInput: Locator;
  readonly expirationInput: Locator;
  readonly cvvInput: Locator;
  readonly nameOnCardInput: Locator;
  
  // Order summary
  readonly orderItems: Locator;
  readonly subtotal: Locator;
  readonly shippingCost: Locator;
  readonly tax: Locator;
  readonly orderTotal: Locator;
  
  // Buttons
  readonly continueButton: Locator;
  readonly placeOrderButton: Locator;
  readonly editButton: Locator;
  
  // Confirmation
  readonly confirmationMessage: Locator;
  readonly orderNumber: Locator;

  constructor(page: Page) {
    super(page);
    
    // Steps
    this.stepsIndicator = page.locator('[data-testid="checkout-steps"]');
    this.currentStep = page.locator('[data-testid="current-step"]');
    
    // Shipping
    this.firstNameInput = page.getByLabel(/first name/i);
    this.lastNameInput = page.getByLabel(/last name/i);
    this.addressInput = page.getByLabel(/address/i).first();
    this.cityInput = page.getByLabel(/city/i);
    this.stateInput = page.getByLabel(/state|province/i);
    this.zipCodeInput = page.getByLabel(/zip|postal/i);
    this.phoneInput = page.getByLabel(/phone/i);
    
    // Payment
    this.cardNumberInput = page.getByLabel(/card number/i);
    this.expirationInput = page.getByLabel(/expir/i);
    this.cvvInput = page.getByLabel(/cvv|security|cvc/i);
    this.nameOnCardInput = page.getByLabel(/name on card/i);
    
    // Summary
    this.orderItems = page.locator('[data-testid="order-items"]');
    this.subtotal = page.locator('[data-testid="subtotal"]');
    this.shippingCost = page.locator('[data-testid="shipping-cost"]');
    this.tax = page.locator('[data-testid="tax"]');
    this.orderTotal = page.locator('[data-testid="order-total"]');
    
    // Buttons
    this.continueButton = page.getByRole('button', { name: /continue|next/i });
    this.placeOrderButton = page.getByRole('button', { name: /place order|confirm/i });
    this.editButton = page.getByRole('button', { name: /edit|modify/i });
    
    // Confirmation
    this.confirmationMessage = page.getByText(/thank you|order confirmed/i);
    this.orderNumber = page.locator('[data-testid="order-number"]');
  }

  /**
   * Navigate to checkout
   */
  async goto() {
    await this.navigate('/checkout');
    await this.waitForPageLoad();
  }

  /**
   * Fill shipping information
   */
  async fillShippingInfo(info: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    phone: string;
  }) {
    await this.firstNameInput.fill(info.firstName);
    await this.lastNameInput.fill(info.lastName);
    await this.addressInput.fill(info.address);
    await this.cityInput.fill(info.city);
    await this.stateInput.fill(info.state);
    await this.zipCodeInput.fill(info.zipCode);
    await this.phoneInput.fill(info.phone);
  }

  /**
   * Fill payment information
   */
  async fillPaymentInfo(info: {
    cardNumber: string;
    expiration: string;
    cvv: string;
    nameOnCard: string;
  }) {
    await this.cardNumberInput.fill(info.cardNumber);
    await this.expirationInput.fill(info.expiration);
    await this.cvvInput.fill(info.cvv);
    await this.nameOnCardInput.fill(info.nameOnCard);
  }

  /**
   * Continue to next step
   */
  async continue() {
    await this.continueButton.click();
    await this.waitForPageLoad();
  }

  /**
   * Place order
   */
  async placeOrder() {
    await this.placeOrderButton.click();
    await this.waitForPageLoad();
  }

  /**
   * Get order total
   */
  async getOrderTotal(): Promise<number> {
    const totalText = await this.orderTotal.textContent();
    return parseFloat(totalText?.replace(/[^0-9.]/g, '') || '0');
  }

  /**
   * Get order number from confirmation
   */
  async getOrderNumber(): Promise<string | null> {
    if (await this.orderNumber.isVisible()) {
      return await this.orderNumber.textContent();
    }
    return null;
  }

  /**
   * Check if on confirmation page
   */
  async isOrderConfirmed(): Promise<boolean> {
    return await this.confirmationMessage.isVisible();
  }

  /**
   * Complete full checkout with test data
   */
  async completeCheckout() {
    // Shipping
    await this.fillShippingInfo({
      firstName: 'Test',
      lastName: 'User',
      address: '123 Test Street',
      city: 'Test City',
      state: 'CA',
      zipCode: '12345',
      phone: '555-123-4567'
    });
    await this.continue();

    // Payment
    await this.fillPaymentInfo({
      cardNumber: '4111111111111111',
      expiration: '12/25',
      cvv: '123',
      nameOnCard: 'Test User'
    });
    await this.continue();

    // Place order
    await this.placeOrder();
  }
}
