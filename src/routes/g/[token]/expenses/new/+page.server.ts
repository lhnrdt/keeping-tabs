import { redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';
import { todayInputValue } from '#lib/dates.ts';
import { isFrequency } from '#lib/expense/recurrence.ts';
import { formContext } from '#lib/server/context.ts';
import { addDueRecurring, startRecurring } from '#lib/server/recurring.ts';
import { readExpenseForm, rememberDefaultSplit } from '#lib/server/group-forms.ts';
import { createExpense, listChosenCategories } from '#lib/server/expenses.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, parent }) => {
	const { group } = await parent();
	return { chosen: await listChosenCategories(locals.db, group.id) };
};

export const actions: Actions = {
	save: async ({ locals, params, request }) => {
		const { form, group, actorId } = await formContext(locals, params.token, request);
		const result = await readExpenseForm(locals.db, group, form);
		if (!result.ok) return result.failure;
		await createExpense(locals.db, group.id, actorId, result.input);
		await rememberDefaultSplit(locals.db, group.id, actorId, form, result.input);
		// Repeats (#45): from its date on; a date in the past catches up right away
		const repeats = form.get('repeats');
		if (isFrequency(repeats)) {
			await startRecurring(locals.db, group.id, actorId, result.input, repeats);
			await addDueRecurring(locals.db, todayInputValue(), group.id);
		}
		redirect(303, resolve('/g/[token]', { token: params.token }));
	}
};
