import { expect, test } from '@playwright/test';
import { acceptNote, createGroup, enterPassword, open } from './e2e-helpers';

test('the start page asks for the password once per device', async ({ browser }) => {
	const page = await (await browser.newContext()).newPage();
	const response = await page.goto('/new');
	await expect(page).toHaveURL(/\/welcome\?next=%2Fnew$/);
	expect(response?.headers()['x-robots-tag']).toBe('noindex, nofollow');
	await expect(page.getByRole('heading', { name: 'Just for friends' })).toBeVisible();

	await enterPassword(page, 'guess');
	await expect(page.getByRole('alert')).toContainText("That's not it");

	await enterPassword(page);
	await expect(page).toHaveURL(/\/new$/);
	await page.goto('/settings');
	await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();
});

test('a group link is an invitation: no password, and afterwards the app is open', async ({
	page,
	browser
}) => {
	const groupUrl = await createGroup(page, 'Picnic', 'Anna', ['Ben']);

	const ben = await (await browser.newContext()).newPage();
	await ben.goto(groupUrl);
	await acceptNote(ben);
	await expect(ben.getByRole('heading', { name: 'Join Picnic' })).toBeVisible();
	await ben.getByRole('button', { name: "I'm Ben" }).click();
	await expect(ben.getByTestId('identity')).toHaveText('Ben');

	// Ben belongs to a group now, so the start page lets him in too
	await ben.goto('/');
	await expect(ben).toHaveURL(/\/$/);
	await expect(ben.getByRole('link', { name: 'Picnic' })).toBeVisible();
});

test('robots stay out', async ({ request }) => {
	expect(await (await request.get('/robots.txt')).text()).toContain('Disallow: /');
});

test('open() gets through the door like a friend', async ({ page }) => {
	await open(page, '/');
	await expect(page.getByRole('link', { name: 'New group' })).toBeVisible();
});
