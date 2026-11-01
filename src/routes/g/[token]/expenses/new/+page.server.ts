import { redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';
import { todayInputValue } from '#lib/dates.ts';
import { isFrequency } from '#lib/expense/recurrence.ts';
import { formContext } from '#lib/server/context.ts';
import { addDueRecurring, startRecurring } from '#lib/server/recurring.ts';
import { readExpenseForm, rememberDefaultSplit } from '#lib/server/group-forms.ts';
import { createExpense, entryGroupOf, listChosenCategories } from '#lib/server/expenses.ts';
import { clientIdIn } from '#lib/validation.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, parent }) => {
	const { group } = await parent();
	return { chosen: await listChosenCategories(locals.db, group.id) };
};

export const actions: Actions = {
	save: async ({ locals, params, request }) => {
		const { form, group, actorId } = await formContext(locals, params.token, request);
		// Sent again after a lost connection (#55): it's there already, nothing more to do
		const fromDevice = clientIdIn(form);
		const existing = fromDevice ? await entryGroupOf(locals.db, fromDevice) : null;
		if (existing === group.id) redirect(303, resolve('/g/[token]', { token: params.token }));
		const result = await readExpenseForm(locals.db, group, form, actorId);
		if (!result.ok) return result.failure;
		await createExpense(
			locals.db,
			group.id,
			actorId,
			result.input,
			existing === null ? fromDevice : undefined
		);
		await rememberDefaultSplit(locals.db, group.id, actorId, form, result.input);
		// Repeats (#45): from its date on; a date in the past catches up right away
		const repeats = form.get('repeats');
		if (isFrequency(repeats)) {
			// Encrypted: under the same placeholder, not whoever set it up (#110)
			const owner = group.keyId ? result.input.paidBy : actorId;
			await startRecurring(locals.db, group.id, owner, result.input, repeats);
			await addDueRecurring(locals.db, todayInputValue(), group.id);
		}
		redirect(303, resolve('/g/[token]', { token: params.token }));
	}
};
