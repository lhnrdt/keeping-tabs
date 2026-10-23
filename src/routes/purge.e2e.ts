import { expect, test } from '@playwright/test';
import { open } from './e2e-helpers';

const DAY_MS = 24 * 60 * 60 * 1000;

test('deleted groups are removed for good after 30 days', async ({ page, request }) => {
	await open(page, '/new');
	await page.getByLabel('Group name').fill('Long gone');
	await page.getByLabel('Your name').fill('Anna');
	await page.getByRole('button', { name: 'Create group' }).click();
	await expect(page.getByTestId('identity')).toHaveText('Anna');

	await open(page, `${page.url()}?tab=group`);
	await page.getByRole('button', { name: 'Delete group' }).click();
	await page.getByRole('dialog').getByRole('button', { name: 'Delete' }).click();
	const recentlyDeleted = page.getByRole('region', { name: 'Recently deleted' });
	await expect(recentlyDeleted).toContainText('Long gone');

	// The daily job, as if it ran 31 days from now (wrangler's test trigger sets its time)
	const time = Date.now() + 31 * DAY_MS;
	const job = await request.get(`/cdn-cgi/handler/scheduled?time=${time}`);
	expect(job.ok()).toBe(true);

	// Gone for good: not even restorable any more
	await open(page, '/');
	await expect(page.getByText('Long gone')).toHaveCount(0);
});
