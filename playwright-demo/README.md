# 🎭 Playwright + TypeScript Test Automation Framework

A comprehensive, production-ready Playwright test automation framework with TypeScript demonstrating modern testing practices and patterns.

## 📋 Table of Contents

1. [Playwright with TypeScript Overview](#1-playwright-with-typescript-overview)
2. [End-to-End Test Setup](#2-end-to-end-test-setup)
3. [Core Concepts](#3-core-playwright-test-automation-concepts)
4. [Best Practices](#4-playwright-test-automation-best-practices)
5. [Framework Architecture](#5-building-a-playwright-test-automation-framework)
6. [API Testing Guide](#6-playwright-with-typescript-api-testing-guide)
7. [Network Interception & Mocking](#7-playwright-network-interception--mocking)
8. [Debugging & Reporting](#8-debugging--reporting)
9. [CI/CD Pipeline Integration](#9-cicd-pipeline-integration)
10. [Parallel & Cross-Browser Testing](#10-parallel--cross-browser-test-automation)
11. [Interview Questions](#11-playwright-interview-questions)
12. [Cheat Sheet](#12-playwright--typescript-cheat-sheet)

---

## 1. Playwright with TypeScript Overview

### What is Playwright?

Playwright is a modern end-to-end testing framework by Microsoft that enables:
- **Cross-browser testing**: Chromium, Firefox, WebKit
- **Auto-wait**: Built-in smart waiting mechanisms
- **Network control**: Request interception and mocking
- **Mobile emulation**: Test on mobile devices
- **API testing**: REST API validation
- **Parallel execution**: Fast test execution

### Why TypeScript?

- **Type safety**: Catch errors at compile-time
- **IntelliSense**: Better IDE support
- **Refactoring**: Easier code maintenance
- **Modern JavaScript**: ES6+ features
- **Better documentation**: Self-documenting code

### Key Features

```typescript
// Auto-waiting - no manual waits needed
await page.click('button'); // Waits automatically

// Multi-browser support
test.use({ browserName: 'firefox' });

// Network interception
await page.route('**/api/**', route => route.fulfill({...}));

// Mobile emulation
test.use({ ...devices['iPhone 13'] });
```

---

## 2. End-to-End Test Setup

### Prerequisites

```bash
node -v  # v16+ required
npm -v   # v8+ required
```

### Installation Steps

```bash
# 1. Initialize project
npm init -y

# 2. Install Playwright
npm install -D @playwright/test

# 3. Install TypeScript
npm install -D typescript

# 4. Initialize Playwright
npx playwright install

# 5. Generate TypeScript config
npx tsc --init
```

### Project Structure

```
playwright-demo/
├── tests/
│   ├── e2e/              # End-to-end tests
│   ├── api/              # API tests
│   └── unit/             # Unit tests
├── pages/                # Page Object Models
│   ├── BasePage.ts
│   ├── LoginPage.ts
│   └── HomePage.ts
├── fixtures/             # Test fixtures
│   └── customFixtures.ts
├── utils/                # Utility functions
│   ├── helpers.ts
│   └── testData.ts
├── config/               # Configuration files
│   └── testConfig.ts
├── playwright.config.ts  # Main config
├── package.json
└── tsconfig.json
```

### Configuration Files

**playwright.config.ts**
```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
});
```

**tsconfig.json**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "types": ["node", "@playwright/test"]
  },
  "include": ["tests/**/*", "pages/**/*", "utils/**/*"]
}
```

---

## 3. Core Playwright Test Automation Concepts

### Test Structure

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup before each test
    await page.goto('/');
  });

  test('should perform action', async ({ page }) => {
    // Arrange
    const username = 'testuser';
    
    // Act
    await page.fill('#username', username);
    await page.click('button[type="submit"]');
    
    // Assert
    await expect(page.locator('.welcome')).toContainText('Welcome');
  });
});
```

### Locator Strategies

```typescript
// Best Practices (in order of preference)
await page.getByRole('button', { name: 'Submit' });
await page.getByLabel('Username');
await page.getByPlaceholder('Enter email');
await page.getByText('Welcome back');
await page.getByTestId('submit-button');

// CSS/XPath (use sparingly)
await page.locator('#submit');
await page.locator('//button[@type="submit"]');
```

### Actions

```typescript
// Click
await page.click('button');
await page.dblclick('button');
await page.click('button', { button: 'right' });

// Type
await page.fill('input', 'text');
await page.type('input', 'text', { delay: 100 });

// Select
await page.selectOption('select', 'value');
await page.selectOption('select', { label: 'Option 1' });

// Check
await page.check('#checkbox');
await page.uncheck('#checkbox');

// Upload
await page.setInputFiles('input[type="file"]', 'file.pdf');

// Drag and Drop
await page.dragAndDrop('#source', '#target');
```

### Assertions

```typescript
// Visibility
await expect(page.locator('h1')).toBeVisible();
await expect(page.locator('.error')).toBeHidden();

// Text
await expect(page.locator('h1')).toHaveText('Welcome');
await expect(page.locator('h1')).toContainText('Wel');

// Attributes
await expect(page.locator('button')).toHaveAttribute('disabled');
await expect(page.locator('input')).toHaveValue('test');

// URL
await expect(page).toHaveURL('/dashboard');
await expect(page).toHaveTitle('Dashboard');

// Count
await expect(page.locator('.item')).toHaveCount(5);
```

---

## 4. Playwright Test Automation Best Practices

### 1. Use Page Object Model

**pages/LoginPage.ts**
```typescript
import { Page, Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.getByLabel('Username');
    this.passwordInput = page.getByLabel('Password');
    this.submitButton = page.getByRole('button', { name: 'Login' });
    this.errorMessage = page.locator('.error-message');
  }

  async navigate() {
    await this.page.goto('/login');
  }

  async login(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async getErrorMessage() {
    return await this.errorMessage.textContent();
  }
}
```

### 2. Use Test Fixtures

**fixtures/customFixtures.ts**
```typescript
import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

type MyFixtures = {
  loginPage: LoginPage;
};

export const test = base.extend<MyFixtures>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await use(loginPage);
  },
});

export { expect } from '@playwright/test';
```

### 3. Data-Driven Testing

```typescript
const testData = [
  { username: 'user1', password: 'pass1', expected: 'Welcome user1' },
  { username: 'user2', password: 'pass2', expected: 'Welcome user2' },
];

testData.forEach(({ username, password, expected }) => {
  test(`login with ${username}`, async ({ page }) => {
    await page.fill('#username', username);
    await page.fill('#password', password);
    await page.click('button[type="submit"]');
    await expect(page.locator('.welcome')).toContainText(expected);
  });
});
```

### 4. API State Management

```typescript
test.use({
  storageState: 'auth.json', // Reuse authentication
});

test.beforeAll(async ({ request }) => {
  // Setup: Create test data via API
  await request.post('/api/users', {
    data: { username: 'testuser', email: 'test@test.com' }
  });
});
```

### 5. Environment Variables

```typescript
// .env
BASE_URL=http://localhost:3000
API_URL=http://localhost:8080
USERNAME=testuser
PASSWORD=testpass

// Load in config
import * as dotenv from 'dotenv';
dotenv.config();

export const config = {
  baseURL: process.env.BASE_URL,
  apiURL: process.env.API_URL,
};
```

---

## 5. Building a Playwright Test Automation Framework

### Framework Architecture

```
playwright-framework/
├── tests/
│   ├── e2e/
│   │   ├── auth/
│   │   │   ├── login.spec.ts
│   │   │   └── registration.spec.ts
│   │   └── checkout/
│   │       └── purchase.spec.ts
│   └── api/
│       ├── users.api.spec.ts
│       └── products.api.spec.ts
├── pages/
│   ├── BasePage.ts
│   ├── LoginPage.ts
│   └── CheckoutPage.ts
├── components/
│   ├── Header.ts
│   └── Footer.ts
├── fixtures/
│   ├── pageFixtures.ts
│   └── apiFixtures.ts
├── utils/
│   ├── testData.ts
│   ├── helpers.ts
│   └── constants.ts
├── config/
│   ├── environments/
│   │   ├── dev.config.ts
│   │   ├── staging.config.ts
│   │   └── prod.config.ts
│   └── testConfig.ts
└── playwright.config.ts
```

### Base Page Pattern

```typescript
export abstract class BasePage {
  protected page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async navigate(path: string) {
    await this.page.goto(path);
  }

  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
  }

  async takeScreenshot(name: string) {
    await this.page.screenshot({ path: `screenshots/${name}.png` });
  }

  async getPageTitle(): Promise<string> {
    return await this.page.title();
  }
}
```

### Component Pattern

```typescript
export class HeaderComponent {
  private page: Page;
  private searchInput: Locator;
  private cartIcon: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchInput = page.locator('[data-testid="search-input"]');
    this.cartIcon = page.locator('[data-testid="cart-icon"]');
  }

  async search(query: string) {
    await this.searchInput.fill(query);
    await this.searchInput.press('Enter');
  }

  async openCart() {
    await this.cartIcon.click();
  }
}
```

---

## 6. Playwright with TypeScript API Testing Guide

### API Test Example

```typescript
import { test, expect } from '@playwright/test';

test.describe('User API', () => {
  let apiContext;

  test.beforeAll(async ({ playwright }) => {
    apiContext = await playwright.request.newContext({
      baseURL: 'https://api.example.com',
      extraHTTPHeaders: {
        'Authorization': `Bearer ${process.env.API_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });
  });

  test.afterAll(async () => {
    await apiContext.dispose();
  });

  test('GET - Fetch users', async () => {
    const response = await apiContext.get('/users');
    
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
    
    const users = await response.json();
    expect(users).toHaveLength(10);
  });

  test('POST - Create user', async () => {
    const newUser = {
      name: 'John Doe',
      email: 'john@example.com',
    };

    const response = await apiContext.post('/users', {
      data: newUser,
    });

    expect(response.status()).toBe(201);
    
    const user = await response.json();
    expect(user.name).toBe(newUser.name);
    expect(user.email).toBe(newUser.email);
    expect(user).toHaveProperty('id');
  });

  test('PUT - Update user', async () => {
    const updatedData = {
      name: 'Jane Doe',
    };

    const response = await apiContext.put('/users/1', {
      data: updatedData,
    });

    expect(response.status()).toBe(200);
  });

  test('DELETE - Remove user', async () => {
    const response = await apiContext.delete('/users/1');
    expect(response.status()).toBe(204);
  });
});
```

---

## 7. Playwright Network Interception & Mocking

### Request Interception

```typescript
test('intercept and mock API', async ({ page }) => {
  // Mock successful response
  await page.route('**/api/users', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        { id: 1, name: 'Mock User 1' },
        { id: 2, name: 'Mock User 2' },
      ]),
    });
  });

  await page.goto('/users');
  await expect(page.locator('.user-name').first()).toContainText('Mock User 1');
});
```

### Network Monitoring

```typescript
test('monitor network requests', async ({ page }) => {
  const requests = [];
  
  page.on('request', request => {
    requests.push({
      url: request.url(),
      method: request.method(),
    });
  });

  await page.goto('/');
  
  // Verify specific request was made
  const apiRequest = requests.find(r => r.url.includes('/api/data'));
  expect(apiRequest).toBeDefined();
});
```

---

## 8. Debugging & Reporting

### Debugging Tools

```typescript
// 1. Playwright Inspector
npx playwright test --debug

