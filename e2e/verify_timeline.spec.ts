import { test, expect } from '@playwright/test';

test('Timeline Visualization View Modes', async ({ page }) => {
  await page.goto('/');

  // Generate a schedule
  await page.getByLabel('Poste').fill('Test Engineer');

  await page.getByRole('button', { name: 'Générer' }).click();

  // Wait for timeline to appear
  const timelineHeader = page.getByRole('heading', { name: 'Chronologie des candidats' });
  await expect(timelineHeader).toBeVisible();

  // Check initial state (Overview)
  await expect(page.getByRole('button', { name: "Vue d'ensemble" })).toHaveClass(/btn-primary/);

  // Verify segments exist (by class or title text check via locator)
  // Using simplified class checks
  await expect(page.locator('.segment-welcome').first()).toBeVisible(); // Accueil
  await expect(page.locator('.segment-neutral').first()).toBeVisible(); // Casus

  // Take screenshot Overview
  await page.screenshot({ path: 'verification/screenshot-overview.png', fullPage: true });

  // Switch to Jury View
  await page.getByRole('button', { name: 'Vue Jury' }).click();
  await expect(page.getByRole('button', { name: 'Vue Jury' })).toHaveClass(/btn-primary/);

  // Verify Welcome/Casus HIDDEN
  await expect(page.locator('.segment-welcome')).toHaveCount(0);
  await expect(page.locator('.segment-neutral')).toHaveCount(0);

  // Take screenshot Jury
  await page.screenshot({ path: 'verification/screenshot-jury.png', fullPage: true });

  // Switch to Greeter View
  await page.getByRole('button', { name: 'Vue Accueil' }).click();
  await expect(page.getByRole('button', { name: 'Vue Accueil' })).toHaveClass(/btn-primary/);

  // Verify Welcome Visible
  await expect(page.locator('.segment-welcome').first()).toBeVisible();

  // Verify Entretien HIDDEN (Entretien is segment-darkblue but so is Lunch. Use title)
  // Title format: "Label: Start - End"
  const firstEntretien = page.locator('.timeline-segment[title*="Entretien"]');
  await expect(firstEntretien).toHaveCount(0);

  // Take screenshot Greeter
  await page.screenshot({ path: 'verification/screenshot-greeter.png', fullPage: true });
});
