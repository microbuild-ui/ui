# Testing Guide

Comprehensive testing guide for Microbuild UI Packages.

## Overview

Microbuild UI Packages uses a **two-tier testing strategy**:

1. **Storybook Component Tests** - Isolated component testing (no auth needed)
2. **DaaS E2E Tests** - Integration testing against the hosted DaaS application

This approach provides the best of both worlds: fast, isolated component testing for rapid development, and comprehensive E2E testing for validating real-world usage.

## Quick Start

```bash
# Install dependencies
pnpm install
pnpm exec playwright install chromium

# Option 1: Storybook Tests (Recommended for component development)
pnpm storybook:form          # Start VForm Storybook on port 6006
pnpm test:storybook          # Run Playwright against Storybook

# Option 2: DaaS E2E Tests (Full integration testing)
pnpm test:e2e                # Run against hosted DaaS
pnpm test:e2e:ui             # Interactive Playwright UI
```

## VForm Component Testing

The VForm component has extensive test coverage across both tiers:

### Storybook Stories

**Basic Stories** ([packages/ui-form/src/VForm.stories.tsx](../packages/ui-form/src/VForm.stories.tsx)):
- All field interface types (40+ types)
- Different layouts (full, half, fill widths)
- Form states (loading, disabled, validation errors)
- Create vs Edit modes
- Required fields and validation
- Accessibility features

**DaaS Playground** ([packages/ui-form/src/VForm.daas.stories.tsx](../packages/ui-form/src/VForm.daas.stories.tsx)):
- Connect to real DaaS instance with your credentials
- Fetch actual collection schemas from live API
- Test with real data and field configurations
- No code required - just enter DaaS URL and static token
- Perfect for testing custom collections and edge cases
- Saves credentials in localStorage for convenience

**How to Use DaaS Playground:**
```bash
# 1. Start VForm Storybook
pnpm storybook:form

# 2. Navigate to "Forms/VForm DaaS Playground" story

# 3. Generate Static Token in DaaS:
#    - Log into your DaaS instance as admin
#    - Go to Users → Edit your user
#    - Scroll to Token field → Click "Generate Token"
#    - Copy the token (it won't be shown again!)
#    - Click Save

# 4. In Storybook Playground:
#    - Enter DaaS URL: https://xxx.microbuild-daas.xtremax.com
#    - Enter static token
#    - Click Connect
#    - Enter collection name (e.g., "test_vform_articles")
#    - Click Load Fields
#    - Test VForm with real fields!
```

### Test Files Organization

```
tests/ui-form/
├── vform-storybook.spec.ts   # Storybook component tests (fast, isolated)
├── vform-daas.spec.ts        # DaaS integration tests (real API)
└── vform.spec.ts             # Full E2E workflow tests (create, edit, validate)

tests/helpers/
└── seed-test-data.ts         # Test data seeding utilities for E2E

tests/
└── auth.setup.ts             # Authentication setup (runs once before E2E)
```

## Test Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          Test Infrastructure                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                    TIER 1: Storybook Component Tests                     │ │
│  │                       (Isolated, No Auth Required)                       │ │
│  ├─────────────────────────────────────────────────────────────────────────┤ │
│  │  ┌─────────────────────┐       ┌─────────────────────────────────────┐  │ │
│  │  │  Playwright Tests   │       │  Storybook (localhost:6006)         │  │ │
│  │  │  vform-storybook    │ ────► │  - VForm.stories.tsx                │  │ │
│  │  │  .spec.ts           │       │  - Mocked data/API                  │  │ │
│  │  │                     │       │  - All interface types              │  │ │
│  │  └─────────────────────┘       └─────────────────────────────────────┘  │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                               │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                    TIER 2: DaaS E2E Tests                                │ │
│  │                   (Integration, Auth Required)                           │ │
│  ├─────────────────────────────────────────────────────────────────────────┤ │
│  │  ┌─────────────────────┐       ┌─────────────────────────────────────┐  │ │
│  │  │  Playwright Tests   │       │  DaaS Application                   │  │ │
│  │  │  vform-daas.spec.ts │ ────► │  - /users/[id] pages                │  │ │
│  │  │  auth.setup.ts      │       │  - Real Supabase backend            │  │ │
│  │  │                     │       │  - Actual permissions               │  │ │
│  │  └─────────────────────┘       └─────────────────────────────────────┘  │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Tier 1: Storybook Component Tests

