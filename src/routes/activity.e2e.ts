import { expect, test } from '@playwright/test';
import { createGroup, open } from './e2e-helpers';

test('see who changed what, and bring a deleted expense back (#43)', async ({ page }) => {
	const groupUrl = await createGroup(page, 'Flat', 'Anna', ['Ben']);
	await page.getByRole('link', { name: 'Add expense' }).click();
	await page.getByLabel('What was it for?').fill('Pizza');
	await page.getByLabel('Amount (EUR)').fill('20');
	await page.getByRole('button', { name: 'Add expense' }).click();
	await page.getByRole('link', { name: /Pizza/ }).click();
	await page.getByRole('button', { name: 'Delete expense' }).click();
	await page
		.getByRole('dialog')
		.getByRole('button', { name: /Delete/ })
		.click();
	await expect(page).toHaveURL(new RegExp(groupUrl.split('?')[0]));

	await open(page, `${groupUrl}?tab=group`);
	await page.getByRole('link', { name: 'Activity' }).click();
	const items = page.getByRole('region', { name: 'Activity' }).getByRole('listitem');
	await expect(items.first()).toContainText('Anna deleted “Pizza”');
	await expect(items.nth(1)).toContainText('Anna added “Pizza”');
	await expect(page.getByText('Anna created the group')).toBeVisible();

	await items.first().getByRole('button', { name: 'Restore' }).click();
	await expect(items.first()).toContainText('Anna restored “Pizza”');
	await open(page, groupUrl);
	await expect(page.getByRole('link', { name: /Pizza/ })).toBeVisible();
});
