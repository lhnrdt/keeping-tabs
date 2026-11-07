import { expect, test } from '@playwright/test';
import { createGroup, open } from './e2e-helpers';

const notified = (page: import('@playwright/test').Page, event: string) =>
	page.waitForResponse(
		(response) =>
			response.url().endsWith('/notify') && (response.request().postData() ?? '').includes(event)
	);

test('a payment, a change, a comment and someone joining each tell the group once (#267)', async ({
	page,
	browser
}) => {
	const groupUrl = await createGroup(page, 'Told', 'Anna', ['Ben']);
	await page.getByRole('link', { name: 'Add expense' }).click();
	await page.getByLabel('What was it for?').fill('Dinner');
	await page.getByLabel('Amount (€)').fill('40');
	await page.getByRole('button', { name: 'Add expense' }).click();
	await expect(page).toHaveURL(groupUrl);

	// Someone joins
	const ben = await (await browser.newContext()).newPage();
	await open(ben, groupUrl);
	const joined = notified(ben, 'joined');
	await ben.getByRole('button', { name: "I'm Ben" }).click();
	expect(await (await joined).json()).toEqual({ sent: true });

	// A comment
	await page.getByRole('link', { name: /Dinner/ }).click();
	const commented = notified(page, 'comment');
	await page.getByLabel('Your comment').fill('Lovely');
	await page.getByRole('button', { name: 'Send' }).click();
	expect(await (await commented).json()).toEqual({ sent: true });

	// A change
	const changed = notified(page, 'changed');
	await page.getByLabel('Amount (€)').fill('45');
	await page.getByRole('button', { name: 'Save' }).click();
	expect(await (await changed).json()).toEqual({ sent: true });

	// A payment
	await open(page, `${groupUrl}/payments/new`);
	await page.getByLabel('Amount (€)').fill('22.50');
	const paid = notified(page, 'payment');
	await page.getByRole('button', { name: 'Record payment' }).click();
	expect(await (await paid).json()).toEqual({ sent: true });

	// Only once each
	const again = await page.request.post(`${groupUrl}/notify`, {
		headers: { origin: new URL(groupUrl).origin },
		multipart: { event: 'payment' }
	});
	expect(await again.json()).toEqual({ sent: false });
});
