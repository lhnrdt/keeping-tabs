// Staging-only entry: HTTP Basic auth in front of the whole app, including static
// assets (wrangler.jsonc sets run_worker_first for staging). Production uses worker/app.ts
// directly; its daily cleanup runs here too.
import app from './app.ts';

const REALM = 'Basic realm="Keeping Tabs staging", charset="UTF-8"';

async function sha256(text: string) {
	return crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
}

/** Any username; the password must match STAGING_PASSWORD. */
async function isAuthorized(request: Request, password: string) {
	const header = request.headers.get('Authorization') ?? '';
	if (!header.startsWith('Basic ')) return false;
	let decoded: string;
	try {
		decoded = atob(header.slice('Basic '.length));
	} catch {
		return false;
	}
	const given = decoded.slice(decoded.indexOf(':') + 1);
	// Compare digests so the check takes the same time whatever the input
	return crypto.subtle.timingSafeEqual(await sha256(given), await sha256(password));
}

function noindex(response: Response) {
	const copy = new Response(response.body, response);
	copy.headers.set('X-Robots-Tag', 'noindex');
	return copy;
}

export default {
	async fetch(request, env, ctx) {
		// Fail closed: without a configured password nothing is served
		if (!env.STAGING_PASSWORD) {
			return noindex(new Response('Staging password not configured', { status: 503 }));
		}
		if (!(await isAuthorized(request, env.STAGING_PASSWORD))) {
			return noindex(
				new Response('Authentication required', {
					status: 401,
					headers: { 'WWW-Authenticate': REALM }
				})
			);
		}
		return noindex(await app.fetch!(request, env, ctx));
	},
	scheduled: app.scheduled
} satisfies ExportedHandler<Env>;
