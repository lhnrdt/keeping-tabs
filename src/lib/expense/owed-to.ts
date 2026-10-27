// Who a member's share of an expense is owed to (#39), for settling up directly.
import { splitByWeight } from '#lib/split/compute.ts';
import { payersOf, type Payer } from './payers';

type Entry = Parameters<typeof payersOf>[0];

/**
 * Who a member's share is owed to: split between the payers in proportion to what each
 * paid, to the cent (largest remainder). For one payer, all of it to them.
 */
export function owedTo(entry: Entry, shareCents: number): Payer[] {
	const payers = payersOf(entry);
	if (payers.length === 1) return [{ memberId: payers[0].memberId, amountCents: shareCents }];
	return splitByWeight(
		shareCents,
		payers.map((payer) => ({ memberId: payer.memberId, input: payer.amountCents }))
	).map((share) => ({ memberId: share.memberId, amountCents: share.shareCents }));
}
