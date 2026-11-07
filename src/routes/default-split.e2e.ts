import { expect, test } from '@playwright/test';
import { splitBy, createGroup, open } from './e2e-helpers';

test('a group remembers a split for its new expenses (#41)', async ({ page }) => {
	const groupUrl = await createGroup(page, 'Anna & Ben', 'Anna', ['Ben']);
	await page.getByRole('link', { name: 'Add expense' }).click();
	await page.getByLabel('What was it for?').fill('Rent');
	await page.getByLabel('Amount (€)').fill('1000');
	await splitBy(page, 'Percent');
	await page.getByLabel('Percent for Anna').fill('60');
	await page.getByLabel('Percent for Ben').fill('40');
	await page.getByLabel('Use this split for new expenses').check();
	await page.getByRole('button', { name: 'Add expense' }).click();
	await expect(page).toHaveURL(groupUrl);

	// The next expense starts that way
	await page.getByRole('link', { name: 'Add expense' }).click();
	await expect(page.getByLabel('Percent for Anna')).toHaveValue('60');
	await expect(page.getByLabel('Percent for Ben')).toHaveValue('40');

	// Shown with the group, and set from there (#306)
	await open(page, `${groupUrl}?tab=group`);
	const details = page.getByRole('region', { name: 'Details' });
	await expect(details).toContainText('Anna 60 % · Ben 40 %');
	await details.getByRole('link', { name: /New expenses split/ }).click();
	await expect(page.getByLabel('Percent for Anna')).toHaveValue('60');
	await page.getByLabel('Split', { exact: true }).selectOption('shares');
	await page.getByLabel('Parts for Anna').fill('2');
	await page.getByLabel('Parts for Ben').fill('1');
	await page.getByRole('button', { name: 'Save' }).click();
	await expect(details).toContainText('Anna 2 · Ben 1');
	await open(page, `${groupUrl}/expenses/new`);
	await expect(page.getByLabel('Split', { exact: true })).toHaveValue('shares');
	await expect(page.getByLabel('Parts for Anna')).toHaveValue('2');

	// And back to equal
	await open(page, `${groupUrl}/split`);
	await page.getByLabel('Split', { exact: true }).selectOption('equal');
	await page.getByRole('button', { name: 'Save' }).click();
	await expect(details).toContainText('Equally');
	await open(page, `${groupUrl}/expenses/new`);
	await expect(page.getByLabel('Split', { exact: true })).toHaveValue('equal');
});

test('an encrypted group’s split for new expenses is set the same way (#306)', async ({ page }) => {
	await open(page, '/new');
	await page.getByLabel('Group name').fill('Sealed split');
	await page.getByLabel('Your name').fill('Anna');
	await page.getByLabel('Add a person').fill('Ben');
	await page.getByLabel('Add a person').press('Enter');
	await page.getByRole('button', { name: 'Create group' }).click();
	await expect(page.getByRole('heading', { name: 'Sealed split' })).toBeVisible();
	const groupUrl = page.url().split('#')[0];
	await open(page, `${groupUrl}/split`);
	await page.getByLabel('Split', { exact: true }).selectOption('percent');
	await page.getByLabel('Percent for Anna').fill('70');
	await page.getByLabel('Percent for Ben').fill('20');
	await page.getByRole('button', { name: 'Save' }).click();
	await expect(page.getByRole('alert').first()).toBeVisible();
	await page.getByLabel('Percent for Ben').fill('30');
	await page.getByRole('button', { name: 'Save' }).click();
	await expect(page.getByRole('region', { name: 'Details' })).toContainText('Anna 70 % · Ben 30 %');
	const raw = await (await page.request.get(`${groupUrl}/__data.json`)).text();
	expect(raw).not.toContain('7000');
});
