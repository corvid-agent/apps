import { test, expect } from '@playwright/test';

test.describe('App — basic loading', () => {
  test.beforeEach(async ({ page }) => {
    // Stub every external API so tests never depend on the network
    await page.route('**/api.github.com/**', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ public_repos: 33 }),
      }),
    );
    await page.route('**/api.open-meteo.com/**', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ current_weather: { temperature: 22 } }),
      }),
    );
    await page.route('**/earthquake.usgs.gov/**', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ metadata: { count: 5 }, features: [] }),
      }),
    );
    await page.route('**/api.wheretheiss.at/**', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ visibility: 'daylight', latitude: 45, longitude: -73, altitude: 408, velocity: 27600 }),
      }),
    );
    await page.goto('/');
  });

  test('page title contains "apps"', async ({ page }) => {
    await expect(page).toHaveTitle(/apps/i);
  });

  test('header renders with corvid-agent heading', async ({ page }) => {
    const heading = page.locator('.header h1');
    await expect(heading).toHaveText('corvid-agent');
  });

  test('phone mockup is visible', async ({ page }) => {
    const phone = page.locator('.phone');
    await expect(phone).toBeVisible();
  });

  test('screen is rendered inside the phone', async ({ page }) => {
    const screen = page.locator('.phone .screen');
    await expect(screen).toBeVisible();
  });

  test('clock is displayed in the status bar', async ({ page }) => {
    const clock = page.locator('#clock');
    await expect(clock).toBeVisible();
    // Clock text should match HH:MM pattern
    await expect(clock).toHaveText(/^\d{2}:\d{2}$/);
  });

  test('widget date is displayed', async ({ page }) => {
    const widgetDate = page.locator('#widget-date');
    await expect(widgetDate).toBeVisible();
    // Should contain a day name and month abbreviation
    await expect(widgetDate).toHaveText(/\w+day, \w+ \d+/);
  });

  test('widget stats show repo counts', async ({ page }) => {
    const appsCount = page.locator('#w-repos');
    const reposCount = page.locator('#w-repos-total');
    // Wait for the GitHub fetch stub to populate values
    await expect(appsCount).not.toHaveText('--', { timeout: 5000 });
    await expect(reposCount).not.toHaveText('--', { timeout: 5000 });
  });

  test('dock is visible with 4 apps', async ({ page }) => {
    const dock = page.locator('.dock');
    await expect(dock).toBeVisible();
    const dockApps = dock.locator('.app');
    await expect(dockApps).toHaveCount(4);
  });

  test('dock contains Dashboard, Profile, Explorer, Chat', async ({ page }) => {
    const dockLabels = page.locator('.dock .app-label');
    await expect(dockLabels.nth(0)).toHaveText('Dashboard');
    await expect(dockLabels.nth(1)).toHaveText('Profile');
    await expect(dockLabels.nth(2)).toHaveText('Explorer');
    await expect(dockLabels.nth(3)).toHaveText('Chat');
  });

  test('home indicator bar is rendered', async ({ page }) => {
    const homeBar = page.locator('.home-indicator span');
    await expect(homeBar).toBeVisible();
  });

  test('page dots container shows 3 dots', async ({ page }) => {
    const dots = page.locator('#dots span');
    await expect(dots).toHaveCount(3);
  });

  test('first page dot is active on load', async ({ page }) => {
    const firstDot = page.locator('#dots span').nth(0);
    await expect(firstDot).toHaveClass(/active/);
  });
});
