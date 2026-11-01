import { expect, test } from '@playwright/test';
import { choose, createGroup, open } from './e2e-helpers';

test('a car group notes km and fuel with its expenses and sums them up', async ({ page }) => {
	const groupUrl = await createGroup(page, 'Our car', 'Anna', ['Ben']);
	await open(page, `${groupUrl}?tab=group`);
	await page.getByRole('button', { name: 'Edit group' }).click();
	const dialog = page.getByRole('dialog', { name: 'Edit group' });
	await choose(dialog, 'Type', 'Car');
	await dialog.getByRole('button', { name: 'Save' }).click();
	await expect(dialog).toHaveCount(0);

	await open(page, `${groupUrl}/expenses/new`);
	await page.getByLabel('What was it for?').fill('Fuel');
	await page.getByLabel('Amount (€)').fill('80');
	await page.getByLabel('Km driven').fill('1000');
	await page.getByLabel('Fuel (litres)').fill('abc');
	await page.getByRole('button', { name: 'Add expense' }).click();
	await expect(page.getByRole('alert')).toContainText('litres');
	await page.getByLabel('Fuel (litres)').fill('50');
	await page.getByRole('button', { name: 'Add expense' }).click();
	await expect(page).toHaveURL(groupUrl);
	await expect(page.getByRole('link', { name: /Fuel/ })).toContainText('1,000 km · 50 l');

	// Edited: as noted
	await page.getByRole('link', { name: /Fuel/ }).click();
	await expect(page.getByLabel('Km driven')).toHaveValue('1000');
	await expect(page.getByLabel('Fuel (litres)')).toHaveValue('50');

	await open(page, `${groupUrl}?tab=insights`);
	const driving = page.getByTestId('driving');
	await expect(driving).toContainText('1,000 km');
	await expect(driving).toContainText('€0.08');
	await expect(driving).toContainText('5 l');
	await expect(driving).toContainText('€1.60');

	// Both are optional: an expense without them goes through
	await open(page, `${groupUrl}/expenses/new`);
	await expect(page.getByLabel('Km driven')).toHaveAttribute('placeholder', 'Optional');
	await page.getByLabel('What was it for?').fill('Insurance');
	await page.getByLabel('Amount (€)').fill('300');
	await page.getByRole('button', { name: 'Add expense' }).click();
	await expect(page).toHaveURL(groupUrl);
	await expect(page.getByRole('link', { name: /Insurance/ })).not.toContainText('km');
});

test('other groups do not ask for km or fuel', async ({ page }) => {
	const groupUrl = await createGroup(page, 'Flat', 'Anna', ['Ben']);
	await open(page, `${groupUrl}/expenses/new`);
	await expect(page.getByLabel('Km driven')).toHaveCount(0);
});
