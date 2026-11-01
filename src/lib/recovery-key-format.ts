// Recovery keys (A-16): Crockford base32, shown in groups of four so they're easy to write down.
// Crockford avoids I, L, O and U, and typing is forgiving. They're made in the browser: the server
// never sees one, only a proof derived from it (crypto/vault.ts), since it also opens the person's
// keys (#110). Keys from before that have 20 characters and are still accepted for signing in.
export const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
export const LENGTH = 24;
export const OLD_LENGTH = 20;

/** A new random recovery key (120 bits), formatted for display. */
export function newRecoveryKey(): string {
	const bytes = crypto.getRandomValues(new Uint8Array(LENGTH));
	const chars = [...bytes].map((byte) => ALPHABET[byte % 32]).join('');
	return chars.match(/.{4}/g)!.join('-');
}

/** Canonical form for hashing: uppercase, no separators, look-alikes mapped (O→0, I/L→1). */
export function normalizeRecoveryKey(input: string): string | null {
	const key = input.toUpperCase().replace(/[\s-]/g, '').replace(/O/g, '0').replace(/[IL]/g, '1');
	return (key.length === LENGTH || key.length === OLD_LENGTH) &&
		[...key].every((char) => ALPHABET.includes(char))
		? key
		: null;
}
