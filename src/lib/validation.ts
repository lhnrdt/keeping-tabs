import type { ErrorCode } from './errors';
import { isExpenseCategory, type ExpenseCategory } from './expense/categories';
import { DEFAULT_GROUP_KIND, isGroupKind, type GroupKind } from './group/kinds';
import { parseAmount } from './money';
import { computeShares, type Share, type SplitEntry } from './split/compute';
import { parseSplitInput } from './split/inputs';
import { isSplitMode, type SplitMode } from './split/modes';
import { isTint, type Tint } from './tints';

export const LIMITS = {
	groupName: 60,
	description: 280,
	memberName: 40,
	expenseTitle: 80,
	expenseNote: 500,
	paymentDetails: 200
} as const;

export type Result<T> = { ok: true; value: T } | { ok: false; error: ErrorCode };

/** Trims and collapses inner whitespace. */
export const normalizeText = (value: unknown): string =>
	typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : '';

export function parseGroupName(value: unknown): Result<string> {
	const name = normalizeText(value);
	if (!name) return { ok: false, error: 'group_name_required' };
	if (name.length > LIMITS.groupName) return { ok: false, error: 'group_name_too_long' };
	return { ok: true, value: name };
}

export function parseDescription(value: unknown): Result<string | null> {
	// Keep line breaks, only trim the ends
	const description = typeof value === 'string' ? value.trim() : '';
	if (description.length > LIMITS.description) return { ok: false, error: 'description_too_long' };
	return { ok: true, value: description || null };
}

export function parseCurrency(value: unknown): Result<string> {
	const code = normalizeText(value).toUpperCase();
	if (!/^[A-Z]{3}$/.test(code)) return { ok: false, error: 'currency_invalid' };
	try {
		new Intl.NumberFormat('en', { style: 'currency', currency: code });
	} catch {
		return { ok: false, error: 'currency_invalid' };
	}
	return { ok: true, value: code };
}

/** Checks a member name against the group's current members (case-insensitive, M-5). */
export function parseMemberName(value: unknown, existing: readonly string[]): Result<string> {
	const name = normalizeText(value);
	if (!name) return { ok: false, error: 'member_name_required' };
	if (name.length > LIMITS.memberName) return { ok: false, error: 'member_name_too_long' };
	const lower = name.toLocaleLowerCase();
	if (existing.some((other) => other.toLocaleLowerCase() === lower)) {
		return { ok: false, error: 'member_name_taken' };
	}
	return { ok: true, value: name };
}

/** Parses a list of new member names, rejecting duplicates within the list too. */
export function parseMemberNames(values: unknown[]): Result<string[]> {
	const names: string[] = [];
	for (const value of values) {
		if (!normalizeText(value)) continue; // blank rows are allowed
		const result = parseMemberName(value, names);
		if (!result.ok) return result;
		names.push(result.value);
	}
	if (names.length === 0) return { ok: false, error: 'member_name_required' };
	return { ok: true, value: names };
}

/** How an expense is split (E-3): the mode and the resulting share of each member. */
export function parseSplit(
	values: { splitMode: unknown; participants: unknown[]; inputs: Record<string, unknown> },
	amountCents: number,
	group: { memberIds: readonly string[]; currency: string }
): Result<{ splitMode: SplitMode; shares: Share[] }> {
	const splitMode = normalizeText(values.splitMode) || 'equal';
	if (!isSplitMode(splitMode)) return { ok: false, error: 'split_mode_invalid' };

	const entries: SplitEntry[] = [];
	if (splitMode === 'equal') {
		const chosen = new Set(values.participants.map(normalizeText));
		for (const memberId of group.memberIds) {
			if (chosen.has(memberId)) entries.push({ memberId, input: 0 });
		}
	} else {
		for (const memberId of group.memberIds) {
			const text = normalizeText(values.inputs[memberId]);
			const input = parseSplitInput(splitMode, text, group.currency);
			if (input === null) return { ok: false, error: 'split_input_invalid' };
			entries.push({ memberId, input });
		}
	}

	const shares = computeShares(splitMode, amountCents, entries);
	return shares.ok ? { ok: true, value: { splitMode, shares: shares.value } } : shares;
}

