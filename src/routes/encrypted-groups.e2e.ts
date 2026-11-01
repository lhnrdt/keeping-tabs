import { expect, test, type Page } from '@playwright/test';
import { createGroup, open, openFold } from './e2e-helpers';

/** Creates an encrypted group with one expense; returns its plain address and full link */
async function encryptedGroup(page: Page) {
	await open(page, '/new');
	await page.getByLabel('Group name').fill('Secret trip');
	await page.getByLabel('Currency').selectOption('EUR');
	await page.getByLabel('Your name').fill('Anna');
	await page.getByLabel('Add a person').fill('Benedikt');
	await page.getByLabel('Add a person').press('Enter');
	await page.getByLabel('Encrypt this group').check();
	await page.getByRole('button', { name: 'Create group' }).click();
	await expect(page.getByTestId('identity')).toHaveText('Anna');
	await expect(page.getByRole('heading', { name: 'Secret trip' })).toBeVisible();
	const groupUrl = page.url().split('#')[0];
	await addExpense(page, 'Whiskey tasting', '30');
	await open(page, `${groupUrl}?tab=group`);
	const link = await fullLink(page);
	return { groupUrl, link };
}

async function addExpense(page: Page, title: string, amount: string) {
	await page.getByRole('link', { name: 'Add expense' }).click();
	await page.getByLabel('What was it for?').fill(title);
	await page.getByLabel('Amount (€)').fill(amount);
	await page.getByRole('button', { name: 'Add expense' }).click();
	await expect(page.getByRole('link', { name: new RegExp(title) })).toBeVisible();
}

async function addPhoto(page: Page) {
	const png = await page.evaluate(() => {
		const canvas = document.createElement('canvas');
		canvas.width = canvas.height = 40;
		canvas.getContext('2d')!.fillRect(0, 0, 40, 40);
		return canvas.toDataURL('image/png').split(',')[1];
	});
	await page.getByLabel('From gallery').setInputFiles({
		name: 'receipt.png',
		mimeType: 'image/png',
		buffer: Buffer.from(png, 'base64')
	});
}

