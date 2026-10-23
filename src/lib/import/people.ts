// Who is who: each person in an export becomes an existing member or a new one.
import { matchMember } from '#lib/group/match-member.ts';
import { parseMemberName, type Result } from '#lib/validation.ts';

type Member = { id: string; name: string };

/** The form field with the chosen member for the person in column `index` */
export const personField = (index: number) => `person:${index}`;

/** The form value for "add as a new member" */
export const NEW_MEMBER = 'new';

/** The member a person probably is: same name, or same first name ("Elisabeth Hecht"). */
export const suggestMember = (name: string, members: readonly Member[]): string =>
	matchMember(name, members)?.id ?? NEW_MEMBER;

/**
 * Checks the chosen member per person (missing → the suggestion): known members, nobody
 * chosen twice, and new members' names free. Returns member ids, null for new members.
 */
export function resolvePeople(
	choices: readonly (string | undefined)[],
	people: readonly string[],
	members: readonly Member[]
): Result<(string | null)[]> {
	const chosen = people.map((name, i) => choices[i] || suggestMember(name, members));
	const memberIds = chosen.filter((choice) => choice !== NEW_MEMBER);
	if (memberIds.some((id) => !members.some((member) => member.id === id))) {
		return { ok: false, error: 'import_people_invalid' };
	}
	if (new Set(memberIds).size !== memberIds.length) {
		return { ok: false, error: 'import_people_invalid' };
	}
	const names = members.map((member) => member.name);
	for (const [i, choice] of chosen.entries()) {
		if (choice !== NEW_MEMBER) continue;
		const name = parseMemberName(people[i], names);
		if (!name.ok) return name;
		names.push(name.value);
	}
	return { ok: true, value: chosen.map((choice) => (choice === NEW_MEMBER ? null : choice)) };
}
