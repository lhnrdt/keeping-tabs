// Recovery keys (A-16): 20 Crockford base32 characters (100 bits), shown in groups of four
// so they're easy to write down. Crockford avoids I, L, O and U, and typing is forgiving.

const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
const LENGTH = 20;

/** A new random recovery key, formatted for display. */
export function newRecoveryKey(): string {
	const bytes = crypto.getRandomValues(new Uint8Array(LENGTH));
	const chars = [...bytes].map((byte) => ALPHABET[byte % 32]).join('');
	return chars.match(/.{4}/g)!.join('-');
}

/** Canonical form for hashing: uppercase, no separators, look-alikes mapped (O→0, I/L→1). */
export function normalizeRecoveryKey(input: string): string | null {
	const key = input.toUpperCase().replace(/[\s-]/g, '').replace(/O/g, '0').replace(/[IL]/g, '1');
	return key.length === LENGTH && [...key].every((char) => ALPHABET.includes(char)) ? key : null;
}
