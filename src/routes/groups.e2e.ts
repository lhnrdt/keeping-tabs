import { expect, test } from '@playwright/test';

test('create a group, manage members and replace its link', async ({ page }) => {
	await page.goto('/');
	await page.getByLabel('Group name').fill('Ski trip');
	await page.getByLabel('Currency').selectOption('CHF');
	await page.getByLabel('Your name').fill('Anna');
	await page.getByRole('textbox', { name: 'Name', exact: true }).first().fill('Ben');
	await page.getByRole('button', { name: 'Create group' }).click();

	// The creator lands on the group and is remembered as Anna
	await expect(page).toHaveURL(/\/g\/[A-Za-z0-9_-]{22}$/);
	await expect(page.getByRole('heading', { name: 'Ski trip' })).toBeVisible();
	await expect(page.getByText('You are Anna.')).toBeVisible();
	await expect(page.getByText('Currency: CHF')).toBeVisible();
	const groupUrl = page.url();

	const members = page.getByRole('region', { name: 'Members' });
	const nameInput = page.getByRole('textbox', { name: 'Name', exact: true });

	await nameInput.fill('Cara');
	await page.getByRole('button', { name: 'Add member' }).click();
	await expect(members.getByText('Cara')).toBeVisible();

	await nameInput.fill('cara');
	await page.getByRole('button', { name: 'Add member' }).click();
	await expect(page.getByRole('alert')).toHaveText('Each member needs a different name.');

	await page.getByRole('button', { name: 'Rename Ben' }).click();
	await page.getByRole('textbox', { name: 'Rename Ben' }).fill('Benedikt');
	await page.getByRole('button', { name: 'Save' }).click();
	await expect(members.getByText('Benedikt')).toBeVisible();

	// Survives a reload, and the home page lists the group
	await page.reload();
	await expect(members.getByText('Benedikt')).toBeVisible();
	await page.goto('/');
	await expect(page.getByRole('link', { name: 'Ski trip' })).toBeVisible();

	// A new link replaces the old one
	await page.goto(groupUrl);
	page.once('dialog', (dialog) => dialog.accept());
	await page.getByRole('button', { name: 'Create new link' }).click();
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
	const others = page.getByRole('textbox', { name: 'Name', exact: true });
	await others.nth(0).fill('Ben');
	await others.nth(1).fill('Cara');
	await page.getByRole('button', { name: 'Create group' }).click();
	await expect(page.getByText('You are Anna.')).toBeVisible();

	const balances = page.getByRole('region', { name: 'Balances' });
	const balanceOf = (name: string) => balances.getByRole('listitem').filter({ hasText: name });

	// Paid by Anna (the default payer), split between everyone
	await page.getByRole('link', { name: 'Add expense' }).click();
	await page.getByLabel('What was it for?').fill('Pizza');
	await page.getByLabel('Amount').fill('30,01');
	await page.getByRole('button', { name: 'Add expense' }).click();

	await expect(page.getByRole('link', { name: /Pizza/ })).toContainText('Anna paid €30.01');
	await expect(balanceOf('Anna')).toContainText('gets back €20.00');
	await expect(balanceOf('Ben')).toContainText('owes €10.00');
	// The extra cent goes to the first participant (Anna)
	await expect(balanceOf('Cara')).toContainText('owes €10.00');

	// Leave Cara out
	await page.getByRole('link', { name: /Pizza/ }).click();
	await expect(page.getByLabel('Amount')).toHaveValue('30.01');
	await page.getByRole('checkbox', { name: 'Cara' }).uncheck();
	await page.getByRole('button', { name: 'Save' }).click();
	await expect(balanceOf('Anna')).toContainText('gets back €15.00');
	await expect(balanceOf('Ben')).toContainText('owes €15.00');
	await expect(balanceOf('Cara')).toContainText('settled up');

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
	await expect(balanceOf('Anna')).toContainText('settled up');
});
