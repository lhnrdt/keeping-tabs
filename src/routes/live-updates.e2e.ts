import { expect, test } from '@playwright/test';
import { acceptNote, createGroup } from './e2e-helpers';

test('an open group shows what others add, without reloading (#65)', async ({ page, browser }) => {
	const groupUrl = await createGroup(page, 'Flat', 'Anna', ['Ben']);
	await expect(page.getByRole('link', { name: /Dinner/ })).toHaveCount(0);

	const ben = await (await browser.newContext()).newPage();
	await ben.goto(groupUrl);
	await acceptNote(ben);
	await ben.getByRole('button', { name: "I'm Ben" }).click();
	await expect(ben.getByTestId('identity')).toHaveText('Ben');
	await ben.getByRole('link', { name: 'Add expense' }).click();
	await ben.getByLabel('What was it for?').fill('Dinner');
	await ben.getByLabel('Amount (€)').fill('30');
	await ben.getByRole('button', { name: 'Add expense' }).click();
	await expect(ben).toHaveURL(groupUrl);

	// Anna's screen catches up within a round of asking
	await expect(page.getByRole('link', { name: /Dinner/ })).toBeVisible({ timeout: 25_000 });
});
