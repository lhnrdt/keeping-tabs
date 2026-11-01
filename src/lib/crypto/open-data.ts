// Opens what the server sent (#110): every sealed text in a page's data becomes readable here,
// in the browser, before anything shows. The server only ever passes sealed text along.
import { m } from '#lib/paraglide/messages.js';
import { takeKeyFromAddress } from './key-from-address';
import { keyFor } from './keyring';
import { contextIn, isSealed, keyIdIn, openText, textContext } from './seal';

export const browser = typeof window !== 'undefined';

const openOne = async (sealed: string) => {
	if (!browser) return '…';
	// Your own name and details: without your vault there's just nothing to fill in yet
	const unreadable = contextIn(sealed) === 'profile' ? '' : m.locked_text();
	const key = await keyFor(keyIdIn(sealed));
	if (!key) return unreadable;
	return openText(key, sealed).catch(() => unreadable);
};

/** What an encrypted group's expense keeps sealed apart from its text */
const DETAILS = ['category', 'autoCategory', 'odometerM', 'fuelMl'] as const;

/** A row's sealed details as its usual fields, if they can be read and are this row's */
async function detailsOf(row: Record<string, unknown>) {
	const sealed = row.sealedDetails;
	if (!browser || !isSealed(sealed)) return {};
	if (typeof row.id === 'string' && !belongsTo(sealed, 'details', row.id)) return {};
	const key = await keyFor(keyIdIn(sealed));
	if (!key) return {};
	const read = JSON.parse(await openText(key, sealed).catch(() => '{}')) as Record<string, unknown>;
	const details = Object.fromEntries(DETAILS.map((name) => [name, read[name] ?? null]));
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
		return { ...opened, ...details } as T;
	}
	return data;
}

/** What each page and layout with a group's text loads with */
export const openedLoad = async <T>(data: T) => {
	if (browser) await takeKeyFromAddress();
	return openDeep(data);
};
