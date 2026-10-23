import { expect, test } from '@playwright/test';
import { createGroup, open } from './e2e-helpers';

/** A Splitwise export with `count` expenses, one per day */
function longExport(count: number) {
	const rows = Array.from({ length: count }, (_, i) => {
		const date = new Date(Date.UTC(2025, 0, 1 + i)).toISOString().slice(0, 10);
		return `${date},Coffee ${i + 1},Allgemein,4.00,EUR,2.00,-2.00`;
	});
	return ['Date,Description,Category,Cost,Currency,Anna,Ben', ...rows].join('\n');
}

test('the expense list keeps loading older entries while scrolling', async ({ page }) => {
	const groupUrl = await createGroup(page, 'Coffee club', 'Anna', ['Ben']);
	await open(page, `${groupUrl}/import`);
	await page.getByLabel('Splitwise export (CSV)').setInputFiles({
		name: 'export.csv',
		mimeType: 'text/csv',
		buffer: Buffer.from(longExport(120))
	});
	await page.getByRole('button', { name: 'Import' }).click();
	await expect(page).toHaveURL(groupUrl);

	// The newest page arrives with the page, older ones while scrolling down
	const entries = page.getByRole('region', { name: 'Expenses' }).getByRole('listitem');
	await expect(entries).toHaveCount(50);
	await expect(entries.first()).toContainText('Coffee 120');
	for (const count of [100, 120]) {
		await entries.last().scrollIntoViewIfNeeded();
		await expect(entries).toHaveCount(count);
	}
	await expect(entries.last()).toContainText('Coffee 1');
	await expect(page.getByRole('link', { name: 'Show older' })).toHaveCount(0);
});

test('without JavaScript, older entries are a link away', async ({ browser }) => {
	const context = await browser.newContext({ javaScriptEnabled: false });
	const page = await context.newPage();
	// Reuse an imported group created with JavaScript on
	const setup = await browser.newPage();
	const groupUrl = await createGroup(setup, 'No JS club', 'Anna', ['Ben']);
	await open(setup, `${groupUrl}/import`);
	await setup.getByLabel('Splitwise export (CSV)').setInputFiles({
		name: 'export.csv',
		mimeType: 'text/csv',
		buffer: Buffer.from(longExport(60))
	});
	await setup.getByRole('button', { name: 'Import' }).click();
	await expect(setup).toHaveURL(groupUrl);

	// Joining works without JavaScript too (a plain form)
	await page.goto(groupUrl);
	await page.getByRole('button', { name: 'Got it' }).click();
	await page.getByRole('button', { name: "I'm Ben" }).click();
	await page.goto(groupUrl);
	const entries = page.getByRole('region', { name: 'Expenses' }).getByRole('listitem');
	await expect(entries).toHaveCount(50);
	const older = page.getByRole('link', { name: 'Show older' });
	await page.goto((await older.getAttribute('href'))!);
	await expect(entries).toHaveCount(60);
	await context.close();
});
