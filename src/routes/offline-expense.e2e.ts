import { expect, test } from '@playwright/test';
import { createGroup } from './e2e-helpers';

test('an expense added without a connection waits on the device and goes out later (#55)', async ({
	page,
	context
}) => {
	const groupUrl = await createGroup(page, 'Flat', 'Anna', ['Ben']);
	// The service worker keeps the group for offline use
	await page.waitForFunction(() => navigator.serviceWorker?.controller);
	await page.reload();
	await page.getByRole('link', { name: 'Add expense' }).click();
	await page.getByLabel('What was it for?').fill('Bread');
	await page.getByLabel('Amount (EUR)').fill('4.20');

	await context.setOffline(true);
	await page.getByRole('button', { name: 'Add expense' }).click();

	// Back on the group, waiting with a spinner, nothing to type again
	await expect(page).toHaveURL(groupUrl);
	const pending = page.getByRole('region', { name: 'Not sent yet' });
	await expect(pending).toContainText('Bread');
	await expect(pending).toContainText('Waiting for a connection');

	// Online again: it goes out, once
	await context.setOffline(false);
	await expect(pending).toHaveCount(0, { timeout: 15_000 });
	await expect(page.getByRole('link', { name: /Bread/ })).toHaveCount(1);
	await page.reload();
	await expect(page.getByRole('link', { name: /Bread/ })).toHaveCount(1);
});
