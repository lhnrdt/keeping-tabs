import { expect, test } from '@playwright/test';
import { createGroup } from './e2e-helpers';

test('a photo of the receipt on an expense, small and only for the group (#52)', async ({
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

	// A large picture, as a phone takes it
	const png = await page.evaluate(() => {
		const canvas = document.createElement('canvas');
		canvas.width = 3000;
		canvas.height = 2000;
		const context = canvas.getContext('2d')!;
		context.fillStyle = '#336699';
		context.fillRect(0, 0, 3000, 2000);
		return canvas.toDataURL('image/png').split(',')[1];
	});
	const receipts = page.getByRole('region', { name: 'Receipt photos' });
	await receipts.getByLabel('From gallery').setInputFiles({
		name: 'receipt.png',
		mimeType: 'image/png',
		buffer: Buffer.from(png, 'base64')
	});
	const photo = receipts.getByRole('img', { name: 'Receipt photo 1' });
	await expect(photo).toBeVisible();
	await expect.poll(() => photo.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBe(1400);

	const address = await photo.getAttribute('src');
	const response = await page.request.get(address!);
	expect(response.headers()['content-type']).toBe('image/jpeg');
	expect((await response.body()).length).toBeLessThan(500_000);

	// Only a JPEG gets in, whatever it calls itself
	const form = page.url();
	const fake = await page.request.post(`${form}?/addReceipt`, {
		headers: { origin: new URL(form).origin, 'x-sveltekit-action': 'true' },
		multipart: {
			photo: { name: 'x.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('<svg></svg>') }
		}
	});
	expect((await fake.json()).type).toBe('failure');

	// Not from another group's link
	const other = await browser.newContext();
	const stranger = await other.newPage();
	const elsewhere = await createGroup(stranger, 'Other', 'Cara', ['Dan']);
	const [, , , , , expenseAndRest] = new URL(address!, form).pathname.split('/');
	const receiptId = address!.split('/').at(-1)!;
	const across = await stranger.request.get(
		`${elsewhere}/expenses/${expenseAndRest}/receipts/${receiptId}`
	);
	expect(across.status()).toBe(404);

	await expect(page.getByRole('link', { name: 'Receipt photo 1' })).toBeVisible();
	await receipts.getByRole('button', { name: 'Remove receipt photo 1' }).click();
	await expect(photo).toHaveCount(0);
});

test('a photo while adding an expense, from the camera or the gallery (#52)', async ({ page }) => {
	const groupUrl = await createGroup(page, 'Flat', 'Anna', ['Ben']);
	await page.getByRole('link', { name: 'Add expense' }).click();
	await page.getByLabel('What was it for?').fill('Dinner');
	await page.getByLabel('Amount (€)').fill('30');

	const png = await page.evaluate(() => {
		const canvas = document.createElement('canvas');
		canvas.width = 300;
		canvas.height = 200;
		const context = canvas.getContext('2d')!;
		context.fillStyle = '#336699';
		context.fillRect(0, 0, 300, 200);
		return canvas.toDataURL('image/png').split(',')[1];
	});
	const file = { name: 'r.png', mimeType: 'image/png', buffer: Buffer.from(png, 'base64') };
	const receipts = page.getByRole('region', { name: 'Receipt photos' });

	// The camera opens right away on a phone
	await expect(receipts.getByLabel('Take a photo')).toHaveAttribute('capture', 'environment');
	await expect(receipts.getByLabel('From gallery')).not.toHaveAttribute('capture');

	await receipts.getByLabel('From gallery').setInputFiles(file);
	await expect(receipts.getByRole('img', { name: 'Receipt photo 1' })).toBeVisible();
	await receipts.getByLabel('Take a photo').setInputFiles(file);
	await expect(receipts.getByRole('img', { name: 'Receipt photo 2' })).toBeVisible();
	await receipts.getByRole('button', { name: 'Remove receipt photo 2' }).click();
	await expect(receipts.getByRole('img', { name: 'Receipt photo 2' })).toHaveCount(0);

	// A mistake elsewhere in the form doesn't lose it
	await page.getByLabel('Amount (€)').fill('abc');
	await page.getByRole('button', { name: 'Add expense' }).click();
	await expect(page.getByRole('alert')).toBeVisible();
	await expect(receipts.getByRole('img', { name: 'Receipt photo 1' })).toBeVisible();
	await page.getByLabel('Amount (€)').fill('30');

	await page.getByRole('button', { name: 'Add expense' }).click();
	await expect(page).toHaveURL(groupUrl);
	await expect(page.getByRole('link', { name: /Dinner/ })).toContainText('with a receipt');
	await page.getByRole('link', { name: /Dinner/ }).click();
	await expect(
		page
			.getByRole('region', { name: 'Receipt photos' })
			.getByRole('img', { name: 'Receipt photo 1' })
	).toBeVisible();
});
