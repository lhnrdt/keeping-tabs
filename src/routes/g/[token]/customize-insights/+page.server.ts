// Which insights the group shows (#174), saved for the whole group.
import { error, redirect } from '@sveltejs/kit';
import { isSealed } from '#lib/crypto/seal.ts';
import { m } from '#lib/paraglide/messages.js';
import type { Db } from '#lib/server/db/index.ts';
import { resolve } from '$app/paths';
import { groupTabUrl } from '#lib/group/tabs.ts';
import { choiceToStore, isSection } from '#lib/insights/sections.ts';
import { formContext } from '#lib/server/context.ts';
import { setGroupDetails, setInsightSections } from '#lib/server/groups.ts';
import type { Actions } from './$types';

const insightsTab = (token: string) => groupTabUrl(resolve('/g/[token]', { token }), 'insights');

/** Encrypted: chosen and sealed in the browser (#110) */
async function saveSealedSections(db: Db, groupId: string, form: FormData) {
	const details = form.get('details');
	if (!isSealed(details)) error(409, m.locked_reload());
	await setGroupDetails(db, groupId, details);
}

export const actions: Actions = {
	save: async ({ locals, params, request }) => {
		const { form, group, actorId } = await formContext(locals, params.token, request);
		if (group.keyId) {
			await saveSealedSections(locals.db, group.id, form);
			redirect(303, insightsTab(params.token));
		}
		const chosen = form.getAll('section').filter(isSection);
		await setInsightSections(locals.db, group.id, actorId, choiceToStore(group.kind, chosen));
		redirect(303, insightsTab(params.token));
	},

	/** Forgets the choice: the group type's suggestions again */
	reset: async ({ locals, params, request }) => {
		const { form, group, actorId } = await formContext(locals, params.token, request);
		if (group.keyId) {
			await saveSealedSections(locals.db, group.id, form);
			redirect(303, insightsTab(params.token));
		}
		await setInsightSections(locals.db, group.id, actorId, null);
		redirect(303, insightsTab(params.token));
	}
};
