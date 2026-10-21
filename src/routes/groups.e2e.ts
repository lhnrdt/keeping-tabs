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

	const members = page.getByRole('list').filter({ hasText: 'Anna' });
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
