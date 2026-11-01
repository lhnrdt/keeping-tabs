import { expect, test } from '@playwright/test';
import { acceptNote, createGroup } from './e2e-helpers';

test('a group talks about an expense; everyone removes only their own comments (#49)', async ({
	page,
	browser
}) => {
	const groupUrl = await createGroup(page, 'Flat', 'Anna', ['Ben']);
	await page.getByRole('link', { name: 'Add expense' }).click();
	await page.getByLabel('What was it for?').fill('Dinner');
	await page.getByLabel('Amount (€)').fill('30');
	await page.getByRole('button', { name: 'Add expense' }).click();
	await expect(page).toHaveURL(groupUrl);

	await page.getByRole('link', { name: /Dinner/ }).click();
	const comments = page.getByRole('region', { name: 'Comments' });
	await expect(comments).toContainText('No comments yet');
	await comments.getByRole('button', { name: 'Send' }).click();
	await expect(comments.getByRole('alert')).toContainText('Write something first');
	await comments.getByLabel('Your comment').fill('Was the tip included?');
	await comments.getByRole('button', { name: 'Send' }).click();
	await expect(comments.getByRole('listitem')).toContainText('Was the tip included?');
	await expect(comments.getByLabel('Your comment')).toHaveValue('');

	// Ben sees it and can't remove it
	const ben = await (await browser.newContext()).newPage();
	await ben.goto(groupUrl);
	await acceptNote(ben);
	await ben.getByRole('button', { name: "I'm Ben" }).click();
	await expect(ben.getByTestId('identity')).toHaveText('Ben');
	await expect(ben.getByRole('link', { name: /Dinner/ })).toContainText('1 comment');
	await ben.getByRole('link', { name: /Dinner/ }).click();
	const bens = ben.getByRole('region', { name: 'Comments' });
	await expect(bens).toContainText('Was the tip included?');
	await expect(bens.getByRole('button', { name: 'Remove' })).toHaveCount(0);

	// Anna can, and the activity tells
	await comments.getByRole('button', { name: 'Remove' }).click();
	await expect(comments).toContainText('No comments yet');
	await page.goto(`${groupUrl}/activity`);
	await expect(page.getByText('Anna commented on “Dinner”')).toBeVisible();
	await expect(page.getByText('Anna removed a comment on “Dinner”')).toBeVisible();
});
