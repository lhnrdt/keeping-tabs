// This browser's notifications on (POST its subscription) or off (DELETE) (#56)
import { error, json } from '@sveltejs/kit';
import { ensurePerson, findPerson } from '#lib/server/people.ts';
import { isSubscription, pushPublicKey, subscribe, unsubscribe } from '#lib/server/push.ts';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ locals, request }) => {
	if (!pushPublicKey()) error(404);
	const sub = await request.json().catch(() => null);
	if (!isSubscription(sub)) error(400);
	const person = await ensurePerson(locals.db, locals.deviceKey);
	await subscribe(locals.db, person.id, sub);
	return json({ ok: true });
};

export const DELETE: RequestHandler = async ({ locals, request }) => {
	const { endpoint } = (await request.json().catch(() => ({}))) as { endpoint?: unknown };
	const person = await findPerson(locals.db, locals.deviceKey);
	if (person && typeof endpoint === 'string') await unsubscribe(locals.db, person.id, endpoint);
	return json({ ok: true });
};
