import { test, expect } from '@playwright/test';

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
  await page.addInitScript((session) => {
    window.localStorage.setItem('sb-nbeanexfweaewyjrhzce-auth-token', JSON.stringify(session));
  }, mockSession);
});

test.describe('Account Management', () => {
  test('should create a new account and verify details', async ({ page }) => {
    await page.goto('/accounts');
    
    await expect(page.locator('h1')).toContainText('Accounts');
    
    // Click Add Account
    await page.getByRole('button', { name: 'Add Account' }).click();
    
    // Fill form using instrumented IDs
    await page.getByTestId('account-name-input').fill('Playwright Test Client');
    await page.getByTestId('account-email-input').fill('client@test.com');
    await page.getByTestId('account-entity-select').click();
    await page.getByRole('option', { name: 'ITS' }).click();
    
    // Submit
    await page.getByTestId('account-submit-button').click();
    
    // Verify list update
    await expect(page.locator('text=Playwright Test Client')).toBeVisible();
  });

  test('should navigate to account details', async ({ page }) => {
    await page.goto('/accounts');
    
    // Find an account row and click (simplified)
    const firstAccount = page.locator('tr').nth(1); // 0 is header
    await firstAccount.click();
    
    // Should be on detail page
    await expect(page).toHaveURL(/\/accounts\//);
  });
});
