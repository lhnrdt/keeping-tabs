import { expect, test } from '@playwright/test';
import { createGroup, participants } from './e2e-helpers';

test('the expense form: a folded split line, an automatic category, quick dates and a note', async ({
	page
}) => {
	const groupUrl = await createGroup(page, 'Cabin', 'Anna', ['Ben', 'Cara']);
	await page.getByRole('link', { name: 'Add expense' }).click();
	await page.getByLabel('What was it for?').fill('Taxi home');
	await page.getByLabel('Amount (€)').fill('30');

	// Shared by everyone, in one line; leaving someone out shows in it
	await expect(page.getByTestId('split-between')).toHaveText('Everyone · €10.00 each');
	await (await participants(page)).getByText('Cara').click();
	await expect(page.getByTestId('split-between')).toHaveText('Anna and Ben · €15.00 each');

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
	await expect(page.getByTestId('split-between')).toHaveText('Anna and Ben · €15.00 each');
	await expect(page.getByLabel('Note', { exact: true })).toHaveValue('From the station');
	await expect(page.getByRole('button', { name: 'Yesterday' })).toHaveAttribute(
		'aria-pressed',
		'true'
	);
});
