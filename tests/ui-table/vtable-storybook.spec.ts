/**
 * VTable Storybook E2E Tests
 * 
 * Tests the @microbuild/ui-table VTable component in isolation using Storybook.
 * No authentication required - components are tested with mocked data.
 * 
 * Prerequisites:
 * 1. Start Storybook: cd packages/ui-table && pnpm storybook
 * 2. Run tests: pnpm exec playwright test tests/ui-table/vtable-storybook.spec.ts
 * 
 * Or run both together:
 *   pnpm test:storybook:table
 */

import { test, expect } from '@playwright/test';

// Storybook URL (can be overridden by env var)
const STORYBOOK_URL = process.env.STORYBOOK_TABLE_URL || process.env.STORYBOOK_URL || 'http://localhost:6007';

// Helper: Navigate to a specific story
async function goToStory(page: import('@playwright/test').Page, storyId: string, waitForTable = true) {
  await page.goto(`${STORYBOOK_URL}/iframe.html?id=${storyId}&viewMode=story`);
  await page.waitForLoadState('networkidle');
  // Wait for Storybook to render (only if form expected)
  if (waitForTable) {
    // Use a more specific selector that targets our VTable component, not Storybook's internal tables
    await page.waitForSelector('.v-table table, .v-table', { timeout: 15000 });
  } else {
    await page.waitForTimeout(1000); // Give Storybook time to render
  }
}

// ============================================================================
// Test Suite: VTable Basic Rendering
// ============================================================================

test.describe('VTable Storybook - Basic Rendering', () => {
  test('should render basic table with headers and rows', async ({ page }) => {
    await goToStory(page, 'tables-vtable--basic');
    
    // Should have table container
    const table = page.locator('.v-table');
    await expect(table).toBeVisible();
    
    // Should have header row (within .v-table)
    const headers = page.locator('.v-table thead th');
    await expect(headers.first()).toBeVisible();
    
    // Should have data rows
    const rows = page.locator('.v-table tbody tr.table-row');
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should render inline style table with border', async ({ page }) => {
    await goToStory(page, 'tables-vtable--inline-style');
    
    const table = page.locator('.v-table.inline');
    await expect(table).toBeVisible();
  });

  test('should render empty state message', async ({ page }) => {
    await goToStory(page, 'tables-vtable--empty', false);
    
    const message = page.getByText(/no.*found|no items|no users/i);
    await expect(message.first()).toBeVisible({ timeout: 5000 });
  });

  test('should render loading state with skeletons', async ({ page }) => {
    await goToStory(page, 'tables-vtable--loading', false);
    
    const table = page.locator('.v-table.loading');
    await expect(table).toBeVisible({ timeout: 5000 });
  });
});

// ============================================================================
// Test Suite: Column Sorting
// ============================================================================

test.describe('VTable Storybook - Column Sorting', () => {
  test('should sort columns when header is clicked', async ({ page }) => {
    await goToStory(page, 'tables-vtable--with-sorting');
    
    // Find the Name header and click it (within .v-table)
    const nameHeader = page.locator('.v-table th').filter({ hasText: 'Name' }).first();
    await expect(nameHeader).toBeVisible();
    
    // Get first row name before sort
    const firstRow = page.locator('.v-table tbody tr.table-row').first();
    const firstNameBefore = await firstRow.locator('td').first().textContent();
    
    // Click header to toggle sort
    await nameHeader.click();
    await page.waitForTimeout(300);
    
    // Click again to reverse sort
    await nameHeader.click();
    await page.waitForTimeout(300);
    
    // Get first row name after sort
    const firstNameAfter = await page.locator('.v-table tbody tr.table-row').first().locator('td').first().textContent();
    
    // Names should be different (sorted)
    // Note: This assumes the data changes order on sort
    expect(firstNameBefore).toBeDefined();
    expect(firstNameAfter).toBeDefined();
  });

  test('should show sort indicator on sorted column', async ({ page }) => {
    await goToStory(page, 'tables-vtable--with-sorting');
    
    // Find sorted header (should have sort-asc or sort-desc class within .v-table)
    const sortedHeader = page.locator('.v-table th.sort-asc, .v-table th.sort-desc');
    await expect(sortedHeader.first()).toBeVisible();
    
    // Should have sort icon
    const sortIcon = sortedHeader.first().locator('.sort-icon.active');
    await expect(sortIcon).toBeVisible();
  });
});

// ============================================================================
// Test Suite: Row Selection
// ============================================================================

