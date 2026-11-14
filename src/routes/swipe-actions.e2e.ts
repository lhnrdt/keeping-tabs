import { expect, test, type Locator, type Page } from '@playwright/test';
import { createGroup } from './e2e-helpers';

async function addExpense(page: Page, title: string, amount: string) {
	await page.getByRole('link', { name: 'Add expense' }).click();
	await page.getByLabel('What was it for?').fill(title);
	await page.getByLabel('Amount (€)').fill(amount);
	await page.getByRole('button', { name: 'Add expense' }).click();
	await expect(page.getByRole('link', { name: new RegExp(title) })).toBeVisible();
	// The list is drawn again once the new entry is in: swiping before that is undone
	await page.waitForLoadState('networkidle');
}

/** As a finger would: the row scrolls sideways and snaps open, until its action is there (the
 * list may still be redrawing after the last change, which shuts it again) */
const swipeOpen = (row: Locator, action: string) =>
	row
		.locator('.swipe-track')
		.evaluate((track) => track.scrollTo({ left: track.scrollWidth }))
		.then(() => expect(row.getByTitle(action)).toBeInViewport({ timeout: 1000 }));

/** Swiped open and the action tapped, again if the row was redrawn in between */
const swipeAndTap = (row: Locator, action: string) =>
	expect(async () => {
		await swipeOpen(row, action);
		// Tapped as soon as it's there: on slow machines the row may still be redrawn meanwhile
		await row.getByTitle(action).dispatchEvent('click', undefined, { timeout: 2000 });
	}).toPass({ timeout: 20_000 });

test('swipe an entry for its quick actions (#323)', async ({ page }) => {
	test.setTimeout(60_000);
	await page.setViewportSize({ width: 390, height: 844 });
	await createGroup(page, 'Flat', 'Anna', ['Ben']);
	await addExpense(page, 'Pizza', '20');
	await addExpense(page, 'Bread', '4');
	const pizza = page.locator('[data-entry]').filter({ hasText: 'Pizza' });
	const bread = page.locator('[data-entry]').filter({ hasText: 'Bread' });

	// Open, a tap on the row shuts it again instead of opening the expense
	await expect(() => swipeOpen(bread, 'Edit expense')).toPass({ timeout: 20_000 });
	await bread.getByRole('link', { name: /Bread/ }).click();
	await expect(bread.getByTitle('Edit expense')).not.toBeInViewport();
	await page.waitForLoadState('networkidle');
	await expect(page).toHaveURL(/\/g\/[^/]+$/);
	await expect(pizza).toBeVisible();

	// The same actions as pressing and holding: delete, right there
	await swipeAndTap(pizza, 'Delete expense');
	await expect(pizza).toHaveCount(0);

	await swipeAndTap(bread, 'Edit expense');
	await expect(page.getByLabel('What was it for?')).toHaveValue('Bread');
});
