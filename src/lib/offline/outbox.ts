// Changes made while the connection was gone (#55, #347): new expenses, edits, deletions,
// payments and comments, kept on this device until they reach the server, in the order they were made.
// Storage can be unavailable; then nothing is kept and the form says so as before.
import type { ErrorCode } from '#lib/errors.ts';
import type { ListEntry } from '#lib/server/expense-entries.ts';

/**
 * What a kept change does: adds an expense (the default), changes or deletes one, records a
 * payment, or writes a comment under one
 */
export type PendingKind = 'add' | 'edit' | 'delete' | 'pay' | 'comment';

export type Pending = {
	/** A new entry's id on the server too, so sending twice can't add it twice; else kind:entry */
	id: string;
	kind?: PendingKind;
	/** The entry an edit, deletion or comment is about */
	target?: string;
	/** The group's link token, to show it in its list */
	token: string;
	/** Where the form posts, e.g. /g/…/expenses/new?/save */
	action: string;
	fields: [string, string][];
	/** What the list shows while it waits */
	title: string;
	amount: string;
	/** ...in this currency, as typed (blank: the group's) */
	currency?: string;
	date: string;
	addedAt: number;
	/** A new expense as the list shows it, made on the device: in its place in the list meanwhile */
	preview?: ListEntry;
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

/** The request never reached the server (no connection), as opposed to it saying no */
export const unreachable = (failure: unknown) => failure instanceof TypeError || !navigator.onLine;

export const pendingItems = () => read();
export const pendingFor = (token: string) => read().filter((item) => item.token === token);

/** The id a change is kept under: a later edit of the same entry replaces the earlier one */
export const pendingId = (kind: PendingKind, target: string) => `${kind}:${target}`;

/**
 * Keeps it; false when this device can't keep anything. Deleting what never reached the server
 * just forgets it, and its edits; deleting what did drops the edits waiting for it.
 */
export function keep(item: Pending) {
	const others = read().filter((other) => other.id !== item.id);
	if (item.kind === 'delete' && item.target) {
		const waiting = others.find((other) => other.id === item.target);
		const rest = others.filter((other) => other.id !== item.target && other.target !== item.target);
		if (waiting) {
			write(rest);
			return true;
		}
		write([...rest, item]);
	} else {
		write([...others, item]);
	}
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
