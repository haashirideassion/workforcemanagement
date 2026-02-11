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

test.describe('Dashboard Operations', () => {
  test('should display key performance indicators', async ({ page }) => {
    await page.goto('/');
    
    // Check main title
    await expect(page.locator('h1')).toContainText('Workforce Intelligence Summary');
    
    // Verify specific KPI cards exist
    await expect(page.getByTestId('kpi-total-employees')).toBeVisible();
    await expect(page.getByTestId('kpi-active-projects')).toBeVisible();
    await expect(page.getByTestId('kpi-bench-count')).toBeVisible();
  });

  test('should navigate to employees page when clicking bench card', async ({ page }) => {
    await page.goto('/');
    
    await page.getByTestId('kpi-bench-count').click();
    
    // Verify navigation
    await expect(page).toHaveURL(/\/employees\?filter=benched/);
    await expect(page.locator('h1')).toContainText('Employees');
  });

  test('should verify sidebar navigation', async ({ page }) => {
    await page.goto('/');
    
    // Click Optimization link in sidebar
    await page.getByTestId('nav-optimization').click();
    await expect(page).toHaveURL(/\/optimization/);
    await expect(page.locator('h1')).toContainText('Optimization');
  });
});
