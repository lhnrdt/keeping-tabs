import { describe, expect, it } from 'vitest';
import { openPush } from './open-push';
import { keyIdOf, newKey, sealText } from './seal';

describe('openPush', () => {
	const fallback = { title: 'Keeping Tabs', body: 'A new expense · €5.00' };

	it('opens sealed text within the sentence', async () => {
		const key = newKey();
		const keyId = await keyIdOf(key);
		const shown = await openPush(
			{
				title: await sealText(key, 'Trip'),
				body: `${await sealText(key, 'Anna')} added ${await sealText(key, 'Pizza', 'title_x')} · €5.00`,
				fallback
			},
			async (id) => (id === keyId ? key : undefined)
		);
		expect(shown.title).toBe('Trip');
		expect(shown.body).toBe('Anna added Pizza · €5.00');
	});

	it('shows the fallback without the key', async () => {
		const sealed = await sealText(newKey(), 'Trip');
		const shown = await openPush({ title: sealed, body: 'x', fallback }, async () => undefined);
		expect(shown.title).toBe(fallback.title);
		expect(shown.body).toBe(fallback.body);
	});

	it('leaves plain text alone', async () => {
		const shown = await openPush({ title: 'Trip', body: 'Pizza' }, async () => undefined);
		expect(shown.body).toBe('Pizza');
	});
});
