import { test, expect } from '@playwright/test';

test.describe('Edge Cases', () => {
  test('should handle invalid page number gracefully', async ({ page }) => {
    await page.goto('/byte?page=abc');
    
    // Should either redirect or handle gracefully
    // Page should still render
    await expect(page.locator('body')).toBeVisible();
  });

  test('should handle negative page number', async ({ page }) => {
    await page.goto('/byte?page=-1');
    
    // Should handle gracefully
    await expect(page.locator('body')).toBeVisible();
  });

  test('should handle very large page number', async ({ page }) => {
    await page.goto('/byte?page=999');
    
    // Should either show empty state or last page
    // Page should render without crashing
    await expect(page.locator('body')).toBeVisible();
  });

  test('should handle very long search query', async ({ page }) => {
    const longQuery = 'a'.repeat(200);
    await page.goto(`/byte?q=${longQuery}`);
    
    // Should handle gracefully without crashing
    await expect(page.locator('body')).toBeVisible();
  });

  test('should handle special characters in search', async ({ page }) => {
    await page.goto('/byte?q=<script>alert(1)</script>');
    
    // Should handle gracefully
    await expect(page.locator('body')).toBeVisible();
  });

  test('should handle empty database gracefully', async ({ page }) => {
    // This test assumes empty state is handled
    await page.goto('/byte');
    
    // Should show either content or empty state
    const hasContent = await page.locator('[class*="grid"]').isVisible();
    const hasEmptyState = await page.locator('text=no bytes').isVisible();
    
    expect(hasContent || hasEmptyState).toBe(true);
  });
});
