// Tells the group about something just done here (#267): a payment, an expense changed or deleted,
// a comment, someone joining. Asked for right after it, as a request of its own (#256).
import { error, json } from '@sveltejs/kit';
import { formContext } from '#lib/server/context.ts';
import { logError } from '#lib/server/error-log.ts';
import { isPushEvent, notifyEvent } from '#lib/server/push-events.ts';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ locals, params, request }) => {
	const { form, group, actorId } = await formContext(locals, params.token, request);
	const event = form.get('event');
	if (!isPushEvent(event)) error(400);
	if (!actorId) return json({ sent: false });
	const sent = await notifyEvent(locals.db, group, actorId, event).catch((failure: unknown) => {
		logError({ error: failure, route: 'push', method: 'POST' });
		return false;
	});
	return json({ sent });
};
