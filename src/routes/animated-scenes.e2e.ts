import { expect, test } from '@playwright/test';
import { createGroup, open } from './e2e-helpers';

test('a group’s scene moves a little, unless asked not to, and marks settling up', async ({
	page
}) => {
	const groupUrl = await createGroup(page, 'Flat', 'Anna', ['Ben']);
	const scene = page.getByTestId('group-scene');
	await expect(scene.locator('[class*="scene-"]').first()).toBeAttached();

	// Nothing added yet: the scene shows the group is even
	await expect(scene).toHaveAttribute('data-settled', 'true');

	await page.getByRole('link', { name: 'Add expense' }).click();
	await page.getByLabel('What was it for?').fill('Dinner');
	await page.getByLabel('Amount (€)').fill('30');
	await page.getByRole('button', { name: 'Add expense' }).click();
	await expect(page).toHaveURL(groupUrl);
	await expect(scene).toHaveAttribute('data-settled', 'false');

	// Settling up is the moment: once, then just how it looks
	await open(page, `${groupUrl}/payments/new`);
	await page.getByLabel('From', { exact: true }).selectOption({ label: 'Ben' });
	await page.getByLabel('To', { exact: true }).selectOption({ label: 'Anna' });
	await page.getByLabel(/Amount/).fill('15');
	await page.getByRole('button', { name: 'Record payment' }).click();
	await page.waitForURL(/tab=balances/);
	await expect(scene).toHaveAttribute('data-settled', 'true');
	await expect(scene.locator('.scene-celebrate')).toBeAttached();
	await page.reload();
	await expect(scene).toHaveAttribute('data-settled', 'true');
	await expect(scene.locator('.scene-celebrate')).toHaveCount(0);

	await page.emulateMedia({ reducedMotion: 'reduce' });
	const moving = await scene
		.locator('[class*="scene-"]')
		.first()
		.evaluate((element) => getComputedStyle(element).animationName);
	expect(moving).toBe('none');
});

test('an empty group’s picture is about what kind of group it is', async ({ page }) => {
	await createGroup(page, 'Flat', 'Anna', ['Ben']);
	await expect(page.getByTestId('empty-scene')).toHaveAttribute('data-kind', 'other');
});
