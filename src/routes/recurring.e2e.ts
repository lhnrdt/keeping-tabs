import { expect, test } from '@playwright/test';
import { createGroup, open, openFold } from './e2e-helpers';

/** The same day of the month, `months` ago, as YYYY-MM-DD (days 1–28 exist in every month) */
const monthsAgo = (months: number) => {
	const date = new Date();
	date.setDate(Math.min(date.getDate(), 28));
	date.setMonth(date.getMonth() - months);
	return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
};

test('an expense that repeats every month, caught up and stoppable (#45)', async ({ page }) => {
	const groupUrl = await createGroup(page, 'Flat', 'Anna', ['Ben']);
	await page.getByRole('link', { name: 'Add expense' }).click();
	await page.getByLabel('What was it for?').fill('Rent');
	await page.getByLabel('Amount (€)').fill('1000');
	await page.getByLabel('Date').fill(monthsAgo(2));
	await openFold(page, 'More details');
	await page.getByLabel('Repeats').selectOption({ label: 'Every month' });
	await page.getByRole('button', { name: 'Add expense' }).click();
	await expect(page).toHaveURL(groupUrl);

	// Started two months ago: that month, last month and this month
	await expect(page.getByRole('link', { name: /Rent/ })).toHaveCount(3);

	await open(page, `${groupUrl}?tab=group`);
	const repeating = page.getByRole('region', { name: 'Repeating expenses' });
	await expect(repeating).toContainText('Rent');
	await expect(repeating).toContainText('€1,000.00 · Every month · next on');
	await repeating.getByRole('button', { name: 'Stop' }).click();
	await expect(repeating).toHaveCount(0);

	// What it added stays
	await open(page, groupUrl);
	await expect(page.getByRole('link', { name: /Rent/ })).toHaveCount(3);
});
