import { expect, test } from '@playwright/test';
import { open } from './e2e-helpers';

test('the app speaks the browser language, until you pick another one', async ({ browser }) => {
	const context = await browser.newContext({ locale: 'de-DE' });
	const page = await context.newPage();
	await open(page, '/');
	await expect(page.locator('html')).toHaveAttribute('lang', 'de');
	await expect(page.getByRole('link', { name: 'Neue Gruppe' })).toBeVisible();

	await page.getByRole('button', { name: 'English' }).click();
	await expect(page.getByRole('link', { name: 'New group' })).toBeVisible();
	// Remembered on this device
	await open(page, '/');
	await expect(page.getByRole('button', { name: 'English' })).toHaveAttribute(
		'aria-pressed',
		'true'
	);
	await context.close();
});

test('other browser languages fall back to English', async ({ browser }) => {
	const context = await browser.newContext({ locale: 'fr-FR' });
	const page = await context.newPage();
	await open(page, '/');
	await expect(page.locator('html')).toHaveAttribute('lang', 'en');
	await context.close();
});
