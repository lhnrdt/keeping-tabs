import { expect, test } from '@playwright/test';
import { createGroup, open, openFold } from './e2e-helpers';

test('settings are saved and follow you to another device', async ({ browser }) => {
	test.setTimeout(60_000);
	const phone = await (await browser.newContext({ locale: 'en-US' })).newPage();
	await open(phone, '/you/profile');
	// Everything saves as it changes: no Save button
	await phone.getByLabel('Your name').fill('Anna');
	await phone.getByLabel('Your name').press('Tab');
	await expect(phone.getByText('Saved').first()).toBeVisible();
	await open(phone, '/settings');
	await phone.getByRole('group', { name: 'Appearance' }).getByText('Dark').click();
	// The theme switches right away, without reloading
	await expect(phone.locator('html')).toHaveClass(/dark/);
	await expect(phone.getByText('Saved').first()).toBeVisible();
	await phone.getByRole('group', { name: 'Language' }).getByText('Deutsch').click();

	// The page is served again in German
	await expect(phone.getByRole('heading', { name: 'Einstellungen' })).toBeVisible();
	await expect(phone.locator('html')).toHaveAttribute('lang', 'de');
	await expect(phone.locator('html')).toHaveClass(/dark/);
	await open(phone, '/you/profile');
	await expect(phone.getByLabel('Dein Name')).toHaveValue('Anna');

	// A second device linked to Anna starts in German and dark as well
	await open(phone, '/you/devices');
	await openFold(phone, 'Weiteres Gerät hinzufügen');
	await phone.getByRole('button', { name: 'Link erstellen' }).click();
	const link = (await phone.getByLabel('One-Time-Link').inputValue()).trim();
	const laptop = await (await browser.newContext({ locale: 'en-US' })).newPage();
	await open(laptop, link);
	// Not linked yet, so still in its own (English) language
	await laptop.getByRole('button', { name: 'Use this device' }).click();
	await expect(laptop).toHaveURL(/\/$/);
	await open(laptop, '/you/profile');
	await expect(laptop.getByRole('heading', { name: 'Profil' })).toBeVisible();
	await expect(laptop.locator('html')).toHaveClass(/dark/);
	await expect(laptop.getByLabel('Dein Name')).toHaveValue('Anna');
});

test('a chosen light theme wins over a dark device', async ({ browser }) => {
	const page = await (await browser.newContext({ colorScheme: 'dark' })).newPage();
	await open(page, '/settings');
	await expect(page.locator('html')).toHaveClass(/dark/);
	await page.getByRole('group', { name: 'Appearance' }).getByText('Light').click();
	await expect(page.locator('html')).not.toHaveClass(/dark/);
	// Still light after a reload
	await expect(page.getByText('Saved').first()).toBeVisible();
	await page.reload();
	await expect(page.locator('html')).not.toHaveClass(/dark/);
	await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#eaf1ec');
});

test('settings are one tap from the start screen, and lead to profile, devices and backup (#251)', async ({
	page
}) => {
	await open(page, '/you/profile');
	await page.getByLabel('Your name').fill('Anna');
	await page.getByLabel('Your name').press('Tab');
	await expect(page.getByText('Saved').first()).toBeVisible();

	await open(page, '/');
	await page.getByRole('link', { name: 'Anna', exact: true }).click();
	await expect(page).toHaveURL(/\/you$/);
	await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();

	await page.getByRole('link', { name: /Anna/ }).click();
	await expect(page).toHaveURL(/\/you\/profile$/);
	await expect(page.getByLabel('Your name')).toHaveValue('Anna');
	await page.goBack();

	await page.getByRole('link', { name: /Your devices/ }).click();
	await expect(page).toHaveURL(/\/you\/devices$/);
	await page.goBack();

	const backup = page.getByRole('link', { name: /Backup/ });
	await expect(backup).toContainText('Not set up');
	await backup.click();
	await expect(page).toHaveURL(/\/you\/backup$/);
	await expect(
		page.getByRole('button', { name: /Recovery key/ }).or(page.getByText('Recovery key').first())
	).toBeVisible();

	// Problems and ideas go to the project, with the version filled in (#83)
	await open(page, '/you');
	await expect(page.getByRole('link', { name: /Report a problem or idea/ })).toHaveAttribute(
		'href',
		/github\.com.*issues\/new.*App\+version/
	);

	// Old addresses still arrive
	await open(page, '/device');
	await expect(page).toHaveURL(/\/you\/devices$/);
});

test('a group offers your settings from your avatar, and whether you can step back', async ({
	page
}) => {
	const groupUrl = await createGroup(page, 'Flat', 'Anna', ['Ben']);
	await open(page, groupUrl);
	await page.getByTestId('identity').click();
	const menu = page.getByRole('dialog', { name: /Anna/ });
	await menu.getByRole('link', { name: 'Settings' }).click();
	await expect(page).toHaveURL(/\/you$/);
});

