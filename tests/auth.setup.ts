import { test as setup, expect } from '@playwright/test';
import path from 'node:path';

const authenticationFile = path.resolve('playwright/.authentication/user.json');

setup('test', async ({ page }) => {
	await page.goto('/login');

	await page.fill('input[name="email"]', 'gerome@test.com');
	await page.fill('input[name="password"]', 'password');
	await page.getByRole('button', { name: 'Sign in' }).click();
	await expect(page).toHaveURL('/shelf');
	await expect(page.getByRole('heading', { name: "Gerome's shelf" })).toBeVisible();

	await page.context().storageState({ path: authenticationFile });
});
