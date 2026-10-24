export type Member = { id: string; name: string };

/** A member as the group screens see it (see /g/[token]/+layout.server.ts) */
export type GroupMember = Member & {
	/** Stable per person across groups, for the avatar color (A-13) */
	avatarId: string;
	/** The person's chosen avatar, e.g. "deer:moss" (#61); null for initials */
	avatar: string | null;
	claimed: boolean;
	/** Claimed by this device's person */
	mine: boolean;
};

/** Member names by id, for showing who paid. */
export const namesById = (members: readonly Member[]) =>
	new Map(members.map((member) => [member.id, member.name]));

/** Up to two initials for an avatar, e.g. "Elisabeth Hecht" → "EH", "anna" → "A". */
export function initials(name: string): string {
	const words = name.trim().split(/\s+/).filter(Boolean);
	const letters = words.length > 1 ? [words[0], words.at(-1)!] : words;
	return letters.map((word) => [...word][0]?.toLocaleUpperCase() ?? '').join('');
}
