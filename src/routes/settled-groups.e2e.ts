import { expect, test } from '@playwright/test';
import { createGroup, open } from './e2e-helpers';

/** Days from today as YYYY-MM-DD */
const daysAgo = (days: number) => {
	const date = new Date();
	date.setDate(date.getDate() - days);
	return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
};

test('groups settled and quiet for a month fold away on the start screen (#46)', async ({
	page
}) => {
	const groupUrl = await createGroup(page, 'Old trip', 'Anna', ['Ben']);
	await page.getByRole('link', { name: 'Add expense' }).click();
	await page.getByLabel('What was it for?').fill('Hütte');
	await page.getByLabel('Amount (€)').fill('100');
	await page.getByLabel('Date').fill(daysAgo(60));
	await page.getByRole('button', { name: 'Add expense' }).click();
	await expect(page).toHaveURL(groupUrl);

	// Still open: in view
	await open(page, '/');
	await expect(page.getByRole('link', { name: /Old trip/ })).toBeVisible();

	// Settled two months ago: folded away
	await open(page, `${groupUrl}?tab=balances`);
	await page.getByRole('region', { name: 'Settle up' }).getByRole('link').first().click();
	await page.getByLabel('Date').fill(daysAgo(59));
	await page.getByRole('button', { name: 'Record payment' }).click();
	await open(page, '/');
	await expect(page.getByRole('link', { name: /Old trip/ })).toBeHidden();
	await page.getByText('Settled groups (1)').click();
	await expect(page.getByRole('link', { name: /Old trip/ })).toBeVisible();
});
