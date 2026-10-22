import { expect, test, type Browser, type Page } from '@playwright/test';
import { open } from './e2e-helpers';

// Each browser context is a separate device with its own identity cookie (A-12).

async function newDevice(browser: Browser) {
	return (await browser.newContext()).newPage();
}

const joinScreen = (page: Page) => page.getByRole('heading', { name: /^Join / });

test('join as yourself, stay yourself, rejoin after losing access, and identities move between devices', async ({
	browser
}) => {
	// Several devices and many steps: more than the default 30 s under load
	test.setTimeout(60_000);
	// Anna creates the group, adds Ben, and is its first member
	const anna = await newDevice(browser);
	await open(anna, '/new');
	await anna.getByLabel('Group name').fill('Flat');
	await anna.getByLabel('Your name').fill('Anna');
	await anna.getByLabel('Add a person').fill('Ben');
	await anna.getByLabel('Add a person').press('Enter');
	await anna.getByRole('button', { name: 'Create group' }).click();
	await expect(anna.getByTestId('identity')).toHaveText('Anna');
	const groupUrl = anna.url();

	// Ben opens the link: Anna is already here, Ben is one tap away (A-4)
	const ben = await newDevice(browser);
	await open(ben, groupUrl);
	await expect(joinScreen(ben)).toHaveText('Join Flat');
	await expect(ben.getByRole('list', { name: 'Already here' })).toHaveText(/Anna/);
	await ben.getByRole('button', { name: "I'm Ben" }).click();
	await expect(ben.getByTestId('identity')).toHaveText('Ben');

	// Ben can still step back, until he adds something; then it's him for good (A-5)
	await ben.getByTestId('identity').click();
	await expect(ben.getByRole('button', { name: 'Not you? Switch' })).toBeVisible();
	await ben.getByRole('button', { name: 'Close' }).click();
	await ben.getByRole('link', { name: 'Add expense' }).click();
	await ben.getByLabel('What was it for?').fill('Bread');
	await ben.getByLabel('Amount (EUR)').fill('4');
	await ben.getByRole('button', { name: 'Add expense' }).click();
	await expect(ben).toHaveURL(groupUrl);
	await ben.getByTestId('identity').click();
	await expect(ben.getByRole('dialog', { name: "You're Ben in this group" })).toContainText(
		"That's you here now"
	);
	await expect(ben.getByRole('button', { name: 'Not you? Switch' })).toHaveCount(0);
	await ben.getByRole('button', { name: 'Close' }).click();

	// Ben lost his phone: Anna lets him join again (A-15)
	await open(anna, `${groupUrl}?tab=group`);
	const people = anna.getByRole('list', { name: 'Members' });
	await expect(people.getByRole('button', { name: 'Ben: options' })).not.toContainText(
		'not here yet'
	);
	await people.getByRole('button', { name: 'Ben: options' }).click();
	await anna.getByRole('button', { name: 'Ben lost access: let them join again' }).click();
	await expect(people.getByRole('button', { name: 'Ben: options' })).toContainText('not here yet');

	// Ben's old device is asked again, like a new one
	await open(ben, groupUrl);
	await expect(joinScreen(ben)).toBeVisible();

	// A one-time link makes a new device Anna in all her groups (A-14)
	await open(anna, '/device');
	await anna.getByRole('button', { name: 'Create link' }).click();
	const link = await anna.getByRole('listitem', { name: 'One-time link' }).innerText();
	const annasLaptop = await newDevice(browser);
	await open(annasLaptop, link.trim());
	await annasLaptop.getByRole('button', { name: 'Use this device' }).click();
	await expect(annasLaptop).toHaveURL(/\/$/);
	// Her groups come along from the server (A-17)
	await expect(annasLaptop.getByRole('link', { name: 'Flat' })).toBeVisible();
	await open(annasLaptop, groupUrl);
	await expect(annasLaptop.getByTestId('identity')).toHaveText('Anna');

	// The link works only once
	const stranger = await newDevice(browser);
	await open(stranger, link.trim());
	await stranger.getByRole('button', { name: 'Use this device' }).click();
	await expect(stranger.getByRole('alert')).toContainText('expired or was already used');

	// A recovery key brings Anna back on a fresh browser after losing everything (A-16)
	await open(anna, '/device');
	await anna.getByRole('button', { name: 'Create recovery key' }).click();
	const recoveryKey = (await anna.getByTestId('recovery-key').innerText()).trim();
	const newPhone = await newDevice(browser);
	await open(newPhone, '/device');
	await newPhone.getByLabel('Recovery key').fill(recoveryKey.toLowerCase().replace(/-/g, ' '));
	await newPhone.getByRole('button', { name: 'Restore' }).click();
	await expect(newPhone.getByRole('status')).toContainText('Welcome back');
	await open(newPhone, '/');
	await expect(newPhone.getByRole('link', { name: 'Flat' })).toBeVisible();
	await open(newPhone, groupUrl);
	await expect(newPhone.getByTestId('identity')).toHaveText('Anna');

	// Anna's name is remembered for her next group (A-13)
	await open(anna, '/new');
	await expect(anna.getByLabel('Your name')).toHaveValue('Anna');
});

