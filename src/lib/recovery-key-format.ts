// A recovery key as typed, in the one form it's compared and derived from (A-16).
export const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
export const LENGTH = 20;

/** Canonical form for hashing: uppercase, no separators, look-alikes mapped (O→0, I/L→1). */
export function normalizeRecoveryKey(input: string): string | null {
	const key = input.toUpperCase().replace(/[\s-]/g, '').replace(/O/g, '0').replace(/[IL]/g, '1');
	return key.length === LENGTH && [...key].every((char) => ALPHABET.includes(char)) ? key : null;
}
