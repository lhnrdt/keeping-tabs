import { describe, expect, it } from 'vitest';
import {
	isKey,
	isSealed,
	keyIdIn,
	keyIdOf,
	newKey,
	openBytes,
	openText,
	sealBytes,
	sealText
} from './seal';

describe('sealing', () => {
	it('gives text back only with its key', async () => {
		const key = newKey();
		const sealed = await sealText(key, 'Grüße, 🍕 & "Quotes"');
		expect(isSealed(sealed)).toBe(true);
		expect(sealed).not.toContain('Gr');
		expect(keyIdIn(sealed)).toBe(await keyIdOf(key));
		expect(await openText(key, sealed)).toBe('Grüße, 🍕 & "Quotes"');
		await expect(openText(newKey(), sealed)).rejects.toThrow();
	});

	it('never seals the same text the same way', async () => {
		const key = newKey();
		expect(await sealText(key, 'Rent')).not.toBe(await sealText(key, 'Rent'));
	});

	it('notices tampering', async () => {
		const key = newKey();
		const sealed = await sealText(key, 'Rent');
		const last = sealed.at(-2) === 'A' ? 'B' : 'A';
		await expect(openText(key, sealed.slice(0, -2) + last + sealed.at(-1))).rejects.toThrow();
	});

	it('takes bytes, like a photo', async () => {
		const key = newKey();
		const bytes = new Uint8Array(200_000).map((_, i) => i % 251);
		expect(await openBytes(key, await sealBytes(key, bytes))).toEqual(bytes);
	});

	it('tells keys and sealed text from anything else', () => {
		expect(isKey(newKey())).toBe(true);
		expect(isKey('short')).toBe(false);
		expect(isSealed('Dinner')).toBe(false);
		expect(isSealed('enc1.short.abc')).toBe(false);
	});
});
