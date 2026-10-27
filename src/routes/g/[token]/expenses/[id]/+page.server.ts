import { error, redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';
import { undoUrl } from '#lib/group/tabs.ts';
import { m } from '#lib/paraglide/messages.js';
import { formContext } from '#lib/server/context.ts';
import { readExpenseForm, rememberDefaultSplit } from '#lib/server/group-forms.ts';
import {
	findExpense,
	listChosenCategories,
	softDeleteEntry,
	updateExpense
} from '#lib/server/expenses.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params, parent }) => {
	const { group } = await parent();
	const [expense, chosen] = await Promise.all([
		findExpense(locals.db, group.id, params.id),
		listChosenCategories(locals.db, group.id)
	]);
	if (expense?.type !== 'expense') error(404, m.error_expense_not_found());
	return { expense, chosen };
};

export const actions: Actions = {
	save: async ({ locals, params, request }) => {
		const { form, group, actorId } = await formContext(locals, params.token, request);
		const result = await readExpenseForm(locals.db, group, form);
		if (!result.ok) return result.failure;
		if (!(await updateExpense(locals.db, group.id, actorId, params.id, result.input))) {
			error(404, m.error_expense_not_found());
		}
		await rememberDefaultSplit(locals.db, group.id, actorId, form, result.input);
		redirect(303, resolve('/g/[token]', { token: params.token }));
	},

	delete: async ({ locals, params, request }) => {
		const { group, actorId } = await formContext(locals, params.token, request);
		await softDeleteEntry(locals.db, group.id, actorId, params.id, 'expense.delete');
		redirect(303, undoUrl(resolve('/g/[token]', { token: params.token }), 'expenses', params.id));
	}
};
