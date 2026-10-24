import { error, redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';
import { groupTabUrl, undoUrl } from '#lib/group/tabs.ts';
import { m } from '#lib/paraglide/messages.js';
import { formContext } from '#lib/server/context.ts';
import { findExpense, softDeleteEntry } from '#lib/server/expenses.ts';
import { readPaymentForm } from '#lib/server/group-forms.ts';
import { updatePayment } from '#lib/server/payments.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params, parent }) => {
	const { group } = await parent();
	const payment = await findExpense(locals.db, group.id, params.id);
	if (payment?.type !== 'payment') error(404, m.error_payment_not_found());
	return { payment };
};

export const actions: Actions = {
	save: async ({ locals, params, request }) => {
		const { form, group, actorId } = await formContext(locals, params.token, request);
		const result = await readPaymentForm(locals.db, group, form);
		if (!result.ok) return result.failure;
		if (!(await updatePayment(locals.db, group.id, actorId, params.id, result.input))) {
			error(404, m.error_payment_not_found());
		}
		redirect(303, groupTabUrl(resolve('/g/[token]', { token: params.token }), 'balances'));
	},

	delete: async ({ locals, params, request }) => {
		const { group, actorId } = await formContext(locals, params.token, request);
		await softDeleteEntry(locals.db, group.id, actorId, params.id, 'payment.delete');
		redirect(303, undoUrl(resolve('/g/[token]', { token: params.token }), 'balances', params.id));
	}
};
