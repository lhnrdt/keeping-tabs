import { fail, redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';
import type { ErrorCode } from '#lib/errors.ts';
import { groupTabUrl } from '#lib/group/tabs.ts';
import { formContext } from '#lib/server/context.ts';
import { updateGroup } from '#lib/server/groups.ts';
import { parseDescription, parseGroupName, parseKind, parseTint } from '#lib/validation.ts';
import type { Actions } from './$types';

export const actions: Actions = {
	save: async ({ locals, params, request }) => {
		const { form, group, actorId } = await formContext(locals, params.token, request);
		const invalid = (error: ErrorCode) => fail(400, { error });

		const name = parseGroupName(form.get('name'));
		if (!name.ok) return invalid(name.error);
		const description = parseDescription(form.get('description'));
		if (!description.ok) return invalid(description.error);
		const kind = parseKind(form.get('kind'));
		if (!kind.ok) return invalid(kind.error);
		const tint = parseTint(form.get('tint'));
		if (!tint.ok) return invalid(tint.error);

		await updateGroup(locals.db, group.id, actorId, {
			name: name.value,
			description: description.value,
			kind: kind.value,
			tint: tint.value,
			// A checkbox: present when on
			simplifyDebts: form.get('simplifyDebts') === 'on'
		});
		redirect(303, groupTabUrl(resolve('/g/[token]', { token: params.token }), 'group'));
	}
};
