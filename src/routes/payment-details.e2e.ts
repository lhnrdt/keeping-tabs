import { expect, test } from '@playwright/test';
import { createGroup, open } from './e2e-helpers';

test('whoever pays you back sees how to pay you (#47)', async ({ page }) => {
	const groupUrl = await createGroup(page, 'Flat', 'Anna', ['Ben']);
	await open(page, '/you');
	await page.getByLabel('How to pay you').fill('paypal.me/anna');
	await page.getByLabel('How to pay you').blur();
	await expect(page.getByText('Saved')).toBeVisible();

	await open(page, groupUrl);
	await page.getByRole('link', { name: 'Add expense' }).click();
	await page.getByLabel('What was it for?').fill('Pizza');
	await page.getByLabel('Amount (EUR)').fill('20');
	await page.getByRole('button', { name: 'Add expense' }).click();
	await expect(page).toHaveURL(groupUrl);

	// Ben pays Anna back: her details, ready to copy
	await open(page, `${groupUrl}?tab=balances`);
	await page.getByRole('region', { name: 'Settle up' }).getByRole('link').first().click();
	await expect(page.getByText('How to pay Anna')).toBeVisible();
	await expect(page.getByTestId('payment-details')).toHaveText('paypal.me/anna');
	await expect(page.getByRole('button', { name: 'Copy' })).toBeVisible();

	// Not for someone without any
	await page.getByLabel('To', { exact: true }).selectOption({ label: 'Ben' });
	await expect(page.getByTestId('payment-details')).toHaveCount(0);
});

test('payment details stay with the people in the group (#71)', async ({ page, browser }) => {
	const groupUrl = await createGroup(page, 'Flat', 'Anna', ['Ben']);
	await open(page, '/you');
	await page.getByLabel('How to pay you').fill('DE02120300000000202051');
	await page.getByLabel('How to pay you').blur();
	await expect(page.getByText('Saved')).toBeVisible();

	// Someone with the link who hasn't joined: not in the page, not in its data
	const stranger = await (await browser.newContext()).newPage();
	await open(stranger, groupUrl);
	const data = await stranger.request.get(`${groupUrl.split('?')[0]}/__data.json`);
	expect(await data.text()).not.toContain('DE02120300000000202051');
	expect(await stranger.content()).not.toContain('DE02120300000000202051');
});
