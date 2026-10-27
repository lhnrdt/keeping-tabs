import { expect, test } from '@playwright/test';
import { createGroup } from './e2e-helpers';

test('search the expenses by title or note (#68)', async ({ page }) => {
	await createGroup(page, 'Flat', 'Anna', ['Ben']);
	for (const title of ['Pizza', 'Groceries', 'Pizza night']) {
		await page.getByRole('link', { name: 'Add expense' }).click();
		await page.getByLabel('What was it for?').fill(title);
		await page.getByLabel('Amount (€)').fill('10');
		await page.getByRole('button', { name: 'Add expense' }).click();
		await expect(page.getByRole('link', { name: new RegExp(title) }).first()).toBeVisible();
	}
	const list = page.getByRole('region', { name: 'Expenses' }).getByRole('link');
	const search = page.getByRole('searchbox', { name: 'Search expenses' });

	await search.fill('pizza');
	await expect(page).toHaveURL(/q=pizza/);
	await expect(list).toHaveCount(2);
	// Typing goes on in the field
	await expect(search).toBeFocused();

	await search.fill('sushi');
	await expect(page.getByText('No expenses match “sushi”.')).toBeVisible();

	await search.fill('');
	await expect(list).toHaveCount(3);
});
