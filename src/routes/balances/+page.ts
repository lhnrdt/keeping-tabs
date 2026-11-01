import { resolve } from '$app/paths';
import { browser, openedLoad } from '#lib/crypto/open-data.ts';
import { sealedEntries } from '#lib/group/sealed-entries.ts';
import { moneyOf, type SealedEntry } from '#lib/group/sealed-money.ts';
import { spendingWithCategories } from '#lib/insights/across.ts';
import { summarizePeople } from '#lib/people-summary.ts';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ data, fetch }) => {
	const { sealedSpending, ...opened } = await openedLoad(data);
	if (!sealedSpending || !browser) return opened;
	// Every group's money from its opened entries: some only the browser can read (#110)
	const groups = await Promise.all(
		sealedSpending.map(async (group) => {
			const expenses = group.sealedMoney
				? await sealedEntries<SealedEntry>(
						fetch,
						resolve('/g/[token]', { token: group.token }),
						group.id
					)
				: group.expenses;
			const memberIds = group.members.map((member) => member.id);
			return {
				...group,
				expenses,
				entries: expenses,
				ledger: expenses,
				transfers: moneyOf(expenses, memberIds, group.simplifyDebts).transfers
			};
		})
	);
	return { ...opened, people: summarizePeople(groups), spending: spendingWithCategories(groups) };
};
