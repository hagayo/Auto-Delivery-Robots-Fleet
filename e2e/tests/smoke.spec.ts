import { test, expect } from '@playwright/test';

test('web app loads', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('FleetOps Dashboard')).toBeVisible();
});