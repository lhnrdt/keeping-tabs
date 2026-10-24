import { expect, test, type Page } from '@playwright/test';
import { createGroup, open } from './e2e-helpers';

/** A Splitwise export of a 5-day trip for Anna and Ben, split equally */
function tripExport() {
	const rows = [
		['2026-08-01', 'Hütte', 'Hotel', '300.00', '150.00', '-150.00'],
		['2026-08-01', 'Rewe', 'Lebensmittel', '60.00', '30.00', '-30.00'],
		['2026-08-03', 'Fischsuppe', 'Restaurant', '80.00', '-40.00', '40.00'],
		['2026-08-05', 'Coop', 'Lebensmittel', '40.00', '-20.00', '20.00']
	];
	return [
		'Datum,Beschreibung,Kategorie,Kosten,Währung,Anna,Ben',
		...rows.map(([date, title, category, cost, anna, ben]) =>
			[date, title, category, cost, 'EUR', anna, ben].join(',')
		)
	].join('\n');
}

async function tripWithExpenses(page: Page) {
	const groupUrl = await createGroup(page, 'Lofoten', 'Anna', ['Ben']);
	await open(page, `${groupUrl}/import`);
	await page.getByLabel('Splitwise export (CSV)').setInputFiles({
		name: 'trip.csv',
		mimeType: 'text/csv',
		buffer: Buffer.from(tripExport())
	});
	await page.getByRole('button', { name: 'Import' }).click();
	await expect(page).toHaveURL(groupUrl);
	return groupUrl;
}

test('a group shows where the money went (#161)', async ({ page }) => {
	const groupUrl = await tripWithExpenses(page);
	await page.getByRole('link', { name: 'Insights' }).click();
	await expect(page).toHaveURL(/\?tab=insights$/);

	// The headline numbers
	const tile = (label: string) => page.locator('dt', { hasText: label }).locator('+ dd');
	await expect(tile('Spent')).toHaveText('€480.00');
	await expect(tile('Your share')).toHaveText('€240.00');
	await expect(tile('Per person')).toHaveText('€240.00');
	await expect(tile('Per day')).toHaveText('€96.00');

	// A few facts worth telling (#162)
	const highlights = page.getByRole('list', { name: 'Highlights' });
	await expect(highlights).toContainText('63% of everything');
	await expect(highlights).toContainText('Busiest day');

	// Over time, by day, with the gaps; readable as a table too
	const overTime = page
		.locator('figure')
		.filter({ has: page.getByRole('img', { name: 'Over time' }) });
	await expect(overTime.locator('table tr')).toHaveCount(5);
	await overTime.locator('rect').first().click();
	await expect(overTime.locator('figcaption')).toContainText('€360.00');

	// By category, largest first, with shares
	const categories = page.getByRole('list', { name: 'By category' }).getByRole('listitem');
	await expect(categories.first()).toContainText('€300.00');
	await expect(categories.first()).toContainText('63%');
	await expect(categories).toHaveCount(3);

	// The biggest expenses, and who paid more than their share
	await expect(
		page.getByRole('list', { name: 'Biggest expenses' }).getByRole('listitem').first()
	).toContainText('Hütte');
	const whoPays = page.getByRole('list', { name: 'Who pays' }).getByRole('listitem');
	await expect(whoPays.filter({ hasText: 'Anna' })).toContainText('paid €120.00 more');
	await expect(whoPays.filter({ hasText: 'Ben' })).toContainText('paid €120.00 less');

	// Settling up: Ben still pays Anna, and since when (#166)
	const open = page.getByRole('list', { name: 'Still open' }).getByRole('listitem');
	await expect(open).toHaveCount(1);
	await expect(open).toContainText('Ben → Anna');
	await expect(open).toContainText('€120.00');
	await expect(open).toContainText('owes since Aug 1');
	expect(groupUrl).toBeTruthy();
});

test('an empty group invites to add expenses first', async ({ page }) => {
	const groupUrl = await createGroup(page, 'New flat', 'Anna', ['Ben']);
	await open(page, `${groupUrl}?tab=insights`);
	await expect(page.getByText('Add a few expenses to see where the money goes.')).toBeVisible();
});

