import { error, redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';
import { m } from '#lib/paraglide/messages.js';
import { formContext } from '#lib/server/context.ts';
import { readExpenseForm } from '#lib/server/group-forms.ts';
import { findExpense, softDeleteEntry, updateExpense } from '#lib/server/expenses.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params, parent }) => {
	const { group } = await parent();
	const expense = await findExpense(locals.db, group.id, params.id);
	if (expense?.type !== 'expense') error(404, m.error_expense_not_found());
	return { expense };
};

export const actions: Actions = {
	save: async ({ locals, params, request }) => {
		const { form, group, actorId } = await formContext(locals, params.token, request);
		const result = await readExpenseForm(locals.db, group, form);
		if (!result.ok) return result.failure;
		await updateExpense(locals.db, group.id, actorId, params.id, result.input);
		redirect(303, resolve('/g/[token]', { token: params.token }));
	},

	delete: async ({ locals, params, request }) => {
		const { group, actorId } = await formContext(locals, params.token, request);
		await softDeleteEntry(locals.db, group.id, actorId, params.id, 'expense.delete');
		redirect(303, resolve('/g/[token]', { token: params.token }));
	}
};
