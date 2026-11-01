import { expect, test } from '@playwright/test';
import { choose, createGroup, open } from './e2e-helpers';

test('a car group notes the odometer and fuel with its expenses and sums them up', async ({
	page
}) => {
	const groupUrl = await createGroup(page, 'Our car', 'Anna', ['Ben']);
	await open(page, `${groupUrl}?tab=group`);
	await page.getByRole('button', { name: 'Edit group' }).click();
	const dialog = page.getByRole('dialog', { name: 'Edit group' });
	await choose(dialog, 'Type', 'Car');
	await dialog.getByRole('button', { name: 'Save' }).click();
	await expect(dialog).toHaveCount(0);

	await open(page, `${groupUrl}/expenses/new`);
	await page.getByLabel('What was it for?').fill('Fuel');
	await page.getByLabel('Amount (€)').fill('70');
	await page.getByLabel('Odometer').fill('12000');
	await page.getByLabel('Fuel (litres)').fill('abc');
	await page.getByRole('button', { name: 'Add expense' }).click();
	await expect(page.getByRole('alert')).toContainText('litres');
	await page.getByLabel('Fuel (litres)').fill('40');
	await page.getByRole('button', { name: 'Add expense' }).click();
	await expect(page).toHaveURL(groupUrl);
	await expect(page.getByRole('link', { name: /Fuel/ })).toContainText('12,000 km · 40 l');

	// Edited: as noted
	await page.getByRole('link', { name: /Fuel/ }).click();
	await expect(page.getByLabel('Odometer')).toHaveValue('12000');
	await expect(page.getByLabel('Fuel (litres)')).toHaveValue('40');

	// One reading later, the km driven follow
	await open(page, `${groupUrl}/expenses/new`);
	await page.getByLabel('What was it for?').fill('More fuel');
	await page.getByLabel('Amount (€)').fill('80');
	await page.getByLabel('Odometer').fill('13000');
	await page.getByLabel('Fuel (litres)').fill('50');
	await page.getByRole('button', { name: 'Add expense' }).click();
	await expect(page).toHaveURL(groupUrl);

	await open(page, `${groupUrl}?tab=insights`);
	const driving = page.getByTestId('driving');
	await expect(driving).toContainText('13,000 km');
	await expect(driving).toContainText('1,000 km');
	await expect(driving).toContainText('€0.08');
	await expect(driving).toContainText('5 l');
	await expect(driving).toContainText('€1.67');

	// Both are optional: an expense without them goes through
	await open(page, `${groupUrl}/expenses/new`);
	await expect(page.getByLabel('Odometer')).toHaveAttribute('placeholder', 'Optional');
	await page.getByLabel('What was it for?').fill('Insurance');
	await page.getByLabel('Amount (€)').fill('300');
	await page.getByRole('button', { name: 'Add expense' }).click();
	await expect(page).toHaveURL(groupUrl);
	await expect(page.getByRole('link', { name: /Insurance/ })).not.toContainText('km');
});

test('other groups do not ask for the odometer or fuel', async ({ page }) => {
	const groupUrl = await createGroup(page, 'Flat', 'Anna', ['Ben']);
	await open(page, `${groupUrl}/expenses/new`);
	await expect(page.getByLabel('Odometer')).toHaveCount(0);
});
