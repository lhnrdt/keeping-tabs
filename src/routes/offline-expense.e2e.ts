import { expect, test } from '@playwright/test';
import { createGroup, open } from './e2e-helpers';

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
	await page.getByLabel('Amount (€)').fill('4.20');

	await context.setOffline(true);
	await page.getByRole('button', { name: 'Add expense' }).click();

	// Back on the group, waiting with a spinner, nothing to type again
	await expect(page).toHaveURL(groupUrl);
	const pending = page.getByRole('region', { name: 'Not synced yet' });
	await expect(pending).toContainText('Bread');
	await expect(pending).toContainText('synced once you’re online');

	// Online again: it goes out, once
	await context.setOffline(false);
	await expect(pending).toHaveCount(0, { timeout: 15_000 });
	await expect(page.getByRole('link', { name: /Bread/ })).toHaveCount(1);
	await page.reload();
	await expect(page.getByRole('link', { name: /Bread/ })).toHaveCount(1);
});

test('completely offline: the app opens, and expenses are added on a form never opened before (#347)', async ({
	page,
	context
}) => {
	test.setTimeout(90_000);
	await open(page, '/new');
	await page.getByLabel('Group name').fill('Cabin');
	await page.getByLabel('Your name').fill('Anna');
	await page.getByLabel('Add a person').fill('Ben');
	await page.getByLabel('Add a person').press('Enter');
	await page.getByRole('button', { name: 'Create group' }).click();
	await expect(page.getByTestId('identity')).toHaveText('Anna');
	const groupUrl = page.url();
	// Seen once with the service worker there: the group's form and the start screen are kept too
	await page.waitForFunction(() => navigator.serviceWorker?.controller);
	await page.reload();
	await page.waitForLoadState('networkidle');

	await context.setOffline(true);
	await page.goto('/');
	await page.getByRole('link', { name: /Cabin/ }).click();
	await expect(page).toHaveURL(groupUrl);
	for (const [title, amount] of [
		['Firewood', '12'],
		['Milk', '2']
	]) {
		await page.getByRole('link', { name: 'Add expense' }).click();
		await page.getByLabel('What was it for?').fill(title);
		await page.getByLabel('Amount (€)').fill(amount);
		await page.getByRole('button', { name: 'Add expense' }).click();
		await expect(page).toHaveURL(groupUrl);
	}
	const pending = page.getByRole('region', { name: 'Not synced yet' });
	await expect(pending).toContainText('Firewood');
	await expect(pending).toContainText('€12.00');
	await expect(pending).toContainText('Milk');

	// Online again: both go out, and the balance has them
	await context.setOffline(false);
	await expect(pending).toHaveCount(0, { timeout: 20_000 });
	await expect(page.getByRole('link', { name: /Firewood/ })).toHaveCount(1);
	await expect(page.getByRole('link', { name: /Milk/ })).toHaveCount(1);
});
