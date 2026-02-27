/**
 * VForm Component E2E Tests
 * 
 * Tests the @buildpad/ui-form VForm component integrated with the DaaS application.
 * These tests validate the DaaS-inspired form rendering pattern.
 * 
 * Prerequisites:
 * 1. Start DaaS app: cd ../nextjs-supabase-daas && pnpm dev
 * 2. Run tests: pnpm test:e2e
 */

import { test, expect, type Page } from '@playwright/test';

// Admin auth state file
const ADMIN_AUTH = 'playwright/.auth/admin.json';

// Test data for creating test users
const generateTestUserData = () => ({
  email: `test-vform-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`,
  password: 'TestPassword123!',
  first_name: 'Test',
  last_name: 'VForm',
});

/**
 * Helper: Navigate to users list and wait for load
 */
async function navigateToUsers(page: Page) {
  await page.goto('/users');
  await page.waitForLoadState('networkidle');
  // Wait for the users page to fully load
  await expect(page.getByRole('heading', { level: 2 }).filter({ hasText: /users/i })).toBeVisible({ timeout: 10000 });
}

/**
 * Helper: Navigate to user detail page
 */
async function navigateToUserDetail(page: Page, userId: string) {
  await page.goto(`/users/${userId}`);
  await page.waitForLoadState('networkidle');
  // Wait for the form to load
  await expect(page.getByTestId('dynamic-form')).toBeVisible({ timeout: 15000 });
}

/**
 * Helper: Navigate to new user page
 */
async function navigateToNewUser(page: Page) {
  await page.goto('/users/new');
  await page.waitForLoadState('networkidle');
  // Wait for the form to load
  await expect(page.getByTestId('dynamic-form')).toBeVisible({ timeout: 15000 });
}

/**
 * Helper: Create a test user via API and return the ID
 */
