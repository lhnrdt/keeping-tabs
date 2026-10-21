import type { ErrorCode } from './errors';

export const LIMITS = { groupName: 60, description: 280, memberName: 40 } as const;

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
