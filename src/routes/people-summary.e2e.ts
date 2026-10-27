import { expect, test, type Page } from '@playwright/test';
import { createGroup, open } from './e2e-helpers';

async function addExpense(page: Page, groupUrl: string, title: string, amount: string) {
	await open(page, `${groupUrl}/expenses/new`);
	await page.getByLabel('What was it for?').fill(title);
	await page.getByLabel('Amount (€)').fill(amount);
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

	// The start screen shows it per group, as in each group's header
	await open(anna, '/');
	const yourGroups = anna.getByRole('region', { name: 'Your groups' });
	await expect(yourGroups.getByRole('link', { name: /Trip/ })).toContainText('Ben owes you €30.00');
	await expect(yourGroups.getByRole('link', { name: /Flat/ })).toContainText('You owe Ben €10.00');

	// From the overall balance to everyone, by person
	await anna.getByRole('link', { name: /Overall across your groups/ }).click();
	await expect(anna).toHaveURL(/\/balances$/);
	const people = anna.getByRole('region', { name: 'Between you and others' });
	const benRow = people.getByRole('listitem').filter({ hasText: 'Ben' }).first();
	await expect(benRow).toContainText('owes you €20.00');
	await benRow.getByText('Ben', { exact: true }).click();
	const groups = people.getByRole('list', { name: 'Groups with Ben' });
	await expect(groups.getByRole('link', { name: /Trip/ })).toContainText('owes you €30.00');
	await expect(groups.getByRole('link', { name: /Flat/ })).toContainText('you owe €10.00');

	// And in a group's balances, between you and each person there
	await groups.getByRole('link', { name: /Flat/ }).click();
	await expect(anna).toHaveURL(/\?tab=balances$/);
	await expect(anna.getByRole('heading', { name: 'Flat' })).toBeVisible();
	await expect(
		anna
			.getByRole('region', { name: 'Between you and others' })
			.getByRole('listitem')
			.filter({ hasText: 'Ben' })
	).toContainText('you owe €10.00');
});
