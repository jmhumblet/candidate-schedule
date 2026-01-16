import { test, expect } from '@playwright/test';

test.describe('Interview Scheduler Integration', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should generate schedule when form is submitted', async ({ page }) => {
    // Fill out the form
    // Note: Default values are already populated, so we can just click generate to test the happy path
    // But let's change the candidate count to ensure we are testing interactivity

    // Using accessible selectors
    const candidatesInput = page.getByLabel('Candidats');
    await candidatesInput.fill('3');

    // Click Generate
    const generateButton = page.getByRole('button', { name: /Générer/i });
    await generateButton.click();

    // Verify Schedule appears
    const scheduleTitle = page.getByText(/Horaire du/i);
    await expect(scheduleTitle).toBeVisible();

    // Verify table exists
    const table = page.locator('table#result');
    await expect(table).toBeVisible();

    // Verify we have rows for 3 candidates (plus headers, lunch, welcome, debrief etc)
    // The implementation creates rows for various slots.
    // Just checking visibility of candidate names "1", "2", "3" which are defaults when using count
    await expect(page.getByRole('cell', { name: '1', exact: true })).toBeVisible();
    await expect(page.getByRole('cell', { name: '2', exact: true })).toBeVisible();
    await expect(page.getByRole('cell', { name: '3', exact: true })).toBeVisible();
  });

  test('should persist theme preference across reloads', async ({ page }) => {
    // Wait for the theme attribute to be present (it's set in useEffect)
    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-bs-theme', /light|dark/);

    const initialTheme = await html.getAttribute('data-bs-theme');

    // Find the toggle button.
    // The text content is "Sombre" (if current is light) or "Clair" (if current is dark).
    const buttonName = initialTheme === 'light' ? /Sombre/i : /Clair/i;
    const toggleButton = page.getByRole('button', { name: buttonName });

    await toggleButton.click();

    // Wait for theme to change
    const expectedNewTheme = initialTheme === 'light' ? 'dark' : 'light';
    await expect(html).toHaveAttribute('data-bs-theme', expectedNewTheme);

    // Reload page
    await page.reload();

    // Check if theme persists
    await expect(html).toHaveAttribute('data-bs-theme', expectedNewTheme);
  });
});
