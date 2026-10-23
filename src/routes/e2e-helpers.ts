// Shared steps for the end-to-end tests.
import { expect, type Locator, type Page } from '@playwright/test';

/** The preview's access password (package.json, "preview") */
export const ACCESS_PASSWORD = 'letmein';

/** Enters the shared password on the private app's door (#109). */
export async function enterPassword(page: Page, password = ACCESS_PASSWORD) {
	// By role, not text: the page may be in any language
	await page.locator('input[name="password"]').fill(password);
	await page.locator('form button[type="submit"]').click();
	await page.waitForLoadState('networkidle');
}

/** Reads the friendly note (#112) if it's shown; by role, not text, for any language. */
export async function acceptNote(page: Page) {
	const note = page.locator('form[action="/note"]');
	if ((await note.count()) === 0) return;
	await note.locator('button[type="submit"]').click();
	await expect(note).toHaveCount(0);
	await page.waitForLoadState('networkidle');
}

/**
 * Opens a page and waits until it's interactive (hydrated), like a user would. A new device
 * meets the password page first and gets in, like a friend who knows the password, and
 * reads the friendly note.
 */
export async function open(page: Page, url: string) {
	await page.goto(url);
	await page.waitForLoadState('networkidle');
	if (new URL(page.url()).pathname === '/welcome') {
		await enterPassword(page);
		await page.waitForURL((current) => current.pathname !== '/welcome');
	}
	await acceptNote(page);
}

/** Picks an option in a tile picker by tapping its tile, like a user would. */
export async function choose(scope: Page | Locator, picker: string, option: string) {
	await scope.getByRole('group', { name: picker }).getByText(option, { exact: true }).click();
	await expect(scope.getByRole('radio', { name: option, exact: true })).toBeChecked();
}

/** Creates a group as `you` with the other members, and waits on its page. Returns its URL. */
export async function createGroup(page: Page, name: string, you: string, others: string[]) {
	await open(page, '/new');
	await page.getByLabel('Group name').fill(name);
	await page.getByLabel('Currency').selectOption('EUR');
	await page.getByLabel('Your name').fill(you);
	for (const other of others) {
		await page.getByLabel('Add a person').fill(other);
		await page.getByLabel('Add a person').press('Enter');
	}
	await page.getByRole('button', { name: 'Create group' }).click();
	await expect(page.getByTestId('identity')).toHaveText(you);
	return page.url();
}
