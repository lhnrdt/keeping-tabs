// Reads a backup file (#57). It can come from anywhere, so everything in it is checked the way
// the forms check it, and only what's known is kept. Nothing is trusted because it's a backup.
import { isExpenseCategory, type ExpenseCategory } from '#lib/expense/categories.ts';
import { parseRate } from '#lib/expense/exchange.ts';
import { isFrequency } from '#lib/expense/recurrence.ts';
import { parseSections } from '#lib/insights/sections.ts';
import { parseDefaultSplit } from '#lib/split/default-split.ts';
import type { ExpenseItem } from '#lib/split/items.ts';
import { isSplitMode, type SplitMode } from '#lib/split/modes.ts';
import {
	LIMITS,
	parseComment,
	parseCurrency,
	parseDate,
	parseDescription,
	parseGroupName,
	parseKind,
	parseMemberName,
	parseNote,
	parseTint,
	type ExpenseInput,
	type Result
} from '#lib/validation.ts';
import {
	BACKUP_FORMAT,
	BACKUP_VERSION,
	type Backup,
	type BackupEntry,
	type BackupGroup,
	type BackupMember,
	type BackupRepeating
} from './format';

/** Well within what the database takes in one go, like an import (#71) */
export const MAX_ENTRIES = 5_000;
const MAX_MEMBERS = 200;
const MAX_ROWS = 50_000;
const MAX_ID_LENGTH = 64;

class Invalid extends Error {}

function need(condition: unknown): asserts condition {
	if (!condition) throw new Invalid();
}
const unwrap = <T>(result: Result<T>) => {
	if (!result.ok) throw new Invalid();
	return result.value;
};

type Raw = Record<string, unknown>;
const object = (value: unknown): Raw => {
	need(value && typeof value === 'object' && !Array.isArray(value));
	return value as Raw;
};
const list = (value: unknown): unknown[] => {
	need(Array.isArray(value));
	return value as unknown[];
};
const integer = (value: unknown, min: number): number => {
	need(Number.isSafeInteger(value) && (value as number) >= min);
	return value as number;
};
const orNull = <T>(value: unknown, read: (value: unknown) => T): T | null =>
	value === null || value === undefined ? null : read(value);

const category = (value: unknown): ExpenseCategory | null =>
	orNull(value, (text) => {
		need(isExpenseCategory(text));
		return text as ExpenseCategory;
	});
const splitMode = (value: unknown): SplitMode => {
	need(isSplitMode(value));
	return value as SplitMode;
};

function readGroup(raw: Raw): BackupGroup {
	const sections = orNull(raw.insightSections, (text) => {
		need(typeof text === 'string');
		return parseSections(text as string)?.join(',') ?? null;
	});
	return {
		name: unwrap(parseGroupName(raw.name)),
		description: unwrap(parseDescription(raw.description ?? '')),
		currency: unwrap(parseCurrency(raw.currency)),
		kind: unwrap(parseKind(raw.kind)),
		tint: unwrap(parseTint(raw.tint ?? '')),
		simplifyDebts: raw.simplifyDebts !== false,
		insightSections: sections,
		defaultSplit: parseDefaultSplit(raw.defaultSplit),
		budgetCents: orNull(raw.budgetCents, (cents) => integer(cents, 1)),
		endsOn: orNull(raw.endsOn, (date) => unwrap(parseDate(date)))
	};
}

function readMembers(values: unknown[]): BackupMember[] {
	need(values.length > 0 && values.length <= MAX_MEMBERS);
	const current: string[] = [];
	const ids = new Set<string>();
	const members = values.map((value) => {
		const raw = object(value);
		const id = raw.id;
		need(typeof id === 'string' && id && id.length <= MAX_ID_LENGTH && !ids.has(id));
		ids.add(id as string);
		const removed = raw.removed === true;
		// Current names are unique (M-5); removed members may share one
		const name = unwrap(parseMemberName(raw.name, removed ? [] : current));
		if (!removed) current.push(name);
		return { id: id as string, name, removed };
	});
	need(current.length > 0);
	return members;
}

/** Shares of an amount: each of a known member, once, adding up to it (E-5) */
function readShares(values: unknown[], amountCents: number, known: ReadonlySet<string>) {
	need(values.length > 0);
	const seen = new Set<string>();
	const shares = values.map((value) => {
		const raw = object(value);
		need(known.has(raw.memberId as string) && !seen.has(raw.memberId as string));
		seen.add(raw.memberId as string);
		return {
			memberId: raw.memberId as string,
			shareCents: integer(raw.shareCents, Number.MIN_SAFE_INTEGER),
			input: orNull(raw.input, (input) => integer(input, Number.MIN_SAFE_INTEGER))
		};
	});
	need(shares.reduce((sum, share) => sum + share.shareCents, 0) === amountCents);
	return shares;
}

/** Several payers: known members, adding up to the amount; none when one person paid */
function readPayers(value: unknown, amountCents: number, known: ReadonlySet<string>) {
	const payers = list(value ?? []).map((item) => {
		const raw = object(item);
		need(known.has(raw.memberId as string));
		return { memberId: raw.memberId as string, amountCents: integer(raw.amountCents, 1) };
	});
	need(new Set(payers.map((payer) => payer.memberId)).size === payers.length);
	if (payers.length > 0) {
		need(payers.reduce((sum, payer) => sum + payer.amountCents, 0) === amountCents);
	}
	return payers;
}

