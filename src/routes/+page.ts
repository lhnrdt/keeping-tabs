import { resolve } from '$app/paths';
import { browser, openedLoad } from '#lib/crypto/open-data.ts';
import { sealedEntries } from '#lib/group/sealed-entries.ts';
import { summaryOf, type SealedEntry } from '#lib/group/sealed-money.ts';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ data, fetch }) => {
	const opened = await openedLoad(data);
	if (!browser) {
		// Nothing readable to show yet: its outline instead
		return { ...opened, opening: opened.yourGroups.some((group) => group.sealed) };
	}
	return {
		...opened,
		opening: false,
		yourGroups: await Promise.all(
			opened.yourGroups.map(async (group) =>
				group.sealed
					? {
							...group,
							...summaryOf({
								...group.sealed,
								expenses: await sealedEntries<SealedEntry>(
									fetch,
									resolve('/g/[token]', { token: group.token }),
									group.id
								)
							})
						}
					: group
			)
		)
	};
};
