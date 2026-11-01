// Random secrets and their hashes. Secrets are only ever stored hashed.

/** URL-safe random secret with the given number of random bytes. */
export function randomSecret(bytes: number): string {
	const random = crypto.getRandomValues(new Uint8Array(bytes));
	return btoa(String.fromCharCode(...random))
		.replace(/\+/g, '-')
		.replace(/\//g, '_')
		.replace(/=+$/, '');
}

/** Looks at every byte, whatever differs, so the check takes the same time whatever is typed */
export function sameBytes(a: Uint8Array, b: Uint8Array) {
	if (a.length !== b.length) return false;
	let difference = 0;
	for (let i = 0; i < a.length; i++) difference |= a[i] ^ b[i];
	return difference === 0;
}

/** SHA-256 of a secret, hex encoded. Secrets have ≥128 random bits, so no salt is needed. */
export async function hashSecret(secret: string): Promise<string> {
	const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(secret));
	return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}
