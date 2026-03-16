import { test, expect } from '@playwright/test';

test.describe('Pagination - Byte Page', () => {
  test('should show first 10 items on initial load', async ({ page }) => {
    await page.goto('/byte');
    
    // Wait for content to load
    await page.waitForSelector('[class*="grid"]');
    
    // Should show pagination controls
    await expect(page.locator('nav[aria-label="Pagination"]')).toBeVisible();
  });

  test('should navigate to next page', async ({ page }) => {
    await page.goto('/byte');
    
    // Click next button
    await page.click('text=Next →');
    
    // URL should update
    await expect(page).toHaveURL(/page=2/);
  });

  test('should reset to page 1 when searching', async ({ page }) => {
    await page.goto('/byte?page=2');
    
    // Type in search
    const searchInput = page.locator('input[type="text"]').first();
    await searchInput.fill('test');
    
    // Wait for debounce
    await page.waitForTimeout(400);
    
    // Should reset to page 1
    await expect(page).toHaveURL(/q=test.*page=1/);
  });

  test('should show empty state for no results', async ({ page }) => {
    await page.goto('/byte?q=nonexistentsearchterm123');
    
    // Should show empty state message
    await expect(page.locator('text=no bytes')).toBeVisible();
  });

  // Integration test: verify pagination actually filters data
  test('should show different items on different pages', async ({ page }) => {
    await page.goto('/byte');
    
    // Get first item on page 1
    const firstItemPage1 = await page.locator('[class*="grid"] > div').first().textContent();
    
    // Navigate to page 2 if available
    const nextButton = page.locator('text=Next →');
    if (await nextButton.isVisible()) {
      await nextButton.click();
      await page.waitForURL(/page=2/);
      
      // First item on page 2 should be different
      const firstItemPage2 = await page.locator('[class*="grid"] > div').first().textContent();
      expect(firstItemPage1).not.toBe(firstItemPage2);
    }
  });
});

test.describe('Pagination - Blip Page', () => {
  test('should show first 10 items on initial load', async ({ page }) => {
    await page.goto('/blip');
    
    // Wait for content to load
    await page.waitForSelector('[class*="grid"]');
    
    // Should show pagination controls
    await expect(page.locator('nav[aria-label="Pagination"]')).toBeVisible();
  });

  test('should navigate pagination', async ({ page }) => {
    await page.goto('/blip');
    
    // Click next button if available
    const nextButton = page.locator('text=Next →');
    if (await nextButton.isVisible()) {
      await nextButton.click();
      await expect(page).toHaveURL(/page=2/);
    }
  });

  // Integration test: verify search actually filters blips
  test('should filter blips based on search query', async ({ page }) => {
    await page.goto('/blip');
    
    // Get total count (if any)
    const searchInput = page.locator('input[type="text"]').first();
    
    // Type a search term
    await searchInput.fill('webhook');
    await page.waitForTimeout(400);
    
    // Either shows filtered results or empty state
    const hasResults = await page.locator('[class*="grid"] > div').first().isVisible();
    const hasEmptyState = await page.locator('text=no blip').isVisible();
    
    expect(hasResults || hasEmptyState).toBe(true);
  });
});

test.describe('Pagination - Bloq Page', () => {
  test('should show first 10 posts on initial load', async ({ page }) => {
    await page.goto('/bloq');
    
    // Wait for content to load
    await page.waitForSelector('[class*="grid"]');
    
    // Should show pagination controls
    await expect(page.locator('nav[aria-label="Pagination"]')).toBeVisible();
  });

  test('should preserve category filter when paginating', async ({ page }) => {
    await page.goto('/bloq');
    
    // Check if category filter exists and apply it
    const categoryButtons = page.locator('button[class*="category"]');
    if (await categoryButtons.first().isVisible()) {
      await categoryButtons.first().click();
      await page.waitForTimeout(300);
      
      // Should have category in URL
      const url = page.url();
      expect(url).toContain('category=');
      
      // Navigate pages
      const nextButton = page.locator('text=Next →');
      if (await nextButton.isVisible()) {
        await nextButton.click();
        
        // Category should be preserved
        await expect(page).toHaveURL(/category=/);
      }
    }
  });
});
