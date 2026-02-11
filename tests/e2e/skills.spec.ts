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

test.describe('Skill Management', () => {
  test('should create a new skill and show it in the list', async ({ page }) => {
    await page.goto('/skills');
    
    await expect(page.locator('h1')).toContainText('Skills');
    
    // Click Add Skill
    await page.getByRole('button', { name: 'Add Skill' }).click();
    
    // Fill form
    await page.getByTestId('skill-name-input').fill('Playwright-Auto-Skill');
    await page.getByTestId('skill-category-input').fill('Testing');
    
    // Submit
    await page.getByTestId('skill-submit-button').click();
    
    // Verify toast or list update (simplified)
    await expect(page.locator('text=Playwright-Auto-Skill')).toBeVisible();
  });

  test('should verify predefined skills are present', async ({ page }) => {
    await page.goto('/skills');
    
    // Check for some common skills from mock data
    await expect(page.locator('text=React')).toBeVisible();
    await expect(page.locator('text=Node.js')).toBeVisible();
  });
});
