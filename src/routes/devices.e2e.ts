import { expect, test } from '@playwright/test';
import { createGroup, open, openFold } from './e2e-helpers';

const PHONE =
	'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0 Mobile Safari/537.36';
const LAPTOP = 'Mozilla/5.0 (X11; Linux x86_64; rv:144.0) Gecko/20100101 Firefox/144.0';

test('see your devices and remove one you no longer use (#126, #151)', async ({ browser }) => {
	const phone = await (await browser.newContext({ userAgent: PHONE })).newPage();
	const groupUrl = await createGroup(phone, 'Trip', 'Anna', ['Ben']);

	// Anna adds her laptop with a one-time link
	await open(phone, '/you/devices');
	await openFold(phone, 'Add another device');
	await phone.getByRole('button', { name: 'Create link' }).click();
	const link = (await phone.getByRole('listitem', { name: 'One-time link' }).innerText()).trim();
	const laptop = await (await browser.newContext({ userAgent: LAPTOP })).newPage();
	await open(laptop, link);
	await laptop.getByRole('button', { name: 'Use this device' }).click();
	await open(laptop, groupUrl);
	await expect(laptop.getByTestId('identity')).toHaveText('Anna');

	// Both are listed by name; this one is marked and can't remove itself
	await open(phone, '/you/devices');
	const devices = phone.getByRole('region', { name: 'Your devices' });
	await expect(devices.getByRole('listitem')).toHaveCount(2);
	const thisOne = devices.getByRole('listitem').filter({ hasText: 'This device' });
	await expect(thisOne).toContainText('Chrome · Android');
	await expect(thisOne.getByRole('button', { name: 'Remove' })).toHaveCount(0);
	const other = devices.getByRole('listitem').filter({ hasText: 'Firefox · Linux' });
	await expect(other).toContainText('Last used');
	await phone.screenshot({
		path: '/tmp/claude-1000/-home-proto-keeping-tabs/eec575c7-301c-4634-b4d9-3c7346c3db6e/scratchpad/devices.png',
		fullPage: true
	});

	await other.getByRole('button', { name: 'Remove' }).click();
	await phone
		.getByRole('dialog', { name: 'Remove Firefox · Linux?' })
		.getByRole('button', { name: 'Remove' })
		.click();
	await expect(devices.getByRole('listitem')).toHaveCount(1);

	// The laptop isn't Anna anymore: the group asks who it is
	await open(laptop, groupUrl);
	await expect(laptop.getByRole('heading', { name: 'Join Trip' })).toBeVisible();
});
