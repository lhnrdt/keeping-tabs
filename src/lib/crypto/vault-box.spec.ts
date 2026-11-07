import { describe, expect, it } from 'vitest';
import { keyIdIn, keyIdOf, newKey } from './seal';
import { boxKeyOf, isBoxed, openBox, putInBox } from './vault-box';

describe('a vault’s box', () => {
	it('has the same public key every time', async () => {
		const vault = newKey();
		const publicKey = await boxKeyOf(vault);
		expect(publicKey).toMatch(/^[\w-]{43}$/);
		expect(await boxKeyOf(vault)).toBe(publicKey);
		expect(await boxKeyOf(newKey())).not.toBe(publicKey);
	});

	it('takes a key from anyone and gives it only to the vault', async () => {
		const vault = newKey();
		const vaultId = await keyIdOf(vault);
		const groupKey = newKey();
		const boxed = await putInBox(vaultId, (await boxKeyOf(vault))!, groupKey);
		expect(keyIdIn(boxed)).toBe(vaultId);
		expect(isBoxed(boxed)).toBe(true);
		expect(boxed).not.toContain(groupKey);
		expect(await openBox(vault, boxed)).toBe(groupKey);
		await expect(openBox(newKey(), boxed)).rejects.toThrow();
	});

	it('notices a box passed off as from someone else', async () => {
		const vault = newKey();
		const boxed = await putInBox(await keyIdOf(vault), (await boxKeyOf(vault))!, newKey());
		const other = await putInBox(await keyIdOf(vault), (await boxKeyOf(vault))!, newKey());
		const [prefix, id, , data] = boxed.split('.');
		const swapped = [prefix, id, other.split('.')[2], data].join('.');
		await expect(openBox(vault, swapped)).rejects.toThrow();
	});
});
