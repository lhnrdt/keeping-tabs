import { groupOf, membersOf } from '#lib/server/context.ts';
import { listFormerMembers } from '#lib/server/groups.ts';
import { hasTakenPart } from '#lib/server/membership.ts';
import { personOf } from '#lib/server/people.ts';
import type { LayoutServerLoad } from './$types';

/**
 * Group and members, shared by every screen of the group. Each member says whether it's
 * claimed and whether it's this device's own (A-4); avatarId keeps a person's avatar color
 * the same in every group (A-13).
 */
export const load: LayoutServerLoad = async ({ locals, params }) => {
	const group = await groupOf(locals, params.token);
	const [members, formerMembers, person] = await Promise.all([
		membersOf(locals, group.id),
		listFormerMembers(locals.db, group.id),
		personOf(locals)
	]);
	const mine = members.find((member) => person && member.personId === person.id);
	return {
		group,
		members: members.map(({ id, name, personId, avatar }) => ({
			id,
			name,
			avatarId: personId ?? id,
			avatar,
			claimed: personId !== null,
			mine: personId !== null && personId === person?.id
		})),
		formerMembers,
		// "Not you?" is possible until you've added or changed something here
		canStepBack: mine ? !(await hasTakenPart(locals.db, group.id, mine.id)) : false,
		profileName: person?.name ?? null
	};
};
