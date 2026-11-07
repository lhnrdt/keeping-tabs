import { expect, test, type Locator, type Page } from '@playwright/test';
import { createGroup, open } from './e2e-helpers';

/** Presses and holds, as a finger would */
async function hold(page: Page, target: Locator) {
	const box = (await target.boundingBox())!;
	const [x, y] = [box.x + box.width / 2, box.y + box.height / 2];
	// Once the page's transition is over: until then it's what's under the pointer
	await page.waitForFunction(
		([x, y]) => document.elementFromPoint(x, y) !== document.documentElement,
		[x, y]
	);
	await page.mouse.move(x, y);
	await page.mouse.down();
	await page.waitForTimeout(700);
	await page.mouse.up();
}

test('pressing and holding an entry, or right clicking it, opens its menu (#321)', async ({
	page
}) => {
	const groupUrl = await createGroup(page, 'Held', 'Anna', ['Ben']);
	await page.getByRole('link', { name: 'Add expense' }).click();
	await page.getByLabel('What was it for?').fill('Snacks');
	await page.getByLabel('Amount (€)').fill('12');
	await page.getByRole('button', { name: 'Add expense' }).click();
	await expect(page).toHaveURL(groupUrl);

	// Holding opens the menu instead of following the link
	const row = page.getByRole('link', { name: /Snacks/ });
	await hold(page, row);
	const menu = page.getByRole('dialog', { name: 'Snacks' });
	await expect(menu).toBeVisible();
	await expect(page).toHaveURL(groupUrl);
	await menu.getByRole('button', { name: 'Edit expense' }).click();
	await expect(page.getByLabel('What was it for?')).toHaveValue('Snacks');

	// A right click does the same; deleting from there can be undone
	await open(page, groupUrl);
	await row.click({ button: 'right' });
	await menu.getByRole('button', { name: 'Delete expense' }).click();
	await expect(row).toHaveCount(0);
	await expect(page.getByRole('button', { name: 'Undo' })).toBeVisible();

	// Groups on the start screen have one too
	await open(page, '/');
	await page.getByRole('link', { name: /Held/ }).click({ button: 'right' });
	await page
		.getByRole('dialog', { name: 'Held' })
		.getByRole('button', { name: 'Add expense' })
		.click();
	await expect(page.getByLabel('What was it for?')).toBeVisible();

	// Text can't be selected outside of fields
	expect(await page.evaluate(() => getComputedStyle(document.documentElement).userSelect)).toBe(
		'none'
	);
});
