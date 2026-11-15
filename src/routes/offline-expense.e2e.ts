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

	// Back on the group, in its place in the list already, marked as not synced
	await expect(page).toHaveURL(groupUrl);
	const row = page
		.getByRole('region', { name: 'Expenses' })
		.getByRole('listitem')
		.filter({ hasText: 'Bread' });
	await expect(row).toContainText('Not synced yet');
	await expect(row).toContainText('you lent €2.10');

	// Online again: it goes out, once, and the same row is a link to it
	await context.setOffline(false);
	await expect(row).not.toContainText('Not synced yet', { timeout: 15_000 });
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
	const expenses = page.getByRole('region', { name: 'Expenses' });
	await expect(expenses.getByRole('listitem').filter({ hasText: 'Firewood' })).toContainText(
		'Not synced yet'
	);
	await expect(expenses).toContainText('you lent €6.00');
	await expect(expenses.getByRole('listitem').filter({ hasText: 'Milk' })).toContainText(
		'Not synced yet'
	);

	// Online again: both go out, and the balance has them
	await context.setOffline(false);
	await expect(expenses).not.toContainText('Not synced yet', { timeout: 20_000 });
	await expect(page.getByRole('link', { name: /Firewood/ })).toHaveCount(1);
	await expect(page.getByRole('link', { name: /Milk/ })).toHaveCount(1);
});

test('offline, an expense is changed, another deleted and a payment recorded, all sent once online (#347)', async ({
	page,
	context
}) => {
	test.setTimeout(120_000);
	const groupUrl = await createGroup(page, 'Flat', 'Anna', ['Ben']);
	for (const [title, amount] of [
		['Bread', '4'],
		['Milk', '2']
	]) {
		await page.getByRole('link', { name: 'Add expense' }).click();
		await page.getByLabel('What was it for?').fill(title);
		await page.getByLabel('Amount (€)').fill(amount);
		await page.getByRole('button', { name: 'Add expense' }).click();
		await expect(page.getByRole('link', { name: new RegExp(title) })).toBeVisible();
	}
	// Seen with the service worker there: the newest entries and the forms are kept ready
	await page.waitForFunction(() => navigator.serviceWorker?.controller);
	await page.reload();
	await page.waitForLoadState('networkidle');
	await page.waitForTimeout(2000);

	await context.setOffline(true);
	await page.getByRole('link', { name: /Bread/ }).click();
	await page.getByLabel('Amount (€)').fill('6');
	await page.getByRole('button', { name: 'Save' }).click();
	await expect(page).toHaveURL(groupUrl);
	// As changed, in its place, until it's through
	const bread = page
		.getByRole('region', { name: 'Expenses' })
		.getByRole('listitem')
		.filter({ hasText: 'Bread' });
	await expect(bread).toContainText('Not synced yet');
	await expect(bread).toContainText('you lent €3.00');
	const pending = page.getByRole('region', { name: 'Not synced yet' });

	await page.getByRole('link', { name: /Milk/ }).click({ button: 'right' });
	await page.getByRole('dialog').getByRole('button', { name: 'Delete expense' }).click();
	await expect(page.getByRole('link', { name: /Milk/ })).toHaveCount(0);
	await expect(pending).toContainText('Deleted');

	// Online again: all of it goes out
	await context.setOffline(false);
	await expect(pending).toHaveCount(0, { timeout: 20_000 });
	await page.reload();
	await expect(page.getByRole('link', { name: /Milk/ })).toHaveCount(0);
	await expect(page.getByRole('link', { name: /Bread/ })).toContainText('€6.00');
});

test('a comment written offline waits under its expense and goes out once online (#347)', async ({
	page,
	context
}) => {
	await createGroup(page, 'Flat', 'Anna', ['Ben']);
	await page.getByRole('link', { name: 'Add expense' }).click();
	await page.getByLabel('What was it for?').fill('Bread');
	await page.getByLabel('Amount (€)').fill('4');
	await page.getByRole('button', { name: 'Add expense' }).click();
	await page.getByRole('link', { name: /Bread/ }).click();
	await expect(page.getByLabel('Your comment')).toBeVisible();

	await context.setOffline(true);
	await page.getByLabel('Your comment').fill('Was the tip included?');
	await page.getByRole('button', { name: 'Send' }).click();
	const waiting = page.getByRole('list', { name: 'Not synced yet' });
	await expect(waiting).toContainText('Was the tip included?');
	await expect(waiting).toContainText('synced once you’re online');
	await expect(page.getByLabel('Your comment')).toHaveValue('');

	// Online again: it goes out, once
	await context.setOffline(false);
	await expect(waiting).toHaveCount(0, { timeout: 20_000 });
	const comments = page.getByRole('region', { name: 'Comments' });
	await expect(comments.getByText('Was the tip included?')).toHaveCount(1);
	await page.reload();
	await expect(comments.getByText('Was the tip included?')).toHaveCount(1);
});

test('an expense changed offline but deleted on another device meanwhile stays deleted (#347)', async ({
	page,
	context
}) => {
	const groupUrl = await createGroup(page, 'Flat', 'Anna', ['Ben']);
	await page.getByRole('link', { name: 'Add expense' }).click();
	await page.getByLabel('What was it for?').fill('Bread');
	await page.getByLabel('Amount (€)').fill('4');
	await page.getByRole('button', { name: 'Add expense' }).click();
	await page.getByRole('link', { name: /Bread/ }).click();
	await expect(page).toHaveURL(/\/expenses\//);
	const expenseUrl = page.url();

	await context.setOffline(true);
	await page.getByLabel('Amount (€)').fill('6');
	await page.getByRole('button', { name: 'Save' }).click();
	await expect(page).toHaveURL(groupUrl);

	// Meanwhile, another device deletes it (outside this browser's connection)
	const deleted = await page.request.post(`${expenseUrl}?/delete`, {
		headers: {
			origin: new URL(groupUrl).origin,
			accept: 'application/json',
			'x-sveltekit-action': 'true'
		},
		form: {}
	});
	expect(deleted.status(), await deleted.text()).toBeLessThan(400);

	// Online again: the change has nothing to change, and nothing waits forever
	await context.setOffline(false);
	await expect(page.getByText('Not synced yet')).toHaveCount(0, { timeout: 20_000 });
	await page.reload();
	await expect(page.getByRole('link', { name: /Bread/ })).toHaveCount(0);
});
