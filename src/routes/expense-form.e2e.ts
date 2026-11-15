import { expect, test } from '@playwright/test';
import { createGroup, participants } from './e2e-helpers';

test('the expense form: who paid, how it’s split and who it’s for, an automatic category, quick dates and a note', async ({
	page
}) => {
	const groupUrl = await createGroup(page, 'Cabin', 'Anna', ['Ben', 'Cara']);
	await page.getByRole('link', { name: 'Add expense' }).click();
	await page.getByLabel('What was it for?').fill('Taxi home');
	await page.getByLabel('Amount (€)').fill('30');

	// For everyone at first, each with their share; leaving someone out shares it among the rest
	const forWhom = await participants(page);
	await expect(forWhom).toContainText(/Anna\s*€10\.00/);
	await forWhom.getByText('Cara').click();
	await expect(forWhom).toContainText(/Anna\s*€15\.00/);
	await expect(page.getByRole('checkbox', { name: /Cara/ })).not.toBeChecked();

	// The category follows the title until one is chosen, and can go back to that
	const category = page.getByRole('group', { name: 'Category' });
	await expect(category.locator('label', { hasText: 'Auto' })).toContainText('Transport');
	await category.getByText('Drinks').click();
	await expect(category.getByText('Auto', { exact: true })).toHaveCount(0);
	await page.getByRole('button', { name: 'Back to automatic' }).click();
	await expect(page.getByRole('radio', { name: 'Automatic' })).toBeChecked();

	// Yesterday in one tap; the note opens under the title
	await page.getByRole('button', { name: 'Yesterday' }).click();
	await expect(page.getByRole('button', { name: 'Yesterday' })).toHaveAttribute(
		'aria-pressed',
		'true'
	);
	await page.getByRole('button', { name: 'Add a note' }).click();
	await page.getByLabel('Note', { exact: true }).fill('From the station');
	await page.getByRole('button', { name: 'Add expense' }).click();
	await expect(page).toHaveURL(groupUrl);
	await expect(page.getByRole('link', { name: /Taxi home/ })).toContainText('with a note');

	// Edited: as saved, the note open
	await page.getByRole('link', { name: /Taxi home/ }).click();
	await expect(await participants(page)).toContainText(/Ben\s*€15\.00/);
	await expect(page.getByRole('checkbox', { name: /Cara/ })).not.toBeChecked();
	await expect(page.getByLabel('Note', { exact: true })).toHaveValue('From the station');
	await expect(page.getByRole('button', { name: 'Yesterday' })).toHaveAttribute(
		'aria-pressed',
		'true'
	);
});

test('a big group picks who paid from a dropdown instead of a long row of chips', async ({
	page
}) => {
	await createGroup(page, 'Team', 'Anna', ['Ben', 'Cara', 'Dan', 'Eva', 'Finn', 'Gus']);
	await page.getByRole('link', { name: 'Add expense' }).click();
	// You paid, folded to one line; someone else: all of them, as a dropdown here
	await page.getByRole('button', { name: 'Someone else' }).click();
	const whoPaid = page.getByRole('combobox', { name: 'Who paid?' });
	await expect(whoPaid).toBeVisible();
	await expect(whoPaid.locator('option').first()).toHaveText('Me');
	// How it's split stays as chips
	await expect(page.getByRole('radio', { name: 'Equally' })).toBeChecked();
});
