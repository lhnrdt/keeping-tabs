// Shared steps for the end-to-end tests.
import { expect, type Locator, type Page } from '@playwright/test';

/** Opens a page and waits until it's interactive (hydrated), like a user would. */
export async function open(page: Page, url: string) {
	await page.goto(url);
	await page.waitForLoadState('networkidle');
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
