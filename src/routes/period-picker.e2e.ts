import { expect, test } from '@playwright/test';
import { createGroup, open } from './e2e-helpers';

test('tap the period to pick a day, month or year natively (#184)', async ({ page }) => {
	const groupUrl = await createGroup(page, 'Lofoten', 'Anna', ['Ben']);
	for (const [date, title] of [
		['2025-12-30', 'Fähre'],
		['2026-08-01', 'Hütte'],
		['2026-08-03', 'Fischsuppe']
	]) {
		await page.getByRole('link', { name: 'Add expense' }).click();
		await page.getByLabel('What was it for?').fill(title);
		await page.getByLabel('Amount (€)').fill('100');
		await page.getByLabel('Date').fill(date);
		await page.getByRole('button', { name: 'Add expense' }).click();
		await expect(page.getByRole('link', { name: new RegExp(title) })).toBeVisible();
	}
	const period = page.getByRole('navigation', { name: 'Period' });
	const spent = page.locator('dt', { hasText: 'Spent' }).locator('+ dd');

	// A year from the list of the group's years
	await open(page, `${groupUrl}?tab=insights&period=year&at=2026`);
	await period.getByLabel(/Choose another/).selectOption('2025');
	await expect(page).toHaveURL(/at=2025/);
	await expect(spent).toHaveText('€100.00');

	// A day from the date picker
	await open(page, `${groupUrl}?tab=insights&period=day&at=2026-08-01`);
	await period.getByLabel(/Choose another/).fill('2026-08-03');
	await expect(page).toHaveURL(/at=2026-08-03/);
	await expect(spent).toHaveText('€100.00');
});
