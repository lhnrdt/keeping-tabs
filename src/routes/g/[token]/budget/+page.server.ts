// A budget and end date for the insights (#168).
import { error, fail, redirect } from '@sveltejs/kit';
import { isSealed } from '#lib/crypto/seal.ts';
import { m } from '#lib/paraglide/messages.js';
import type { Db } from '#lib/server/db/index.ts';
import { resolve } from '$app/paths';
import { groupTabUrl } from '#lib/group/tabs.ts';
import { parseAmount } from '#lib/money.ts';
import { formContext } from '#lib/server/context.ts';
import { setBudget, setGroupDetails } from '#lib/server/groups.ts';
import { parseDate } from '#lib/validation.ts';
import type { Actions } from './$types';

const insightsTab = (token: string) => groupTabUrl(resolve('/g/[token]', { token }), 'insights');

async function saveSealedPlan(
	db: Db,
	groupId: string,
	actorId: string,
	details: FormDataEntryValue | null
) {
	if (!isSealed(details)) error(409, m.locked_reload());
	await setGroupDetails(db, groupId, details);
	await setBudget(db, groupId, actorId, { budgetCents: null, endsOn: null });
}

export const actions: Actions = {
	save: async ({ locals, params, request }) => {
		const { form, group, actorId } = await formContext(locals, params.token, request);
		// Encrypted: checked and sealed in the browser (#110)
		if (group.keyId) {
			await saveSealedPlan(locals.db, group.id, actorId, form.get('details'));
			redirect(303, insightsTab(params.token));
		}
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
		const { form, group, actorId } = await formContext(locals, params.token, request);
		if (group.keyId) {
			await saveSealedPlan(locals.db, group.id, actorId, form.get('details'));
			redirect(303, insightsTab(params.token));
		}
		await setBudget(locals.db, group.id, actorId, { budgetCents: null, endsOn: null });
		redirect(303, insightsTab(params.token));
	}
};
