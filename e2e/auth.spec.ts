import { test, expect } from '@playwright/test';

test.describe('Authentication and Cloud Integration', () => {
    // Skip if credentials are not provided (e.g. in PRs from forks or local runs without env)
    test.skip(!process.env.TEST_EMAIL || !process.env.TEST_PASSWORD, 'Skipping auth tests because TEST_EMAIL or TEST_PASSWORD is not set');

    test('should login, create a synced session, and delete it', async ({ page }) => {
        const TEST_EMAIL = process.env.TEST_EMAIL!;
        const TEST_PASSWORD = process.env.TEST_PASSWORD!;
        const uniqueTitle = `Integration Test ${Date.now()}`;

        await page.goto('/');

        // 1. Login
        // Open Email Login Modal
        await page.getByRole('button', { name: 'Se connecter avec Email' }).click();

        // Fill credentials
        await page.getByLabel('Email', { exact: true }).fill(TEST_EMAIL);
        await page.getByLabel('Mot de passe', { exact: true }).fill(TEST_PASSWORD);

        // Submit
        await page.locator('.modal-content').getByRole('button', { name: 'Se connecter', exact: true }).click();

        // Verify login success (Sidebar footer shows email or user icon)
        // We look for the "Se déconnecter" button as proof of being logged in
        await expect(page.getByRole('button', { name: 'Se déconnecter' })).toBeVisible({ timeout: 10000 });

        // 2. Create a Session
        // Fill Job Title
        await page.getByLabel('Titre du poste').fill(uniqueTitle);

        // Click Generate (which triggers save)
        await page.getByRole('button', { name: 'Générer' }).click();

        // 3. Verify Session in Sidebar
        // The sidebar updates asynchronously as it syncs with Firestore
        const sessionItem = page.locator('.sidebar-item').filter({ hasText: uniqueTitle });
        await expect(sessionItem).toBeVisible({ timeout: 15000 });

        // Check for Cloud Icon (Synchronisé) to ensure it's saved to cloud
        // The icon has title="Synchronisé"
        // We look inside the sessionItem
        await expect(sessionItem.getByTitle('Synchronisé')).toBeVisible();

        // 4. Cleanup: Delete the Session
        // Locate the trash icon within the session item
        const deleteBtn = sessionItem.getByLabel('Supprimer');
        await deleteBtn.click();

        // 5. Verify Deletion
        await expect(sessionItem).not.toBeVisible({ timeout: 10000 });
    });
});
