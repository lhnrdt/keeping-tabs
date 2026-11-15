// Adds a car group to the local dev database (`pnpm seed:car`) that shows every car insight,
// through the expense form like a person would. Prints the group's link with its key (the group
// is encrypted, and the key is only in this script's browser): open it and pick a name to join. Usage: pnpm seed:car [base URL]   (password: ACCESS_PASSWORD, default "letmein")
import { chromium, type Page } from '@playwright/test';
import { carRows } from './car-data.ts';

const base = process.argv[2] ?? 'https://localhost:5173';
const password = process.env.ACCESS_PASSWORD ?? 'letmein';

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

const browser = await chromium.launch();
const page = await (
	await browser.newContext({ locale: 'en-US', ignoreHTTPSErrors: true })
).newPage();

await open(page, '/new');
await page.getByLabel('Group name').fill('Our Golf');
await page.getByLabel('Currency').selectOption('EUR');
const you = page.getByLabel('Your name');
if ((await you.count()) && !(await you.inputValue())) await you.fill('Anna');
await page.getByRole('group', { name: 'Type' }).getByText('Car', { exact: true }).click();
for (const other of ['Ben', 'Cara']) {
	await page.getByLabel('Add a person').fill(other);
	await page.getByLabel('Add a person').press('Enter');
}
await page.getByRole('button', { name: 'Create group' }).click();
await page.getByTestId('identity').waitFor();
const groupUrl = page.url();
const groupPath = new URL(groupUrl).pathname;

const rows = carRows();
for (const [index, row] of rows.entries()) {
	await open(page, `${groupPath}/expenses/new`);
	await page.getByLabel('What was it for?').fill(row.title);
	await page.getByLabel('Amount (€)').fill(String(row.amount));
	await page.getByLabel('Date').fill(row.date);
	if (row.odometerKm) await page.getByLabel('Odometer').fill(String(row.odometerKm));
	if (row.litres) await page.getByLabel('Fuel (litres)').fill(String(row.litres));
	await page
		.getByRole('group', { name: 'Category' })
		.getByText(row.category, { exact: true })
		.click();
	if (row.payer !== 'Anna') {
		await page.getByRole('button', { name: 'Someone else' }).click();
		await page
			.getByRole('group', { name: 'Who paid?' })
			.locator('label')
			.filter({ has: page.getByRole('radio', { name: row.payer, exact: true }) })
			.click();
	}
	await page.getByRole('button', { name: 'Add expense' }).click();
	await page.waitForURL(groupUrl);
	if ((index + 1) % 10 === 0) console.log(`  ${index + 1} of ${rows.length}`);
}
console.log(`✓ Our Golf (Car, ${rows.length} expenses)`);
// The link as the group shares it: with its key, after the # the server never sees
await open(page, `${groupPath}?tab=group`);
const link = await page.evaluate(() => {
	const found = [...document.querySelectorAll('input, a, code, span')]
		.map((node) => (node as HTMLInputElement).value || node.textContent || '')
		.find((text) => text.includes('#key='));
	return found?.trim() ?? location.href;
});
console.log(`\nOpen it and pick a name to join:\n${link}`);
await browser.close();