### Why Storybook?

- ✅ **Isolated** - Test components without full app
- ✅ **No Auth** - Mocked data, no real API calls
- ✅ **Fast** - Quick iteration during development
- ✅ **All Interface Types** - Test any field configuration
- ✅ **Visual** - See component states visually
- ✅ **DaaS Playground** - Connect to real DaaS and test with actual schemas

### VForm Stories Available

| Story | Description |
|-------|-------------|
| `Basic` | Simple form with title, slug, status |
| `AllFieldTypes` | All interface types: input, textarea, boolean, datetime, select, slider, tags, code |
| `EditMode` | Form with existing values |
| `WithValidationErrors` | Showing validation messages |
| `Disabled` | All fields disabled |
| `Loading` | Loading skeleton state |
| `HalfWidthLayout` | Grid layout demonstration |
| `WithReadonlyFields` | System fields (id, date_created) |
| `RequiredFieldsOnly` | Required field indicators |
| `EmptyForm` | No visible fields message |
| **`Playground` (DaaS)** | **Connect to real DaaS and test with live API** |

### Running Storybook Tests

```bash
# Terminal 1: Start Storybook
cd packages/ui-form
pnpm storybook

# Terminal 2: Run tests
pnpm test:storybook

# Or use the root script
pnpm storybook:form    # Start Storybook
pnpm test:storybook    # Run Playwright tests
```

### Test Files

| File | Purpose |
|------|---------|
| `tests/ui-form/vform-storybook.spec.ts` | Playwright tests for Storybook stories |
| `packages/ui-form/src/VForm.stories.tsx` | Storybook story definitions |

## Tier 2: DaaS E2E Tests

### Why DaaS Tests?

- ✅ **Real Integration** - Actual API calls
- ✅ **Authentication** - Test with real users/roles
- ✅ **Permissions** - Verify field-level access
- ✅ **End-to-End** - Full user journey

### Prerequisites

1. **Hosted DaaS** configured in `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxx.microbuild-supabase.xtremax.com
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   NEXT_PUBLIC_MICROBUILD_DAAS_URL=https://xxx.microbuild-daas.xtremax.com
   ```

2. **Test credentials** in `.env.local`:
   ```env
   TEST_ADMIN_EMAIL=admin@test.com
   TEST_ADMIN_PASSWORD=your-password
   ```

### Running DaaS Tests

```bash
# Run all DaaS E2E tests
pnpm test:e2e

# Run specific test file
pnpm exec playwright test tests/ui-form/vform-daas.spec.ts

# Interactive UI mode
pnpm test:e2e:ui
```

### Test Files

| File | Purpose |
|------|---------|
| `tests/auth.setup.ts` | Saves admin auth state (runs once before E2E) |
| `tests/helpers/seed-test-data.ts` | Test data seeding utilities for E2E tests |
| `tests/ui-form/vform-daas.spec.ts` | Tests VForm in DaaS /users pages (integration) |
| `tests/ui-form/vform.spec.ts` | Complete E2E workflow tests (create, edit, validate) |

## Playwright Configuration

The `playwright.config.ts` defines dual-mode testing with automatic Storybook startup:

```typescript
projects: [
  // Auth setup for DaaS tests
  { name: 'setup', testMatch: /.*\.setup\.ts/ },
  
  // DaaS E2E tests (requires auth)
  { 
    name: 'chromium', 
    testIgnore: /.*storybook.*/, 
    dependencies: ['setup'],
    use: { baseURL: DAAS_URL }
  },
  
  // Storybook tests (no auth needed)
  { 
    name: 'storybook', 
    testMatch: /.*storybook.*/, 
    use: { baseURL: STORYBOOK_URL }
  },
],

// Auto-start Storybook for component tests
webServer: {
  command: 'cd packages/ui-form && pnpm storybook --ci',
  url: 'http://localhost:6006',
  reuseExistingServer: !process.env.CI,
}
```

