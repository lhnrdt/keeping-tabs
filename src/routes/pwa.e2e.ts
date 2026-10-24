import { expect, test, type Page } from '@playwright/test';
import { createGroup, open } from './e2e-helpers';

/** Waits until the service worker is active and controls the page. */
async function waitForServiceWorker(page: Page) {
	await page.evaluate(async () => {
		await navigator.serviceWorker.ready;
		if (!navigator.serviceWorker.controller) {
			await new Promise((resolve) =>
				navigator.serviceWorker.addEventListener('controllerchange', resolve, { once: true })
			);
		}
	});
}

test('the app is installable', async ({ page, request }) => {
	await open(page, '/');
	const href = await page.locator('link[rel="manifest"]').getAttribute('href');
	const manifest = await (await request.get(href!)).json();
	expect(manifest).toMatchObject({ name: 'Keeping Tabs', display: 'standalone', start_url: '/' });
	// No theme_color: Chrome on Android paints the installed app's navigation bar with it, and
	// one color can't fit light and dark mode (#145). The status bar follows <meta theme-color>.
	expect(manifest).not.toHaveProperty('theme_color');
	for (const icon of manifest.icons) {
		expect((await request.get(icon.src)).ok()).toBe(true);
	}
	await waitForServiceWorker(page);
});

test('groups seen online can be viewed offline', async ({ page, context }) => {
	const groupUrl = await createGroup(page, 'Cabin', 'Anna', ['Ben']);
	await waitForServiceWorker(page);
	// Seen once while the service worker controls the page, so it keeps a copy
	await open(page, groupUrl);

	await context.setOffline(true);
	await page.reload();
	await expect(page.getByRole('heading', { name: 'Cabin' })).toBeVisible();
	await expect(page.getByRole('status').filter({ hasText: "You're offline" })).toBeVisible();

	// A page never opened on this device shows the offline page instead
	await page.goto('/g/AAAAAAAAAAAAAAAAAAAAAA');
	await expect(page.getByRole('heading', { name: "You're offline" })).toBeVisible();

	await context.setOffline(false);
});

test('the system bars follow the light or dark theme', async ({ browser }) => {
	for (const [colorScheme, color] of [
		['light', '#f4f1ea'],
		['dark', '#1d211d']
	] as const) {
		const page = await browser.newPage({ colorScheme });
		await open(page, '/');
		await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', color);
		await page.close();
	}
});
