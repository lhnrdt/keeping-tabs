// The keys this device holds (#110), in IndexedDB: they never go to the server as they are. Each
// group's key arrives in its link's fragment (the part after #, which browsers don't send), is
// kept here, and taken out of the address. A person's other devices get them through the vault
// (vault.ts).
import { keyIdOf } from './seal';

const DATABASE = 'keeping-tabs-keys';
const STORE = 'keys';
const VAULT = 'vault';

const memory = new Map<string, string>();
let loaded: Promise<void> | undefined;

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

function load() {
	loaded ??= (async () => {
		const ids = await withStore('readonly', (store) => store.getAllKeys());
		const keys = await withStore('readonly', (store) => store.getAll());
		ids.forEach((id, i) => memory.set(String(id), keys[i]));
	})().catch(() => {
		// Private browsing and the like: keys last for this page only
	});
	return loaded;
}

/** Browsers may clear a site's data when space runs out or it's not used for a while: not keys */
const askToKeepStorage = () =>
	void (navigator.storage as { persist?: () => Promise<boolean> } | undefined)
		?.persist?.()
		.catch(() => {});

/** The key with this id, if this device has it */
export async function keyFor(keyId: string) {
	await load();
	const vault = memory.get(VAULT);
	return memory.get(keyId) ?? (vault && (await keyIdOf(vault)) === keyId ? vault : undefined);
}

/** As it's stored right now: for the service worker, which outlives what a page adds */
export const storedKey = (keyId: string) =>
	withStore<string | undefined>('readonly', (store) => store.get(keyId)).catch(() => undefined);

/** Keeps a key on this device; returns its id */
export async function rememberKey(key: string) {
	await load();
	const id = await keyIdOf(key);
	memory.set(id, key);
	await withStore('readwrite', (store) => store.put(key, id)).catch(() => {});
	askToKeepStorage();
	return id;
}

export const allKeys = async () => {
	await load();
	return [...memory].filter(([id]) => id !== VAULT).map(([, key]) => key);
};

export async function vaultKey() {
	await load();
	return memory.get(VAULT);
}

export async function rememberVault(key: string) {
	await load();
	memory.set(VAULT, key);
	await withStore('readwrite', (store) => store.put(key, VAULT)).catch(() => {});
}

/** Forgets everything on this device, when someone deletes their identity */
export async function forgetKeys() {
	memory.clear();
	await withStore('readwrite', (store) => store.clear()).catch(() => {});
}

/** A group's link with its key, to pass on */
export const linkWithKey = (link: string, key: string) => `${link}#key=${key}`;
