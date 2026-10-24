// A group's expenses as CSV in Splitwise's export format (#50): Date, Description, Category,
// Cost, Currency, then each person's net (what they paid minus their share), oldest first,
// and a closing total row. Opens in any spreadsheet and imports back (import/splitwise.ts).
import { amountInputValue, balances, type BalanceInput } from '#lib/money.ts';
import type { ExpenseCategory } from '#lib/expense/categories.ts';
import { textCell, toCsv } from './csv';

type Member = { id: string; name: string };
type Entry = BalanceInput & {
	type: 'expense' | 'payment';
	title: string;
	date: string;
	/** Only a category chosen by hand; an empty cell imports as "Automatic" again */
	category: ExpenseCategory | null;
};

/** Splitwise's name for payments, which its import (and ours) recognizes */
const PAYMENT_CATEGORY = 'Payment';

function signedAmount(cents: number, currency: string) {
	return `${cents < 0 ? '-' : ''}${amountInputValue(Math.abs(cents), currency)}`;
}

function netsOf(entry: BalanceInput, members: readonly Member[]) {
	const result = balances(
		members.map((member) => member.id),
		[entry]
	);
	return members.map((member) => result.get(member.id) ?? 0);
}

/** Entries newest first, as listExpenses returns them; `members` decides the columns */
export function toSplitwiseCsv(
	currency: string,
	members: readonly Member[],
	entries: readonly Entry[]
) {
	const names = new Map(members.map((member) => [member.id, member.name]));
	const oldestFirst = entries.toReversed();
	const rows = oldestFirst.map((entry) => {
		const payment = entry.type === 'payment';
		const title = payment
			? `${names.get(entry.paidBy)} → ${names.get(entry.splits[0]?.memberId ?? '')}`
			: entry.title;
		return [
			entry.date,
			textCell(title),
			payment ? PAYMENT_CATEGORY : (entry.category ?? ''),
			amountInputValue(entry.amountCents, currency),
			currency,
			...netsOf(entry, members).map((net) => signedAmount(net, currency))
		];
	});
	const totals = balances(
		members.map((member) => member.id),
		entries
	);
	return toCsv([
		[
			'Date',
			'Description',
			'Category',
			'Cost',
			'Currency',
			...members.map((m) => textCell(m.name))
		],
		...rows,
		[
			oldestFirst.at(-1)?.date ?? '',
			'Total balance',
			'',
			'',
			currency,
			...members.map((member) => signedAmount(totals.get(member.id) ?? 0, currency))
		]
	]);
}
