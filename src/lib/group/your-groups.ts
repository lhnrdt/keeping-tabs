// "Your groups" on the home screen: groups you're a member of (from the server, on every
// device) plus groups only opened in this browser (A-6, A-17).

import type { GroupKind } from './kinds';
import type { Tint } from '../tints';

/** kind and tint are missing for groups remembered before they existed */
export type GroupLink = {
	id: string;
	name: string;
	token: string;
	kind?: GroupKind;
	tint?: Tint | null;
};

/**
 * Server groups win for name and link (they're current, e.g. after a new link); groups
 * opened recently come first, the rest keep the server's order.
 */
export function mergeGroups<Server extends GroupLink>(
	server: readonly Server[],
	local: readonly (GroupLink & { openedAt: number })[]
): (Server | GroupLink)[] {
	const openedAt = new Map(local.map((group) => [group.id, group.openedAt]));
	const serverIds = new Set(server.map((group) => group.id));
	const localOnly = local
		.filter((group) => !serverIds.has(group.id))
		.map(({ id, name, token, kind, tint }): GroupLink => ({ id, name, token, kind, tint }));
	const merged: (Server | GroupLink)[] = [...server, ...localOnly];
	return merged
		.map((group, index) => ({ group, index, opened: openedAt.get(group.id) ?? 0 }))
		.sort((a, b) => b.opened - a.opened || a.index - b.index)
		.map(({ group }) => group);
}
