import { browser, openedLoad } from '#lib/crypto/open-data.ts';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ data }) => {
	const opened = await openedLoad(data);
	// On the server there's nothing readable to show yet: its outline instead
	return { ...opened, opening: !browser && Boolean(data.group.keyId) };
};
