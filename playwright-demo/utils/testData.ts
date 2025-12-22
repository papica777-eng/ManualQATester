/**
 * Test Data Utilities
 * Provides test data for various test scenarios
 */

export const testUsers = {
  validUser: {
    username: 'testuser@example.com',
    password: 'Test@123',
    name: 'Test User'
  },
  invalidUser: {
    username: 'invalid@example.com',
    password: 'wrongpassword'
  },
  adminUser: {
    username: 'admin@example.com',
    password: 'Admin@123',
    role: 'admin'
  }
};

export const testData = {
  // Sample product data
  product: {
    name: 'Sample Product',
    price: 99.99,
    quantity: 1
  },
  
  // Sample API endpoints
  endpoints: {
    users: '/api/users',
    products: '/api/products',
    orders: '/api/orders'
  }
};

/**
 * Generate random email
 */
export function generateRandomEmail(): string {
  const timestamp = Date.now();
  return `test.user.${timestamp}@example.com`;
}

/**
 * Generate random username
 */
export function generateRandomUsername(): string {
  const timestamp = Date.now();
  return `testuser_${timestamp}`;
}

/**
 * Wait for specified time
 */
export async function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
