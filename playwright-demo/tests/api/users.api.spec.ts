import { test, expect } from '@playwright/test';

/**
 * User API Test Suite
 * Demonstrates API testing best practices with Playwright
 */
test.describe('User API Tests', () => {
  const BASE_API_URL = 'https://jsonplaceholder.typicode.com';
  let apiContext;

  test.beforeAll(async ({ playwright }) => {
    // Create API context
    apiContext = await playwright.request.newContext({
      baseURL: BASE_API_URL,
      extraHTTPHeaders: {
        'Content-Type': 'application/json',
      },
    });
  });

  test.afterAll(async () => {
    await apiContext.dispose();
  });

  test('GET - should fetch all users', async () => {
    // Act
    const response = await apiContext.get('/users');

    // Assert
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const users = await response.json();
    expect(Array.isArray(users)).toBeTruthy();
    expect(users.length).toBeGreaterThan(0);

    // Verify user structure
    expect(users[0]).toHaveProperty('id');
    expect(users[0]).toHaveProperty('name');
    expect(users[0]).toHaveProperty('email');
  });

  test('GET - should fetch user by ID', async () => {
    // Arrange
    const userId = 1;

    // Act
    const response = await apiContext.get(`/users/${userId}`);

    // Assert
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const user = await response.json();
    expect(user.id).toBe(userId);
    expect(user).toHaveProperty('name');
    expect(user.email).toMatch(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/);
  });

  test('POST - should create new user', async () => {
    // Arrange
    const newUser = {
      name: 'John Doe',
      username: 'johndoe',
      email: 'john.doe@example.com',
    };

    // Act
    const response = await apiContext.post('/users', {
      data: newUser,
    });

    // Assert
    expect(response.status()).toBe(201);

    const createdUser = await response.json();
    expect(createdUser.name).toBe(newUser.name);
    expect(createdUser.username).toBe(newUser.username);
    expect(createdUser.email).toBe(newUser.email);
    expect(createdUser).toHaveProperty('id');
  });

  test('PUT - should update user', async () => {
    // Arrange
    const userId = 1;
    const updatedData = {
      name: 'Jane Doe Updated',
      email: 'jane.updated@example.com',
    };

    // Act
    const response = await apiContext.put(`/users/${userId}`, {
      data: updatedData,
    });

    // Assert
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const updatedUser = await response.json();
    expect(updatedUser.name).toBe(updatedData.name);
    expect(updatedUser.email).toBe(updatedData.email);
  });

  test('PATCH - should partially update user', async () => {
    // Arrange
    const userId = 1;
    const partialData = {
      email: 'newemail@example.com',
    };

    // Act
    const response = await apiContext.patch(`/users/${userId}`, {
      data: partialData,
    });

    // Assert
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const updatedUser = await response.json();
    expect(updatedUser.email).toBe(partialData.email);
  });

  test('DELETE - should delete user', async () => {
    // Arrange
    const userId = 1;

    // Act
    const response = await apiContext.delete(`/users/${userId}`);

    // Assert
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
  });

  test('GET - should return 404 for non-existent user', async () => {
    // Arrange
    const nonExistentId = 99999;

    // Act
    const response = await apiContext.get(`/users/${nonExistentId}`);

    // Assert
    expect(response.status()).toBe(404);
  });

  test('should validate response time', async () => {
    // Act
    const startTime = Date.now();
    const response = await apiContext.get('/users');
    const endTime = Date.now();

    // Assert
    expect(response.ok()).toBeTruthy();
    
    const responseTime = endTime - startTime;
    expect(responseTime).toBeLessThan(2000); // Response should be under 2 seconds
  });

  test('should validate response headers', async () => {
    // Act
    const response = await apiContext.get('/users');

    // Assert
    const headers = response.headers();
    expect(headers['content-type']).toContain('application/json');
  });

  test.describe('Data Validation', () => {
    test('should validate user email format', async () => {
      const response = await apiContext.get('/users/1');
      const user = await response.json();

      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      expect(user.email).toMatch(emailRegex);
    });

    test('should validate required fields', async () => {
      const response = await apiContext.get('/users/1');
      const user = await response.json();

      // Verify all required fields exist
      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('name');
      expect(user).toHaveProperty('username');
      expect(user).toHaveProperty('email');
    });
  });
});
