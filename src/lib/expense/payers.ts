// Who paid an expense (#39): usually one person (paidBy), sometimes several, each with the
// part they paid. Every calculation asks here, so one payer and several work the same way.
export type Payer = { memberId: string; amountCents: number };

type Entry = { paidBy: string; amountCents: number; payers?: readonly Payer[] | null };

/** Everyone who paid, with how much; one payer paid it all */
export const payersOf = (entry: Entry): readonly Payer[] =>
	entry.payers?.length
		? entry.payers
		: [{ memberId: entry.paidBy, amountCents: entry.amountCents }];

/** What a member paid of an expense */
export const paidByMember = (entry: Entry, memberId: string) =>
	payersOf(entry).find((payer) => payer.memberId === memberId)?.amountCents ?? 0;

/** "Anna" or the payer who paid most, for one line in a list */
export const mainPayer = (entry: Entry) =>
	payersOf(entry).toSorted((a, b) => b.amountCents - a.amountCents)[0].memberId;
