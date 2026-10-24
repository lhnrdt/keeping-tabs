// Which rate limit applies to a request (#66). The limits themselves are in wrangler.jsonc.

/** Guessing a secret (password, device link, recovery key, passkey), creating groups, other writes */
export type LimitKind = 'secret' | 'newGroup' | 'write';

const SECRET_PATHS = ['/welcome', '/device/link', '/device/passkey/login'];

/** Reading is free; every change counts, guessing a secret counts the most */
export function limitKindOf(method: string, url: URL): LimitKind | null {
	if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') return null;
	const { pathname, search } = url;
	if (SECRET_PATHS.includes(pathname)) return 'secret';
	// Restoring with a recovery key is an action of the devices page
	if (pathname === '/you/devices' && search.startsWith('?/restore')) return 'secret';
	if (pathname === '/new') return 'newGroup';
	return 'write';
}
