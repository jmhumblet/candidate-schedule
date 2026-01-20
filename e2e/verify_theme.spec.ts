import { test, expect } from '@playwright/test';

test('Verify Sidebar and Theming', async ({ page }) => {
  await page.goto('http://localhost:3000');

  // Verify Sidebar Padding (8-point grid check)
  // We can't easily check computed style pixels in a simple script without evaluate,
  // but we can screenshot the sidebar to see the visual result.
  const sidebar = page.locator('.sidebar-container');
  await expect(sidebar).toBeVisible();

  // Verify Focus Ring
  // Click on the search input to trigger focus
  const searchInput = page.locator('.sidebar-search input');
  await searchInput.click();

  // Wait a bit for transition
  await page.waitForTimeout(500);

  // Take screenshot of the sidebar with focus
  await page.screenshot({ path: 'verification/sidebar_focus.png' });

  // Toggle Theme
  // Find the theme toggle button (moon/sun icon)
  // It has a title "Passer en mode sombre" or "Clair"
  const themeToggle = page.locator('button[title^="Passer en mode"]');
  await themeToggle.click();

  // Wait for theme change
  await page.waitForTimeout(500);

  // Take screenshot of dark mode
  await page.screenshot({ path: 'verification/dark_mode.png' });
});
