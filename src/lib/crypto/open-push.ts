// A notification from an encrypted group (#110): the server only has sealed names and titles, so it
// sends those, and the service worker opens them here. Without the key it shows `fallback` instead:
// the amount, and nothing else about what was added.
import { isSealed, keyIdIn, openText, SEALED_ANYWHERE } from './seal';

export type PushText = {
	title?: string;
	body?: string;
	fallback?: { title: string; body: string };
};

type FindKey = (keyId: string) => Promise<string | undefined>;

async function opened(text: string | undefined, keyFor: FindKey) {
	if (!text) return text;
	const sealed = text.match(SEALED_ANYWHERE) ?? [];
	let result = text;
	for (const part of sealed) {
		if (!isSealed(part)) return null;
		const key = await keyFor(keyIdIn(part));
		if (!key) return null;
		result = result.replace(part, await openText(key, part));
	}
	return result;
}

/** What to show: the text with everything sealed opened, or the fallback if any of it can't be */
export async function openPush<T extends PushText>(payload: T, keyFor: FindKey) {
	const [title, body] = await Promise.all([
		opened(payload.title, keyFor).catch(() => null),
		opened(payload.body, keyFor).catch(() => null)
	]);
	if (title === null || body === null) return { ...payload, ...payload.fallback };
	return { ...payload, title, body };
}
