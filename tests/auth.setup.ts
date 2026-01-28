import { test as setup, expect } from '@playwright/test';

/**
 * Global setup that runs before all tests.
 * Creates authentication state for admin user.
 * 
 * This follows the same pattern as nextjs-supabase-daas auth setup.
 */

/**
 * Setup: Admin User
 * User with admin_access = true
 */
setup('authenticate as admin', async ({ page }) => {
  const authFile = 'playwright/.auth/admin.json';
  
  await page.goto('/auth/login');
  await page.waitForLoadState('networkidle');
  
  // Login as admin user
  await page.getByLabel('Email').fill('admin@example.com');
  await page.getByLabel('Password').fill('password');
  
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForURL(/\/(users|policies|roles)/, { timeout: 10000 });
  await expect(page.locator('nav, [role="navigation"], h1, h2').first()).toBeVisible({ timeout: 5000 });
  
  await page.context().storageState({ path: authFile });
  console.log('✓ Admin authentication state saved');
});
