// What encrypting a group takes from a browser (#110): its text to seal, and what's sealed coming back.
import { error, json } from '@sveltejs/kit';
import { requireGroup } from '#lib/server/context.ts';
import { encryptStep, textOf, type EncryptStep } from '#lib/server/encrypt-group.ts';
import { memberOf } from '#lib/server/groups.ts';
import { findPerson } from '#lib/server/people.ts';
import type { RequestHandler } from './$types';

/** Someone in the group */
async function context(locals: App.Locals, token: string) {
	const group = await requireGroup(locals.db, token);
	const person = await findPerson(locals.db, locals.deviceKey);
	const actorId = await memberOf(locals.db, group.id, person?.id);
	if (!actorId) error(403);
	return { group, actorId };
}

export const GET: RequestHandler = async ({ locals, params }) => {
	const { group } = await context(locals, params.token);
	return json(await textOf(locals.db, group.id));
};

export const POST: RequestHandler = async ({ locals, params, request }) => {
	const { group, actorId } = await context(locals, params.token);
	const step = (await request.json().catch(() => null)) as EncryptStep | null;
	const answer = step && (await encryptStep(locals.db, group, actorId, step));
	if (!answer) error(400);
	return json(answer);
};
