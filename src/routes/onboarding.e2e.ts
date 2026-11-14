import { expect, test, type Page } from '@playwright/test';
import { acceptNote, enterPassword, keepPlain } from './e2e-helpers';

/** As a real browser: the onboarding stays quiet for automated ones */
const asPerson = (page: Page) =>
	page.addInitScript(() => Object.defineProperty(navigator, 'webdriver', { get: () => false }));

async function firstVisit(page: Page) {
	await asPerson(page);
	await page.goto('/');
	await enterPassword(page);
	await acceptNote(page);
}

const bubble = (page: Page) => page.locator('.driver-popover');

test('a welcome, then a tour of the start screen and of a group, tapping through (#331)', async ({
	page
}) => {
	test.setTimeout(90_000);
	await firstVisit(page);
	await expect(bubble(page)).toContainText('Welcome to Keeping Tabs');
	await bubble(page).getByRole('button', { name: 'Show me around' }).click();
	await expect(bubble(page)).toContainText('Start a group');
	await bubble(page).getByRole('button', { name: 'Next' }).click();
	await expect(bubble(page)).toContainText('Your name and picture');
	await bubble(page).getByRole('button', { name: 'Next' }).click();
	await bubble(page).getByRole('button', { name: 'Got it' }).click();
	await expect(bubble(page)).toHaveCount(0);

	// Once: not again on this device
	await page.reload();
	await page.waitForLoadState('networkidle');
	await expect(bubble(page)).toHaveCount(0);

	// The first group: its own tour, no second welcome, going on by tapping the tabs it points at
	await page.goto('/new');
	await page.getByLabel('Group name').fill('Lisbon');
	await page.getByLabel('Your name').fill('Anna');
	await keepPlain(page);
	await page.getByRole('button', { name: 'Create group' }).click();
	await expect(bubble(page)).toContainText('Your group');
	await bubble(page).getByRole('button', { name: 'Next' }).click();
	await bubble(page).getByRole('button', { name: 'Next' }).click();
	await expect(bubble(page)).toContainText('Tap Balances');
	await page.getByRole('link', { name: 'Balances' }).click();
	await expect(bubble(page)).toContainText('Everyone’s balance');
	await bubble(page).getByRole('button', { name: 'Next' }).click();
	await page.getByRole('link', { name: 'Group' }).click();
	await expect(bubble(page)).toContainText('Send them this link');
	await bubble(page).getByRole('button', { name: 'Got it' }).click();
	await expect(bubble(page)).toHaveCount(0);

	// The first expense: the form, the split above all
	await page.getByRole('link', { name: 'Expenses', exact: true }).click();
	await page.getByRole('link', { name: 'Add expense' }).click();
	await expect(bubble(page)).toContainText('What was it for?');
	for (let i = 0; i < 3; i++) await bubble(page).getByRole('button', { name: 'Next' }).click();
	await expect(bubble(page)).toContainText('item by item from the receipt');
	await bubble(page).getByRole('button', { name: 'Next' }).click();
	await bubble(page).getByRole('button', { name: 'Got it' }).click();
	await expect(bubble(page)).toHaveCount(0);

	// Asked for again: from the start
	await page.goto('/how-it-works');
	await page.getByRole('button', { name: 'Start the tour again' }).click();
	await expect(bubble(page)).toContainText('Welcome to Keeping Tabs');
});

test('not now means none of it (#331)', async ({ page }) => {
	test.setTimeout(90_000);
	await firstVisit(page);
	await bubble(page).getByRole('button', { name: 'Not now' }).click();
	await expect(bubble(page)).toHaveCount(0);
	await page.goto('/new');
	await page.getByLabel('Group name').fill('Flat');
	await page.getByLabel('Your name').fill('Anna');
	await keepPlain(page);
	await page.getByRole('button', { name: 'Create group' }).click();
	await page.waitForLoadState('networkidle');
	await expect(bubble(page)).toHaveCount(0);
});

test('a tip comes once the tours are done, when there is an entry (#331)', async ({ page }) => {
	test.setTimeout(90_000);
	// Someone who has been through the tours already
	await page.addInitScript(() =>
		localStorage.setItem('kt-onboarding', JSON.stringify(['welcome', 'home', 'group', 'expense']))
	);
	await firstVisit(page);
	await page.goto('/new');
	await page.getByLabel('Group name').fill('Trip');
	await page.getByLabel('Your name').fill('Ben');
	await keepPlain(page);
	await page.getByRole('button', { name: 'Create group' }).click();
	await page.getByRole('link', { name: 'Add expense' }).click();
	await page.getByLabel('What was it for?').fill('Pizza');
	await page.getByLabel('Amount (€)').fill('20');
	await page.getByRole('button', { name: 'Add expense' }).click();
	await expect(page.getByRole('link', { name: /Pizza/ })).toBeVisible();
	await page.reload();
	await page.locator('.driver-hint').click();
	await expect(bubble(page)).toContainText('Swipe an entry to the left');
});
