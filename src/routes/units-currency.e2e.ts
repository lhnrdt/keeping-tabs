import { expect, test } from '@playwright/test';
import { choose, createGroup, open } from './e2e-helpers';

test('everyone chooses their units and a currency to also see amounts in (#238)', async ({
	page
}) => {
	await page.route('**/fx?*', (route) => route.fulfill({ json: { rate: '2' } }));
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
	await page.getByLabel('Also show amounts in').selectOption('USD');
	await expect(page.getByLabel('Also show amounts in')).toHaveValue('USD');
	await page.waitForLoadState('networkidle');

	await open(page, `${groupUrl}/expenses/new`);
	await page.getByLabel('What was it for?').fill('Fuel');
	await page.getByLabel('Amount (€)').fill('40');
	await page.getByLabel('Odometer').fill('100');
	await page.getByLabel('Fuel (gallons)').fill('10');
	await page.getByRole('button', { name: 'Add expense' }).click();
	await expect(page).toHaveURL(groupUrl);
	await expect(page.getByRole('link', { name: /Fuel/ })).toContainText('100 mi · 10 gal');

	// Your balance also in your currency, today's rate; the group's stays what counts
	await expect(page.getByRole('banner').getByTestId('approx')).toHaveText('≈ $40.00');

	// Edited: in your units, unchanged
	await page.getByRole('link', { name: /Fuel/ }).click();
	await expect(page.getByLabel('Odometer')).toHaveValue('100');
	await expect(page.getByLabel('Fuel (gallons)')).toHaveValue('10');
});
