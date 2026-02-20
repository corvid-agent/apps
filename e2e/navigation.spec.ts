import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
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

  test('should have app links', async ({ page }) => {
    await page.goto('/');
    const links = page.locator('a[href]');
    const count = await links.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should show widget section', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.widget, .status-bar').first()).toBeVisible();
  });

  test('should have viewport for pages', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#viewport, .pages-track').first()).toBeAttached();
  });
});
