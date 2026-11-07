// What came out of a seal is only as trustworthy as whoever sealed it (#110): any member's browser,
// possibly a changed one, and the server can't check it. So it's checked where it's opened: a value
// that makes no sense must not bring down the page, or anyone else's balances.
import { isExpenseCategory } from '#lib/expense/categories.ts';
import { isGroupKind } from '#lib/group/kinds.ts';
import { parseDefaultSplit } from '#lib/split/default-split.ts';
import { SPLIT_MODES } from '#lib/split/modes.ts';
import { ITEMS_MODE } from '#lib/split/items.ts';
import { isTint } from '#lib/tints.ts';
import { isEntryCurrency } from '#lib/expense/exchange.ts';

const isCents = (value: unknown) => Number.isSafeInteger(value) && (value as number) >= 0;
const isCurrency = (value: unknown) => typeof value === 'string' && /^[A-Z]{3}$/.test(value);
const isText = (value: unknown) => typeof value === 'string';
const isNumberOrNone = (value: unknown) =>
	value === null || value === undefined || Number.isFinite(value);

const isShare = (share: { memberId?: unknown; shareCents?: unknown; input?: unknown } | null) =>
	isText(share?.memberId) && isCents(share?.shareCents) && isNumberOrNone(share?.input);

const isPayer = (payer: { memberId?: unknown; amountCents?: unknown } | null) =>
	isText(payer?.memberId) && isCents(payer?.amountCents);

const isItem = (item: { name?: unknown; cents?: unknown; memberIds?: unknown } | null) =>
	isText(item?.name) &&
	isCents(item?.cents) &&
	Array.isArray(item?.memberIds) &&
	item.memberIds.every(isText);

/** The money of an entry: without all of this being right, it can't count for anything */
const moneyMakesSense = (read: Record<string, unknown>) =>
	isCents(read.amountCents) &&
	isText(read.paidBy) &&
	Array.isArray(read.splits) &&
	read.splits.every(isShare) &&
	(read.payers === null ||
		read.payers === undefined ||
		(Array.isArray(read.payers) && read.payers.every(isPayer))) &&
	(read.items === null ||
		read.items === undefined ||
		(Array.isArray(read.items) && read.items.every(isItem))) &&
	([...SPLIT_MODES, ITEMS_MODE] as unknown[]).includes(read.splitMode);

const orNull = (value: unknown, valid: (value: unknown) => boolean) =>
	valid(value) ? value : null;

/** An entry's opened details with only what makes sense; null if its money doesn't */
export function checkEntryDetails(read: unknown) {
	if (!read || typeof read !== 'object' || Array.isArray(read)) return null;
	const details = read as Record<string, unknown>;
	if (!moneyMakesSense(details)) return null;
	return {
		amountCents: details.amountCents,
		paidBy: details.paidBy,
		splitMode: details.splitMode,
		splits: details.splits,
		payers: details.payers ?? null,
		items: details.items ?? null,
		originalCurrency: orNull(details.originalCurrency, isCurrency),
		originalAmountCents: orNull(details.originalAmountCents, isCents),
		exchangeRate: orNull(details.exchangeRate, isText),
		category: orNull(details.category, isExpenseCategory),
		autoCategory: orNull(details.autoCategory, isExpenseCategory),
		odometerM: orNull(details.odometerM, Number.isFinite),
		fuelMl: orNull(details.fuelMl, Number.isFinite)
	};
}

/** What's left of an entry nothing can be read from: it shows as locked, and counts for nothing */
export const UNREADABLE_ENTRY = { amountCents: 0, splits: [], payers: null, items: null };

/** A group's opened settings: what doesn't make sense stays at its default */
export function checkGroupDetails(read: unknown) {
	if (!read || typeof read !== 'object' || Array.isArray(read)) return {};
	const details = read as Record<string, unknown>;
	const checks: Record<string, (value: unknown) => boolean> = {
		currency: isCurrency,
		kind: isGroupKind,
		tint: (value) => value === null || isTint(value),
		simplifyDebts: (value) => typeof value === 'boolean',
		entryCurrency: (value) => value === null || isEntryCurrency(value),
		budgetCents: (value) => value === null || isCents(value),
		endsOn: (value) => value === null || isText(value),
		insightSections: (value) => value === null || isText(value)
	};
	const valid: Record<string, unknown> = Object.fromEntries(
		Object.entries(checks)
			.filter(([name, check]) => name in details && check(details[name]))
			.map(([name]) => [name, details[name]])
	);
	if ('defaultSplit' in details) valid.defaultSplit = parseDefaultSplit(details.defaultSplit);
	return valid;
}
