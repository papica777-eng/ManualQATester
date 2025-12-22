import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';

/**
 * Login Feature Test Suite
 * Demonstrates E2E testing best practices
 */
test.describe('Login Functionality', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('should display login page correctly', async () => {
    // Verify page elements are visible
    await expect(loginPage.usernameInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.loginButton).toBeVisible();
    
    // Verify page title
    const title = await loginPage.getTitle();
    expect(title).toContain('Login');
  });

  test('should login with valid credentials', async ({ page }) => {
    // Arrange
    const username = 'testuser';
    const password = 'Test@123';

    // Act
    await loginPage.login(username, password);

    // Assert - verify navigation to dashboard
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.getByText('Welcome')).toBeVisible();
  });

  test('should show error with invalid credentials', async () => {
    // Arrange
    const username = 'invaliduser';
    const password = 'wrongpassword';

    // Act
    await loginPage.login(username, password);

    // Assert - verify error message
    await expect(loginPage.errorMessage).toBeVisible();
    const errorText = await loginPage.getErrorMessage();
    expect(errorText).toContain('Invalid credentials');
  });

  test('should validate required fields', async () => {
    // Act - try to login with empty fields
    await loginPage.loginButton.click();

    // Assert - button should be disabled or show validation
    const isEnabled = await loginPage.isLoginButtonEnabled();
    expect(isEnabled).toBeFalsy();
  });

  test('should remember login when checkbox is checked', async ({ page, context }) => {
    // Arrange
    const username = 'testuser';
    const password = 'Test@123';

    // Act
    await loginPage.loginWithRememberMe(username, password);

    // Assert - verify cookie is set
    const cookies = await context.cookies();
    const rememberMeCookie = cookies.find(c => c.name === 'remember_me');
    expect(rememberMeCookie).toBeDefined();
  });

  test('should navigate to forgot password page', async ({ page }) => {
    // Act
    await loginPage.clickForgotPassword();

    // Assert
    await expect(page).toHaveURL(/.*forgot-password/);
  });

  test.describe('Field Validation', () => {
    test('should show error for invalid email format', async () => {
      await loginPage.usernameInput.fill('notanemail');
      await loginPage.passwordInput.fill('password');
      await loginPage.loginButton.click();

      await expect(loginPage.errorMessage).toContainText('valid email');
    });

    test('should show error for short password', async () => {
      await loginPage.usernameInput.fill('test@test.com');
      await loginPage.passwordInput.fill('123');
      await loginPage.loginButton.click();

      await expect(loginPage.errorMessage).toContainText('at least 6 characters');
    });
  });

  test.describe('Security Tests', () => {
    test('should mask password input', async () => {
      await loginPage.passwordInput.fill('SecretPassword');
      
      const inputType = await loginPage.passwordInput.getAttribute('type');
      expect(inputType).toBe('password');
    });

    test('should prevent SQL injection', async () => {
      const sqlInjection = "' OR '1'='1";
      
      await loginPage.login(sqlInjection, sqlInjection);
      
      await expect(loginPage.errorMessage).toBeVisible();
    });
  });
});