/** The share link with its key, once the device has found it */
async function fullLink(page: Page) {
	const field = page.getByLabel('Share', { exact: true });
	await expect(field).toHaveValue(/#key=/);
	return field.inputValue();
}

const newVisitor = async (page: Page) => {
	const context = await page.context().browser()!.newContext();
	const other = await context.newPage();
	return other;
};

test('the server only sees sealed text; the full link reads it, the bare one is locked (#110)', async ({
	page
}) => {
	const { groupUrl, link } = await encryptedGroup(page);
	expect(new URL(link).hash).toMatch(/^#key=[\w-]{43}$/);
	// A page from before the group was encrypted can't put plain text into it
	const stale = await page.request.post(`${groupUrl}/expenses/new?/save`, {
		headers: { origin: new URL(groupUrl).origin },
		form: { title: 'Plain text', amount: '5' }
	});
	expect(stale.status()).toBe(409);

	// The key is taken out of the address where it's opened
	await open(page, groupUrl);
	await expect(page.getByRole('link', { name: /Whiskey tasting/ })).toBeVisible();

	// What the server sends holds none of it
	const raw = await (await page.request.get(`${groupUrl}/__data.json`)).text();
	for (const secret of ['Secret trip', 'Benedikt', 'Whiskey tasting']) {
		expect(raw).not.toContain(secret);
	}
	expect(raw).toContain('enc1.');

	// Without the key: locked, and pasting the full link opens it
	const bare = await newVisitor(page);
	await open(bare, groupUrl);
	await expect(bare.getByText('This group is encrypted')).toBeVisible();
	await expect(bare.getByText('Whiskey tasting')).toHaveCount(0);
	await bare.getByLabel('The group’s full link').fill(link);
	await expect(bare.getByText('This group is encrypted')).toHaveCount(0);
	await expect(bare.getByRole('heading', { name: 'Join Secret trip' })).toBeVisible();

	// With the full link: readable straight away, and the key leaves the address
	const friend = await newVisitor(page);
	await open(friend, link);
	await friend.getByRole('button', { name: "I'm Benedikt" }).click();
	await expect(friend.getByRole('link', { name: /Whiskey tasting/ })).toBeVisible();
	expect(new URL(friend.url()).hash).toBe('');
});

test('comments, search, a refused form and the downloads work in the browser (#110)', async ({
	page
}) => {
	const { groupUrl } = await encryptedGroup(page);
	await open(page, groupUrl);
	await addExpense(page, 'Train tickets', '12');
	await addExpense(page, '=Snacks, "good" ones', '5');

	// A refused form keeps what was typed, readable
	await page.getByRole('link', { name: 'Add expense' }).click();
	await page.getByLabel('What was it for?').fill('Forgot the amount');
	await page.locator('form:has(input[name="title"])').evaluate((form: HTMLFormElement) => {
		form.noValidate = true;
	});
	await page.getByRole('button', { name: 'Add expense' }).click();
	await expect(page.getByRole('alert').first()).toBeVisible();
	await expect(page.getByLabel('What was it for?')).toHaveValue('Forgot the amount');
	await open(page, groupUrl);

	// Searching happens here: the server can't
	await page.getByRole('searchbox').fill('whiskey');
	await expect(page.getByRole('link', { name: /Whiskey tasting/ })).toBeVisible();
	await expect(page.getByRole('link', { name: /Train tickets/ })).toHaveCount(0);
	await page.getByRole('searchbox').fill('');

	// A comment arrives sealed, and reads normally
	await page.getByRole('link', { name: /Whiskey tasting/ }).click();
	await page.getByLabel('Your comment').fill('Lovely evening');
	await page.getByRole('button', { name: 'Send' }).click();
	await expect(page.getByRole('region', { name: 'Comments' })).toContainText('Lovely evening');
	const raw = await (await page.request.get(`${page.url()}/__data.json`)).text();
	expect(raw).not.toContain('Lovely evening');

	// A photo is stored sealed, and shown opened
	await addPhoto(page);
	await expect(page.locator('img[src^="data:image/jpeg"]').first()).toBeVisible();

	// The downloads are opened before they're saved
	await open(page, `${groupUrl}?tab=group`);
	const csv = page.waitForEvent('download');
	await page.getByRole('link', { name: 'Export as CSV' }).click();
	const csvText = await readDownload(await csv);
	expect(csvText).toContain('Whiskey tasting');
	expect(csvText).not.toContain('enc1.');
	// Quoted as CSV needs, and not able to start a formula
	expect(csvText).toContain(`"'=Snacks, ""good"" ones"`);
	const backup = page.waitForEvent('download');
	await page.getByRole('link', { name: 'Back up (JSON)' }).click();
	const backupText = await readDownload(await backup);
	expect(backupText).toContain('Whiskey tasting');
	expect(backupText).not.toContain('enc1.');

	// No import: the server would read it
	await expect(page.getByRole('link', { name: /Splitwise|Import/ })).toHaveCount(0);
});

async function readDownload(download: import('@playwright/test').Download) {
	const stream = await download.createReadStream();
	const chunks: Buffer[] = [];
	for await (const chunk of stream) chunks.push(chunk as Buffer);
	return Buffer.concat(chunks).toString();
}

test('a device link carries the keys along (#110)', async ({ page, browser }) => {
	const { groupUrl } = await encryptedGroup(page);
	await open(page, '/you/devices');
	await page.locator('summary', { hasText: 'Add another device' }).click();
	await page.getByRole('button', { name: 'Create link' }).click();
	const link = (await page.getByLabel('One-time link').inputValue()).trim();
	expect(new URL(link).hash.length).toBeGreaterThan(1);

	const laptop = await (await browser.newContext()).newPage();
	await open(laptop, link);
	await laptop.getByRole('button', { name: 'Use this device' }).click();
	await expect(laptop.getByRole('button', { name: 'Use this device' })).toHaveCount(0);
	await open(laptop, groupUrl);
	await expect(laptop.getByRole('link', { name: /Whiskey tasting/ })).toBeVisible();
});

test('an existing group can be encrypted, photos and all (#110)', async ({ page }) => {
	const groupUrl = await createGroup(page, 'Old flat', 'Anna', ['Ben']);
	await addExpense(page, 'Couch', '120');
	await page.getByRole('link', { name: /Couch/ }).click();
	await page.getByLabel('Your comment').fill('Heavy thing');
	await page.getByRole('button', { name: 'Send' }).click();
	await expect(page.getByRole('region', { name: 'Comments' })).toContainText('Heavy thing');
	await addPhoto(page);
	await expect(page.getByRole('img', { name: 'Receipt photo 1' })).toBeVisible();
	const expenseUrl = page.url();

	// Cut off halfway: nothing is lost, and trying again finishes with the same key
	await open(page, `${groupUrl}/encrypt`);
	let posts = 0;
	await page.route('**/encrypt/data', (route) =>
		route.request().method() === 'POST' && ++posts === 3 ? route.abort() : route.continue()
	);
	await page.getByRole('button', { name: 'Encrypt the group' }).click();
	await expect(page.getByRole('alert')).toContainText('didn’t finish');
	await page.unroute('**/encrypt/data');
	await page.getByRole('button', { name: 'Encrypt the group' }).click();
	const field = page.getByLabel('Share', { exact: true });
	await expect(field).toHaveValue(/#key=/, { timeout: 15_000 });
	const link = await field.inputValue();

	const raw = await (await page.request.get(`${groupUrl}/__data.json`)).text();
	for (const secret of ['Old flat', 'Couch', 'Ben']) expect(raw).not.toContain(secret);
	const history = await (await page.request.get(`${groupUrl}/activity/__data.json`)).text();
	expect(history).not.toContain('Couch');

	await open(page, groupUrl);
	await expect(page.getByRole('link', { name: /Couch/ })).toBeVisible();
	await page.getByRole('link', { name: /Couch/ }).click();
	await expect(page.getByRole('region', { name: 'Comments' })).toContainText('Heavy thing');
	// The photo too, though the browser had kept it from before
	await open(page, expenseUrl);
	await expect(page.locator('img[src^="data:image/jpeg"]').first()).toBeVisible();

	// Someone else can read it with the new link, and it can't be encrypted twice
	const friend = await newVisitor(page);
	await open(friend, link);
	await friend.getByRole('button', { name: "I'm Ben" }).click();
	await expect(friend.getByRole('link', { name: /Couch/ })).toBeVisible();
	await open(page, `${groupUrl}?tab=group`);
	await expect(page.getByRole('link', { name: 'Encryption' })).toHaveCount(0);
});

test('a recovery key brings the keys back on a new device (#110)', async ({ page, browser }) => {
	const { groupUrl } = await encryptedGroup(page);
	await open(page, '/you/backup');
	await openFold(page, 'Recovery key');
	const sent: string[] = [];
	page.on('request', (request) => sent.push(request.postData() ?? ''));
	await page.getByRole('button', { name: 'Create recovery key' }).click();
	const recoveryKey = (await page.getByTestId('recovery-key').innerText()).trim();
	// Made in the browser: the server never gets the key itself
	expect(sent.join()).toContain('recoveryProof');
	expect(sent.join()).not.toContain(recoveryKey);

	const newPhone = await (await browser.newContext()).newPage();
	await open(newPhone, '/device');
	const restoring: string[] = [];
	newPhone.on('request', (request) => restoring.push(request.postData() ?? ''));
	await newPhone.getByLabel('Recovery key').fill(recoveryKey);
	await newPhone.getByRole('button', { name: 'Restore' }).click();
	await expect(newPhone.getByRole('status')).toContainText('Welcome back');
	expect(restoring.join()).not.toContain(recoveryKey);
	expect(restoring.join()).not.toContain(recoveryKey.replace(/-/g, ''));
	await open(newPhone, groupUrl);
	await expect(newPhone.getByRole('link', { name: /Whiskey tasting/ })).toBeVisible();
});
