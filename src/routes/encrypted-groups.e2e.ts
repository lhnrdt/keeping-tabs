import { expect, test, type Page } from '@playwright/test';
import { choose, createGroup, open, openFold } from './e2e-helpers';

// Sealing, and several devices: these take longer than most
test.describe.configure({ timeout: 90_000 });

const EXPORT = new URL('./fixtures/splitwise-export.csv', import.meta.url).pathname;

/** Creates an encrypted group with one expense; returns its plain address and full link */
async function encryptedGroup(page: Page) {
	await open(page, '/new');
	await page.getByLabel('Group name').fill('Secret trip');
	await page.getByLabel('Currency').selectOption('EUR');
	await page.getByLabel('Your name').fill('Anna');
	await page.getByLabel('Add a person').fill('Benedikt');
	await page.getByLabel('Add a person').press('Enter');
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
	await expect(bare.getByText('Open this group with its link')).toBeVisible();
	await expect(bare.getByText('Whiskey tasting')).toHaveCount(0);
	await bare.getByLabel('The group’s link').fill(link);
	await expect(bare.getByText('Open this group with its link')).toHaveCount(0);
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
	expect(csvText).toContain('30.00');
	expect(csvText).not.toContain('enc1.');
	// Quoted as CSV needs, and not able to start a formula
	expect(csvText).toContain(`"'=Snacks, ""good"" ones"`);
	const backup = page.waitForEvent('download');
	await page.getByRole('link', { name: 'Back up (JSON)' }).click();
	const backupText = await readDownload(await backup);
	expect(backupText).toContain('Whiskey tasting');
	expect(backupText).not.toContain('enc1.');

	// An import is read and sealed here too
	await page.getByRole('link', { name: 'Import from Splitwise' }).click();
	await page.getByLabel('Splitwise export (CSV)').setInputFiles(EXPORT);
	await page.getByRole('button', { name: 'Import' }).click();
	await expect(page.getByRole('link', { name: /Pizza, Wein/ })).toBeVisible();
	const after = await (await page.request.get(`${groupUrl}/__data.json`)).text();
	expect(after).not.toContain('Pizza, Wein');
	expect(after).not.toContain('Benedikt');
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
	// Its groups are readable from the start, not only once one of them has been opened
	await open(laptop, '/');
	await expect(laptop.getByRole('link', { name: /Secret trip/ })).toBeVisible();
	await expect(laptop.locator('body')).not.toContainText('••••••');
	await open(laptop, groupUrl);
	await expect(laptop.getByRole('link', { name: /Whiskey tasting/ })).toBeVisible();
});

