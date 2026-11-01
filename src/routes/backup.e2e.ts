import { expect, test } from '@playwright/test';
import { createGroup, open } from './e2e-helpers';

test('a group backed up and restored as a new group, with a new link (#57)', async ({ page }) => {
	const groupUrl = await createGroup(page, 'Flat', 'Anna', ['Ben']);
	await page.getByRole('link', { name: 'Add expense' }).click();
	await page.getByLabel('What was it for?').fill('Dinner');
	await page.getByLabel('Amount (€)').fill('30');
	await page.getByRole('button', { name: 'Add expense' }).click();
	await expect(page).toHaveURL(groupUrl);
	await page.getByRole('link', { name: 'Add expense' }).click();
	await page.getByLabel('What was it for?').fill('Rent');
	await page.getByLabel('Amount (€)').fill('600');
	await page.getByLabel('Repeats').selectOption({ label: 'Every month' });
	await page.getByRole('button', { name: 'Add expense' }).click();
	await expect(page).toHaveURL(groupUrl);
	await page.getByRole('link', { name: /Dinner/ }).click();
	await page.getByLabel('Your comment').fill('With tip');
	await page.getByRole('button', { name: 'Send' }).click();
	await expect(page.getByRole('region', { name: 'Comments' })).toContainText('With tip');

	await open(page, `${groupUrl}?tab=group`);
	await expect(page.getByRole('link', { name: 'Back up (JSON)' })).toBeVisible();
	const response = await page.request.get(`${groupUrl}/backup`);
	const text = await response.text();
	const backup = JSON.parse(text);
	expect(backup.members.map((member: { name: string }) => member.name)).toEqual(['Anna', 'Ben']);
	// Nothing of who someone is, and not the group's link
	expect(text).not.toContain(new URL(groupUrl).pathname.split('/').at(-1)!);
	expect(text).not.toContain('personId');

	await open(page, '/new');
	await page.getByRole('link', { name: 'Restore from a backup' }).click();

	// A damaged file changes nothing
	await page.getByLabel('Backup file').setInputFiles({
		name: 'broken.json',
		mimeType: 'application/json',
		buffer: Buffer.from('{"format":"nope"}')
	});
	await page.getByRole('button', { name: 'Restore group' }).click();
	await expect(page.getByRole('alert')).toContainText('backup');

	await page.getByLabel('Backup file').setInputFiles({
		name: 'flat.json',
		mimeType: 'application/json',
		buffer: Buffer.from(text)
	});
	await page.getByRole('button', { name: 'Restore group' }).click();
	await page.waitForURL((url) => url.pathname.startsWith('/g/') && url.href !== groupUrl);
	expect(page.url()).not.toBe(groupUrl);

	// Everyone chooses who they are again, then it's all there
	await page.getByRole('button', { name: "I'm Anna" }).click();
	await expect(page.getByTestId('identity')).toHaveText('Anna');
	await expect(page.getByRole('link', { name: /Dinner/ })).toContainText('1 comment');
	await page.getByRole('link', { name: /Dinner/ }).click();
	await expect(page.getByRole('region', { name: 'Comments' })).toContainText('With tip');
	await page.goBack();
	await page.getByRole('link', { name: 'Group' }).click();
	await expect(page.getByRole('region', { name: 'Repeating expenses' })).toContainText('Rent');
});
