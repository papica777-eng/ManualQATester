import { test, expect } from '@playwright/test';

/**
 * Shopping Cart Test Suite
 * E2E tests for cart functionality
 */
test.describe('Shopping Cart', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test.describe('Add to Cart', () => {
    
    test('should add product to cart from product listing', async ({ page }) => {
      // Find first product and add to cart
      const addButton = page.locator('[data-testid="add-to-cart"]').first();
      
      if (await addButton.isVisible()) {
        await addButton.click();
        
        // Verify cart count updates
        const cartCount = page.locator('[data-testid="cart-count"]');
        await expect(cartCount).toHaveText('1');
      }
    });

    test('should add product to cart from product detail page', async ({ page }) => {
      // Navigate to a product
      const productCard = page.locator('[data-testid="product-card"]').first();
      if (await productCard.isVisible()) {
        await productCard.click();
        
        // Add to cart from detail page
        const addButton = page.getByRole('button', { name: /add to cart/i });
        await addButton.click();
        
        // Verify success message or cart update
        const successMessage = page.getByText(/added to cart/i);
        await expect(successMessage).toBeVisible();
      }
    });

    test('should allow adding multiple quantities', async ({ page }) => {
      const productCard = page.locator('[data-testid="product-card"]').first();
      if (await productCard.isVisible()) {
        await productCard.click();
        
        // Select quantity
        const quantityInput = page.getByLabel(/quantity/i).or(
          page.locator('[data-testid="quantity-input"]')
        );
        
        if (await quantityInput.isVisible()) {
          await quantityInput.fill('3');
          
          const addButton = page.getByRole('button', { name: /add to cart/i });
          await addButton.click();
          
          // Verify quantity in cart
          const cartCount = page.locator('[data-testid="cart-count"]');
          await expect(cartCount).toHaveText('3');
        }
      }
    });

    test('should prevent adding zero quantity', async ({ page }) => {
      const productCard = page.locator('[data-testid="product-card"]').first();
      if (await productCard.isVisible()) {
        await productCard.click();
        
        const quantityInput = page.getByLabel(/quantity/i);
        if (await quantityInput.isVisible()) {
          await quantityInput.fill('0');
          
          const addButton = page.getByRole('button', { name: /add to cart/i });
          
          // Button should be disabled or show error
          const isDisabled = await addButton.isDisabled();
          if (!isDisabled) {
            await addButton.click();
            const errorMessage = page.getByText(/invalid|minimum|at least/i);
            await expect(errorMessage).toBeVisible();
          }
        }
      }
    });

    test('should prevent adding negative quantity', async ({ page }) => {
      const productCard = page.locator('[data-testid="product-card"]').first();
      if (await productCard.isVisible()) {
        await productCard.click();
        
        const quantityInput = page.getByLabel(/quantity/i);
        if (await quantityInput.isVisible()) {
          await quantityInput.fill('-1');
          
          const addButton = page.getByRole('button', { name: /add to cart/i });
          
          // Should be prevented
          const inputValue = await quantityInput.inputValue();
          expect(parseInt(inputValue)).toBeGreaterThanOrEqual(0);
        }
      }
    });
  });

  test.describe('View Cart', () => {
    
    test.beforeEach(async ({ page }) => {
      // Add a product first
      const addButton = page.locator('[data-testid="add-to-cart"]').first();
      if (await addButton.isVisible()) {
        await addButton.click();
      }
    });

    test('should display cart contents', async ({ page }) => {
      // Navigate to cart
      const cartIcon = page.locator('[data-testid="cart-icon"]').or(
        page.getByRole('link', { name: /cart/i })
      );
      await cartIcon.click();
      
      // Verify cart page elements
      await expect(page).toHaveURL(/cart/i);
      
      const cartItem = page.locator('[data-testid="cart-item"]');
      await expect(cartItem.first()).toBeVisible();
    });

    test('should show product details in cart', async ({ page }) => {
      const cartIcon = page.getByRole('link', { name: /cart/i });
      if (await cartIcon.isVisible()) {
        await cartIcon.click();
        
        // Verify product info is shown
        const productName = page.locator('[data-testid="cart-item-name"]');
        const productPrice = page.locator('[data-testid="cart-item-price"]');
        const productQuantity = page.locator('[data-testid="cart-item-quantity"]');
        
        await expect(productName.first()).toBeVisible();
        await expect(productPrice.first()).toBeVisible();
        await expect(productQuantity.first()).toBeVisible();
      }
    });

    test('should calculate correct subtotal', async ({ page }) => {
      const cartIcon = page.getByRole('link', { name: /cart/i });
      if (await cartIcon.isVisible()) {
        await cartIcon.click();
        
        // Get item prices and quantities
        const prices = await page.locator('[data-testid="cart-item-price"]').allTextContents();
        const quantities = await page.locator('[data-testid="cart-item-quantity"]').allInnerTexts();
        const subtotal = page.locator('[data-testid="cart-subtotal"]');
        
        if (prices.length > 0 && await subtotal.isVisible()) {
          let expectedTotal = 0;
          for (let i = 0; i < prices.length; i++) {
            const price = parseFloat(prices[i].replace(/[^0-9.]/g, ''));
            const qty = parseInt(quantities[i]) || 1;
            expectedTotal += price * qty;
          }
          
          const actualSubtotal = await subtotal.textContent();
          const actualValue = parseFloat(actualSubtotal?.replace(/[^0-9.]/g, '') || '0');
          
          expect(actualValue).toBeCloseTo(expectedTotal, 2);
        }
      }
    });
  });

  test.describe('Update Cart', () => {
    
    test.beforeEach(async ({ page }) => {
      const addButton = page.locator('[data-testid="add-to-cart"]').first();
      if (await addButton.isVisible()) {
        await addButton.click();
      }
      
      const cartIcon = page.getByRole('link', { name: /cart/i });
      if (await cartIcon.isVisible()) {
        await cartIcon.click();
      }
    });

    test('should increase item quantity', async ({ page }) => {
      const increaseButton = page.locator('[data-testid="increase-quantity"]').first();
      
      if (await increaseButton.isVisible()) {
        const quantityBefore = await page.locator('[data-testid="cart-item-quantity"]').first().textContent();
        await increaseButton.click();
        
        await page.waitForLoadState('networkidle');
        const quantityAfter = await page.locator('[data-testid="cart-item-quantity"]').first().textContent();
        
        expect(parseInt(quantityAfter || '0')).toBe(parseInt(quantityBefore || '0') + 1);
      }
    });

    test('should decrease item quantity', async ({ page }) => {
      // First increase so we can decrease
      const increaseButton = page.locator('[data-testid="increase-quantity"]').first();
      if (await increaseButton.isVisible()) {
        await increaseButton.click();
        await page.waitForLoadState('networkidle');
      }
      
      const decreaseButton = page.locator('[data-testid="decrease-quantity"]').first();
      if (await decreaseButton.isVisible()) {
        const quantityBefore = await page.locator('[data-testid="cart-item-quantity"]').first().textContent();
        await decreaseButton.click();
        
        await page.waitForLoadState('networkidle');
        const quantityAfter = await page.locator('[data-testid="cart-item-quantity"]').first().textContent();
        
        expect(parseInt(quantityAfter || '0')).toBe(parseInt(quantityBefore || '0') - 1);
      }
    });

    test('should remove item from cart', async ({ page }) => {
      const removeButton = page.locator('[data-testid="remove-item"]').first().or(
        page.getByRole('button', { name: /remove/i }).first()
      );
      
      if (await removeButton.isVisible()) {
        const itemsBefore = await page.locator('[data-testid="cart-item"]').count();
        await removeButton.click();
        
        await page.waitForLoadState('networkidle');
        const itemsAfter = await page.locator('[data-testid="cart-item"]').count();
        
        expect(itemsAfter).toBe(itemsBefore - 1);
      }
    });

    test('should show empty cart message when all items removed', async ({ page }) => {
      const removeButton = page.locator('[data-testid="remove-item"]').first();
      
      if (await removeButton.isVisible()) {
        // Remove all items
        while (await page.locator('[data-testid="cart-item"]').count() > 0) {
          await page.locator('[data-testid="remove-item"]').first().click();
          await page.waitForLoadState('networkidle');
        }
        
        // Verify empty cart message
        const emptyMessage = page.getByText(/empty|no items/i);
        await expect(emptyMessage).toBeVisible();
      }
    });
  });

  test.describe('Cart Persistence', () => {
    
    test('should persist cart after page refresh', async ({ page }) => {
      // Add product
      const addButton = page.locator('[data-testid="add-to-cart"]').first();
      if (await addButton.isVisible()) {
        await addButton.click();
        
        // Get cart count
        const cartCount = page.locator('[data-testid="cart-count"]');
        const countBefore = await cartCount.textContent();
        
        // Refresh page
        await page.reload();
        
        // Verify cart persisted
        await expect(cartCount).toHaveText(countBefore || '1');
      }
    });

    test('should persist cart in new browser tab', async ({ page, context }) => {
      // Add product
      const addButton = page.locator('[data-testid="add-to-cart"]').first();
      if (await addButton.isVisible()) {
        await addButton.click();
        
        // Open new tab
        const newPage = await context.newPage();
        await newPage.goto('/');
        
        // Verify cart in new tab
        const cartCount = newPage.locator('[data-testid="cart-count"]');
        await expect(cartCount).toHaveText('1');
        
        await newPage.close();
      }
    });
  });
});
