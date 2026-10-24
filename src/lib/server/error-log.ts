// Unexpected errors as one JSON line each (#81), which Workers Logs indexes by field: filter
// by `version` to see a release's errors. Never the URL or form data: group links are secret.
import { version } from '$app/env';

type Failure = { error: unknown; route: string | null; method: string };

export function logError({ error, route, method }: Failure) {
	const { name, message, stack } =
		error instanceof Error ? error : { name: 'NonError', message: String(error), stack: undefined };
	console.error(
		JSON.stringify({ event: 'app_error', version, route, method, name, message, stack })
	);
}
