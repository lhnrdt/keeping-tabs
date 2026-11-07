// The split for new expenses (#306): equally, by percent or by parts.
import { error, fail, redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';
import { isSealed } from '#lib/crypto/seal.ts';
import { groupTabUrl } from '#lib/group/tabs.ts';
import { m } from '#lib/paraglide/messages.js';
import { formContext } from '#lib/server/context.ts';
import { listMembers, setDefaultSplit, setGroupDetails } from '#lib/server/groups.ts';

import { parseDefaultSplitForm } from '#lib/split/default-split-form.ts';
import { readSplitInputs } from '#lib/split/form.ts';
import type { Actions } from './$types';

export const actions: Actions = {
	save: async ({ locals, params, request }) => {
		const { form, group, actorId } = await formContext(locals, params.token, request);
		const groupTab = groupTabUrl(resolve('/g/[token]', { token: params.token }), 'group');
		// Encrypted: checked and sealed in the browser (#110)
		if (group.keyId) {
			const details = form.get('details');
			if (!isSealed(details)) error(409, m.locked_reload());
			await setGroupDetails(locals.db, group.id, details);
			redirect(303, groupTab);
		}
		const values = { splitMode: form.get('splitMode'), inputs: readSplitInputs(form) };
		const memberIds = (await listMembers(locals.db, group.id)).map((member) => member.id);
		const parsed = parseDefaultSplitForm(values, { memberIds, currency: group.currency });
		if (!parsed.ok) return fail(400, { error: parsed.error, values });
		await setDefaultSplit(locals.db, group.id, actorId, parsed.value);
		redirect(303, groupTab);
	}
};
