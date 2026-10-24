import { expect, test, type Page } from '@playwright/test';
import { createGroup, open } from './e2e-helpers';

async function addExpense(page: Page, groupUrl: string, title: string, amount: string) {
	await open(page, `${groupUrl}/expenses/new`);
	await page.getByLabel('What was it for?').fill(title);
	await page.getByLabel('Amount (EUR)').fill(amount);
	await page.getByRole('button', { name: 'Add expense' }).click();
	await expect(page.getByRole('link', { name: new RegExp(title) })).toBeVisible();
}

test('the start screen sums up each person across groups (#117)', async ({ browser }) => {
	const anna = await (await browser.newContext()).newPage();
	const trip = await createGroup(anna, 'Trip', 'Anna', ['Ben']);
	const flat = await createGroup(anna, 'Flat', 'Anna', ['Ben']);

	// Ben joins both from his own device, so he's the same person in both
	const ben = await (await browser.newContext()).newPage();
	for (const group of [trip, flat]) {
		await open(ben, group);
		await ben.getByRole('button', { name: "I'm Ben" }).click();
		await expect(ben.getByTestId('identity')).toHaveText('Ben');
	}

	// Trip: Ben owes Anna 30; Flat: Anna owes Ben 10
	await addExpense(anna, trip, 'Cabin', '60');
	await addExpense(ben, flat, 'Rent', '20');

	await open(anna, '/');
	const people = anna.getByRole('region', { name: 'By person' });
	const benRow = people.getByRole('listitem').filter({ hasText: 'Ben' }).first();
	await expect(benRow).toContainText('owes you €20.00');
	await benRow.getByText('Ben', { exact: true }).click();
	const groups = people.getByRole('list', { name: 'Groups with Ben' });
	await expect(groups.getByRole('link', { name: /Trip/ })).toContainText('owes you €30.00');
	await expect(groups.getByRole('link', { name: /Flat/ })).toContainText('you owe €10.00');

	await groups.getByRole('link', { name: /Flat/ }).click();
	await expect(anna).toHaveURL(/\?tab=balances$/);
});
