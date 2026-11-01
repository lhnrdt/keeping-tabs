// An import into an encrypted group (#110): read and sealed in the browser, so only checked here.
import { error, json } from '@sveltejs/kit';
import { requireGroup } from '#lib/server/context.ts';
import { memberOf } from '#lib/server/groups.ts';
import { importSealedEntries } from '#lib/server/import.ts';
import { findPerson } from '#lib/server/people.ts';
import { parseSealedImport } from '#lib/server/sealed-import.ts';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ locals, params, request }) => {
	const group = await requireGroup(locals.db, params.token);
	if (!group.keyId) error(400);
	const person = await findPerson(locals.db, locals.deviceKey);
	const actorId = await memberOf(locals.db, group.id, person?.id);
	if (!actorId) error(403);
	const input = parseSealedImport(await request.json().catch(() => null));
	if (!input) error(400);
	return json(await importSealedEntries(locals.db, group.id, actorId, input));
};
