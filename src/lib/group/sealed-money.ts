// An encrypted group's money, worked out in the browser (#110): the server only keeps it sealed.
// The same calculations as for any group, from entries with their amounts and splits opened.
import { yourSide } from '#lib/expense/your-side.ts';
import { balances, type BalanceInput } from '#lib/money.ts';
import { betweenYou } from '#lib/people-summary.ts';
import { settleTransfers } from '#lib/settle.ts';

export function moneyOf(
	entries: readonly BalanceInput[],
	memberIds: readonly string[],
	simplifyDebts: boolean
) {
	return {
		balances: Object.fromEntries(balances(memberIds, entries)),
		transfers: settleTransfers(simplifyDebts, memberIds, entries)
	};
}

/** Your balance and who's open with you, for a group on the start screen */
export function summaryOf(group: {
	memberId: string;
	simplifyDebts: boolean;
	members: readonly { id: string; name: string }[];
	expenses: readonly BalanceInput[];
}) {
	const memberIds = group.members.map((member) => member.id);
	const money = moneyOf(group.expenses, memberIds, group.simplifyDebts);
	const names = new Map(group.members.map((member) => [member.id, member.name]));
	return {
		balance: money.balances[group.memberId] ?? 0,
		open: betweenYou(money.transfers, group.memberId).map(({ memberId, amount }) => ({
			name: names.get(memberId) ?? '?',
			amount
		}))
	};
}

/** An opened entry's side for you and a payment's recipient, which the server can't tell anymore */
export const withYourSide = <
	T extends { type: string; paidBy: string; amountCents: number; yourSide?: number | null }
>(
	entries: readonly T[],
	me: string | null
): T[] =>
	entries.map((entry) => {
		const { splits } = entry as { splits?: { memberId: string; shareCents: number }[] };
		if (!splits?.length) return entry;
		const share = splits.find((split) => split.memberId === me)?.shareCents ?? 0;
		return entry.type === 'payment'
			? { ...entry, recipient: splits[0].memberId, yourSide: null }
			: { ...entry, yourSide: yourSide(entry, me, share) };
	});
