// Your side of an expense (SP-19): what it changes for you. Positive: you lent (paid more
// than your share), negative: you borrowed (your share of what someone else paid).

import { paidByMember, type Payer } from './payers';

/** Cents for you, or null when you're not involved (didn't pay and have no share). */
export function yourSide(
	entry: { paidBy: string; amountCents: number; payers?: readonly Payer[] | null },
	me: string | null,
	myShare: number
): number | null {
	if (!me) return null;
	const paid = paidByMember(entry, me);
	if (paid === 0 && myShare === 0) return null;
	return paid - myShare;
}
