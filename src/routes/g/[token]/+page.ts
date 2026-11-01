import { browser, openedLoad } from '#lib/crypto/open-data.ts';
import { groupInsights } from '#lib/insights/group.ts';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ data }) => {
	const { sealedInsights, ...opened } = await openedLoad(data);
	return {
		...opened,
		insights: sealedInsights && browser ? groupInsights(...sealedInsights) : opened.insights
	};
};
