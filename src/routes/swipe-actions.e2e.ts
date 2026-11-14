import { expect, test, type Locator, type Page } from '@playwright/test';
import { createGroup } from './e2e-helpers';

async function addExpense(page: Page, title: string, amount: string) {
	await page.getByRole('link', { name: 'Add expense' }).click();
	await page.getByLabel('What was it for?').fill(title);
	await page.getByLabel('Amount (€)').fill(amount);
	await page.getByRole('button', { name: 'Add expense' }).click();
	await expect(page.getByRole('link', { name: new RegExp(title) })).toBeVisible();
}

/** As a finger would: the row scrolls sideways and snaps open */
const swipeOpen = (row: Locator) =>
	row.locator('.swipe-track').evaluate((track) => track.scrollTo({ left: track.scrollWidth }));

test('swipe an entry for its quick actions (#323)', async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await createGroup(page, 'Flat', 'Anna', ['Ben']);
	await addExpense(page, 'Pizza', '20');
	await addExpense(page, 'Bread', '4');
	const pizza = page.locator('[data-entry]').filter({ hasText: 'Pizza' });
	const bread = page.locator('[data-entry]').filter({ hasText: 'Bread' });

	// Open, a tap on the row shuts it again instead of opening the expense
	await swipeOpen(bread);
	await expect(bread.getByTitle('Edit expense')).toBeInViewport();
	await bread.getByRole('link', { name: /Bread/ }).click();
	await expect(bread.getByTitle('Edit expense')).not.toBeInViewport();
	await expect(page).toHaveURL(/\/g\/[^/]+$/);

	// The same actions as pressing and holding: delete, right there
	await swipeOpen(pizza);
	await pizza.getByTitle('Delete expense').click();
	await expect(pizza).toHaveCount(0);

	await swipeOpen(bread);
	await bread.getByTitle('Edit expense').click();
	await expect(page.getByLabel('What was it for?')).toHaveValue('Bread');
});
