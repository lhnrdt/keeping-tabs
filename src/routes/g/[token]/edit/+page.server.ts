import { error, fail, redirect } from '@sveltejs/kit';
import { isSealed } from '#lib/crypto/seal.ts';
import { SEALED_GROUP_COLUMNS } from '#lib/expense/sealed-details.ts';
import { m } from '#lib/paraglide/messages.js';
import { resolve } from '$app/paths';
import type { ErrorCode } from '#lib/errors.ts';
import { groupTabUrl } from '#lib/group/tabs.ts';
import { entryCurrencyOf } from '#lib/expense/exchange.ts';
import { formContext } from '#lib/server/context.ts';
import { setGroupDetails, updateGroup } from '#lib/server/groups.ts';
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
		// Encrypted: its look and settings were checked and sealed in the browser (#110)
		if (group.keyId) {
			const details = form.get('details');
			if (!isSealed(details)) error(409, m.locked_reload());
			await setGroupDetails(locals.db, group.id, details);
			await updateGroup(locals.db, group.id, actorId, {
				...SEALED_GROUP_COLUMNS,
				name: name.value,
				description: description.value
			});
			redirect(303, groupTabUrl(resolve('/g/[token]', { token: params.token }), 'group'));
		}
		const kind = parseKind(form.get('kind'));
		if (!kind.ok) return invalid(kind.error);
		const tint = parseTint(form.get('tint'));
		if (!tint.ok) return invalid(tint.error);
		const entryCurrency = entryCurrencyOf(form.get('entryCurrency'), group.currency);
		if (!entryCurrency.ok) return invalid(entryCurrency.error);

		await updateGroup(locals.db, group.id, actorId, {
			name: name.value,
			description: description.value,
			kind: kind.value,
			tint: tint.value,
			// A checkbox: present when on
			simplifyDebts: form.get('simplifyDebts') === 'on',
			entryCurrency: entryCurrency.value
		});
		redirect(303, groupTabUrl(resolve('/g/[token]', { token: params.token }), 'group'));
	}
};
