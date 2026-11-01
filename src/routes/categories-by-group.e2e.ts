import { expect, test } from '@playwright/test';
import { choose, createGroup, open } from './e2e-helpers';

test('the categories fit the kind of group, and the others are one tap away', async ({ page }) => {
	const groupUrl = await createGroup(page, 'Our car', 'Anna', ['Ben']);
	await open(page, `${groupUrl}?tab=group`);
	await page.getByRole('link', { name: 'Edit group' }).click();
	await choose(page, 'Type', 'Car');
	await page.getByRole('button', { name: 'Save' }).click();
	await expect(page).toHaveURL(/tab=group/);

	await open(page, `${groupUrl}/expenses/new`);
	const category = page.getByRole('group', { name: 'Category' });
	await expect(category.getByText('Parking', { exact: true })).toBeVisible();
	await expect(category.getByText('Groceries', { exact: true })).toHaveCount(0);

	// Guessed from the title
	await page.getByLabel('What was it for?').fill('Tanken');
	await expect(category.locator('label', { hasText: 'Auto' })).toContainText('Fuel');
	// One that doesn't fit the group still shows when it's the guess
	await page.getByLabel('What was it for?').fill('Lidl');
	await expect(category.locator('label', { hasText: 'Auto' })).toContainText('Groceries');
	await page.getByLabel('What was it for?').fill('Tanken');
	await expect(category.getByText('Groceries', { exact: true })).toHaveCount(0);

	await page.getByRole('button', { name: 'All categories' }).click();
	await choose(page, 'Category', 'Gifts');
	await page.getByLabel('Amount (€)').fill('20');
	await page.getByRole('button', { name: 'Add expense' }).click();
	await expect(page).toHaveURL(groupUrl);

	// Kept when edited
	await page.getByRole('link', { name: /Tanken/ }).click();
	await expect(page.getByRole('radio', { name: 'Gifts', exact: true })).toBeChecked();
});
