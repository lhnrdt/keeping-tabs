// Opens what the server sent (#110): every sealed text in a page's data becomes readable here,
// in the browser, before anything shows. The server only ever passes sealed text along.
import { m } from '#lib/paraglide/messages.js';
import { keyFor, takeKeyFromAddress } from './keyring';
import { isSealed, keyIdIn, openText } from './seal';

const browser = typeof window !== 'undefined';

const openOne = async (sealed: string) => {
	if (!browser) return '…';
	const key = await keyFor(keyIdIn(sealed));
	if (!key) return m.locked_text();
	return openText(key, sealed).catch(() => m.locked_text());
};

/** A copy of the data with all sealed text opened; on the server, dots until the browser's turn */
export async function openDeep<T>(data: T): Promise<T> {
	if (isSealed(data)) return (await openOne(data)) as T;
	if (Array.isArray(data)) return (await Promise.all(data.map(openDeep))) as T;
	if (data && typeof data === 'object' && Object.getPrototypeOf(data) === Object.prototype) {
		const entries = await Promise.all(
			Object.entries(data).map(async ([name, value]) => [name, await openDeep(value)])
		);
		return Object.fromEntries(entries) as T;
	}
	return data;
}

/** What each page and layout with a group's text loads with */
export const openedLoad = async <T>(data: T) => {
	if (browser) await takeKeyFromAddress();
	return openDeep(data);
};
