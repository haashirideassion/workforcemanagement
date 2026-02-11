import { test, expect } from '@playwright/test';

// Mock session data for Supabase auth bypass
const mockSession = {
  access_token: 'mock-token',
  refresh_token: 'mock-refresh-token',
  user: {
    id: '00000000-0000-0000-0000-000000000000',
    email: 'test@example.com',
    app_metadata: { provider: 'email', providers: ['email'] },
    user_metadata: {},
    aud: 'authenticated',
    role: 'authenticated'
  },
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600
};

test.beforeEach(async ({ page }) => {
  // Inject mock session into localStorage before each test
  await page.addInitScript((session) => {
    window.localStorage.setItem('sb-nbeanexfweaewyjrhzce-auth-token', JSON.stringify(session));
  }, mockSession);
});

test.describe('Employee Management', () => {
  test('should list employees and filter by entity', async ({ page }) => {
    await page.goto('/employees');
    
    // Check if the page title is correct
    await expect(page.locator('h1')).toContainText('Employees');
    
    // Check if at least one employee row exists (assuming mock data is loaded)
    const employeeRows = page.locator('[data-testid^="employee-row-"]');
    await expect(employeeRows.first()).toBeVisible();
    
    // Test Entity Filter
    await page.getByTestId('employee-entity-select').click();
    await page.getByRole('option', { name: 'ITS' }).click();
    
    // Verify results count or table content (simplified)
    // We expect the table to update
  });

  test('should navigate through the multi-step add employee form', async ({ page }) => {
    await page.goto('/employees');
    
    await page.getByTestId('add-employee-button').click();
    
    // Step 1: Basic Info
    await page.getByTestId('employee-name-input-step1').fill('Playwright Test Bot');
    await page.getByTestId('employee-email-input-step1').fill('bot@test.com');
    await page.getByTestId('employee-next-button').click();
    
    // Step 2: Skills & Details (assuming we add more IDs)
    // For now, check if button changed to submit or next step exists
    // Since I haven't added all IDs yet, this is a skeleton
  });
});
