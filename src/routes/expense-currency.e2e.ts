import { expect, test } from '@playwright/test';
import { createGroup } from './e2e-helpers';

test('an expense in another currency, converted at the day’s rate (#54)', async ({ page }) => {
	// The day's rate, without asking the real source
	await page.route('**/fx?*', (route) => route.fulfill({ json: { rate: '0.0056389' } }));
	const groupUrl = await createGroup(page, 'Japan', 'Anna', ['Ben']);
	await page.getByRole('link', { name: 'Add expense' }).click();
	await page.getByLabel('What was it for?').fill('Ramen');
	await page.getByLabel('Currency').selectOption('JPY');
	await page.getByLabel('Amount (¥)').fill('3000');
	// Looked up, not typed: only the result shows
	await expect(page.getByLabel(/1 JPY/)).toHaveCount(0);
	await expect(page.getByTestId('converted')).toContainText('€16.92');

	// Where the rate comes from, for whoever looks
	await page.getByRole('button', { name: 'Where the rate comes from' }).click();
	await expect(page.getByText(/European Central Bank/)).toBeVisible();

	await page.getByRole('button', { name: 'Add expense' }).click();
	await expect(page).toHaveURL(groupUrl);
	await expect(page.getByRole('link', { name: /Ramen/ })).toContainText(
		'Anna paid ¥3,000 (€16.92)'
	);

	// Edited: as typed, at the rate it was saved with
	await page.getByRole('link', { name: /Ramen/ }).click();
	await expect(page.getByLabel('Currency')).toHaveValue('JPY');
	await expect(page.getByLabel('Amount (¥)')).toHaveValue('3000');
	await expect(page.getByTestId('converted')).toContainText('€16.92');
});
