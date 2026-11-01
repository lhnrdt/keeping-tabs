import { browser, openedLoad } from '#lib/crypto/open-data.ts';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ data }) => {
	const opened = await openedLoad(data);
	return {
		...opened,
		// In order of joining, then by name: only here can sealed names be told apart
		members: opened.members.toSorted(
			(a, b) => a.joinedAt - b.joinedAt || a.name.localeCompare(b.name)
		),
		// On the server there's nothing readable to show yet: its outline instead
		opening: !browser && Boolean(data.group.keyId)
	};
};
