import { error, fail } from '@sveltejs/kit';
import { isSealed } from '#lib/crypto/seal.ts';
import { formatRate } from '#lib/expense/exchange.ts';
import { expenseValues, paymentValues } from '#lib/expense/form-values.ts';
import { SEALED_AMOUNT, sealedInput } from '#lib/expense/sealed-details.ts';
import { m } from '#lib/paraglide/messages.js';
import { defaultFrom } from '#lib/split/default-split.ts';
import {
	parseDate,
	parseExpense,
	parsePayment,
	type ExpenseInput,
	type Result
} from '#lib/validation.ts';
import type { Db } from './db';
import { placeholderMember } from './encryption-handover';
import { listMembers, setDefaultSplit, setGroupDetails } from './groups';
import { rateFor } from './rates';

type Group = { id: string; currency: string; keyId: string | null };

/** Plenty for an expense with many people and receipt items */
const MAX_SEALED_DETAILS = 200_000;

/** Validates form values against the group; on failure returns them to re-fill the form. */
async function validate<V, T>(
	db: Db,
	group: Group,
	values: V,
	parse: (values: V, group: { memberIds: string[]; currency: string }) => Result<T>
) {
	const members = await listMembers(db, group.id);
	const result = parse(values, {
		memberIds: members.map((member) => member.id),
		currency: group.currency
	});
	return result.ok
		? { ok: true as const, input: result.value }
		: { ok: false as const, failure: fail(400, { error: result.error, values }) };
}

const text = (form: FormData, key: string) => String(form.get(key) ?? '');

/**
 * The rate another currency's amount is kept at (#54): the one the form looked up, or, when
 * it couldn't (offline), the day's rate looked up now
 */
async function rateOf(group: Group, form: FormData) {
	const currency = text(form, 'currency');
	if (text(form, 'rate') || !currency || currency === group.currency) return text(form, 'rate');
	const rate = await rateFor(currency, group.currency, text(form, 'date'));
	return rate === null ? '' : formatRate(rate);
}

/** Only the browser could check an encrypted group's form: what's here must at least be sealed */
function sealedParts(form: FormData) {
	const details = form.get('details');
	const date = parseDate(form.get('date'));
	if (!isSealed(details) || details.length > MAX_SEALED_DETAILS) error(409, m.locked_reload());
	if (!date.ok) return { ok: false as const, failure: fail(400, { error: date.error }) };
	return { ok: true as const, details, date: date.value };
}

export async function readExpenseForm(db: Db, group: Group, form: FormData, actorId: string) {
	if (group.keyId) {
		const parts = sealedParts(form);
		if (!parts.ok) return parts;
		const title = form.get('title');
		const notes = text(form, 'notes');
		if (!isSealed(title)) error(409, m.locked_reload());
		return {
			ok: true as const,
			input: sealedInput({
				title,
				notes: notes || null,
				date: parts.date,
				paidBy: (await placeholderMember(db, group.id)) ?? actorId,
				sealedDetails: parts.details
			})
		};
	}
	return validate(db, group, expenseValues(form, await rateOf(group, form)), parseExpense);
}

export async function readPaymentForm(db: Db, group: Group, form: FormData, actorId: string) {
	if (group.keyId) {
		const parts = sealedParts(form);
		if (!parts.ok) return parts;
		const placeholder = (await placeholderMember(db, group.id)) ?? actorId;
		return {
			ok: true as const,
			input: {
				from: placeholder,
				to: placeholder,
				amountCents: SEALED_AMOUNT,
				date: parts.date,
				sealedDetails: parts.details
			}
		};
	}
	return validate(db, group, paymentValues(form), parsePayment);
}

/** "Use this split for new expenses" (#41): remembers a percent or parts split for the group */
export async function rememberDefaultSplit(
	db: Db,
	groupId: string,
	actorId: string | null,
	form: FormData,
	input: ExpenseInput
) {
	// Encrypted: sealed in the browser, along with the group's plan (#110)
	const sealed = form.get('groupDetails');
	if (isSealed(sealed)) await setGroupDetails(db, groupId, sealed);
	if (form.get('makeDefault') !== 'on') return;
	const split = defaultFrom(input.splitMode, input.shares);
	if (split) await setDefaultSplit(db, groupId, actorId, split);
}
