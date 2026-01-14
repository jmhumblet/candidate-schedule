import { test, expect } from '@playwright/test';

test.describe('Email Templates Integration', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should allow editing email templates', async ({ page }) => {
    // Open Sidebar
    // The hamburger button is usually the first light button in the header
    await page.locator('.btn-light').first().click();

    // Open Editor
    const templatesButton = page.getByRole('button', { name: "Modèles d'emails" });
    await expect(templatesButton).toBeVisible();
    await templatesButton.click();

    // Check modal
    const modal = page.locator('.modal-content');
    await expect(modal).toBeVisible();
    const modalTitle = modal.locator('.modal-title');
    await expect(modalTitle).toHaveText("Modèles d'emails");

    // Edit Candidate Subject
    const subjectInput = page.locator('input[type="text"]').first(); // Subject input of the active tab
    await subjectInput.fill('Sujet Test Integration');

    // Save
    await page.getByRole('button', { name: 'Sauvegarder' }).click();
    await expect(modal).toBeHidden();

    // Re-open to check persistence
    await page.locator('.btn-light').first().click();
    await templatesButton.click();

    await expect(subjectInput).toHaveValue('Sujet Test Integration');
  });

  test('should display email buttons in schedule', async ({ page }) => {
    // Generate Schedule
    const candidatesInput = page.getByLabel('Nombre de candidats');
    await candidatesInput.fill('1');
    const generateButton = page.getByRole('button', { name: /Générer/i });
    await generateButton.click();

    // Check Jury Email Button
    await expect(page.getByRole('button', { name: 'Email Jury' })).toBeVisible();

    // Check Welcome Email Button
    await expect(page.getByRole('button', { name: 'Email Accueil' })).toBeVisible();

    // Check Candidate Email Button
    // In the table row.
    const candidateEmailButton = page.locator('table#result button[title="Envoyer email au candidat"]').first();
    await expect(candidateEmailButton).toBeVisible();
  });
});
