import { expect, test } from '@playwright/test';
import { open } from './e2e-helpers';

test('settings are saved and follow you to another device', async ({ browser }) => {
	test.setTimeout(60_000);
	const phone = await (await browser.newContext({ locale: 'en-US' })).newPage();
	await open(phone, '/settings');
	// Everything saves as it changes: no Save button
	await phone.getByLabel('Your name').fill('Anna');
	await phone.getByLabel('Your name').press('Tab');
	await expect(phone.getByText('Saved').first()).toBeVisible();
	await phone.getByRole('group', { name: 'Appearance' }).getByText('Dark').click();
	// The theme switches right away, without reloading
	await expect(phone.locator('html')).toHaveClass(/dark/);
	await expect(phone.getByText('Saved').first()).toBeVisible();
	await phone.getByRole('group', { name: 'Language' }).getByText('Deutsch').click();

	// The page is served again in German
	await expect(phone.getByRole('heading', { name: 'Profil' })).toBeVisible();
	await expect(phone.locator('html')).toHaveAttribute('lang', 'de');
	await expect(phone.locator('html')).toHaveClass(/dark/);
	await expect(phone.getByLabel('Dein Name')).toHaveValue('Anna');

	// A second device linked to Anna starts in German and dark as well
	await open(phone, '/device');
	await phone.getByRole('button', { name: 'Link erstellen' }).click();
	const link = (await phone.getByRole('listitem', { name: 'One-Time-Link' }).innerText()).trim();
	const laptop = await (await browser.newContext({ locale: 'en-US' })).newPage();
	await open(laptop, link);
	// Not linked yet, so still in its own (English) language
	await laptop.getByRole('button', { name: 'Use this device' }).click();
	await expect(laptop).toHaveURL(/\/$/);
	await open(laptop, '/settings');
	await expect(laptop.getByRole('heading', { name: 'Profil' })).toBeVisible();
	await expect(laptop.locator('html')).toHaveClass(/dark/);
	await expect(laptop.getByLabel('Dein Name')).toHaveValue('Anna');
});

test('a chosen light theme wins over a dark device', async ({ browser }) => {
	const page = await (await browser.newContext({ colorScheme: 'dark' })).newPage();
	await open(page, '/settings');
	await expect(page.locator('html')).toHaveClass(/dark/);
	await page.getByRole('group', { name: 'Appearance' }).getByText('Light').click();
	await expect(page.locator('html')).not.toHaveClass(/dark/);
	// Still light after a reload
	await expect(page.getByText('Saved').first()).toBeVisible();
	await page.reload();
	await expect(page.locator('html')).not.toHaveClass(/dark/);
	await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#f4f1ea');
});

test('everything about you is in one place: profile, settings, devices (#146)', async ({
	page
}) => {
	await open(page, '/settings');
	await page.getByLabel('Your name').fill('Anna');
	await page.getByLabel('Your name').press('Tab');
	await expect(page.getByText('Saved').first()).toBeVisible();

	// The start screen has a way to you, at the top
	await open(page, '/');
	await page.getByRole('link', { name: 'Profile' }).click();
	await expect(page).toHaveURL(/\/you$/);
	await expect(page.getByRole('heading', { name: 'Profile' })).toBeVisible();
	await expect(page.getByText('Anna', { exact: true })).toBeVisible();
	await page.getByRole('link', { name: 'Devices & recovery' }).click();
	await expect(page).toHaveURL(/\/you\/devices$/);

	// Old addresses still arrive
	await open(page, '/device');
	await expect(page).toHaveURL(/\/you\/devices$/);
});

test('a color theme switches at once and is remembered (#60)', async ({ page }) => {
	await open(page, '/you');
	await page.getByRole('group', { name: 'Color' }).getByText('Fjord').click();
	await expect(page.locator('html')).toHaveAttribute('data-accent', 'fjord');
	await expect(page.getByText('Saved').first()).toBeVisible();

	// Buttons take the theme's color; after a reload too
	await open(page, '/');
	await expect(page.locator('html')).toHaveAttribute('data-accent', 'fjord');
	await expect(page.getByRole('link', { name: 'New group' })).toHaveCSS(
		'background-color',
		'rgb(61, 100, 112)'
	);

	// Back to the default: no attribute at all
	await open(page, '/you');
	await page.getByRole('group', { name: 'Color' }).getByText('Forest').click();
	await expect(page.locator('html')).not.toHaveAttribute('data-accent');
});
