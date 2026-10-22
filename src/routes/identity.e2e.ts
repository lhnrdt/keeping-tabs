import { expect, test, type Browser, type Page } from '@playwright/test';

// Each browser context is a separate device with its own identity cookie (A-12).

async function newDevice(browser: Browser) {
	return (await browser.newContext()).newPage();
}

async function open(page: Page, url: string) {
	await page.goto(url);
	await page.waitForLoadState('networkidle');
}

const whoAreYou = (page: Page) => page.getByRole('dialog', { name: 'Who are you?' });

test('members can only be claimed once, freed up, and identities move between devices', async ({
	browser
}) => {
	// Anna creates the group and is its first member
	const anna = await newDevice(browser);
	await open(anna, '/');
	await anna.getByLabel('Group name').fill('Flat');
	await anna.getByLabel('Your name').fill('Anna');
	await anna.getByLabel('Add a person').fill('Ben');
	await anna.getByLabel('Add a person').press('Enter');
	await anna.getByRole('button', { name: 'Create group' }).click();
	await expect(anna.getByTestId('identity')).toHaveText('Anna');
	const groupUrl = anna.url();

	// Ben's device can't be Anna (A-4), so it claims Ben
	const ben = await newDevice(browser);
	await open(ben, groupUrl);
	await expect(ben.getByRole('button', { name: 'Anna (taken)' })).toBeDisabled();
	await ben.getByRole('button', { name: 'Ben', exact: true }).click();
	await expect(ben.getByTestId('identity')).toHaveText('Ben');

	// Anna sees Ben joined and frees him up, e.g. after he lost his phone (A-15)
	await open(anna, `${groupUrl}?tab=group`);
	const members = anna.getByRole('region', { name: 'Members' });
	await expect(members.getByRole('button', { name: 'Rename Ben' })).toContainText('joined');
	await members.getByRole('button', { name: 'Rename Ben' }).click();
	await anna
		.getByRole('dialog', { name: 'Rename Ben' })
		.getByRole('button', { name: 'Free up' })
		.click();
	await expect(members.getByRole('button', { name: 'Rename Ben' })).not.toContainText('joined');

	// Ben's device no longer has a member and is asked again
	await open(ben, groupUrl);
	await expect(whoAreYou(ben)).toBeVisible();

	// A one-time link makes a new device Anna in all her groups (A-14)
	await open(anna, '/device');
	await anna.getByRole('button', { name: 'Create link' }).click();
	const link = await anna.getByRole('listitem', { name: 'One-time link' }).innerText();
	const annasLaptop = await newDevice(browser);
	await open(annasLaptop, link.trim());
	await annasLaptop.getByRole('button', { name: 'Use this device' }).click();
	await expect(annasLaptop).toHaveURL(/\/$/);
	await open(annasLaptop, groupUrl);
	await expect(annasLaptop.getByTestId('identity')).toHaveText('Anna');

	// The link works only once
	const stranger = await newDevice(browser);
	await open(stranger, link.trim());
	await stranger.getByRole('button', { name: 'Use this device' }).click();
	await expect(stranger.getByRole('alert')).toContainText('expired or was already used');

	// Anna's name is remembered for her next group (A-13)
	await open(anna, '/');
	await expect(anna.getByLabel('Your name')).toHaveValue('Anna');
});
