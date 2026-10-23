import { execFileSync } from 'node:child_process';
import { expect, test } from '@playwright/test';
import { open } from './e2e-helpers';

/** Runs SQL on the local database the preview worker uses. */
function sql(command: string) {
	const out = execFileSync(
		'pnpm',
		['exec', 'wrangler', 'd1', 'execute', 'DB', '--local', '--json', '--command', command],
		{ encoding: 'utf8' }
	);
	return JSON.parse(out)[0].results as Record<string, unknown>[];
}

test('deleted groups are removed for good after 30 days', async ({ page, request }) => {
	await open(page, '/new');
	await page.getByLabel('Group name').fill('Long gone');
	await page.getByLabel('Your name').fill('Anna');
	await page.getByRole('button', { name: 'Create group' }).click();
	await expect(page.getByTestId('identity')).toHaveText('Anna');
	const token = new URL(page.url()).pathname.split('/').pop()!;

	await open(page, `${page.url()}?tab=group`);
	await page.getByRole('button', { name: 'Delete group' }).click();
	await page.getByRole('dialog').getByRole('button', { name: 'Delete' }).click();
	await expect(page.getByRole('region', { name: 'Recently deleted' })).toContainText('Long gone');

	// 31 days later, the daily job runs
	const day = 24 * 60 * 60 * 1000;
	sql(`update groups set deleted_at = ${Date.now() - 31 * day} where share_token = '${token}'`);
	const [{ id }] = sql(`select id from groups where share_token = '${token}'`);
	expect((await request.get('/cdn-cgi/handler/scheduled')).ok()).toBe(true);

	expect(sql(`select count(*) as n from groups where id = '${id}'`)[0].n).toBe(0);
	expect(sql(`select count(*) as n from members where group_id = '${id}'`)[0].n).toBe(0);
	expect(sql(`select count(*) as n from activity_log where group_id = '${id}'`)[0].n).toBe(0);
	await open(page, '/');
	await expect(page.getByRole('region', { name: 'Recently deleted' })).toHaveCount(0);
});
