import { test, expect } from '@playwright/test';

test.use({
	serviceWorkers: 'block',
	storageState: './playwright/.authentication/user.json'
});

test('test', async ({ page }) => {
	await page.routeFromHAR('../playwright/recordings/openLibrary.har', {
		url: '**/openlibrary.org/**'
		//update: true
	});
	await page.goto('/search');
	await page.getByRole('textbox', { name: 'Search by title, author, or' }).fill('hemingway');
	await page.getByRole('textbox', { name: 'Search by title, author, or' }).press('Enter');
	await page.getByRole('button', { name: 'Search' }).click();
	await page.getByRole('heading', { name: 'The Sun Also Rises' }).isVisible();
	await expect(page.getByRole('heading', { name: 'The Sun Also Rises' })).toBeVisible();

	await expect(page).toHaveScreenshot('search-page.png');
});
