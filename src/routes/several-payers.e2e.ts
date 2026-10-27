import { expect, test } from '@playwright/test';
import { createGroup, open } from './e2e-helpers';

test('several people pay one expense (#39)', async ({ page }) => {
	const groupUrl = await createGroup(page, 'Trip', 'Anna', ['Ben', 'Cara']);
	await page.getByRole('link', { name: 'Add expense' }).click();
	await page.getByLabel('What was it for?').fill('Dinner');
	await page.getByLabel('Amount (€)').fill('90');
	await page.getByLabel('Paid by').selectOption({ label: 'Several people' });
	await page.getByLabel('Anna paid').fill('60');
	await expect(page.getByTestId('payers-summary')).toContainText('€60.00 of €90.00, €30.00 left');
	await page.getByLabel('Ben paid').fill('30');
	await page.getByRole('button', { name: 'Add expense' }).click();
	await expect(page).toHaveURL(groupUrl);
	await expect(page.getByRole('link', { name: /Dinner/ })).toContainText(
		'Anna and Ben paid €90.00'
	);

	// Split equally: Anna gets 30 back, Ben is even, Cara owes 30
	await open(page, `${groupUrl}?tab=balances`);
	const balances = page.getByRole('region', { name: 'Balances' });
	await expect(balances).toContainText(/Anna\s*gets back €30\.00/);
	await expect(balances).toContainText(/Cara\s*owes €30\.00/);

	// Opened again, it's the same payers
	await open(page, groupUrl);
	await page.getByRole('link', { name: /Dinner/ }).click();
	await expect(page.getByLabel('Paid by')).toHaveValue('several');
	await expect(page.getByLabel('Anna paid')).toHaveValue('60.00');
	await expect(page.getByLabel('Ben paid')).toHaveValue('30.00');
});
