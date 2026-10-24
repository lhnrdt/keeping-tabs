import { expect, test, type Page } from '@playwright/test';
import { createGroup, open } from './e2e-helpers';

async function addExpense(page: Page, title: string, amount: string) {
	await page.getByRole('link', { name: 'Add expense' }).click();
	await page.getByLabel('What was it for?').fill(title);
	await page.getByLabel('Amount (EUR)').fill(amount);
	await page.getByRole('button', { name: 'Add expense' }).click();
	await page.getByRole('link', { name: new RegExp(title) }).click();
	return page.url().split('/').pop()!;
}

test("an edit can't reach an entry of another group (#135)", async ({ page }) => {
	const tripUrl = await createGroup(page, 'Trip', 'Anna', ['Ben']);
	const tripExpense = await addExpense(page, 'Hotel', '100');

	const flatUrl = await createGroup(page, 'Flat', 'Anna', ['Cara']);
	await addExpense(page, 'Rent', '50');

	// Flat's edit form, sent to Trip's expense id
	const sent = page.waitForResponse((response) => response.request().method() === 'POST');
	await page
		.locator('form[method="POST"]')
		.filter({ has: page.getByLabel('What was it for?') })
		.evaluate((form, id) => {
			// This page's address with the other group's entry id
			(form as HTMLFormElement).action = location.pathname.replace(/[^/]+$/, id) + '?/save';
		}, tripExpense);
	await page.getByRole('button', { name: 'Save' }).click();
	expect((await sent).status()).not.toBe(200);

	// Trip is untouched: Ben still owes half the hotel
	await open(page, `${tripUrl}?tab=balances`);
	await expect(
		page.getByRole('region', { name: 'Balances' }).getByRole('listitem').filter({ hasText: 'Ben' })
	).toContainText('owes €50.00');
	expect(flatUrl).not.toBe(tripUrl);
});

test("an expense can't be edited through the payment form (#135)", async ({ page }) => {
	const groupUrl = await createGroup(page, 'Trip', 'Anna', ['Ben']);
	const hotel = await addExpense(page, 'Hotel', '100');

	// A payment form, sent to the expense's id
	await open(page, `${groupUrl}/payments/new`);
	await page.getByLabel('From', { exact: true }).selectOption({ label: 'Ben' });
	await page.getByLabel('To', { exact: true }).selectOption({ label: 'Anna' });
	await page.getByLabel('Amount (EUR)').fill('10');
	const sent = page.waitForResponse((response) => response.request().method() === 'POST');
	await page
		.locator('form[method="POST"]')
		.filter({ has: page.getByLabel('From') })
		.evaluate((form, id) => {
			(form as HTMLFormElement).action = location.pathname.replace(/new$/, id) + '?/save';
		}, hotel);
	await page.getByRole('button', { name: 'Record payment' }).click();
	expect((await sent).status()).not.toBe(200);

	// The hotel is still split between both
	await open(page, `${groupUrl}?tab=balances`);
	await expect(
		page.getByRole('region', { name: 'Balances' }).getByRole('listitem').filter({ hasText: 'Ben' })
	).toContainText('owes €50.00');
});
