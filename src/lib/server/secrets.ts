// Random secrets and their hashes. Secrets are only ever stored hashed.

/** URL-safe random secret with the given number of random bytes. */
export function randomSecret(bytes: number): string {
	const random = crypto.getRandomValues(new Uint8Array(bytes));
	return btoa(String.fromCharCode(...random))
		.replace(/\+/g, '-')
		.replace(/\//g, '_')
		.replace(/=+$/, '');
}

/** SHA-256 of a secret, hex encoded. Secrets have ≥128 random bits, so no salt is needed. */
export async function hashSecret(secret: string): Promise<string> {
	const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(secret));
	return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}
