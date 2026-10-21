import { expect, test } from '@playwright/test';

test('create a group, manage members and replace its link', async ({ page }) => {
	await page.goto('/');
	await page.getByLabel('Group name').fill('Ski trip');
	await page.getByLabel('Currency').selectOption('CHF');
	await page.getByLabel('Your name').fill('Anna');
	await page.getByLabel('Name 1').fill('Ben');
	await page.getByRole('button', { name: 'Create group' }).click();

	// The creator lands on the group and is remembered as Anna
	await expect(page).toHaveURL(/\/g\/[A-Za-z0-9_-]{22}$/);
	await expect(page.getByRole('heading', { name: 'Ski trip' })).toBeVisible();
	await expect(page.getByTestId('identity')).toHaveText('Anna');
	const groupUrl = page.url();

	await page.getByRole('link', { name: 'Group' }).click();
	await expect(page.getByRole('region', { name: 'Details' })).toContainText('CHF');
	const members = page.getByRole('region', { name: 'Members' });

	await page.getByLabel('New member').fill('Cara');
	await page.getByRole('button', { name: 'Add member' }).click();
	await expect(members.getByText('Cara')).toBeVisible();

	await page.getByLabel('New member').fill('cara');
	await page.getByRole('button', { name: 'Add member' }).click();
	await expect(page.getByRole('alert')).toHaveText('Each member needs a different name.');

	await page.getByRole('button', { name: 'Rename Ben' }).click();
	const renameDialog = page.getByRole('dialog', { name: 'Rename Ben' });
	await renameDialog.getByLabel('Name').fill('Benedikt');
	await renameDialog.getByRole('button', { name: 'Save' }).click();
	await expect(members.getByText('Benedikt')).toBeVisible();

	// Survives a reload, and the home page lists the group
	await page.reload();
	await expect(members.getByText('Benedikt')).toBeVisible();
	await page.goto('/');
	await expect(page.getByRole('link', { name: 'Ski trip' })).toBeVisible();

	// A new link replaces the old one
	await page.goto(`${groupUrl}?tab=group`);
	await page.getByRole('button', { name: 'Create new link' }).click();
	await page
		.getByRole('dialog', { name: 'Create new link' })
		.getByRole('button', { name: 'Create new link' })
		.click();
	await expect(page).not.toHaveURL(groupUrl);
	await expect(page.getByRole('heading', { name: 'Ski trip' })).toBeVisible();

	const response = await page.goto(groupUrl);
	expect(response?.status()).toBe(404);
	await expect(page.getByText("This group doesn't exist")).toBeVisible();
});

test('expenses update the balances', async ({ page }) => {
	await page.goto('/');
	await page.getByLabel('Group name').fill('Dinner club');
	await page.getByLabel('Currency').selectOption('EUR');
	await page.getByLabel('Your name').fill('Anna');
	await page.getByLabel('Name 1').fill('Ben');
	await page.getByLabel('Name 2').fill('Cara');
	await page.getByRole('button', { name: 'Create group' }).click();
	await expect(page.getByTestId('identity')).toHaveText('Anna');
	const groupUrl = page.url();

	const balanceOf = (name: string) =>
		page.getByRole('region', { name: 'Balances' }).getByRole('listitem').filter({ hasText: name });
	const expectBalances = async (expected: Record<string, string>) => {
		await page.goto(`${groupUrl}?tab=balances`);
		for (const [name, text] of Object.entries(expected)) {
			await expect(balanceOf(name)).toContainText(text);
		}
		await page.goto(groupUrl);
	};

	// Paid by Anna (the default payer), split between everyone
	await page.getByRole('link', { name: 'Add expense' }).click();
	await page.getByLabel('What was it for?').fill('Pizza');
	await page.getByLabel('Amount').fill('30,01');
	await page.getByRole('button', { name: 'Add expense' }).click();

	await expect(page.getByRole('link', { name: /Pizza/ })).toContainText('Anna paid €30.01');
	// The extra cent goes to the first participant (Anna)
	await expectBalances({ Anna: 'gets back €20.00', Ben: 'owes €10.00', Cara: 'owes €10.00' });

	// Leave Cara out
	await page.getByRole('link', { name: /Pizza/ }).click();
	await expect(page.getByLabel('Amount')).toHaveValue('30.01');
	await page.getByRole('checkbox', { name: 'Cara' }).uncheck();
	await page.getByRole('button', { name: 'Save' }).click();
	await expect(page).toHaveURL(groupUrl);
	await expectBalances({ Anna: 'gets back €15.00', Ben: 'owes €15.00', Cara: 'settled up' });

	// Validation keeps the input
	await page.getByRole('link', { name: 'Add expense' }).click();
	await page.getByLabel('What was it for?').fill('Drinks');
	await page.getByLabel('Amount').fill('0');
	await page.getByRole('button', { name: 'Add expense' }).click();
	await expect(page.getByRole('alert')).toHaveText(
		'Enter an amount greater than zero, like 12.50.'
	);
	await expect(page.getByLabel('What was it for?')).toHaveValue('Drinks');
	await page.getByRole('link', { name: 'Back to Dinner club' }).click();

	// Delete
	await page.getByRole('link', { name: /Pizza/ }).click();
	page.once('dialog', (dialog) => dialog.accept());
	await page.getByRole('button', { name: 'Delete expense' }).click();
	await expect(page.getByText('No expenses yet.')).toBeVisible();
	await expectBalances({ Anna: 'settled up' });
});
