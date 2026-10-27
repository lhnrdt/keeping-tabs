import { fail } from '@sveltejs/kit';
import { formatRate } from '#lib/expense/exchange.ts';
import { defaultFrom } from '#lib/split/default-split.ts';
import { readSplitInputs } from '#lib/split/form.ts';
import { parseExpense, parsePayment, type ExpenseInput, type Result } from '#lib/validation.ts';
import type { Db } from './db';
import { listMembers, setDefaultSplit } from './groups';
import { rateFor } from './rates';

type Group = { id: string; currency: string };

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

/** What each member paid, from fields named paid.<member id> (#39) */
const readPayers = (form: FormData) =>
	Object.fromEntries(
		[...form.keys()]
			.filter((key) => key.startsWith('paid.'))
			.map((key) => [key.slice('paid.'.length), text(form, key)])
	);

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

export const readExpenseForm = async (db: Db, group: Group, form: FormData) =>
	validate(
		db,
		group,
		{
			title: text(form, 'title'),
			notes: text(form, 'notes'),
			amount: text(form, 'amount'),
			currency: text(form, 'currency'),
			rate: await rateOf(group, form),
			date: text(form, 'date'),
			paidBy: text(form, 'paidBy'),
			payers: readPayers(form),
			participants: form.getAll('participants').map(String),
			category: text(form, 'category'),
			splitMode: text(form, 'splitMode'),
			inputs: readSplitInputs(form)
		},
		parseExpense
	);

export const readPaymentForm = (db: Db, group: Group, form: FormData) =>
	validate(
		db,
		group,
		{
			from: text(form, 'from'),
			to: text(form, 'to'),
			amount: text(form, 'amount'),
			date: text(form, 'date')
		},
		parsePayment
	);

/** "Use this split for new expenses" (#41): remembers a percent or parts split for the group */
export async function rememberDefaultSplit(
	db: Db,
	groupId: string,
	actorId: string | null,
	form: FormData,
	input: ExpenseInput
) {
	if (form.get('makeDefault') !== 'on') return;
	const split = defaultFrom(input.splitMode, input.shares);
	if (split) await setDefaultSplit(db, groupId, actorId, split);
}
