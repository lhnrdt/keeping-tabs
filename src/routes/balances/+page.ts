import { browser, openedLoad } from '#lib/crypto/open-data.ts';
import { spendingWithCategories } from '#lib/insights/across.ts';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ data }) => {
	const { sealedSpending, ...opened } = await openedLoad(data);
	return {
		...opened,
		spending: sealedSpending && browser ? spendingWithCategories(sealedSpending) : opened.spending
	};
};
