// Your spending across all your groups (#164): your share of each expense, by month, by
// category, by group, and who you share the most with. Amounts in different currencies
// don't add up, so it's per currency: the one you spend most in, the others named.
import type { GroupKind } from '#lib/group/kinds.ts';
import type { Tint } from '#lib/tints.ts';
import type { ExpenseCategory } from '#lib/expense/categories.ts';
import { seriesCategories, slicesOf, type Slice } from './category-slices';
import { byCategory, overTime, type Bucket, type InsightEntry } from './insights';

type Member = { id: string; name: string; personId: string | null; avatar?: string | null };

export type SpendingGroup = {
	id: string;
	name: string;
	token: string;
	currency: string;
	kind: GroupKind;
	tint: Tint | null;
	/** Your member in this group */
	memberId: string;
	/** Current members */
	members: readonly Member[];
	/** Expenses with their category as the group shows it; payments are left out here */
	entries: readonly InsightEntry[];
};

export type GroupSpend = Pick<SpendingGroup, 'id' | 'name' | 'token' | 'kind' | 'tint'> & {
	amount: number;
};

export type SharedWith = {
	key: string;
	name: string;
	avatarId: string;
	avatar: string | null;
	/** Your share of the expenses you both took part in */
	amount: number;
};

export type Spending = {
	currency: string;
	/** Your share of everything */
	total: number;
	/** Your share per month, the last MAX_MONTHS with expenses at most */
	months: Bucket[];
	/** By category for the donut, the largest categories in their colours (#183) */
	donut: { series: ExpenseCategory[]; slices: Slice[] };
	byGroup: GroupSpend[];
	/** Largest first, at most MAX_SHARED */
	sharedWith: SharedWith[];
	/** Other currencies you have groups in, not counted here */
	otherCurrencies: string[];
};

export const MAX_MONTHS = 12;
export const MAX_SHARED = 5;

/** Each expense as your share of it, for the groups' shared building blocks */
function yourShares(group: SpendingGroup): InsightEntry[] {
	return group.entries.flatMap((entry) => {
		if (entry.type !== 'expense') return [];
		const share = entry.splits.find((split) => split.memberId === group.memberId)?.shareCents ?? 0;
		return share > 0 ? [{ ...entry, amountCents: share }] : [];
	});
}

export function spendingAcross(groups: readonly SpendingGroup[]): Spending | null {
	const totals = new Map<string, number>();
	const shares = new Map(groups.map((group) => [group.id, yourShares(group)]));
	for (const group of groups) {
		const sum = shares.get(group.id)!.reduce((total, entry) => total + entry.amountCents, 0);
		totals.set(group.currency, (totals.get(group.currency) ?? 0) + sum);
	}
	const [main] = [...totals].filter(([, total]) => total > 0).sort((a, b) => b[1] - a[1]);
	if (!main) return null;
	const [currency, total] = main;
	const counted = groups.filter((group) => group.currency === currency);
	const all = counted.flatMap((group) => shares.get(group.id)!);
	const series = seriesCategories(byCategory(all, total));

	const shared = new Map<string, SharedWith>();
	for (const group of counted) {
		const members = new Map(group.members.map((member) => [member.id, member]));
		for (const entry of shares.get(group.id)!) {
			for (const { memberId, shareCents } of entry.splits) {
				const other = members.get(memberId);
				if (!other || memberId === group.memberId || shareCents <= 0) continue;
				const key = other.personId ? `person:${other.personId}` : `member:${other.id}`;
				const row = shared.get(key) ?? {
					key,
					name: other.name,
					avatarId: other.personId ?? other.id,
					avatar: other.avatar ?? null,
					amount: 0
				};
				row.amount += entry.amountCents;
				shared.set(key, row);
			}
		}
	}

	return {
		currency,
		total,
		months: overTime(all, 'month').slice(-MAX_MONTHS),
		donut: { series, slices: slicesOf(all, series) },
		byGroup: counted
			.map(({ id, name, token, kind, tint }) => ({
				id,
				name,
				token,
				kind,
				tint,
				amount: shares.get(id)!.reduce((sum, entry) => sum + entry.amountCents, 0)
			}))
			.filter((group) => group.amount > 0)
			.sort((a, b) => b.amount - a.amount),
		sharedWith: [...shared.values()].sort((a, b) => b.amount - a.amount).slice(0, MAX_SHARED),
		otherCurrencies: [...totals.keys()].filter((other) => other !== currency).sort()
	};
}
