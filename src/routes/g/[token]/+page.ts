import { browser, openedGroupLoad } from '#lib/crypto/open-data.ts';
import { groupInsights } from '#lib/insights/group.ts';
import { defaultPeriod, parsePeriod } from '#lib/insights/period.ts';
import { moneyOf, withYourSide } from '#lib/group/sealed-money.ts';
import type { PageLoad } from './$types';

/** An encrypted group's money and insights are worked out here (#110), for the server can't */
export const load: PageLoad = async ({ data, parent, url }) => {
	const { sealed, ...opened } = await openedGroupLoad(data, parent);
	if (!sealed || !browser) return opened;
	const { group, members } = await parent();
	const memberIds = members.map((member) => member.id);
	const money = moneyOf(sealed.expenses, memberIds, group.simplifyDebts);
	const plan = { budget: group.budgetCents, endsOn: group.endsOn };
	return {
		...opened,
		...money,
		entries: withYourSide(opened.entries, sealed.me),
		insights: sealed.onInsights
			? groupInsights(
					sealed.expenses,
					memberIds,
					sealed.me,
					money.transfers,
					plan,
					sealed.today,
					parsePeriod(url.searchParams, defaultPeriod(group.kind, sealed.today))
				)
			: null
	};
};
