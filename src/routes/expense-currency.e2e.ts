import { expect, test } from '@playwright/test';
import { createGroup } from './e2e-helpers';

test('an expense in another currency, converted at a rate (#54)', async ({ page }) => {
	const groupUrl = await createGroup(page, 'Japan', 'Anna', ['Ben']);
	await page.getByRole('link', { name: 'Add expense' }).click();
	await page.getByLabel('What was it for?').fill('Ramen');
	await page.getByLabel('Currency').selectOption('JPY');
	await page.getByLabel('Amount (JPY)').fill('3000');
	// Typed by hand (the day's rate may come first; typing wins)
	await page.getByLabel('1 JPY in EUR').fill('0.0056389');
	await expect(page.getByTestId('converted')).toContainText('€16.92');

	// Where the rate comes from, for whoever looks
	await page.getByRole('button', { name: 'Where the rate comes from' }).click();
	await expect(page.getByText(/European Central Bank/)).toBeVisible();

	await page.getByRole('button', { name: 'Add expense' }).click();
	await expect(page).toHaveURL(groupUrl);
	await expect(page.getByRole('link', { name: /Ramen/ })).toContainText(
		'Anna paid ¥3,000 (€16.92)'
	);

	// Edited: as typed, with its rate
	await page.getByRole('link', { name: /Ramen/ }).click();
	await expect(page.getByLabel('Currency')).toHaveValue('JPY');
	await expect(page.getByLabel('Amount (JPY)')).toHaveValue('3000');
	await expect(page.getByLabel('1 JPY in EUR')).toHaveValue('0.0056389');
});
