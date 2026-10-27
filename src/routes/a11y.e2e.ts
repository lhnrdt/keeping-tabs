// Automated accessibility checks (#79): the core screens against WCAG 2.1 AA with axe, in
// light and dark. Screen readers and real devices are checked by hand (#80).
import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { createGroup, open } from './e2e-helpers';

/** What axe found, short enough to read in a test report */
async function violationsOn(page: Page) {
	// The page has settled (not caught between a redirect and the next document)
	await expect(page.locator('html')).toHaveAttribute('lang', /.+/);
	const { violations } = await new AxeBuilder({ page })
		.withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
		.analyze();
	return violations.flatMap(({ id, nodes }) =>
		nodes.map((node) => ({
			id,
			html: node.html.slice(0, 120),
			// For contrast: the colors and ratio axe measured
			data: node.any[0]?.data as
				{ contrastRatio?: number; fgColor?: string; bgColor?: string } | undefined
		}))
	);
}

async function expectAccessible(page: Page, path: string) {
	await open(page, path);
	// Soft: one run reports every screen
	expect.soft(await violationsOn(page), path).toEqual([]);
}

for (const colorScheme of ['light', 'dark'] as const) {
	test.describe(`${colorScheme} mode`, () => {
		// Settled screens: no colors caught halfway through a transition
		test.use({ colorScheme, reducedMotion: 'reduce' });

		test('the password page', async ({ page }) => {
			await page.goto('/welcome');
			expect(await violationsOn(page)).toEqual([]);
		});

		test('home, new group, settings and devices', async ({ page }) => {
			for (const path of ['/', '/new', '/you', '/you/devices']) await expectAccessible(page, path);
		});

		test('a group with an expense and a payment', async ({ page }) => {
			const groupUrl = await createGroup(page, 'Dinner club', 'Anna', ['Ben']);
			await page.getByRole('link', { name: 'Add expense' }).click();
			await page.getByLabel('What was it for?').fill('Pizza');
			await page.getByLabel('Amount (€)').fill('30');
			await page.getByRole('button', { name: 'Add expense' }).click();
			await page.getByRole('link', { name: /Pizza/ }).click();
			const expenseUrl = page.url();

			for (const path of [
				groupUrl,
				`${groupUrl}?tab=balances`,
				`${groupUrl}?tab=group`,
				`${groupUrl}/expenses/new`,
				expenseUrl,
				`${groupUrl}/payments/new`,
				`${groupUrl}/import`
			]) {
				await expectAccessible(page, path);
			}
		});
	});
}
