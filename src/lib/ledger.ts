// A group's ledger in two sums (#58): what each member paid, and how much of it each member
// took part in. That's all balances and settling up need (money.ts, settle.ts), so the
// database adds up the entries instead of sending every one of them.
import type { BalanceInput } from './money';

export type PaidSum = { paidBy: string; amountCents: number };
export type ShareSum = { paidBy: string; memberId: string; shareCents: number };

/** As entries the balance and settle-up code takes: one per payer's total, one per pair */
export const ledgerEntries = (
	paid: readonly PaidSum[],
	shares: readonly ShareSum[]
): BalanceInput[] => [
	...paid.map(({ paidBy, amountCents }) => ({ paidBy, amountCents, splits: [] })),
	...shares.map(({ paidBy, memberId, shareCents }) => ({
		paidBy,
		amountCents: 0,
		splits: [{ memberId, shareCents }]
	}))
];