/** A simulated platform authenticator with a fingerprint reader (Chromium's WebAuthn emulation). */
async function addAuthenticator(page: Page) {
	const cdp = await page.context().newCDPSession(page);
	await cdp.send('WebAuthn.enable');
	const { authenticatorId } = await cdp.send('WebAuthn.addVirtualAuthenticator', {
		options: {
			protocol: 'ctap2',
			transport: 'internal',
			hasResidentKey: true,
			hasUserVerification: true,
			isUserVerified: true,
			automaticPresenceSimulation: true
		}
	});
	return { cdp, authenticatorId };
}

test('a synced passkey brings you and your groups back on a new device', async ({ browser }) => {
	const phone = await newDevice(browser);
	const phoneKeys = await addAuthenticator(phone);
	await open(phone, '/new');
	await phone.getByLabel('Group name').fill('Holiday');
	await phone.getByLabel('Your name').fill('Mia');
	await phone.getByRole('button', { name: 'Create group' }).click();
	await expect(phone.getByTestId('identity')).toHaveText('Mia');
	const groupUrl = phone.url();

	await open(phone, '/device');
	await phone.getByRole('button', { name: 'Save as passkey' }).click();
	await expect(phone.getByRole('status')).toContainText('1 passkey');

	// The platform syncs the passkey to Mia's new laptop (A-18)
	const { credentials } = await phoneKeys.cdp.send('WebAuthn.getCredentials', {
		authenticatorId: phoneKeys.authenticatorId
	});
	const laptop = await newDevice(browser);
	const laptopKeys = await addAuthenticator(laptop);
	for (const credential of credentials) {
		await laptopKeys.cdp.send('WebAuthn.addCredential', {
			authenticatorId: laptopKeys.authenticatorId,
			credential
		});
	}

	await open(laptop, '/device');
	await laptop.getByRole('button', { name: 'Continue with passkey' }).click();
	await expect(laptop).toHaveURL(/\/$/);
	await expect(laptop.getByRole('link', { name: 'Holiday' })).toBeVisible();
	await open(laptop, groupUrl);
	await expect(laptop.getByTestId('identity')).toHaveText('Mia');
});

test('join as someone new, without picking someone else, and remove people who are settled', async ({
	browser
}) => {
	const anna = await newDevice(browser);
	await open(anna, '/new');
	await anna.getByLabel('Group name').fill('Trip');
	await anna.getByLabel('Your name').fill('Anna');
	await anna.getByLabel('Add a person').fill('Ben');
	await anna.getByLabel('Add a person').press('Enter');
	await anna.getByRole('button', { name: 'Create group' }).click();
	await expect(anna.getByTestId('identity')).toHaveText('Anna');
	const groupUrl = anna.url();

	// "Ben Becker" looks like Ben, so it asks first
	const ben = await newDevice(browser);
	await open(ben, groupUrl);
	await ben.getByRole('button', { name: "I'm someone else" }).click();
	await ben.getByLabel('Your name').fill('Ben Becker');
	await expect(ben.getByText('Are you Ben?')).toBeVisible();
	await ben.getByRole('button', { name: "Yes, I'm Ben" }).click();
	await expect(ben.getByTestId('identity')).toHaveText('Ben');

	// Cara wasn't added by anyone and joins under her own name
	const cara = await newDevice(browser);
	await open(cara, groupUrl);
	await expect(cara.getByRole('button', { name: /^I'm / })).toHaveCount(0);
	await cara.getByLabel('Your name').fill('Cara');
	await cara.getByRole('button', { name: 'Join' }).click();
	await expect(cara.getByTestId('identity')).toHaveText('Cara');

	// Anna can remove Cara, who is settled, but not someone who owes money (M-6)
	await open(anna, groupUrl);
	await anna.getByRole('link', { name: 'Add expense' }).click();
	await anna.getByLabel('What was it for?').fill('Fuel');
	await anna.getByLabel('Amount (EUR)').fill('30');
	const participants = anna.getByRole('group', { name: 'Split equally between' });
	await participants.getByText('Cara').click();
	await anna.getByRole('button', { name: 'Add expense' }).click();
	await expect(anna).toHaveURL(groupUrl);

	await open(anna, `${groupUrl}?tab=group`);
	const people = anna.getByRole('list', { name: 'Members' });
	await people.getByRole('button', { name: 'Ben: options' }).click();
	await expect(
		anna.getByRole('button', { name: 'Ben can be removed once settled up' })
	).toBeDisabled();
	await anna.getByRole('button', { name: 'Cancel' }).click();
	await people.getByRole('button', { name: 'Cara: options' }).click();
	await anna.getByRole('button', { name: 'Remove from group' }).click();
	await expect(people.getByText('Cara')).toHaveCount(0);
});
