import { fail, redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';
import type { ErrorCode } from '#lib/errors.ts';
import { resolvePeople, personField } from '#lib/import/people.ts';
import { planRow } from '#lib/import/plan.ts';
import { parseSplitwise } from '#lib/import/splitwise.ts';
import { formContext } from '#lib/server/context.ts';
import { listMembers } from '#lib/server/groups.ts';
import { importEntries } from '#lib/server/import.ts';
import type { Actions } from './$types';

/** Years of a busy group's history are well below this */
const MAX_FILE_BYTES = 2_000_000;
/** Entries in one import: well within what the database takes in one go (#71) */
const MAX_ROWS = 5_000;

export const actions: Actions = {
	default: async ({ locals, params, request }) => {
		const { form, group, actorId } = await formContext(locals, params.token, request);
		const invalid = (error: ErrorCode) => fail(400, { error });

		const file = form.get('file');
		if (!(file instanceof File) || file.size === 0) return invalid('import_file_missing');
		if (file.size > MAX_FILE_BYTES) return invalid('import_too_large');

		const parsed = parseSplitwise(await file.text(), group.currency);
		if (!parsed.ok) return invalid(parsed.error);
		const { people, rows } = parsed.value;
		if (rows.length > MAX_ROWS) return invalid('import_too_large');

		const members = await listMembers(locals.db, group.id);
		const choices = people.map((_, i) => form.get(personField(i))?.toString());
		const memberOf = resolvePeople(choices, people, members);
		if (!memberOf.ok) return invalid(memberOf.error);

		await importEntries(locals.db, group.id, actorId, {
			memberOf: memberOf.value,
			names: people,
			entries: rows.flatMap(planRow)
		});
		redirect(303, resolve('/g/[token]', { token: params.token }));
	}
};
