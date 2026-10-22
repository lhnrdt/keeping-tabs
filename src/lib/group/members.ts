export type Member = { id: string; name: string };

/** Member names by id, for showing who paid. */
export const namesById = (members: readonly Member[]) =>
	new Map(members.map((member) => [member.id, member.name]));

/** Up to two initials for an avatar, e.g. "Elisabeth Hecht" → "EH", "anna" → "A". */
export function initials(name: string): string {
	const words = name.trim().split(/\s+/).filter(Boolean);
	const letters = words.length > 1 ? [words[0], words.at(-1)!] : words;
	return letters.map((word) => [...word][0]?.toLocaleUpperCase() ?? '').join('');
}
