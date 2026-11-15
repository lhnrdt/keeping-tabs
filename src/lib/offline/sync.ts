// Sends what's kept on the device (#55, #347): when the connection comes back, when the app
// opens, and every half minute while some wait. A refusal (not a network error) is kept as
// failed, for the person to see; the rest stay to try again.
import { deserialize } from '$app/forms';
import { invalidateAll } from '$app/navigation';
import { resolve } from '$app/paths';
import type { ErrorCode } from '#lib/errors.ts';
import { announceExpense } from '#lib/expense/announce.ts';
import { announceEvent } from '#lib/push/announce-event.ts';
import { wantFresh } from './freshness';
import { refreshReady } from './ready';
import { drop, markFailed, pendingItems } from './outbox';

const RETRY_MS = 30_000;
let running = false;
let again = false;

async function send(item: ReturnType<typeof pendingItems>[number]) {
	const body = new FormData();
	for (const [key, value] of item.fields) body.append(key, value);
	const response = await fetch(item.action, {
		method: 'POST',
		body,
		headers: { accept: 'application/json', 'x-sveltekit-action': 'true' },
		// Saved instantly and the page left right after: it still goes out
		keepalive: true
	});
	return { result: deserialize(await response.text()), status: response.status };
}

/** Tries everything waiting; true when something reached the server */
export async function flushOutbox() {
	if (!navigator.onLine) return false;
	// Kept while sending the others: it goes in the same round
	if (running) {
		again = true;
		return false;
	}
	running = true;
	const reached = new Set<string>();
	try {
		do {
			again = false;
			for (const token of await sendAll()) reached.add(token);
		} while (again && navigator.onLine);
	} finally {
		running = false;
	}
	if (reached.size === 0) return false;
	wantFresh();
	// The group as kept for offline has them too
	refreshReady([...reached].map((token) => resolve('/g/[token]', { token })));
	await invalidateAll();
	return true;
}

/** One pass over what's waiting; the groups whose changes reached the server */
async function sendAll() {
	const reached = new Set<string>();
	for (const item of pendingItems().filter((each) => !each.failed)) {
		let result, status;
		try {
			({ result, status } = await send(item));
		} catch {
			break; // Still offline: try again later
		}
		if (result.type === 'success' || result.type === 'redirect') {
			drop(item.id);
			reached.add(item.token);
			if ((item.kind ?? 'add') === 'add') void announceExpense(item.token, item.id);
			else if (item.announce) announceEvent(item.announce, item.token);
		} else if (result.type === 'failure') {
			const error = (result.data as { error?: ErrorCode } | undefined)?.error;
			markFailed(item.id, error ?? 'amount_invalid');
		} else if (result.type === 'error' && status === 404) {
			// Deleted meanwhile, from another device: the deletion wins (#347)
			drop(item.id);
			reached.add(item.token);
		} else if (result.type === 'error' && status === 409) {
			// Kept from before its group was encrypted: it can't go as it is, and must not wait forever
			markFailed(item.id, 'offline_group_encrypted');
		}
	}
	return reached;
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
