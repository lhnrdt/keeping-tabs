import { expect, test } from '@playwright/test';
import { acceptNote, createGroup, open } from './e2e-helpers';

test('a password in front of a group: asked once per device, changeable, removable (A-8 – A-11)', async ({
	page,
	browser
}) => {
	const groupUrl = await createGroup(page, 'Secret flat', 'Anna', ['Ben']);
	await open(page, `${groupUrl}?tab=group`);
	await page.getByRole('button', { name: 'Set a password' }).click();
	const dialog = page.getByRole('dialog', { name: 'Set a password' });
	await dialog.getByLabel('Group password').fill('tulip');
	await dialog.getByRole('button', { name: 'Save' }).click();
	await expect(page.getByRole('button', { name: 'Change the password' })).toBeVisible();

	// Whoever set it isn't asked
	await page.reload();
	await expect(page.getByRole('heading', { name: 'Secret flat' })).toBeVisible();

	// Someone else with the link sees nothing of the group, not even its name or its data
	const context = await browser.newContext();
	const ben = await context.newPage();
	await ben.goto(groupUrl);
	await acceptNote(ben);
	await expect(ben).toHaveURL(/\/unlock\//);
	await expect(ben.getByText('Secret flat')).toHaveCount(0);
	for (const path of ['/backup', '/export', '/changes', '/entries']) {
		const response = await context.request.get(`${groupUrl}${path}`, { maxRedirects: 0 });
		expect(response.status(), path).toBe(303);
	}
	// A page's data request gets its redirect as data, and nothing else
	const data = await context.request.get(`${groupUrl}/__data.json`, { maxRedirects: 0 });
	expect(await data.json()).toMatchObject({ type: 'redirect' });
	expect(await data.text()).not.toContain('Secret flat');

	await ben.getByLabel('Group password').fill('wrong');
	await ben.getByRole('button', { name: 'Enter' }).click();
	await expect(ben.getByRole('alert')).toContainText('not the password');
	await ben.getByLabel('Group password').fill('tulip');
	await ben.getByRole('button', { name: 'Enter' }).click();
	await expect(ben.getByRole('heading', { name: 'Secret flat' })).toBeVisible();
	await ben.reload();
	await expect(ben.getByRole('heading', { name: 'Secret flat' })).toBeVisible();

	// A new password asks everyone again
	await page.getByRole('button', { name: 'Change the password' }).click();
	const change = page.getByRole('dialog', { name: 'Change the password' });
	await change.getByLabel('Group password').fill('crocus');
	await change.getByRole('button', { name: 'Save' }).click();
	await expect(change).toHaveCount(0);
	await ben.reload();
	await expect(ben).toHaveURL(/\/unlock\//);

	// Removed, it's open again; both are in the activity
	await page.getByRole('button', { name: 'Remove the password' }).click();
	await expect(page.getByRole('button', { name: 'Set a password' })).toBeVisible();
	await ben.goto(groupUrl);
	await expect(ben.getByRole('heading', { name: 'Secret flat' })).toBeVisible();
	await page.goto(`${groupUrl}/activity`);
	await expect(page.getByText('Anna removed the group’s password')).toBeVisible();
	await expect(page.getByText('Anna set a password for the group').first()).toBeVisible();
});
