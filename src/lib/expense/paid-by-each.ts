// An expense everyone already paid their own share of (#301), like a car's insurance paid from a
// shared account: it counts as spent, in the insights too, but nobody owes anybody for it. Its
// payers are its shares.
import type { Payer } from './payers';

/** The payer choice for it, next to one member or several */
export const PAID_BY_EACH = 'each';

type Share = { memberId: string; shareCents: number };

/** Who paid what: each their share, the biggest first, as with several payers */
export const payersFromShares = (shares: readonly Share[]): Payer[] =>
	shares
		.filter((share) => share.shareCents > 0)
		.map(({ memberId, shareCents }) => ({ memberId, amountCents: shareCents }))
		.sort((a, b) => b.amountCents - a.amountCents);

/** Whether a saved expense is one: everyone with a share paid exactly that */
export function isPaidByEach(entry: {
	payers?: readonly Payer[] | null;
	splits: readonly Share[];
}) {
	if (!entry.payers?.length) return false;
	const paid = new Map(entry.payers.map((payer) => [payer.memberId, payer.amountCents]));
	const owed = entry.splits.filter((split) => split.shareCents > 0);
	return (
		owed.length === paid.size &&
		owed.every((split) => paid.get(split.memberId) === split.shareCents)
	);
}
