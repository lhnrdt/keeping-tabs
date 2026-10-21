import { expect, test } from '@playwright/test';

const expected = process.env.APP_VERSION || '0.0.0-dev';

test('every page shows the app version and sends it as a header', async ({ page }) => {
	const response = await page.goto('/');
	expect(response?.headers()['x-app-version']).toBe(expected);
	await expect(page.getByTestId('app-version')).toHaveText(`v${expected}`);
});
