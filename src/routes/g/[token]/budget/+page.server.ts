// A budget and end date for the insights (#168).
import { fail, redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';
import { groupTabUrl } from '#lib/group/tabs.ts';
import { parseAmount } from '#lib/money.ts';
import { formContext } from '#lib/server/context.ts';
import { setBudget } from '#lib/server/groups.ts';
import { parseDate } from '#lib/validation.ts';
import type { Actions } from './$types';

const insightsTab = (token: string) => groupTabUrl(resolve('/g/[token]', { token }), 'insights');

export const actions: Actions = {
	save: async ({ locals, params, request }) => {
		const { form, group, actorId } = await formContext(locals, params.token, request);
		const amount = String(form.get('amount') ?? '').trim();
		const budgetCents = amount ? parseAmount(amount, group.currency) : null;
		if (amount && budgetCents === null) return fail(400, { error: 'amount_invalid' as const });
		const date = String(form.get('endsOn') ?? '').trim();
		const endsOn = date ? parseDate(date) : null;
		if (endsOn && !endsOn.ok) return fail(400, { error: endsOn.error });
		await setBudget(locals.db, group.id, actorId, {
			budgetCents,
			endsOn: endsOn?.ok ? endsOn.value : null
		});
		redirect(303, insightsTab(params.token));
	},

	remove: async ({ locals, params, request }) => {
		const { group, actorId } = await formContext(locals, params.token, request);
		await setBudget(locals.db, group.id, actorId, { budgetCents: null, endsOn: null });
		redirect(303, insightsTab(params.token));
	}
};
