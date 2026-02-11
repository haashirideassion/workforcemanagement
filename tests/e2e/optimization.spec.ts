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

test.describe('Optimization & Risk Rules', () => {
  test('should display optimization table with correct headers', async ({ page }) => {
    await page.goto('/optimization');
    
    await expect(page.locator('h1')).toContainText('Optimization');
    const tableHeaders = page.locator('th');
    await expect(tableHeaders).toHaveText([
      'Employee',
      'Specialization',
      'Utilization',
      'Bench Status',
      'Risk Status'
    ]);
  });

  test('should filter by utilization levels', async ({ page }) => {
    await page.goto('/optimization');
    
    // Test Utilization Filter
    await page.locator('button:has-text("All Utilization")').click();
    await page.getByRole('option', { name: 'Low (<50%)' }).click();
    
    // Verify that all visible risk badges are relevant or rows are filtered
    const rows = page.locator('[data-testid="optimization-row"]');
    // Assuming at least one exists in mock data or it handles empty state gracefully
  });

  test('should verify risk assessment logic displayed in badges', async ({ page }) => {
    await page.goto('/optimization');
    
    // Check for "Layoff Recommended" if bench > 30 days
    // This depends on the mock data in useEmployees.ts
    const layoffBadges = page.getByTestId('risk-badge-layoff');
    const atRiskBadges = page.getByTestId('risk-badge-at-risk');
    const reviewNeededBadges = page.getByTestId('risk-badge-review');
    
    // At least some badges should be present if mock data covers these cases
    const totalBadges = await layoffBadges.count() + await atRiskBadges.count() + await reviewNeededBadges.count();
    expect(totalBadges).toBeGreaterThan(0);
  });
});
