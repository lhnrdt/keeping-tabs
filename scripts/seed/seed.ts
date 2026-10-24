// Fills a local app (the dev server by default) with example groups (`pnpm seed`), through
// the app like a person would, and prints a one-time link that makes your browser "Anna".
// Usage: pnpm seed [--link] [base URL]   (password: ACCESS_PASSWORD, default "letmein")
//   --link: only a new link, from the browser saved by the last full run
import { existsSync } from 'node:fs';
import { chromium, type Page } from '@playwright/test';
import { EXAMPLE_GROUPS, toSplitwiseCsv } from './data.ts';

const linkOnly = process.argv.includes('--link');
const base = process.argv.slice(2).find((arg) => !arg.startsWith('--')) ?? 'http://127.0.0.1:5173';
const password = process.env.ACCESS_PASSWORD ?? 'letmein';
/** Anna's browser (her cookies), kept for `--link`; ignored by git */
const SAVED = new URL('../../.seed-anna.json', import.meta.url).pathname;

async function open(page: Page, path: string) {
	await page.goto(new URL(path, base).href);
	await page.waitForLoadState('networkidle');
	if (new URL(page.url()).pathname === '/welcome') {
		await page.locator('input[name="password"]').fill(password);
		await page.locator('form button[type="submit"]').click();
		await page.waitForURL((url) => url.pathname !== '/welcome');
		await page.waitForLoadState('networkidle');
	}
	const note = page.locator('form[action$="note"]');
	if (await note.count()) {
		await note.locator('button[type="submit"]').click();
		await page.waitForLoadState('networkidle');
	}
}

async function newLink(page: Page) {
	await open(page, '/you/devices');
	const addDevice = page.locator('details').filter({ hasText: 'Add another device' });
	if ((await addDevice.getAttribute('open')) === null) await addDevice.locator('summary').click();
	await page.getByRole('button', { name: 'Create link' }).click();
	return (await page.getByRole('listitem', { name: 'One-time link' }).innerText()).trim();
}

const browser = await chromium.launch();
const device = async () => (await browser.newContext({ locale: 'en-US' })).newPage();

if (linkOnly) {
	if (!existsSync(SAVED)) throw new Error('No saved example browser: run `pnpm seed` first');
	const anna = await (await browser.newContext({ locale: 'en-US', storageState: SAVED })).newPage();
	console.log(`Open this in your browser within 15 minutes to be Anna:\n${await newLink(anna)}`);
	await browser.close();
	process.exit(0);
}

const anna = await device();
const groups: { name: string; url: string; others: string[] }[] = [];
for (const group of EXAMPLE_GROUPS) {
	await open(anna, '/new');
	await anna.getByLabel('Group name').fill(group.name);
	await anna.getByLabel('Currency').selectOption('EUR');
	const you = anna.getByLabel('Your name');
	if ((await you.count()) && !(await you.inputValue())) await you.fill(group.you);
	await anna.getByRole('group', { name: 'Type' }).getByText(group.kind, { exact: true }).click();
	for (const other of group.others) {
		await anna.getByLabel('Add a person').fill(other);
		await anna.getByLabel('Add a person').press('Enter');
	}
	await anna.getByRole('button', { name: 'Create group' }).click();
	await anna.getByTestId('identity').waitFor();
	const url = anna.url();
	await open(anna, `${new URL(url).pathname}/import`);
	await anna.getByLabel('Splitwise export (CSV)').setInputFiles({
		name: 'export.csv',
		mimeType: 'text/csv',
		buffer: Buffer.from(toSplitwiseCsv(group))
	});
	await anna.getByRole('button', { name: 'Import' }).click();
	await anna.waitForURL(url);
	groups.push({ name: group.name, url, others: group.others });
	console.log(`✓ ${group.name} (${group.kind}, ${group.rows.length} expenses)`);
}

// Ben joins his groups from his own device, so he's the same person across them
const ben = await device();
for (const group of groups.filter(({ others }) => others.includes('Ben'))) {
	await open(ben, new URL(group.url).pathname);
	await ben.getByRole('button', { name: "I'm Ben" }).click();
	await ben.getByTestId('identity').waitFor();
}
console.log('✓ Ben joined his groups');

// A one-time link that makes another browser Anna; her browser is kept for `--link`
const link = await newLink(anna);
await anna.context().storageState({ path: SAVED });
console.log(`\nOpen this in your browser within 15 minutes to be Anna:\n${link}`);
console.log('A new link later: pnpm seed --link');
await browser.close();
