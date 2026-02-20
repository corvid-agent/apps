import { test, expect } from '@playwright/test';

test.describe('Navigation — pages and dots', () => {
  test.beforeEach(async ({ page }) => {
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

  // ---- Dot navigation ----

  test('clicking dot 2 navigates to page 2 (mac apps)', async ({ page }) => {
    const dot2 = page.locator('#dots span[data-page="1"]');
    await dot2.click();

    // Dot 2 becomes active, dot 1 loses active
    await expect(dot2).toHaveClass(/active/);
    await expect(page.locator('#dots span[data-page="0"]')).not.toHaveClass(/active/);

    // Track should be translated to show page 2
    const track = page.locator('#track');
    await expect(track).toHaveCSS('transform', /matrix/);
  });

  test('clicking dot 3 navigates to page 3 (infrastructure)', async ({ page }) => {
    const dot3 = page.locator('#dots span[data-page="2"]');
    await dot3.click();

    await expect(dot3).toHaveClass(/active/);
    await expect(page.locator('#dots span[data-page="0"]')).not.toHaveClass(/active/);
    await expect(page.locator('#dots span[data-page="1"]')).not.toHaveClass(/active/);
  });

  test('clicking dot 1 returns to page 1 after navigating away', async ({ page }) => {
    // Navigate to page 3
    await page.locator('#dots span[data-page="2"]').click();
    // Then back to page 1
    const dot1 = page.locator('#dots span[data-page="0"]');
    await dot1.click();

    await expect(dot1).toHaveClass(/active/);
    await expect(page.locator('#dots span[data-page="2"]')).not.toHaveClass(/active/);
  });

  // ---- Swipe (mouse drag) navigation ----

  test('swipe left navigates from page 1 to page 2', async ({ page }) => {
    const viewport = page.locator('#viewport');
    const box = await viewport.boundingBox();
    if (!box) throw new Error('viewport not found');

    const startX = box.x + box.width * 0.8;
    const endX = box.x + box.width * 0.2;
    const y = box.y + box.height / 2;

    await page.mouse.move(startX, y);
    await page.mouse.down();
    await page.mouse.move(endX, y, { steps: 10 });
    await page.mouse.up();

    // Dot 2 should now be active
    await expect(page.locator('#dots span[data-page="1"]')).toHaveClass(/active/);
    await expect(page.locator('#dots span[data-page="0"]')).not.toHaveClass(/active/);
  });

  test('swipe right on page 1 stays on page 1 (no underflow)', async ({ page }) => {
    const viewport = page.locator('#viewport');
    const box = await viewport.boundingBox();
    if (!box) throw new Error('viewport not found');

    const startX = box.x + box.width * 0.2;
    const endX = box.x + box.width * 0.8;
    const y = box.y + box.height / 2;

    await page.mouse.move(startX, y);
    await page.mouse.down();
    await page.mouse.move(endX, y, { steps: 10 });
    await page.mouse.up();

    // Should remain on page 1
    await expect(page.locator('#dots span[data-page="0"]')).toHaveClass(/active/);
  });

  test('double swipe left reaches page 3', async ({ page }) => {
    const viewport = page.locator('#viewport');
    const box = await viewport.boundingBox();
    if (!box) throw new Error('viewport not found');

    const y = box.y + box.height / 2;

    // Swipe 1: page 1 -> page 2
    await page.mouse.move(box.x + box.width * 0.8, y);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * 0.2, y, { steps: 10 });
    await page.mouse.up();
    // small pause for the CSS transition
    await page.waitForTimeout(400);

    // Swipe 2: page 2 -> page 3
    await page.mouse.move(box.x + box.width * 0.8, y);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * 0.2, y, { steps: 10 });
    await page.mouse.up();

    await expect(page.locator('#dots span[data-page="2"]')).toHaveClass(/active/);
  });

  // ---- Page 1: web app icons ----

  test('page 1 has 17 web app icons in the grid', async ({ page }) => {
    const gridApps = page.locator('.page').nth(0).locator('.app-grid .app');
    await expect(gridApps).toHaveCount(17);
  });

  test('page 1 contains Weather, Cinema, Space, Gallery apps', async ({ page }) => {
    const firstPage = page.locator('.page').nth(0);
    await expect(firstPage.locator('.app-label', { hasText: 'Weather' })).toBeVisible();
    await expect(firstPage.locator('.app-label', { hasText: 'Cinema' })).toBeVisible();
    await expect(firstPage.locator('.app-label', { hasText: 'Space' })).toBeVisible();
    await expect(firstPage.locator('.app-label', { hasText: 'Gallery' })).toBeVisible();
  });

  test('page 1 app links point to github.io', async ({ page }) => {
    const appLinks = page.locator('.page').nth(0).locator('.app-grid a.app');
    const count = await appLinks.count();
    for (let i = 0; i < count; i++) {
      const href = await appLinks.nth(i).getAttribute('href');
      expect(href).toContain('corvid-agent.github.io');
    }
  });

  // ---- Page 2: mac apps ----

  test('page 2 header says "mac apps"', async ({ page }) => {
    const header = page.locator('.page').nth(1).locator('.page-2-header');
    await expect(header).toHaveText('mac apps');
  });

  test('page 2 has 9 mac app link items', async ({ page }) => {
    const items = page.locator('.page').nth(1).locator('.link-item');
    await expect(items).toHaveCount(9);
  });

  test('page 2 contains Beacon, Clip, DevKit, Netwatch', async ({ page }) => {
    const secondPage = page.locator('.page').nth(1);
    await expect(secondPage.locator('.link-name', { hasText: 'Beacon' })).toBeAttached();
    await expect(secondPage.locator('.link-name', { hasText: 'Clip' })).toBeAttached();
    await expect(secondPage.locator('.link-name', { hasText: 'DevKit' })).toBeAttached();
    await expect(secondPage.locator('.link-name', { hasText: 'Netwatch' })).toBeAttached();
  });

  // ---- Page 3: infrastructure ----

  test('page 3 header says "infrastructure"', async ({ page }) => {
    const header = page.locator('.page').nth(2).locator('.page-2-header');
    await expect(header).toHaveText('infrastructure');
  });

  test('page 3 has 6 infrastructure link items', async ({ page }) => {
    const items = page.locator('.page').nth(2).locator('.link-item');
    await expect(items).toHaveCount(6);
  });

  test('page 3 contains Landing Page, Agent Core, Discord', async ({ page }) => {
    const thirdPage = page.locator('.page').nth(2);
    await expect(thirdPage.locator('.link-name', { hasText: 'Landing Page' })).toBeAttached();
    await expect(thirdPage.locator('.link-name', { hasText: 'Agent Core' })).toBeAttached();
    await expect(thirdPage.locator('.link-name', { hasText: 'Discord' })).toBeAttached();
  });

  // ---- Page indicator updates correctly across all transitions ----

  test('only one dot is active at a time after sequential clicks', async ({ page }) => {
    const dots = page.locator('#dots span');

    for (let target = 0; target < 3; target++) {
      await dots.nth(target).click();
      for (let j = 0; j < 3; j++) {
        if (j === target) {
          await expect(dots.nth(j)).toHaveClass(/active/);
        } else {
          await expect(dots.nth(j)).not.toHaveClass(/active/);
        }
      }
    }
  });
});
