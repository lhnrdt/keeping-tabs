import { expect, test, type Browser, type Page } from '@playwright/test';
import { open } from './e2e-helpers';

// Each browser context is a separate device with its own identity cookie (A-12).

async function newDevice(browser: Browser) {
	return (await browser.newContext()).newPage();
}

const whoAreYou = (page: Page) => page.getByRole('dialog', { name: 'Who are you?' });

test('members can only be claimed once, freed up, and identities move between devices and recover', async ({
	browser
}) => {
	// Anna creates the group and is its first member
	const anna = await newDevice(browser);
	await open(anna, '/new');
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
