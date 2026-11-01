import { browser, openedLoad } from '#lib/crypto/open-data.ts';
import { summaryOf } from '#lib/group/sealed-money.ts';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ data }) => {
	const opened = await openedLoad(data);
	if (!browser) return opened;
	return {
		...opened,
		yourGroups: opened.yourGroups.map((group) =>
			group.sealed ? { ...group, ...summaryOf(group.sealed) } : group
		)
	};
};