**Features:**
- ✅ Auto-starts Storybook when running `pnpm test:storybook`
- ✅ Separates DaaS and Storybook tests by project
- ✅ Authentication setup runs once before DaaS tests
- ✅ Environment variable configuration for URLs

## Writing New Tests

### Storybook Story Example

```tsx
// packages/ui-form/src/MyComponent.stories.tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { VForm } from './VForm';

const meta: Meta<typeof VForm> = {
  title: 'Forms/VForm',
  component: VForm,
};
export default meta;

export const MyStory: StoryObj<typeof VForm> = {
  render: () => <VForm fields={myFields} />,
};
```

### Storybook Test Example

```typescript
// tests/ui-form/vform-storybook.spec.ts
test('should render my story', async ({ page }) => {
  await page.goto('http://localhost:6006/iframe.html?id=forms-vform--my-story');
  await expect(page.locator('.v-form')).toBeVisible();
});
```

### DaaS Test Example

```typescript
// tests/ui-form/vform-daas.spec.ts
test.describe('VForm in Users', () => {
  test.use({ storageState: 'playwright/.auth/admin.json' });
  
  test('should render form', async ({ page }) => {
    await page.goto('/users/some-id');
    await expect(page.getByTestId('dynamic-form')).toBeVisible();
  });
});
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests
on: [push, pull_request]

jobs:
  storybook-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm exec playwright install chromium
      - name: Run Storybook tests
        run: pnpm test:storybook
        # webServer auto-starts Storybook via playwright.config.ts

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm exec playwright install chromium
      - run: pnpm test:e2e
        env:
          NEXT_PUBLIC_MICROBUILD_DAAS_URL: ${{ secrets.DAAS_URL }}
          # Credentials are passed via environment variables
```

## Troubleshooting

### Storybook won't start
```bash
# Clear cache and reinstall
cd packages/ui-form
rm -rf node_modules/.cache storybook-static
pnpm install
pnpm storybook
```

### DaaS tests failing with 401
- Check `.env.local` has correct credentials
- Delete `playwright/.auth/admin.json` and re-run setup:
  ```bash
  rm -rf playwright/.auth
  pnpm exec playwright test tests/auth.setup.ts
  ```
- Verify admin user exists in DaaS with correct email/password

### DaaS Playground connection issues
- Ensure DaaS is accessible from browser
- Generate a fresh static token (tokens may expire)
- Check browser console for CORS errors
- Try clearing localStorage:
  ```js
  // In browser console
  localStorage.removeItem('storybook_daas_url');
  localStorage.removeItem('storybook_daas_token');
  localStorage.removeItem('storybook_daas_collection');
  ```

### Tests timing out
- Increase timeout in test: `test.setTimeout(60000)`
- Check network connection to DaaS
- Verify DaaS is not under heavy load
- For Storybook tests, ensure port 6006 is not in use
- Check network connectivity to DaaS
- Verify Storybook is running on port 6006

## Interface Types Coverage

The Storybook tests cover all major interface types:

| Interface | Story | Test |
|-----------|-------|------|
| `input` | AllFieldTypes | ✅ |
| `input-multiline` | AllFieldTypes | ✅ |
| `boolean` | AllFieldTypes | ✅ |
| `datetime` | AllFieldTypes | ✅ |
| `select-dropdown` | AllFieldTypes | ✅ |
| `slider` | AllFieldTypes | ✅ |
| `tags` | AllFieldTypes | ✅ |
| `input-code` | AllFieldTypes | ✅ |
| Validation errors | WithValidationErrors | ✅ |
| Disabled state | Disabled | ✅ |
| Loading state | Loading | ✅ |
| Field widths | HalfWidthLayout | ✅ |
| Readonly fields | WithReadonlyFields | ✅ |
