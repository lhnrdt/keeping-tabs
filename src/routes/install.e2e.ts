import { expect, test } from '@playwright/test';
import { open } from './e2e-helpers';

const IPHONE =
	'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';

test('on an iPhone, the way to install it is shown, until put off, and in Settings (#352)', async ({
	browser
}) => {
	const page = await (await browser.newContext({ userAgent: IPHONE })).newPage();
	await open(page, '/');
	const card = page.getByRole('region', { name: 'Keeping Tabs on your home screen' });
	await expect(card.getByRole('list', { name: 'How to add it in Safari' })).toContainText(
		'Choose Add to Home Screen'
	);
	await card.getByRole('button', { name: 'Not now' }).click();
	await expect(card).toHaveCount(0);
	await page.reload();
	await expect(card).toHaveCount(0);

	await open(page, '/you');
	await page.getByRole('button', { name: 'Install as app' }).click();
	await expect(page.getByRole('list', { name: 'How to add it in Safari' })).toBeVisible();
});

test('where the browser offers it, our button opens its install dialog (#352)', async ({
	page
}) => {
	await open(page, '/');
	// What Chrome sends when the app can be installed, with its dialog answered "install"
	await page.evaluate(() => {
		const offer = Object.assign(new Event('beforeinstallprompt', { cancelable: true }), {
			prompt: async () => {
				(window as unknown as { prompted: boolean }).prompted = true;
			},
			userChoice: Promise.resolve({ outcome: 'accepted' })
		});
		window.dispatchEvent(offer);
	});
	const card = page.getByRole('region', { name: 'Keeping Tabs on your home screen' });
	await card.getByRole('button', { name: 'Install' }).click();
	await expect
		.poll(() => page.evaluate(() => (window as unknown as { prompted?: boolean }).prompted))
		.toBe(true);
	await expect(card).toHaveCount(0);
});
