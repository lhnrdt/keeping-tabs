import { redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';
import { formContext, requireGroup } from '#lib/server/context.ts';
import { readExpenseForm } from '#lib/server/expense-form.ts';
import { createExpense } from '#lib/server/expenses.ts';
import { listMembers } from '#lib/server/groups.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	const group = await requireGroup(locals.db, params.token);
	return { group, members: await listMembers(locals.db, group.id) };
};

export const actions: Actions = {
	save: async ({ locals, params, request }) => {
		const { form, group, actorId } = await formContext(locals, params.token, request);
		const result = await readExpenseForm(locals.db, group, form);
		if (!result.ok) return result.failure;
		await createExpense(locals.db, group.id, actorId, result.input);
		redirect(303, resolve('/g/[token]', { token: params.token }));
	}
};
