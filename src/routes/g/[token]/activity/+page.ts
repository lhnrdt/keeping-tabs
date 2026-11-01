import { openedGroupLoad } from '#lib/crypto/open-data.ts';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ data, parent }) => {
	const opened = await openedGroupLoad(data, parent);
	const { members, formerMembers } = await parent();
	const names = new Map([...members, ...formerMembers].map(({ id, name }) => [id, name]));
	return {
		...opened,
		// Who it was is sealed in an encrypted group (#110)
		activity: opened.activity.map((item) => ({
			...item,
			who: item.who ?? (item.sealedActor ? (names.get(item.sealedActor) ?? null) : null)
		}))
	};
};
