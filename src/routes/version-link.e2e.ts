import { expect, test } from '@playwright/test';
import { open } from './e2e-helpers';

test('press and hold the version for the project on GitHub (#165)', async ({ page, context }) => {
	await open(page, '/');
	const version = page.getByTestId('app-version');
	const box = (await version.boundingBox())!;
	const middle = { x: box.x + box.width / 2, y: box.y + box.height / 2 };

	// A tap does nothing
	await page.mouse.click(middle.x, middle.y);
	await page.waitForTimeout(1000);
	expect(context.pages()).toHaveLength(1);

	const opened = context.waitForEvent('page');
	await page.mouse.move(middle.x, middle.y);
	await page.mouse.down();
	await page.waitForTimeout(900);
	await page.mouse.up();
	expect((await opened).url()).toContain('github.com/lhnrdt/keeping-tabs');
});
