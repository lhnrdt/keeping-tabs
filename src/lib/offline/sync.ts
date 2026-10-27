// Sends expenses kept while offline (#55): when the connection comes back, when the app
// opens, and every half minute while some wait. A refusal (not a network error) is kept as
// failed, for the person to see; the rest stay to try again.
import { deserialize } from '$app/forms';
import { invalidateAll } from '$app/navigation';
import type { ErrorCode } from '#lib/errors.ts';
import { drop, markFailed, pendingItems } from './outbox';

const RETRY_MS = 30_000;
let running = false;

async function send(item: ReturnType<typeof pendingItems>[number]) {
	const body = new FormData();
	for (const [key, value] of item.fields) body.append(key, value);
	const response = await fetch(item.action, {
		method: 'POST',
		body,
		headers: { accept: 'application/json', 'x-sveltekit-action': 'true' }
	});
	return deserialize(await response.text());
}

/** Tries everything waiting; true when something reached the server */
export async function flushOutbox() {
	if (running || !navigator.onLine) return false;
	running = true;
	let sent = false;
	try {
		for (const item of pendingItems().filter((each) => !each.failed)) {
			let result;
			try {
				result = await send(item);
			} catch {
				break; // Still offline: try again later
			}
			if (result.type === 'success' || result.type === 'redirect') {
				drop(item.id);
				sent = true;
			} else if (result.type === 'failure') {
				const error = (result.data as { error?: ErrorCode } | undefined)?.error;
				markFailed(item.id, error ?? 'amount_invalid');
			}
		}
	} finally {
		running = false;
	}
	if (sent) await invalidateAll();
	return sent;
}

/** Starts syncing on this page; returns how to stop */
export function startSync() {
	const flush = () => void flushOutbox();
	flush();
	window.addEventListener('online', flush);
	const timer = setInterval(() => {
		if (pendingItems().some((item) => !item.failed)) flush();
	}, RETRY_MS);
	return () => {
		window.removeEventListener('online', flush);
		clearInterval(timer);
	};
}
