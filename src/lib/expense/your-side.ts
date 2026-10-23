// Your side of an expense (SP-19): what it changes for you. Positive: you lent (paid more
// than your share), negative: you borrowed (your share of what someone else paid).

/** Cents for you, or null when you're not involved (didn't pay and have no share). */
export function yourSide(
	entry: { paidBy: string; amountCents: number },
	me: string | null,
	myShare: number
): number | null {
	if (!me || (entry.paidBy !== me && myShare === 0)) return null;
	return (entry.paidBy === me ? entry.amountCents : 0) - myShare;
}
