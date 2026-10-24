import { expect, test } from '@playwright/test';
import { choose, open } from './e2e-helpers';

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
	const members = page.getByRole('list', { name: 'Members' });
	await expect(members.getByRole('button', { name: 'Ben: options' })).toContainText('not here yet');

	// People are pills; "+ Add" opens a field that stays open for the next name
	await page.getByRole('button', { name: 'Add', exact: true }).click();
	const newName = page.getByLabel("New person's name");
	await newName.fill('Cara');
	await newName.press('Enter');
	await expect(members.getByText('Cara')).toBeVisible();
	await newName.fill('cara');
	await newName.press('Enter');
	await expect(page.getByRole('alert')).toHaveText('Each member needs a different name.');

	await members.getByRole('button', { name: 'Ben: options' }).click();
	await page.getByRole('dialog', { name: 'Ben' }).getByRole('button', { name: 'Rename' }).click();
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
	// Wait for the new token, not just any other URL (we're on ?tab=group)
	const oldToken = new URL(groupUrl).pathname.split('/').pop()!;
	await expect(page).toHaveURL((url) => !url.pathname.endsWith(oldToken));
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
	await page.getByLabel('Amount (EUR)').fill('30,01');
	await page.getByRole('button', { name: 'Add expense' }).click();

	await expect(page.getByRole('link', { name: /Pizza/ })).toContainText('Anna paid €30.01');
	// The extra cent goes to the first participant (Anna)
	await expectBalances({ Anna: 'gets back €20.00', Ben: 'owes €10.00', Cara: 'owes €10.00' });

	// Leave Cara out
	await page.getByRole('link', { name: /Pizza/ }).click();
	await expect(page.getByLabel('Amount (EUR)')).toHaveValue('30.01');
	// Konsta draws its own checkbox over the real input, so tap the row like a user
	await page.getByRole('group', { name: 'Split equally between' }).getByText('Cara').click();
	await expect(page.getByRole('checkbox', { name: 'Cara' })).not.toBeChecked();
	await page.getByRole('button', { name: 'Save' }).click();
	await expect(page).toHaveURL(groupUrl);
	await expectBalances({ Anna: 'gets back €15.00', Ben: 'owes €15.00', Cara: 'settled up' });

	// Validation keeps the input
	await page.getByRole('link', { name: 'Add expense' }).click();
	await page.getByLabel('What was it for?').fill('Drinks');
	await page.getByLabel('Amount (EUR)').fill('0');
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
	await page.getByLabel('Amount (EUR)').fill('1000');
	await page.getByRole('button', { name: 'Add expense' }).click();
	await expect(page).toHaveURL(groupUrl);

	// Ben owes half; the suggestion opens a pre-filled payment
	await page.goto(`${groupUrl}?tab=balances`);
	const settle = page.getByRole('region', { name: 'Settle up' });
	await expect(settle).toContainText('Ben pays Anna');
	await expect(settle).toContainText('€500.00');
	await settle.getByRole('link', { name: /Ben pays Anna/ }).click();
	await expect(page.getByLabel('From')).toHaveValue(/.+/);
	await expect(page.getByLabel('Amount (EUR)')).toHaveValue('500.00');
	// Before paying, the home screen shows what Anna gets back overall and per group (SP-5)
	await open(page, '/');
	await expect(page.getByTestId('overall-balance')).toHaveText('You get back €500.00');
	await expect(page.getByRole('link', { name: /Flat/ })).toContainText('You get back €500.00');
	await page.goBack();
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

test('choose a type and color for a group, then change them', async ({ page }) => {
	await open(page, '/new');
	await page.getByLabel('Group name').fill('Lake house');
	await page.getByLabel('Your name').fill('Anna');
	await page.getByLabel('Add a person').fill('Ben');
	await choose(page, 'Type', 'Trip');
	await choose(page, 'Color', 'Sky');
	await page.getByRole('button', { name: 'Create group' }).click();

	const hero = page.locator('header', { has: page.getByRole('heading', { name: 'Lake house' }) });
	await expect(hero).toHaveClass(/tint-sky/);

	await page.getByRole('link', { name: 'Group' }).click();
	const details = page.getByRole('region', { name: 'Details' });
	await expect(details).toContainText('Trip');

	await page.getByRole('button', { name: 'Edit group' }).click();
	const dialog = page.getByRole('dialog', { name: 'Edit group' });
	await choose(dialog, 'Type', 'Shared home');
	await choose(dialog, 'Color', 'Moss');
	await dialog.getByRole('button', { name: 'Save' }).click();
	await expect(details).toContainText('Shared home');
	await expect(hero).toHaveClass(/tint-moss/);

	// The home screen shows the group in its new color
	await open(page, '/');
	const tile = page.getByRole('link', { name: 'Lake house' }).locator('.tint-moss');
	await expect(tile).toBeVisible();
});

