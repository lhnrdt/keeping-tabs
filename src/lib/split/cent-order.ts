// Who gets a split's odd cent: whoever owes the least right now, so over time nobody keeps paying
// the extra cents. A cent that doesn't divide evenly goes to the first in this order.

type Balances = Readonly<Record<string, number>>;

/** The members, the highest balance first; equal balances keep the group's order */
export function centOrder(memberIds: readonly string[], balances: Balances | undefined) {
	if (!balances) return [...memberIds];
	const balanceOf = (id: string) => balances[id] ?? 0;
	return memberIds
		.map((id, index) => ({ id, index }))
		.sort((a, b) => balanceOf(b.id) - balanceOf(a.id) || a.index - b.index)
		.map(({ id }) => id);
}

/** The same ids, in the order given; ids it doesn't name come after, as they were */
export function inOrder(ids: readonly string[], order: readonly string[] | undefined) {
	if (!order) return [...ids];
	const rank = (id: string) => {
		const index = order.indexOf(id);
		return index === -1 ? order.length : index;
	};
	return ids
		.map((id, index) => ({ id, index }))
		.sort((a, b) => rank(a.id) - rank(b.id) || a.index - b.index)
		.map(({ id }) => id);
}
