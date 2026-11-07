// An edit that leaves an equal split as it was keeps its cents where they were (#303). An imported
// expense's odd cent may sit with someone else than our own split would put it; moving it on an
// unrelated change, like the category, would leave someone owing a cent.
import type { Share } from './compute';

type Before = {
	splitMode: string;
	amountCents: number;
	splits: readonly { memberId: string; shareCents: number }[];
};

const sameMembers = (a: readonly { memberId: string }[], b: readonly { memberId: string }[]) =>
	a.length === b.length &&
	a.every(({ memberId }) => b.some((other) => other.memberId === memberId));

/** Still an equal split of this amount: shares a cent apart at most, adding up to it */
const isEqualSplit = (before: Before) => {
	const cents = before.splits.map((split) => split.shareCents);
	return (
		cents.length > 0 &&
		Math.max(...cents) - Math.min(...cents) <= 1 &&
		cents.reduce((sum, share) => sum + share, 0) === before.amountCents
	);
};

/** The new shares, or the ones from before if the split itself didn't change */
export function keptEqualShares<
	T extends { splitMode: string; amountCents: number; shares: Share[] }
>(input: T, before: Before | null | undefined): T {
	if (
		!before ||
		input.splitMode !== 'equal' ||
		before.splitMode !== 'equal' ||
		input.amountCents !== before.amountCents ||
		!sameMembers(input.shares, before.splits) ||
		!isEqualSplit(before)
	) {
		return input;
	}
	const cents = new Map(before.splits.map((split) => [split.memberId, split.shareCents]));
	return {
		...input,
		shares: input.shares.map((share) => ({ ...share, shareCents: cents.get(share.memberId)! }))
	};
}
