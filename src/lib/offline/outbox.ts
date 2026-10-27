// Expenses added while the connection was gone (#55): kept on this device until they reach
// the server. Storage can be unavailable; then nothing is kept and the form says so as before.
import type { ErrorCode } from '#lib/errors.ts';

export type Pending = {
	/** Also the expense's id on the server, so sending twice can't add it twice */
	id: string;
	/** The group's link token, to show it in its list */
	token: string;
	/** Where the form posts, e.g. /g/…/expenses/new?/save */
	action: string;
	fields: [string, string][];
	/** What the list shows while it waits */
	title: string;
	amount: string;
	date: string;
	addedAt: number;
	/** The server said no (e.g. someone left the group): shown, to remove by hand */
	failed?: ErrorCode;
};

const KEY = 'keeping-tabs:outbox';
const listeners = new Set<() => void>();

function read(): Pending[] {
	try {
		return JSON.parse(localStorage.getItem(KEY) ?? '[]') as Pending[];
	} catch {
		return [];
	}
}

function write(items: Pending[]) {
	try {
		localStorage.setItem(KEY, JSON.stringify(items));
	} catch {
		// Not kept on this device
	}
	for (const listener of listeners) listener();
}

export const pendingItems = () => read();
export const pendingFor = (token: string) => read().filter((item) => item.token === token);

/** Keeps it; false when this device can't keep anything */
export function keep(item: Pending) {
	write([...read().filter((other) => other.id !== item.id), item]);
	return read().some((other) => other.id === item.id);
}

export const drop = (id: string) => write(read().filter((item) => item.id !== id));

export const markFailed = (id: string, error: ErrorCode) =>
	write(read().map((item) => (item.id === id ? { ...item, failed: error } : item)));

/** Calls back whenever the outbox changes on this page */
export function onOutboxChange(listener: () => void) {
	listeners.add(listener);
	return () => listeners.delete(listener);
}
