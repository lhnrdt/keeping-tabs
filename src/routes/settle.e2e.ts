import { expect, test, type Page } from '@playwright/test';
import { createGroup, open } from './e2e-helpers';

/** Adds an equal expense paid by `payer`, split between `between` only. */
async function addExpense(page: Page, title: string, payer: string, between: string[]) {
	await page.getByRole('link', { name: 'Add expense' }).click();
	await page.getByLabel('What was it for?').fill(title);
	await page.getByLabel('Amount (EUR)').fill('30');
	await page.getByLabel('Paid by').selectOption({ label: payer });
	const participants = page.getByRole('group', { name: 'Split equally between' });
	for (const name of ['Anna', 'Ben', 'Cara']) {
		const checkbox = participants.getByRole('checkbox', { name });
		if ((await checkbox.isChecked()) !== between.includes(name)) {
			await participants.getByText(name).click();
		}
	}
	await page.getByRole('button', { name: 'Add expense' }).click();
	await expect(page.getByRole('link', { name: new RegExp(title) })).toBeVisible();
}

test('simplify debts is on by default and can be turned off per group', async ({ page }) => {
	const groupUrl = await createGroup(page, 'Chain', 'Anna', ['Ben', 'Cara']);
	// Ben owes Anna 15, Cara owes Ben 15
	await addExpense(page, 'Lunch', 'Anna', ['Anna', 'Ben']);
	await addExpense(page, 'Coffee', 'Ben', ['Ben', 'Cara']);

	const settleUp = page.getByRole('region', { name: 'Settle up' });
	await open(page, `${groupUrl}?tab=balances`);
	await expect(settleUp.getByRole('link')).toHaveText([/Cara pays Anna\s*€15\.00/]);

	await open(page, `${groupUrl}?tab=group`);
	await expect(page.getByRole('region', { name: 'Details' })).toContainText(/Simplify debts\s*On/);
	await page.getByRole('button', { name: 'Edit group' }).click();
	const dialog = page.getByRole('dialog', { name: 'Edit group' });
	await dialog.getByText('Simplify debts').click();
	await dialog.getByRole('button', { name: 'Save' }).click();
	await expect(page.getByRole('region', { name: 'Details' })).toContainText(/Simplify debts\s*Off/);

	await open(page, `${groupUrl}?tab=balances`);
	await expect(settleUp.getByRole('link')).toHaveText([
		/Ben pays Anna\s*€15\.00/,
		/Cara pays Ben\s*€15\.00/
	]);
});
