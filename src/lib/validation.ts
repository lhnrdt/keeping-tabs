import type { ErrorCode } from './errors';
import { parseAmount } from './money';

export const LIMITS = {
	groupName: 60,
	description: 280,
	memberName: 40,
	expenseTitle: 80
} as const;

type Result<T> = { ok: true; value: T } | { ok: false; error: ErrorCode };

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

export type ExpenseInput = {
	title: string;
	amountCents: number;
	date: string;
	paidBy: string;
	/** In member order, so equal-split remainders are deterministic */
	participants: string[];
};

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
		amount: unknown;
		date: unknown;
		paidBy: unknown;
		participants: unknown[];
	},
	group: { memberIds: readonly string[]; currency: string }
): Result<ExpenseInput> {
	const title = normalizeText(values.title);
	if (!title) return { ok: false, error: 'expense_title_required' };
	if (title.length > LIMITS.expenseTitle) return { ok: false, error: 'expense_title_too_long' };

	const amountCents = parseAmount(normalizeText(values.amount), group.currency);
	if (amountCents === null) return { ok: false, error: 'amount_invalid' };

	const date = parseDate(values.date);
	if (!date.ok) return date;

	const paidBy = normalizeText(values.paidBy);
	if (!group.memberIds.includes(paidBy)) return { ok: false, error: 'payer_invalid' };

	const chosen = new Set(values.participants.map(normalizeText));
	const participants = group.memberIds.filter((id) => chosen.has(id));
	if (participants.length === 0) return { ok: false, error: 'participants_required' };

	return { ok: true, value: { title, amountCents, date: date.value, paidBy, participants } };
}
