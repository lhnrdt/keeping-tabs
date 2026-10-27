import { expect, test } from '@playwright/test';
import { createGroup, open } from './e2e-helpers';

test('remind someone who owes you, with the group link (#48)', async ({ page }) => {
	const groupUrl = await createGroup(page, 'Flat', 'Anna', ['Ben']);
	await page.getByRole('link', { name: 'Add expense' }).click();
	await page.getByLabel('What was it for?').fill('Pizza');
	await page.getByLabel('Amount (€)').fill('20');
	await page.getByRole('button', { name: 'Add expense' }).click();
	await expect(page).toHaveURL(groupUrl);

	await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
	await open(page, `${groupUrl}?tab=balances`);
	// Without a share sheet (a desktop browser), the message is copied
	await page.evaluate(() => Object.defineProperty(navigator, 'share', { value: undefined }));
	await page.getByRole('button', { name: 'Remind' }).click();
	await expect(page.getByRole('button', { name: 'Copied' })).toBeVisible();
	expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
		`Hi Ben, just a friendly reminder: you still owe me €10.00 for “Flat”. ${groupUrl}`
	);
});
