/**
 * Test Data Seeder for VForm Component Testing
 * 
 * This script seeds test data via the DaaS API to enable comprehensive
 * testing of the VForm component's dynamic field rendering and validation.
 * 
 * Prerequisites:
 * 1. DaaS app running at localhost:3000 or configured URL
 * 2. Admin authentication state saved (run auth.setup.ts first)
 * 
 * Usage with Playwright:
 *   import { seedTestData, cleanupTestData } from './helpers/seed-test-data';
 *   
 *   test.beforeAll(async ({ browser }) => {
 *     const context = await browser.newContext({ storageState: ADMIN_AUTH });
 *     const page = await context.newPage();
 *     await seedTestData(page);
 *     await context.close();
 *   });
 */

import { type Page } from '@playwright/test';

// Test IDs - use consistent UUIDs for easy cleanup
export const TEST_IDS = {
  // Test role for field permissions testing
  testRole: 'aaaaaaaa-1111-1111-1111-test00role01',
  // Test policy with limited field access
  limitedFieldsPolicy: 'bbbbbbbb-2222-2222-2222-limited0pol',
  // Test user with limited access
  limitedUser: 'cccccccc-3333-3333-3333-limited0usr',
};

// Test collection name for VForm testing
export const TEST_COLLECTION = 'test_vform_articles';

/**
 * API helper to make authenticated requests
 */
