import { browser, openedGroupLoad } from '#lib/crypto/open-data.ts';
import { groupInsights } from '#lib/insights/group.ts';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ data, parent }) => {
	const { sealedInsights, ...opened } = await openedGroupLoad(data, parent);
	return {
		...opened,
		insights: sealedInsights && browser ? groupInsights(...sealedInsights) : opened.insights
	};
};
