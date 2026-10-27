import { expect, test } from '@playwright/test';
import { createGroup } from './e2e-helpers';

test('undo deleting an expense brings it back with its balances', async ({ page }) => {
	await createGroup(page, 'Dinner club', 'Anna', ['Ben']);
	await page.getByRole('link', { name: 'Add expense' }).click();
	await page.getByLabel('What was it for?').fill('Pizza');
	await page.getByLabel('Amount (€)').fill('30');
	await page.getByRole('button', { name: 'Add expense' }).click();
	const pizza = page.getByRole('link', { name: /Pizza/ });
	await expect(pizza).toBeVisible();

	await pizza.click();
	await page.getByRole('button', { name: 'Delete expense' }).click();
	await page
		.getByRole('dialog', { name: 'Delete expense' })
		.getByRole('button', { name: 'Delete expense' })
		.click();
	await expect(page.getByText('No expenses yet.')).toBeVisible();

	const undo = page.getByRole('status').filter({ hasText: '“Pizza” deleted' });
	await undo.getByRole('button', { name: 'Undo' }).click();
	await expect(pizza).toContainText('Anna paid €30.00');
	await expect(undo).toHaveCount(0);
	await expect(page.getByTestId('identity')).toHaveText('Anna');
});

test('the undo offer goes away by itself and not offered again on reload', async ({ page }) => {
	await createGroup(page, 'Flat', 'Anna', ['Ben']);
	await page.getByRole('link', { name: 'Add expense' }).click();
	await page.getByLabel('What was it for?').fill('Rent');
	await page.getByLabel('Amount (€)').fill('900');
	await page.getByRole('button', { name: 'Add expense' }).click();
	await page.getByRole('link', { name: /Rent/ }).click();
	await page.getByRole('button', { name: 'Delete expense' }).click();
	await page
		.getByRole('dialog', { name: 'Delete expense' })
		.getByRole('button', { name: 'Delete expense' })
		.click();

	const undo = page.getByRole('status').filter({ hasText: '“Rent” deleted' });
	await expect(undo).toBeVisible();
	await expect(undo).toHaveCount(0, { timeout: 15_000 });
	await expect(page).not.toHaveURL(/deleted=/);
	await page.reload();
	await expect(page.getByText('No expenses yet.')).toBeVisible();
	await expect(undo).toHaveCount(0);
});