async function apiRequest(page: Page, method: string, endpoint: string, body?: any) {
  return await page.evaluate(async ({ method, endpoint, body }) => {
    const response = await fetch(`${window.location.origin}${endpoint}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await response.json();
    return { status: response.status, data };
  }, { method, endpoint, body });
}

/**
 * Create test collection with diverse field types
 */
export async function createTestCollection(page: Page): Promise<boolean> {
  console.log('📦 Creating test collection with diverse field types...');
  
  // Navigate first to establish session
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  
  // 1. Create the collection
  const collectionResult = await apiRequest(page, 'POST', '/api/collections', {
    collection: TEST_COLLECTION,
    meta: {
      collection: TEST_COLLECTION,
      icon: 'article',
      note: 'Test collection for VForm component testing',
      hidden: false,
      singleton: false,
    },
    schema: {
      name: TEST_COLLECTION,
    },
    fields: [
      // Primary key
      {
        field: 'id',
        type: 'uuid',
        schema: {
          is_primary_key: true,
          has_auto_increment: false,
          default_value: null,
          is_nullable: false,
        },
        meta: {
          interface: 'input',
          readonly: true,
          hidden: true,
          special: ['uuid'],
        },
      },
      // String field - title (required)
      {
        field: 'title',
        type: 'string',
        schema: {
          is_nullable: false,
          max_length: 255,
        },
        meta: {
          interface: 'input',
          required: true,
          width: 'full',
          sort: 1,
          options: {
            placeholder: 'Enter article title...',
          },
        },
      },
      // Text field - content (with soft length validation)
      {
        field: 'content',
        type: 'text',
        schema: {
          is_nullable: true,
        },
        meta: {
          interface: 'input-multiline',
          width: 'full',
          sort: 2,
          options: {
            placeholder: 'Write your content here...',
            softLength: 500,
          },
        },
      },
      // Boolean field - published
      {
        field: 'published',
        type: 'boolean',
        schema: {
          is_nullable: false,
          default_value: false,
        },
        meta: {
          interface: 'boolean',
          width: 'half',
          sort: 3,
        },
      },
      // Datetime field - publish_date
      {
        field: 'publish_date',
        type: 'timestamp',
        schema: {
          is_nullable: true,
        },
        meta: {
          interface: 'datetime',
          width: 'half',
          sort: 4,
        },
      },
      // Integer field - view_count
      {
        field: 'view_count',
        type: 'integer',
        schema: {
          is_nullable: false,
          default_value: 0,
        },
        meta: {
          interface: 'input',
          width: 'half',
          sort: 5,
          options: {
            min: 0,
          },
        },
      },
      // Select dropdown - status
      {
        field: 'status',
        type: 'string',
        schema: {
          is_nullable: false,
          default_value: 'draft',
        },
        meta: {
          interface: 'select-dropdown',
          width: 'half',
          sort: 6,
          options: {
            choices: [
              { text: 'Draft', value: 'draft' },
              { text: 'In Review', value: 'review' },
              { text: 'Published', value: 'published' },
              { text: 'Archived', value: 'archived' },
            ],
          },
        },
      },
      // Tags field - for csv/array type
      {
        field: 'tags',
        type: 'json',
        schema: {
          is_nullable: true,
        },
        meta: {
          interface: 'tags',
          width: 'full',
          sort: 7,
          special: ['cast-json'],
        },
      },
      // JSON field - metadata
      {
        field: 'metadata',
        type: 'json',
        schema: {
          is_nullable: true,
        },
        meta: {
          interface: 'input-code',
          width: 'full',
          sort: 8,
          options: {
            language: 'json',
          },
          special: ['cast-json'],
        },
      },
      // Email field - author_email (with validation)
      {
        field: 'author_email',
        type: 'string',
        schema: {
          is_nullable: true,
          max_length: 255,
        },
        meta: {
          interface: 'input',
          width: 'half',
          sort: 9,
          options: {
            placeholder: 'author@example.com',
          },
          validation: {
            _and: [
              {
                author_email: {
                  _regex: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
                },
              },
            ],
          },
          validation_message: 'Please enter a valid email address',
        },
      },
      // URL field - source_url
      {
        field: 'source_url',
        type: 'string',
        schema: {
          is_nullable: true,
          max_length: 2048,
        },
        meta: {
          interface: 'input',
          width: 'half',
          sort: 10,
          options: {
            placeholder: 'https://...',
          },
        },
      },
      // Rating field - priority
      {
        field: 'priority',
        type: 'integer',
        schema: {
          is_nullable: true,
          default_value: 3,
        },
        meta: {
          interface: 'slider',
          width: 'full',
          sort: 11,
          options: {
            min: 1,
            max: 5,
            step: 1,
          },
        },
      },
      // Timestamp fields (auto-generated)
      {
        field: 'date_created',
        type: 'timestamp',
        schema: {
          is_nullable: true,
        },
        meta: {
          interface: 'datetime',
          readonly: true,
          hidden: true,
          special: ['date-created'],
          sort: 100,
        },
      },
      {
        field: 'date_updated',
        type: 'timestamp',
        schema: {
          is_nullable: true,
        },
        meta: {
          interface: 'datetime',
          readonly: true,
          hidden: true,
          special: ['date-updated'],
          sort: 101,
        },
      },
    ],
  });

  if (collectionResult.status >= 400) {
    // Collection might already exist - check both error formats
    const errorMessage = collectionResult.data?.error || 
                         collectionResult.data?.errors?.[0]?.message || 
                         JSON.stringify(collectionResult.data);
    if (errorMessage.includes('already exists')) {
      console.log('  ⚠️ Collection already exists, skipping creation');
      return true;
    }
    console.error('  ❌ Failed to create collection:', collectionResult.data);
    return false;
  }

  console.log('  ✅ Created test collection:', TEST_COLLECTION);
  return true;
}

/**
 * Create test role with limited permissions
 */
export async function createTestRole(page: Page): Promise<boolean> {
  console.log('👤 Creating test role with limited field access...');
  
  // 1. Create role
  const roleResult = await apiRequest(page, 'POST', '/api/roles', {
    id: TEST_IDS.testRole,
    name: 'VForm Test Role',
    icon: 'science',
    admin_access: false,
    app_access: true,
  });

  const roleError = roleResult.data?.error || roleResult.data?.errors?.[0]?.message || '';
  if (roleResult.status >= 400 && !roleError.includes('duplicate') && !roleError.includes('already exists')) {
    console.error('  ❌ Failed to create role:', roleResult.data);
    return false;
  }
  console.log('  ✅ Created test role');

  // 2. Create policy with limited field access
  const policyResult = await apiRequest(page, 'POST', '/api/policies', {
    id: TEST_IDS.limitedFieldsPolicy,
    name: 'Limited Fields Policy',
    icon: 'lock',
    admin_access: false,
    app_access: true,
  });

  const policyError = policyResult.data?.error || policyResult.data?.errors?.[0]?.message || '';
  if (policyResult.status >= 400 && !policyError.includes('duplicate') && !policyError.includes('already exists')) {
    console.error('  ❌ Failed to create policy:', policyResult.data);
    return false;
  }
  console.log('  ✅ Created test policy');

  // 3. Create permissions for the test collection
  // Full access permission
  const fullPermission = await apiRequest(page, 'POST', '/api/permissions', {
    policy: TEST_IDS.limitedFieldsPolicy,
    collection: TEST_COLLECTION,
    action: 'read',
    fields: ['*'], // All fields
    permissions: {}, // No filter (all items)
  });

  // Limited write permission - only certain fields
  const limitedWritePermission = await apiRequest(page, 'POST', '/api/permissions', {
    policy: TEST_IDS.limitedFieldsPolicy,
    collection: TEST_COLLECTION,
    action: 'update',
    fields: ['title', 'content', 'status', 'tags'], // Limited fields
    permissions: {}, // No filter
    validation: {
      title: {
        _nnull: true, // Title must not be null
      },
    },
    validation_message: 'Title is required and cannot be empty',
  });

  // Create permission
  const createPermission = await apiRequest(page, 'POST', '/api/permissions', {
    policy: TEST_IDS.limitedFieldsPolicy,
    collection: TEST_COLLECTION,
    action: 'create',
    fields: ['title', 'content', 'status', 'published', 'tags', 'author_email'],
    permissions: {},
  });

  // 4. Link policy to role
  const accessResult = await apiRequest(page, 'POST', '/api/access', {
    role: TEST_IDS.testRole,
    policy: TEST_IDS.limitedFieldsPolicy,
  });

  console.log('  ✅ Created permissions and linked to role');
  return true;
}

/**
 * Create test user with limited role
 */
export async function createTestUser(page: Page): Promise<boolean> {
  console.log('👤 Creating test user with limited access...');
  
  const userResult = await apiRequest(page, 'POST', '/api/users', {
    email: 'vform-test@example.com',
    password: 'VFormTest123!',
    first_name: 'VForm',
    last_name: 'Tester',
    role: TEST_IDS.testRole,
    status: 'active',
  });

  const userError = userResult.data?.error || userResult.data?.errors?.[0]?.message || '';
  if (userResult.status >= 400 && !userError.includes('duplicate') && !userError.includes('already exists')) {
    console.error('  ❌ Failed to create user:', userResult.data);
    return false;
  }

  console.log('  ✅ Created test user: vform-test@example.com');
  return true;
}

/**
 * Create sample items in test collection
 */
export async function createTestItems(page: Page): Promise<boolean> {
  console.log('📝 Creating test items...');
  
  const testItems = [
    {
      title: 'First Article',
      content: 'This is the content of the first article.',
      published: true,
      publish_date: new Date().toISOString(),
      view_count: 100,
      status: 'published',
      tags: ['featured', 'news'],
      author_email: 'author1@example.com',
      priority: 5,
    },
    {
      title: 'Draft Article',
      content: 'This article is still in draft.',
      published: false,
      view_count: 0,
      status: 'draft',
      tags: ['draft'],
      priority: 3,
    },
    {
      title: 'Article in Review',
      content: 'This article is being reviewed.',
      published: false,
      view_count: 50,
      status: 'review',
      tags: ['pending', 'review'],
      author_email: 'reviewer@example.com',
      priority: 4,
    },
  ];

  for (const item of testItems) {
    const result = await apiRequest(page, 'POST', `/api/items/${TEST_COLLECTION}`, item);
    if (result.status >= 400) {
      console.error(`  ⚠️ Failed to create item "${item.title}":`, result.data);
    } else {
      console.log(`  ✅ Created item: ${item.title}`);
    }
  }

  return true;
}

/**
 * Main seed function - creates all test data
 */
export async function seedTestData(page: Page): Promise<{ success: boolean; message: string }> {
  console.log('\n🌱 Starting VForm test data seeding...\n');
  
  try {
    const collectionCreated = await createTestCollection(page);
    if (!collectionCreated) {
      return { success: false, message: 'Failed to create test collection' };
    }

    const roleCreated = await createTestRole(page);
    if (!roleCreated) {
      return { success: false, message: 'Failed to create test role/policy' };
    }

    const userCreated = await createTestUser(page);
    if (!userCreated) {
      return { success: false, message: 'Failed to create test user' };
    }

    const itemsCreated = await createTestItems(page);
    if (!itemsCreated) {
      return { success: false, message: 'Failed to create test items' };
    }

    console.log('\n✅ VForm test data seeding complete!\n');
    return { success: true, message: 'All test data created successfully' };
  } catch (error) {
    console.error('❌ Seeding error:', error);
    return { success: false, message: `Seeding failed: ${error}` };
  }
}

/**
 * Cleanup function - removes all test data
 */
export async function cleanupTestData(page: Page): Promise<void> {
  console.log('\n🧹 Cleaning up VForm test data...\n');
  
  try {
    // Navigate first
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Delete test user
    await apiRequest(page, 'DELETE', `/api/users?filter[email][_eq]=vform-test@example.com`);
    console.log('  ✅ Deleted test user');

    // Delete access links
    await apiRequest(page, 'DELETE', `/api/access?filter[role][_eq]=${TEST_IDS.testRole}`);
    console.log('  ✅ Deleted access links');

    // Delete permissions
    await apiRequest(page, 'DELETE', `/api/permissions?filter[policy][_eq]=${TEST_IDS.limitedFieldsPolicy}`);
    console.log('  ✅ Deleted permissions');

    // Delete policy
    await apiRequest(page, 'DELETE', `/api/policies/${TEST_IDS.limitedFieldsPolicy}`);
    console.log('  ✅ Deleted test policy');

    // Delete role
    await apiRequest(page, 'DELETE', `/api/roles/${TEST_IDS.testRole}`);
    console.log('  ✅ Deleted test role');

    // Delete test collection (this also deletes all items)
    await apiRequest(page, 'DELETE', `/api/collections/${TEST_COLLECTION}`);
    console.log('  ✅ Deleted test collection');

    console.log('\n✅ Cleanup complete!\n');
  } catch (error) {
    console.error('⚠️ Cleanup error (may be partial):', error);
  }
}

/**
 * Standalone runner for seeding
 */
export async function runSeeder(page: Page, action: 'seed' | 'cleanup' = 'seed') {
  if (action === 'cleanup') {
    await cleanupTestData(page);
  } else {
    await seedTestData(page);
  }
}
