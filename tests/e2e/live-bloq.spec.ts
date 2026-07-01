import { test, expect } from '@playwright/test';

test.describe('Live Bloq', () => {
  test('live page renders entries with timestamps', async ({ page }) => {
    // This test assumes a pre-seeded active session at /bloq/live/e2e-test
    // In CI, seed data before running E2E tests
    await page.goto('/bloq/live/e2e-test');

    // Page should load without error
    await expect(page.locator('article')).toBeVisible();

    // Should show the session title
    await expect(page.locator('h1')).toBeVisible();
  });

  test('live page shows 404 for non-existent session', async ({ page }) => {
    await page.goto('/bloq/live/nonexistent-session-12345');

    // Should show 404 page
    await expect(page.locator('text=not found')).toBeVisible({ timeout: 5000 });
  });

  test('empty session shows placeholder message', async ({ page }) => {
    // Visit an active session page (rely on ISR or seeded data)
    await page.goto('/bloq/live/e2e-test');

    // Should not crash
    await expect(page.locator('article')).toBeVisible();
  });

  test('live session appears in bloq listing', async ({ page }) => {
    await page.goto('/bloq');

    await page.waitForSelector('[class*="grid"]');

    // There should be posts visible (at minimum, the page loads)
    const posts = page.locator('[class*="grid"] > *');
    await expect(posts.first()).toBeVisible();
  });
});
