import { expect, test } from '@playwright/test';
import { createGroup } from './e2e-helpers';

test('split a receipt by who had what, with the tip in proportion (#53)', async ({ page }) => {
	const groupUrl = await createGroup(page, 'Dinner club', 'Anna', ['Ben', 'Cara']);
	await page.getByRole('link', { name: 'Add expense' }).click();
	await page.getByLabel('What was it for?').fill('Restaurant');
	await page.getByLabel('Amount (€)').fill('33');
	await page.getByLabel('Split', { exact: true }).selectOption({ label: 'By item' });

	await page.getByLabel('Item 1', { exact: true }).fill('Steak');
	await page.getByLabel('Price of item 1').fill('20');
	const first = page.getByRole('group', { name: 'Who had item 1' });
	await first.getByRole('button', { name: 'Ben' }).click();
	await first.getByRole('button', { name: 'Cara' }).click();

	await page.getByRole('button', { name: 'Add an item' }).click();
	await page.getByLabel('Item 2', { exact: true }).fill('Wine');
	await page.getByLabel('Price of item 2').fill('10');

	const summary = page.getByTestId('item-summary');
	await expect(summary).toContainText('€3.00 left');
	await expect(summary.getByText('Anna').locator('..')).toContainText('€25.68');

	await page.getByRole('button', { name: 'Add expense' }).click();
	await expect(page).toHaveURL(groupUrl);
	await expect(page.getByRole('link', { name: /Restaurant/ })).toContainText('you lent €7.32');

	// Edited the same way
	await page.getByRole('link', { name: /Restaurant/ }).click();
	await expect(page.getByLabel('Split', { exact: true })).toHaveValue('items');
	await expect(page.getByLabel('Item 2', { exact: true })).toHaveValue('Wine');
	await expect(page.getByLabel('Price of item 1')).toHaveValue('20.00');
	await expect(
		page.getByRole('group', { name: 'Who had item 1' }).getByRole('button', { name: 'Ben' })
	).toHaveAttribute('aria-pressed', 'false');

	// Over the amount: said right away, and refused
	await page.getByLabel('Price of item 1').fill('40');
	await expect(page.getByTestId('item-summary')).toContainText('more than the amount');
	await page.getByRole('button', { name: 'Save' }).click();
	await expect(page.getByRole('alert')).toContainText('more than the amount');
});
