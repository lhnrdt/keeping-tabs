import { expect, test } from '@playwright/test';
import { splitBy, createGroup, open } from './e2e-helpers';

test('a group remembers a split for its new expenses (#41)', async ({ page }) => {
	const groupUrl = await createGroup(page, 'Anna & Ben', 'Anna', ['Ben']);
	await page.getByRole('link', { name: 'Add expense' }).click();
	await page.getByLabel('What was it for?').fill('Rent');
	await page.getByLabel('Amount (€)').fill('1000');
	await splitBy(page, 'Percent');
	await page.getByLabel('Percent for Anna').fill('60');
	await page.getByLabel('Percent for Ben').fill('40');
	await page.getByLabel('Use this split for new expenses').check();
	await page.getByRole('button', { name: 'Add expense' }).click();
	await expect(page).toHaveURL(groupUrl);

	// The next expense starts that way
	await page.getByRole('link', { name: 'Add expense' }).click();
	await expect(page.getByLabel('Percent for Anna')).toHaveValue('60');
	await expect(page.getByLabel('Percent for Ben')).toHaveValue('40');

	// Shown with the group, and back to equal from there
	await open(page, `${groupUrl}?tab=group`);
	const details = page.getByRole('region', { name: 'Details' });
	await expect(details).toContainText('Anna 60 % · Ben 40 %');
	await details.getByRole('button', { name: 'Back to equal' }).click();
	await expect(details).toContainText('Equally');
	await open(page, `${groupUrl}/expenses/new`);
	await expect(page.getByLabel('Split', { exact: true })).toHaveValue('equal');
});
