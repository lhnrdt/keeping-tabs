import { expect, test } from '@playwright/test';
import { createGroup, open } from './e2e-helpers';

const EXPORT = new URL('./fixtures/splitwise-export.csv', import.meta.url).pathname;

test('import a Splitwise export, matching people, and skip it when imported again', async ({
	page
}) => {
	const groupUrl = await createGroup(page, 'Flat', 'Anna', ['Ben']);

	await open(page, `${groupUrl}?tab=group`);
	await page.getByRole('link', { name: 'Import from Splitwise' }).click();
	await page.getByLabel('Splitwise export (CSV)').setInputFiles(EXPORT);

	// Preview: what's in it and where everyone stands; "Ben Becker" is matched to Ben
	const summary = page.getByRole('region', { name: 'Import from Splitwise' });
	await expect(summary).toContainText(/3 expenses and 1 payments/);
	await expect(summary.getByRole('listitem').filter({ hasText: 'Anna' })).toContainText(
		'gets back €20.00'
	);
	await expect(page.getByLabel('Ben Becker')).toHaveValue(/.+/);
	await expect(page.getByLabel('Ben Becker').locator('option:checked')).toHaveText('Ben');

	await page.getByRole('button', { name: 'Import' }).click();
	await expect(page).toHaveURL(groupUrl);
	const expenses = page.getByRole('region', { name: 'Expenses' }).getByRole('listitem');
	await expect(expenses).toHaveCount(4);
	await expect(expenses.filter({ hasText: 'Pizza, Wein' })).toBeVisible();

	await open(page, `${groupUrl}?tab=balances`);
	const balances = page.getByRole('region', { name: 'Balances' });
	await expect(balances.getByRole('listitem').filter({ hasText: 'Anna' })).toContainText(
		'gets back €20.00'
	);

	// The same file again adds nothing
	await open(page, `${groupUrl}/import`);
	await page.getByLabel('Splitwise export (CSV)').setInputFiles(EXPORT);
	await page.getByRole('button', { name: 'Import' }).click();
	await expect(page).toHaveURL(groupUrl);
	await expect(expenses).toHaveCount(4);
});

test('a file that is not a Splitwise export is explained', async ({ page }) => {
	const groupUrl = await createGroup(page, 'Other', 'Anna', ['Ben']);
	await open(page, `${groupUrl}/import`);
	await page.getByLabel('Splitwise export (CSV)').setInputFiles({
		name: 'notes.csv',
		mimeType: 'text/csv',
		buffer: Buffer.from('Name,Amount\nCoffee,3\n')
	});
	await expect(page.getByRole('alert')).toContainText("doesn't look like a Splitwise export");
});