// 2. Headed mode
npx playwright test --headed

// 3. Slow motion
npx playwright test --headed --slow-mo=1000

// 4. Pause in test
test('debug test', async ({ page }) => {
  await page.goto('/');
  await page.pause(); // Opens inspector
});

// 5. Trace viewer
npx playwright show-trace trace.zip
```

### HTML Reporter

```typescript
// playwright.config.ts
reporter: [
  ['html', { open: 'never' }],
  ['list'],
  ['json', { outputFile: 'test-results.json' }],
],
```

### Custom Reporter

```typescript
class CustomReporter {
  onBegin(config, suite) {
    console.log(`Running ${suite.allTests().length} tests`);
  }

  onTestEnd(test, result) {
    console.log(`Test ${test.title}: ${result.status}`);
  }

  onEnd(result) {
    console.log(`Tests completed: ${result.status}`);
  }
}

export default CustomReporter;
```

---

## 9. CI/CD Pipeline Integration

### GitHub Actions

```yaml
name: Playwright Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18
          
      - name: Install dependencies
        run: npm ci
        
      - name: Install Playwright Browsers
        run: npx playwright install --with-deps
        
      - name: Run Playwright tests
        run: npx playwright test
        
      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

---

## 10. Parallel & Cross-Browser Test Automation

### Parallel Execution