export type ExpenseInput = {
	title: string;
	/** A note on it (#123); null when there's none */
	notes: string | null;
	amountCents: number;
	date: string;
	paidBy: string;
	/** Chosen by hand; null follows the title */
	category: ExpenseCategory | null;
	splitMode: SplitMode;
	/** Each member's share, in member order; they add up to the amount */
	shares: Share[];
};

/** An optional note (#123): line breaks kept, trimmed, empty = none */
export function parseNote(value: unknown): Result<string | null> {
	const note = typeof value === 'string' ? value.replace(/\r\n?/g, '\n').trim() : '';
	if (note.length > LIMITS.expenseNote) return { ok: false, error: 'expense_note_too_long' };
	return { ok: true, value: note || null };
}

export function parseDate(value: unknown): Result<string> {
	const date = normalizeText(value);
	const valid =
		/^\d{4}-\d{2}-\d{2}$/.test(date) &&
		new Date(`${date}T00:00:00Z`).toISOString().startsWith(date);
	return valid ? { ok: true, value: date } : { ok: false, error: 'date_invalid' };
}

/** Validates an equal-split expense against the group's current members. */
export function parseExpense(
	values: {
		title: unknown;
		notes?: unknown;
		amount: unknown;
		date: unknown;
		paidBy: unknown;
		category: unknown;
		splitMode: unknown;
		/** For an equal split: who takes part */
		participants: unknown[];
		/** For the other modes: each member's input, by member id */
		inputs: Record<string, unknown>;
	},
	group: { memberIds: readonly string[]; currency: string }
): Result<ExpenseInput> {
	const title = normalizeText(values.title);
	if (!title) return { ok: false, error: 'expense_title_required' };
	if (title.length > LIMITS.expenseTitle) return { ok: false, error: 'expense_title_too_long' };

	const notes = parseNote(values.notes);
	if (!notes.ok) return notes;

	const amountCents = parseAmount(normalizeText(values.amount), group.currency);
	if (amountCents === null) return { ok: false, error: 'amount_invalid' };

	const date = parseDate(values.date);
	if (!date.ok) return date;

	const paidBy = normalizeText(values.paidBy);
	if (!group.memberIds.includes(paidBy)) return { ok: false, error: 'payer_invalid' };

	const split = parseSplit(values, amountCents, group);
	if (!split.ok) return split;

	const category = parseCategory(values.category);
	if (!category.ok) return category;

	return {
		ok: true,
		value: {
			title,
			notes: notes.value,
			amountCents,
			date: date.value,
			paidBy,
			category: category.value,
			...split.value
		}
	};
}

export type PaymentInput = { from: string; to: string; amountCents: number; date: string };

/** Validates a payment between two members (B-3). */
export function parsePayment(
	values: { from: unknown; to: unknown; amount: unknown; date: unknown },
	group: { memberIds: readonly string[]; currency: string }
): Result<PaymentInput> {
	const from = normalizeText(values.from);
	if (!group.memberIds.includes(from)) return { ok: false, error: 'payer_invalid' };
	const to = normalizeText(values.to);
	if (!group.memberIds.includes(to)) return { ok: false, error: 'recipient_invalid' };
	if (from === to) return { ok: false, error: 'payment_same_member' };

	const amountCents = parseAmount(normalizeText(values.amount), group.currency);
	if (amountCents === null) return { ok: false, error: 'amount_invalid' };

	const date = parseDate(values.date);
	if (!date.ok) return date;

	return { ok: true, value: { from, to, amountCents, date: date.value } };
}

/** A group type; missing means the default (SP-18). */
export function parseKind(value: unknown): Result<GroupKind> {
	const kind = normalizeText(value) || DEFAULT_GROUP_KIND;
	return isGroupKind(kind) ? { ok: true, value: kind } : { ok: false, error: 'kind_invalid' };
}

/** A chosen color; empty means automatic (derived from the group). */
export function parseTint(value: unknown): Result<Tint | null> {
	const tint = normalizeText(value);
	if (!tint) return { ok: true, value: null };
	return isTint(tint) ? { ok: true, value: tint } : { ok: false, error: 'tint_invalid' };
}

/** A chosen expense category; empty means automatic (derived from the title). */
export function parseCategory(value: unknown): Result<ExpenseCategory | null> {
	const category = normalizeText(value);
	if (!category) return { ok: true, value: null };
	return isExpenseCategory(category)
		? { ok: true, value: category }
		: { ok: false, error: 'category_invalid' };
}
