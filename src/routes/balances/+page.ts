import { browser, openedLoad } from '#lib/crypto/open-data.ts';
import { moneyOf } from '#lib/group/sealed-money.ts';
import { spendingWithCategories } from '#lib/insights/across.ts';
import { summarizePeople } from '#lib/people-summary.ts';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ data }) => {
	const { sealedSpending, ...opened } = await openedLoad(data);
	if (!sealedSpending || !browser) return opened;
	// Every group's money from its opened entries: some only the browser can read (#110)
	const groups = sealedSpending.map((group) => ({
		...group,
		ledger: group.expenses,
		transfers: moneyOf(
			group.expenses,
			group.members.map((member) => member.id),
			group.simplifyDebts
		).transfers
	}));
	return { ...opened, people: summarizePeople(groups), spending: spendingWithCategories(groups) };
};