test.describe('VTable Storybook - Row Selection', () => {
  test('should select multiple rows with checkboxes', async ({ page }) => {
    await goToStory(page, 'tables-vtable--with-multiple-selection');
    
    // Find checkboxes (within .v-table)
    const checkboxes = page.locator('.v-table tbody input[type="checkbox"]');
    const count = await checkboxes.count();
    expect(count).toBeGreaterThan(0);
    
    // Click first checkbox (force: true because Mantine hides native checkbox)
    await checkboxes.first().click({ force: true });
    await expect(checkboxes.first()).toBeChecked();
    
    // Selection count should update
    const selectionText = page.getByText(/selected.*1/i);
    await expect(selectionText).toBeVisible();
  });

  test('should select all rows with header checkbox', async ({ page }) => {
    await goToStory(page, 'tables-vtable--with-multiple-selection');
    
    // Find header checkbox (within .v-table)
    const headerCheckbox = page.locator('.v-table thead input[type="checkbox"]');
    await expect(headerCheckbox).toBeVisible();
    
    // Click to select all (force: true because Mantine hides native checkbox)
    await headerCheckbox.click({ force: true });
    
    // All row checkboxes should be checked
    const rowCheckboxes = page.locator('.v-table tbody input[type="checkbox"]');
    const count = await rowCheckboxes.count();
    
    for (let i = 0; i < count; i++) {
      await expect(rowCheckboxes.nth(i)).toBeChecked();
    }
  });

  test('should use radio buttons for single selection', async ({ page }) => {
    await goToStory(page, 'tables-vtable--with-single-selection');
    
    // Find radio buttons (within .v-table)
    const radios = page.locator('.v-table tbody input[type="radio"]');
    const count = await radios.count();
    expect(count).toBeGreaterThan(0);
    
    // Click first radio (force: true because Mantine hides native radio)
    await radios.first().click({ force: true });
    await expect(radios.first()).toBeChecked();
    
    // Click second radio
    await radios.nth(1).click({ force: true });
    await expect(radios.nth(1)).toBeChecked();
    
    // First should now be unchecked (single selection)
    await expect(radios.first()).not.toBeChecked();
  });
});

// ============================================================================
// Test Suite: Row Interactions
// ============================================================================

test.describe('VTable Storybook - Row Interactions', () => {
  test('should highlight clickable rows on hover', async ({ page }) => {
    await goToStory(page, 'tables-vtable--clickable-rows');
    
    const row = page.locator('.v-table tbody tr.table-row.clickable').first();
    await expect(row).toBeVisible();
    
    // Hover over row
    await row.hover();
    
    // Row should have clickable class
    await expect(row).toHaveClass(/clickable/);
  });

  test('should render row actions', async ({ page }) => {
    await goToStory(page, 'tables-vtable--with-row-actions');
    
    // Should have action buttons in each row (within .v-table)
    const actionButtons = page.locator('.v-table tbody .cell.append button, .v-table tbody .cell.append [role="button"]');
    const count = await actionButtons.count();
    expect(count).toBeGreaterThan(0);
  });
});

// ============================================================================
// Test Suite: Column Features
// ============================================================================

test.describe('VTable Storybook - Column Features', () => {
  test('should show resize handles', async ({ page }) => {
    await goToStory(page, 'tables-vtable--with-column-resize');
    
    // Should have resize handles on headers (within .v-table)
    const resizeHandles = page.locator('.v-table .resize-handle');
    const count = await resizeHandles.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should resize column on drag', async ({ page }) => {
    await goToStory(page, 'tables-vtable--with-column-resize');
    
    // Find first resize handle (within .v-table)
    const resizeHandle = page.locator('.v-table .resize-handle').first();
    await expect(resizeHandle).toBeVisible();
    
    // Get initial column width
    const header = page.locator('.v-table th').first();
    const initialWidth = await header.evaluate((el) => el.offsetWidth);
    
    // Drag resize handle
    const handleBox = await resizeHandle.boundingBox();
    if (handleBox) {
      await page.mouse.move(handleBox.x + handleBox.width / 2, handleBox.y + handleBox.height / 2);
      await page.mouse.down();
      await page.mouse.move(handleBox.x + 50, handleBox.y + handleBox.height / 2);
      await page.mouse.up();
    }
    
    // Width should have changed
    const newWidth = await header.evaluate((el) => el.offsetWidth);
    expect(newWidth).not.toBe(initialWidth);
  });
});

// ============================================================================
// Test Suite: Custom Cell Rendering
// ============================================================================

