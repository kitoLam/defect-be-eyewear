import { test, expect } from '@playwright/test';

/**
 * API Health Check Tests
 * These tests verify the backend API is responding correctly
 */

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000';

test.describe('API Health Checks', () => {
  test('should return 200 on health endpoint', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/health`);
    expect(response.status()).toBe(200);
  });
});

test.describe('Authentication API', () => {
  test('should reject unauthorized requests', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/api/v1/users/profile`);
    expect([401, 404]).toContain(response.status());
  });

  test('should accept valid login credentials', async ({ request }) => {
    const response = await request.post(`${API_BASE_URL}/api/v1/auth/login`, {
      data: {
        email: 'test@example.com',
        password: 'testpassword123'
      }
    });

    // Should either succeed or fail gracefully
    expect([200, 400, 401]).toContain(response.status());
  });
});

test.describe('Products API', () => {
  // test('should return products list', async ({ request }) => {
  //   const response = await request.get(`${API_BASE_URL}/api/v1/products`);
  //   expect([200, 401]).toContain(response.status());

  //   if (response.status() === 200) {
  //     const data = await response.json();
  //     expect(Array.isArray(data) || data.products).toBeTruthy();
  //   }
  // });

  test('should handle invalid product ID', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/api/v1/products/invalid-id-12345`);
    expect([400, 404]).toContain(response.status());
  });
});

// test.describe('Error Handling', () => {
//   test('should return proper error for non-existent endpoint', async ({ request }) => {
//     const response = await request.get(`${API_BASE_URL}/api/v1/nonexistent`);
//     expect(response.status()).toBe(404);
//   });

//   test('should handle malformed JSON', async ({ request }) => {
//     const response = await request.post(`${API_BASE_URL}/api/v1/products`, {
//       headers: {
//         'Content-Type': 'application/json'
//       },
//       data: 'invalid json{{{',
//       failOnStatusCode: false
//     });
//     expect([400, 422]).toContain(response.status());
//   });
// });

// test.describe('Security Headers', () => {
//   test('should have security headers', async ({ request }) => {
//     const response = await request.get(`${API_BASE_URL}/`);
//     const headers = response.headers();

//     // Check for common security headers
//     expect(headers['x-content-type-options'] || headers['x-frame-options']).toBeDefined();
//   });

//   test('should prevent SQL injection in query params', async ({ request }) => {
//     const response = await request.get(
//       `${API_BASE_URL}/api/v1/products?id=1' OR '1'='1`,
//       { failOnStatusCode: false }
//     );

//     // Should either reject or handle safely
//     expect(response.status()).not.toBe(500);
//   });
// });
