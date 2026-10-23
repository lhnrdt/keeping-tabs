import { expect, test } from '@playwright/test';
import { open } from './e2e-helpers';

test('the app speaks the browser language, until you pick another one', async ({ browser }) => {
	const context = await browser.newContext({ locale: 'de-DE' });
	const page = await context.newPage();
	await open(page, '/');
	await expect(page.locator('html')).toHaveAttribute('lang', 'de');
	await expect(page.getByRole('link', { name: 'Neue Gruppe' })).toBeVisible();

	// Choosing a language in the settings wins over the browser's, and is remembered
	await open(page, '/settings');
	await page.getByRole('group', { name: 'Sprache' }).getByText('English').click();
	await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();
	await open(page, '/');
	await expect(page.getByRole('link', { name: 'New group' })).toBeVisible();
	await context.close();
});

test('other browser languages fall back to English', async ({ browser }) => {
	const context = await browser.newContext({ locale: 'fr-FR' });
	const page = await context.newPage();
	await open(page, '/');
	await expect(page.locator('html')).toHaveAttribute('lang', 'en');
	await context.close();
});
