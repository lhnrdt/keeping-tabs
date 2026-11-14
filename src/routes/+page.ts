import { resolve } from '$app/paths';
import { browser, openedLoad } from '#lib/crypto/open-data.ts';
import { m } from '#lib/paraglide/messages.js';
import { ENTRIES_CHANGED, sealedEntries } from '#lib/group/sealed-entries.ts';
import { summaryOf, type SealedEntry } from '#lib/group/sealed-money.ts';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ data, fetch, depends }) => {
	depends(ENTRIES_CHANGED);
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
							// Without the key its money can't be known: not the same as settled up
							unreadable: group.name === m.locked_text(),
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
