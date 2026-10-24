import { readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';
import { createGroup, open } from './e2e-helpers';

const EXPORT = new URL('./fixtures/splitwise-export.csv', import.meta.url).pathname;

test('export a group as CSV and import it into another group', async ({ page }) => {
	const groupUrl = await createGroup(page, 'Flat', 'Anna', ['Ben']);
	await open(page, `${groupUrl}/import`);
	await page.getByLabel('Splitwise export (CSV)').setInputFiles(EXPORT);
	await page.getByRole('button', { name: 'Import' }).click();
	await expect(page).toHaveURL(groupUrl);

	await open(page, `${groupUrl}?tab=group`);
	const downloading = page.waitForEvent('download');
	await page.getByRole('link', { name: 'Export as CSV' }).click();
	const download = await downloading;
	expect(download.suggestedFilename()).toBe('Flat.csv');
	const csv = await readFile(await download.path(), 'utf8');
	expect(csv).toContain('Date,Description,Category,Cost,Currency,Anna,Ben');
	expect(csv).toContain('"Pizza, Wein"');
	expect(csv).toContain('Total balance,,,EUR,20.00,-20.00');

	// The file is a Splitwise export, so it imports again: into a new group, same balances
	const copyUrl = await createGroup(page, 'Flat copy', 'Anna', ['Ben']);
	await open(page, `${copyUrl}/import`);
	await page.getByLabel('Splitwise export (CSV)').setInputFiles({
		name: 'Flat.csv',
		mimeType: 'text/csv',
		buffer: Buffer.from(csv)
	});
	await page.getByRole('button', { name: 'Import' }).click();
	await expect(page).toHaveURL(copyUrl);
	await open(page, `${copyUrl}?tab=balances`);
	await expect(
		page.getByRole('region', { name: 'Balances' }).getByRole('listitem').filter({ hasText: 'Anna' })
	).toContainText('gets back €20.00');
});
