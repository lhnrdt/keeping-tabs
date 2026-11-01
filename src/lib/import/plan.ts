// Turns Splitwise rows back into expenses and payments with exact shares, by person index.
// With one payer, the expense is rebuilt exactly: they paid the cost, everyone else's
// share is what they owe, the payer's share is the rest. With several payers, the row
// becomes one expense per payer covering what they're owed, so balances still match.
import type { ExpenseCategory } from '#lib/expense/categories.ts';
import { fromSplitwiseCategory } from './splitwise-categories';
import type { SplitwiseRow } from './splitwise';

export type PlannedEntry = {
	type: 'expense' | 'payment';
	title: string;
	date: string;
	amountCents: number;
	/** Person indices, as in the export's columns */
	paidBy: number;
	shares: { person: number; shareCents: number }[];
	/** Splitwise doesn't export how a row was split: equal when the shares are */
	splitMode: 'equal' | 'exact';
	category: ExpenseCategory | null;
	key: string;
};

/**
 * Equal when everyone's share is the same, give or take the odd cent: the stored shares stay
 * exactly Splitwise's; only editing it later may move that cent to someone else.
 */
function splitModeOf(shares: PlannedEntry['shares']): PlannedEntry['splitMode'] {
	const cents = shares.map((share) => share.shareCents);
	return Math.max(...cents) - Math.min(...cents) <= 1 ? 'equal' : 'exact';
}

const debtorsOf = (nets: number[]) =>
	nets.flatMap((net, person) => (net < 0 ? [{ person, owes: -net }] : []));

function singlePayer(row: SplitwiseRow, payer: number): PlannedEntry {
	const debtors = debtorsOf(row.nets);
	const payerShare = row.costCents - row.nets[payer];
	const isPayment = row.isPayment && debtors.length === 1 && payerShare === 0;
	const shares = [
		...(payerShare > 0 ? [{ person: payer, shareCents: payerShare }] : []),
		...debtors.map(({ person, owes }) => ({ person, shareCents: owes }))
	].sort((a, b) => a.person - b.person);
	const amountCents = isPayment ? row.nets[payer] : row.costCents;
	return {
		type: isPayment ? 'payment' : 'expense',
		title: isPayment ? '' : row.title,
		date: row.date,
		amountCents,
		paidBy: payer,
		shares,
		splitMode: isPayment ? 'exact' : splitModeOf(shares),
		category: isPayment ? null : fromSplitwiseCategory(row.category),
		key: row.key
	};
}

/** Several payers: match what each is owed with what the others owe, in column order. */
function perPayer(row: SplitwiseRow, payers: number[]): PlannedEntry[] {
	const debtors = debtorsOf(row.nets);
	return payers.map((payer, i) => {
		let owed = row.nets[payer];
		const shares: PlannedEntry['shares'] = [];
		for (const debtor of debtors) {
			const take = Math.min(owed, debtor.owes);
			if (take <= 0) continue;
			shares.push({ person: debtor.person, shareCents: take });
			debtor.owes -= take;
			owed -= take;
		}
		return {
			type: 'expense',
			title: `${row.title} (${i + 1}/${payers.length})`,
			date: row.date,
			amountCents: row.nets[payer],
			paidBy: payer,
			shares,
			splitMode: splitModeOf(shares),
			category: fromSplitwiseCategory(row.category),
			key: `${row.key}:${i + 1}`
		};
	});
}

export function planRow(row: SplitwiseRow): PlannedEntry[] {
	const payers = row.nets.flatMap((net, person) => (net > 0 ? [person] : []));
	const payerShare = payers.length === 1 ? row.costCents - row.nets[payers[0]] : -1;
	return payers.length === 1 && payerShare >= 0
		? [singlePayer(row, payers[0])]
		: perPayer(row, payers);
}
