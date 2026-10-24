import { expect, test } from '@playwright/test';
import { createGroup, open } from './e2e-helpers';

// Requests that go through the service worker can't be slowed down by the test
test.use({ serviceWorkers: 'block' });

test('a slow page shows a loading bar until it arrives (#58)', async ({ page }) => {
	const groupUrl = await createGroup(page, 'Trip', 'Anna', ['Ben']);
	await open(page, '/');

	// Hold the group's data back for a moment, as on a slow connection
	await page.route('**/__data.json*', async (route) => {
		await new Promise((resolve) => setTimeout(resolve, 1200));
		await route.continue();
	});
	await page.getByRole('link', { name: /Trip/ }).click();
	const bar = page.getByRole('progressbar', { name: 'Loading…' });
	await expect(bar).toBeVisible();
	await expect(page).toHaveURL(groupUrl);
	await expect(bar).toHaveCount(0);
});

test('a quick page shows no loading bar', async ({ page }) => {
	await createGroup(page, 'Flat', 'Anna', ['Ben']);
	await open(page, '/');
	const seen: boolean[] = [];
	await page.exposeFunction('sawBar', () => seen.push(true));
	await page.evaluate(() =>
		new MutationObserver(() => {
			if (document.querySelector('[role="progressbar"]'))
				(window as unknown as { sawBar: () => void }).sawBar();
		}).observe(document.body, { childList: true, subtree: true })
	);
	await page.getByRole('link', { name: /Flat/ }).click();
	await expect(page.getByRole('heading', { name: 'Flat' })).toBeVisible();
	expect(seen).toEqual([]);
});
