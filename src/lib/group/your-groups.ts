// "Your groups" on the home screen: groups you're a member of (from the server, on every
// device) plus groups only opened in this browser (A-6, A-17).

export type GroupLink = { id: string; name: string; token: string };

/**
 * Server groups win for name and link (they're current, e.g. after a new link); groups
 * opened recently come first, the rest keep the server's order.
 */
export function mergeGroups(
	server: readonly GroupLink[],
	local: readonly (GroupLink & { openedAt: number })[]
): GroupLink[] {
	const openedAt = new Map(local.map((group) => [group.id, group.openedAt]));
	const serverIds = new Set(server.map((group) => group.id));
	const merged = [...server, ...local.filter((group) => !serverIds.has(group.id))];
	return merged
		.map((group, index) => ({ group, index, opened: openedAt.get(group.id) ?? 0 }))
		.sort((a, b) => b.opened - a.opened || a.index - b.index)
		.map(({ group: { id, name, token } }) => ({ id, name, token }));
}
