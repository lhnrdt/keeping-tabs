import { expect, test } from '@playwright/test';
import { open } from './e2e-helpers';

// N-10: usable from 360 px phones to desktops, without horizontal scrolling, and on wide
// screens the app stays a readable column instead of stretching across the window.

const widths = [360, 820, 1440];
const APP_COLUMN_PX = 42 * 16; // --container-app

for (const width of widths) {
	test(`no horizontal scrolling and a bounded column at ${width}px`, async ({ page }) => {
		await page.setViewportSize({ width, height: 900 });
		for (const path of ['/', '/new', '/device']) {
			await open(page, path);
			await page.waitForLoadState('networkidle');
			const overflow = await page.evaluate(
				() => document.documentElement.scrollWidth > window.innerWidth
			);
			expect(overflow, `${path} scrolls sideways`).toBe(false);
			const heading = await page.getByRole('heading', { level: 1 }).boundingBox();
			expect(heading).not.toBeNull();
			// The content stays inside the centered app column
			const columnLeft = Math.max(0, (width - APP_COLUMN_PX) / 2);
			expect(heading!.x, `${path} heading outside the column`).toBeGreaterThanOrEqual(
				columnLeft - 1
			);
		}
	});
}
