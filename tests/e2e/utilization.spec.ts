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

test.describe('Utilization & Resource Allocation', () => {
  test('should display utilization board with heatmap', async ({ page }) => {
    await page.goto('/utilization');
    
    await expect(page.locator('h1')).toContainText('Resource Utilization');
    
    // Verify heatmap grid exists
    const grid = page.locator('.grid');
    await expect(grid).toBeVisible();
  });

  test('should verify entity-wise utilization percentages', async ({ page }) => {
    await page.goto('/utilization');
    
    // Check for entity labels in the utilization summary
    await expect(page.locator('text=ITS')).toBeVisible();
    await expect(page.locator('text=IBCC')).toBeVisible();
    await expect(page.locator('text=IITT')).toBeVisible();
    
    // Verify that at least one progress bar/utilization span is visible
    const utilizationSpans = page.locator('span:has-text("%")');
    await expect(utilizationSpans.first()).toBeVisible();
  });

  test('should navigate through the utilization board tabs', async ({ page }) => {
    await page.goto('/utilization');
    
    // Switch to Monthly view if tabs exist
    const monthlyTab = page.locator('button:has-text("Monthly")');
    if (await monthlyTab.isVisible()) {
      await monthlyTab.click();
      await expect(page.locator('text=Monthly Distribution')).toBeVisible();
    }
  });
});
