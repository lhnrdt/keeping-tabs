// Brings this browser's remembered groups up to date with the server (#125).
import { resolve } from '$app/paths';
import { openDeep } from '#lib/crypto/open-data.ts';
import { getRecentGroups, keepRecentGroups } from '#lib/device.ts';
import type { GroupLink } from './your-groups';

/** The remembered groups now; as remembered when offline or the server can't be reached */
export async function currentRecentGroups() {
	const remembered = await openDeep(getRecentGroups());
	if (remembered.length === 0) return remembered;
	try {
		const response = await fetch(resolve('/recent-groups'), {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ tokens: remembered.map((group) => group.token) })
		});
		if (!response.ok) return remembered;
		// Sealed like everything of an encrypted group: opened here, like every page's data (#110)
		return keepRecentGroups(await openDeep((await response.json()) as GroupLink[]));
	} catch {
		return remembered;
	}
}