test('an existing group gets encrypted by itself, and nobody has to do anything (#110)', async ({
	page,
	browser
}) => {
	const groupUrl = await createGroup(page, 'Old flat', 'Anna', ['Ben']);
	await addExpense(page, 'Couch', '120');
	await page.getByRole('link', { name: /Couch/ }).click();
	await page.getByLabel('Your comment').fill('Heavy thing');
	await page.getByRole('button', { name: 'Send' }).click();
	await expect(page.getByRole('region', { name: 'Comments' })).toContainText('Heavy thing');
	await addPhoto(page);
	await expect(page.getByRole('img', { name: 'Receipt photo 1' })).toBeVisible();
	const expenseUrl = page.url();

	// Ben only ever got the old link, and has it open before all this
	const ben = await (await browser.newContext()).newPage();
	await open(ben, groupUrl);
	await ben.getByRole('button', { name: "I'm Ben" }).click();
	await expect(ben.getByRole('link', { name: /Couch/ })).toBeVisible();

	// The app's update is out (in tests: this name opts in). Cut off halfway: nothing is lost
	await open(page, `${groupUrl}/edit`);
	await page.getByLabel('Group name').fill('[auto] Old flat');
	let posts = 0;
	await page.route('**/encrypt/data', (route) =>
		route.request().method() === 'POST' && ++posts === 3 ? route.abort() : route.continue()
	);
	await page.getByRole('button', { name: 'Save' }).click();
	await expect.poll(() => posts).toBeGreaterThanOrEqual(3);
	await page.unroute('**/encrypt/data');

	// Half sealed, Ben still reads everything, without doing anything
	await open(ben, groupUrl);
	await expect(ben.getByRole('link', { name: /Couch/ })).toBeVisible();

	// The next visit finishes it, in the background
	await open(page, groupUrl);
	await expect
		.poll(
			async () => {
				const raw = await (await page.request.get(`${groupUrl}/__data.json`)).text();
				return ['Old flat', 'Couch', 'Ben'].filter((secret) => raw.includes(secret));
			},
			{ timeout: 20_000 }
		)
		.toEqual([]);
	const history = await (await page.request.get(`${groupUrl}/activity/__data.json`)).text();
	expect(history).not.toContain('Couch');

	await open(page, expenseUrl);
	await expect(page.getByRole('region', { name: 'Comments' })).toContainText('Heavy thing');
	await expect(page.locator('img[src^="data:image/jpeg"]').first()).toBeVisible();

	// Ben, again: his old link keeps working and he reads it all
	await open(ben, groupUrl);
	await expect(ben.getByRole('link', { name: /Couch/ })).toBeVisible();
	await expect(ben.getByRole('heading', { name: '[auto] Old flat' })).toBeVisible();

	// A name someone already has is caught, though the server can't compare them
	await open(page, `${groupUrl}?tab=group`);
	await page.getByRole('button', { name: 'Add', exact: true }).click();
	await page.getByLabel("New person's name").fill('ben');
	await page.getByLabel("New person's name").press('Enter');
	await expect(page.getByRole('alert').first()).toBeVisible();

	// Someone should go: a new link, and the old one gets nowhere
	await open(page, `${groupUrl}?tab=group`);
	await page.getByRole('link', { name: 'Create new link' }).click();
	await page.getByRole('button', { name: 'Create new link' }).click();
	const field = page.getByLabel('Share', { exact: true });
	await expect(field).toHaveValue(/#key=/, { timeout: 30_000 });
	const newLink = await field.inputValue();
	const newUrl = newLink.split('#')[0];
	expect(newUrl).not.toBe(groupUrl);
	expect((await page.request.get(groupUrl)).status()).toBe(404);
	await open(page, newUrl);
	await expect(page.getByRole('link', { name: /Couch/ })).toBeVisible();
	await page.getByRole('link', { name: /Couch/ }).click();
	await expect(page.getByRole('region', { name: 'Comments' })).toContainText('Heavy thing');

	// With the key no longer handed over, Ben needs the new link, and that's all he needs
	await open(ben, newUrl);
	await expect(ben.getByText('Open this group with its link')).toBeVisible();
	await open(ben, newLink);
	await expect(ben.getByRole('link', { name: /Couch/ })).toBeVisible();
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

test('categories, car data and how to pay you stay sealed too; insights work (#110)', async ({
	page,
	browser
}) => {
	await open(page, '/new');
	await page.getByLabel('Group name').fill('Our car');
	await page.getByLabel('Currency').selectOption('EUR');
	await page.getByRole('radio', { name: 'Car' }).check({ force: true });
	await page.getByLabel('Your name').fill('Anna');
	await page.getByLabel('Add a person').fill('Benedikt');
	await page.getByLabel('Add a person').press('Enter');
	await page.getByRole('button', { name: 'Create group' }).click();
	await expect(page.getByTestId('identity')).toHaveText('Anna');
	const groupUrl = page.url().split('#')[0];

	await page.getByRole('link', { name: 'Add expense' }).click();
	await page.getByLabel('What was it for?').fill('Filling up');
	await page.getByLabel('Amount (€)').fill('60');
	await page.getByLabel(/Odometer/).fill('12345');
	await page.getByLabel(/^Fuel \(/).fill('40');
	await choose(page, 'Category', 'Fuel');
	await page.getByRole('button', { name: 'Add expense' }).click();
	await expect(page.getByRole('link', { name: /Filling up/ })).toBeVisible();

	const raw = await (await page.request.get(`${groupUrl}/__data.json?tab=insights`)).text();
	expect(raw).not.toContain('12345000');
	expect(raw).not.toContain('40000');
	expect(raw).not.toMatch(/"(fuel|transport)"/);

	// The browser still works out the insights, and shows what was noted
	await open(page, `${groupUrl}?tab=insights`);
	await expect(page.locator('body')).toContainText('12,345 km');
	await expect(page.locator('body')).toContainText('€1.50');
	await page.getByRole('link', { name: 'Expenses' }).click();
	await page.getByRole('link', { name: /Filling up/ }).click();
	await expect(page.getByLabel(/Odometer/)).toHaveValue('12345');
	await expect(page.getByRole('radio', { name: 'Fuel', exact: true })).toBeChecked();

	// How to pay you: sealed for you, and for this group
	await open(page, '/you/profile');
	await page.getByLabel('How to pay you').fill('DE02120300000000202051');
	await page.getByLabel('How to pay you').blur();
	await expect(page.getByText('Saved').first()).toBeVisible();
	const profile = await (await page.request.get('/you/profile/__data.json')).text();
	expect(profile).not.toContain('DE02120300000000202051');
	await open(page, groupUrl);
	const group = await (await page.request.get(`${groupUrl}/__data.json`)).text();
	expect(group).not.toContain('DE02120300000000202051');
	await page.reload();
	await expect(page.getByTestId('identity')).toHaveText('Anna');
	await open(page, '/you/profile');
	await expect(page.getByLabel('How to pay you')).toHaveValue('DE02120300000000202051');

	const link = await (async () => {
		await open(page, `${groupUrl}?tab=group`);
		return fullLink(page);
	})();
	const ben = await (await browser.newContext()).newPage();
	await open(ben, link);
	await ben.getByRole('button', { name: "I'm Benedikt" }).click();
	await expect(ben.getByTestId('identity')).toHaveText('Benedikt');
	await open(ben, `${groupUrl}/payments/new`);
	await expect(ben.getByText('DE02120300000000202051')).toBeVisible();
});

test('a passkey brings the keys along where it can (#110)', async ({ page }) => {
	const cdp = await page.context().newCDPSession(page);
	await cdp.send('WebAuthn.enable');
	await cdp.send('WebAuthn.addVirtualAuthenticator', {
		options: {
			protocol: 'ctap2',
			ctap2Version: 'ctap2_1',
			transport: 'internal',
			hasResidentKey: true,
			hasUserVerification: true,
			isUserVerified: true,
			hasPrf: true,
			automaticPresenceSimulation: true
		}
	});
	const { groupUrl } = await encryptedGroup(page);
	await open(page, '/you/backup');
	await openFold(page, 'Passkey');
	const saved = page.waitForResponse('**/device/passkey/vault');
	await page
		.getByRole('button', { name: /passkey/i })
		.first()
		.click();
	expect((await saved).ok()).toBe(true);

	// Everything on this device gone: only the passkey is left
	await page.evaluate(
		() =>
			new Promise((done) => {
				const request = indexedDB.deleteDatabase('keeping-tabs-keys');
				request.onsuccess = request.onerror = request.onblocked = done;
			})
	);
	await page.context().clearCookies();
	await open(page, '/you/devices');
	await page
		.getByRole('button', { name: /passkey/i })
		.first()
		.click();
	await expect(page).toHaveURL(/\/$/);
	await open(page, groupUrl);
	await expect(page.getByRole('link', { name: /Whiskey tasting/ })).toBeVisible();
});

test('amounts and who pays stay sealed, and everything still adds up (#110)', async ({ page }) => {
	const { groupUrl, link } = await encryptedGroup(page);
	await open(page, groupUrl);
	await addExpense(page, 'Secret boat', '37.14');

	// What the server sends and keeps holds none of it
	for (const path of ['/__data.json', '/__data.json?tab=balances', '/activity/__data.json']) {
		const raw = await (await page.request.get(`${groupUrl}${path}`)).text();
		expect(raw).not.toContain('3714');
		expect(raw).not.toContain('37.14');
	}
	const home = await (await page.request.get('/__data.json')).text();
	expect(home).not.toContain('3714');

	// Yet the browser adds it all up: half of 30 and half of 37.14, on every screen
	await expect(page.getByRole('link', { name: /Secret boat/ })).toContainText('€37.14');
	await expect(page.locator('body')).toContainText('€33.57');
	await open(page, '/');
	await expect(page.locator('body')).toContainText('€33.57');
	await open(page, '/balances');
	await expect(page.locator('body')).toContainText('€33.57');

	// Before the browser has opened anything: an outline, not dots or a balance of zero
	const firstPaint = await (await page.request.get(groupUrl)).text();
	expect(firstPaint).toContain('skeleton');
	expect(firstPaint).not.toContain('…</');

	// The second time, only what's changed is fetched
	await open(page, groupUrl);
	const again = page.waitForRequest(/entries\/sealed\?since=\d+/);
	await page.reload();
	await again;
	await expect(page.locator('body')).toContainText('€33.57');

	// Editing starts from the real amount
	await open(page, groupUrl);
	await page.getByRole('link', { name: /Secret boat/ }).click();
	await expect(page.getByLabel('Amount (€)')).toHaveValue('37.14');
	await page.getByLabel('Amount (€)').fill('40');
	await page.getByRole('button', { name: 'Save' }).click();
	await expect(page.getByRole('link', { name: /Secret boat/ })).toContainText('€40.00');
	await expect(page.locator('body')).toContainText('€35.00');

	// Settling up: a payment is sealed too, and the suggestion never reaches the server
	const asked: string[] = [];
	page.on('request', (request) => asked.push(request.url()));
	await open(page, `${groupUrl}?tab=balances`);
	await page.getByRole('region', { name: 'Settle up' }).getByRole('link').first().click();
	await expect(page.getByLabel(/Amount/)).toHaveValue('35.00');
	expect(asked.join()).not.toContain('3500');
	await page.getByRole('button', { name: 'Record payment' }).click();
	await open(page, `${groupUrl}?tab=balances`);
	await expect(page.locator('body')).toContainText('All settled');
	const settled = await (await page.request.get(`${groupUrl}/__data.json`)).text();
	expect(settled).not.toContain('3500');

	// A budget too
	await open(page, `${groupUrl}/budget`);
	await page.getByLabel(/Budget/).fill('912.34');
	await page.getByRole('button', { name: 'Save' }).click();
	await expect(page).toHaveURL(/tab=insights/);
	const planned = await (await page.request.get(`${groupUrl}/__data.json`)).text();
	expect(planned).not.toContain('91234');
	await open(page, `${groupUrl}/budget`);
	await expect(page.getByLabel(/Budget/)).toHaveValue('912.34');

	expect(link).toContain('#key=');
});

test('a group nobody opens gets encrypted on the server’s schedule (#110)', async ({ page }) => {
	// Nobody's browser gets to do it: this group is opened by nobody
	await page.route('**/encrypt/data', (route) => route.abort());
	const groupUrl = await createGroup(page, '[auto] Quiet', 'Anna', ['Ben']);
	const bare = await page.context().browser()!.newContext();
	const friend = await bare.newPage();
	await expect
		.poll(
			async () => {
				await page.request.get('/cdn-cgi/handler/scheduled?cron=*/5+*+*+*+*');
				const raw = await (await page.request.get(`${groupUrl}/__data.json`)).text();
				return raw.includes('Quiet') || !raw.includes('enc1.');
			},
			{ timeout: 40_000 }
		)
		.toBe(false);
	await open(friend, groupUrl);
	await friend.getByRole('button', { name: "I'm Ben" }).click();
	await expect(friend.getByRole('heading', { name: '[auto] Quiet' })).toBeVisible();
});

test('settings are sealed, the history still says who, and the key leaves the server (#110)', async ({
	page,
	browser
}) => {
	await open(page, '/new');
	await page.getByLabel('Group name').fill('Yen trip');
	await page.getByLabel('Currency').selectOption('JPY');
	await page.getByLabel('Your name').fill('Anna');
	await page.getByRole('button', { name: 'Create group' }).click();
	await expect(page.getByTestId('identity')).toHaveText('Anna');
	const groupUrl = page.url().split('#')[0];
	const raw = await (await page.request.get(`${groupUrl}/__data.json`)).text();
	expect(raw).not.toContain('JPY');

	// The browser knows it's yen
	await page.getByRole('link', { name: 'Add expense' }).click();
	await expect(page.getByLabel('Amount (¥)')).toBeVisible();
	await page.getByLabel('What was it for?').fill('Ramen');
	await page.getByLabel('Amount (¥)').fill('1200');
	await page.getByRole('button', { name: 'Add expense' }).click();
	await expect(page.getByRole('link', { name: /Ramen/ })).toContainText('¥1,200');

	// The history says who, though the server can't
	await open(page, `${groupUrl}/activity`);
	await expect(page.locator('body')).toContainText('Anna added “Ramen”');
	const history = await (await page.request.get(`${groupUrl}/activity/__data.json`)).text();
	expect(history).toContain('enc1.');

	// An old group: once all who've joined have the key, the old link alone no longer brings it
	const oldUrl = await createGroup(page, 'Old', 'Anna', ['Ben']);
	const ben = await (await browser.newContext()).newPage();
	await open(ben, oldUrl);
	await ben.getByRole('button', { name: "I'm Ben" }).click();
	await expect(ben.getByTestId('identity')).toHaveText('Ben');
	await open(page, `${oldUrl}/edit`);
	await page.getByLabel('Group name').fill('[auto] Old');
	await page.getByRole('button', { name: 'Save' }).click();
	await expect
		.poll(
			async () => (await (await page.request.get(`${oldUrl}/__data.json`)).text()).includes('Old'),
			{
				timeout: 20_000
			}
		)
		.toBe(false);
	await open(ben, oldUrl);
	await expect(ben.getByRole('heading', { name: '[auto] Old' })).toBeVisible();
	const stranger = await (await browser.newContext()).newPage();
	await expect
		.poll(
			async () => {
				await open(stranger, oldUrl);
				return stranger
					.getByText('Open this group with its link')
					.waitFor({ timeout: 3_000 })
					.then(() => 1)
					.catch(() => 0);
			},
			{ timeout: 20_000 }
		)
		.toBe(1);
});

test('a member can’t overwrite an encrypted group behind everyone’s back (#110)', async ({
	page
}) => {
	const { groupUrl } = await encryptedGroup(page);
	await open(page, groupUrl);
	const entry = page.getByRole('link', { name: /Whiskey tasting/ });
	const id = (await entry.getAttribute('href'))!.split('/').at(-1)!;
	const junk = 'enc1.AAAAAAAA.title_.AAAA';
	const post = (data: unknown) => page.request.post(`${groupUrl}/encrypt/data`, { data });

	// Rows under another key are only set aside, and declaring it done without all of it is refused
	const batch = { expenses: [{ id, title: junk, notes: null, details: junk }] };
	expect((await post({ batch })).ok()).toBe(true);
	expect((await post({ finish: 'AAAAAAAA' })).ok()).toBe(false);
	await page.reload();
	await expect(entry).toBeVisible();
	await expect(entry).toContainText('€30.00');

	// Nothing under the group's own key gets in that way, and a real change of link still works
	await page.goto(`${groupUrl}?tab=group`);
	await page.getByRole('link', { name: 'Create new link' }).click();
	await page.getByRole('button', { name: 'Create new link' }).click();
	const field = page.getByLabel('Share', { exact: true });
	await expect(field).toHaveValue(/#key=/, { timeout: 30_000 });
	await open(page, (await field.inputValue()).split('#')[0]);
	await expect(entry).toContainText('€30.00');
});
