// Hands the creator's member id from "create group" to the group page, which stores
// it as this device's identity. A cookie survives a full page load before hydration,
// unlike a query parameter.

export const creatorCookieName = (groupId: string) => `kt-creator-${groupId}`;

export const CREATOR_COOKIE_OPTIONS = {
	path: '/',
	maxAge: 10 * 60,
	httpOnly: true,
	sameSite: 'lax'
} as const;
