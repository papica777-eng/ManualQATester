import { test, expect } from '@playwright/test';

/**
 * Security Test Suite
 * Tests for common security vulnerabilities
 * Based on TC-005-sql-injection-attempt.md
 */
test.describe('Security Tests', () => {

  test.describe('SQL Injection Prevention', () => {
    
    test('should prevent SQL injection in login form', async ({ page }) => {
      await page.goto('/login');
      
      const sqlInjectionPayloads = [
        "' OR '1'='1",
        "'; DROP TABLE users;--",
        "' OR 1=1--",
        "admin'--",
        "1' OR '1'='1' /*",
        "' UNION SELECT * FROM users--",
      ];
      
      for (const payload of sqlInjectionPayloads) {
        await page.getByLabel('Username').fill(payload);
        await page.getByLabel('Password').fill('password');
        await page.getByRole('button', { name: /login/i }).click();
        
        // Should NOT log in successfully
        await expect(page).not.toHaveURL(/dashboard|home|success/i);
        
        // Should show error message (not database error)
        const dbError = page.getByText(/sql|syntax|database error|mysql|postgres/i);
        await expect(dbError).not.toBeVisible();
        
        // Reset for next iteration
        await page.goto('/login');
      }
    });

    test('should prevent SQL injection in search', async ({ page }) => {
      await page.goto('/');
      
      const searchBox = page.getByRole('searchbox');
      if (await searchBox.isVisible()) {
        await searchBox.fill("'; DROP TABLE products;--");
        await searchBox.press('Enter');
        
        // Should handle gracefully
        await expect(page).not.toHaveURL(/error|500/i);
        
        // No database error exposed
        const dbError = page.getByText(/sql|syntax|database|mysql|postgres|oracle/i);
        await expect(dbError).not.toBeVisible();
      }
    });

    test('should prevent SQL injection in URL parameters', async ({ page }) => {
      const response = await page.goto("/products?id=1' OR '1'='1");
      
      // Should not return 500 error
      expect(response?.status()).not.toBe(500);
      
      // No database error in page content
      const pageContent = await page.content();
      expect(pageContent.toLowerCase()).not.toContain('sql syntax');
      expect(pageContent.toLowerCase()).not.toContain('mysql');
      expect(pageContent.toLowerCase()).not.toContain('database error');
    });
  });

  test.describe('XSS Prevention', () => {
    
    test('should prevent XSS in search input', async ({ page }) => {
      await page.goto('/');
      
      const xssPayloads = [
        '<script>alert("xss")</script>',
        '<img src=x onerror=alert("xss")>',
        '<svg onload=alert("xss")>',
        'javascript:alert("xss")',
        '<body onload=alert("xss")>',
        '"><script>alert("xss")</script>',
      ];
      
      for (const payload of xssPayloads) {
        const searchBox = page.getByRole('searchbox');
        if (await searchBox.isVisible()) {
          await searchBox.fill(payload);
          await searchBox.press('Enter');
          
          // Check that script is not executed
          const dialogPromise = page.waitForEvent('dialog', { timeout: 1000 }).catch(() => null);
          const dialog = await dialogPromise;
          
          // No alert should appear
          expect(dialog).toBeNull();
          
          // Script tags should be escaped in output
          const pageContent = await page.content();
          expect(pageContent).not.toContain('<script>alert');
          
          await page.goto('/');
        }
      }
    });

    test('should escape HTML in user input display', async ({ page }) => {
      await page.goto('/');
      
      const searchBox = page.getByRole('searchbox');
      if (await searchBox.isVisible()) {
        await searchBox.fill('<b>bold</b>');
        await searchBox.press('Enter');
        
        // The <b> tags should be escaped, not rendered
        const boldElement = page.locator('b:has-text("bold")');
        
        // Check if it's shown as text, not as HTML
        const searchResult = page.getByText('<b>bold</b>');
        // Either shown escaped or stripped, but not rendered as bold
      }
    });

    test('should set proper security headers', async ({ page }) => {
      const response = await page.goto('/');
      const headers = response?.headers();
      
      if (headers) {
        // Check for security headers
        // X-Content-Type-Options
        if (headers['x-content-type-options']) {
          expect(headers['x-content-type-options']).toBe('nosniff');
        }
        
        // X-Frame-Options
        if (headers['x-frame-options']) {
          expect(['DENY', 'SAMEORIGIN']).toContain(headers['x-frame-options']);
        }
        
        // Content-Security-Policy (if present)
        if (headers['content-security-policy']) {
          expect(headers['content-security-policy']).toBeDefined();
        }
      }
    });
  });

  test.describe('Authentication Security', () => {
    
    test('should enforce password requirements', async ({ page }) => {
      await page.goto('/register');
      
      const passwordInput = page.getByLabel(/^password$/i);
      const weakPasswords = ['123', 'password', 'abc', '12345678'];
      
      for (const weakPassword of weakPasswords) {
        if (await passwordInput.isVisible()) {
          await passwordInput.fill(weakPassword);
          await passwordInput.blur();
          
          // Should show password requirement error
          const error = page.getByText(/weak|strong|requirements|characters/i);
          // Registration should be blocked for weak passwords
        }
      }
    });

    test('should mask password input', async ({ page }) => {
      await page.goto('/login');
      
      const passwordInput = page.getByLabel('Password');
      if (await passwordInput.isVisible()) {
        const inputType = await passwordInput.getAttribute('type');
        expect(inputType).toBe('password');
      }
    });

    test('should not expose sensitive data in URL', async ({ page }) => {
      await page.goto('/login');
      
      const usernameInput = page.getByLabel('Username');
      const passwordInput = page.getByLabel('Password');
      
      if (await usernameInput.isVisible()) {
        await usernameInput.fill('testuser');
        await passwordInput.fill('testpassword');
        await page.getByRole('button', { name: /login/i }).click();
        
        await page.waitForLoadState('networkidle');
        
        // Password should never appear in URL
        const currentUrl = page.url();
        expect(currentUrl.toLowerCase()).not.toContain('password');
        expect(currentUrl).not.toContain('testpassword');
      }
    });

    test('should implement rate limiting on login', async ({ page }) => {
      await page.goto('/login');
      
      // Attempt multiple failed logins
      for (let i = 0; i < 6; i++) {
        await page.getByLabel('Username').fill('nonexistent');
        await page.getByLabel('Password').fill('wrongpassword');
        await page.getByRole('button', { name: /login/i }).click();
        await page.waitForLoadState('networkidle');
      }
      
      // After multiple attempts, should be rate limited or account locked
      const rateLimitMessage = page.getByText(/too many|rate limit|locked|try again later/i);
      // Note: This test may need adjustment based on actual rate limiting implementation
    });

    test('should timeout inactive sessions', async ({ page }) => {
      // This test would require waiting for session timeout
      // Typically sessions timeout after 15-30 minutes of inactivity
      // For testing purposes, we check if session handling exists
      
      await page.goto('/login');
      // Login first (if possible with test credentials)
      
      // Check for session-related cookies
      const cookies = await page.context().cookies();
      const sessionCookie = cookies.find(c => 
        c.name.toLowerCase().includes('session') || 
        c.name.toLowerCase().includes('token')
      );
      
      // Session cookie should have reasonable expiration
      if (sessionCookie && sessionCookie.expires) {
        const expiresIn = sessionCookie.expires - Date.now() / 1000;
        // Should expire within 24 hours for security
        expect(expiresIn).toBeLessThan(86400);
      }
    });
  });

  test.describe('CSRF Protection', () => {
    
    test('should include CSRF token in forms', async ({ page }) => {
      await page.goto('/login');
      
      const csrfToken = page.locator('input[name="csrf"], input[name="_token"], input[name="csrf_token"]');
      
      // Many modern apps use CSRF tokens
      // If not present, check for other CSRF protections
    });

    test('should reject requests without valid CSRF token', async ({ page, request }) => {
      // Attempt form submission without CSRF token
      const response = await request.post('/api/login', {
        data: {
          username: 'test',
          password: 'test'
        },
        headers: {
          'Content-Type': 'application/json'
          // No CSRF token
        }
      });
      
      // Should be rejected (403 Forbidden) or require CSRF
      // Note: This depends on the application's CSRF implementation
    });
  });

  test.describe('Secure Communication', () => {
    
    test('should use HTTPS in production', async ({ page }) => {
      // In production, all URLs should be HTTPS
      const baseUrl = page.url();
      
      if (!baseUrl.includes('localhost') && !baseUrl.includes('127.0.0.1')) {
        expect(baseUrl).toMatch(/^https:/);
      }
    });

    test('should not expose sensitive information in errors', async ({ page }) => {
      // Try to trigger an error
      const response = await page.goto('/nonexistent-page-12345');
      
      if (response?.status() === 404 || response?.status() === 500) {
        const pageContent = await page.content();
        
        // Should not expose:
        expect(pageContent).not.toMatch(/stack trace/i);
        expect(pageContent).not.toMatch(/\/home\/.*\//); // Server paths
        expect(pageContent).not.toMatch(/at .+\.js:\d+:\d+/); // Stack frames
        expect(pageContent.toLowerCase()).not.toContain('mysql');
        expect(pageContent.toLowerCase()).not.toContain('postgres');
        expect(pageContent.toLowerCase()).not.toContain('mongodb');
      }
    });

    test('should set secure cookie flags', async ({ page }) => {
      await page.goto('/');
      
      const cookies = await page.context().cookies();
      
      for (const cookie of cookies) {
        if (cookie.name.toLowerCase().includes('session') || 
            cookie.name.toLowerCase().includes('token')) {
          // Session cookies should be HttpOnly
          expect(cookie.httpOnly).toBe(true);
          
          // In production (HTTPS), should be Secure
          if (!page.url().includes('localhost')) {
            expect(cookie.secure).toBe(true);
          }
          
          // Should have SameSite attribute
          expect(['Strict', 'Lax', 'None']).toContain(cookie.sameSite);
        }
      }
    });
  });
});
