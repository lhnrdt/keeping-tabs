import { expect, test } from '@playwright/test';
import { createGroup } from './e2e-helpers';

test('adding an expense tells the group once, and only about a new one (#256)', async ({
	page,
	browser
}) => {
	const groupUrl = await createGroup(page, 'Flat', 'Anna', ['Ben']);
	await page.getByRole('link', { name: 'Add expense' }).click();
	await page.getByLabel('What was it for?').fill('Dinner');
	await page.getByLabel('Amount (€)').fill('30');

	const asked = page.waitForResponse(
		(response) => response.url().endsWith('/notify') && response.request().method() === 'POST'
	);
	await page.getByRole('button', { name: 'Add expense' }).click();
	const response = await asked;
	expect(await response.json()).toEqual({ sent: true });
	await expect(page).toHaveURL(groupUrl);

	// Asking again doesn't tell anyone again
	const again = await page.request.post(response.url(), {
		headers: { origin: new URL(groupUrl).origin },
		multipart: {}
	});
	expect(await again.json()).toEqual({ sent: false });

	// Only for people in the group
	const stranger = await (await browser.newContext()).newPage();
	const refused = await stranger.request.post(response.url(), {
		headers: { origin: new URL(groupUrl).origin },
		multipart: {}
	});
	expect(refused.status()).toBe(403);
});
