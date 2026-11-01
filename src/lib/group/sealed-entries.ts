// An encrypted group's entries for working out its money (#110): kept sealed on this device and
// only what's changed fetched, for speed and so it still works without a connection (#277). In
// IndexedDB when it can be, otherwise for as long as the page lasts.
import { openDeep } from '#lib/crypto/open-data.ts';
import { mergeEntries, type EntriesAnswer, type KeptEntry } from './merge-entries';

const DATABASE = 'keeping-tabs-entries';
const STORE = 'groups';

type Kept<T> = { asOf: number; rows: T[] };

const memory = new Map<string, Kept<unknown>>();

function database() {
	return new Promise<IDBDatabase>((resolve, reject) => {
		const request = indexedDB.open(DATABASE, 1);
		request.onupgradeneeded = () => request.result.createObjectStore(STORE);
		request.onsuccess = () => resolve(request.result);
		request.onerror = () => reject(request.error);
	});
}

async function withStore<T>(
	mode: IDBTransactionMode,
	use: (store: IDBObjectStore) => IDBRequest<T>
) {
	const db = await database();
	return new Promise<T>((resolve, reject) => {
		const request = use(db.transaction(STORE, mode).objectStore(STORE));
		request.onsuccess = () => resolve(request.result);
		request.onerror = () => reject(request.error);
	});
}

async function keptOf<T>(groupId: string) {
	const known = memory.get(groupId) as Kept<T> | undefined;
	if (known) return known;
	const stored = await withStore<Kept<T> | undefined>('readonly', (store) =>
		store.get(groupId)
	).catch(() => undefined);
	if (stored) memory.set(groupId, stored);
	return stored;
}

/** When someone deletes their identity */
export async function forgetEntries() {
	memory.clear();
	await withStore('readwrite', (store) => store.clear()).catch(() => {});
}

/** The group's current entries, opened; `fetch` from the load, `base` its address */
export async function sealedEntries<T extends KeptEntry>(
	fetch: typeof globalThis.fetch,
	base: string,
	groupId: string
): Promise<T[]> {
	const kept = await keptOf<T>(groupId);
	try {
		const response = await fetch(`${base}/entries/sealed${kept ? `?since=${kept.asOf}` : ''}`);
		if (!response.ok) throw new Error(String(response.status));
		const answer: EntriesAnswer<T> = await response.json();
		const rows = mergeEntries(kept?.rows ?? [], answer);
		const next = { asOf: answer.asOf, rows };
		memory.set(groupId, next);
		if (!answer.whole) {
			await withStore('readwrite', (store) => store.put(next, groupId)).catch(() => {});
		}
		return openDeep(rows);
	} catch {
		// No connection: what's kept is the best there is
		return openDeep(kept?.rows ?? []);
	}
}
