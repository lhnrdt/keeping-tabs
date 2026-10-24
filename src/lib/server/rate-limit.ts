// Rate limiting (#66) with Cloudflare's rate limit bindings (free; counted per location and
// approximate, which is enough to stop floods and password guessing).
import type { ActionResult } from '$app/forms';
import { error } from '@sveltejs/kit';
import { env } from 'cloudflare:workers';
import { m } from '#lib/paraglide/messages.js';
import type { LimitKind } from './rate-limit-kinds';

type RateLimiter = { limit(options: { key: string }): Promise<{ success: boolean }> };

type LimitEnv = {
	/** "off" in the local preview, where all end-to-end tests come from one address */
	RATE_LIMITS?: string;
	RATE_LIMIT_SECRET?: RateLimiter;
	RATE_LIMIT_NEW_GROUP?: RateLimiter;
	RATE_LIMIT_WRITE?: RateLimiter;
};

const limiterOf = (kind: LimitKind) => {
	const bindings = env as LimitEnv;
	if (bindings.RATE_LIMITS === 'off') return undefined;
	return {
		secret: bindings.RATE_LIMIT_SECRET,
		newGroup: bindings.RATE_LIMIT_NEW_GROUP,
		write: bindings.RATE_LIMIT_WRITE
	}[kind];
};

/** Counts the request; false once `client` went over the limit for this kind */
export async function withinLimit(kind: LimitKind, client: string) {
	const limiter = limiterOf(kind);
	if (!limiter) return true;
	const { success } = await limiter.limit({ key: client });
	return success;
}

/**
 * The answer once over the limit. Forms sent with JavaScript get an action result, so the
 * app shows its error page with the message; others get the static page (src/error.html).
 */
export function tooManyRequests(request: Request) {
	const message = m.rate_limited();
	if (!request.headers.get('accept')?.includes('application/json')) error(429, message);
	const result = {
		type: 'error',
		status: 429,
		error: { status: 429, message }
	} satisfies ActionResult;
	return Response.json(result, { status: 429, headers: { 'retry-after': '60' } });
}
