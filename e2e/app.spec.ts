import { test, expect } from '@playwright/test';

test.describe('App', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api.github.com/**', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ public_repos: 23 }) })
    );
    await page.route('**/api.open-meteo.com/**', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ current: { temperature_2m: 22 } }) })
    );
    await page.route('**/earthquake.usgs.gov/**', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ metadata: { count: 5 }, features: [] }) })
    );
    await page.route('**/api.wheretheiss.at/**', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ latitude: 45, longitude: -73, altitude: 408, velocity: 27600 }) })
    );
  });

  test('should load with correct title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/apps/i);
  });

  test('should show status bar with clock', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#clock')).toBeVisible();
  });

  test('should show app icons', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.pages-track, #track')).toBeAttached();
  });

  test('should show dock', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.dock')).toBeVisible();
  });

  test('should show page dots', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#dots')).toBeVisible();
  });
});
