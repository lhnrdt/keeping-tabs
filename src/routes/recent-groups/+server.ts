// The groups this browser remembers (A-6), as they are now: renamed ones with their new name,
// deleted ones left out (#125). Links in the body, not the address: they're secret.
import { error, json } from '@sveltejs/kit';
import { findGroupsByTokens } from '#lib/server/groups.ts';
import type { RequestHandler } from './$types';

/** More than anyone opens; keeps the query within D1's limits */
const MAX_TOKENS = 50;

export const POST: RequestHandler = async ({ locals, request }) => {
	const body: unknown = await request.json().catch(() => null);
	const tokens = (body as { tokens?: unknown } | null)?.tokens;
	if (!Array.isArray(tokens) || tokens.length > MAX_TOKENS) error(400);
	const found = await findGroupsByTokens(
		locals.db,
		tokens.filter((token): token is string => typeof token === 'string')
	);
	return json(found.map(({ shareToken, ...group }) => ({ ...group, token: shareToken })));
};
