import { expect, test } from '@playwright/test';
import { createGroup, open, openFold } from './e2e-helpers';

test('log out on this device, and come back with a recovery key (#282)', async ({ page }) => {
	const groupUrl = await createGroup(page, 'Flat', 'Anna', ['Ben']);

	// With no other way back, it says so first
	await open(page, '/you');
	await page.getByRole('button', { name: 'Log out' }).click();
	const dialog = page.getByRole('dialog', { name: 'Log out on this device' });
	await expect(dialog.getByRole('alert')).toContainText('only way in');
	await dialog.getByRole('button', { name: 'Cancel' }).click();

	await open(page, '/you/backup');
	await openFold(page, 'Recovery key');
	await page.getByRole('button', { name: 'Create recovery key' }).click();
	const recoveryKey = (await page.getByTestId('recovery-key').innerText()).trim();

	await open(page, '/you');
	await page.getByRole('button', { name: 'Log out' }).click();
	await expect(dialog.getByRole('alert')).toHaveCount(0);
	await dialog.getByRole('button', { name: 'Log out' }).click();
	await expect(page).toHaveURL(/\/$/);
	await expect(page.getByRole('link', { name: 'Flat' })).toHaveCount(0);

	// This device is nobody now, and has forgotten its keys
	const left = await page.evaluate(
		() =>
			new Promise<number>((done) => {
				const request = indexedDB.open('keeping-tabs-keys');
				request.onsuccess = () => {
					const count = request.result.transaction('keys').objectStore('keys').count();
					count.onsuccess = () => done(count.result);
				};
			})
	);
	expect(left).toBe(0);

	// The account is still there
	await open(page, '/you/devices');
	await page.getByLabel('Recovery key').fill(recoveryKey);
	await page.getByRole('button', { name: 'Restore' }).click();
	await expect(page.getByRole('status')).toContainText('Welcome back');
	await open(page, groupUrl);
	await expect(page.getByTestId('identity')).toHaveText('Anna');
});
