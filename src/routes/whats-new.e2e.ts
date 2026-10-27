import { expect, test } from '@playwright/test';
import { createGroup, open } from './e2e-helpers';

test('what changed, in plain words, with a dot until read (#212)', async ({ page }) => {
	await createGroup(page, 'Flat', 'Anna', ['Ben']);
	await open(page, '/you');
	const link = page.getByRole('link', { name: /What’s new/ });
	await expect(link).toContainText('New');

	await link.click();
	await expect(page.getByRole('heading', { name: 'What’s new' })).toBeVisible();
	await expect(page.getByText(/Version 0\.13\.0/)).toBeVisible();
	await expect(page.getByText('Search expenses, add notes to them')).toBeVisible();

	// Read: no dot anymore
	await open(page, '/you');
	await expect(page.getByRole('link', { name: /What’s new/ })).not.toContainText('New');
});
