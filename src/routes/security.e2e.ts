import { expect, test } from '@playwright/test';
import { createGroup, open } from './e2e-helpers';

test('pages send security headers and nothing breaks the content security policy', async ({
	page
}) => {
	const violations: string[] = [];
	page.on('console', (message) => {
		if (message.text().includes('Content Security Policy')) violations.push(message.text());
	});

	const response = await page.goto('/welcome');
	const headers = response!.headers();
	expect(headers['content-security-policy']).toContain("frame-ancestors 'none'");
	expect(headers['content-security-policy']).toContain("script-src 'self' 'nonce-");
	expect(headers['referrer-policy']).toBe('same-origin');
	expect(headers['x-content-type-options']).toBe('nosniff');
	expect(headers['strict-transport-security']).toContain('max-age=');

	// A tour of the app: theme script, transitions, forms, the service worker
	const groupUrl = await createGroup(page, 'Trip', 'Anna', ['Ben']);
	await page.getByRole('link', { name: 'Add expense' }).click();
	await page.getByLabel('What was it for?').fill('Pizza');
	await page.getByLabel('Amount (EUR)').fill('30');
	await page.getByRole('button', { name: 'Add expense' }).click();
	await expect(page.getByRole('link', { name: /Pizza/ })).toBeVisible();
	for (const path of [
		`${groupUrl}?tab=balances`,
		`${groupUrl}?tab=group`,
		'/settings',
		'/device'
	]) {
		await open(page, path);
	}
	expect(violations).toEqual([]);
});
