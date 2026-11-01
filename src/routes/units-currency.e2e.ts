import { expect, test } from '@playwright/test';
import { choose, createGroup, open } from './e2e-helpers';

test('everyone chooses their units and the currency amounts show in (#238)', async ({ page }) => {
	const groupUrl = await createGroup(page, 'Our car', 'Anna', ['Ben']);
	await open(page, `${groupUrl}?tab=group`);
	await page.getByRole('button', { name: 'Edit group' }).click();
	const dialog = page.getByRole('dialog', { name: 'Edit group' });
	await choose(dialog, 'Type', 'Car');
	await dialog.getByRole('button', { name: 'Save' }).click();
	await expect(dialog).toHaveCount(0);

	await open(page, '/you');
	await page.getByRole('group', { name: 'Units' }).getByText('Miles and gallons').click();
	await expect(page.getByText('Saved')).toBeVisible();
	await page.getByLabel('Show amounts in').selectOption('USD');
	await expect(page.getByLabel('Show amounts in')).toHaveValue('USD');
	await page.waitForLoadState('networkidle');

	await open(page, `${groupUrl}/expenses/new`);
	await page.getByLabel('What was it for?').fill('Fuel');
	await page.getByLabel('Amount (€)').fill('40');
	await page.getByLabel('Odometer').fill('100');
	await page.getByLabel('Fuel (gallons)').fill('10');
	await page.getByRole('button', { name: 'Add expense' }).click();
	await expect(page).toHaveURL(groupUrl);
	await expect(page.getByRole('link', { name: /Fuel/ })).toContainText('100 mi · 10 gal');

	// Amounts show in your currency at today's rate (1 EUR = 2 USD in tests), in place of the group's
	await expect(page.getByRole('link', { name: /Fuel/ })).toContainText('Anna paid $80.00');
	await expect(page.getByRole('banner').first()).toContainText('$40.00');
	await expect(page.getByRole('banner').first()).not.toContainText('€');

	// The balances too
	await page.goto(`${groupUrl}?tab=balances`);
	await expect(page.getByText('$40.00').first()).toBeVisible();

	await open(page, groupUrl);
	// Edited: in your units, unchanged
	await page.getByRole('link', { name: /Fuel/ }).click();
	await expect(page.getByLabel('Odometer')).toHaveValue('100');
	await expect(page.getByLabel('Fuel (gallons)')).toHaveValue('10');
	// You still enter in the group's currency
	await expect(page.getByLabel('Amount (€)')).toHaveValue('40.00');
});
