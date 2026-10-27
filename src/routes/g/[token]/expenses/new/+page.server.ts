import { redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';
import { todayInputValue } from '#lib/dates.ts';
import { isFrequency } from '#lib/expense/recurrence.ts';
import { formContext } from '#lib/server/context.ts';
import { notifyNewExpense } from '#lib/server/push.ts';
import { addDueRecurring, startRecurring } from '#lib/server/recurring.ts';
import { readExpenseForm, rememberDefaultSplit } from '#lib/server/group-forms.ts';
import { createExpense, entryGroupOf, listChosenCategories } from '#lib/server/expenses.ts';
import type { Actions, PageServerLoad } from './$types';

/** An id made on the device: a version 4 UUID */
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

export const load: PageServerLoad = async ({ locals, parent }) => {
	const { group } = await parent();
	return { chosen: await listChosenCategories(locals.db, group.id) };
};

export const actions: Actions = {
	save: async ({ locals, params, request, platform }) => {
		const { form, group, actorId } = await formContext(locals, params.token, request);
		// Sent again after a lost connection (#55): it's there already, nothing more to do
		const clientId = String(form.get('clientId') ?? '');
		const fromDevice = UUID.test(clientId) ? clientId : undefined;
		const existing = fromDevice ? await entryGroupOf(locals.db, fromDevice) : null;
		if (existing === group.id) redirect(303, resolve('/g/[token]', { token: params.token }));
		const result = await readExpenseForm(locals.db, group, form);
		if (!result.ok) return result.failure;
		await createExpense(
			locals.db,
			group.id,
			actorId,
			result.input,
			existing === null ? fromDevice : undefined
		);
		await rememberDefaultSplit(locals.db, group.id, actorId, form, result.input);
		// The others hear about it after the answer is sent (#56)
		platform?.ctx.waitUntil(
			notifyNewExpense(locals.db, group, actorId, result.input).catch(() => {})
		);
		// Repeats (#45): from its date on; a date in the past catches up right away
		const repeats = form.get('repeats');
		if (isFrequency(repeats)) {
			await startRecurring(locals.db, group.id, actorId, result.input, repeats);
			await addDueRecurring(locals.db, todayInputValue(), group.id);
		}
		redirect(303, resolve('/g/[token]', { token: params.token }));
	}
};
