import { expect, test } from '@playwright/test';
import { open } from './e2e-helpers';

test('settings are saved and follow you to another device', async ({ browser }) => {
	test.setTimeout(60_000);
	const phone = await (await browser.newContext({ locale: 'en-US' })).newPage();
	await open(phone, '/settings');
	await phone.getByLabel('Your name').fill('Anna');
	await phone.getByRole('group', { name: 'Language' }).getByText('Deutsch').click();
	await phone.getByRole('group', { name: 'Appearance' }).getByText('Dark').click();
	await phone.getByRole('button', { name: 'Save' }).click();

	// A plain form post: the page is served again in German and dark
	await expect(phone.getByRole('heading', { name: 'Einstellungen' })).toBeVisible();
	await expect(phone.locator('html')).toHaveAttribute('lang', 'de');
	await expect(phone.locator('html')).toHaveClass(/dark/);
	await expect(phone.getByLabel('Dein Name')).toHaveValue('Anna');

	// A second device linked to Anna starts in German and dark as well
	await open(phone, '/device');
	await phone.getByRole('button', { name: 'Link erstellen' }).click();
	const link = (await phone.getByRole('listitem', { name: 'Einmal-Link' }).innerText()).trim();
	const laptop = await (await browser.newContext({ locale: 'en-US' })).newPage();
	await open(laptop, link);
	// Not linked yet, so still in its own (English) language
	await laptop.getByRole('button', { name: 'Use this device' }).click();
	await expect(laptop).toHaveURL(/\/$/);
	await open(laptop, '/settings');
	await expect(laptop.getByRole('heading', { name: 'Einstellungen' })).toBeVisible();
	await expect(laptop.locator('html')).toHaveClass(/dark/);
	await expect(laptop.getByLabel('Dein Name')).toHaveValue('Anna');
});

test('the footer language switch keeps you on the page', async ({ browser }) => {
	const page = await (await browser.newContext({ locale: 'en-US' })).newPage();
	await open(page, '/privacy');
	await page.getByRole('button', { name: 'Deutsch' }).click();
	await expect(page).toHaveURL(/\/privacy$/);
	await expect(page.getByRole('heading', { name: 'Datenschutz' })).toBeVisible();
	await expect(page.locator('html')).toHaveAttribute('lang', 'de');
});

test('a chosen light theme wins over a dark device', async ({ browser }) => {
	const page = await (await browser.newContext({ colorScheme: 'dark' })).newPage();
	await open(page, '/settings');
	await expect(page.locator('html')).toHaveClass(/dark/);
	await page.getByRole('group', { name: 'Appearance' }).getByText('Light').click();
	await page.getByRole('button', { name: 'Save' }).click();
	await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();
	await expect(page.locator('html')).not.toHaveClass(/dark/);
	await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#f4f1ea');
});
