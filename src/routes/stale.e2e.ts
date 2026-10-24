import { expect, test, type Page } from '@playwright/test';
import { createGroup, open } from './e2e-helpers';

/** Puts the app in the background and back, as switching apps or tabs would */
async function setVisibility(page: Page, state: 'hidden' | 'visible') {
	await page.evaluate((state) => {
		Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => state });
		document.dispatchEvent(new Event('visibilitychange'));
	}, state);
}

test('a group deleted elsewhere disappears when the app comes back', async ({ context }) => {
	const other = await context.newPage();
	const groupUrl = await createGroup(other, 'Old flat', 'Anna', ['Ben']);

	// This tab shows the start screen, then goes to the background
	const page = await context.newPage();
	await open(page, '/');
	await expect(page.getByRole('link', { name: /Old flat/ })).toBeVisible();
	await setVisibility(page, 'hidden');

	// Meanwhile the group is deleted in the other tab
	await open(other, `${groupUrl}?tab=group`);
	await other.getByRole('button', { name: 'Delete group' }).click();
	await other
		.getByRole('dialog', { name: 'Delete Old flat?' })
		.getByRole('button', { name: 'Delete' })
		.click();
	await expect(other).toHaveURL(/\/$/);

	// Back after a while: fresh data, no group
	await page.evaluate(() => {
		const now = Date.now.bind(Date);
		Date.now = () => now() + 60_000;
	});
	await setVisibility(page, 'visible');
	await expect(page.getByRole('link', { name: /Old flat/ })).toHaveCount(0);
	await expect(page.getByRole('region', { name: 'Recently deleted' })).toContainText('Old flat');
});
