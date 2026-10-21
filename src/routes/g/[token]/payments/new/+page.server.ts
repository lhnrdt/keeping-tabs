import { redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';
import { groupTabUrl } from '#lib/group/tabs.ts';
import { formContext } from '#lib/server/context.ts';
import { readPaymentForm } from '#lib/server/group-forms.ts';
import { createPayment } from '#lib/server/payments.ts';
import type { Actions } from './$types';

export const actions: Actions = {
	save: async ({ locals, params, request }) => {
		const { form, group, actorId } = await formContext(locals, params.token, request);
		const result = await readPaymentForm(locals.db, group, form);
		if (!result.ok) return result.failure;
		await createPayment(locals.db, group.id, actorId, result.input);
		redirect(303, groupTabUrl(resolve('/g/[token]', { token: params.token }), 'balances'));
	}
};