```typescript
// playwright.config.ts
export default defineConfig({
  workers: 4, // Run 4 tests in parallel
  fullyParallel: true,
});
```

### Cross-Browser Testing

```typescript
projects: [
  { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  { name: 'mobile-chrome', use: { ...devices['Pixel 5'] } },
  { name: 'mobile-safari', use: { ...devices['iPhone 13'] } },
],
```

---

## 11. Playwright Interview Questions

### Q1: What is Playwright auto-waiting?
**A:** Playwright automatically waits for elements to be actionable before performing actions, eliminating the need for manual waits.

### Q2: Difference between `page.click()` and `locator.click()`?
**A:** `locator.click()` is recommended as it performs strict checks and auto-retries, while `page.click()` is a lower-level API.

### Q3: How to handle multiple tabs?
```typescript
const [newPage] = await Promise.all([
  context.waitForEvent('page'),
  page.click('a[target="_blank"]'),
]);
await newPage.waitForLoadState();
```

---

## 12. Playwright & TypeScript Cheat Sheet

### Quick Commands
```bash
npm init playwright@latest        # Initialize project
npx playwright test              # Run all tests
npx playwright test --headed     # Run in headed mode
npx playwright test --debug      # Debug mode
npx playwright codegen          # Generate code
npx playwright show-report      # Show HTML report
```

### Quick Snippets
```typescript
// Wait for navigation
await page.waitForURL('**/dashboard');

// Wait for element
await page.waitForSelector('.element');

// Execute JavaScript
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

// Get all links
const links = await page.$$eval('a', anchors => anchors.map(a => a.href));
```

---

## 🚀 Getting Started

1. Clone this repository
2. Install dependencies: `npm install`
3. Run tests: `npm test`
4. View report: `npm run report`

## 📞 Contact

For questions or feedback: papica777@gmail.com

---

**Status**: Production-ready framework demonstrating modern Playwright + TypeScript practices
