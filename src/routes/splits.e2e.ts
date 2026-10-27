import { expect, test, type Page } from '@playwright/test';
import { choose, createGroup } from './e2e-helpers';

const balanceOf = (page: Page, name: string) =>
	page.getByRole('region', { name: 'Balances' }).getByRole('listitem').filter({ hasText: name });

async function addExpense(page: Page, title: string, amount: string) {
	await page.getByRole('link', { name: 'Add expense' }).click();
	await page.getByLabel('What was it for?').fill(title);
	await page.getByLabel('Amount (€)').fill(amount);
}

test('split by percentages, with a live remainder, and edit it again', async ({ page }) => {
	const groupUrl = await createGroup(page, 'Flat', 'Anna', ['Ben']);

	await addExpense(page, 'Rent', '1000');
	// Two people get quick choices first (#40); percentages are among the more options
	await page.getByRole('button', { name: 'More options' }).click();
	await choose(page, 'Split', 'Percent');
	await page.getByLabel('Percent for Anna').fill('40');
	await expect(page.getByTestId('split-summary')).toHaveText('40 % of 100 %, 60 % left');
	await page.getByLabel('Percent for Ben').fill('70');
	await expect(page.getByTestId('split-summary')).toHaveText('110 % of 100 %, 10 % too much');
	await page.getByRole('button', { name: 'Add expense' }).click();
	await expect(page.getByRole('alert')).toHaveText('The percentages need to add up to 100%.');

	await page.getByLabel('Percent for Ben').fill('60');
	await expect(page.getByTestId('split-summary')).toHaveText('All assigned');
	await page.getByRole('button', { name: 'Add expense' }).click();
	await expect(page).toHaveURL(groupUrl);

	// The list shows Anna's side of it: she paid 1000, her share is 400
	const rent = page
		.getByRole('region', { name: 'Expenses' })
		.getByRole('listitem')
		.filter({ hasText: 'Rent' });
	await expect(rent).toContainText('you lent €600.00');

	// Anna paid 1000, her share is 400: Ben owes her 600
	await page.goto(`${groupUrl}?tab=balances`);
	await expect(balanceOf(page, 'Anna')).toContainText('€600.00');

	await page.goto(groupUrl);
	await page.getByRole('link', { name: /Rent/ }).click();
	await expect(page.getByRole('radio', { name: 'Percent' })).toBeChecked();
	await expect(page.getByLabel('Percent for Ben')).toHaveValue('60');
});

test('split by amounts, parts and difference', async ({ page }) => {
	const groupUrl = await createGroup(page, 'Trip', 'Anna', ['Ben', 'Cara']);

	// Amounts: Anna 10, Ben 20, Cara nothing
	await addExpense(page, 'Tickets', '30');
	await choose(page, 'Split', 'Amounts');
	await page.getByLabel('Amount for Anna').fill('10');
	await expect(page.getByTestId('split-summary')).toHaveText('€10.00 of €30.00, €20.00 left');
	await page.getByLabel('Amount for Ben').fill('20');
	await page.getByRole('button', { name: 'Add expense' }).click();
	await expect(page).toHaveURL(groupUrl);

	// Parts 2:1:1 of 40 → 20, 10, 10
	await addExpense(page, 'Dinner', '40');
	await choose(page, 'Split', 'Parts');
	await page.getByLabel('Parts for Anna').fill('2');
	await page.getByLabel('Parts for Ben').fill('1');
	await page.getByLabel('Parts for Cara').fill('1');
	await page.getByRole('button', { name: 'Add expense' }).click();
	await expect(page).toHaveURL(groupUrl);

	// Difference: 30 split equally, Cara +6 → Anna 8, Ben 8, Cara 14
	await addExpense(page, 'Taxi', '30');
	await choose(page, 'Split', 'Adjust');
	await page.getByLabel('Difference for Cara').fill('6');
	await page.getByRole('button', { name: 'Add expense' }).click();
	await expect(page).toHaveURL(groupUrl);

	// Not every expense involves Anna the same way
	const entries = page.getByRole('region', { name: 'Expenses' }).getByRole('listitem');
	await expect(entries.filter({ hasText: 'Taxi' })).toContainText('you lent €22.00');

	// Anna paid 100 and her shares are 10 + 20 + 8 = 38: she gets back 62.
	// Ben owes 20 + 10 + 8 = 38, Cara 0 + 10 + 14 = 24.
	await page.goto(`${groupUrl}?tab=balances`);
	await expect(balanceOf(page, 'Anna')).toContainText('€62.00');
	await expect(balanceOf(page, 'Ben')).toContainText('€38.00');
	await expect(balanceOf(page, 'Cara')).toContainText('€24.00');
});