function readOriginal(currency: unknown, amountCents: unknown, rate: unknown) {
	if (currency === null || currency === undefined) return null;
	const parsedRate = typeof rate === 'string' ? parseRate(rate) : null;
	need(parsedRate);
	return {
		currency: unwrap(parseCurrency(currency)),
		amountCents: integer(amountCents, 1),
		rate: parsedRate as string
	};
}

/** Receipt items (#53): known members, sensible prices; they only explain the shares */
const readItems = (value: unknown, known: ReadonlySet<string>): ExpenseItem[] | null =>
	orNull(value, (items) =>
		list(items).map((entry) => {
			const raw = object(entry);
			need(typeof raw.name === 'string' && raw.name.length <= LIMITS.expenseTitle);
			const memberIds = list(raw.memberIds);
			need(memberIds.length > 0 && memberIds.every((id) => known.has(id as string)));
			return {
				name: raw.name as string,
				cents: integer(raw.cents, 1),
				memberIds: memberIds as string[]
			};
		})
	);

const readTitle = (value: unknown, required: boolean) => {
	need(typeof value === 'string' && value.length <= LIMITS.expenseTitle);
	if (required) need((value as string).trim());
	return value as string;
};

function readEntry(raw: Raw, known: ReadonlySet<string>): BackupEntry {
	need(raw.type === 'expense' || raw.type === 'payment');
	const amountCents = integer(raw.amountCents, 1);
	need(known.has(raw.paidBy as string));
	const original = readOriginal(raw.originalCurrency, raw.originalAmountCents, raw.exchangeRate);
	return {
		type: raw.type as BackupEntry['type'],
		title: readTitle(raw.title, raw.type === 'expense'),
		notes: unwrap(parseNote(raw.notes ?? '')),
		amountCents,
		paidBy: raw.paidBy as string,
		date: unwrap(parseDate(raw.date)),
		splitMode: splitMode(raw.splitMode),
		items: readItems(raw.items, known),
		category: category(raw.category),
		originalCurrency: original?.currency ?? null,
		originalAmountCents: original?.amountCents ?? null,
		exchangeRate: original?.rate ?? null,
		odometerM: orNull(raw.odometerM, (metres) => integer(metres, 1)),
		fuelMl: orNull(raw.fuelMl, (millilitres) => integer(millilitres, 1)),
		createdAt: integer(raw.createdAt, 0),
		splits: readShares(list(raw.splits), amountCents, known),
		payers: readPayers(raw.payers, amountCents, known),
		comments: list(raw.comments ?? []).map((value) => {
			const comment = object(value);
			need(known.has(comment.memberId as string));
			return {
				memberId: comment.memberId as string,
				body: unwrap(parseComment(comment.body)),
				createdAt: integer(comment.createdAt, 0)
			};
		})
	};
}

function readTemplate(raw: Raw, known: ReadonlySet<string>): ExpenseInput {
	const amountCents = integer(raw.amountCents, 1);
	need(known.has(raw.paidBy as string));
	const original = orNull(raw.original, (value) => {
		const it = object(value);
		return readOriginal(it.currency, it.amountCents, it.rate);
	});
	const payers = readPayers(raw.payers, amountCents, known);
	return {
		title: readTitle(raw.title, true),
		notes: unwrap(parseNote(raw.notes ?? '')),
		original,
		amountCents,
		odometerM: orNull(raw.odometerM, (metres) => integer(metres, 1)),
		fuelMl: orNull(raw.fuelMl, (millilitres) => integer(millilitres, 1)),
		date: unwrap(parseDate(raw.date)),
		paidBy: raw.paidBy as string,
		payers: payers.length ? payers : null,
		category: category(raw.category),
		autoCategory: null,
		splitMode: splitMode(raw.splitMode),
		items: readItems(raw.items, known),
		shares: readShares(list(raw.shares), amountCents, known)
	};
}

function readRepeating(raw: Raw, known: ReadonlySet<string>): BackupRepeating {
	need(isFrequency(raw.frequency));
	const memberId = orNull(raw.memberId, (id) => {
		need(known.has(id as string));
		return id as string;
	});
	return {
		memberId,
		frequency: raw.frequency as BackupRepeating['frequency'],
		added: integer(raw.added, 1),
		nextOn: unwrap(parseDate(raw.nextOn)),
		template: readTemplate(object(raw.template), known)
	};
}

function read(text: string): Backup {
	const raw = object(JSON.parse(text));
	need(raw.format === BACKUP_FORMAT && raw.version === BACKUP_VERSION);
	const group = readGroup(object(raw.group));
	const members = readMembers(list(raw.members));
	const known = new Set(members.map((member) => member.id));
	const rawEntries = list(raw.entries);
	need(rawEntries.length <= MAX_ENTRIES);
	const entries = rawEntries.map((entry) => readEntry(object(entry), known));
	const rows = entries.reduce(
		(sum, entry) => sum + entry.splits.length + entry.payers.length + entry.comments.length,
		0
	);
	need(rows <= MAX_ROWS);
	const rawRepeating = list(raw.repeating ?? []);
	need(rawRepeating.length <= MAX_ENTRIES);
	return {
		format: BACKUP_FORMAT,
		version: BACKUP_VERSION,
		exportedAt: String(raw.exportedAt ?? ''),
		group,
		members,
		entries,
		repeating: rawRepeating.map((rule) => readRepeating(object(rule), known))
	};
}

export function parseBackup(text: string): Result<Backup> {
	try {
		return { ok: true, value: read(text) };
	} catch {
		return { ok: false, error: 'backup_invalid' };
	}
}
