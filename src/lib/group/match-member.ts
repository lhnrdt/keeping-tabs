// Which member a typed name probably means, e.g. when joining or importing.
import { normalizeText } from '#lib/validation.ts';

type Named = { id: string; name: string };

const lower = (text: string) => normalizeText(text).toLocaleLowerCase();

/** The member with the same name, else the same first name ("Elisabeth Hecht"); or none. */
export function matchMember<T extends Named>(name: string, members: readonly T[]): T | undefined {
	const typed = lower(name);
	if (!typed) return undefined;
	const first = typed.split(' ')[0];
	return (
		members.find((member) => lower(member.name) === typed) ??
		members.find((member) => lower(member.name) === first)
	);
}
