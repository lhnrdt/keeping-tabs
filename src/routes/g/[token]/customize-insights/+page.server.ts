// Which insights the group shows (#174), saved for the whole group.
import { redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';
import { groupTabUrl } from '#lib/group/tabs.ts';
import { choiceToStore, isSection } from '#lib/insights/sections.ts';
import { formContext } from '#lib/server/context.ts';
import { setInsightSections } from '#lib/server/groups.ts';
import type { Actions } from './$types';

const insightsTab = (token: string) => groupTabUrl(resolve('/g/[token]', { token }), 'insights');

export const actions: Actions = {
	save: async ({ locals, params, request }) => {
		const { form, group, actorId } = await formContext(locals, params.token, request);
		const chosen = form.getAll('section').filter(isSection);
		await setInsightSections(locals.db, group.id, actorId, choiceToStore(group.kind, chosen));
		redirect(303, insightsTab(params.token));
	},

	/** Forgets the choice: the group type's suggestions again */
	reset: async ({ locals, params, request }) => {
		const { group, actorId } = await formContext(locals, params.token, request);
		await setInsightSections(locals.db, group.id, actorId, null);
		redirect(303, insightsTab(params.token));
	}
};
