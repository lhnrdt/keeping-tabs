import { expect, test } from '@playwright/test';
import { createGroup } from './e2e-helpers';

test('two people pick who paid and how in one tap (#40)', async ({ page }) => {
	await createGroup(page, 'Anna & Ben', 'Anna', ['Ben']);
	await page.getByRole('link', { name: 'Add expense' }).click();
	await expect(page.getByLabel('Paid by')).toHaveCount(0);
	await expect(page.getByLabel('You paid, split equally')).toBeChecked();

	await page.getByLabel('What was it for?').fill('Kino');
	await page.getByLabel('Amount (€)').fill('24');
	await page.getByLabel('Ben paid, you owe all of it').check();
	await page.getByRole('button', { name: 'Add expense' }).click();
	await expect(page.getByRole('link', { name: /Kino/ })).toContainText('Ben paid €24.00');
	await expect(page.getByRole('link', { name: /Kino/ })).toContainText('you borrowed €24.00');

	// Opened again, it's that choice; more options show the full form
	await page.getByRole('link', { name: /Kino/ }).click();
	await expect(page.getByLabel('Ben paid, you owe all of it')).toBeChecked();
	await page.getByRole('button', { name: 'More options' }).click();
	await expect(page.getByLabel('Paid by')).toBeVisible();
});