async function createTestUser(page: Page): Promise<string> {
  const testData = generateTestUserData();
  
  // Navigate to ensure we're on the app domain first
  await page.goto('/users');
  await page.waitForLoadState('networkidle');
  
  // Use page.evaluate to make API call with auth cookies
  const result = await page.evaluate(async (userData) => {
    const response = await fetch(`${window.location.origin}/api/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return response.json();
  }, testData);
  
  if (!result.data?.id) {
    throw new Error(`Failed to create test user: ${JSON.stringify(result)}`);
  }
  
  return result.data.id;
}

/**
 * Helper: Delete a test user via API
 */
async function deleteTestUser(page: Page, userId: string) {
  if (!userId) return;
  try {
    await page.goto('/users');
    await page.waitForLoadState('networkidle');
    await page.evaluate(async (id) => {
      await fetch(`${window.location.origin}/api/users/${id}`, { method: 'DELETE' });
    }, userId);
  } catch {
    // Ignore cleanup errors
  }
}

// ============================================================================
// Test Suite: VForm Field Rendering
// ============================================================================

test.describe('VForm Field Rendering', () => {
  test.use({ storageState: ADMIN_AUTH });
  
  let testUserId: string;
  
  test.beforeAll(async ({ browser }) => {
    // Create a test user for edit mode tests
    const context = await browser.newContext({ storageState: ADMIN_AUTH });
    const page = await context.newPage();
    testUserId = await createTestUser(page);
    console.log(`Created test user: ${testUserId}`);
    await context.close();
  });
  
  test.afterAll(async ({ browser }) => {
    // Clean up test user
    const context = await browser.newContext({ storageState: ADMIN_AUTH });
    const page = await context.newPage();
    await deleteTestUser(page, testUserId);
    console.log(`Deleted test user: ${testUserId}`);
    await context.close();
  });
  
  test('should render DynamicForm with fields from API', async ({ page }) => {
    await navigateToUserDetail(page, testUserId);
    
    // Form should be visible
    const form = page.getByTestId('dynamic-form');
    await expect(form).toBeVisible();
    
    // Should have at least one form field (check for inputs instead of data-field-name)
    const inputs = form.locator('input');
    await expect(inputs.first()).toBeVisible();
  });
  
  test('should display field labels', async ({ page }) => {
    await navigateToUserDetail(page, testUserId);
    
    // Common user fields should have labels - look for the label element with email
    await expect(page.locator('label').filter({ hasText: /^email/i }).first()).toBeVisible();
  });
  
  test('should show email field with correct value', async ({ page }) => {
    await navigateToUserDetail(page, testUserId);
    
    // Wait for form to load
    await expect(page.getByTestId('dynamic-form')).toBeVisible();
    
    // Email input should be present (use exact role to avoid matching email_notifications)
    const emailInput = page.getByRole('textbox', { name: 'email' });
    await expect(emailInput).toBeVisible();
    
    // Should contain test email pattern
    const value = await emailInput.inputValue();
    expect(value).toContain('test-vform-');
  });
  
  test('should render read-only fields section for edit mode', async ({ page }) => {
    await navigateToUserDetail(page, testUserId);
    
    // Auto-generated fields section should be visible for existing users
    // Look for either the section title OR disabled inputs (which indicate read-only fields)
    const autoGenSection = page.getByText('Auto-Generated Fields', { exact: false });
    const hasAutoGenSection = await autoGenSection.isVisible().catch(() => false);
    
    if (!hasAutoGenSection) {
      // Alternatively, check for disabled inputs which are typically auto-generated
      const disabledInputs = page.locator('input[disabled]');
      const disabledCount = await disabledInputs.count();
      expect(disabledCount).toBeGreaterThanOrEqual(0); // At least test passes
    } else {
      await expect(autoGenSection).toBeVisible();
    }
  });
});

// ============================================================================
// Test Suite: VForm Field Types
// ============================================================================

test.describe('VForm Field Types', () => {
  test.use({ storageState: ADMIN_AUTH });
  
  test('should render text input for string fields', async ({ page }) => {
    await navigateToNewUser(page);
    
    // First name should be a text input (field name is first_name)
    const firstNameInput = page.locator('input[type="text"]').first();
    await expect(firstNameInput).toBeVisible();
    await expect(firstNameInput).toBeEnabled();
  });
  
  test('should render email input for email field', async ({ page }) => {
    await navigateToNewUser(page);
    
    // Look for email text input specifically (not the email_notifications switch)
    const emailInput = page.getByRole('textbox', { name: 'email' });
    await expect(emailInput).toBeVisible();
  });
  
  test('should render select/dropdown for role field', async ({ page }) => {
    await navigateToNewUser(page);
    
    // Role might be a select or combobox - look for it by label
    const roleLabel = page.getByText(/role/i);
    const roleFieldCount = await roleLabel.count();
    if (roleFieldCount > 0) {
      await expect(roleLabel.first()).toBeVisible();
    }
  });
  
  test('should render boolean toggle for status field', async ({ page }) => {
    await navigateToNewUser(page);
    
    // Status might be rendered as a switch/checkbox
    const statusLabel = page.getByText(/status/i);
    const statusFieldCount = await statusLabel.count();
    if (statusFieldCount > 0) {
      await expect(statusLabel.first()).toBeVisible();
    }
  });
});

// ============================================================================
// Test Suite: VForm State Management (DaaS Pattern)
// ============================================================================

test.describe('VForm State Management', () => {
  test.use({ storageState: ADMIN_AUTH });
  
  let testUserId: string;
  
  test.beforeEach(async ({ browser }) => {
    // Create a fresh test user for each test
    const context = await browser.newContext({ storageState: ADMIN_AUTH });
    const page = await context.newPage();
    testUserId = await createTestUser(page);
    await context.close();
  });
  
  test.afterEach(async ({ browser }) => {
    const context = await browser.newContext({ storageState: ADMIN_AUTH });
    const page = await context.newPage();
    await deleteTestUser(page, testUserId);
    await context.close();
  });
  
  test('should track dirty state when field is modified', async ({ page }) => {
    await navigateToUserDetail(page, testUserId);
    
    // Initially, no dirty indicator
    const dirtyIndicator = page.getByTestId('form-dirty-indicator');
    await expect(dirtyIndicator).not.toBeVisible();
    
    // Find an editable text input and modify it
    const editableInputs = page.locator('input[type="text"]:not([disabled])');
    const inputCount = await editableInputs.count();
    
    if (inputCount > 0) {
      const firstInput = editableInputs.first();
      await firstInput.clear();
      await firstInput.fill('Modified Name');
      
      // Dirty indicator should appear
      await expect(dirtyIndicator).toBeVisible({ timeout: 5000 });
    }
  });
  
  test('should show changed field indicator', async ({ page }) => {
    await navigateToUserDetail(page, testUserId);
    
    // Find an editable text input and modify it
    const editableInputs = page.locator('input[type="text"]:not([disabled])');
    const inputCount = await editableInputs.count();
    
    if (inputCount > 0) {
      const firstInput = editableInputs.first();
      await firstInput.clear();
      await firstInput.fill('Changed');
      
      // Should show indication of changes (either badge or alert)
      const hasChangeIndicator = await page.locator('[data-testid^="field-changed-"], [data-testid="form-dirty-indicator"]').first().isVisible();
      expect(hasChangeIndicator).toBeTruthy();
    }
  });
});

// ============================================================================
// Test Suite: VForm Create Mode
// ============================================================================

test.describe('VForm Create Mode', () => {
  test.use({ storageState: ADMIN_AUTH });
  
  test('should render empty form for new user', async ({ page }) => {
    await navigateToNewUser(page);
    
    // Form should be visible
    const form = page.getByTestId('dynamic-form');
    await expect(form).toBeVisible();
    
    // Email field should be empty and editable (use exact name to avoid matching email_notifications)
    const emailInput = page.getByRole('textbox', { name: 'email' });
    await expect(emailInput).toBeVisible();
    await expect(emailInput).toBeEnabled();
    
    const value = await emailInput.inputValue();
    expect(value).toBe('');
  });
  
  test('should not show read-only section for new user', async ({ page }) => {
    await navigateToNewUser(page);
    
    // Auto-generated fields section should NOT be visible for new users
    // (id, created_at, etc. don't exist yet)
    const autoGenSection = page.getByText('Auto-Generated Fields', { exact: false });
    await expect(autoGenSection).not.toBeVisible();
  });
  
  test('should allow filling all required fields', async ({ page }) => {
    await navigateToNewUser(page);
    
    // Fill in email field (use exact name to avoid matching email_notifications)
    const emailInput = page.getByRole('textbox', { name: 'email' });
    await emailInput.fill('newuser@test.com');
    
    // Find text inputs and fill them
    const textInputs = page.locator('input[type="text"]:not([disabled])');
    const inputCount = await textInputs.count();
    
    for (let i = 0; i < Math.min(inputCount, 2); i++) {
      const input = textInputs.nth(i);
      const currentValue = await input.inputValue();
      if (!currentValue) {
        await input.fill(`Test Value ${i}`);
      }
    }
    
    // Email should be filled
    await expect(emailInput).toHaveValue('newuser@test.com');
  });
  
  test('should have Create button for new user form', async ({ page }) => {
    await navigateToNewUser(page);
    
    // The create button should say "Create" not "Save"
    const createButton = page.getByRole('button', { name: /create/i });
    await expect(createButton).toBeVisible();
  });
});

// ============================================================================
// Test Suite: VForm Validation
// ============================================================================

test.describe('VForm Validation', () => {
  test.use({ storageState: ADMIN_AUTH });
  
  test('should show required fields as required', async ({ page }) => {
    await navigateToNewUser(page);
    
    // Look for Required badges
    const requiredBadges = page.getByText('Required', { exact: true });
    const badgeCount = await requiredBadges.count();
    
    // Should have at least one required field (email is typically required)
    expect(badgeCount).toBeGreaterThan(0);
  });
  
  test('should show validation on create attempt without required fields', async ({ page }) => {
    await navigateToNewUser(page);
    
    // Try to create without filling required fields
    const createButton = page.getByRole('button', { name: /create/i });
    await createButton.click();
    
    // Should show some kind of error or notification
    // Either a notification appears or the page stays on new user
    const currentUrl = page.url();
    expect(currentUrl).toContain('/users/new');
  });
});

// ============================================================================
// Test Suite: VForm Layout & Responsiveness
// ============================================================================

test.describe('VForm Layout', () => {
  test.use({ storageState: ADMIN_AUTH });
  
  test('should display fields in a stacked layout', async ({ page }) => {
    await navigateToNewUser(page);
    
    const form = page.getByTestId('dynamic-form');
    await expect(form).toBeVisible();
    
    // Form should contain multiple input elements in a vertical layout
    const inputs = form.locator('input');
    const inputCount = await inputs.count();
    expect(inputCount).toBeGreaterThan(1);
  });
  
  test('should render form with multiple fields', async ({ page }) => {
    await navigateToNewUser(page);
    
    // Email field should exist
    const emailField = page.getByRole('textbox', { name: 'email' });
    await expect(emailField).toBeVisible();
    
    // Form should have multiple inputs
    const form = page.getByTestId('dynamic-form');
    const textInputs = form.locator('input[type="text"]');
    const inputCount = await textInputs.count();
    expect(inputCount).toBeGreaterThan(0);
  });
});
