import { listActivity } from '#lib/server/activity.ts';
import { formContext as context, groupOf } from '#lib/server/context.ts';
import { findDeletedEntry, restoreEntry } from '#lib/server/expenses.ts';
import type { Actions, PageServerLoad } from './$types';

/** Who changed what in the group (#43), everyone in it can see */
export const load: PageServerLoad = async ({ locals, params }) => {
	const group = await groupOf(locals, params.token);
	return { activity: await listActivity(locals.db, group.id) };
};

export const actions: Actions = {
	/** Brings a deleted expense or payment back (L-3) */
	restore: async ({ locals, params, request }) => {
		const { form, group, actorId } = await context(locals, params.token, request);
		const entry = await findDeletedEntry(locals.db, group.id, String(form.get('entryId') ?? ''));
		if (entry) await restoreEntry(locals.db, group.id, actorId, entry);
	}
};
