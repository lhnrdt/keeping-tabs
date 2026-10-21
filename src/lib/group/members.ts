export type Member = { id: string; name: string };

/** Member names by id, for showing who paid. */
export const namesById = (members: readonly Member[]) =>
	new Map(members.map((member) => [member.id, member.name]));