test('a scenery brings its colours, switches at once and is remembered (#60)', async ({ page }) => {
	await open(page, '/you');
	await page.getByRole('group', { name: 'Scenery' }).getByText('Fjord', { exact: true }).click();
	await expect(page.locator('html')).toHaveAttribute('data-accent', 'fjord');
	await expect(page.getByText('Saved').first()).toBeVisible();

	// Buttons take the theme's color; after a reload too
	await open(page, '/');
	await expect(page.locator('html')).toHaveAttribute('data-accent', 'fjord');
	await expect(page.getByRole('link', { name: 'New group' })).toHaveCSS(
		'background-color',
		'rgb(34, 78, 129)'
	);
});

test("other colours than the scenery's, kept when the scenery changes (#332)", async ({ page }) => {
	await open(page, '/you');
	await page.getByRole('group', { name: 'Colours' }).getByText('Autumn', { exact: true }).click();
	await expect(page.locator('html')).toHaveAttribute('data-accent', 'autumn');
	await page.getByRole('group', { name: 'Scenery' }).getByText('Coast', { exact: true }).click();
	await expect(page.locator('html')).toHaveAttribute('data-accent', 'autumn');
	await expect(page.getByText('Saved').first()).toBeVisible();

	// Back to the scenery's own, saved before leaving the page
	const saved = page.waitForResponse((r) => r.url().includes('/colors') && r.ok());
	await page.getByRole('group', { name: 'Colours' }).getByText('Like the scenery').click();
	await expect(page.locator('html')).toHaveAttribute('data-accent', 'coast');
	await saved;
	await open(page, '/');
	await expect(page.locator('html')).toHaveAttribute('data-accent', 'coast');
});

test('a new scenery every day (#332)', async ({ page }) => {
	await open(page, '/you');
	await page.getByRole('group', { name: 'Scenery' }).getByText('A new one every day').click();
	await expect(page.getByText('Saved').first()).toBeVisible();
	await open(page, '/');
	await expect(page.locator('html')).toHaveAttribute(
		'data-accent',
		/^(forest|fjord|mountains|heather|birch|meadow|coast|aurora|autumn)$/
	);
});

test('choose an avatar and see it wherever you appear (#61)', async ({ page }) => {
	const groupUrl = await createGroup(page, 'Trip', 'Anna', ['Ben']);
	await open(page, '/you/profile');
	await page.getByRole('group', { name: 'Color' }).getByTitle('Moss').click();
	await page.getByRole('group', { name: 'Picture' }).getByTitle('Deer').click();
	await expect(page.getByRole('radio', { name: 'Deer' })).toBeChecked();
	await expect(page.getByText('Saved').first()).toBeVisible();

	// In the group: your pill and balance show the deer, not initials
	await open(page, `${groupUrl}?tab=group`);
	const members = page.getByRole('list', { name: 'Members' });
	await expect(members.locator('li').filter({ hasText: 'Anna' }).locator('svg')).toBeVisible();
	await expect(
		members.locator('li').filter({ hasText: 'Ben' }).locator('[data-initials="B"]')
	).toBeVisible();

	// And on the start screen's profile button, after a reload
	await open(page, '/');
	await expect(page.getByRole('link', { name: 'Anna', exact: true }).locator('svg')).toBeVisible();
});

test('draw your own avatar, and see it wherever you appear (#158)', async ({ page }) => {
	const groupUrl = await createGroup(page, 'Trip', 'Anna', ['Ben']);
	await open(page, '/you/profile');
	await page.getByRole('group', { name: 'Picture' }).getByText('Draw your own').click();
	const pad = page.getByRole('img', { name: 'Drawing area' });
	await pad.scrollIntoViewIfNeeded();
	const box = (await pad.boundingBox())!;
	// Big enough to draw with a finger: as wide as the page's content (#329)
	const room = await pad.evaluate((el) => {
		const parent = getComputedStyle(el.parentElement!);
		return (
			el.parentElement!.clientWidth -
			parseFloat(parent.paddingLeft) -
			parseFloat(parent.paddingRight)
		);
	});
	expect(box.width).toBeCloseTo(room, 0);
	expect(box.height).toBeCloseTo(box.width, 0);
	await page.mouse.move(box.x + box.width * 0.3, box.y + box.height * 0.3);
	await page.mouse.down();
	await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.6, { steps: 8 });
	await page.mouse.move(box.x + box.width * 0.7, box.y + box.height * 0.3, { steps: 8 });
	await page.mouse.up();
	await expect(page.getByText('Saved').first()).toBeVisible();

	// Kept, and shown in the group as a line drawing
	await open(page, `${groupUrl}?tab=group`);
	const anna = page
		.getByRole('list', { name: 'Members' })
		.locator('li')
		.filter({ hasText: 'Anna' });
	await expect(anna.locator('svg path')).toHaveAttribute('d', /^M\d+ \d+L/);

	// Only lines get through, whatever's sent
	const refused = await page.request.post('/you/profile?/avatar', {
		headers: { origin: new URL(groupUrl).origin },
		form: { icon: 'drawn', tint: 'sky', width: '1', drawing: 'M1 1"/><script>alert(1)</script>' }
	});
	expect(await refused.text()).toContain('settings_invalid');
});
