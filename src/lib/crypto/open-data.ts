// Opens what the server sent (#110): every sealed text in a page's data becomes readable here,
// in the browser, before anything shows. The server only ever passes sealed text along.
import {
	checkEntryDetails,
	checkGroupDetails,
	UNREADABLE_ENTRY
} from '#lib/expense/check-details.ts';
import { m } from '#lib/paraglide/messages.js';
import { takeKeyFromAddress } from './key-from-address';
import { keyFor, rememberKey } from './keyring';
import { syncKeys } from './vault';
import { contextIn, isKey, isSealed, keyIdIn, openText, textContext } from './seal';

export const browser = typeof window !== 'undefined';

/** What's been opened: sealed text never changes, and the same pages come back all the time */
const opened = new Map<string, string>();
const OPENED_KEPT = 20_000;

/** How soon to ask the server again about keys this device doesn't have */
const ASK_AGAIN_MS = 30_000;
let asking: Promise<void> | undefined;

/**
 * A key this device doesn't have yet may be among what's stored for this person, as on a device just
 * added. So that's asked first, once for everything on the page, before anything shows as unreadable.
 */
async function fetchedKey(keyId: string) {
	asking ??= syncKeys()
		.catch(() => {})
		.finally(() => setTimeout(() => (asking = undefined), ASK_AGAIN_MS));
	await asking;
	return keyFor(keyId);
}

/** The text if this device can open it, kept for next time; otherwise null */
async function openKept(sealed: string) {
	const known = opened.get(sealed);
	if (known !== undefined) return known;
	const key = (await keyFor(keyIdIn(sealed))) ?? (await fetchedKey(keyIdIn(sealed)));
	if (!key) return null;
	const text = await openText(key, sealed).catch(() => null);
	if (text === null) return null;
	if (opened.size >= OPENED_KEPT) opened.clear();
	opened.set(sealed, text);
	return text;
}

const openOne = async (sealed: string) => {
	if (!browser) return '…';
	// Your own name and details: without your vault there's just nothing to fill in yet
	const unreadable = contextIn(sealed) === 'profile' ? '' : m.locked_text();
	return (await openKept(sealed)) ?? unreadable;
};

const parsed = (text: string | null) => {
	try {
		return JSON.parse(text ?? 'null') as unknown;
	} catch {
		return null;
	}
};

/**
 * A row's sealed details as its usual fields, as far as they make sense (check-details.ts). An entry
 * they can't be read from, or that has another's, shows as locked and counts for nothing.
 */
async function detailsOf(row: Record<string, unknown>) {
	const sealed = row.sealedDetails;
	if (!browser || !isSealed(sealed)) return {};
	// A group's settings are sealed the same way; an entry has a title or an amount
	const isEntry = 'amountCents' in row || 'title' in row;
	if (typeof row.id === 'string' && !belongsTo(sealed, 'details', row.id)) {
		return isEntry ? UNREADABLE_ENTRY : {};
	}
	const read = parsed(await openKept(sealed));
	if (!isEntry) return checkGroupDetails(read);
	const details: Record<string, unknown> | null = checkEntryDetails(read);
	if (!details) return UNREADABLE_ENTRY;
	// The list's category is what to show: the guess, if nothing was chosen
	if (row.category && !details.category) details.category = details.autoCategory;
	return details;
}

/** Fields of a row with an id whose sealed text must say it's that row's, or nobody's in particular */
const BOUND_TO_ROW = new Set(['title', 'notes', 'body']);
const belongsTo = (sealed: string, field: string, id: string) =>
	[textContext(field), textContext(field, id)].includes(contextIn(sealed));

/** A row's receipt items, whose names are bound to the row like its title */
const openItems = (items: unknown[], id: string) =>
	Promise.all(
		items.map(async (item) => {
			const { name } = (item ?? {}) as { name?: unknown };
			if (isSealed(name) && !belongsTo(name, 'item', id)) {
				return { ...(item as object), name: m.locked_text() };
			}
			return openDeep(item);
		})
	);

/** A copy of the data with all sealed text opened; on the server, dots until the browser's turn */
export async function openDeep<T>(data: T): Promise<T> {
	if (isSealed(data)) return (await openOne(data)) as T;
	if (Array.isArray(data)) return (await Promise.all(data.map(openDeep))) as T;
	if (data && typeof data === 'object' && Object.getPrototypeOf(data) === Object.prototype) {
		const id = (data as { id?: unknown }).id;
		const entries = await Promise.all(
			Object.entries(data).map(async ([name, value]) => {
				if (typeof id === 'string' && browser) {
					// Text moved here from another row: it opens, but it isn't this row's
					if (BOUND_TO_ROW.has(name) && isSealed(value) && !belongsTo(value, name, id)) {
						return [name, m.locked_text()];
					}
					if (name === 'items' && Array.isArray(value)) return [name, await openItems(value, id)];
				}
				return [name, await openDeep(value)];
			})
		);
		const details = await detailsOf(data as Record<string, unknown>);
		const opened = Object.fromEntries(entries);
		delete opened.sealedDetails;
		delete opened.transitionKey;
		return { ...opened, ...details } as T;
	}
	return data;
}

/** Keys being handed over to the people of groups encrypted since they last came (#110) */
async function takeHandedOverKeys(data: unknown): Promise<void> {
	if (Array.isArray(data)) {
		await Promise.all(data.map(takeHandedOverKeys));
	} else if (data && typeof data === 'object' && Object.getPrototypeOf(data) === Object.prototype) {
		const { transitionKey } = data as { transitionKey?: unknown };
		if (isKey(transitionKey)) await rememberKey(transitionKey);
		await Promise.all(Object.values(data).map(takeHandedOverKeys));
	}
}

/** What each page and layout with a group's text loads with */
export const openedLoad = async <T>(data: T) => {
	if (browser) {
		await takeKeyFromAddress();
		await takeHandedOverKeys(data);
	}
	return openDeep(data);
};

/** The same for a group's pages: after its layout, which brings a key being handed over */
export const openedGroupLoad = async <T>(data: T, parent: () => Promise<unknown>) => {
	await parent();
	return openedLoad(data);
};
