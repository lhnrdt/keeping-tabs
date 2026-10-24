// Who owes you and whom you owe, across all your groups (#117). Per group, the amounts are
// the group's own settle-up payments that involve you, so they match the group screen
// (including "simplify debts"). The same person in several groups is matched by identity;
// spots nobody has joined stay per group, since names can repeat.
import type { Transfer } from './settle';

type Member = { id: string; name: string; personId: string | null };

export type GroupSettlement = {
	id: string;
	name: string;
	token: string;
	currency: string;
	/** Your member in this group */
	memberId: string;
	members: readonly Member[];
	transfers: readonly Transfer[];
};

export type PersonGroupAmount = { id: string; name: string; token: string; amount: number };

export type PersonSummary = {
	key: string;
	name: string;
	/** Same as the avatar in the group: the person, else the member */
	avatarId: string;
	currency: string;
	/** Positive: they owe you; negative: you owe them */
	net: number;
	groups: PersonGroupAmount[];
};

/** Your side of a transfer: what the other one owes you (negative: you owe them) */
function yourSide(transfer: Transfer, you: string): [string, number] | null {
	if (transfer.to === you) return [transfer.from, transfer.amountCents];
	if (transfer.from === you) return [transfer.to, -transfer.amountCents];
	return null;
}

/** Groups newest first; people by the largest amount, then by name. Settled people are left out. */
export function summarizePeople(groups: readonly GroupSettlement[]): PersonSummary[] {
	const people = new Map<string, PersonSummary>();
	for (const group of groups) {
		const members = new Map(group.members.map((member) => [member.id, member]));
		for (const transfer of group.transfers) {
			const side = yourSide(transfer, group.memberId);
			const other = side && members.get(side[0]);
			if (!side || !other) continue;
			const identity = other.personId ? `person:${other.personId}` : `member:${other.id}`;
			const key = `${identity}:${group.currency}`;
			const person = people.get(key) ?? {
				key,
				name: other.name,
				avatarId: other.personId ?? other.id,
				currency: group.currency,
				net: 0,
				groups: []
			};
			person.net += side[1];
			person.groups.push({ id: group.id, name: group.name, token: group.token, amount: side[1] });
			people.set(key, person);
		}
	}
	return [...people.values()]
		.filter((person) => person.net !== 0)
		.sort((a, b) => Math.abs(b.net) - Math.abs(a.net) || a.name.localeCompare(b.name));
}
