import { expect, test } from '@playwright/test';
import { createGroup, open } from './e2e-helpers';

test('a new person reads the friendly note once, also from a group link', async ({
	page,
	browser
}) => {
	const groupUrl = await createGroup(page, 'Picnic', 'Anna', ['Ben']);

	// Ben comes with the group link: the note is the first thing he sees
	const ben = await (await browser.newContext()).newPage();
	await ben.goto(groupUrl);
	const note = ben.getByRole('dialog', { name: 'Good to know' });
	await expect(note).toContainText('visible to admins');
	await note.getByRole('button', { name: 'Got it' }).click();
	await expect(note).toHaveCount(0);
	await expect(ben).toHaveURL(groupUrl);

	// Not again, on this device
	await ben.getByRole('button', { name: "I'm Ben" }).click();
	await expect(ben.getByTestId('identity')).toHaveText('Ben');
	await ben.reload();
	await expect(note).toHaveCount(0);
});

test('people who read it on one device are not asked on their others', async ({ browser }) => {
	const phone = await (await browser.newContext()).newPage();
	// open() reads the note like a friend; creating a group makes Anna someone
	await open(phone, '/new');
	await phone.getByLabel('Group name').fill('Cabin');
	await phone.getByLabel('Your name').fill('Anna');
	await phone.getByRole('button', { name: 'Create group' }).click();
	await expect(phone.getByTestId('identity')).toHaveText('Anna');

	await open(phone, '/device');
	await phone.getByRole('button', { name: 'Create link' }).click();
	const link = (await phone.getByRole('listitem', { name: 'One-time link' }).innerText()).trim();
	const laptop = await (await browser.newContext()).newPage();
	await laptop.goto(link);
	// A device link is an invitation too, and the note shows before the device is Anna
	await laptop.getByRole('button', { name: 'Got it' }).click();
	await laptop.getByRole('button', { name: 'Use this device' }).click();
	await expect(laptop).toHaveURL(/\/$/);
	await expect(laptop.getByRole('dialog', { name: 'Good to know' })).toHaveCount(0);
});