test('a group can choose its insights, starting from its type’s suggestions (#174)', async ({
	page
}) => {
	const groupUrl = await tripWithExpenses(page);
	await open(page, `${groupUrl}?tab=insights`);
	const titles = () => page.locator('.k-block-title').allInnerTexts();
	expect(await titles()).toContain('Biggest expenses');
	expect(await titles()).not.toContain('Fixed costs');

	await page.getByRole('button', { name: 'Customize insights' }).click();
	const dialog = page.getByRole('dialog', { name: 'Customize insights' });
	await dialog.getByLabel(/Biggest expenses/).uncheck();
	await dialog.getByLabel(/Who paid how often/).check();
	await dialog.getByRole('button', { name: 'Save' }).click();
	await expect(dialog).toBeHidden();
	await expect.poll(titles).toContain('Who paid how often');
	expect(await titles()).not.toContain('Biggest expenses');

	// It stays for the group, and goes back to the suggestions on request
	await open(page, `${groupUrl}?tab=insights`);
	expect(await titles()).toContain('Who paid how often');
	await page.getByRole('button', { name: 'Customize insights' }).click();
	await dialog.getByRole('button', { name: 'Back to suggested' }).click();
	await expect.poll(titles).toContain('Biggest expenses');
	expect(await titles()).not.toContain('Who paid how often');
});

/** Days from today as YYYY-MM-DD, in this machine's time zone like the server's */
const daysFromToday = (days: number) => {
	const date = new Date();
	date.setDate(date.getDate() + days);
	return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
};

test('a trip on the way sees its budget, where the pace leads, and what’s left per day (#168)', async ({
	page
}) => {
	const groupUrl = await createGroup(page, 'Bergen', 'Anna', ['Ben']);
	await open(page, `${groupUrl}/import`);
	const csv = [
		'Datum,Beschreibung,Kategorie,Kosten,Währung,Anna,Ben',
		`${daysFromToday(-1)},Hütte,Hotel,200.00,EUR,100.00,-100.00`,
		`${daysFromToday(0)},Fischmarkt,Restaurant,100.00,EUR,-50.00,50.00`
	].join('\n');
	await page.getByLabel('Splitwise export (CSV)').setInputFiles({
		name: 'trip.csv',
		mimeType: 'text/csv',
		buffer: Buffer.from(csv)
	});
	await page.getByRole('button', { name: 'Import' }).click();
	await expect(page).toHaveURL(groupUrl);

	// Not suggested for this kind of group, but there to choose
	await open(page, `${groupUrl}?tab=insights`);
	await page.getByRole('button', { name: 'Customize insights' }).click();
	const customize = page.getByRole('dialog', { name: 'Customize insights' });
	await customize.getByRole('checkbox', { name: /^Budget/ }).check();
	await customize.getByRole('button', { name: 'Save' }).click();
	await expect(customize).toBeHidden();

	await page.getByRole('button', { name: 'Set a budget' }).click();
	const dialog = page.getByRole('dialog', { name: 'Set a budget' });
	await dialog.getByLabel('Budget (EUR)').fill('abc');
	await dialog.getByRole('button', { name: 'Save' }).click();
	await expect(dialog.getByRole('alert')).toContainText('Enter an amount');
	await dialog.getByLabel('Budget (EUR)').fill('700');
	await dialog.getByLabel('Ends on').fill(daysFromToday(3));
	await dialog.getByRole('button', { name: 'Save' }).click();
	await expect(dialog).toBeHidden();

	// €300 in two days is €150 a day; three more days make €750, over the €700
	await expect(page.getByText('of €700.00')).toBeVisible();
	await expect(page.getByText('At this pace: €750.00')).toBeVisible();
	// €400 left over today and the three days after it
	await expect(page.getByText('€100.00 left per day')).toBeVisible();
	await expect(page.getByRole('img', { name: 'Budget' })).toBeVisible();

	// Changing starts from what's set
	await page.getByRole('button', { name: 'Change budget' }).click();
	const change = page.getByRole('dialog', { name: 'Change budget' });
	await expect(change.getByLabel('Budget (EUR)')).toHaveValue('700.00');
	await expect(change.getByLabel('Ends on')).toHaveValue(daysFromToday(3));
	await change.getByRole('button', { name: 'Remove budget' }).click();
	await expect(page.getByRole('button', { name: 'Set a budget' })).toBeVisible();
});
