// Changing a repeating expense (#45): from its next date on. What it added before stays.
import { error, fail, redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';
import { todayInputValue } from '#lib/dates.ts';
import { isFrequency } from '#lib/expense/recurrence.ts';
import { groupTabUrl } from '#lib/group/tabs.ts';
import { m } from '#lib/paraglide/messages.js';
import { formContext } from '#lib/server/context.ts';
import { listChosenCategories } from '#lib/server/expenses.ts';
import { readExpenseForm } from '#lib/server/group-forms.ts';
import { addDueRecurring, findRecurring, updateRecurring } from '#lib/server/recurring.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params, parent }) => {
	const { group } = await parent();
	const [rule, chosen] = await Promise.all([
		findRecurring(locals.db, group.id, params.id),
		listChosenCategories(locals.db, group.id)
	]);
	if (!rule) error(404, m.error_not_found());
	return { rule, chosen };
};

export const actions: Actions = {
	save: async ({ locals, params, request }) => {
		const { form, group, actorId } = await formContext(locals, params.token, request);
		const repeats = form.get('repeats');
		if (!isFrequency(repeats)) return fail(400, { error: 'settings_invalid' as const });
		const result = await readExpenseForm(locals.db, group, form, actorId);
		if (!result.ok) return result.failure;
		const updated = await updateRecurring(
			locals.db,
			group.id,
			actorId,
			params.id,
			result.input,
			repeats
		);
		if (!updated) error(404, m.error_not_found());
		await addDueRecurring(locals.db, todayInputValue(), group.id);
		redirect(303, groupTabUrl(resolve('/g/[token]', { token: params.token }), 'group'));
	}
};
