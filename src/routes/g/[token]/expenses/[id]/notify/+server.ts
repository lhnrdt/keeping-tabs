// Tells the group about an expense just added (#56). The form asks for this right after saving,
// as a request of its own: on the free plan, one request has only 10 ms of CPU, which sending
// after the save's answer could run out of, without anyone noticing (#256).
import { error, json } from '@sveltejs/kit';
import { formContext } from '#lib/server/context.ts';
import { claimNotification } from '#lib/server/expenses.ts';
import { logError } from '#lib/server/error-log.ts';
import { notifyNewExpense } from '#lib/server/push.ts';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ locals, params, request }) => {
	const { group, actorId } = await formContext(locals, params.token, request);
	const expense = await claimNotification(locals.db, group.id, params.id);
	if (expense === undefined) error(404);
	if (expense === null) return json({ sent: false });
	await notifyNewExpense(locals.db, group, actorId, expense).catch((failure: unknown) => {
		logError({ error: failure, route: 'push', method: 'POST' });
	});
	return json({ sent: true });
};
