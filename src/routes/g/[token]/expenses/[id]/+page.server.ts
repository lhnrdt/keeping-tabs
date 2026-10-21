import { error, redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';
import { m } from '#lib/paraglide/messages.js';
import { formContext } from '#lib/server/context.ts';
import { readExpenseForm } from '#lib/server/expense-form.ts';
import { deleteExpense, findExpense, updateExpense } from '#lib/server/expenses.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params, parent }) => {
	const { group } = await parent();
	const expense = await findExpense(locals.db, group.id, params.id);
	if (!expense) error(404, m.error_expense_not_found());
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
		await deleteExpense(locals.db, group.id, actorId, params.id);
		redirect(303, resolve('/g/[token]', { token: params.token }));
	}
};
