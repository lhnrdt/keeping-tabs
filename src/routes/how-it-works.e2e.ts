import { expect, test } from '@playwright/test';
import { open } from './e2e-helpers';

test('how it works is a tap away from the start screen and settings (#84)', async ({ page }) => {
	await open(page, '/');
	await page.getByRole('link', { name: 'How it works' }).click();
	await expect(page.getByRole('heading', { name: 'How it works' })).toBeVisible();
	await expect(page.getByText('No account')).toBeVisible();

	await open(page, '/you');
	await page.getByRole('link', { name: 'How it works' }).click();
	await expect(page).toHaveURL(/\/how-it-works$/);
});