test('expenses get a category from their title unless one is chosen', async ({ page }) => {
	await open(page, '/new');
	await page.getByLabel('Group name').fill('Flat');
	await page.getByLabel('Your name').fill('Anna');
	await page.getByLabel('Add a person').fill('Ben');
	await page.getByRole('button', { name: 'Create group' }).click();
	await expect(page.getByTestId('identity')).toHaveText('Anna');

	// "Automatic" shows its guess while typing
	await page.getByRole('link', { name: 'Add expense' }).click();
	const automatic = page.getByRole('group', { name: 'Category' }).locator('label').first();
	await page.getByLabel('What was it for?').fill('Lidl');
	await expect(automatic).toContainText('Groceries');
	await page.getByLabel('What was it for?').fill('Taxi home');
	await expect(automatic).toContainText('Transport');
	await page.getByLabel('Amount (EUR)').fill('20');
	await page.getByRole('button', { name: 'Add expense' }).click();

	// A category chosen by hand sticks
	await page.getByRole('link', { name: /Taxi home/ }).click();
	await expect(page.getByRole('radio', { name: /Automatic/ })).toBeChecked();
	await choose(page, 'Category', 'Drinks');
	await page.getByRole('button', { name: 'Save' }).click();
	await page.getByRole('link', { name: /Taxi home/ }).click();
	await expect(page.getByRole('radio', { name: 'Drinks', exact: true })).toBeChecked();

	// …and the group's choice becomes the guess for the same title
	await page.goBack();
	await page.getByRole('link', { name: 'Add expense' }).click();
	await page.getByLabel('What was it for?').fill('taxi HOME');
	await expect(automatic).toContainText('Drinks');
});

test('unknown pages are calm, with a way back', async ({ page }) => {
	// As a friend who's already in (strangers land on the password page instead)
	await open(page, '/');
	const response = await page.goto('/g/AAAAAAAAAAAAAAAAAAAAAA');
	expect(response?.status()).toBe(404);
	await expect(page.getByRole('heading', { name: 'Nothing here' })).toBeVisible();
	await expect(page.getByRole('alert')).toContainText("This group doesn't exist");
	await page.getByRole('link', { name: 'Your groups' }).click();
	await expect(page).toHaveURL(/\/$/);
});

test('delete a group for everyone, and restore it from the start screen', async ({ page }) => {
	await open(page, '/new');
	await page.getByLabel('Group name').fill('Old flat');
	await page.getByLabel('Your name').fill('Anna');
	await page.getByRole('button', { name: 'Create group' }).click();
	await expect(page.getByTestId('identity')).toHaveText('Anna');
	const groupUrl = page.url();

	await open(page, `${groupUrl}?tab=group`);
	await page.getByRole('button', { name: 'Delete group' }).click();
	const dialog = page.getByRole('dialog', { name: 'Delete Old flat?' });
	await expect(dialog).toContainText('30 days');
	await dialog.getByRole('button', { name: 'Delete' }).click();

	// Gone from the start screen's groups and for anyone opening the link
	await expect(page).toHaveURL(/\/$/);
	await expect(page.getByRole('link', { name: 'Old flat' })).toHaveCount(0);
	const deleted = page.getByRole('region', { name: 'Recently deleted' });
	await expect(deleted).toContainText('Old flat');
	const response = await page.goto(groupUrl);
	expect(response?.status()).toBe(410);
	await expect(page.getByRole('alert')).toContainText('This group was deleted');

	// A member brings it back
	await open(page, '/');
	await page
		.getByRole('region', { name: 'Recently deleted' })
		.getByRole('button', { name: 'Restore' })
		.click();
	await expect(page.getByRole('link', { name: 'Old flat' })).toBeVisible();
	await expect(page.getByRole('region', { name: 'Recently deleted' })).toHaveCount(0);
	await open(page, groupUrl);
	await expect(page.getByRole('heading', { name: 'Old flat' })).toBeVisible();
});
