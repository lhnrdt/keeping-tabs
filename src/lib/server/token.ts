const TOKEN_BYTES = 16; // 128 bits (A-2)

export const SHARE_TOKEN_PATTERN = /^[A-Za-z0-9_-]{22}$/;

/** Random, URL-safe secret for a group's share link. */
export function newShareToken(): string {
	const bytes = crypto.getRandomValues(new Uint8Array(TOKEN_BYTES));
	return btoa(String.fromCharCode(...bytes))
		.replace(/\+/g, '-')
		.replace(/\//g, '_')
		.replace(/=+$/, '');
}
