// Recovery keys (A-16): 20 Crockford base32 characters (100 bits), shown in groups of four
// so they're easy to write down. Crockford avoids I, L, O and U, and typing is forgiving.

import { ALPHABET, LENGTH } from '#lib/recovery-key-format.ts';

/** A new random recovery key, formatted for display. */
export function newRecoveryKey(): string {
	const bytes = crypto.getRandomValues(new Uint8Array(LENGTH));
	const chars = [...bytes].map((byte) => ALPHABET[byte % 32]).join('');
	return chars.match(/.{4}/g)!.join('-');
}

export { normalizeRecoveryKey } from '#lib/recovery-key-format.ts';
