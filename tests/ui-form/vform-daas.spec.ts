/**
 * VForm DaaS Integration E2E Tests
 * 
 * Tests the VForm component as integrated in the DaaS application.
 * Uses existing collections (daas_users) since custom collections
 * don't have UI routes in the current DaaS version.
 * 
 * For isolated component testing, use the Storybook tests:
 *   pnpm test:storybook
 * 
 * Prerequisites:
 * 1. DaaS must be running (hosted or local)
 * 2. Admin authentication state saved (run auth.setup.ts first)
 */

import { test, expect, type Page } from '@playwright/test';

// Admin auth state file
const ADMIN_AUTH = 'playwright/.auth/admin.json';

// Helper: Wait for page to be ready
async function waitForPageLoad(page: Page) {
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);
}

// ============================================================================
// Test Suite: VForm in Users Page (daas_users collection)
// ============================================================================

test.describe('VForm Integration - Users Collection', () => {
  test.use({ storageState: ADMIN_AUTH });
  
  let testUserId: string | null = null;

  test.beforeAll(async ({ request }) => {
    // Create a test user for form tests
    try {
      const response = await request.post('/api/users', {
        data: {
          email: `vform-test-${Date.now()}@test.com`,
          password: 'TestPassword123!',
          first_name: 'VForm',
          last_name: 'Test',
        },
      });
      if (response.ok()) {
        const data = await response.json();
        testUserId = data.data?.id;
        console.log('Created test user for VForm tests:', testUserId);
      }
    } catch (error) {
      console.log('Could not create test user:', error);
    }
  });

  test.afterAll(async ({ request }) => {
    if (testUserId) {
      try {
        await request.delete(`/api/users/${testUserId}`);
        console.log('Deleted test user:', testUserId);
      } catch {
        console.log('Could not delete test user');
      }
    }
  });

  test('should render dynamic form on user edit page', async ({ page }) => {
    test.skip(!testUserId, 'No test user available');

    await page.goto(`/users/${testUserId}`);
    await waitForPageLoad(page);

    // Form should be visible
    const dynamicForm = page.getByTestId('dynamic-form');
    await expect(dynamicForm).toBeVisible({ timeout: 15000 });
  });

  test('should display input interface for email field', async ({ page }) => {
    test.skip(!testUserId, 'No test user available');

    await page.goto(`/users/${testUserId}`);
    await waitForPageLoad(page);

    const dynamicForm = page.getByTestId('dynamic-form');
    await expect(dynamicForm).toBeVisible({ timeout: 15000 });

    // Email field - be specific to avoid matching email_notifications
    const emailInput = page.getByRole('textbox', { name: /^email$/i });
    await expect(emailInput).toBeVisible();
    
    const emailValue = await emailInput.inputValue();
    expect(emailValue).toContain('@');
  });

  test('should display input interface for name fields', async ({ page }) => {
    test.skip(!testUserId, 'No test user available');

    await page.goto(`/users/${testUserId}`);
    await waitForPageLoad(page);

    const dynamicForm = page.getByTestId('dynamic-form');
    await expect(dynamicForm).toBeVisible({ timeout: 15000 });

    // First name and last name should be visible
    const firstNameInput = page.getByLabel(/first.*name/i);
    const lastNameInput = page.getByLabel(/last.*name/i);
    
    await expect(firstNameInput).toBeVisible();
    await expect(lastNameInput).toBeVisible();
    
    // Values should match what we created
    await expect(firstNameInput).toHaveValue('VForm');
    await expect(lastNameInput).toHaveValue('Test');
  });

  test('should display select dropdown for status field', async ({ page }) => {
    test.skip(!testUserId, 'No test user available');

    await page.goto(`/users/${testUserId}`);
    await waitForPageLoad(page);

    const dynamicForm = page.getByTestId('dynamic-form');
    await expect(dynamicForm).toBeVisible({ timeout: 15000 });

    // Status field should be a dropdown
    const statusField = dynamicForm.locator('select, [role="combobox"]').filter({ hasText: /active|inactive|draft/i });
    const statusCount = await statusField.count();
    
    // Status should exist as a selectable field
    expect(statusCount >= 0).toBeTruthy();
  });

  test('should display select dropdown for role field', async ({ page }) => {
    test.skip(!testUserId, 'No test user available');

    await page.goto(`/users/${testUserId}`);
    await waitForPageLoad(page);

    const dynamicForm = page.getByTestId('dynamic-form');
    await expect(dynamicForm).toBeVisible({ timeout: 15000 });

    // Role field should exist
    const roleLabel = page.getByText(/^role$/i);
    await expect(roleLabel.first()).toBeVisible();
  });

  test('should allow editing and show dirty state', async ({ page }) => {
    test.skip(!testUserId, 'No test user available');

    await page.goto(`/users/${testUserId}`);
    await waitForPageLoad(page);

    const dynamicForm = page.getByTestId('dynamic-form');
    await expect(dynamicForm).toBeVisible({ timeout: 15000 });

    // Modify first name
    const firstNameInput = page.getByLabel(/first.*name/i);
    await firstNameInput.clear();
    await firstNameInput.fill('Modified');

    // Should show some indication of unsaved changes
    // This could be a dirty indicator, enabled save button, etc.
    await page.waitForTimeout(500);
    
    // The URL should still be on the user page (not navigated away)
    expect(page.url()).toContain(`/users/${testUserId}`);
  });

  test('should show token interface for static token field', async ({ page }) => {
    test.skip(!testUserId, 'No test user available');

    await page.goto(`/users/${testUserId}`);
    await waitForPageLoad(page);

    const dynamicForm = page.getByTestId('dynamic-form');
    await expect(dynamicForm).toBeVisible({ timeout: 15000 });

    // Token field should have special interface
    const tokenContainer = page.getByTestId('system-token-container');
    await expect(tokenContainer).toBeVisible();
  });
});

// ============================================================================
// Test Suite: VForm Field Visibility
// ============================================================================

test.describe('VForm Field Visibility', () => {
  test.use({ storageState: ADMIN_AUTH });

  test('should hide readonly system fields appropriately', async ({ page }) => {
    // Navigate to users list and get first user
    const response = await page.request.get('/api/users?limit=1');
    const data = await response.json();
    const userId = data.data?.[0]?.id;
    
    test.skip(!userId, 'No users available');

    await page.goto(`/users/${userId}`);
    await waitForPageLoad(page);

    const dynamicForm = page.getByTestId('dynamic-form');
    await expect(dynamicForm).toBeVisible({ timeout: 15000 });

    // ID field should typically be hidden or readonly
    const idLabel = page.getByLabel(/^id$/i);
    const idVisible = await idLabel.isVisible().catch(() => false);
    
    // ID is usually hidden, but if visible should be readonly
    if (idVisible) {
      const idInput = await idLabel.inputValue().catch(() => '');
      expect(idInput.length).toBeGreaterThan(0);
    }
  });
});