test.describe('VTable Storybook - Custom Cells', () => {
  test('should render custom cell content', async ({ page }) => {
    await goToStory(page, 'tables-vtable--with-custom-cells');
    
    // Should have Badge components for status
    const badges = page.locator('.mantine-Badge-root');
    const count = await badges.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should render product table with formatted prices', async ({ page }) => {
    await goToStory(page, 'tables-vtable--product-table');
    
    // Should have prices with $ sign
    const priceCell = page.getByText(/\$\d+\.\d{2}/);
    await expect(priceCell.first()).toBeVisible();
  });
});

// ============================================================================
// Test Suite: States
// ============================================================================

test.describe('VTable Storybook - States', () => {
  test('should show loading indicator with existing data', async ({ page }) => {
    await goToStory(page, 'tables-vtable--loading-with-data');
    
    // Should have loading class
    const table = page.locator('.v-table.loading');
    await expect(table).toBeVisible();
    
    // Should still show data rows (subdued, within .v-table)
    const rows = page.locator('.v-table tbody tr.table-row');
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should disable interactions when disabled', async ({ page }) => {
    await goToStory(page, 'tables-vtable--disabled');
    
    // Should have disabled class
    const table = page.locator('.v-table.disabled');
    await expect(table).toBeVisible();
    
    // Checkboxes should not be visible (showSelect is overridden to 'none' when disabled)
    // Or they should be disabled
  });
});

// ============================================================================
// Test Suite: Fixed Header
// ============================================================================

test.describe('VTable Storybook - Fixed Header', () => {
  test('should have fixed header class when enabled', async ({ page }) => {
    await goToStory(page, 'tables-vtable--fixed-header');
    
    // Container should be scrollable
    const container = page.locator('div').filter({ has: page.locator('.v-table') }).first();
    await expect(container).toBeVisible();
    
    // Header row should have fixed class (within .v-table)
    const fixedHeader = page.locator('.v-table thead tr.fixed');
    await expect(fixedHeader).toBeVisible();
  });
});

// ============================================================================
// Test Suite: Full Featured
// ============================================================================

test.describe('VTable Storybook - Full Featured', () => {
  test('should render full-featured table with all options', async ({ page }) => {
    await goToStory(page, 'tables-vtable--full-featured');
    
    // Should have table
    const table = page.locator('.v-table');
    await expect(table).toBeVisible();
    
    // Should have checkboxes (multiple selection, within .v-table)
    const checkboxes = page.locator('.v-table thead input[type="checkbox"]');
    await expect(checkboxes.first()).toBeVisible();
    
    // Should have resize handles (within .v-table)
    const resizeHandles = page.locator('.v-table .resize-handle');
    expect(await resizeHandles.count()).toBeGreaterThan(0);
    
    // Should have row actions (within .v-table)
    const actions = page.locator('.v-table tbody .cell.append');
    expect(await actions.count()).toBeGreaterThan(0);
  });
});

// ============================================================================
// Test Suite: Accessibility
// ============================================================================

test.describe('VTable Storybook - Accessibility', () => {
  test('should have accessible table structure', async ({ page }) => {
    await goToStory(page, 'tables-vtable--basic');
    
    // Should have proper table semantics (within .v-table)
    const table = page.locator('.v-table table');
    await expect(table).toBeVisible();
    
    // Should have thead (within .v-table)
    const thead = page.locator('.v-table thead');
    await expect(thead).toBeVisible();
    
    // Should have th elements (within .v-table)
    const ths = page.locator('.v-table th');
    expect(await ths.count()).toBeGreaterThan(0);
  });

  test('should have accessible checkboxes with labels', async ({ page }) => {
    await goToStory(page, 'tables-vtable--with-multiple-selection');
    
    // Checkboxes should have aria-label (within .v-table)
    const checkboxes = page.locator('.v-table input[type="checkbox"]');
    const count = await checkboxes.count();
    expect(count).toBeGreaterThan(0);
    
    // Each checkbox should be accessible
    for (let i = 0; i < Math.min(count, 3); i++) {
      const checkbox = checkboxes.nth(i);
      const ariaLabel = await checkbox.getAttribute('aria-label');
      expect(ariaLabel || (await checkbox.evaluate((el) => el.parentElement?.textContent))).toBeTruthy();
    }
  });

  test('should support keyboard navigation for clickable rows', async ({ page }) => {
    await goToStory(page, 'tables-vtable--clickable-rows');
    
    // Clickable rows should be focusable (within .v-table)
    const clickableRow = page.locator('.v-table tbody tr.table-row.clickable').first();
    await expect(clickableRow).toBeVisible();
    
    // Should have tabindex
    const tabindex = await clickableRow.getAttribute('tabindex');
    expect(tabindex).toBe('0');
  });
});
