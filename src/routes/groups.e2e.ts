import { expect, test, type Page } from '@playwright/test';

/** Opens a page and waits until it's interactive (hydrated), like a user would. */
async function open(page: Page, url: string) {
	await page.goto(url);
	await page.waitForLoadState('networkidle');
}

test('a new visitor starts from the empty home screen', async ({ page }) => {
	await open(page, '/');
	await expect(page.getByText('No groups yet')).toBeVisible();
	await page.getByRole('link', { name: 'New group' }).click();
	await expect(page.getByRole('heading', { name: 'Start a group' })).toBeVisible();
});

test('create a group, manage members and replace its link', async ({ page }) => {
	await open(page, '/new');
	await page.getByLabel('Group name').fill('Ski trip');
	await page.getByLabel('Currency').selectOption('CHF');
	await page.getByLabel('Your name').fill('Anna');
	// A typed name counts even without pressing Add
	await page.getByLabel('Add a person').fill('Ben');
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
	await open(page, '/');
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
	await open(page, '/new');
	await page.getByLabel('Group name').fill('Dinner club');
	await page.getByLabel('Currency').selectOption('EUR');
	await page.getByLabel('Your name').fill('Anna');
	await page.getByLabel('Add a person').fill('Ben');
	await page.getByLabel('Add a person').press('Enter');
	await page.getByLabel('Add a person').fill('Dora');
	await page.getByRole('button', { name: 'Add', exact: true }).click();
	await page.getByRole('button', { name: 'Remove Dora' }).click();
	await page.getByLabel('Add a person').fill('Cara');
	await page.getByLabel('Add a person').press('Enter');
	await expect(page.getByRole('list', { name: 'Who else is in the group?' })).toHaveText(
		/Ben\s*Cara/
	);
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
	// Konsta draws its own checkbox over the real input, so tap the row like a user
	await page.getByRole('group', { name: 'Split equally between' }).getByText('Cara').click();
	await expect(page.getByRole('checkbox', { name: 'Cara' })).not.toBeChecked();
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
	await page.getByRole('button', { name: 'Delete expense' }).click();
	await page
		.getByRole('dialog', { name: 'Delete expense' })
		.getByRole('button', { name: 'Delete expense' })
		.click();
	await expect(page.getByText('No expenses yet.')).toBeVisible();
	await expectBalances({ Anna: 'settled up' });
});

test('settle up with suggested payments', async ({ page }) => {
	await open(page, '/new');
	await page.getByLabel('Group name').fill('Flat');
	await page.getByLabel('Currency').selectOption('EUR');
	await page.getByLabel('Your name').fill('Anna');
	await page.getByLabel('Add a person').fill('Ben');
	await page.getByRole('button', { name: 'Create group' }).click();
	await expect(page.getByTestId('identity')).toHaveText('Anna');
	const groupUrl = page.url();

	await page.getByRole('link', { name: 'Add expense' }).click();
	await page.getByLabel('What was it for?').fill('Rent');
	await page.getByLabel('Amount').fill('1000');
	await page.getByRole('button', { name: 'Add expense' }).click();
	await expect(page).toHaveURL(groupUrl);

	// Ben owes half; the suggestion opens a pre-filled payment
	await page.goto(`${groupUrl}?tab=balances`);
	const settle = page.getByRole('region', { name: 'Settle up' });
	await expect(settle).toContainText('Ben pays Anna');
	await expect(settle).toContainText('€500.00');
	await settle.getByRole('link', { name: /Ben pays Anna/ }).click();
	await expect(page.getByLabel('From')).toHaveValue(/.+/);
	await expect(page.getByLabel('Amount')).toHaveValue('500.00');
	await page.getByRole('button', { name: 'Record payment' }).click();

	// Back on balances: everyone settled, the group keeps running (B-5)
	await expect(page.getByRole('status')).toHaveText('All settled. Nice and easy.');
	await page.goto(groupUrl);
	await expect(page.getByRole('link', { name: /Ben paid Anna/ })).toBeVisible();

	// Deleting the payment brings the debt back
	await page.getByRole('link', { name: /Ben paid Anna/ }).click();
	await page.getByRole('button', { name: 'Delete payment' }).click();
	await page
		.getByRole('dialog', { name: 'Delete payment' })
		.getByRole('button', { name: 'Delete payment' })
		.click();
	await expect(page.getByRole('region', { name: 'Settle up' })).toContainText('Ben pays Anna');
});
